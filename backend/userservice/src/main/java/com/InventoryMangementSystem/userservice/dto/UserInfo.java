package com.InventoryMangementSystem.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserInfo {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String role;
}
