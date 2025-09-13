package com.Orderservice.Orderservice.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.Orderservice.Orderservice.config.IntegrationTestConfig;
import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.entity.Product;
import com.Orderservice.Orderservice.enums.OrderStatus;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@ActiveProfiles("integration")
@Import(IntegrationTestConfig.class)
@Transactional
public class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Order testOrder;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        // Clean up
        orderRepository.deleteAll();
        productRepository.deleteAll();

        // Create test product
        testProduct = new Product();
        testProduct.setName("Test Product");
        testProduct.setDescription("Test Description");
        testProduct.setPrice(new BigDecimal("10.99"));
        testProduct.setStockQuantity(100);
        testProduct = productRepository.save(testProduct);

        // Create test order
        testOrder = new Order();
        testOrder.setCustomerId(1L);
        testOrder.setOrderDate(LocalDateTime.now());
        testOrder.setStatus(OrderStatus.CONFIRMED);
        testOrder.setTotalAmount(new BigDecimal("10.99"));

        // Create order item
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(testOrder);
        orderItem.setProductId(testProduct.getProductId());
        orderItem.setQuantity(1);
        orderItem.setPrice(new BigDecimal("10.99"));
        testOrder.getOrderItems().add(orderItem);

        testOrder = orderRepository.save(testOrder);
    }

    @Test
    void getOrdersByUserId_ShouldReturnUserOrders() throws Exception {
        mockMvc.perform(get("/api/orders/user/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.totalOrders").value(1))
                .andExpect(jsonPath("$.orders[0].orderId").value(testOrder.getOrderId()));
    }

    @Test
    void getOrderById_ShouldReturnOrderDetails() throws Exception {
        mockMvc.perform(get("/api/orders/" + testOrder.getOrderId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.orderId").value(testOrder.getOrderId()))
                .andExpect(jsonPath("$.customerId").value(1))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void getAllOrdersByStatus_ShouldReturnOrdersWithSpecificStatus() throws Exception {
        mockMvc.perform(get("/api/orders/all/CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.totalOrders").value(1));
    }

    @Test
    void getAllOrdersByStatus_WithNonExistentStatus_ShouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/orders/all/DELIVERED"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.totalOrders").value(0));
    }

    @Test
    void getOrdersByUserId_WithNonExistentUser_ShouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/orders/user/999"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.totalOrders").value(0));
    }

    @Test
    void updateOrderStatus_ShouldUpdateSuccessfully() throws Exception {
        Map<String, String> statusUpdate = Map.of("status", "DELIVERED");

        mockMvc.perform(put("/api/orders/" + testOrder.getOrderId() + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void updateOrderStatus_WithInvalidOrderId_ShouldReturnBadRequest() throws Exception {
        Map<String, String> statusUpdate = Map.of("status", "DELIVERED");

        mockMvc.perform(put("/api/orders/999/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message")
                        .value("Failed to update order status. Please check order ID and status value."));
    }

    @Test
    void updateOrderStatus_WithInvalidStatus_ShouldReturnBadRequest() throws Exception {
        Map<String, String> statusUpdate = Map.of("status", "INVALID_STATUS");

        mockMvc.perform(put("/api/orders/" + testOrder.getOrderId() + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message")
                        .value("Failed to update order status. Please check order ID and status value."));
    }

    @Test
    void getOrderDetails_ShouldReturnCompleteOrderInfo() throws Exception {
        mockMvc.perform(get("/api/orders/" + testOrder.getOrderId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.orderId").value(testOrder.getOrderId()))
                .andExpect(jsonPath("$.customerId").value(1))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void getAllOrders_ShouldReturnAllConfirmedOrders() throws Exception {
        mockMvc.perform(get("/api/orders/all"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.totalOrders").value(1));
    }
}
