package com.supplierservice.supplierservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierCategoryDTO {
    private Long categoryId;
    private String name;
}
