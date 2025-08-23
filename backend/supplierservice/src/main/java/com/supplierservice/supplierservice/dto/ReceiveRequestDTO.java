package com.supplierservice.supplierservice.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiveRequestDTO {
    private LocalDate receivedDate; // optional for now (kept for future GRN alignment)
    private String note; // optional
}
