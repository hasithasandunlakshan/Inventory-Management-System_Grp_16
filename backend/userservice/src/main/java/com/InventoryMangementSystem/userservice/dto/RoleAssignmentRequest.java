package com.InventoryMangementSystem.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleAssignmentRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Role name is required")
    private String roleName;
}
