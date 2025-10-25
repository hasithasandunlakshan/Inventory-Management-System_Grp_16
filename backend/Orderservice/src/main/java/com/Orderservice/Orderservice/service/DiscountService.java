package com.Orderservice.Orderservice.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Orderservice.Orderservice.entity.Discount;
import com.Orderservice.Orderservice.entity.DiscountProduct;
import com.Orderservice.Orderservice.entity.UserDiscount;
import com.Orderservice.Orderservice.enums.DiscountStatus;
import com.Orderservice.Orderservice.enums.DiscountType;
import com.Orderservice.Orderservice.repository.DiscountProductRepository;
import com.Orderservice.Orderservice.repository.DiscountRepository;
import com.Orderservice.Orderservice.repository.UserDiscountRepository;

@Service
@Transactional
public class DiscountService {
    
    private static final Logger logger = LoggerFactory.getLogger(DiscountService.class);
    
    @Autowired
    private DiscountRepository discountRepository;
    
    @Autowired
    private DiscountProductRepository discountProductRepository;
    
    @Autowired
    private UserDiscountRepository userDiscountRepository;
    
    // ============== ADMIN DISCOUNT MANAGEMENT ==============
    
    /**
     * Create a new discount
     */
    public Discount createDiscount(Discount discount, String adminUserId) {
        try {
            // Validate discount code uniqueness
            if (discountRepository.existsByDiscountCode(discount.getDiscountCode())) {
                throw new RuntimeException("Discount code already exists: " + discount.getDiscountCode());
            }
            
            // Set creation metadata
            discount.setCreatedBy(adminUserId);
            discount.setCreatedAt(LocalDateTime.now());
            discount.setStatus(DiscountStatus.ACTIVE);
            
            // Validate discount logic
            validateDiscountData(discount);
            
            Discount savedDiscount = discountRepository.save(discount);
            logger.info("Created new discount: {} by admin: {}", savedDiscount.getDiscountCode(), adminUserId);
            
            return savedDiscount;
        } catch (Exception e) {
            logger.error("Error creating discount: {}", e.getMessage());
            throw new RuntimeException("Failed to create discount: " + e.getMessage());
        }
    }
    
    /**
     * Update an existing discount
     */
    public Discount updateDiscount(Long discountId, Discount updatedDiscount, String adminUserId) {
        try {
            Optional<Discount> existingDiscountOpt = discountRepository.findById(discountId);
            if (!existingDiscountOpt.isPresent()) {
                throw new RuntimeException("Discount not found with ID: " + discountId);
            }
            
            Discount existingDiscount = existingDiscountOpt.get();
            
            // Check if discount code is being changed and if new code already exists
            if (!existingDiscount.getDiscountCode().equals(updatedDiscount.getDiscountCode())) {
                if (discountRepository.existsByDiscountCode(updatedDiscount.getDiscountCode())) {
                    throw new RuntimeException("Discount code already exists: " + updatedDiscount.getDiscountCode());
                }
            }
            
            // Update fields
            existingDiscount.setDiscountName(updatedDiscount.getDiscountName());
            existingDiscount.setDiscountCode(updatedDiscount.getDiscountCode());
            existingDiscount.setDescription(updatedDiscount.getDescription());
            existingDiscount.setType(updatedDiscount.getType());
            existingDiscount.setDiscountValue(updatedDiscount.getDiscountValue());
            existingDiscount.setIsPercentage(updatedDiscount.getIsPercentage());
            existingDiscount.setMinOrderAmount(updatedDiscount.getMinOrderAmount());
            existingDiscount.setMaxDiscountAmount(updatedDiscount.getMaxDiscountAmount());
            existingDiscount.setValidFrom(updatedDiscount.getValidFrom());
            existingDiscount.setValidTo(updatedDiscount.getValidTo());
            existingDiscount.setMaxUsage(updatedDiscount.getMaxUsage());
            existingDiscount.setMaxUsagePerUser(updatedDiscount.getMaxUsagePerUser());
            existingDiscount.setUpdatedAt(LocalDateTime.now());
            existingDiscount.setUpdatedBy(adminUserId);
            
            validateDiscountData(existingDiscount);
            
            Discount savedDiscount = discountRepository.save(existingDiscount);
            logger.info("Updated discount: {} by admin: {}", savedDiscount.getDiscountCode(), adminUserId);
            
            return savedDiscount;
        } catch (Exception e) {
            logger.error("Error updating discount {}: {}", discountId, e.getMessage());
            throw new RuntimeException("Failed to update discount: " + e.getMessage());
        }
    }
    
