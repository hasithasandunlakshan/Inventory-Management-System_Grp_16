package com.supplierservice.supplierservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MlPoFeaturesDTO {
    private Long supplier_id; // supplierId
    private Long category_id; // categoryId

    private Integer orders_30d;
    private Integer orders_90d;

    private Double received_rate_90d; // fraction 0..1
    private Double cancel_rate_90d; // fraction 0..1

    private Long days_since_last_po; // days; null when unknown

    private Integer month_num; // 1..12 when order_date provided
    private Integer weekday_num; // 1..7 (Mon=1..Sun=7) when order_date provided

    private String order_date; // passthrough of the provided ISO date or null
}
