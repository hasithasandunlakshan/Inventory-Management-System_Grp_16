package com.Orderservice.Orderservice.entity;

import java.math.BigDecimal;
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
@Table(name = "user_discounts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDiscount {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_discount_id")
    private Long userDiscountId;
    
    @ManyToOne
    @JoinColumn(name = "discount_id", nullable = false)
    private Discount discount;
    
    @Column(name = "customer_id", nullable = false)
    private Long customerId;
    
    @Column(name = "order_id")
    private Long orderId; // Order where discount was applied
    
    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountAmount; // Actual discount amount applied
    
    @Column(name = "original_amount", precision = 10, scale = 2)
    private BigDecimal originalAmount; // Original amount before discount
    
    @Column(name = "final_amount", precision = 10, scale = 2)
    private BigDecimal finalAmount; // Final amount after discount
    
    @Column(name = "used_at", nullable = false)
    @Builder.Default
    private LocalDateTime usedAt = LocalDateTime.now();
    
    @Column(name = "notes", length = 500)
    private String notes; // Additional notes about discount usage
    
    /**
     * Get the ID (alias for userDiscountId)
     */
    public Long getId() {
        return this.userDiscountId;
    }
    
    /**
     * Set the ID (alias for userDiscountId)
     */
    public void setId(Long id) {
        this.userDiscountId = id;
    }
}