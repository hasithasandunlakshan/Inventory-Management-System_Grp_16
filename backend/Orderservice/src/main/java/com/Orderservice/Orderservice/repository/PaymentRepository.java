package com.Orderservice.Orderservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.Orderservice.Orderservice.entity.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    List<Payment> findByOrderOrderId(Long orderId);
    
    /**
     * Optimized query to fetch payments with orders using JOIN FETCH
     * Prevents N+1 query problem by eagerly loading order relationships
     */
    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.order ORDER BY p.paymentDate DESC")
    Page<Payment> findAllPaymentsWithOrders(Pageable pageable);
}