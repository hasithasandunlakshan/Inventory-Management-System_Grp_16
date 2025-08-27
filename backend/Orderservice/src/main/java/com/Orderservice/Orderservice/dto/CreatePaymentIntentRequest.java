package com.Orderservice.Orderservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreatePaymentIntentRequest {
    private Long amount; // in cents
    private String currency;
    private Long customerId;
    private List<OrderItem> orderItems; // Changed from items to orderItems to match frontend
    
    @Data
    public static class OrderItem {
        private String barcode;       // Added barcode field
        private Long productId;
        private Integer quantity;
        private BigDecimal unitPrice; // Changed from price to unitPrice to match frontend
        
        // Add getter for price to maintain backward compatibility
        public BigDecimal getPrice() {
            return unitPrice;
        }
    }
    
    // Add getter for items to maintain backward compatibility
    public List<OrderItem> getItems() {
        return orderItems;
    }
}