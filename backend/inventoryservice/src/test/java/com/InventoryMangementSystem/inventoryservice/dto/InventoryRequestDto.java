package com.InventoryMangementSystem.inventoryservice.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InventoryRequestDto {
    private Long orderId;
    private List<ProductDto> products = new ArrayList<>();
}
