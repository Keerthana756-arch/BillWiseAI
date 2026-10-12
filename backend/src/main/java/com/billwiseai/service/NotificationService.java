package com.billwiseai.service;

import com.billwiseai.model.Bill;
import com.billwiseai.model.Notification;
import com.billwiseai.model.User;
import com.billwiseai.repository.BillRepository;
import com.billwiseai.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private BillRepository billRepository;

    public List<Notification> getUserNotifications(User user) {
        checkUpcomingDueDates(user);
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public void markAsRead(User user, Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + id));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Unauthorized access to notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndIsReadFalse(user);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public Notification createNotification(User user, String title, String message, String type) {
        // Prevent exact duplicates within recent notifications
        List<Notification> existing = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        boolean duplicate = existing.stream().anyMatch(n -> 
                n.getTitle().equalsIgnoreCase(title) && 
                n.getMessage().equalsIgnoreCase(message) &&
                !n.isRead()
        );

        if (!duplicate) {
            Notification notification = new Notification(user, title, message, type);
            return notificationRepository.save(notification);
        }
        return null;
    }

    public void checkUpcomingDueDates(User user) {
        List<Bill> unpaidBills = billRepository.findByUserAndStatusOrderByDueDateAsc(user, "Unpaid");
        LocalDate today = LocalDate.now();

        for (Bill bill : unpaidBills) {
            if (bill.getDueDate() != null && !bill.getDueDate().isBlank()) {
                try {
                    LocalDate due = LocalDate.parse(bill.getDueDate().trim());
                    long daysUntilDue = ChronoUnit.DAYS.between(today, due);

                    if (daysUntilDue >= 0 && daysUntilDue <= 7) {
                        String title = "Upcoming Due Date: " + bill.getCategory() + " Bill";
                        String msg = String.format("Your %s bill from %s for ₹%.2f is due in %d day(s) on %s.",
                                bill.getCategory(), bill.getProvider(), bill.getAmount(), daysUntilDue, bill.getDueDate());
                        createNotification(user, title, msg, "UPCOMING_DUE");
                    } else if (daysUntilDue < 0) {
                        String title = "Overdue Bill: " + bill.getCategory();
                        String msg = String.format("Your %s bill of ₹%.2f from %s was due on %s and is currently unpaid.",
                                bill.getCategory(), bill.getAmount(), bill.getProvider(), bill.getDueDate());
                        createNotification(user, title, msg, "UPCOMING_DUE");
                    }
                } catch (Exception ignored) {
                    // Ignore date parse issues
                }
            }
        }
    }
}
