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
    private Long supplierId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    private double reliabilityScore;

    private LocalDate lastUpdated;
}
