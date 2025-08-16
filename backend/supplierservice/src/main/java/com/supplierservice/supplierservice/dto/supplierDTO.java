package com.supplierservice.supplierservice.dto;

import lombok.*;
import java.time.Instant;

/**
 * DTO used for API responses.
 * Contains only fields we want to expose, avoiding lazy-loading issues.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDTO {
    private Long supplierId; // supplier id
    private String name; // supplier name
    private String contactInfo; // supplier contact info
    private Long categoryId; // category id
    private String categoryName; // category name
    private Double reliabilityScore; // latest reliability score
    private Instant lastUpdated; // when score was last updated
}
