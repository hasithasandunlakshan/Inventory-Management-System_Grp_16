package com.supplierservice.supplierservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierDTO {
    private Long supplierId;
    private Long userId;
    private String userName;
    private Long categoryId;
    private String categoryName; // optional
}
