package com.Orderservice.Orderservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {
    private Long paymentId;
    private Long orderId;
    private Long customerId;
    private String stripePaymentIntentId;
    private String stripePaymentMethodId;
    private BigDecimal amount;
    private String currency;
    private String method;
    private String status;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Order details
    private String orderStatus;
    private BigDecimal orderTotalAmount;
    private LocalDateTime orderDate;
}