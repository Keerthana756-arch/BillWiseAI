package com.billwiseai.controller;

import com.billwiseai.model.Notification;
import com.billwiseai.model.User;
import com.billwiseai.service.AuthService;
import com.billwiseai.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        User user = authService.getCurrentAuthenticatedUser();
        return new ResponseEntity<>(notificationService.getUserNotifications(user), HttpStatus.OK);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAsRead(user, id);
        return new ResponseEntity<>(Map.of("message", "Marked as read"), HttpStatus.OK);
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        User user = authService.getCurrentAuthenticatedUser();
        notificationService.markAllAsRead(user);
        return new ResponseEntity<>(Map.of("message", "All marked as read"), HttpStatus.OK);
    }
}
