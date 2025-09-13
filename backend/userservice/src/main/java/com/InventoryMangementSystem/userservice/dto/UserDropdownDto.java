package com.InventoryMangementSystem.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDropdownDto {
    private Long userId;
    private String username;
}
