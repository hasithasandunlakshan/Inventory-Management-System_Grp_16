package com.resourseservice.resourseservice.dto;

import com.resourseservice.resourseservice.entity.Assignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MinimalAssignmentResponse {

    private Long assignmentId;
    private Long driverId;
    private Long vehicleId;
    private Assignment.AssignmentStatus status;
    private LocalDateTime assignedAt;
    private LocalDateTime unassignedAt;
    private String notes;

    // Minimal display fields
    private String driverName;
    private String vehicleNumber;
    private String assignedByName;

    public static MinimalAssignmentResponse fromEntity(Assignment assignment) {
        return MinimalAssignmentResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .driverId(assignment.getDriverId())
                .vehicleId(assignment.getVehicleId())
                .status(assignment.getStatus())
                .assignedAt(assignment.getAssignedAt())
                .unassignedAt(assignment.getUnassignedAt())
                .notes(assignment.getNotes())
                .build();
    }
}
