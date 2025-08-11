package com.example.productservice.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private String name;
    private String description;
    private Long categoryId;
    private String imageUrl;
    private int stock;
    private double price;
    private String barcode; // Optional, can be generated in service
}