package com.paysecure.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private String currency;
    private String cardholderName;
    private String status; // PENDING, SUCCESS, FAILED

    @Enumerated(EnumType.STRING)
    private Region primaryRegion; // Region the payment was originally targeted for

    @Enumerated(EnumType.STRING)
    private Region processedRegion; // Region that actually completed the payment

    @Column(length = 2000)
    private String routingLog; // Audit trail of attempts (e.g. "US attempted - Timeout; EU attempted - Success")

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
