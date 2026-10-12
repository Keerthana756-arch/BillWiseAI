package com.billwiseai.service;

import com.billwiseai.model.Bill;
import com.billwiseai.model.User;
import com.billwiseai.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private NotificationService notificationService;

    public Bill addBill(User user, Bill bill) {
        bill.setId(null); // Ensure creation of a new bill
        bill.setUser(user);
        if (bill.getStatus() == null || bill.getStatus().isBlank()) {
            bill.setStatus("Unpaid");
        }
        if (bill.getDueDate() == null || bill.getDueDate().isBlank()) {
            bill.setDueDate(bill.getBillDate());
        }

        Bill saved = billRepository.save(bill);

        // Check if this new bill is unusual (>20% higher than historical category average)
        checkAndNotifyIfUnusual(user, saved);

        // Notification for successful addition
        notificationService.createNotification(
                user,
                "New Bill Added",
                String.format("Added %s bill from %s for ₹%.2f (%s).", saved.getCategory(), saved.getProvider(), saved.getAmount(), saved.getBillDate()),
                "BILL_UPLOADED"
        );

        return saved;
    }

    public List<Bill> getAllBills(User user, String category, String status, String search) {
        List<Bill> list = billRepository.findByUserOrderByBillDateDesc(user);

        if (category != null && !category.equalsIgnoreCase("all") && !category.isBlank()) {
            list = list.stream()
                    .filter(b -> b.getCategory().equalsIgnoreCase(category))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.equalsIgnoreCase("all") && !status.isBlank()) {
            list = list.stream()
                    .filter(b -> b.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            list = list.stream()
                    .filter(b -> (b.getProvider() != null && b.getProvider().toLowerCase().contains(q)) ||
                                 (b.getCategory() != null && b.getCategory().toLowerCase().contains(q)) ||
                                 (b.getNotes() != null && b.getNotes().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        return list;
    }

    public Bill getBillById(User user, Long id) {
        return billRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found or unauthorized"));
    }

    public Bill updateBill(User user, Long id, Bill updatedData) {
        Bill bill = getBillById(user, id);

        bill.setCategory(updatedData.getCategory());
        bill.setProvider(updatedData.getProvider());
        bill.setBillDate(updatedData.getBillDate());
        bill.setDueDate(updatedData.getDueDate());
        bill.setAmount(updatedData.getAmount());
        bill.setConsumption(updatedData.getConsumption());
        bill.setConsumptionUnit(updatedData.getConsumptionUnit());
        bill.setPreviousReading(updatedData.getPreviousReading());
        bill.setCurrentReading(updatedData.getCurrentReading());
        bill.setStatus(updatedData.getStatus());
        bill.setNotes(updatedData.getNotes());
        if (updatedData.getFileName() != null) {
            bill.setFileName(updatedData.getFileName());
        }
        if (updatedData.getExtractedText() != null) {
            bill.setExtractedText(updatedData.getExtractedText());
        }

        return billRepository.save(bill);
    }

    public Bill updateBillStatus(User user, Long id, String newStatus) {
        Bill bill = getBillById(user, id);
        bill.setStatus(newStatus != null && newStatus.equalsIgnoreCase("Paid") ? "Paid" : "Unpaid");
        return billRepository.save(bill);
    }

    public void deleteBill(User user, Long id) {
        Bill bill = getBillById(user, id);
        billRepository.delete(bill);
    }

    private void checkAndNotifyIfUnusual(User user, Bill newBill) {
        List<Bill> categoryBills = billRepository.findByUserAndCategoryOrderByBillDateDesc(user, newBill.getCategory());
        if (categoryBills.size() > 1) {
            double sum = 0;
            int count = 0;
            for (Bill b : categoryBills) {
                if (!b.getId().equals(newBill.getId())) {
                    sum += b.getAmount();
                    count++;
                }
            }

            if (count > 0) {
                double avg = sum / count;
                if (newBill.getAmount() > avg * 1.20) { // 20% higher than historical category average
                    double pct = ((newBill.getAmount() - avg) / avg) * 100.0;
                    String title = "Unusual Bill Detected: " + newBill.getCategory();
                    String msg = String.format("Your recent %s bill of ₹%.2f is %.1f%% higher than your historical average of ₹%.2f. Reviewing your recent usage is recommended.",
                            newBill.getCategory(), newBill.getAmount(), pct, avg);
                    notificationService.createNotification(user, title, msg, "UNUSUAL_BILL");
                }
            }
        }
    }
}
