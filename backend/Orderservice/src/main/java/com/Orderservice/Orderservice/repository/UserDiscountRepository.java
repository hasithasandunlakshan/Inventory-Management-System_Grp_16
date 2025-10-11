package com.Orderservice.Orderservice.repository;

import com.Orderservice.Orderservice.entity.UserDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserDiscountRepository extends JpaRepository<UserDiscount, Long> {
    
    /**
     * Find all discount usage history for a user
     */
    List<UserDiscount> findByCustomerId(Long customerId);
    
    /**
     * Find discount usage history for a user, ordered by usage date
     */
    List<UserDiscount> findByCustomerIdOrderByUsedAtDesc(Long customerId);
    
    /**
     * Find all usage records for a specific discount
     */
    List<UserDiscount> findByDiscountId(Long discountId);
    
    /**
     * Find usage records for a specific discount and user
     */
    List<UserDiscount> findByDiscountIdAndCustomerId(Long discountId, Long customerId);
    
    /**
     * Find usage records for a specific discount and order
     */
    Optional<UserDiscount> findByDiscountIdAndOrderId(Long discountId, Long orderId);
    
    /**
     * Check how many times a user has used a specific discount
     */
    Long countByDiscountIdAndCustomerId(Long discountId, Long customerId);
    
    /**
     * Check total usage count for a discount
     */
    Long countByDiscountId(Long discountId);
    
    /**
     * Find recent discount usage by a user (within specified time frame)
     */
    @Query("SELECT ud FROM UserDiscount ud WHERE ud.customerId = :customerId AND " +
           "ud.usedAt >= :fromTime ORDER BY ud.usedAt DESC")
    List<UserDiscount> findRecentDiscountUsageByUser(@Param("customerId") Long customerId, 
                                                    @Param("fromTime") LocalDateTime fromTime);
    
    /**
     * Find all users who have used a specific discount
     */
    @Query("SELECT DISTINCT ud.customerId FROM UserDiscount ud WHERE ud.discount.id = :discountId")
    List<Long> findUsersWhoUsedDiscount(@Param("discountId") Long discountId);
    
    /**
     * Calculate total discount amount saved by a user
     */
    @Query("SELECT COALESCE(SUM(ud.discountAmount), 0) FROM UserDiscount ud WHERE ud.customerId = :customerId")
    Double calculateTotalSavingsByUser(@Param("customerId") Long customerId);
    
    /**
     * Calculate total discount amount given for a specific discount
     */
    @Query("SELECT COALESCE(SUM(ud.discountAmount), 0) FROM UserDiscount ud WHERE ud.discount.id = :discountId")
    Double calculateTotalDiscountGiven(@Param("discountId") Long discountId);
    
    /**
     * Find top users by discount usage amount
     */
    @Query("SELECT ud.customerId, COALESCE(SUM(ud.discountAmount), 0) as totalSavings " +
           "FROM UserDiscount ud GROUP BY ud.customerId ORDER BY totalSavings DESC")
    List<Object[]> findTopUsersBySavings();
    
    /**
     * Find most used discounts
     */
    @Query("SELECT ud.discount.id, COUNT(ud) as usageCount " +
           "FROM UserDiscount ud GROUP BY ud.discount.id ORDER BY usageCount DESC")
    List<Object[]> findMostUsedDiscounts();
    
    /**
     * Find discount usage within date range
     */
    @Query("SELECT ud FROM UserDiscount ud WHERE ud.usedAt BETWEEN :startDate AND :endDate " +
           "ORDER BY ud.usedAt DESC")
    List<UserDiscount> findDiscountUsageInDateRange(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
    
    /**
     * Check if user has used a discount in the last X hours (for rate limiting)
     */
    @Query("SELECT COUNT(ud) > 0 FROM UserDiscount ud WHERE ud.customerId = :customerId AND " +
           "ud.discount.id = :discountId AND ud.usedAt >= :timeThreshold")
    boolean hasUserUsedDiscountRecently(@Param("customerId") Long customerId,
                                       @Param("discountId") Long discountId,
                                       @Param("timeThreshold") LocalDateTime timeThreshold);
    
    /**
     * Find discount usage statistics for admin dashboard
     */
    @Query("SELECT " +
           "d.discountName, " +
           "COUNT(ud) as totalUsage, " +
           "COUNT(DISTINCT ud.customerId) as uniqueUsers, " +
           "COALESCE(SUM(ud.discountAmount), 0) as totalDiscountGiven " +
           "FROM UserDiscount ud " +
           "JOIN ud.discount d " +
           "GROUP BY d.id, d.discountName " +
           "ORDER BY totalUsage DESC")
    List<Object[]> getDiscountUsageStatistics();
    
    /**
     * Find user's discount usage within date range
     */
    @Query("SELECT ud FROM UserDiscount ud WHERE ud.customerId = :customerId AND " +
           "ud.usedAt BETWEEN :startDate AND :endDate ORDER BY ud.usedAt DESC")
    List<UserDiscount> findUserDiscountUsageInDateRange(@Param("customerId") Long customerId,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);
}