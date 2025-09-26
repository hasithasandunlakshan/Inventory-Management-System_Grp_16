package com.Orderservice.Orderservice.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.enums.OrderStatus;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);

    List<Order> findByStatus(OrderStatus status);

    
    // Paginated version for status-based queries
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems")
    List<Order> findAllWithOrderItems();

    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.status = 'CONFIRMED'")
    List<Order> findAllConfirmedOrdersWithItems();
    
    // Paginated version for confirmed orders
    @Query(value = "SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.status = 'CONFIRMED'",
           countQuery = "SELECT COUNT(o) FROM Order o WHERE o.status = 'CONFIRMED'")
    Page<Order> findAllConfirmedOrdersWithItems(Pageable pageable);
    
    // Optimized paginated version with status parameter - orders by orderDate DESC for better performance
    @Query(value = "SELECT DISTINCT o FROM Order o JOIN FETCH o.orderItems WHERE o.status = :status ORDER BY o.orderDate DESC",
           countQuery = "SELECT COUNT(DISTINCT o) FROM Order o WHERE o.status = :status")
    Page<Order> findByStatusWithOrderItems(@Param("status") OrderStatus status, Pageable pageable);
    
    @Query("SELECT o FROM Order o JOIN FETCH o.orderItems WHERE o.customerId = :customerId")
    List<Order> findByCustomerIdWithOrderItems(Long customerId);
    
    // High-performance query to get orders with all related data in one query
    @Query(value = "SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "WHERE o.status = :status " +
           "ORDER BY o.orderDate DESC",
           countQuery = "SELECT COUNT(DISTINCT o) FROM Order o WHERE o.status = :status")
    Page<Order> findByStatusWithOrderItemsOptimized(@Param("status") OrderStatus status, Pageable pageable);
    

}