package com.paysecure.service;

import com.paysecure.model.Region;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class APACRazorpayProcessor implements PaymentProcessor {

    @Autowired
    private OutageSimulationService outageSimulationService;

    @Override
    public boolean process(Double amount, String currency, String cardholderName) throws Exception {
        // Simulate network latency
        Thread.sleep(500);

        if (outageSimulationService.hasOutage(Region.APAC)) {
            throw new RuntimeException("APAC Node Error: SSL Handshake failed on api.razorpay.com");
        }

        return amount > 0;
    }

    @Override
    public String getGatewayName() {
        return "Razorpay (APAC Gateway)";
    }

    @Override
    public Region getRegion() {
        return Region.APAC;
    }
}
