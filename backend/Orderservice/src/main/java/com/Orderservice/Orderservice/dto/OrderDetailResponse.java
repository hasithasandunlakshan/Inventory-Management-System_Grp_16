package com.Orderservice.Orderservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderDetailResponse {
    private Long orderId;
    private Long customerId;
    private LocalDateTime orderDate;
    private String status;
    private BigDecimal totalAmount;
    
    // Discount information
    private BigDecimal originalAmount;
    private BigDecimal discountAmount;
    private String discountCode;
    private Long discountId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String refundReason;
    private LocalDateTime refundProcessedAt;
    
    // User location information
    private Double latitude;
    private Double longitude;
    private String formattedAddress;
    
    private List<OrderItemDetail> orderItems;

    @Data
    @Builder
    public static class OrderItemDetail {
        private Long orderItemId;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private Integer quantity;
        private String barcode;
        private BigDecimal price;
        private LocalDateTime createdAt;
    }
}