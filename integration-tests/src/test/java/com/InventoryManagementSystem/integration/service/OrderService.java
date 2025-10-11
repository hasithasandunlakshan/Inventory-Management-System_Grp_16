package com.InventoryManagementSystem.integration.service;

import java.util.Map;

import com.InventoryManagementSystem.integration.dto.OrderCreateRequest;
import com.InventoryManagementSystem.integration.dto.OrderResponse;

/**
 * Service interface for Order operations
 * This represents the Order service API for integration tests
 */
public interface OrderService {

    /**
     * Create a new order with the given request
     */
    OrderResponse createOrder(OrderCreateRequest request);

    /**
     * Get order details by ID
     */
    OrderResponse getOrder(Long orderId);

    /**
     * Cancel an order by ID
     */
    OrderResponse cancelOrder(Long orderId);

    /**
     * Confirm payment for an order
     */
    OrderResponse confirmOrderPayment(Long orderId, Map<String, Object> paymentDetails);
}
