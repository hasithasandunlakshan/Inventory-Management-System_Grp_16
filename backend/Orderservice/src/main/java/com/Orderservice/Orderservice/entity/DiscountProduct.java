package com.Orderservice.Orderservice.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "discount_products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscountProduct {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_product_id")
    private Long discountProductId;
    
    @ManyToOne
    @JoinColumn(name = "discount_id", nullable = false)
    private Discount discount;
    
    @Column(name = "product_id", nullable = false)
    private Long productId;
    
    @Column(name = "product_name", length = 255)
    private String productName; // Cache product name for quick access
    
    @Column(name = "product_barcode", length = 100)
    private String productBarcode; // Cache barcode for quick access
    
    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    /**
     * Get the ID (alias for discountProductId)
     */
    public Long getId() {
        return this.discountProductId;
    }
    
    /**
     * Set the ID (alias for discountProductId)
     */
    public void setId(Long id) {
        this.discountProductId = id;
    }
    
    /**
     * Check if this discount product is for a specific product ID
     */
    public boolean isForProduct(Long productId) {
        return this.productId.equals(productId);
    }
    
    /**
     * Check if this discount product is for a specific barcode
     */
    public boolean isForBarcode(String barcode) {
        return this.productBarcode != null && this.productBarcode.equals(barcode);
    }
}