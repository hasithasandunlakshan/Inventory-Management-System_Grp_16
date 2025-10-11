package com.InventoryMangementSystem.inventoryservice.dto;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for handling inventory requests in batch
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRequestDto {
    private Long orderId;
    private List<ProductRequestItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductRequestItem {
        private Long productId;
        private int quantity;
    }
}
