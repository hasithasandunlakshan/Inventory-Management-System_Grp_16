package com.supplierservice.supplierservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItemDTO {
    private Long id; // line id (null on create)
    private Long itemId; // inventory item ref
    private int quantity;
    private double unitPrice;
    private Double lineTotal; // computed on read
}
