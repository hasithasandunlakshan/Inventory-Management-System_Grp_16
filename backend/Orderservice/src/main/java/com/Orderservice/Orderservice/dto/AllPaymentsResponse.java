package com.Orderservice.Orderservice.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AllPaymentsResponse {
    private boolean success;
    private String message;
    private List<PaymentResponse> payments;
    private int totalPayments;
}