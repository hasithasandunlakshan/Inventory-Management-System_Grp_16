package com.resourseservice.resourseservice.dto;

import com.resourseservice.resourseservice.entity.Vehicle;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRegistrationRequest {

    @NotBlank(message = "Vehicle number is required")
    @Size(max = 20, message = "Vehicle number must not exceed 20 characters")
    private String vehicleNumber;

    @NotNull(message = "Vehicle type is required")
    private Vehicle.VehicleType vehicleType;

    @NotNull(message = "Capacity is required")
    @DecimalMin(value = "0.01", message = "Capacity must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Capacity must have at most 8 integer digits and 2 decimal places")
    private BigDecimal capacity;

    @Size(max = 50, message = "Make must not exceed 50 characters")
    private String make;

    @Size(max = 50, message = "Model must not exceed 50 characters")
    private String model;

    @Min(value = 1900, message = "Year must be at least 1900")
    @Max(value = 2100, message = "Year must be at most 2100")
    private Integer year;

    private LocalDate lastMaintenance;

    private LocalDate nextMaintenance;
}
