package com.supplierservice.supplierservice.models.ml;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "supplier_scores_daily", uniqueConstraints = @UniqueConstraint(columnNames = { "supplier_id",
        "score_date" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierScoreDaily {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(name = "score_date", nullable = false)
    private LocalDate scoreDate;

    private Double onTimeRate30d;
    private Double inFullRate30d;
    private Double avgLateDays30d;
    private Double medianLeadTime90d;
    private Double leadTimeIqr90d;
    private Double priceIndex30d;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
