package com.InventoryManagementSystem.integration.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductItemDto {
    private Long productId;
    private int quantity;
    private String productName;
}
