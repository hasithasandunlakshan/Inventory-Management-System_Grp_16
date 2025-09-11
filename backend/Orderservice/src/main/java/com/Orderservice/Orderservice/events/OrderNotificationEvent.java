package com.Orderservice.Orderservice.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderNotificationEvent {
    
    private String eventType; // ORDER_CREATED, ORDER_CONFIRMED, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED
    private Long orderId;
    private Long customerId;
    private String customerName;
    private String status;
    private Double totalAmount;
    private String message;
    private String timestamp;
    
    // Constructor for order creation
    public OrderNotificationEvent(Long orderId, Long customerId, String status, Double totalAmount, String message) {
        this.eventType = "ORDER_CREATED";
        this.orderId = orderId;
        this.customerId = customerId;
        this.status = status;
        this.totalAmount = totalAmount;
        this.message = message;
        this.timestamp = LocalDateTime.now().toString();
    }
    
    // Constructor with event type
    public OrderNotificationEvent(String eventType, Long orderId, Long customerId, String status, Double totalAmount, String message) {
        this.eventType = eventType;
        this.orderId = orderId;
        this.customerId = customerId;
        this.status = status;
        this.totalAmount = totalAmount;
        this.message = message;
        this.timestamp = LocalDateTime.now().toString();
    }
    
    // Constructor with customer name
    public OrderNotificationEvent(String eventType, Long orderId, Long customerId, String customerName, String status, Double totalAmount, String message) {
        this.eventType = eventType;
        this.orderId = orderId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.status = status;
        this.totalAmount = totalAmount;
        this.message = message;
        this.timestamp = LocalDateTime.now().toString();
    }
}
