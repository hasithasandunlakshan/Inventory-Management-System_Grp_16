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
public class AssignmentResponse {

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

    // Additional fields for display
    private String driverName;
    private String vehicleNumber;
    private String assignedByName;
    private String unassignedByName;

    public static AssignmentResponse fromEntity(Assignment assignment) {
        return AssignmentResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .driverId(assignment.getDriverId())
                .vehicleId(assignment.getVehicleId())
                .status(assignment.getStatus())
                .assignedBy(assignment.getAssignedBy())
                .assignedAt(assignment.getAssignedAt())
                .unassignedAt(assignment.getUnassignedAt())
                .unassignedBy(assignment.getUnassignedBy())
                .notes(assignment.getNotes())
                .createdAt(assignment.getCreatedAt())
                .updatedAt(assignment.getUpdatedAt())
                .build();
    }
}
