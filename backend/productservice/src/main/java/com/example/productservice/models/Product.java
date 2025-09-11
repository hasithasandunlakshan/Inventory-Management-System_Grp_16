package com.example.productservice.models;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Set;

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
    private Long id;

    private String name;

    private String description;

    private String imageUrl;

    @Column(name = "physical_stock")
    private int stock;

    @Column(name = "reserved")
    private int reserved = 0;

    @Column(name = "available_stock")
    private int availableStock;

    private double price;
    private String barcode; // Unique identifier for the product
    private String barcodeImageUrl; // Optional, can be used to store a barcode image URL

    // Many-to-many relationship with categories through ProductCategory
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<ProductCategory> productCategories;
}