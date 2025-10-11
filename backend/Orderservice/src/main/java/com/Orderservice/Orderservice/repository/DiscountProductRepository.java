package com.Orderservice.Orderservice.repository;

import com.Orderservice.Orderservice.entity.DiscountProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountProductRepository extends JpaRepository<DiscountProduct, Long> {
    
    /**
     * Find all product mappings for a specific discount
     */
    List<DiscountProduct> findByDiscountId(Long discountId);
    
    /**
     * Find all active discounts for a specific product by product ID
     */
    @Query("SELECT dp FROM DiscountProduct dp " +
           "JOIN dp.discount d " +
           "WHERE dp.productId = :productId AND d.status = 'ACTIVE' AND " +
           "(d.validFrom IS NULL OR d.validFrom <= CURRENT_TIMESTAMP) AND " +
           "(d.validTo IS NULL OR d.validTo >= CURRENT_TIMESTAMP)")
    List<DiscountProduct> findActiveDiscountsForProduct(@Param("productId") Long productId);
    
    /**
     * Find all active discounts for a specific product by barcode
     */
    @Query("SELECT dp FROM DiscountProduct dp " +
           "JOIN dp.discount d " +
           "WHERE dp.productBarcode = :barcode AND d.status = 'ACTIVE' AND " +
           "(d.validFrom IS NULL OR d.validFrom <= CURRENT_TIMESTAMP) AND " +
           "(d.validTo IS NULL OR d.validTo >= CURRENT_TIMESTAMP)")
    List<DiscountProduct> findActiveDiscountsForProductByBarcode(@Param("barcode") String barcode);
    
    /**
     * Find all active discounts for multiple products by product IDs
     */
    @Query("SELECT dp FROM DiscountProduct dp " +
           "JOIN dp.discount d " +
           "WHERE dp.productId IN :productIds AND d.status = 'ACTIVE' AND " +
           "(d.validFrom IS NULL OR d.validFrom <= CURRENT_TIMESTAMP) AND " +
           "(d.validTo IS NULL OR d.validTo >= CURRENT_TIMESTAMP)")
    List<DiscountProduct> findActiveDiscountsForProducts(@Param("productIds") List<Long> productIds);
    
    /**
     * Find all active discounts for multiple products by barcodes
     */
    @Query("SELECT dp FROM DiscountProduct dp " +
           "JOIN dp.discount d " +
           "WHERE dp.productBarcode IN :barcodes AND d.status = 'ACTIVE' AND " +
           "(d.validFrom IS NULL OR d.validFrom <= CURRENT_TIMESTAMP) AND " +
           "(d.validTo IS NULL OR d.validTo >= CURRENT_TIMESTAMP)")
    List<DiscountProduct> findActiveDiscountsForProductsByBarcodes(@Param("barcodes") List<String> barcodes);
    
    /**
     * Find product mappings by product ID
     */
    List<DiscountProduct> findByProductId(Long productId);
    
    /**
     * Find product mappings by barcode
     */
    List<DiscountProduct> findByProductBarcode(String barcode);
    
    /**
     * Find specific discount-product mapping
     */
    Optional<DiscountProduct> findByDiscountIdAndProductId(Long discountId, Long productId);
    
    /**
     * Find specific discount-product mapping by barcode
     */
    Optional<DiscountProduct> findByDiscountIdAndProductBarcode(Long discountId, String barcode);
    
    /**
     * Check if a product is already mapped to a discount
     */
    boolean existsByDiscountIdAndProductId(Long discountId, Long productId);
    
    /**
     * Check if a product (by barcode) is already mapped to a discount
     */
    boolean existsByDiscountIdAndProductBarcode(Long discountId, String barcode);
    
    /**
     * Delete all product mappings for a discount
     */
    void deleteByDiscountId(Long discountId);
    
    /**
     * Count products mapped to a discount
     */
    Long countByDiscountId(Long discountId);
    
    /**
     * Find all discounts that apply to a specific product (includes both ID and barcode matching)
     */
    @Query("SELECT dp FROM DiscountProduct dp " +
           "JOIN dp.discount d " +
           "WHERE (dp.productId = :productId OR dp.productBarcode = :barcode) AND " +
           "d.status = 'ACTIVE' AND " +
           "(d.validFrom IS NULL OR d.validFrom <= CURRENT_TIMESTAMP) AND " +
           "(d.validTo IS NULL OR d.validTo >= CURRENT_TIMESTAMP)")
    List<DiscountProduct> findActiveDiscountsForProductByIdOrBarcode(@Param("productId") Long productId, 
                                                                   @Param("barcode") String barcode);
}