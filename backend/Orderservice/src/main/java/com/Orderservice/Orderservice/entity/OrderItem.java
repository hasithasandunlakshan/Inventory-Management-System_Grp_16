package com.Orderservice.Orderservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Long orderItemId;
    
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
    
    @Column(name = "product_id") // Changed from item_id to product_id
    private Long productId;
    
    private Integer quantity;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal price;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}