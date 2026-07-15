package com.paysecure.service;

import com.paysecure.model.Region;

public interface PaymentProcessor {
    boolean process(Double amount, String currency, String cardholderName) throws Exception;
    String getGatewayName();
    Region getRegion();
}
