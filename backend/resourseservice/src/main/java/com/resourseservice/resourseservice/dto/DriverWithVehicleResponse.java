package com.resourseservice.resourseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverWithVehicleResponse {
    private Long assignmentId;
    private Long userId;
    private String driverName;
    private String vehicleType;
}

