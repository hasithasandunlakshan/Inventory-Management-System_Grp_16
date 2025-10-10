package com.supplierservice.supplierservice.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierScoreDTO {
    private Long supplierId;
    private double reliabilityScore;
    private LocalDate lastUpdated;
}
