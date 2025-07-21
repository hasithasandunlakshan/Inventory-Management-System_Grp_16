package com.InventoryMangementSystem.userservice.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    private String fullName;

    private String phoneNumber;

    // From frontend: after image upload and map selection
    private String profileImageUrl;

    private double latitude;

    private double longitude;

    private String formattedAddress;
    

    private LocalDate dateOfBirth;

    // existing getters and setters

    

}
