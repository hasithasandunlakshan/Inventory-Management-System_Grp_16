package com.example.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductWithCategoryDTO {
    private Long productId;
    private String name;
    private String description;
    private String imageUrl;
    private int stock; // physical stock
    private int reserved;
    private int availableStock;
    private double price;
    private String barcode;
    private String barcodeImageUrl;
    
    // Category information
    private Long categoryId;
    private String categoryName;
}


