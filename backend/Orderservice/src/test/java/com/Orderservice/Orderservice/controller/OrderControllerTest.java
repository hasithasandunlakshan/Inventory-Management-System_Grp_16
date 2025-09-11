package com.Orderservice.Orderservice.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.Orderservice.Orderservice.dto.AllOrdersResponse;
import com.Orderservice.Orderservice.dto.OrderDetailResponse;
import com.Orderservice.Orderservice.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(OrderController.class)
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    private AllOrdersResponse successResponse;
    private AllOrdersResponse errorResponse;

    @BeforeEach
    void setUp() {
        // Setup test data
        OrderDetailResponse.OrderItemDetail itemDetail = OrderDetailResponse.OrderItemDetail.builder()
            .orderItemId(1L)
            .productId(1L)
            .productName("Test Product")
            .productImageUrl("http://test.com/image.jpg")
            .quantity(2)
            .price(BigDecimal.valueOf(25.99))
            .createdAt(LocalDateTime.now())
            .barcode("1234567890")
            .build();

        OrderDetailResponse orderDetail = OrderDetailResponse.builder()
            .orderId(1L)
            .customerId(1L)
            .orderDate(LocalDateTime.now())
            .status("CONFIRMED")
            .totalAmount(BigDecimal.valueOf(51.98))
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .orderItems(Arrays.asList(itemDetail))
            .build();

        successResponse = AllOrdersResponse.builder()
            .success(true)
            .message("Orders retrieved successfully")
            .orders(Arrays.asList(orderDetail))
            .totalOrders(1)
            .build();

        errorResponse = AllOrdersResponse.builder()
            .success(false)
            .message("Error retrieving orders")
            .orders(Arrays.asList())
            .totalOrders(0)
            .build();
    }

    @Test
    void getOrdersByUserId_WithValidUserId_ShouldReturnOrders() throws Exception {
        // Arrange
        when(orderService.getOrdersByCustomerId(1L)).thenReturn(successResponse);

        // Act & Assert
        mockMvc.perform(get("/api/orders/user/1"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Orders retrieved successfully"))
            .andExpect(jsonPath("$.totalOrders").value(1))
            .andExpect(jsonPath("$.orders").isArray())
            .andExpect(jsonPath("$.orders[0].orderId").value(1))
            .andExpect(jsonPath("$.orders[0].customerId").value(1))
            .andExpect(jsonPath("$.orders[0].status").value("CONFIRMED"));

        verify(orderService, times(1)).getOrdersByCustomerId(1L);
    }

    @Test
    void getOrdersByUserId_WithServiceError_ShouldReturnBadRequest() throws Exception {
        // Arrange
        when(orderService.getOrdersByCustomerId(1L)).thenReturn(errorResponse);

        // Act & Assert
        mockMvc.perform(get("/api/orders/user/1"))
            .andExpect(status().isBadRequest())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Error retrieving orders"))
            .andExpect(jsonPath("$.totalOrders").value(0));

        verify(orderService, times(1)).getOrdersByCustomerId(1L);
    }

    @Test
    void getAllOrders_ShouldReturnAllOrders() throws Exception {
        // Arrange
        when(orderService.getAllOrdersByStatus(null)).thenReturn(successResponse);

        // Act & Assert
        mockMvc.perform(get("/api/orders/all"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.totalOrders").value(1));

        verify(orderService, times(1)).getAllOrdersByStatus(null);
    }

    @Test
    void getAllOrdersByStatus_WithStatus_ShouldReturnFilteredOrders() throws Exception {
        // Arrange
        when(orderService.getAllOrdersByStatus("CONFIRMED")).thenReturn(successResponse);

        // Act & Assert
        mockMvc.perform(get("/api/orders/all/CONFIRMED"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.totalOrders").value(1));

        verify(orderService, times(1)).getAllOrdersByStatus("CONFIRMED");
    }

    @Test
    void updateOrderStatus_WithValidData_ShouldReturnSuccess() throws Exception {
        // Arrange
        when(orderService.updateOrderStatus(1L, "DELIVERED")).thenReturn(true);

        Map<String, String> statusUpdate = Map.of("status", "DELIVERED");

        // Act & Assert
        mockMvc.perform(put("/api/orders/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Order status updated successfully"));

        verify(orderService, times(1)).updateOrderStatus(1L, "DELIVERED");
    }

    @Test
    void updateOrderStatus_WithInvalidOrder_ShouldReturnBadRequest() throws Exception {
        // Arrange
        when(orderService.updateOrderStatus(1L, "DELIVERED")).thenReturn(false);

        Map<String, String> statusUpdate = Map.of("status", "DELIVERED");

        // Act & Assert
        mockMvc.perform(put("/api/orders/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Failed to update order status"));

        verify(orderService, times(1)).updateOrderStatus(1L, "DELIVERED");
    }

    @Test
    void updateOrderStatus_WithMissingStatus_ShouldReturnBadRequest() throws Exception {
        // Arrange
        Map<String, String> emptyUpdate = Map.of();

        // Act & Assert
        mockMvc.perform(put("/api/orders/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyUpdate)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Status is required"));

        verify(orderService, never()).updateOrderStatus(anyLong(), anyString());
    }
}
