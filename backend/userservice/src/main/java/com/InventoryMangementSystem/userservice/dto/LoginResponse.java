package com.InventoryMangementSystem.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private boolean success;
    private String token;
    private UserInfo user;
    private String message;
    private String error;
    
    // Constructor for successful login
    public LoginResponse(boolean success, String token, UserInfo user, String message) {
        this.success = success;
        this.token = token;
        this.user = user;
        this.message = message;
    }
    
    // Constructor for error response
    public LoginResponse(boolean success, String error) {
        this.success = success;
        this.error = error;
    }
}