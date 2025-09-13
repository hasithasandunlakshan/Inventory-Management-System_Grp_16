package com.example.productservice.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.Set;

/**
 * Product entity representing a product in the inventory system.
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public final class Product {
    /**
     * The product ID.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    /**
     * The product name.
     */
    private String name;

    /**
     * The product description.
     */
    private String description;

    /**
     * The product image URL.
     */
    private String imageUrl;

    /**
     * The physical stock quantity.
     */
    @Column(name = "physical_stock")
    private int stock;

    /**
     * The reserved stock quantity.
     */
    @Column(name = "reserved")
    private int reserved = 0;

    /**
     * The available stock quantity.
     */
    @Column(name = "available_stock")
    private int availableStock;

    /**
     * The product price.
     */
    private double price;

    /**
     * The product barcode.
     */
    private String barcode;

    /**
     * The barcode image URL.
     */
    private String barcodeImageUrl;

    /**
     * Many-to-many relationship with categories through ProductCategory.
     */
    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<ProductCategory> productCategories = new java.util.HashSet<>();
}
