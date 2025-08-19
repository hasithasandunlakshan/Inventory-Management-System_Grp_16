package com.supplierservice.supplierservice.dto;

import lombok.*;
import java.time.LocalDate;

/**
 * Header-level updates only (not items, not status transitions).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderUpdateDTO {
    private Long supplierId; // optional; set only if changing supplier
    private LocalDate date; // optional; set only if changing PO date
}
