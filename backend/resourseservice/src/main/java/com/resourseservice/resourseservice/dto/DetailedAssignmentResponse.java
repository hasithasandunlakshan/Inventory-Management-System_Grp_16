package com.resourseservice.resourseservice.dto;

import com.resourseservice.resourseservice.entity.Assignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailedAssignmentResponse {

    private Long assignmentId;
    private Long driverId;
    private Long vehicleId;
    private Assignment.AssignmentStatus status;
    private Long assignedBy;
    private LocalDateTime assignedAt;
    private LocalDateTime unassignedAt;
    private Long unassignedBy;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Driver details
    private DriverDetails driverDetails;

    // User details
    private UserDetails assignedByDetails;
    private UserDetails unassignedByDetails;

    // Vehicle details
    private VehicleDetails vehicleDetails;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DriverDetails {
        private Long driverId;
        private Long userId;
        private String fullName;
        private String email;
        private String phoneNumber;
        private String licenseNumber;
        private String licenseClass;
        private LocalDate licenseExpiry;
        private String emergencyContact;
        private String availabilityStatus;
        private String formattedAddress;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDetails {
        private Long userId;
        private String username;
        private String fullName;
        private String email;
        private String role;
        private String phoneNumber;
        private String formattedAddress;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleDetails {
        private Long vehicleId;
        private String vehicleNumber;
        private String vehicleType;
        private Integer capacity;
        private String status;
        private String make;
        private String model;
        private Integer year;
        private String lastMaintenance;
        private String nextMaintenance;
    }
}
