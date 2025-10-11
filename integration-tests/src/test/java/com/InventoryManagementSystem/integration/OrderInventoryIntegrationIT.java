package com.InventoryManagementSystem.integration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.web.client.RestTemplate;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.InventoryManagementSystem.integration.config.IntegrationTestConfig;
import com.InventoryManagementSystem.integration.dto.InventoryCheckResponse;
import com.InventoryManagementSystem.integration.dto.InventoryReservationRequest;
import com.InventoryManagementSystem.integration.dto.OrderCreateRequest;
import com.InventoryManagementSystem.integration.dto.OrderResponse;
import com.InventoryManagementSystem.integration.dto.ProductItemDto;
import com.InventoryManagementSystem.integration.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@SpringBootTest
@EmbeddedKafka(partitions = 1, topics = { "order-events", "inventory-events" })
@ActiveProfiles("integration-test")
@Testcontainers
@Slf4j
public class OrderInventoryIntegrationIT {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("integration_tests")
            .withUsername("testuser")
            .withPassword("testpass");

    @Autowired
    private OrderService orderService;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @MockBean
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EmbeddedKafkaBroker embeddedKafkaBroker;

    private CountDownLatch inventoryResponseLatch = new CountDownLatch(1);
    private boolean inventoryReservationSuccess;

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @BeforeAll
    static void setUp() {
        mysql.start();
    }

    @BeforeEach
    void setUpTest() {
        inventoryResponseLatch = new CountDownLatch(1);
        inventoryReservationSuccess = false;

        // Mock inventory service response
        InventoryCheckResponse inventoryResponse = new InventoryCheckResponse();
        inventoryResponse.setSuccess(true);
        inventoryResponse.setMessage("All products available");

        when(restTemplate.postForObject(
                contains("/api/inventory/check"),
                any(),
                eq(InventoryCheckResponse.class)))
                .thenReturn(inventoryResponse);
    }

    @Test
    @Sql({ "/sql/reset.sql", "/sql/sample_products.sql", "/sql/sample_inventory.sql" })
    void createOrder_ShouldCheckInventoryAndPublishEvent() throws Exception {
        // Given
        OrderCreateRequest request = new OrderCreateRequest();
        request.setCustomerId(1L);

        ProductItemDto item = new ProductItemDto();
        item.setProductId(101L);
        item.setQuantity(5);
        request.setItems(List.of(item));

        // When
        OrderResponse response = orderService.createOrder(request);

        // Then
        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertNotNull(response.getOrderId());

        // Verify inventory service was called
        verify(restTemplate).postForObject(
                contains("/api/inventory/check"),
                any(),
                eq(InventoryCheckResponse.class));

        // Wait for Kafka event processing
        boolean messageProcessed = inventoryResponseLatch.await(5, TimeUnit.SECONDS);
        assertTrue(messageProcessed, "Inventory response message not received");
        assertTrue(inventoryReservationSuccess, "Inventory reservation was not successful");
    }

    @Test
    @Sql({ "/sql/reset.sql", "/sql/sample_products.sql", "/sql/sample_inventory.sql" })
    void cancelOrder_ShouldReleaseInventory() throws Exception {
        // Given - First create an order
        OrderCreateRequest createRequest = new OrderCreateRequest();
        createRequest.setCustomerId(1L);

        ProductItemDto item = new ProductItemDto();
        item.setProductId(101L);
        item.setQuantity(5);
        createRequest.setItems(List.of(item));

        OrderResponse createResponse = orderService.createOrder(createRequest);
        Long orderId = createResponse.getOrderId();

        // Reset latch for next message
        inventoryResponseLatch = new CountDownLatch(1);

        // When - Cancel the order
        OrderResponse cancelResponse = orderService.cancelOrder(orderId);

        // Then
        assertTrue(cancelResponse.isSuccess());
        assertEquals("CANCELLED", cancelResponse.getStatus());

        // Wait for Kafka event processing
        boolean messageProcessed = inventoryResponseLatch.await(5, TimeUnit.SECONDS);
        assertTrue(messageProcessed, "Inventory release message not received");
    }

    @Test
    @Sql({ "/sql/reset.sql", "/sql/sample_products.sql", "/sql/sample_inventory.sql" })
    void confirmOrder_ShouldUpdateInventoryPermanently() throws Exception {
        // Given - First create an order
        OrderCreateRequest createRequest = new OrderCreateRequest();
        createRequest.setCustomerId(1L);

        ProductItemDto item = new ProductItemDto();
        item.setProductId(101L);
        item.setQuantity(5);
        createRequest.setItems(List.of(item));

        OrderResponse createResponse = orderService.createOrder(createRequest);
        Long orderId = createResponse.getOrderId();

        // Reset latch for next message
        inventoryResponseLatch = new CountDownLatch(1);

        // When - Confirm the order (simulate payment confirmation)
        Map<String, Object> paymentDetails = Map.of(
                "paymentMethod", "CREDIT_CARD",
                "transactionId", "tx-12345");
        OrderResponse confirmResponse = orderService.confirmOrderPayment(orderId, paymentDetails);

        // Then
        assertTrue(confirmResponse.isSuccess());
        assertEquals("PAID", confirmResponse.getStatus());

        // Wait for Kafka event processing
        boolean messageProcessed = inventoryResponseLatch.await(5, TimeUnit.SECONDS);
        assertTrue(messageProcessed, "Inventory confirmation message not received");
    }

    @KafkaListener(topics = "inventory-events", groupId = "integration-test-group")
    public void consumeInventoryEvent(String message) {
        try {
            log.info("Received inventory event: {}", message);
            Map<String, Object> eventMap = objectMapper.readValue(message, Map.class);
            inventoryReservationSuccess = (boolean) eventMap.get("success");
            inventoryResponseLatch.countDown();
        } catch (Exception e) {
            log.error("Error processing inventory event", e);
        }
    }
}
