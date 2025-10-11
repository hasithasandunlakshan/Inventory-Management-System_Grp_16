package com.InventoryMangementSystem.inventoryservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * DTO for inventory operation responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryResponseDto {
    private boolean success;
    private String message;
    private Object data;
}