    /**
     * Disable/Enable a discount
     */
    public void updateDiscountStatus(Long discountId, DiscountStatus status, String adminUserId) {
        try {
            Optional<Discount> discountOpt = discountRepository.findById(discountId);
            if (!discountOpt.isPresent()) {
                throw new RuntimeException("Discount not found with ID: " + discountId);
            }
            
            Discount discount = discountOpt.get();
            discount.setStatus(status);
            discount.setUpdatedAt(LocalDateTime.now());
            discount.setUpdatedBy(adminUserId);
            
            discountRepository.save(discount);
            logger.info("Updated discount {} status to {} by admin: {}", discountId, status, adminUserId);
        } catch (Exception e) {
            logger.error("Error updating discount status: {}", e.getMessage());
            throw new RuntimeException("Failed to update discount status: " + e.getMessage());
        }
    }
    
    /**
     * Add products to a discount
     */
    public void addProductsToDiscount(Long discountId, List<Long> productIds, List<String> productBarcodes) {
        try {
            Optional<Discount> discountOpt = discountRepository.findById(discountId);
            if (!discountOpt.isPresent()) {
                throw new RuntimeException("Discount not found with ID: " + discountId);
            }
            
            Discount discount = discountOpt.get();
            
            if (discount.getType() != DiscountType.PRODUCT_DISCOUNT) {
                throw new RuntimeException("Can only add products to PRODUCT_DISCOUNT type discounts");
            }
            
            // Add products by ID
            if (productIds != null) {
                for (Long productId : productIds) {
                    if (!discountProductRepository.existsByDiscountIdAndProductId(discountId, productId)) {
                        DiscountProduct discountProduct = new DiscountProduct();
                        discountProduct.setDiscount(discount);
                        discountProduct.setProductId(productId);
                        discountProductRepository.save(discountProduct);
                    }
                }
            }
            
            // Add products by barcode
            if (productBarcodes != null) {
                for (String barcode : productBarcodes) {
                    if (!discountProductRepository.existsByDiscountIdAndProductBarcode(discountId, barcode)) {
                        DiscountProduct discountProduct = new DiscountProduct();
                        discountProduct.setDiscount(discount);
                        discountProduct.setProductBarcode(barcode);
                        discountProductRepository.save(discountProduct);
                    }
                }
            }
            
            logger.info("Added products to discount {}: {} IDs, {} barcodes", 
                       discountId, 
                       productIds != null ? productIds.size() : 0,
                       productBarcodes != null ? productBarcodes.size() : 0);
        } catch (Exception e) {
            logger.error("Error adding products to discount: {}", e.getMessage());
            throw new RuntimeException("Failed to add products to discount: " + e.getMessage());
        }
    }
    
    /**
     * Remove products from a discount
     */
    public void removeProductsFromDiscount(Long discountId, List<Long> productIds, List<String> productBarcodes) {
        try {
            // Remove products by ID
            if (productIds != null) {
                for (Long productId : productIds) {
                    Optional<DiscountProduct> dpOpt = discountProductRepository.findByDiscountIdAndProductId(discountId, productId);
                    dpOpt.ifPresent(discountProductRepository::delete);
                }
            }
            
            // Remove products by barcode
            if (productBarcodes != null) {
                for (String barcode : productBarcodes) {
                    Optional<DiscountProduct> dpOpt = discountProductRepository.findByDiscountIdAndProductBarcode(discountId, barcode);
                    dpOpt.ifPresent(discountProductRepository::delete);
                }
            }
            
            logger.info("Removed products from discount {}", discountId);
        } catch (Exception e) {
            logger.error("Error removing products from discount: {}", e.getMessage());
            throw new RuntimeException("Failed to remove products from discount: " + e.getMessage());
        }
    }
    
    // ============== USER DISCOUNT APPLICATION ==============
    
