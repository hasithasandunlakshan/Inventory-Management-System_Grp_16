package com.InventoryMangementSystem.inventoryservice.dto;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BarcodeDTO {
    private long itemId;
    private String barcodeValue;

}
