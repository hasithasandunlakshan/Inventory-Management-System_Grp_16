package com.example.productservice.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    private String name;

    private String description;

    private String imageUrl;
    
    private int stock;

    @Column(name = "category_id")
    private Long categoryId;

    private double price;
}