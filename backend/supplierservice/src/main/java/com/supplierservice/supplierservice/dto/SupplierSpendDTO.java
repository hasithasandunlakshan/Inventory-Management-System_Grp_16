package com.supplierservice.supplierservice.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierSpendDTO {
    private Long supplierId;
    private LocalDate from;
    private LocalDate to;
    private long orders; // number of POs in range
    private double total; // sum of PO totals in range
}
