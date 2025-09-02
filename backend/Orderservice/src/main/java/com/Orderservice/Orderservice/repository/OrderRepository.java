package com.Orderservice.Orderservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByStatus(OrderStatus status);
    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems")
    List<Order> findAllWithOrderItems();

     @Query("SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.status = 'CONFIRMED'")
    List<Order> findAllConfirmedOrdersWithItems();
    
    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.customerId = :customerId")
    List<Order> findByCustomerIdWithOrderItems(Long customerId);
    
}