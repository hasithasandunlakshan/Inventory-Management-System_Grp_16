package com.InventoryMangementSystem.userservice.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private String phoneNumber;
    private String profileImageUrl;
    private double latitude;
    private double longitude;
    private String formattedAddress;
    private String accountStatus;
    private Boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDate dateOfBirth;
}
