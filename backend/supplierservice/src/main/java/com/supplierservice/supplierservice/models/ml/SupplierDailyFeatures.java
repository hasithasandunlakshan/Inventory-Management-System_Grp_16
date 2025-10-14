package com.supplierservice.supplierservice.models.ml;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

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

    /**
     * Convert this feature object to a map for use in ML service requests
     * 
     * @return A map representation of the features
     */
    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("supplier_id", supplierId);
        map.put("otif_30d", otif30d);
        map.put("late_rate_30d", lateRate30d);
        map.put("spend_30d", spend30d);
        map.put("open_po_count", openPoCount);
        map.put("median_lead_time_90d", medianLeadTime90d);
        map.put("lead_time_iqr_90d", leadTimeIqr90d);
        map.put("defect_rate_180d", defectRate180d);
        map.put("dispute_rate_180d", disputeRate180d);
        map.put("price_index_30d", priceIndex30d);
        map.put("feature_date", featureDate.toString());
        return map;
    }
}
