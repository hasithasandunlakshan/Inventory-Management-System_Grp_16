package com.Orderservice.Orderservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Orderservice.Orderservice.dto.AllOrdersResponse;
import com.Orderservice.Orderservice.dto.OrderDetailResponse;
import com.Orderservice.Orderservice.service.OrderService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    
    @Autowired
    private OrderService orderService;
    
    /**
     * Get all orders for a specific user/customer
     * @param userId The customer ID
     * @return AllOrdersResponse containing all orders with details for the specified customer
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
     * @return AllOrdersResponse containing all confirmed orders
     */
    @GetMapping("/all")
    public ResponseEntity<AllOrdersResponse> getAllOrders() {
        try {
            AllOrdersResponse response = orderService.getAllOrders();
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
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
                
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Get a specific order by ID
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
}
