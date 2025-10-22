package com.Orderservice.Orderservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Orderservice.Orderservice.entity.Product;

import jakarta.persistence.LockModeType;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Bulk fetch products by IDs to avoid N+1 queries
    @Query("SELECT p FROM Product p WHERE p.productId IN :productIds")
    List<Product> findByProductIdIn(@Param("productIds") Set<Long> productIds);
    
    // Pessimistic write lock for inventory updates to prevent concurrent modification
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.productId = :productId")
    Optional<Product> findByIdWithLock(@Param("productId") Long productId);
}