package com.billwiseai.controller;

import com.billwiseai.model.User;
import com.billwiseai.service.AnalysisService;
import com.billwiseai.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analysis")
public class AnalysisController {

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private AuthService authService;

    @GetMapping("/unusual")
    public ResponseEntity<List<Map<String, Object>>> getUnusualBills() {
        User user = authService.getCurrentAuthenticatedUser();
        return new ResponseEntity<>(analysisService.getUnusualBills(user), HttpStatus.OK);
    }

    @GetMapping("/compare/{id}")
    public ResponseEntity<Map<String, Object>> compareBill(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        return new ResponseEntity<>(analysisService.compareBill(user, id), HttpStatus.OK);
    }
}
