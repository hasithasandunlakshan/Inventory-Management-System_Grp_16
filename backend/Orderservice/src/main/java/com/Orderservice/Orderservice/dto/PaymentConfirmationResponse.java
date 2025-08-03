package com.Orderservice.Orderservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentConfirmationResponse {
    private boolean success;
    private String message;
    private String error;
}