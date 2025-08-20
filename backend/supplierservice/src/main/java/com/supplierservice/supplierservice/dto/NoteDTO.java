package com.supplierservice.supplierservice.dto;

import lombok.*;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteDTO {
    private Long id;
    private String text;
    private Instant createdAt;
    private String createdBy;
}
