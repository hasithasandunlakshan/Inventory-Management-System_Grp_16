package com.Orderservice.Orderservice.dto;

import lombok.Data;

@Data
public class PaymentIntentDto {
    private String id;
    private String clientSecret;
    private Long amount;
    private String currency;
    private String status;
}