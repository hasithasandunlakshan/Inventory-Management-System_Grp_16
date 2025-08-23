package com.supplierservice.supplierservice.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "supplier_scores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierScore {

    @Id
    @Column(name = "supplier_id") // maps to PK column supplier_id
    private Long supplierId;

    @OneToOne(fetch = FetchType.LAZY) // keep it LAZY to avoid heavy joins
    @MapsId // share the same PK as Supplier (FK = PK)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "reliability_score", nullable = false)
    private double reliabilityScore;

    @Column(name = "last_updated", nullable = false)
    private LocalDate lastUpdated;
}
