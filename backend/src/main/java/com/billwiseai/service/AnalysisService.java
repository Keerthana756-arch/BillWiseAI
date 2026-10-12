package com.billwiseai.service;

import com.billwiseai.model.Bill;
import com.billwiseai.model.User;
import com.billwiseai.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalysisService {

    @Autowired
    private BillRepository billRepository;

    public Map<String, Object> getDashboardStats(User user) {
        List<Bill> allBills = billRepository.findByUserOrderByBillDateDesc(user);
        Map<String, Object> stats = new HashMap<>();

        if (allBills.isEmpty()) {
            stats.put("totalSpendingThisMonth", 0.0);
            stats.put("prevMonthSpending", 0.0);
            stats.put("avgMonthlyBill", 0.0);
            stats.put("outstandingBillsCount", 0);
            stats.put("outstandingBillsAmount", 0.0);
            stats.put("estimatedNextMonthSpending", 0.0);
            stats.put("monthOverMonthChangePct", 0.0);
            stats.put("totalBillsCount", 0);
            stats.put("paidBillsCount", 0);
            return stats;
        }

        LocalDate now = LocalDate.now();
        YearMonth currentYearMonth = YearMonth.from(now);
        YearMonth prevYearMonth = currentYearMonth.minusMonths(1);

        double thisMonthSpend = 0.0;
        double prevMonthSpend = 0.0;
        double totalSpendAll = 0.0;
        long outstandingCount = 0;
        double outstandingAmount = 0.0;
        long paidCount = 0;

        Set<String> uniqueMonths = new HashSet<>();

        for (Bill b : allBills) {
            double amt = b.getAmount() != null ? b.getAmount() : 0.0;
            totalSpendAll += amt;

            if ("Unpaid".equalsIgnoreCase(b.getStatus())) {
                outstandingCount++;
                outstandingAmount += amt;
            } else if ("Paid".equalsIgnoreCase(b.getStatus())) {
                paidCount++;
            }

            try {
                if (b.getBillDate() != null && b.getBillDate().length() >= 7) {
                    String ymStr = b.getBillDate().substring(0, 7);
                    uniqueMonths.add(ymStr);
                    YearMonth ym = YearMonth.parse(ymStr);

                    if (ym.equals(currentYearMonth)) {
                        thisMonthSpend += amt;
                    } else if (ym.equals(prevYearMonth)) {
                        prevMonthSpend += amt;
                    }
                }
            } catch (Exception ignored) {}
        }

        // If no bills were entered for the calendar month yet, use the most recent month in user's records
        if (thisMonthSpend == 0.0 && !allBills.isEmpty()) {
            try {
                String latestYmStr = allBills.get(0).getBillDate().substring(0, 7);
                YearMonth latestYm = YearMonth.parse(latestYmStr);
                YearMonth secondLatestYm = latestYm.minusMonths(1);

                for (Bill b : allBills) {
                    if (b.getBillDate() != null && b.getBillDate().length() >= 7) {
                        String ymStr = b.getBillDate().substring(0, 7);
                        if (ymStr.equals(latestYmStr)) {
                            thisMonthSpend += b.getAmount();
                        } else if (ymStr.equals(secondLatestYm.toString())) {
                            prevMonthSpend += b.getAmount();
                        }
                    }
                }
            } catch (Exception ignored) {}
        }

        double avgMonthly = uniqueMonths.isEmpty() ? 0.0 : totalSpendAll / uniqueMonths.size();
        double momChangePct = 0.0;
        if (prevMonthSpend > 0) {
            momChangePct = ((thisMonthSpend - prevMonthSpend) / prevMonthSpend) * 100.0;
        }

        Map<String, Object> prediction = getPredictions(user);
        Double estimatedNextMonth = (Double) prediction.get("estimatedNextMonthTotal");

        stats.put("totalSpendingThisMonth", Math.round(thisMonthSpend * 100.0) / 100.0);
        stats.put("prevMonthSpending", Math.round(prevMonthSpend * 100.0) / 100.0);
        stats.put("avgMonthlyBill", Math.round(avgMonthly * 100.0) / 100.0);
        stats.put("outstandingBillsCount", outstandingCount);
        stats.put("outstandingBillsAmount", Math.round(outstandingAmount * 100.0) / 100.0);
        stats.put("estimatedNextMonthSpending", estimatedNextMonth != null ? estimatedNextMonth : 0.0);
        stats.put("monthOverMonthChangePct", Math.round(momChangePct * 10.0) / 10.0);
        stats.put("totalBillsCount", allBills.size());
        stats.put("paidBillsCount", paidCount);

        return stats;
    }

    public List<Map<String, Object>> getMonthlyTrends(User user) {
        List<Bill> allBills = billRepository.findByUserOrderByBillDateDesc(user);
        Map<String, List<Bill>> monthGroups = new TreeMap<>();

        for (Bill b : allBills) {
            if (b.getBillDate() != null && b.getBillDate().length() >= 7) {
                String ym = b.getBillDate().substring(0, 7);
                monthGroups.computeIfAbsent(ym, k -> new ArrayList<>()).add(b);
            }
        }

        List<Map<String, Object>> results = new ArrayList<>();
        DateTimeFormatter parser = DateTimeFormatter.ofPattern("yyyy-MM");
        DateTimeFormatter displayFormatter = DateTimeFormatter.ofPattern("MMM yyyy");

        for (Map.Entry<String, List<Bill>> entry : monthGroups.entrySet()) {
            String ymStr = entry.getKey();
            List<Bill> bills = entry.getValue();

            double total = 0.0;
            Map<String, Double> breakdown = new HashMap<>();

            for (Bill b : bills) {
                double amt = b.getAmount() != null ? b.getAmount() : 0.0;
                total += amt;
                breakdown.merge(b.getCategory(), amt, Double::sum);
            }

            String formattedName;
            try {
                YearMonth ym = YearMonth.parse(ymStr, parser);
                formattedName = ym.format(displayFormatter);
            } catch (Exception e) {
                formattedName = ymStr;
            }

            Map<String, Object> map = new HashMap<>();
            map.put("month", formattedName);
            map.put("rawMonth", ymStr);
            map.put("totalAmount", Math.round(total * 100.0) / 100.0);
            map.put("billCount", bills.size());
            map.put("categoryBreakdown", breakdown);
            results.add(map);
        }

        return results;
    }

    public List<Map<String, Object>> getCategorySpending(User user) {
        List<Bill> allBills = billRepository.findByUserOrderByBillDateDesc(user);
        Map<String, List<Bill>> catMap = new HashMap<>();

        double grandTotal = 0.0;
        for (Bill b : allBills) {
            double amt = b.getAmount() != null ? b.getAmount() : 0.0;
            grandTotal += amt;
            catMap.computeIfAbsent(b.getCategory(), k -> new ArrayList<>()).add(b);
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (Map.Entry<String, List<Bill>> entry : catMap.entrySet()) {
            String cat = entry.getKey();
            List<Bill> bills = entry.getValue();

            double sum = bills.stream().mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();
            double pct = grandTotal > 0 ? (sum / grandTotal) * 100.0 : 0.0;
            double avg = bills.isEmpty() ? 0.0 : sum / bills.size();

            Map<String, Object> map = new HashMap<>();
            map.put("category", cat);
            map.put("totalAmount", Math.round(sum * 100.0) / 100.0);
            map.put("percentage", Math.round(pct * 10.0) / 10.0);
            map.put("count", bills.size());
            map.put("avgAmount", Math.round(avg * 100.0) / 100.0);
            list.add(map);
        }

        list.sort((a, b) -> Double.compare((Double) b.get("totalAmount"), (Double) a.get("totalAmount")));
        return list;
    }

    public List<Map<String, Object>> getUnusualBills(User user) {
        List<Bill> allBills = billRepository.findByUserOrderByBillDateDesc(user);
        List<Map<String, Object>> results = new ArrayList<>();

        Map<String, List<Bill>> billsByCategory = allBills.stream()
                .collect(Collectors.groupingBy(Bill::getCategory));

        for (Map.Entry<String, List<Bill>> entry : billsByCategory.entrySet()) {
            String category = entry.getKey();
            List<Bill> categoryBills = entry.getValue();

            if (categoryBills.size() < 2) continue;

            for (Bill current : categoryBills) {
                double historicalSum = 0;
                int count = 0;
                for (Bill other : categoryBills) {
                    if (!other.getId().equals(current.getId()) && other.getBillDate().compareTo(current.getBillDate()) <= 0) {
                        historicalSum += other.getAmount();
                        count++;
                    }
                }

                if (count >= 1) {
                    double avg = historicalSum / count;
                    if (current.getAmount() > avg * 1.20) { // 20% higher than average
                        double pctDiff = ((current.getAmount() - avg) / avg) * 100.0;
                        String explanation = String.format("This %s bill (₹%.2f) is %.1f%% higher than your category average of ₹%.2f.",
                                category, current.getAmount(), pctDiff, avg);
                        String suggestion = "Review recent billing period dates, seasonal heating/cooling usage, or rate tariff adjustments.";

                        Map<String, Object> map = new HashMap<>();
                        map.put("bill", current);
                        map.put("currentAmount", Math.round(current.getAmount() * 100.0) / 100.0);
                        map.put("recentAverage", Math.round(avg * 100.0) / 100.0);
                        map.put("percentageDifference", Math.round(pctDiff * 10.0) / 10.0);
                        map.put("explanation", explanation);
                        map.put("suggestion", suggestion);
                        results.add(map);
                    }
                }
            }
        }

        return results;
    }

    public Map<String, Object> compareBill(User user, Long billId) {
        Bill current = billRepository.findByIdAndUser(billId, user)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found"));

        List<Bill> categoryBills = billRepository.findByUserAndCategoryOrderByBillDateDesc(user, current.getCategory());

        Bill previous = null;
        for (Bill b : categoryBills) {
            if (b.getBillDate().compareTo(current.getBillDate()) < 0 && !b.getId().equals(current.getId())) {
                previous = b;
                break;
            }
        }

        double catSum = categoryBills.stream().mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).sum();
        double catAvg = categoryBills.isEmpty() ? 0.0 : catSum / categoryBills.size();

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("currentBill", current);
        comparison.put("previousBill", previous);
        comparison.put("averageCategoryAmount", Math.round(catAvg * 100.0) / 100.0);

        if (previous != null) {
            double amtDiff = current.getAmount() - previous.getAmount();
            double pctDiff = previous.getAmount() > 0 ? (amtDiff / previous.getAmount()) * 100.0 : 0.0;
            comparison.put("amountDifference", Math.round(amtDiff * 100.0) / 100.0);
            comparison.put("percentageDifference", Math.round(pctDiff * 10.0) / 10.0);

            if (current.getConsumption() != null && previous.getConsumption() != null) {
                comparison.put("consumptionDifference", Math.round((current.getConsumption() - previous.getConsumption()) * 100.0) / 100.0);
            }

            StringBuilder sb = new StringBuilder();
            if (amtDiff > 0) {
                sb.append(String.format("Your %s bill increased by ₹%.2f (+%.1f%%) compared to the previous month. ",
                        current.getCategory(), amtDiff, pctDiff));
                Double consumptionDiff = (Double) comparison.get("consumptionDifference");
                if (consumptionDiff != null && consumptionDiff > 0) {
                    sb.append(String.format("Your recorded consumption also increased by %.1f %s, which explains the higher cost.",
                            consumptionDiff, current.getConsumptionUnit() != null ? current.getConsumptionUnit() : "units"));
                } else {
                    sb.append("Reviewing rate changes or utility fees can help identify the source of the increase.");
                }
            } else if (amtDiff < 0) {
                sb.append(String.format("Great news! Your %s bill decreased by ₹%.2f (-%.1f%%) compared to the previous month. ",
                        current.getCategory(), Math.abs(amtDiff), Math.abs(pctDiff)));
                Double consumptionDiff = (Double) comparison.get("consumptionDifference");
                if (consumptionDiff != null && consumptionDiff < 0) {
                    sb.append(String.format("Your usage decreased by %.1f %s, reducing your utility expense.",
                            Math.abs(consumptionDiff), current.getConsumptionUnit() != null ? current.getConsumptionUnit() : "units"));
                }
            } else {
                sb.append(String.format("Your %s bill remained exactly identical to the previous month.", current.getCategory()));
            }

            comparison.put("trendExplanation", sb.toString());
            comparison.put("isUnusual", amtDiff > 0 && pctDiff >= 20.0);
        } else {
            comparison.put("amountDifference", 0.0);
            comparison.put("percentageDifference", 0.0);
            comparison.put("trendExplanation", String.format("This is your first recorded %s bill. Additional bills will unlock detailed month-over-month comparisons.", current.getCategory()));
            comparison.put("isUnusual", false);
        }

        return comparison;
    }

    public Map<String, Object> getPredictions(User user) {
        List<Bill> allBills = billRepository.findByUserOrderByBillDateDesc(user);
        Map<String, Object> prediction = new HashMap<>();
        prediction.put("historicalBillCount", allBills.size());

        if (allBills.size() < 2) {
            prediction.put("sufficientData", false);
            prediction.put("confidenceLevel", "Insufficient Data");
            prediction.put("explanation", "Add at least 2 or 3 utility bills to generate reliable predictions and confidence bounds.");
            prediction.put("estimatedNextMonthTotal", allBills.isEmpty() ? 0.0 : allBills.get(0).getAmount());
            prediction.put("rangeMin", 0.0);
            prediction.put("rangeMax", 0.0);
            prediction.put("categoryEstimates", new HashMap<String, Double>());
            return prediction;
        }

        Map<String, List<Bill>> catMap = allBills.stream().collect(Collectors.groupingBy(Bill::getCategory));
        Map<String, Double> categoryEstimates = new HashMap<>();
        double totalEstimate = 0.0;

        for (Map.Entry<String, List<Bill>> entry : catMap.entrySet()) {
            String cat = entry.getKey();
            List<Bill> bills = entry.getValue();

            double recent = bills.get(0).getAmount();
            double avg = bills.stream().mapToDouble(b -> b.getAmount() != null ? b.getAmount() : 0.0).average().orElse(recent);
            double estimate = bills.size() >= 2 ? (recent * 0.6 + avg * 0.4) : recent;

            estimate = Math.round(estimate * 100.0) / 100.0;
            categoryEstimates.put(cat, estimate);
            totalEstimate += estimate;
        }

        totalEstimate = Math.round(totalEstimate * 100.0) / 100.0;
        double rangeMin = Math.round((totalEstimate * 0.90) * 100.0) / 100.0;
        double rangeMax = Math.round((totalEstimate * 1.12) * 100.0) / 100.0;

        prediction.put("sufficientData", true);
        prediction.put("estimatedNextMonthTotal", totalEstimate);
        prediction.put("rangeMin", rangeMin);
        prediction.put("rangeMax", rangeMax);
        prediction.put("categoryEstimates", categoryEstimates);

        if (allBills.size() >= 6) {
            prediction.put("confidenceLevel", "High");
            prediction.put("explanation", String.format("Based on %d historical bills across %d utility categories, your estimated next month expense is ₹%.2f (range ₹%.2f - ₹%.2f). Note: Predictions are statistical estimates, not guaranteed totals.",
                    allBills.size(), catMap.size(), totalEstimate, rangeMin, rangeMax));
        } else {
            prediction.put("confidenceLevel", "Moderate");
            prediction.put("explanation", String.format("Based on your %d recorded bills, estimated next month spending is approximately ₹%.2f. Additional bills will further refine accuracy.",
                    allBills.size(), totalEstimate));
        }

        return prediction;
    }
}
