package com.InventoryMangementSystem.inventoryservice.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InventoryResponseDto {
    private boolean success;
    private String message;
    private List<ProductDto> availableProducts = new ArrayList<>();
    private List<ProductDto> unavailableProducts = new ArrayList<>();
}
