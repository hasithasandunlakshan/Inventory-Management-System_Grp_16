package com.resourseservice.resourseservice.dto;

import com.resourseservice.resourseservice.entity.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    
    private Long vehicleId;
    private String vehicleNumber;
    private Vehicle.VehicleType vehicleType;
    private BigDecimal capacity;
    private Vehicle.VehicleStatus status;
    private Long assignedDriverId;
    private String make;
    private String model;
    private Integer year;
    private LocalDate lastMaintenance;
    private LocalDate nextMaintenance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static VehicleResponse fromEntity(Vehicle vehicle) {
        return VehicleResponse.builder()
                .vehicleId(vehicle.getVehicleId())
                .vehicleNumber(vehicle.getVehicleNumber())
                .vehicleType(vehicle.getVehicleType())
                .capacity(vehicle.getCapacity())
                .status(vehicle.getStatus())
                .assignedDriverId(vehicle.getAssignedDriverId())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .lastMaintenance(vehicle.getLastMaintenance())
                .nextMaintenance(vehicle.getNextMaintenance())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();
    }
}
