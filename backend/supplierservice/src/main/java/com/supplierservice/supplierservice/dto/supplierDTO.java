package com.supplierservice.supplierservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDTO {
    private String name;
    private String contactInfo;
    private Long categoryId; // Refers to SupplierCategory
}
