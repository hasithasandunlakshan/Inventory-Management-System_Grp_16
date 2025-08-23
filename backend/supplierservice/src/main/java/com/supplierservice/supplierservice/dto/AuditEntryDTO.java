package com.supplierservice.supplierservice.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEntryDTO {
    private String action;
    private String details;
    private Instant createdAt;
    private String createdBy;
}
