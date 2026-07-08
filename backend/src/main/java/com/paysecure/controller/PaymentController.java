package com.paysecure.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final List<Map<String, Object>> transactions = new ArrayList<>();

    public PaymentController() {
        // Seed some initial payment history
        transactions.add(createTx("tx_1001", "USD", 128.50, "Completed", "Visa", "**** 4242", null));
        transactions.add(createTx("tx_1002", "EUR", 45.00, "Completed", "Mastercard", "**** 5555", null));
        transactions.add(createTx("tx_1003", "USD", 15.99, "Failed", "Visa", "**** 1111", "insufficient_funds"));
    }

    @GetMapping("/history")
    public List<Map<String, Object>> getHistory() {
        return transactions;
    }

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> request) {
        String currency = (String) request.getOrDefault("currency", "USD");
        double amount = Double.parseDouble(request.getOrDefault("amount", "0.0").toString());
        String cardBrand = (String) request.getOrDefault("cardBrand", "Visa");
        String cardNumber = (String) request.getOrDefault("cardNumber", "**** 4242");

        Map<String, Object> response = new HashMap<>();
        String txId = "tx_" + UUID.randomUUID().toString().substring(0, 8);
        response.put("id", txId);
        response.put("amount", amount);
        response.put("currency", currency);
        response.put("cardBrand", cardBrand);
        response.put("cardNumber", cardNumber);
        response.put("timestamp", LocalDateTime.now().toString());

        if (amount <= 0) {
            response.put("status", "Failed");
            response.put("errorCode", "invalid_amount");
            response.put("message", "Amount must be greater than zero.");
            transactions.add(0, createTx(txId, currency, amount, "Failed", cardBrand, cardNumber, "invalid_amount"));
            return ResponseEntity.badRequest().body(response);
        } else if (amount > 1000) {
            response.put("status", "Failed");
            response.put("errorCode", "limit_exceeded");
            response.put("message", "Transaction exceeds maximum allowed limit ($1,000).");
            transactions.add(0, createTx(txId, currency, amount, "Failed", cardBrand, cardNumber, "limit_exceeded"));
            return ResponseEntity.badRequest().body(response);
        } else {
            response.put("status", "Completed");
            response.put("message", "Payment processed successfully.");
            transactions.add(0, createTx(txId, currency, amount, "Completed", cardBrand, cardNumber, null));
            return ResponseEntity.ok(response);
        }
    }

    private Map<String, Object> createTx(String id, String currency, double amount, String status, String cardBrand, String cardNumber, String errorCode) {
        Map<String, Object> tx = new HashMap<>();
        tx.put("id", id);
        tx.put("currency", currency);
        tx.put("amount", amount);
        tx.put("status", status);
        tx.put("cardBrand", cardBrand);
        tx.put("cardNumber", cardNumber);
        tx.put("timestamp", LocalDateTime.now().toString());
        if (errorCode != null) {
            tx.put("errorCode", errorCode);
        }
        return tx;
    }
}
