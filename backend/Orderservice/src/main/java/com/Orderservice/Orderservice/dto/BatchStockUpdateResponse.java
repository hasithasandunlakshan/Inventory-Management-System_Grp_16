package com.Orderservice.Orderservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchStockUpdateResponse {
    private boolean success;
    private String message;
    private List<Long> failedProductIds;  // Using product_id, not item_id
    private int totalItems;
    private int successfulItems;
    private int failedItems;
}