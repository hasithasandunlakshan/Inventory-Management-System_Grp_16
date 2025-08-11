package com.Orderservice.Orderservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentIntentResponse {
    private boolean success;
    private PaymentIntentDto paymentIntent;
    private Long orderId;
    private String message;
    private String error;
}