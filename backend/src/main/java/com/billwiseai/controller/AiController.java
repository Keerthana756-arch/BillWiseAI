package com.billwiseai.controller;

import com.billwiseai.model.User;
import com.billwiseai.service.AiService;
import com.billwiseai.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private AuthService authService;

    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> getInsights() {
        User user = authService.getCurrentAuthenticatedUser();
        return new ResponseEntity<>(aiService.getInsightsAndRecommendations(user), HttpStatus.OK);
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        User user = authService.getCurrentAuthenticatedUser();
        String message = request.getOrDefault("message", "").trim();
        if (message.isBlank()) {
            return new ResponseEntity<>(Map.of("reply", "Please provide a valid question."), HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(aiService.chat(user, message), HttpStatus.OK);
    }
}
