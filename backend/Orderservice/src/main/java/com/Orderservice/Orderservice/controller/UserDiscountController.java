package com.Orderservice.Orderservice.controller;

import com.Orderservice.Orderservice.dto.*;
import com.Orderservice.Orderservice.entity.Discount;
import com.Orderservice.Orderservice.entity.DiscountProduct;
import com.Orderservice.Orderservice.entity.UserDiscount;
import com.Orderservice.Orderservice.enums.DiscountType;
import com.Orderservice.Orderservice.repository.DiscountProductRepository;
import com.Orderservice.Orderservice.service.DiscountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/discounts")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserDiscountController {

    private static final Logger logger = LoggerFactory.getLogger(UserDiscountController.class);

    @Autowired
    private DiscountService discountService;

    @Autowired
    private DiscountProductRepository discountProductRepository;

    /**
     * Get all active discounts available to users
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveDiscounts(@RequestParam(required = false) DiscountType type) {
        try {
            List<Discount> discounts;

            if (type != null) {
                discounts = discountService.getActiveDiscountsByType(type);
            } else {
                discounts = discountService.getActiveDiscounts();
            }

            List<DiscountResponse> response = discounts.stream()
                    .map(this::convertToUserDiscountResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching active discounts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch active discounts: " + e.getMessage());
        }
    }

    /**
     * Get active bill discounts (for order-level discounts)
     */
    @GetMapping("/active/bill-discounts")
    public ResponseEntity<?> getActiveBillDiscounts() {
        try {
            List<Discount> billDiscounts = discountService.getActiveDiscountsByType(DiscountType.BILL_DISCOUNT);

            List<DiscountResponse> response = billDiscounts.stream()
                    .map(this::convertToUserDiscountResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching active bill discounts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch active bill discounts: " + e.getMessage());
        }
    }

    /**
     * Get active product discounts for specific products
     */
    @GetMapping("/active/product-discounts")
    public ResponseEntity<?> getActiveProductDiscounts(@RequestParam(required = false) List<Long> productIds,
            @RequestParam(required = false) List<String> productBarcodes) {
        try {
            List<DiscountProduct> discountProducts;

            if (productIds != null && !productIds.isEmpty()) {
                discountProducts = discountProductRepository.findActiveDiscountsForProducts(productIds);
            } else if (productBarcodes != null && !productBarcodes.isEmpty()) {
                discountProducts = discountProductRepository.findActiveDiscountsForProductsByBarcodes(productBarcodes);
            } else {
                // Return all active product discounts
                List<Discount> productDiscounts = discountService
                        .getActiveDiscountsByType(DiscountType.PRODUCT_DISCOUNT);
                List<DiscountResponse> response = productDiscounts.stream()
                        .map(this::convertToUserDiscountResponse)
                        .collect(Collectors.toList());
                return ResponseEntity.ok(response);
            }

            List<DiscountResponse> response = discountProducts.stream()
                    .map(dp -> convertToUserDiscountResponse(dp.getDiscount()))
                    .distinct()
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching active product discounts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch active product discounts: " + e.getMessage());
        }
    }

    /**
     * Validate discount code and calculate discount amount
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateAndCalculateDiscount(@RequestBody ApplyDiscountRequest request) {
        try {
            logger.info("Validating discount code: {} for user: {}", request.getDiscountCode(), request.getUserId());

            // Find the discount by code
            Optional<Discount> discountOpt = discountService.findActiveDiscountByCode(request.getDiscountCode());
            if (!discountOpt.isPresent()) {
                return ResponseEntity.ok(DiscountCalculationResponse.failure("Invalid or expired discount code"));
            }

            Discount discount = discountOpt.get();

            // Check if user can use this discount
            boolean canUse = discountService.canUserUseDiscount(discount.getId(), request.getUserId(),
                    request.getOrderAmount());
            if (!canUse) {
                return ResponseEntity
                        .ok(DiscountCalculationResponse.failure("You are not eligible to use this discount"));
            }

            // For product discounts, check if any cart products are eligible
            if (discount.getType() == DiscountType.PRODUCT_DISCOUNT) {
                boolean hasEligibleProducts = checkProductEligibility(discount.getId(), request.getProductIds(),
                        request.getProductBarcodes());
                if (!hasEligibleProducts) {
                    return ResponseEntity
                            .ok(DiscountCalculationResponse.failure("No eligible products in cart for this discount"));
                }
            }

            // Calculate discount amount
            Double discountAmount = discountService.calculateDiscountAmount(discount, request.getOrderAmount());

            DiscountCalculationResponse response = DiscountCalculationResponse.success(
                    request.getOrderAmount(),
                    discountAmount,
                    discount.getDiscountCode(),
                    discount.getDiscountName(),
                    discount.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error validating discount: {}", e.getMessage());
            return ResponseEntity
                    .ok(DiscountCalculationResponse.failure("Error validating discount: " + e.getMessage()));
        }
    }

    /**
     * Apply a discount to an order or validate for pre-order calculation
     * If orderId is provided, actually applies the discount and records usage
     * If orderId is null/empty, performs validation and returns discount
     * calculation without recording usage
     */
    @PostMapping("/apply")
    public ResponseEntity<?> applyDiscount(@RequestBody ApplyDiscountRequest request) {
        try {
            boolean isValidationOnly = (request.getOrderId() == null);

            if (isValidationOnly) {
                logger.info("Validating discount code: {} for user: {} (pre-order calculation)",
                        request.getDiscountCode(), request.getUserId());
            } else {
                logger.info("Applying discount code: {} for user: {} on order: {}",
                        request.getDiscountCode(), request.getUserId(), request.getOrderId());
            }

            // Find the discount by code
            Optional<Discount> discountOpt = discountService.findActiveDiscountByCode(request.getDiscountCode());
            if (!discountOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Invalid or expired discount code");
            }

            Discount discount = discountOpt.get();

            // Check if user can use this discount
            boolean canUse = discountService.canUserUseDiscount(discount.getId(), request.getUserId(),
                    request.getOrderAmount());
            if (!canUse) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("You are not eligible to use this discount");
            }

            // For product discounts, check if any cart products are eligible
            if (discount.getType() == DiscountType.PRODUCT_DISCOUNT) {
                boolean hasEligibleProducts = checkProductEligibility(discount.getId(), request.getProductIds(),
                        request.getProductBarcodes());
                if (!hasEligibleProducts) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("No eligible products in cart for this discount");
                }
            }

            // Calculate discount amount
            Double discountAmount = discountService.calculateDiscountAmount(discount, request.getOrderAmount());

            // ALWAYS record usage in database (both validation-only and apply modes)
            UserDiscount userDiscount = discountService.applyDiscountToOrder(
                    discount.getId(),
                    request.getUserId(),
                    request.getOrderId(), // Can be null for validation-only mode
                    request.getOrderAmount(),
                    discountAmount);

            if (isValidationOnly) {
                logger.info(
                        "Discount usage recorded (validation mode). Code: {}, Amount: {}, User: {}, UserDiscountId: {}",
                        request.getDiscountCode(), discountAmount, request.getUserId(), userDiscount.getId());
            } else {
                logger.info(
                        "Discount usage recorded (apply mode). Code: {}, Amount: {}, User: {}, Order: {}, UserDiscountId: {}",
                        request.getDiscountCode(), discountAmount, request.getUserId(), request.getOrderId(),
                        userDiscount.getId());
            }

            DiscountCalculationResponse response = DiscountCalculationResponse.success(
                    request.getOrderAmount(),
                    discountAmount,
                    discount.getDiscountCode(),
                    discount.getDiscountName(),
                    discount.getId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error applying discount: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to apply discount: " + e.getMessage());
        }
    }

    /**
     * Get user's discount usage history
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getUserDiscountHistory(@PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<UserDiscount> userDiscounts = discountService.getUserDiscountHistory(userId);

            // Simple pagination
            int start = page * size;
            int end = Math.min(start + size, userDiscounts.size());
            List<UserDiscount> paginatedDiscounts = userDiscounts.subList(start, end);

            List<UserDiscountHistoryResponse> response = paginatedDiscounts.stream()
                    .map(this::convertToUserDiscountHistoryResponse)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching user discount history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch discount history: " + e.getMessage());
        }
    }

    /**
     * Get user's total savings from discounts
     */
    @GetMapping("/savings/{userId}")
    public ResponseEntity<?> getUserTotalSavings(@PathVariable Long userId) {
        try {
            List<UserDiscount> userDiscounts = discountService.getUserDiscountHistory(userId);

            Double totalSavings = userDiscounts.stream()
                    .mapToDouble(ud -> ud.getDiscountAmount().doubleValue())
                    .sum();

            Long totalDiscountsUsed = (long) userDiscounts.size();

            return ResponseEntity.ok(new UserSavingsResponse(totalSavings, totalDiscountsUsed));
        } catch (Exception e) {
            logger.error("Error calculating user savings: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to calculate savings: " + e.getMessage());
        }
    }

    /**
     * Check if user can use a specific discount
     */
    @GetMapping("/eligibility/{discountId}/{userId}")
    public ResponseEntity<?> checkDiscountEligibility(@PathVariable Long discountId,
            @PathVariable Long userId,
            @RequestParam Double orderAmount) {
        try {
            boolean canUse = discountService.canUserUseDiscount(discountId, userId, orderAmount);

            if (canUse) {
                return ResponseEntity
                        .ok(new DiscountEligibilityResponse(true, "You are eligible to use this discount"));
            } else {
                return ResponseEntity
                        .ok(new DiscountEligibilityResponse(false, "You are not eligible to use this discount"));
            }
        } catch (Exception e) {
            logger.error("Error checking discount eligibility: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to check eligibility: " + e.getMessage());
        }
    }

    // Helper methods

    private boolean checkProductEligibility(Long discountId, List<Long> productIds, List<String> productBarcodes) {
        List<DiscountProduct> discountProducts = discountProductRepository.findByDiscountId(discountId);

        if (discountProducts.isEmpty()) {
            // If no specific products are mapped, discount applies to all products
            return true;
        }

        // Check if any cart products match the discount products
        if (productIds != null) {
            for (Long productId : productIds) {
                if (discountProducts.stream().anyMatch(dp -> productId.equals(dp.getProductId()))) {
                    return true;
                }
            }
        }

        if (productBarcodes != null) {
            for (String barcode : productBarcodes) {
                if (discountProducts.stream().anyMatch(dp -> barcode.equals(dp.getProductBarcode()))) {
                    return true;
                }
            }
        }

        return false;
    }

    private DiscountResponse convertToUserDiscountResponse(Discount discount) {
        // For user-facing responses, don't include sensitive admin information
        return DiscountResponse.builder()
                .id(discount.getId())
                .discountName(discount.getDiscountName())
                .discountCode(discount.getDiscountCode())
                .description(discount.getDescription())
                .type(discount.getType())
                .discountValue(discount.getDiscountValue() != null ? discount.getDiscountValue().doubleValue() : null)
                .isPercentage(discount.getIsPercentage())
                .minOrderAmount(
                        discount.getMinOrderAmount() != null ? discount.getMinOrderAmount().doubleValue() : null)
                .maxDiscountAmount(
                        discount.getMaxDiscountAmount() != null ? discount.getMaxDiscountAmount().doubleValue() : null)
                .validFrom(discount.getValidFrom())
                .validTo(discount.getValidTo())
                .maxUsagePerUser(discount.getMaxUsagePerUser())
                .status(discount.getStatus())
                .build();
    }

    private UserDiscountHistoryResponse convertToUserDiscountHistoryResponse(UserDiscount userDiscount) {
        return UserDiscountHistoryResponse.builder()
                .id(userDiscount.getId())
                .discountName(userDiscount.getDiscount().getDiscountName())
                .discountCode(userDiscount.getDiscount().getDiscountCode())
                .orderId(userDiscount.getOrderId())
                .originalAmount(
                        userDiscount.getOriginalAmount() != null ? userDiscount.getOriginalAmount().doubleValue()
                                : null)
                .discountAmount(
                        userDiscount.getDiscountAmount() != null ? userDiscount.getDiscountAmount().doubleValue()
                                : null)
                .finalAmount(userDiscount.getFinalAmount() != null ? userDiscount.getFinalAmount().doubleValue() : null)
                .usedAt(userDiscount.getUsedAt())
                .discountType(userDiscount.getDiscount().getType().toString())
                .discountValue(userDiscount.getDiscount().getDiscountValue() != null
                        ? userDiscount.getDiscount().getDiscountValue().doubleValue()
                        : null)
                .wasPercentage(userDiscount.getDiscount().getIsPercentage())
                .build();
    }

    // Response DTOs for specific endpoints

    public static class UserSavingsResponse {
        private Double totalSavings;
        private Long totalDiscountsUsed;

        public UserSavingsResponse(Double totalSavings, Long totalDiscountsUsed) {
            this.totalSavings = totalSavings;
            this.totalDiscountsUsed = totalDiscountsUsed;
        }

        // Getters
        public Double getTotalSavings() {
            return totalSavings;
        }

        public Long getTotalDiscountsUsed() {
            return totalDiscountsUsed;
        }
    }

    public static class DiscountEligibilityResponse {
        private Boolean eligible;
        private String message;

        public DiscountEligibilityResponse(Boolean eligible, String message) {
            this.eligible = eligible;
            this.message = message;
        }

        // Getters
        public Boolean getEligible() {
            return eligible;
        }

        public String getMessage() {
            return message;
        }
    }

    /**
     * Get products eligible for a specific discount (user view)
     */
    @GetMapping("/{discountCode}/eligible-products")
    public ResponseEntity<?> getEligibleProducts(@PathVariable String discountCode) {
        try {
            logger.info("Getting eligible products for discount code: {}", discountCode);

            // Find discount by code
            Optional<Discount> discountOpt = discountService.findActiveDiscountByCode(discountCode);
            if (!discountOpt.isPresent()) {
                return ResponseEntity.badRequest().body("Invalid discount code");
            }

            Discount discount = discountOpt.get();

            Map<String, Object> response = new HashMap<>();
            response.put("discountCode", discountCode);
            response.put("discountName", discount.getDiscountName());
            response.put("discountValue", discount.getDiscountValue().doubleValue());
            response.put("isPercentage", discount.getIsPercentage());

            if (discount.getType() != DiscountType.PRODUCT_DISCOUNT) {
                response.put("type", "BILL_DISCOUNT");
                response.put("message", "This discount applies to your entire order");
                response.put("eligibleProducts", new ArrayList<>());
                return ResponseEntity.ok(response);
            }

            // Get eligible products for product-specific discount
            List<DiscountProduct> discountProducts = discountProductRepository.findByDiscountId(discount.getId());

            List<Map<String, Object>> eligibleProducts = discountProducts.stream()
                    .map(dp -> {
                        Map<String, Object> productInfo = new HashMap<>();
                        productInfo.put("productId", dp.getProductId());
                        productInfo.put("productBarcode", dp.getProductBarcode());
                        return productInfo;
                    })
                    .collect(Collectors.toList());

            response.put("type", "PRODUCT_DISCOUNT");
            response.put("message",
                    String.format("This discount applies to %d specific products", eligibleProducts.size()));
            response.put("eligibleProducts", eligibleProducts);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error fetching eligible products: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Error fetching eligible products: " + e.getMessage());
        }
    }
}