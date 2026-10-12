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

import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPredictions() {
        User user = authService.getCurrentAuthenticatedUser();
        return new ResponseEntity<>(analysisService.getPredictions(user), HttpStatus.OK);
    }
}
