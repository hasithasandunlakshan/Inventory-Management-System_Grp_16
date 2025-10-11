package com.InventoryManagementSystem.integration.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OrderCreateRequest {
    private Long customerId;
    private List<ProductItemDto> items = new ArrayList<>();
}
