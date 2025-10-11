package com.InventoryManagementSystem.integration.dto;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class InventoryReservationRequest {
    private Long orderId;
    private List<ProductItemDto> products = new ArrayList<>();
}
