package com.example.productservice.events.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryReservationItem {
    private Long productId;
    private int quantity;
    private String barcode;
}
