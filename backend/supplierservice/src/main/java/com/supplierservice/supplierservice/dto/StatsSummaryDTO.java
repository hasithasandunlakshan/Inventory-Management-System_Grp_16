package com.supplierservice.supplierservice.dto;

import lombok.*;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsSummaryDTO {
    private long count;
    private double total;
    private Map<String, Long> byStatusCounts;
    private Map<String, Double> byStatusTotals;
}
