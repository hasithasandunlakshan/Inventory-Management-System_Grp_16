package com.InventoryMangementSystem.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverProfileCreatedEvent {
    private String event;
    private Long userId;
}
