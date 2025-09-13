package com.resourseservice.resourseservice.dto;

import com.resourseservice.resourseservice.entity.DriverProfile;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverProfileResponse {
    
    private Long driverId;
    private Long userId;
    private String licenseNumber;
    private String licenseClass;
    private LocalDate licenseExpiry;
    private String availabilityStatus;
    private Long assignedVehicleId;
    private String emergencyContact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Convert entity to response DTO
    public static DriverProfileResponse fromEntity(DriverProfile driverProfile) {
        return new DriverProfileResponse(
                driverProfile.getDriverId(),
                driverProfile.getUserId(),
                driverProfile.getLicenseNumber(),
                driverProfile.getLicenseClass(),
                driverProfile.getLicenseExpiry(),
                driverProfile.getAvailabilityStatus().name(),
                driverProfile.getAssignedVehicleId(),
                driverProfile.getEmergencyContact(),
                driverProfile.getCreatedAt(),
                driverProfile.getUpdatedAt()
        );
    }
}
