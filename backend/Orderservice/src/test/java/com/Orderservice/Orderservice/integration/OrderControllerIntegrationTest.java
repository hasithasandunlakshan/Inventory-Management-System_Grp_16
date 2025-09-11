package com.Orderservice.Orderservice.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import com.Orderservice.Orderservice.entity.Order;
import com.Orderservice.Orderservice.entity.OrderItem;
import com.Orderservice.Orderservice.entity.Product;
import com.Orderservice.Orderservice.enums.OrderStatus;
import com.Orderservice.Orderservice.repository.OrderRepository;
import com.Orderservice.Orderservice.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@Transactional
public class OrderControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private Product testProduct;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Create test product
        testProduct = new Product();
        testProduct.setName("Test Product");
        testProduct.setPrice(BigDecimal.valueOf(25.99));
        testProduct.setStockQuantity(10);
        testProduct.setBarcode("1234567890");
        testProduct.setImageUrl("http://test.com/image.jpg");
        testProduct = productRepository.save(testProduct);

        // Create test order item
        OrderItem testOrderItem = new OrderItem();
        testOrderItem.setProductId(testProduct.getProductId());
        testOrderItem.setQuantity(2);
        testOrderItem.setPrice(BigDecimal.valueOf(25.99));

        // Create test order
        testOrder = new Order();
        testOrder.setCustomerId(1L);
        testOrder.setOrderDate(LocalDateTime.now());
        testOrder.setStatus(OrderStatus.CONFIRMED);
        testOrder.setTotalAmount(BigDecimal.valueOf(51.98));
        testOrder.setOrderItems(Arrays.asList(testOrderItem));
        
        // Set bidirectional relationship
        testOrderItem.setOrder(testOrder);
        
        testOrder = orderRepository.save(testOrder);
    }

    @Test
    void getOrdersByUserId_ShouldReturnOrdersForUser() throws Exception {
        mockMvc.perform(get("/api/orders/user/1"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Orders retrieved successfully"))
            .andExpect(jsonPath("$.totalOrders").value(1))
            .andExpect(jsonPath("$.orders").isArray())
            .andExpect(jsonPath("$.orders[0].customerId").value(1))
            .andExpect(jsonPath("$.orders[0].status").value("CONFIRMED"))
            .andExpect(jsonPath("$.orders[0].orderItems").isArray())
            .andExpect(jsonPath("$.orders[0].orderItems[0].productName").value("Test Product"));
    }

    @Test
    void getOrdersByUserId_WithNoOrders_ShouldReturnEmptyList() throws Exception {
        mockMvc.perform(get("/api/orders/user/999"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.totalOrders").value(0))
            .andExpect(jsonPath("$.orders").isArray())
            .andExpect(jsonPath("$.orders").isEmpty());
    }

    @Test
    void getAllOrders_ShouldReturnAllConfirmedOrders() throws Exception {
        mockMvc.perform(get("/api/orders/all"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.totalOrders").value(1))
            .andExpect(jsonPath("$.orders").isArray())
            .andExpect(jsonPath("$.orders[0].status").value("CONFIRMED"));
    }

    @Test
    void getAllOrdersByStatus_ShouldFilterByStatus() throws Exception {
        mockMvc.perform(get("/api/orders/all/CONFIRMED"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.totalOrders").value(1))
            .andExpect(jsonPath("$.orders[0].status").value("CONFIRMED"));

        mockMvc.perform(get("/api/orders/all/DELIVERED"))
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
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Order status updated successfully"));

        // Verify the order status was updated in the database
        Order updatedOrder = orderRepository.findById(testOrder.getOrderId()).orElse(null);
        assert updatedOrder != null;
        assert updatedOrder.getStatus() == OrderStatus.DELIVERED;
    }

    @Test
    void updateOrderStatus_WithInvalidOrderId_ShouldReturnBadRequest() throws Exception {
        Map<String, String> statusUpdate = Map.of("status", "DELIVERED");

        mockMvc.perform(put("/api/orders/999/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Failed to update order status"));
    }

    @Test
    void updateOrderStatus_WithInvalidStatus_ShouldReturnBadRequest() throws Exception {
        Map<String, String> statusUpdate = Map.of("status", "INVALID_STATUS");

        mockMvc.perform(put("/api/orders/" + testOrder.getOrderId() + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.success").value(false))
            .andExpect(jsonPath("$.message").value("Failed to update order status"));
    }

    @Test
    void getOrderDetails_ShouldReturnCompleteOrderInfo() throws Exception {
        mockMvc.perform(get("/api/orders/" + testOrder.getOrderId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.order.orderId").value(testOrder.getOrderId()))
            .andExpect(jsonPath("$.order.customerId").value(1))
            .andExpect(jsonPath("$.order.status").value("CONFIRMED"))
            .andExpect(jsonPath("$.order.orderItems").isArray())
            .andExpect(jsonPath("$.order.orderItems[0].productName").value("Test Product"))
            .andExpect(jsonPath("$.order.orderItems[0].quantity").value(2))
            .andExpect(jsonPath("$.order.orderItems[0].barcode").value("1234567890"));
    }
}
