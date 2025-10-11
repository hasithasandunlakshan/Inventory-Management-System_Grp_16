package com.Orderservice.Orderservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyDiscountRequest {
    
    private String discountCode;
    private Long userId;
    private Double orderAmount;
    
    // Optional: Order ID if applying to existing order
    private Long orderId;
    
    // Optional: List of product IDs in cart (for product-specific discounts)
    private java.util.List<Long> productIds;
    
    // Optional: List of product barcodes in cart (for product-specific discounts)
    private java.util.List<String> productBarcodes;
}