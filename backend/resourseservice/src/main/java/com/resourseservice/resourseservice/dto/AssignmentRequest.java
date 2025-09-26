package com.resourseservice.resourseservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRequest {

    @NotNull(message = "Driver ID is required")
    private Long driverId;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Assigned by user ID is required")
    private Long assignedBy;

    private String notes;
}
