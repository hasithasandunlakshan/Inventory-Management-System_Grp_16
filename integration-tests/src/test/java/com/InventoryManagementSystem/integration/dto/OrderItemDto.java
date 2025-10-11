package com.InventoryManagementSystem.integration.dto;

import java.math.BigDecimal;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OrderItemDto {
    private Long itemId;
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal price;
}
