package com.InventoryMangementSystem.inventoryservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder //
public class InventoryItemDTO {
    private String name;
    private Long categoryId;
    private int quantity;
    private int reorderLevel;
}