    /**
     * Get all active discounts available to users
     */
    @Transactional(readOnly = true)
    public List<Discount> getActiveDiscounts() {
        try {
            return discountRepository.findActiveDiscountsAtTime(DiscountStatus.ACTIVE, LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Error fetching active discounts: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch active discounts: " + e.getMessage());
        }
    }
    
    /**
     * Get active discounts by type
     */
    @Transactional(readOnly = true)
    public List<Discount> getActiveDiscountsByType(DiscountType type) {
        try {
            return discountRepository.findActiveDiscountsByType(DiscountStatus.ACTIVE, type, LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Error fetching active discounts by type: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch active discounts: " + e.getMessage());
        }
    }
    
    /**
     * Find discount by code for user application
     */
    @Transactional(readOnly = true)
    public Optional<Discount> findActiveDiscountByCode(String discountCode) {
        try {
            return discountRepository.findActiveDiscountByCode(discountCode, DiscountStatus.ACTIVE, LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Error finding discount by code: {}", e.getMessage());
            return Optional.empty();
        }
    }
    
    /**
     * Validate if user can use a discount
     */
    public boolean canUserUseDiscount(Long discountId, Long userId, Double orderAmount) {
        try {
            Optional<Discount> discountOpt = discountRepository.findById(discountId);
            if (!discountOpt.isPresent()) {
                return false;
            }
            
            Discount discount = discountOpt.get();
            
            // Check if discount is valid and active
            if (!discount.isValid()) {
                return false;
            }
            
            // Check minimum order amount
            if (discount.getMinOrderAmount() != null && orderAmount < discount.getMinOrderAmount().doubleValue()) {
                return false;
            }
            
            // Check per-user usage limit
            if (discount.getMaxUsagePerUser() != null) {
                Long userUsageCount = userDiscountRepository.countByDiscountIdAndCustomerId(discountId, userId);
                if (userUsageCount >= discount.getMaxUsagePerUser()) {
                    return false;
                }
            }
            
            //Check total usage limit
            if (discount.getMaxUsage() != null) {
                Long totalUsageCount = userDiscountRepository.countByDiscountId(discountId);
                if (totalUsageCount >= discount.getMaxUsage()) {
                    return false;
                }
            }
            
            return true;
        } catch (Exception e) {
            logger.error("Error validating user discount usage: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Calculate discount amount for an order
     */
    public Double calculateDiscountAmount(Discount discount, Double orderAmount) {
        try {
            if (discount.getIsPercentage()) {
                Double discountAmount = (discount.getDiscountValue().doubleValue() / 100.0) * orderAmount;
                
                // Apply maximum discount limit if set
                if (discount.getMaxDiscountAmount() != null && discountAmount > discount.getMaxDiscountAmount().doubleValue()) {
                    discountAmount = discount.getMaxDiscountAmount().doubleValue();
                }
                
                return discountAmount;
            } else {
                // Fixed amount discount
                Double discountAmount = discount.getDiscountValue().doubleValue();
                
                // Don't allow discount to exceed order amount
                if (discountAmount > orderAmount) {
                    discountAmount = orderAmount;
                }
                
                return discountAmount;
            }
        } catch (Exception e) {
            logger.error("Error calculating discount amount: {}", e.getMessage());
            return 0.0;
        }
    }
    
    /**
     * Apply discount and record usage (orderId is optional - can be null)
     */
    public UserDiscount applyDiscountToOrder(Long discountId, Long userId, Long orderId, Double originalAmount, Double discountAmount) {
        try {
            Optional<Discount> discountOpt = discountRepository.findById(discountId);
            if (!discountOpt.isPresent()) {
                throw new RuntimeException("Discount not found");
            }
            
            Discount discount = discountOpt.get();
            
            // Final validation before applying
            if (!canUserUseDiscount(discountId, userId, originalAmount)) {
                throw new RuntimeException("User cannot use this discount");
            }
            
            // Record discount usage (orderId can be null)
            UserDiscount userDiscount = new UserDiscount();
            userDiscount.setDiscount(discount);
            userDiscount.setCustomerId(userId);
            userDiscount.setOrderId(orderId); // Can be null for validation-only mode
            userDiscount.setOriginalAmount(BigDecimal.valueOf(originalAmount));
            userDiscount.setDiscountAmount(BigDecimal.valueOf(discountAmount));
            userDiscount.setFinalAmount(BigDecimal.valueOf(originalAmount - discountAmount));
            userDiscount.setUsedAt(LocalDateTime.now());
            
            UserDiscount savedUserDiscount = userDiscountRepository.save(userDiscount);
            
            // Update discount usage tracking
            discount.setLastUsedAt(LocalDateTime.now());
            discountRepository.save(discount);
            
            if (orderId != null) {
                logger.info("Applied discount {} to order {} for user {}. Discount amount: {}", 
                           discountId, orderId, userId, discountAmount);
            } else {
                logger.info("Recorded discount usage {} for user {} (no order ID - validation mode). Discount amount: {}", 
                           discountId, userId, discountAmount);
            }
            
            return savedUserDiscount;
        } catch (Exception e) {
            logger.error("Error applying discount: {}", e.getMessage());
            throw new RuntimeException("Failed to apply discount: " + e.getMessage());
        }
    }
    
    // ============== QUERY METHODS ==============
    
    /**
     * Get all discounts (admin view)
     */
    @Transactional(readOnly = true)
    public List<Discount> getAllDiscounts() {
        return discountRepository.findAll();
    }
    
    /**
     * Get discount by ID
     */
    @Transactional(readOnly = true)
    public Optional<Discount> getDiscountById(Long discountId) {
        return discountRepository.findById(discountId);
    }
    
    /**
     * Get user's discount usage history
     */
    @Transactional(readOnly = true)
    public List<UserDiscount> getUserDiscountHistory(Long userId) {
        return userDiscountRepository.findByCustomerIdOrderByUsedAtDesc(userId);
    }
    
    /**
     * Get discount usage statistics
     */
    @Transactional(readOnly = true)
    public List<Object[]> getDiscountUsageStatistics() {
        return userDiscountRepository.getDiscountUsageStatistics();
    }
    
    // ============== MAINTENANCE METHODS ==============
    
    /**
     * Update expired or exhausted discount statuses
     */
    @Transactional
    public void updateExpiredDiscountStatuses() {
        try {
            List<Discount> discountsToUpdate = discountRepository.findDiscountsNeedingStatusUpdate(LocalDateTime.now());
            
            for (Discount discount : discountsToUpdate) {
                if (discount.getValidTo() != null && discount.getValidTo().isBefore(LocalDateTime.now())) {
                    discount.setStatus(DiscountStatus.EXPIRED);
                } else if (discount.getMaxUsage() != null) {
                    Long usageCount = userDiscountRepository.countByDiscountId(discount.getId());
                    if (usageCount >= discount.getMaxUsage()) {
                        discount.setStatus(DiscountStatus.EXHAUSTED);
                    }
                }
                discount.setUpdatedAt(LocalDateTime.now());
            }
            
            discountRepository.saveAll(discountsToUpdate);
            logger.info("Updated status for {} expired/exhausted discounts", discountsToUpdate.size());
        } catch (Exception e) {
            logger.error("Error updating expired discount statuses: {}", e.getMessage());
        }
    }
    
    // ============== VALIDATION METHODS ==============
    
    private void validateDiscountData(Discount discount) {
        if (discount.getDiscountName() == null || discount.getDiscountName().trim().isEmpty()) {
            throw new RuntimeException("Discount name is required");
        }
        
        if (discount.getDiscountCode() == null || discount.getDiscountCode().trim().isEmpty()) {
            throw new RuntimeException("Discount code is required");
        }
        
        if (discount.getDiscountValue() == null || discount.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Discount value must be greater than 0");
        }
        
        if (discount.getIsPercentage() && discount.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new RuntimeException("Percentage discount cannot exceed 100%");
        }
        
        if (discount.getValidFrom() != null && discount.getValidTo() != null) {
            if (discount.getValidFrom().isAfter(discount.getValidTo())) {
                throw new RuntimeException("Valid from date must be before valid to date");
            }
        }
        
        if (discount.getMaxUsage() != null && discount.getMaxUsage() <= 0) {
            throw new RuntimeException("Max usage must be greater than 0");
        }
        
        if (discount.getMaxUsagePerUser() != null && discount.getMaxUsagePerUser() <= 0) {
            throw new RuntimeException("Max usage per user must be greater than 0");
        }
    }
}