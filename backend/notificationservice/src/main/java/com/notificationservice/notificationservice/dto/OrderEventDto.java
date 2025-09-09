package com.notificationservice.notificationservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OrderEventDto {
    
    @JsonProperty("orderId")
    private Long orderId; // Changed to Long to match your format
    
    @JsonProperty("customerId")
    private Long customerId; // Changed from userId to customerId
    
    @JsonProperty("eventType")
    private String eventType; // ORDER_CREATED, ORDER_CONFIRMED, ORDER_SHIPPED, ORDER_DELIVERED, ORDER_CANCELLED
    
    @JsonProperty("status")
    private String status; // Changed from orderStatus to status
    
    @JsonProperty("totalAmount")
    private Double totalAmount;
    
    @JsonProperty("message")
    private String message; // Added message field from your event
    
    @JsonProperty("customerName")
    private String customerName;
    
    @JsonProperty("timestamp")
    private String timestamp;
    
    // Constructors
    public OrderEventDto() {}
    
    public OrderEventDto(Long orderId, Long customerId, String eventType) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.eventType = eventType;
    }
    
    // Getters and Setters
    public Long getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
    
    public Long getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }
    
    public String getEventType() {
        return eventType;
    }
    
    public void setEventType(String eventType) {
        this.eventType = eventType;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Double getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    @Override
    public String toString() {
        return "OrderEventDto{" +
                "orderId=" + orderId +
                ", customerId=" + customerId +
                ", eventType='" + eventType + '\'' +
                ", status='" + status + '\'' +
                ", totalAmount=" + totalAmount +
                ", message='" + message + '\'' +
                ", timestamp='" + timestamp + '\'' +
                ", customerName='" + customerName + '\'' +
                '}';
    }
}
