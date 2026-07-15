package com.paysecure.controller;

import com.paysecure.model.PaymentTransaction;
import com.paysecure.model.Region;
import com.paysecure.service.OutageSimulationService;
import com.paysecure.service.ResilientRoutingService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend access
public class PaymentController {

    @Autowired
    private ResilientRoutingService routingService;

    @Autowired
    private OutageSimulationService simulationService;

    @Data
    public static class ChargeRequest {
        private Double amount;
        private String currency;
        private String cardholderName;
        private Region targetRegion;
    }

    @PostMapping("/payments/charge")
    public ResponseEntity<PaymentTransaction> chargeCard(@RequestBody ChargeRequest request) {
        if (request.getAmount() == null || request.getAmount() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        if (request.getTargetRegion() == null) {
            request.setTargetRegion(Region.US); // default
        }
        PaymentTransaction txn = routingService.processPayment(
                request.getAmount(),
                request.getCurrency(),
                request.getCardholderName(),
                request.getTargetRegion()
        );
        return ResponseEntity.ok(txn);
    }

    @GetMapping("/payments/status/{id}")
    public ResponseEntity<PaymentTransaction> getStatus(@PathVariable Long id) {
        try {
            PaymentTransaction txn = routingService.getPaymentStatus(id);
            return ResponseEntity.ok(txn);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/payments/history")
    public ResponseEntity<List<PaymentTransaction>> getHistory() {
        return ResponseEntity.ok(routingService.getAllTransactions());
    }

    @PostMapping("/simulation/outage")
    public ResponseEntity<Map<Region, Boolean>> toggleOutage(
            @RequestParam Region region,
            @RequestParam boolean isOutage) {
        simulationService.setOutage(region, isOutage);
        return ResponseEntity.ok(simulationService.getStatus());
    }

    @GetMapping("/simulation/status")
    public ResponseEntity<Map<Region, Boolean>> getSimulationStatus() {
        return ResponseEntity.ok(simulationService.getStatus());
    }
}
