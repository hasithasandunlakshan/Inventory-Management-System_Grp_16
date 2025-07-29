package com.supplierservice.supplierservice.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryLogDTO {
    private Long poId; // ID of the purchase order being delivered
    private int receivedQuantity;
    private LocalDate receivedDate;
}
