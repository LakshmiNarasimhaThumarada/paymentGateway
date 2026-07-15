package com.paysecure.service;

import com.paysecure.model.Region;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EUAdyenProcessor implements PaymentProcessor {

    @Autowired
    private OutageSimulationService outageSimulationService;

    @Override
    public boolean process(Double amount, String currency, String cardholderName) throws Exception {
        // Simulate network latency
        Thread.sleep(500);

        if (outageSimulationService.hasOutage(Region.EU)) {
            throw new RuntimeException("EU Node Error: Connection lost to adyen-api-eu.adyen.com");
        }

        return amount > 0;
    }

    @Override
    public String getGatewayName() {
        return "Adyen (EU Gateway)";
    }

    @Override
    public Region getRegion() {
        return Region.EU;
    }
}
