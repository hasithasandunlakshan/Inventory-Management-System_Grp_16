package com.supplierservice.supplierservice.models;

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
    private Long poId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "po_id")
    private PurchaseOrder purchaseOrder;

    private int receivedQuantity;

    private LocalDate receivedDate;
}
