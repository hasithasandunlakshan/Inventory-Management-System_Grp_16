package com.Orderservice.Orderservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountCalculationResponse {
    
    private boolean applicable;
    private String message;
    private Double originalAmount;
    private Double discountAmount;
    private Double finalAmount;
    private String discountCode;
    private String discountName;
    private Long discountId;
    
    // Static factory methods for common responses
    public static DiscountCalculationResponse success(Double originalAmount, Double discountAmount, 
                                                    String discountCode, String discountName, Long discountId) {
        return DiscountCalculationResponse.builder()
                .applicable(true)
                .message("Discount applied successfully")
                .originalAmount(originalAmount)
                .discountAmount(discountAmount)
                .finalAmount(originalAmount - discountAmount)
                .discountCode(discountCode)
                .discountName(discountName)
                .discountId(discountId)
                .build();
    }
    
    public static DiscountCalculationResponse failure(String message) {
        return DiscountCalculationResponse.builder()
                .applicable(false)
                .message(message)
                .build();
    }
}