package com.supplierservice.supplierservice.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderSummaryDTO {
    private Long id;
    private String poNumber; // optional; keep null for now if you don’t have it
    private Long supplierId;
    private String supplierName;
    private LocalDate date;
    private String status;
    private Double total;
}
