package com.Orderservice.Orderservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreatePaymentIntentRequest {
    private Long amount; // in cents
    private String currency;
    private Long customerId;
    private List<Item> items;
    
    @Data
    public static class Item {
        private Long productId;
        private Integer quantity;
        private BigDecimal price;
    }
}