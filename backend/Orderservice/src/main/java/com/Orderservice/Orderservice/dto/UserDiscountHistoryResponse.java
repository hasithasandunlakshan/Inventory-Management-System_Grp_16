package com.Orderservice.Orderservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDiscountHistoryResponse {
    
    private Long id;
    private String discountName;
    private String discountCode;
    private Long orderId;
    private Double originalAmount;
    private Double discountAmount;
    private Double finalAmount;
    private LocalDateTime usedAt;
    
    // Discount details at time of usage
    private String discountType;
    private Double discountValue;
    private Boolean wasPercentage;
}