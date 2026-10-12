package com.billwiseai.controller;

import com.billwiseai.model.User;
import com.billwiseai.service.AnalysisService;
import com.billwiseai.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private AuthService authService;

    @GetMapping("/trends")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyTrends() {
        User user = authService.getCurrentAuthenticatedUser();
        return new ResponseEntity<>(analysisService.getMonthlyTrends(user), HttpStatus.OK);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, Object>>> getCategorySpending() {
        User user = authService.getCurrentAuthenticatedUser();
        return new ResponseEntity<>(analysisService.getCategorySpending(user), HttpStatus.OK);
    }
}
