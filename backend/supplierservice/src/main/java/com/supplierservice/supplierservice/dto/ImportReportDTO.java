package com.supplierservice.supplierservice.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportReportDTO {
    private int created;
    private int failed;
    private List<String> errors;
}
