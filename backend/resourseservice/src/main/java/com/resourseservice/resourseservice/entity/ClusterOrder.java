package com.resourseservice.resourseservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cluster_orders", indexes = {
        @Index(name = "idx_cluster_order_id", columnList = "order_id"),
        @Index(name = "idx_cluster_delivery_seq", columnList = "cluster_id, delivery_sequence")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClusterOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cluster_order_id")
    private Long clusterOrderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cluster_id", nullable = false)
    private DeliveryCluster deliveryCluster;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "delivery_sequence", nullable = false)
    private Integer deliverySequence;

    @Column(name = "customer_latitude", precision = 10, scale = 7)
    private BigDecimal customerLatitude;

    @Column(name = "customer_longitude", precision = 10, scale = 7)
    private BigDecimal customerLongitude;

    @Column(name = "customer_address", length = 500)
    private String customerAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_status", nullable = false)
    @Builder.Default
    private DeliveryStatus deliveryStatus = DeliveryStatus.PENDING;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "delivery_notes", length = 1000)
    private String deliveryNotes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum DeliveryStatus {
        PENDING, // Not yet delivered
        IN_TRANSIT, // Driver is on the way
        DELIVERED, // Successfully delivered
        FAILED // Delivery failed
    }
}
