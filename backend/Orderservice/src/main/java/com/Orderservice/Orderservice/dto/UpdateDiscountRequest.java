package com.Orderservice.Orderservice.dto;

import com.Orderservice.Orderservice.enums.DiscountType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateDiscountRequest {
    
    private String discountName;
    private String discountCode;
    private String description;
    private DiscountType type;
    private Double discountValue;
    private Boolean isPercentage;
    private Double minOrderAmount;
    private Double maxDiscountAmount;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private Long maxUsage;
    private Long maxUsagePerUser;
}