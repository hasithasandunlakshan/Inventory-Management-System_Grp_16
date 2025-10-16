package com.resourseservice.resourseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignDriverToClusterRequest {

    private Long clusterId;
    private Long assignmentId;
    private Long assignedBy;
}
