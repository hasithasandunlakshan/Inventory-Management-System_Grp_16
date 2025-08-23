package com.supplierservice.supplierservice.models.ml;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "features_po_at_creation", uniqueConstraints = @UniqueConstraint(columnNames = { "po_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PoFeaturesAtCreation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "po_id", nullable = false)
    private Long poId;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    private Double totalAmount;
    private Integer itemCount;
    private Double itemMixEntropy;
    private Double expectedLeadTimeDays;
    private Double supplierOtif90d;
    private Double supplierLeadTimeVar;
    private Integer month; // 1..12
    private Integer weekday; // 0..6

    @Column(name = "created_row_at", nullable = false)
    private LocalDateTime createdRowAt;
}
