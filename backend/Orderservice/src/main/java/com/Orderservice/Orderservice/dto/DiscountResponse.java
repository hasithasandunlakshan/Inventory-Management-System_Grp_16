package com.Orderservice.Orderservice.dto;

import com.Orderservice.Orderservice.enums.DiscountStatus;
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
public class DiscountResponse {
    
    private Long id;
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
    private DiscountStatus status;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
    private LocalDateTime lastUsedAt;
    
    // Usage statistics
    private Long totalUsageCount;
    private Long uniqueUsersCount;
    private Double totalDiscountGiven;
    
    // Associated products (for product discounts)
    private List<DiscountProductInfo> associatedProducts;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DiscountProductInfo {
        private Long productId;
        private String productBarcode;
    }
}