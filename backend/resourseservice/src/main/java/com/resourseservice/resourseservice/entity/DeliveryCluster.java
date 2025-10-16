package com.resourseservice.resourseservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "delivery_clusters")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryCluster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cluster_id")
    private Long clusterId;

    @Column(name = "cluster_name", nullable = false, unique = true, length = 100)
    private String clusterName;

    @Column(name = "assigned_driver_id")
    private Long assignedDriverId;

    @Column(name = "assignment_id")
    private Long assignmentId;

    @Column(name = "total_distance", precision = 10, scale = 2)
    private BigDecimal totalDistance;

    @Column(name = "estimated_time", precision = 10, scale = 2)
    private BigDecimal estimatedTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ClusterStatus status = ClusterStatus.PENDING;

    @Column(name = "created_by")
    private Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "deliveryCluster", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ClusterOrder> clusterOrders = new ArrayList<>();

    public enum ClusterStatus {
        PENDING, // Cluster created, not assigned
        ASSIGNED, // Assigned to driver
        IN_PROGRESS, // Driver started delivery
        COMPLETED, // All deliveries completed
        CANCELLED // Cluster cancelled
    }

    // Helper method to add cluster order
    public void addClusterOrder(ClusterOrder clusterOrder) {
        clusterOrders.add(clusterOrder);
        clusterOrder.setDeliveryCluster(this);
    }
}
