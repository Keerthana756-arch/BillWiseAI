package com.billwiseai.service;

import com.billwiseai.model.Bill;
import com.billwiseai.model.ChatMessage;
import com.billwiseai.model.User;
import com.billwiseai.repository.BillRepository;
import com.billwiseai.repository.ChatMessageRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent}")
    private String geminiApiUrl;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private AnalysisService analysisService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public Map<String, Object> getInsightsAndRecommendations(User user) {
        List<Bill> bills = billRepository.findByUserOrderByBillDateDesc(user);
        Map<String, Object> result = new HashMap<>();

        if (bills.isEmpty()) {
            result.put("insights", List.of("No utility bills uploaded yet. Upload your first bill to see intelligent financial insights."));
            result.put("recommendations", List.of("Begin by uploading electricity, water, or internet bills to start identifying saving opportunities."));
            result.put("highestCategory", "None");
            result.put("highestCategoryAmount", 0.0);
            result.put("highestMonth", "None");
            result.put("highestMonthAmount", 0.0);
            result.put("generalTips", getGeneralSavingTips("Electricity"));
            return result;
        }

        List<Map<String, Object>> catSpending = analysisService.getCategorySpending(user);
        Map<String, Object> topCategory = catSpending.isEmpty() ? null : catSpending.get(0);

        String topCatName = topCategory != null ? (String) topCategory.get("category") : "N/A";
        Double topCatAmount = topCategory != null ? (Double) topCategory.get("totalAmount") : 0.0;
        Double topCatPct = topCategory != null ? (Double) topCategory.get("percentage") : 0.0;

        result.put("highestCategory", topCatName);
        result.put("highestCategoryAmount", topCatAmount);

        // Find highest spending month
        Map<String, Double> monthTotals = new HashMap<>();
        for (Bill b : bills) {
            if (b.getBillDate() != null && b.getBillDate().length() >= 7) {
                String ym = b.getBillDate().substring(0, 7);
                monthTotals.merge(ym, b.getAmount() != null ? b.getAmount() : 0.0, Double::sum);
            }
        }
        String maxMonth = "N/A";
        double maxMonthVal = 0.0;
        for (Map.Entry<String, Double> entry : monthTotals.entrySet()) {
            if (entry.getValue() > maxMonthVal) {
                maxMonthVal = entry.getValue();
                maxMonth = entry.getKey();
            }
        }
        result.put("highestMonth", maxMonth);
        result.put("highestMonthAmount", Math.round(maxMonthVal * 100.0) / 100.0);

        List<String> insights = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        if (topCategory != null) {
            insights.add(String.format("%s represents your largest utility expense, totaling ₹%.2f (%.1f%% of all bills).",
                    topCatName, topCatAmount, topCatPct));
        }

        if (maxMonthVal > 0) {
            insights.add(String.format("Your peak spending month on record was %s, reaching a total of ₹%.2f across all utilities.",
                    maxMonth, maxMonthVal));
        }

        if (!bills.isEmpty()) {
            Bill latest = bills.get(0);
            List<Bill> catBills = bills.stream().filter(b -> b.getCategory().equalsIgnoreCase(latest.getCategory())).toList();
            if (catBills.size() >= 2) {
                double avg = catBills.stream().mapToDouble(Bill::getAmount).average().orElse(0.0);
                if (latest.getAmount() > avg * 1.15) {
                    insights.add(String.format("Your most recent %s bill (₹%.2f) came in higher than your historical average (₹%.2f).",
                            latest.getCategory(), latest.getAmount(), avg));
                } else if (latest.getAmount() < avg * 0.9) {
                    insights.add(String.format("Your latest %s bill (₹%.2f) was lower than your historical average (₹%.2f), demonstrating improved efficiency.",
                            latest.getCategory(), latest.getAmount(), avg));
                }
            }
        }

        if (topCategory != null) {
            recommendations.addAll(getCategoryRecommendations(topCatName));
        }

        long unpaidCount = bills.stream().filter(b -> "Unpaid".equalsIgnoreCase(b.getStatus())).count();
        if (unpaidCount > 0) {
            recommendations.add(String.format("You have %d outstanding unpaid bill(s). Consider paying before due dates to avoid late payment penalties.", unpaidCount));
        }

        result.put("insights", insights);
        result.put("recommendations", recommendations);
        result.put("generalTips", getGeneralSavingTips(topCatName));

        return result;
    }

    public Map<String, Object> chat(User user, String userMessage) {
        chatMessageRepository.save(new ChatMessage(user, "user", userMessage));

        List<Bill> bills = billRepository.findByUserOrderByBillDateDesc(user);
        String replyText;

        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            replyText = callGeminiApi(user, userMessage, bills);
        } else {
            replyText = generateRuleBasedReply(user, userMessage, bills);
        }

        chatMessageRepository.save(new ChatMessage(user, "assistant", replyText));

        List<String> suggestedQuestions = List.of(
                "Which utility costs me the most?",
                "How much did I spend this month?",
                "Compare my last three bills",
                "How can I reduce my utility expenses?"
        );

        Map<String, Object> response = new HashMap<>();
        response.put("reply", replyText);
        response.put("suggestedQuestions", suggestedQuestions);
        response.put("timestamp", LocalDateTime.now());

        return response;
    }

    private String generateRuleBasedReply(User user, String query, List<Bill> bills) {
        if (bills.isEmpty()) {
            return "Hello " + user.getName() + "! You currently haven't recorded any bills in BillWiseAI yet. " +
                   "Once you upload or manually enter your utility bills, I will analyze your spending patterns, detect cost spikes, and help you save money.";
        }

        String q = query.toLowerCase();

        // 1. Highest utility / which costs most
        if (q.contains("most") || q.contains("highest") || q.contains("expensive") || q.contains("which utility")) {
            List<Map<String, Object>> catList = analysisService.getCategorySpending(user);
            if (!catList.isEmpty()) {
                Map<String, Object> top = catList.get(0);
                return String.format("Based on your recorded bills, **%s** is your highest expense category, totaling **₹%.2f** (%.1f%% of your total expenses across %s bills).\n\n" +
                                     "Breakdown of your other utilities:\n" +
                                     catList.stream().skip(1).map(c -> String.format("- **%s**: ₹%.2f (%.1f%%)", c.get("category"), c.get("totalAmount"), c.get("percentage")))
                                             .collect(Collectors.joining("\n")),
                        top.get("category"), top.get("totalAmount"), top.get("percentage"), top.get("count"));
            }
        }

        // 2. Spending this month / total spending
        if (q.contains("this month") || q.contains("current month") || q.contains("how much did i spend")) {
            Map<String, Object> stats = analysisService.getDashboardStats(user);
            Double momChange = (Double) stats.get("monthOverMonthChangePct");
            return String.format("Here is your spending overview:\n\n" +
                                 "- **Total Spending This Month**: ₹%.2f\n" +
                                 "- **Previous Month**: ₹%.2f\n" +
                                 "- **Average Monthly Bill**: ₹%.2f\n" +
                                 "- **Outstanding (Unpaid) Bills**: %s bill(s) totaling ₹%.2f\n" +
                                 "- **Month-over-Month Change**: %s%.1f%%\n\n" +
                                 "You have recorded %s bills in total.",
                    stats.get("totalSpendingThisMonth"), stats.get("prevMonthSpending"), stats.get("avgMonthlyBill"),
                    stats.get("outstandingBillsCount"), stats.get("outstandingBillsAmount"),
                    (momChange != null && momChange >= 0) ? "+" : "", momChange != null ? momChange : 0.0,
                    stats.get("totalBillsCount"));
        }

        // 3. Why did my bill increase / electricity / water / gas higher
        if (q.contains("why") || q.contains("increase") || q.contains("higher") || q.contains("spike")) {
            Optional<Bill> latestCatBill = bills.stream()
                    .filter(b -> q.contains(b.getCategory().toLowerCase()))
                    .findFirst();

            Bill target = latestCatBill.orElse(bills.get(0));
            Map<String, Object> analysis = analysisService.compareBill(user, target.getId());

            return String.format("**Analysis for %s (%s - ₹%.2f):**\n\n%s\n\n" +
                                 "**Tips to investigate:**\n" +
                                 "- Check whether seasonal heating/cooling was active during this billing cycle.\n" +
                                 "- Verify if there are unbilled service fees, rate tier jumps, or estimated rather than actual meter readings.",
                    target.getCategory(), target.getBillDate(), target.getAmount(), analysis.get("trendExplanation"));
        }

        // 4. Compare bills
        if (q.contains("compare") || q.contains("last three") || q.contains("recent")) {
            int limit = Math.min(bills.size(), 4);
            StringBuilder sb = new StringBuilder("Here is a comparison of your most recent bills:\n\n");
            for (int i = 0; i < limit; i++) {
                Bill b = bills.get(i);
                sb.append(String.format("%d. **%s** (%s) on %s: **₹%.2f** [%s]%s\n",
                        i + 1, b.getCategory(), b.getProvider(), b.getBillDate(), b.getAmount(), b.getStatus(),
                        b.getConsumption() != null ? " (" + b.getConsumption() + " " + (b.getConsumptionUnit() != null ? b.getConsumptionUnit() : "units") + ")" : ""));
            }
            sb.append("\nTip: To see detailed month-over-month graphs and category comparisons, check your **Analytics** page.");
            return sb.toString();
        }

        // 5. How to reduce expenses / saving tips
        if (q.contains("save") || q.contains("reduce") || q.contains("cut") || q.contains("lower") || q.contains("tips")) {
            List<Map<String, Object>> catList = analysisService.getCategorySpending(user);
            String primaryCat = catList.isEmpty() ? "Electricity" : (String) catList.get(0).get("category");

            return String.format("Here are actionable ways to lower your **%s** bills (your top utility expense):\n\n" +
                                 "- **Smart Thermostat**: Adjusting heating/cooling by 1–2°F can cut HVAC costs by 5–10%%.\n" +
                                 "- **Vampire Draw**: Unplug electronics or use smart power strips to eliminate phantom standby power.\n" +
                                 "- **Peak Hour Management**: Run high-draw appliances (dishwasher, washer/dryer) during off-peak rate hours.\n" +
                                 "- **Review Rate Plans**: Contact %s to check for time-of-use tariffs, student/eco discounts, or budget billing programs.",
                    primaryCat, primaryCat);
        }

        double totalSum = bills.stream().mapToDouble(Bill::getAmount).sum();
        return String.format("Hello %s! I've analyzed your %d utility bills in BillWiseAI (totaling ₹%.2f across your history).\n\n" +
                             "You can ask me specific questions such as:\n" +
                             "- *\"Which utility costs me the most?\"*\n" +
                             "- *\"Why did my electricity bill increase?\"*\n" +
                             "- *\"How much did I spend this month?\"*\n" +
                             "- *\"How can I reduce my expenses?\"*",
                user.getName(), bills.size(), totalSum);
    }

    private String callGeminiApi(User user, String userMessage, List<Bill> bills) {
        try {
            StringBuilder billSummary = new StringBuilder();
            billSummary.append(String.format("User: %s (Total bills: %d)\n", user.getName(), bills.size()));
            for (int i = 0; i < Math.min(bills.size(), 12); i++) {
                Bill b = bills.get(i);
                billSummary.append(String.format("- Category: %s, Provider: %s, Amount: ₹%.2f, Date: %s, Due: %s, Status: %s, Consumption: %s %s\n",
                        b.getCategory(), b.getProvider(), b.getAmount(), b.getBillDate(), b.getDueDate(), b.getStatus(),
                        b.getConsumption() != null ? b.getConsumption() : "N/A",
                        b.getConsumptionUnit() != null ? b.getConsumptionUnit() : ""));
            }

            String systemPrompt = "You are BillWiseAI, an expert utility bill analysis assistant. " +
                    "Answer user questions accurately based STRICTLY on the user's actual bill data provided below. " +
                    "All monetary amounts are in Indian Rupees (₹ / INR). Always use the Indian Rupee symbol (₹) and NEVER use dollars ($). " +
                    "Do NOT invent bill numbers or fictional amounts. " +
                    "Format responses with clear Markdown bullet points.\n\n" +
                    "USER'S REAL BILLS DATA:\n" + billSummary.toString() + "\n";

            String jsonPayload = objectMapper.writeValueAsString(Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of(
                                    "text", systemPrompt + "\nUser Question: " + userMessage
                            ))
                    ))
            ));

            String fullUrl = geminiApiUrl + (geminiApiUrl.contains("?") ? "&" : "?") + "key=" + geminiApiKey;

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(fullUrl))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .timeout(Duration.ofSeconds(12))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode candidates = root.path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                    if (!textNode.isMissingNode()) {
                        return textNode.asText();
                    }
                }
            }
        } catch (Exception ignored) {}

        return generateRuleBasedReply(user, userMessage, bills);
    }

    private List<String> getCategoryRecommendations(String category) {
        if ("Electricity".equalsIgnoreCase(category)) {
            return List.of(
                    "Switch to ENERGY STAR certified LED bulbs to save up to 75% on lighting costs.",
                    "Set your thermostat 1-2 degrees higher in summer or lower in winter to lower HVAC load.",
                    "Run dishwashers and laundry appliances during off-peak electricity hours."
            );
        } else if ("Water".equalsIgnoreCase(category)) {
            return List.of(
                    "Inspect faucets, showerheads, and toilet flappers for slow leaks that waste hundreds of gallons monthly.",
                    "Install low-flow aerators on bathroom and kitchen taps to reduce volume without losing pressure.",
                    "Limit shower times to under 7 minutes to curb both water and hot water heating energy."
            );
        } else if ("Gas".equalsIgnoreCase(category)) {
            return List.of(
                    "Lower your water heater temperature setting to 120°F (49°C) to prevent standby heat loss.",
                    "Inspect door and window weatherstripping to eliminate heat loss in colder months.",
                    "Schedule annual servicing for your gas furnace to maintain optimum combustion efficiency."
            );
        } else if ("Internet".equalsIgnoreCase(category)) {
            return List.of(
                    "Check your actual bandwidth needs against your plan; 100-300 Mbps is ample for most households.",
                    "Purchase your own DOCSIS modem/router rather than paying monthly ISP equipment rental fees.",
                    "Contact your broadband provider annually to ask for current retention promotions or loyalty pricing."
            );
        } else {
            return List.of(
                    "Review your mobile data consumption; switch to an unlimited or shared family plan if paying overages.",
                    "Connect to home and workplace Wi-Fi networks whenever streaming media or downloading updates.",
                    "Review itemized cell carrier charges for recurring add-on services or roadside assistance you do not use."
            );
        }
    }

    private List<String> getGeneralSavingTips(String category) {
        return List.of(
                "Audit recurring subscriptions and utilities every quarter to catch unnoticed rate hikes.",
                "Set automated calendar reminders 3 days before bill due dates to eliminate late fee charges.",
                "Take advantage of paperless billing credits often offered by utility providers."
        );
    }
}
