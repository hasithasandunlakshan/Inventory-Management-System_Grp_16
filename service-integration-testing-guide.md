# Service Integration Testing Guide for Inventory Management System

This guide outlines how to perform integration testing between different services in the Inventory Management System.

## Table of Contents

1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Integration Test Types](#integration-test-types)
4. [Implementation Examples](#implementation-examples)
5. [Running the Tests](#running-the-tests)
6. [Troubleshooting](#troubleshooting)

## Overview

The Inventory Management System consists of several microservices:

- API Gateway
- Inventory Service
- Notification Service
- Order Service
- Product Service
- Supplier Service
- User Service
- ML Service

Integration testing verifies that these services interact correctly with each other.

## Environment Setup

### 1. Configure Test Database

Create an `application-integration.properties` file in each service's `src/test/resources` directory:

```properties
# Integration Test Configuration
spring.datasource.url=jdbc:h2:mem:integrationdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true

# JPA Configuration
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.sql.init.mode=always
spring.sql.init.schema-locations=classpath:schema.sql

# Disable external services for integration tests
spring.kafka.enabled=false
spring.cloud.discovery.enabled=false
eureka.client.enabled=false

# Test server configuration
server.port=0
spring.main.allow-bean-definition-overriding=true
```

### 2. Create Test Configuration

Create an `IntegrationTestConfig.java` in each service's test directory:

```java
@TestConfiguration
@Profile("integration")
public class IntegrationTestConfig {

    @Bean
    @Primary
    public ExternalService externalServiceMock() {
        return Mockito.mock(ExternalService.class);
    }

    // Add any other mock beans needed for testing
}
```

### 3. Set Up Test Schema

Create a `schema.sql` in the `src/test/resources` directory with table definitions required for testing.

## Integration Test Types

### 1. API Integration Tests

Test REST API endpoints and their interactions with service layers.

### 2. Service-to-Service Communication Tests

Test interactions between services using mocked external services.

### 3. Event-Driven Integration Tests

Test Kafka message producers and consumers.

### 4. Database Integration Tests

Test repository layer with test database.

## Implementation Examples

### Example 1: API Integration Test

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@ActiveProfiles("integration")
@Import(IntegrationTestConfig.class)
@Transactional
public class ProductControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        productRepository.deleteAll();
        testProduct = new Product();
        testProduct.setName("Test Product");
        testProduct.setDescription("Test Description");
        testProduct.setPrice(new BigDecimal("10.99"));
        testProduct.setStockQuantity(100);
        testProduct = productRepository.save(testProduct);
    }

    @Test
    void getProductById_ShouldReturnProduct() throws Exception {
        mockMvc.perform(get("/api/products/" + testProduct.getProductId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.name").value("Test Product"))
                .andExpect(jsonPath("$.price").value(10.99));
    }
}
```

### Example 2: Service-to-Service Integration

```java
@SpringBootTest
@ActiveProfiles("integration")
@Import(IntegrationTestConfig.class)
public class OrderServiceIntegrationTest {

    @Autowired
    private OrderService orderService;

    @MockBean
    private UserServiceClient userServiceClient;

    @MockBean
    private ProductServiceClient productServiceClient;

    @Autowired
    private OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        // Setup mock responses
        UserDetailsResponse.UserInfo mockUser = new UserDetailsResponse.UserInfo();
        mockUser.setId(1L);
        mockUser.setName("Test User");
        mockUser.setEmail("test@example.com");

        when(userServiceClient.getUserById(1L)).thenReturn(mockUser);

        ProductInfo mockProduct = new ProductInfo();
        mockProduct.setProductId(1L);
        mockProduct.setName("Test Product");
        mockProduct.setPrice(new BigDecimal("10.99"));
        mockProduct.setStockQuantity(100);

        when(productServiceClient.getProductById(1L)).thenReturn(mockProduct);
    }

    @Test
    void createOrder_ShouldCreateOrderWithUserAndProductInfo() {
        // Create order request
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.setCustomerId(1L);

        OrderItemRequest item = new OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(2);
        orderRequest.setItems(Collections.singletonList(item));

        // Create order
        OrderResponse response = orderService.createOrder(orderRequest);

        // Verify
        assertNotNull(response);
        assertEquals("Test User", response.getCustomerName());
        assertEquals(1, response.getOrderItems().size());
        assertEquals("Test Product", response.getOrderItems().get(0).getProductName());
        assertEquals(new BigDecimal("21.98"), response.getTotalAmount());
    }
}
```

### Example 3: Event-Driven Integration Test

```java
@SpringBootTest
@ActiveProfiles("integration")
@Import(IntegrationTestConfig.class)
public class KafkaIntegrationTest {

    @Autowired
    private EventPublisherService eventPublisherService;

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Captor
    private ArgumentCaptor<String> topicCaptor;

    @Captor
    private ArgumentCaptor<Object> messageCaptor;

    @Test
    void testPublishOrderCreatedEvent() {
        // Given
        Long orderId = 1L;
        Long customerId = 2L;
        List<OrderItem> items = Collections.singletonList(
            OrderItem.builder()
                .productId(3L)
                .quantity(2)
                .price(new BigDecimal("10.00"))
                .build()
        );

        // When
        eventPublisherService.publishInventoryReservationRequest(orderId, customerId, items);

        // Then
        verify(kafkaTemplate).send(topicCaptor.capture(), messageCaptor.capture());

        assertEquals("inventory-reservation-request", topicCaptor.getValue());

        Object message = messageCaptor.getValue();
        assertTrue(message instanceof InventoryReservationRequestEvent);

        InventoryReservationRequestEvent event = (InventoryReservationRequestEvent) message;
        assertEquals(orderId, event.getOrderId());
        assertEquals(customerId, event.getCustomerId());
        assertEquals(1, event.getItems().size());
        assertEquals(3L, event.getItems().get(0).getProductId());
        assertEquals(2, event.getItems().get(0).getQuantity());
    }
}
```

### Example 4: Cross-Service Integration Test

```java
@SpringBootTest
@ActiveProfiles("integration")
public class OrderInventoryIntegrationTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        // Mock inventory service response
        when(restTemplate.exchange(
            contains("/api/inventory/check"),
            eq(HttpMethod.POST),
            any(HttpEntity.class),
            eq(InventoryCheckResponse.class)
        )).thenReturn(ResponseEntity.ok(new InventoryCheckResponse(true, "Items available")));
    }

    @Test
    void createOrder_ShouldCheckInventory() throws Exception {
        // Create order
        OrderRequest orderRequest = new OrderRequest();
        // ... populate request

        mockMvc.perform(post("/api/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isOk());

        // Verify inventory was checked
        verify(restTemplate).exchange(
            contains("/api/inventory/check"),
            eq(HttpMethod.POST),
            any(HttpEntity.class),
            eq(InventoryCheckResponse.class)
        );
    }
}
```

## Running the Tests

### From Maven

```bash
# Run tests for a specific service
cd backend/orderservice
mvn test -Dspring.profiles.active=integration

# Run tests for all services
cd backend
mvn test -Dspring.profiles.active=integration
```

### From IDE

1. Set the active profile to "integration"
2. Run tests with JUnit

## Troubleshooting

### Common Issues:

1. **Connection refused to external services**

   - Make sure external services are mocked properly in the `IntegrationTestConfig`
   - Verify that service discovery is disabled in test properties

2. **Database schema issues**

   - Check that your `schema.sql` includes all required tables
   - Verify that the script is being executed (look for SQL logs)

3. **Missing beans**

   - Ensure all required beans are properly mocked in the test configuration
   - Check for proper `@Import` annotations on test classes

4. **Kafka communication failures**

   - Verify that Kafka is disabled in test properties
   - Make sure all Kafka templates are properly mocked

5. **Test data persistence issues**
   - Add `@Transactional` to test classes to roll back after each test
   - Clear relevant repositories in `@BeforeEach` methods
