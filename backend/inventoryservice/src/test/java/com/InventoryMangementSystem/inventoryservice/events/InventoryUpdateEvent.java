package com.InventoryMangementSystem.inventoryservice.events;

import java.util.ArrayList;
import java.util.List;

import com.InventoryMangementSystem.inventoryservice.dto.ProductDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryUpdateEvent {

    private Long orderId;
    private boolean success;
    private String message;
    private List<ProductDto> products = new ArrayList<>();
}
