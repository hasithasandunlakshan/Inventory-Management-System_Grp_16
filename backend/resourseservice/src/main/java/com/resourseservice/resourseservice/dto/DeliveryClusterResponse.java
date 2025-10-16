package com.resourseservice.resourseservice.dto;

import com.resourseservice.resourseservice.entity.DeliveryCluster;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryClusterResponse {

    private Long clusterId;
    private String clusterName;
    private Long assignedDriverId;
    private String driverName;
    private Long assignmentId;
    private BigDecimal totalDistance;
    private BigDecimal estimatedTime;
    private DeliveryCluster.ClusterStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
    private Integer totalOrders;
    private List<ClusterOrderResponse> orders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClusterOrderResponse {
        private Long clusterOrderId;
        private Long orderId;
        private Integer deliverySequence;
        private BigDecimal customerLatitude;
        private BigDecimal customerLongitude;
        private String customerAddress;
        private String deliveryStatus;
        private LocalDateTime deliveredAt;
        private String deliveryNotes;
    }
}
