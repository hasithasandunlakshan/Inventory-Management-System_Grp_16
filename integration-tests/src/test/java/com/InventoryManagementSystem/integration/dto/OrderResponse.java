package com.InventoryManagementSystem.integration.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OrderResponse {
    private boolean success;
    private String message;
    private Long orderId;
    private Long customerId;
    private String customerName;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private List<OrderItemDto> orderItems = new ArrayList<>();
}
