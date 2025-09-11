package com.example.productservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.productservice.models.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Find products with available stock greater than specified amount
    List<Product> findByAvailableStockGreaterThan(int minStock);

    // Find product by barcode
    Optional<Product> findByBarcode(String barcode);

    // Custom query to get products with their category information
    @Query("SELECT p FROM Product p " +
           "LEFT JOIN ProductCategory pc ON p.id = pc.productId " +
           "LEFT JOIN Category c ON pc.categoryId = c.id " +
           "WHERE (:categoryId IS NULL OR c.id = :categoryId)")
    List<Product> findProductsWithCategories(@Param("categoryId") Long categoryId);
}