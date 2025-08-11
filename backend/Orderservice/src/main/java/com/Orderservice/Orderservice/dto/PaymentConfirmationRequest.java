package com.Orderservice.Orderservice.dto;

import lombok.Data;

@Data
public class PaymentConfirmationRequest {
    private Long orderId;
    private String paymentIntentId;
    private String paymentMethodId;
}