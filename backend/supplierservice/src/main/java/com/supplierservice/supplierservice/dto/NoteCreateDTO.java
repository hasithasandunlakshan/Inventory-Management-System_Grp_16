package com.supplierservice.supplierservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteCreateDTO {
    private String text; // required
    private String createdBy; // optional
}
