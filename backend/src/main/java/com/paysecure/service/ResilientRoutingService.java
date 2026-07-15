package com.paysecure.service;

import com.paysecure.model.PaymentTransaction;
import com.paysecure.model.Region;
import com.paysecure.repository.PaymentTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResilientRoutingService {

    @Autowired
    private PaymentTransactionRepository repository;

    private final Map<Region, PaymentProcessor> processorMap = new HashMap<>();

    @Autowired
    public void setProcessors(List<PaymentProcessor> processors) {
        for (PaymentProcessor processor : processors) {
            processorMap.put(processor.getRegion(), processor);
        }
    }

    public PaymentTransaction processPayment(Double amount, String currency, String cardholderName, Region targetRegion) {
        StringBuilder logBuilder = new StringBuilder();
        logBuilder.append(String.format("[%s] Initiating payment of %s %s targeted for region %s.\n",
                LocalDateTime.now(), amount, currency, targetRegion));

        PaymentTransaction transaction = PaymentTransaction.builder()
                .amount(amount)
                .currency(currency)
                .cardholderName(cardholderName)
                .primaryRegion(targetRegion)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        // Determine routing order starting with the primary region
        List<Region> routingOrder = new ArrayList<>();
        routingOrder.add(targetRegion);
        for (Region r : Region.values()) {
            if (r != targetRegion) {
                routingOrder.add(r);
            }
        }

        boolean success = false;
        Region finalProcessedRegion = null;

        for (int i = 0; i < routingOrder.size(); i++) {
            Region currentRegion = routingOrder.get(i);
            PaymentProcessor processor = processorMap.get(currentRegion);

            logBuilder.append(String.format("[%s] Attempting processing via %s...\n", LocalDateTime.now(), processor.getGatewayName()));

            try {
                if (processor.process(amount, currency, cardholderName)) {
                    success = true;
                    finalProcessedRegion = currentRegion;
                    logBuilder.append(String.format("[%s] SUCCESS: Payment settled via %s.\n", LocalDateTime.now(), processor.getGatewayName()));
                    break;
                } else {
                    logBuilder.append(String.format("[%s] DECLINED: Gateway declined charge.\n", LocalDateTime.now()));
                }
            } catch (Exception e) {
                logBuilder.append(String.format("[%s] FAILED: %s\n", LocalDateTime.now(), e.getMessage()));
                if (i < routingOrder.size() - 1) {
                    logBuilder.append(String.format("[%s] Action: Failing over to next region...\n", LocalDateTime.now()));
                }
            }
        }

        if (success) {
            transaction.setStatus("SUCCESS");
            transaction.setProcessedRegion(finalProcessedRegion);
        } else {
            transaction.setStatus("FAILED");
            logBuilder.append(String.format("[%s] TERMINAL ERROR: All regional nodes failed.\n", LocalDateTime.now()));
        }

        transaction.setRoutingLog(logBuilder.toString());
        return repository.save(transaction);
    }

    public PaymentTransaction getPaymentStatus(Long id) throws Exception {
        PaymentTransaction transaction = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found for ID: " + id));

        // If transaction is still pending or needs status fetch, we check.
        // We can simulate failover of status fetch as well:
        Region primary = transaction.getPrimaryRegion();
        PaymentProcessor primaryProcessor = processorMap.get(primary);

        // If we want to simulate a fetch status failover:
        // We can write status check failover logic here if needed, but for simplicity,
        // status is updated during processing, and here we return the saved status.
        return transaction;
    }

    public List<PaymentTransaction> getAllTransactions() {
        return repository.findAll();
    }
}
