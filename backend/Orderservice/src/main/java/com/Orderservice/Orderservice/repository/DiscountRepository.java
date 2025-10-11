package com.Orderservice.Orderservice.repository;

import com.Orderservice.Orderservice.entity.Discount;
import com.Orderservice.Orderservice.enums.DiscountStatus;
import com.Orderservice.Orderservice.enums.DiscountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {
    
    /**
     * Find all active discounts that are currently valid
     */
    @Query("SELECT d FROM Discount d WHERE d.status = :status AND " +
           "(d.validFrom IS NULL OR d.validFrom <= :currentTime) AND " +
           "(d.validTo IS NULL OR d.validTo >= :currentTime)")
    List<Discount> findActiveDiscountsAtTime(@Param("status") DiscountStatus status, 
                                           @Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find active discounts of a specific type
     */
    @Query("SELECT d FROM Discount d WHERE d.status = :status AND d.type = :type AND " +
           "(d.validFrom IS NULL OR d.validFrom <= :currentTime) AND " +
           "(d.validTo IS NULL OR d.validTo >= :currentTime)")
    List<Discount> findActiveDiscountsByType(@Param("status") DiscountStatus status,
                                           @Param("type") DiscountType type,
                                           @Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find discount by code (for user application)
     */
    Optional<Discount> findByDiscountCode(String discountCode);
    
    /**
     * Find active discount by code
     */
    @Query("SELECT d FROM Discount d WHERE d.discountCode = :code AND d.status = :status AND " +
           "(d.validFrom IS NULL OR d.validFrom <= :currentTime) AND " +
           "(d.validTo IS NULL OR d.validTo >= :currentTime)")
    Optional<Discount> findActiveDiscountByCode(@Param("code") String discountCode,
                                              @Param("status") DiscountStatus status,
                                              @Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find all discounts by status
     */
    List<Discount> findByStatus(DiscountStatus status);
    
    /**
     * Find all discounts by type
     */
    List<Discount> findByType(DiscountType type);
    
    /**
     * Find discounts created by a specific admin
     */
    List<Discount> findByCreatedBy(String createdBy);
    
    /**
     * Find discounts that are expiring soon (within specified hours)
     */
    @Query("SELECT d FROM Discount d WHERE d.status = :status AND " +
           "d.validTo IS NOT NULL AND d.validTo BETWEEN :currentTime AND :futureTime")
    List<Discount> findExpiringSoon(@Param("status") DiscountStatus status,
                                  @Param("currentTime") LocalDateTime currentTime,
                                  @Param("futureTime") LocalDateTime futureTime);
    
    /**
     * Count total usage of a discount
     */
    @Query("SELECT COUNT(ud) FROM UserDiscount ud WHERE ud.discount.id = :discountId")
    Long countDiscountUsage(@Param("discountId") Long discountId);
    
    /**
     * Check if discount code already exists (for unique validation)
     */
    boolean existsByDiscountCode(String discountCode);
    
    /**
     * Find discounts that need status update (expired or exhausted)
     */
    @Query("SELECT d FROM Discount d WHERE " +
           "(d.status = 'ACTIVE' AND d.validTo IS NOT NULL AND d.validTo < :currentTime) OR " +
           "(d.status = 'ACTIVE' AND d.maxUsage IS NOT NULL AND " +
           "(SELECT COUNT(ud) FROM UserDiscount ud WHERE ud.discount.id = d.id) >= d.maxUsage)")
    List<Discount> findDiscountsNeedingStatusUpdate(@Param("currentTime") LocalDateTime currentTime);
}