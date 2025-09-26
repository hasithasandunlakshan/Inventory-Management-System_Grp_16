package com.example.productservice.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * ProductCategory entity representing the many-to-many relationship
 * between products and categories.
 */
@Entity
@Table(name = "product_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ProductCategoryId.class)
public final class ProductCategory {
    /**
     * The product ID.
     */
    @Id
    @Column(name = "product_id")
    private Long productId;

    /**
     * The category ID.
     */
    @Id
    @Column(name = "category_id")
    private Long categoryId;

    /**
     * The product entity.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", insertable = false, updatable = false)
    private Product product;

    /**
     * The category entity.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", insertable = false, updatable = false)
    private Category category;
}

/**
 * Composite key class for ProductCategory.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
final class ProductCategoryId implements Serializable {

    /**
     * The product ID.
     */
    private Long productId;

    /**
     * The category ID.
     */
    private Long categoryId;
}
