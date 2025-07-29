package com.supplierservice.supplierservice.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "suppliers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long supplierId;

    @Column(nullable = false)
    private String name;

    private String contactInfo;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private SupplierCategory category;

    @OneToMany(mappedBy = "supplier")
    private List<PurchaseOrder> purchaseOrders;

    @OneToOne(mappedBy = "supplier")
    private SupplierScore score;
}
