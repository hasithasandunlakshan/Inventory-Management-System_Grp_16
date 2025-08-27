package com.example.productservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.productservice.models.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryId(Long categoryId);
    
    // Find products with available stock greater than specified amount
    List<Product> findByAvailableStockGreaterThan(int minStock);
    
    // Find products by category with available stock greater than specified amount
    List<Product> findByCategoryIdAndAvailableStockGreaterThan(Long categoryId, int minStock);
}