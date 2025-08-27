package com.example.productservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private String name;
    private String description;
    private Long categoryId;
    private String imageUrl;
    private int stock; // physical stock
    private int reserved;
    private int availableStock;
    private double price;
    private String barcode; // Optional, can be generated in service
}