package com.Orderservice.Orderservice.dto;

import lombok.Data;
import lombok.Builder;
import java.util.List;

@Data
@Builder
public class AllOrdersResponse {
    private boolean success;
    private String message;
    private List<OrderDetailResponse> orders;
    private int totalOrders;
}