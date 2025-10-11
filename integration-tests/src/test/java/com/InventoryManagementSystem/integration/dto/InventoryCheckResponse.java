package com.InventoryManagementSystem.integration.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InventoryCheckResponse {
    private boolean success;
    private String message;
    private List<ProductItemDto> availableProducts = new ArrayList<>();
    private List<ProductItemDto> unavailableProducts = new ArrayList<>();
}
