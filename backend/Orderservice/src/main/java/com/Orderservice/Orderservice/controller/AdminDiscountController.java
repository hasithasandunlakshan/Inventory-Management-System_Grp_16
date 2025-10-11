package com.Orderservice.Orderservice.controller;

import com.Orderservice.Orderservice.dto.*;
import com.Orderservice.Orderservice.entity.Discount;
import com.Orderservice.Orderservice.entity.DiscountProduct;
import com.Orderservice.Orderservice.enums.DiscountStatus;
import com.Orderservice.Orderservice.repository.DiscountProductRepository;
import com.Orderservice.Orderservice.repository.UserDiscountRepository;
import com.Orderservice.Orderservice.service.DiscountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/discounts")
@CrossOrigin(origins = "*")
public class AdminDiscountController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminDiscountController.class);
    
    @Autowired
    private DiscountService discountService;
    
    @Autowired
    private DiscountProductRepository discountProductRepository;
    
    @Autowired
    private UserDiscountRepository userDiscountRepository;
    
    /**
     * Create a new discount
     */
    @PostMapping("/create")
    public ResponseEntity<?> createDiscount(@RequestBody CreateDiscountRequest request,
                                           @RequestHeader(value = "Admin-User-Id", defaultValue = "admin") String adminUserId) {
        try {
            logger.info("Creating discount: {} by admin: {}", request.getDiscountCode(), adminUserId);
            
            // Convert DTO to entity
            Discount discount = Discount.builder()
                    .discountName(request.getDiscountName())
                    .discountCode(request.getDiscountCode())
                    .description(request.getDescription())
                    .type(request.getType())
                    .discountValue(request.getDiscountValue() != null ? BigDecimal.valueOf(request.getDiscountValue()) : null)
                    .isPercentage(request.getIsPercentage())
                    .minOrderAmount(request.getMinOrderAmount() != null ? BigDecimal.valueOf(request.getMinOrderAmount()) : null)
                    .maxDiscountAmount(request.getMaxDiscountAmount() != null ? BigDecimal.valueOf(request.getMaxDiscountAmount()) : null)
                    .validFrom(request.getValidFrom())
                    .validTo(request.getValidTo())
                    .maxUsage(request.getMaxUsage())
                    .maxUsagePerUser(request.getMaxUsagePerUser())
                    .build();
            
            Discount createdDiscount = discountService.createDiscount(discount, adminUserId);
            
            // Add products if specified for product discounts
            if (request.getProductIds() != null || request.getProductBarcodes() != null) {
                discountService.addProductsToDiscount(createdDiscount.getId(), 
                                                    request.getProductIds(), 
                                                    request.getProductBarcodes());
            }
            
            DiscountResponse response = convertToDiscountResponse(createdDiscount);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Error creating discount: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to create discount: " + e.getMessage());
        }
    }
    
    /**
     * Update an existing discount
     */
    @PutMapping("/{discountId}")
    public ResponseEntity<?> updateDiscount(@PathVariable Long discountId,
                                           @RequestBody UpdateDiscountRequest request,
                                           @RequestHeader(value = "Admin-User-Id", defaultValue = "admin") String adminUserId) {
        try {
            logger.info("Updating discount: {} by admin: {}", discountId, adminUserId);
            
            Optional<Discount> existingDiscountOpt = discountService.getDiscountById(discountId);
            if (!existingDiscountOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Discount not found with ID: " + discountId);
            }
            
            Discount existingDiscount = existingDiscountOpt.get();
            
            // Update only non-null fields
            if (request.getDiscountName() != null) {
                existingDiscount.setDiscountName(request.getDiscountName());
            }
            if (request.getDiscountCode() != null) {
                existingDiscount.setDiscountCode(request.getDiscountCode());
            }
            if (request.getDescription() != null) {
                existingDiscount.setDescription(request.getDescription());
            }
            if (request.getType() != null) {
                existingDiscount.setType(request.getType());
            }
            if (request.getDiscountValue() != null) {
                existingDiscount.setDiscountValue(BigDecimal.valueOf(request.getDiscountValue()));
            }
            if (request.getIsPercentage() != null) {
                existingDiscount.setIsPercentage(request.getIsPercentage());
            }
            if (request.getMinOrderAmount() != null) {
                existingDiscount.setMinOrderAmount(BigDecimal.valueOf(request.getMinOrderAmount()));
            }
            if (request.getMaxDiscountAmount() != null) {
                existingDiscount.setMaxDiscountAmount(BigDecimal.valueOf(request.getMaxDiscountAmount()));
            }
            if (request.getValidFrom() != null) {
                existingDiscount.setValidFrom(request.getValidFrom());
            }
            if (request.getValidTo() != null) {
                existingDiscount.setValidTo(request.getValidTo());
            }
            if (request.getMaxUsage() != null) {
                existingDiscount.setMaxUsage(request.getMaxUsage());
            }
            if (request.getMaxUsagePerUser() != null) {
                existingDiscount.setMaxUsagePerUser(request.getMaxUsagePerUser());
            }
            
            Discount updatedDiscount = discountService.updateDiscount(discountId, existingDiscount, adminUserId);
            DiscountResponse response = convertToDiscountResponse(updatedDiscount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating discount: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to update discount: " + e.getMessage());
        }
    }
    
    /**
     * Get all discounts with pagination
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllDiscounts(@RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size,
                                            @RequestParam(required = false) DiscountStatus status) {
        try {
            List<Discount> discounts;
            
            if (status != null) {
                discounts = discountService.getAllDiscounts().stream()
                        .filter(d -> d.getStatus().equals(status))
                        .collect(Collectors.toList());
            } else {
                discounts = discountService.getAllDiscounts();
            }
            
            // Convert to response DTOs
            List<DiscountResponse> discountResponses = discounts.stream()
                    .map(this::convertToDiscountResponse)
                    .collect(Collectors.toList());
            
            // Simple pagination (for production, use Spring Data's Pageable)
            int start = page * size;
            int end = Math.min(start + size, discountResponses.size());
            List<DiscountResponse> paginatedDiscounts = discountResponses.subList(start, end);
            
            AllDiscountsResponse.PaginationInfo pagination = AllDiscountsResponse.PaginationInfo.builder()
                    .currentPage(page)
                    .pageSize(size)
                    .totalElements(discountResponses.size())
                    .totalPages((int) Math.ceil((double) discountResponses.size() / size))
                    .hasNext(end < discountResponses.size())
                    .hasPrevious(page > 0)
                    .build();
            
            AllDiscountsResponse response = AllDiscountsResponse.builder()
                    .discounts(paginatedDiscounts)
                    .pagination(pagination)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching discounts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch discounts: " + e.getMessage());
        }
    }
    
    /**
     * Get a specific discount by ID
     */
    @GetMapping("/{discountId}")
    public ResponseEntity<?> getDiscountById(@PathVariable Long discountId) {
        try {
            Optional<Discount> discountOpt = discountService.getDiscountById(discountId);
            if (!discountOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Discount not found with ID: " + discountId);
            }
            
            DiscountResponse response = convertToDiscountResponse(discountOpt.get());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching discount: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch discount: " + e.getMessage());
        }
    }
    
    /**
     * Update discount status (activate/deactivate/expire)
     */
    @PatchMapping("/{discountId}/status")
    public ResponseEntity<?> updateDiscountStatus(@PathVariable Long discountId,
                                                 @RequestParam DiscountStatus status,
                                                 @RequestHeader(value = "Admin-User-Id", defaultValue = "admin") String adminUserId) {
        try {
            logger.info("Updating discount {} status to {} by admin: {}", discountId, status, adminUserId);
            
            discountService.updateDiscountStatus(discountId, status, adminUserId);
            
            Optional<Discount> updatedDiscountOpt = discountService.getDiscountById(discountId);
            if (updatedDiscountOpt.isPresent()) {
                DiscountResponse response = convertToDiscountResponse(updatedDiscountOpt.get());
                return ResponseEntity.ok(response);
            }
            
            return ResponseEntity.ok("Discount status updated successfully");
        } catch (Exception e) {
            logger.error("Error updating discount status: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to update discount status: " + e.getMessage());
        }
    }
    
    /**
     * Add products to a discount
     */
    @PostMapping("/{discountId}/products")
    public ResponseEntity<?> addProductsToDiscount(@PathVariable Long discountId,
                                                  @RequestBody AddProductsToDiscountRequest request) {
        try {
            if (!request.isValid()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("At least one product ID or barcode must be provided");
            }
            
            logger.info("Adding products to discount: {}", discountId);
            
            discountService.addProductsToDiscount(discountId, request.getProductIds(), request.getProductBarcodes());
            
            return ResponseEntity.ok("Products added to discount successfully");
        } catch (Exception e) {
            logger.error("Error adding products to discount: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to add products to discount: " + e.getMessage());
        }
    }
    
    /**
     * Remove products from a discount
     */
    @DeleteMapping("/{discountId}/products")
    public ResponseEntity<?> removeProductsFromDiscount(@PathVariable Long discountId,
                                                       @RequestBody AddProductsToDiscountRequest request) {
        try {
            if (!request.isValid()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("At least one product ID or barcode must be provided");
            }
            
            logger.info("Removing products from discount: {}", discountId);
            
            discountService.removeProductsFromDiscount(discountId, request.getProductIds(), request.getProductBarcodes());
            
            return ResponseEntity.ok("Products removed from discount successfully");
        } catch (Exception e) {
            logger.error("Error removing products from discount: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to remove products from discount: " + e.getMessage());
        }
    }
    
    /**
     * Delete a discount
     */
    @DeleteMapping("/{discountId}")
    public ResponseEntity<?> deleteDiscount(@PathVariable Long discountId,
                                           @RequestHeader(value = "Admin-User-Id", defaultValue = "admin") String adminUserId) {
        try {
            logger.info("Deleting discount: {} by admin: {}", discountId, adminUserId);
            
            // Instead of hard delete, set status to INACTIVE
            discountService.updateDiscountStatus(discountId, DiscountStatus.INACTIVE, adminUserId);
            
            return ResponseEntity.ok("Discount deleted successfully");
        } catch (Exception e) {
            logger.error("Error deleting discount: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to delete discount: " + e.getMessage());
        }
    }
    
    /**
     * Get discount usage statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getDiscountUsageStatistics() {
        try {
            List<Object[]> stats = discountService.getDiscountUsageStatistics();
            
            List<DiscountUsageStatsResponse> response = stats.stream()
                    .map(stat -> DiscountUsageStatsResponse.builder()
                            .discountName((String) stat[0])
                            .totalUsage((Long) stat[1])
                            .uniqueUsers((Long) stat[2])
                            .totalDiscountGiven((Double) stat[3])
                            .averageDiscountPerUse(
                                    ((Long) stat[1]) > 0 ? 
                                    ((Double) stat[3]) / ((Long) stat[1]) : 0.0)
                            .build())
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching discount statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch discount statistics: " + e.getMessage());
        }
    }
    
    /**
     * Update expired discount statuses (maintenance endpoint)
     */
    @PostMapping("/maintenance/update-expired")
    public ResponseEntity<?> updateExpiredDiscounts(@RequestHeader(value = "Admin-User-Id", defaultValue = "admin") String adminUserId) {
        try {
            logger.info("Updating expired discount statuses by admin: {}", adminUserId);
            
            discountService.updateExpiredDiscountStatuses();
            
            return ResponseEntity.ok("Expired discount statuses updated successfully");
        } catch (Exception e) {
            logger.error("Error updating expired discounts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update expired discounts: " + e.getMessage());
        }
    }
    
    // Helper method to convert entity to response DTO
    private DiscountResponse convertToDiscountResponse(Discount discount) {
        // Get associated products
        List<DiscountProduct> associatedProducts = discountProductRepository.findByDiscountId(discount.getId());
        List<DiscountResponse.DiscountProductInfo> productInfos = associatedProducts.stream()
                .map(dp -> DiscountResponse.DiscountProductInfo.builder()
                        .productId(dp.getProductId())
                        .productBarcode(dp.getProductBarcode())
                        .build())
                .collect(Collectors.toList());
        
        // Get usage statistics
        Long totalUsage = userDiscountRepository.countByDiscountId(discount.getId());
        List<Long> uniqueUsers = userDiscountRepository.findUsersWhoUsedDiscount(discount.getId());
        Double totalDiscountGiven = userDiscountRepository.calculateTotalDiscountGiven(discount.getId());
        
        return DiscountResponse.builder()
                .id(discount.getId())
                .discountName(discount.getDiscountName())
                .discountCode(discount.getDiscountCode())
                .description(discount.getDescription())
                .type(discount.getType())
                .discountValue(discount.getDiscountValue() != null ? discount.getDiscountValue().doubleValue() : null)
                .isPercentage(discount.getIsPercentage())
                .minOrderAmount(discount.getMinOrderAmount() != null ? discount.getMinOrderAmount().doubleValue() : null)
                .maxDiscountAmount(discount.getMaxDiscountAmount() != null ? discount.getMaxDiscountAmount().doubleValue() : null)
                .validFrom(discount.getValidFrom())
                .validTo(discount.getValidTo())
                .maxUsage(discount.getMaxUsage())
                .maxUsagePerUser(discount.getMaxUsagePerUser())
                .status(discount.getStatus())
                .createdBy(discount.getCreatedBy())
                .createdAt(discount.getCreatedAt())
                .updatedBy(discount.getUpdatedBy())
                .updatedAt(discount.getUpdatedAt())
                .lastUsedAt(discount.getLastUsedAt())
                .totalUsageCount(totalUsage)
                .uniqueUsersCount((long) uniqueUsers.size())
                .totalDiscountGiven(totalDiscountGiven != null ? totalDiscountGiven : 0.0)
                .associatedProducts(productInfos)
                .build();
    }
}