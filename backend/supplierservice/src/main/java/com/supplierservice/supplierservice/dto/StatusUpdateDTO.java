package com.supplierservice.supplierservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateDTO {
    private String status; // DRAFT, SENT, PENDING, RECEIVED, CANCELLED
    private String reason; // optional (useful for audit)
}
