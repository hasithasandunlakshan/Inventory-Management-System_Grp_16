package com.supplierservice.supplierservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TotalsDTO {
    private Double subtotal;
    private Double tax; // reserved for later
    private Double discount; // reserved for later
    private Double total;
}
