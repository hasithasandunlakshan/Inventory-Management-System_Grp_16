package com.example.productservice.repository;

import com.example.productservice.models.ProductCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCategoryRepository extends JpaRepository<ProductCategory, Long> {
    
    @Query("SELECT pc FROM ProductCategory pc WHERE pc.productId = :productId")
    List<ProductCategory> findByProductId(@Param("productId") Long productId);
    
    @Query("SELECT pc FROM ProductCategory pc WHERE pc.categoryId = :categoryId")
    List<ProductCategory> findByCategoryId(@Param("categoryId") Long categoryId);
    
    void deleteByProductId(Long productId);
    void deleteByCategoryId(Long categoryId);
}


