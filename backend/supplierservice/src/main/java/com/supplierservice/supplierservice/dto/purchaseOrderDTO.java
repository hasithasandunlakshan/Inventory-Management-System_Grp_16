package com.supplierservice.supplierservice.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderDTO {
    private Long id; // poId
    private Long supplierId;
    private String supplierName; // convenience for UI
    private LocalDate date;
    private String status; // enum name as string
    private List<PurchaseOrderItemDTO> items;

    // computed totals (optional for now)
    private Double subtotal;
    private Double total;
}
