package com.supplierservice.supplierservice.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderDTO {
    private Long supplierId;
    private LocalDate date;
    private String status;
    private List<PurchaseOrderItemDTO> items; // Nested DTOs for order lines
}
