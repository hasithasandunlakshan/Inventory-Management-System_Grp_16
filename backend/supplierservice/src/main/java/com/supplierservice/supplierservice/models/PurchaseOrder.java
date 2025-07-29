package com.supplierservice.supplierservice.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long poId;

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    private LocalDate date;

    private String status;

    @OneToMany(mappedBy = "purchaseOrder")
    private List<PurchaseOrderItem> items;

    @OneToOne(mappedBy = "purchaseOrder")
    private DeliveryLog deliveryLog;
}
