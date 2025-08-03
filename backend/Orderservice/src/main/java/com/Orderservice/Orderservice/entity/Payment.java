package com.Orderservice.Orderservice.entity;

import com.Orderservice.Orderservice.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long paymentId;
    
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
    
    @Column(name = "stripe_payment_intent_id", unique = true)
    private String stripePaymentIntentId;
    
    @Column(name = "stripe_payment_method_id")
    private String stripePaymentMethodId;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(length = 3)
    private String currency = "USD";
    
    @Column(length = 50)
    private String method = "CARD";
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}