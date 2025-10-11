package com.Orderservice.Orderservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountUsageStatsResponse {
    
    private String discountName;
    private String discountCode;
    private Long totalUsage;
    private Long uniqueUsers;
    private Double totalDiscountGiven;
    private Double averageDiscountPerUse;
    private String status;
}