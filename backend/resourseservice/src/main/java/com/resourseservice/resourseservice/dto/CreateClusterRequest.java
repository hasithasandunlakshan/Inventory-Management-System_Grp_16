package com.resourseservice.resourseservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateClusterRequest {

    private String clusterName;
    private BigDecimal totalDistance;
    private BigDecimal estimatedTime;
    private Long createdBy;
    private List<ClusterOrderRequest> orders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClusterOrderRequest {
        private Long orderId;
        private Integer deliverySequence;
        private BigDecimal customerLatitude;
        private BigDecimal customerLongitude;
        private String customerAddress;
    }
}
