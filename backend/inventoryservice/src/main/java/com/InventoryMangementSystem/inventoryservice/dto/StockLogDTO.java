package com.InventoryMangementSystem.inventoryservice.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLogDTO {
    private Long itemId;
    private Integer stockChange;
    private LocalDateTime timestamp;
}