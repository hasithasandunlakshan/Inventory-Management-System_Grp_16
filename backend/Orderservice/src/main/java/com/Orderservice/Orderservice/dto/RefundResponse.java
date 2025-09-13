package com.Orderservice.Orderservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RefundResponse {
    private boolean success;
    private String message;
    private Long orderId;
    private String orderStatus;
    private BigDecimal refundAmount;
    private String refundReason;
    private LocalDateTime refundProcessedAt;
    private String paymentStatus;
    
    public static RefundResponse success(Long orderId, BigDecimal refundAmount, String refundReason) {
        return RefundResponse.builder()
                .success(true)
                .message("Refund processed successfully")
                .orderId(orderId)
                .orderStatus("REFUNDED")
                .refundAmount(refundAmount)
                .refundReason(refundReason)
                .refundProcessedAt(LocalDateTime.now())
                .paymentStatus("REFUNDED")
                .build();
    }
    
    public static RefundResponse failure(Long orderId, String errorMessage) {
        return RefundResponse.builder()
                .success(false)
                .message(errorMessage)
                .orderId(orderId)
                .refundProcessedAt(LocalDateTime.now())
                .build();
    }
}