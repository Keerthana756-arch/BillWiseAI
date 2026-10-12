package com.billwiseai.controller;

import com.billwiseai.model.Bill;
import com.billwiseai.model.User;
import com.billwiseai.service.AuthService;
import com.billwiseai.service.BillExtractionService;
import com.billwiseai.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired
    private BillService billService;

    @Autowired
    private BillExtractionService billExtractionService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<Bill> addBill(@RequestBody Bill bill) {
        User user = authService.getCurrentAuthenticatedUser();
        Bill createdBill = billService.addBill(user, bill);
        return new ResponseEntity<>(createdBill, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Bill>> getAllBills(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        User user = authService.getCurrentAuthenticatedUser();
        List<Bill> bills = billService.getAllBills(user, category, status, search);
        return new ResponseEntity<>(bills, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        Bill bill = billService.getBillById(user, id);
        return new ResponseEntity<>(bill, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Bill> updateBill(@PathVariable Long id, @RequestBody Bill bill) {
        User user = authService.getCurrentAuthenticatedUser();
        Bill updated = billService.updateBill(user, id, bill);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Bill> updateBillStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = authService.getCurrentAuthenticatedUser();
        String status = body.get("status");
        Bill updated = billService.updateBillStatus(user, id, status);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        billService.deleteBill(user, id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/extract")
    public ResponseEntity<?> extractBillDetails(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> extracted = billExtractionService.extractFromDocument(file);
            return new ResponseEntity<>(extracted, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", "Failed to extract text from bill: " + e.getMessage());
            return new ResponseEntity<>(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
