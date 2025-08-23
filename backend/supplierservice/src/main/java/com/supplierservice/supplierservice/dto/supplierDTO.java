package com.supplierservice.supplierservice.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDTO {
    private Long supplierId;        // s.supplierId
    private String name;            // s.name
    private String contactInfo;     // s.contactInfo
    private Long categoryId;        // c.categoryId
    private String categoryName;    // c.name
    private Double reliabilityScore; // ss.reliabilityScore
    private LocalDate lastUpdated;   // ss.lastUpdated  <-- changed from Instant -> LocalDate
}
