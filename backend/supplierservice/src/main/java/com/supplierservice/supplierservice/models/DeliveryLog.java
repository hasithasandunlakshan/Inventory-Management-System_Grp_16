package com.supplierservice.supplierservice.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "delivery_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_log_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private PurchaseOrder purchaseOrder;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "received_quantity")
    private Integer receivedQuantity;

    @Column(name = "received_date")
    private LocalDate receivedDate;

    // Add a getter method to expose the purchase order ID without exposing the full
    // object
    public Long getPurchaseOrderId() {
        return purchaseOrder != null ? purchaseOrder.getPoId() : null;
    }

    // Add a getter method to expose the purchase order status
    public String getPurchaseOrderStatus() {
        return purchaseOrder != null && purchaseOrder.getStatus() != null
                ? purchaseOrder.getStatus().name()
                : null;
    }
}
