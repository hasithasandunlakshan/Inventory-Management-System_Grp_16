package com.resourseservice.resourseservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DriverRegistrationRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "License class is required")
    @Pattern(regexp = "^[A-Z]$|^[A-Z]{2}$", message = "License class should be a valid class (A, B, C, etc.)")
    private String licenseClass;

    @NotNull(message = "License expiry date is required")
    private LocalDate licenseExpiry;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Emergency contact should be a valid phone number")
    private String emergencyContact;
}
