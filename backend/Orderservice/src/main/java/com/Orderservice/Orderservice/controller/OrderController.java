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
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Get all orders for a specific user/customer
     * 
     * @param userId The customer ID
     * @return AllOrdersResponse containing all orders with details for the
     *         specified customer
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<AllOrdersResponse> getOrdersByUserId(@PathVariable Long userId) {
        try {
            System.out.println("=== GETTING ORDERS FOR USER ===");
            System.out.println("User ID: " + userId);

            AllOrdersResponse response = orderService.getOrdersByCustomerId(userId);

            System.out.println("Orders found: " + response.getTotalOrders());
            System.out.println("Success: " + response.isSuccess());

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.err.println("Error in getOrdersByUserId: " + e.getMessage());
            e.printStackTrace();

            AllOrdersResponse errorResponse = AllOrdersResponse.builder()
                    .success(false)
                    .message("Internal server error: " + e.getMessage())
                    .orders(null)
                    .totalOrders(0)
                    .build();

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get all orders (existing functionality)
     * 
     * @return AllOrdersResponse containing all confirmed orders
     */
    @GetMapping("/all")
    public ResponseEntity<AllOrdersResponse> getAllOrders() {
        try {
            System.out.println("=== FETCHING ALL ORDERS ===");
            System.out.println("Timestamp: " + LocalDateTime.now());

            AllOrdersResponse response = orderService.getAllOrders();

            if (response.isSuccess()) {
                System.out.println("Orders fetched successfully: " + response.getTotalOrders() + " orders");

                // Add cache-control headers to prevent caching
                return ResponseEntity.ok()
                        .header("Cache-Control", "no-cache, no-store, must-revalidate")
                        .header("Pragma", "no-cache")
                        .header("Expires", "0")
                        .header("X-Timestamp", String.valueOf(System.currentTimeMillis()))
                        .body(response);
            } else {
                System.out.println("Failed to fetch orders: " + response.getMessage());
                return ResponseEntity.badRequest()
                        .header("Cache-Control", "no-cache, no-store, must-revalidate")
                        .body(response);
            }

        } catch (Exception e) {
            System.err.println("Error in getAllOrders: " + e.getMessage());
            e.printStackTrace();

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
     * Debug endpoint to show raw database data
     */
    @GetMapping("/debug/raw")
    public ResponseEntity<Map<String, Object>> getDebugOrders() {
        try {
            System.out.println("=== DEBUG: RAW DATABASE QUERY ===");
            System.out.println("Timestamp: " + LocalDateTime.now());

            // Get raw orders from database
            List<Order> allOrders = orderRepository.findAll();
            List<Order> confirmedOrders = orderRepository.findAllConfirmedOrdersWithItems();

            System.out.println("Total orders in database: " + allOrders.size());
            System.out.println("Confirmed orders: " + confirmedOrders.size());

            // Log order details
            Map<String, Long> statusCounts = allOrders.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            o -> o.getStatus().toString(),
                            java.util.stream.Collectors.counting()));

            System.out.println("Orders by status: " + statusCounts);

            Map<String, Object> debugInfo = new java.util.HashMap<>();
            debugInfo.put("timestamp", LocalDateTime.now().toString());
            debugInfo.put("totalOrdersInDb", allOrders.size());
            debugInfo.put("confirmedOrders", confirmedOrders.size());
            debugInfo.put("statusBreakdown", statusCounts);
            debugInfo.put("latestOrderIds", allOrders.stream()
                    .sorted((a, b) -> b.getOrderId().compareTo(a.getOrderId()))
                    .limit(5)
                    .map(Order::getOrderId)
                    .toList());
            debugInfo.put("confirmedOrderIds", confirmedOrders.stream()
                    .map(Order::getOrderId)
                    .toList());

            return ResponseEntity.ok()
                    .header("Cache-Control", "no-cache, no-store, must-revalidate")
                    .body(debugInfo);

        } catch (Exception e) {
            System.err.println("Error in debug endpoint: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorInfo = new java.util.HashMap<>();
            errorInfo.put("error", e.getMessage());
            errorInfo.put("timestamp", LocalDateTime.now().toString());

            return ResponseEntity.internalServerError()
                    .header("Cache-Control", "no-cache, no-store, must-revalidate")
                    .body(errorInfo);
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

            System.out.println("=== GETTING ORDERS BY STATUS WITH PAGINATION ===");
            System.out.println("Status: " + status);
            System.out.println("Page: " + page);
            System.out.println("Size: " + size);

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
                System.out.println("✅ Retrieved " + response.getOrders().size() + " orders for page " + page);
                System.out.println("Total elements: " + response.getPagination().getTotalElements());
                System.out.println("Total pages: " + response.getPagination().getTotalPages());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.err.println("Error in getAllOrdersByStatus: " + e.getMessage());
            e.printStackTrace();

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
            System.err.println("Error in getOrderById: " + e.getMessage());
            e.printStackTrace();
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

            System.out.println("=== UPDATING ORDER STATUS ===");
            System.out.println("Order ID: " + orderId);
            System.out.println("New Status: " + newStatus);

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
            System.err.println("Error updating order status: " + e.getMessage());
            e.printStackTrace();

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
            System.out.println("=== GETTING CONFIRMED ORDERS COUNT ===");

            long confirmedCount = orderService.getOrderCountByStatus("CONFIRMED");

            System.out.println("Confirmed orders count: " + confirmedCount);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Confirmed orders count retrieved successfully",
                    "status", "CONFIRMED",
                    "count", confirmedCount,
                    "retrievedAt", java.time.LocalDateTime.now().toString()));

        } catch (Exception e) {
            System.err.println("Error getting confirmed orders count: " + e.getMessage());
            e.printStackTrace();

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
            System.out.println("=== GETTING PROCESSED ORDERS COUNT ===");

            long processedCount = orderService.getOrderCountByStatus("PROCESSED");

            System.out.println("Processed orders count: " + processedCount);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Processed orders count retrieved successfully",
                    "status", "PROCESSED",
                    "count", processedCount,
                    "retrievedAt", java.time.LocalDateTime.now().toString()));

        } catch (Exception e) {
            System.err.println("Error getting processed orders count: " + e.getMessage());
            e.printStackTrace();

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
            System.out.println("=== GETTING ORDERS COUNT BY STATUS ===");
            System.out.println("Status: " + status.toUpperCase());

            long count = orderService.getOrderCountByStatus(status.toUpperCase());

            System.out.println("Orders count for status " + status.toUpperCase() + ": " + count);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Orders count retrieved successfully for status: " + status.toUpperCase(),
                    "status", status.toUpperCase(),
                    "count", count,
                    "retrievedAt", java.time.LocalDateTime.now().toString()));

        } catch (Exception e) {
            System.err.println("Error getting orders count by status: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage(),
                    "status", status.toUpperCase(),
                    "count", 0));
        }
    }

    /**
     * Debug endpoint to get order count by status
     * 
     * @return Map containing counts by status
     */
    @GetMapping("/debug/status-counts")
    public ResponseEntity<Map<String, Object>> getOrderStatusCounts() {
        try {
            System.out.println("=== DEBUG: GETTING ORDER STATUS COUNTS ===");
            Map<String, Object> response = orderService.getOrderStatusCounts();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error in getOrderStatusCounts: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Debug endpoint to get all orders regardless of status (for testing)
     * 
     * @return AllOrdersResponse containing all orders with any status
     */
    @GetMapping("/debug/all")
    public ResponseEntity<AllOrdersResponse> getAllOrdersDebug() {
        try {
            System.out.println("=== DEBUG: GETTING ALL ORDERS REGARDLESS OF STATUS ===");
            AllOrdersResponse response = orderService.getAllOrdersDebug();

            System.out.println("Total orders found: " + response.getTotalOrders());
            System.out.println("Success: " + response.isSuccess());

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.err.println("Error in getAllOrdersDebug: " + e.getMessage());
            e.printStackTrace();

            AllOrdersResponse errorResponse = AllOrdersResponse.builder()
                    .success(false)
                    .message("Internal server error: " + e.getMessage())
                    .orders(null)
                    .totalOrders(0)
                    .build();

            return ResponseEntity.internalServerError().body(errorResponse);
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
            System.out.println("=== PROCESSING REFUND REQUEST ===");
            System.out.println("Order ID: " + refundRequest.getOrderId());
            System.out.println("Refund Reason: " + refundRequest.getRefundReason());

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
                System.out.println("✅ Refund processed successfully for order: " + refundRequest.getOrderId());
                return ResponseEntity.ok(response);
            } else {
                System.err.println("❌ Refund failed for order: " + refundRequest.getOrderId());
                System.err.println("Reason: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }

        } catch (Exception e) {
            System.err.println("Error processing refund request: " + e.getMessage());
            e.printStackTrace();

            RefundResponse errorResponse = RefundResponse.failure(
                    refundRequest.getOrderId(),
                    "Internal server error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}
