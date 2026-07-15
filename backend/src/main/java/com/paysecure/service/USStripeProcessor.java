package com.paysecure.service;

import com.paysecure.model.Region;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class USStripeProcessor implements PaymentProcessor {

    @Autowired
    private OutageSimulationService outageSimulationService;

    @Override
    public boolean process(Double amount, String currency, String cardholderName) throws Exception {
        // Simulate network latency
        Thread.sleep(500);

        if (outageSimulationService.hasOutage(Region.US)) {
            throw new RuntimeException("US Node Error: Connection timeout on stripe-api-us.stripe.com");
        }

        // Mock processor logic: succeeds if amount is positive
        return amount > 0;
    }

    @Override
    public String getGatewayName() {
        return "Stripe (US Gateway)";
    }

    @Override
    public Region getRegion() {
        return Region.US;
    }
}
