package com.Orderservice.Orderservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddProductsToDiscountRequest {
    
    private List<Long> productIds;
    private List<String> productBarcodes;
    
    // At least one of the lists should be non-empty
    public boolean isValid() {
        return (productIds != null && !productIds.isEmpty()) || 
               (productBarcodes != null && !productBarcodes.isEmpty());
    }
}