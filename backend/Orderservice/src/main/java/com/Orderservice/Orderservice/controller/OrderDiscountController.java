package com.Orderservice.Orderservice.controller;

import com.Orderservice.Orderservice.dto.ApplyDiscountRequest;
import com.Orderservice.Orderservice.dto.DiscountCalculationResponse;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.service.OrderService;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders/discounts")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class OrderDiscountController {

    private static final Logger logger = LoggerFactory.getLogger(OrderDiscountController.class);

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Apply discount to an existing order
     */
    @PostMapping("/{orderId}/apply")
    public ResponseEntity<?> applyDiscountToOrder(@PathVariable Long orderId,
            @RequestParam String discountCode,
            @RequestParam Long userId) {
        try {
            logger.info("Applying discount {} to order {} for user {}", discountCode, orderId, userId);

            Order updatedOrder = orderService.applyDiscountToOrder(orderId, discountCode, userId);

            DiscountCalculationResponse response = DiscountCalculationResponse.success(
                    updatedOrder.getOriginalAmount().doubleValue(),
                    updatedOrder.getDiscountAmount().doubleValue(),
                    updatedOrder.getDiscountCode(),
                    "Discount Applied",
                    updatedOrder.getDiscountId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error applying discount to order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(DiscountCalculationResponse.failure(e.getMessage()));
        }
    }

    /**
     * Remove discount from an order
     */
    @DeleteMapping("/{orderId}/remove")
    public ResponseEntity<?> removeDiscountFromOrder(@PathVariable Long orderId) {
        try {
            logger.info("Removing discount from order {}", orderId);

            Order updatedOrder = orderService.removeDiscountFromOrder(orderId);

            return ResponseEntity.ok("Discount removed successfully from order " + orderId);
        } catch (Exception e) {
            logger.error("Error removing discount from order: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to remove discount: " + e.getMessage());
        }
    }

    /**
     * Calculate order total with discount (for preview before applying)
     */
    @PostMapping("/{orderId}/calculate")
    public ResponseEntity<?> calculateOrderWithDiscount(@PathVariable Long orderId,
            @RequestParam String discountCode,
            @RequestParam Long userId) {
        try {
            logger.info("Calculating discount {} for order {} and user {}", discountCode, orderId, userId);

            // Get the order
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (!orderOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(DiscountCalculationResponse.failure("Order not found"));
            }

            Order order = orderOpt.get();

            // Calculate with discount
            OrderService.OrderCalculationResult calculation = orderService
                    .calculateOrderWithDiscount(order.getOrderItems(), discountCode, userId);

            if (calculation.getErrorMessage() != null) {
                return ResponseEntity.ok(DiscountCalculationResponse.failure(calculation.getErrorMessage()));
            }

            DiscountCalculationResponse response = DiscountCalculationResponse.success(
                    calculation.getOriginalAmount(),
                    calculation.getDiscountAmount(),
                    calculation.getDiscountCode(),
                    calculation.getDiscountName(),
                    calculation.getDiscountId());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error calculating discount for order: {}", e.getMessage());
            return ResponseEntity
                    .ok(DiscountCalculationResponse.failure("Error calculating discount: " + e.getMessage()));
        }
    }

    /**
     * Health check for discount integration
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok("Order discount integration is healthy");
    }
}