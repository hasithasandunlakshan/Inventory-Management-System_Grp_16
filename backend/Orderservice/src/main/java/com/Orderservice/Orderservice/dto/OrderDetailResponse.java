package com.Orderservice.Orderservice.dto;

import lombok.Data;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderDetailResponse {
    private Long orderId;
    private Long customerId;
    private LocalDateTime orderDate;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
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