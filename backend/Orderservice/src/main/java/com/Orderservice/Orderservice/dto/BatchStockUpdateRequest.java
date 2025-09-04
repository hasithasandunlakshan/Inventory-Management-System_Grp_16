package com.Orderservice.Orderservice.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BatchStockUpdateRequest {
    private List<StockUpdateItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockUpdateItem {
        private Long productId;  // Using product_id, not item_id
        private Integer quantity;
    }
}
