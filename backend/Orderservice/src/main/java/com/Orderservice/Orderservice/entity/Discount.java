package com.Orderservice.Orderservice.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.Orderservice.Orderservice.enums.DiscountStatus;
import com.Orderservice.Orderservice.enums.DiscountType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "discounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Discount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_id")
    private Long discountId;
    
    @Column(name = "discount_name", nullable = false, length = 100)
    private String discountName;
    
    @Column(name = "discount_code", nullable = false, length = 50, unique = true)
    private String discountCode;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType type; // PRODUCT_DISCOUNT, BILL_DISCOUNT
    
    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue; // Percentage or fixed amount
    
    @Column(name = "is_percentage", nullable = false)
    private Boolean isPercentage; // true for percentage, false for fixed amount
    
    @Column(name = "minimum_order_amount", precision = 10, scale = 2)
    private BigDecimal minOrderAmount; // Minimum order amount for bill discount
    
    @Column(name = "maximum_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount; // Maximum discount cap
    
    @Column(name = "max_usage")
    private Long maxUsage; // Total usage limit for the discount
    
    @Column(name = "max_usage_per_user")
    private Long maxUsagePerUser; // Per user usage limit
    
    @Column(name = "valid_from")
    private LocalDateTime validFrom;
    
    @Column(name = "valid_to")
    private LocalDateTime validTo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private DiscountStatus status = DiscountStatus.ACTIVE;
    
    @Column(name = "created_by")
    private String createdBy; // Admin user ID
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
    
    // One-to-many relationship with DiscountProduct for product-specific discounts
    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DiscountProduct> discountProducts;
    
    // One-to-many relationship with UserDiscount for tracking user usage
    @OneToMany(mappedBy = "discount", cascade = CascadeType.ALL)
    private List<UserDiscount> userDiscounts;
    
    /**
     * Check if discount is currently active and valid
     */
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return status == DiscountStatus.ACTIVE && 
               (validFrom == null || now.isAfter(validFrom)) && 
               (validTo == null || now.isBefore(validTo));
    }
    
    /**
     * Get the discount ID (alias for discountId)
     */
    public Long getId() {
        return this.discountId;
    }
    
    /**
     * Set the discount ID (alias for discountId)
     */
    public void setId(Long id) {
        this.discountId = id;
    }
}