package com.Orderservice.Orderservice.events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockReductionItem {
    private Long productId;  // Using product_id, not item_id
    private int quantity;
    private String barcode;
}