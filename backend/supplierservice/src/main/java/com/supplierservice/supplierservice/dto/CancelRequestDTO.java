package com.supplierservice.supplierservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelRequestDTO {
    private String reason; // optional; useful for audit/logs
}
