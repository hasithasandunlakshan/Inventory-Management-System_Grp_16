package com.supplierservice.supplierservice.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentDTO {
    private Long id;
    private String filename;
    private String contentType;
    private long sizeBytes;
    private Instant uploadedAt;
    private String uploadedBy;
}
