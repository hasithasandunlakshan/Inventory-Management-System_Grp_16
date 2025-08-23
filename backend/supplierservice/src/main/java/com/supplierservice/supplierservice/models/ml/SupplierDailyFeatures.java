package com.supplierservice.supplierservice.models.ml;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "features_supplier_daily", uniqueConstraints = @UniqueConstraint(columnNames = { "supplier_id",
        "feature_date" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDailyFeatures {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(name = "feature_date", nullable = false)
    private LocalDate featureDate;

    private Double otif30d;
    private Double lateRate30d;
    private Double spend30d;
    private Integer openPoCount;
    private Double medianLeadTime90d;
    private Double leadTimeIqr90d;
    private Double defectRate180d;
    private Double disputeRate180d;
    private Double priceIndex30d;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
