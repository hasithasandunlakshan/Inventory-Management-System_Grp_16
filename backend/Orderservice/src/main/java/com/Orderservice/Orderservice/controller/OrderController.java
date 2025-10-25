package com.Orderservice.Orderservice.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Orderservice.Orderservice.dto.AllOrdersResponse;
import com.Orderservice.Orderservice.dto.OrderDetailResponse;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.dto.RefundRequest;
import com.Orderservice.Orderservice.dto.RefundResponse;
import com.Orderservice.Orderservice.service.OrderService;

@RestController
@RequestMapping("/api/orders")
<<<<<<< Updated upstream
=======
@CrossOrigin(origins = "https://inventory-management-system-grp-16.vercel.app/login?redirect=%2F", allowCredentials = "true")
>>>>>>> Stashed changes
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Get all orders for a specific user by user ID
     * 
     * @param userId The user ID
     * @return AllOrdersResponse containing the user's orders
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<AllOrdersResponse> getOrdersByUserId(@PathVariable Long userId) {
        try {
            AllOrdersResponse response = orderService.getOrdersByCustomerId(userId);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            AllOrdersResponse errorResponse = AllOrdersResponse.builder()
                    .success(false)
                    .message("Internal server error: " + e.getMessage())
                    .orders(null)
                    .totalOrders(0)
                    .build();

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    
    @GetMapping("/all")
    public ResponseEntity<AllOrdersResponse> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            // Validate pagination parameters
            if (page < 0) {
                return ResponseEntity.badRequest().body(AllOrdersResponse.builder()
                        .success(false)
                        .message("Page number cannot be negative")
                        .orders(null)
                        .totalOrders(0)
                        .build());
            }

            if (size < 1 || size > 100) {
                return ResponseEntity.badRequest().body(AllOrdersResponse.builder()
                        .success(false)
                        .message("Page size must be between 1 and 100")
                        .orders(null)
                        .totalOrders(0)
                        .build());
            }

            AllOrdersResponse response = orderService.getAllOrdersOptimized(page, size);

            if (response.isSuccess()) {
                // Add cache-control headers to prevent caching
                return ResponseEntity.ok()
                        .header("Cache-Control", "no-cache, no-store, must-revalidate")
                        .header("Pragma", "no-cache")
                        .header("Expires", "0")
                        .header("X-Timestamp", String.valueOf(System.currentTimeMillis()))
                        .body(response);
            } else {
                return ResponseEntity.badRequest()
                        .header("Cache-Control", "no-cache, no-store, must-revalidate")
                        .body(response);
            }

        } catch (Exception e) {
            AllOrdersResponse errorResponse = AllOrdersResponse.builder()
                    .success(false)
                    .message("Internal server error: " + e.getMessage())
                    .orders(null)
                    .totalOrders(0)
                    .build();

            return ResponseEntity.internalServerError()
                    .header("Cache-Control", "no-cache, no-store, must-revalidate")
                    .body(errorResponse);
        }
    }

    

    /**
     * 
     * @param status The order status to filter by
     * @param page   Page number (0-based, optional, default: 0)
     * @param size   Number of items per page (optional, default: 10)
     * @return AllOrdersResponse containing orders with the specified status
     */
    @GetMapping("/all/{status}")
    public ResponseEntity<AllOrdersResponse> getAllOrdersByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // Validate pagination parameters
            if (page < 0) {
                return ResponseEntity.badRequest().body(AllOrdersResponse.builder()
                        .success(false)
                        .message("Page number cannot be negative")
                        .orders(null)
                        .totalOrders(0)
                        .build());
            }

            if (size <= 0 || size > 100) {
                return ResponseEntity.badRequest().body(AllOrdersResponse.builder()
                        .success(false)
                        .message("Page size must be between 1 and 100")
                        .orders(null)
                        .totalOrders(0)
                        .build());
            }

            AllOrdersResponse response = orderService.getAllOrdersByStatusWithPagination(status, page, size);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            AllOrdersResponse errorResponse = AllOrdersResponse.builder()

                    .success(false)
                    .message("Internal server error: " + e.getMessage())
                    .orders(null)
                    .totalOrders(0)
                    .pagination(null)
                    .build();

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get a specific order by ID
     * 
     * @param orderId The order ID
     * @return OrderDetailResponse containing the order details
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponse> getOrderById(@PathVariable Long orderId) {
        try {
            OrderDetailResponse response = orderService.getOrderById(orderId);

            if (response != null) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update order status
     * 
     * @param orderId     The order ID
     * @param requestBody Map containing the new status
     * @return ResponseEntity with success/failure message
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> requestBody) {
        try {
            String newStatus = requestBody.get("status");

            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Status is required"));
            }
            boolean updated = orderService.updateOrderStatus(orderId, newStatus);

            if (updated) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Order status updated successfully",
                        "orderId", orderId,
                        "newStatus", newStatus));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Failed to update order status. Please check order ID and status value."));
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get count of orders with CONFIRMED status
     * 
     * @return ResponseEntity with confirmed orders count
     */
    @GetMapping("/count/confirmed")
    public ResponseEntity<Map<String, Object>> getConfirmedOrdersCount() {
        try {
            long confirmedCount = orderService.getOrderCountByStatus("CONFIRMED");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Confirmed orders count retrieved successfully",
                    "status", "CONFIRMED",
                    "count", confirmedCount,
                    "retrievedAt", java.time.LocalDateTime.now().toString()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage(),
                    "count", 0));
        }
    }

    /**
     * Get count of orders with PROCESSED status
     * 
     * @return ResponseEntity with processed orders count
     */
    @GetMapping("/count/processed")
    public ResponseEntity<Map<String, Object>> getProcessedOrdersCount() {
        try {
            long processedCount = orderService.getOrderCountByStatus("PROCESSED");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Processed orders count retrieved successfully",
                    "status", "PROCESSED",
                    "count", processedCount,
                    "retrievedAt", java.time.LocalDateTime.now().toString()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage(),
                    "count", 0));
        }
    }

    /**
     * Get count of orders by any status
     * 
     * @param status The order status to count
     * @return ResponseEntity with orders count for the specified status
     */
    @GetMapping("/count/status/{status}")
    public ResponseEntity<Map<String, Object>> getOrdersCountByStatus(@PathVariable String status) {
        try {
            long count = orderService.getOrderCountByStatus(status.toUpperCase());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Orders count retrieved successfully for status: " + status.toUpperCase(),
                    "status", status.toUpperCase(),
                    "count", count,
                    "retrievedAt", java.time.LocalDateTime.now().toString()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage(),
                    "status", status.toUpperCase(),
                    "count", 0));
        }
    }



    /**
     * Process a refund for an order
     * 
     * @param refundRequest Request containing orderId and refundReason
     * @return RefundResponse indicating success or failure
     */
    @PostMapping("/refund")
    public ResponseEntity<RefundResponse> processRefund(@RequestBody RefundRequest refundRequest) {
        try {
            // Validate request
            if (refundRequest.getOrderId() == null) {
                RefundResponse errorResponse = RefundResponse.failure(null, "Order ID is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Process the refund
            RefundResponse response = orderService.processRefund(
                    refundRequest.getOrderId(),
                    refundRequest.getRefundReason());

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            RefundResponse errorResponse = RefundResponse.failure(
                    refundRequest.getOrderId(),
                    "Internal server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
