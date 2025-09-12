# OrderService Testing Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [Testing Framework & Libraries](#testing-framework--libraries)
- [Test Architecture](#test-architecture)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [Database Testing](#database-testing)
- [Test Configuration](#test-configuration)
- [Running Tests](#running-tests)
- [Test Results](#test-results)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This document provides comprehensive information about the testing strategy, implementation, and execution for the OrderService microservice. The testing suite ensures reliability, maintainability, and correctness of the order management functionality.

## 🛠️ Testing Framework & Libraries

### Core Testing Framework
- **JUnit 5 (Jupiter)** - `org.junit.jupiter:junit-jupiter`
  - Modern testing framework for Java
  - Provides annotations like `@Test`, `@BeforeEach`, `@AfterEach`
  - Support for parameterized tests and dynamic tests
  - Better assertion methods and exception handling

### Mocking Framework
- **Mockito 5.x** - `org.mockito:mockito-core`
  - Creates mock objects for dependencies
  - Enables isolated unit testing
  - Provides `@Mock`, `@InjectMocks` annotations
  - Supports method stubbing with `when().thenReturn()`
  - Verifies method interactions with `verify()`

### Spring Boot Testing
- **Spring Boot Test Starter** - `spring-boot-starter-test`
  - `@SpringBootTest` for integration tests
  - `@WebMvcTest` for controller layer testing
  - `@DataJpaTest` for repository testing
  - `@MockBean` for Spring context mocking
  - `MockMvc` for HTTP request simulation

### Database Testing
- **H2 In-Memory Database** - `com.h2database:h2`
  - Fast, lightweight database for testing
  - Automatically creates/destroys database per test
  - Supports SQL schema and data initialization
  - Compatible with JPA/Hibernate

### Assertion Library
- **AssertJ** - `org.assertj:assertj-core`
  - Fluent assertion API
  - Better readability than JUnit assertions
  - Rich set of assertion methods
  - Included in Spring Boot Test Starter

## 🏗️ Test Architecture

### Test Structure
```
src/test/java/
├── com/Orderservice/Orderservice/
│   ├── service/               # Unit Tests
│   │   ├── OrderServiceTest.java
│   │   └── PaymentServiceTest.java
│   ├── repository/            # Repository Tests
│   │   └── OrderRepositoryTest.java
│   ├── controller/            # Controller Tests
│   │   └── OrderControllerTest.java
│   ├── integration/           # Integration Tests
│   │   ├── OrderControllerIntegrationTest.java
│   │   └── PaymentServiceIntegrationTest.java
│   ├── config/               # Test Configuration
│   │   └── IntegrationTestConfig.java
│   └── OrderserviceTestSuite.java
```

### Test Resources
```
src/test/resources/
├── application-integration.properties
├── schema.sql
└── data.sql (optional)
```

## 🔧 Unit Tests

### OrderServiceTest.java (8 Tests)
**Purpose**: Tests business logic of order management service

**Key Test Scenarios**:
1. **getAllOrdersByStatus()** - Retrieves orders filtered by status
2. **updateOrderStatus()** - Updates order status with validation
3. **Error Handling** - Invalid status, non-existent orders
4. **Event Publishing** - Verifies Kafka message publishing

**Testing Approach**:
```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {
    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @Mock private EventPublisherService eventPublisherService;
    @InjectMocks private OrderService orderService;
    
    @Test
    void getAllOrdersByStatus_ShouldReturnFilteredOrders() {
        // Given: Mock data setup
        when(orderRepository.findByStatus(any())).thenReturn(mockOrders);
        
        // When: Execute service method
        AllOrdersResponse response = orderService.getAllOrdersByStatus("CONFIRMED");
        
        // Then: Verify results
        assertThat(response.isSuccess()).isTrue();
        verify(orderRepository).findByStatus(OrderStatus.CONFIRMED);
    }
}
```

### PaymentServiceTest.java (9 Tests)
**Purpose**: Tests payment confirmation workflows

**Key Test Scenarios**:
1. **confirmPayment()** - Successful payment confirmation
2. **Validation** - Null/empty payment intent IDs
3. **Business Rules** - Already confirmed payments
4. **Error Handling** - Payment failures, database errors
5. **Integration** - Order and invoice updates

**Testing Approach**:
```java
@Test
void confirmPayment_WithValidData_ShouldUpdateOrderAndCreateInvoice() {
    // Given: Setup test data
    when(orderRepository.findById(orderId)).thenReturn(Optional.of(testOrder));
    when(paymentRepository.save(any())).thenReturn(testPayment);
    
    // When: Execute payment confirmation
    boolean result = paymentService.confirmPayment(orderId, "pi_123", "pm_456");
    
    // Then: Verify all updates
    assertThat(result).isTrue();
    verify(orderRepository).save(testOrder);
    verify(invoiceRepository).save(any(Invoice.class));
    verify(eventPublisherService).publishEvent(any());
}
```

## 🧪 Integration Tests

### OrderControllerIntegrationTest.java (10 Tests)
**Purpose**: Tests complete HTTP request-response cycle

**Key Features**:
- **Real HTTP Requests**: Using MockMvc for HTTP simulation
- **Database Integration**: H2 in-memory database with real schema
- **Complete Flow**: Controller → Service → Repository → Database

**Test Scenarios**:
1. **GET /api/orders/user/{userId}** - Retrieve user orders
2. **GET /api/orders/{orderId}** - Get specific order details
3. **GET /api/orders/all/{status}** - Filter orders by status
4. **PUT /api/orders/{orderId}/status** - Update order status
5. **Error Scenarios** - Invalid IDs, statuses, non-existent resources

**Testing Approach**:
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebMvc
@ActiveProfiles("integration")
@Transactional
class OrderControllerIntegrationTest {
    
    @Autowired private MockMvc mockMvc;
    @Autowired private OrderRepository orderRepository;
    
    @Test
    void getOrdersByUserId_ShouldReturnUserOrders() throws Exception {
        mockMvc.perform(get("/api/orders/user/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.totalOrders").value(1));
    }
}
```

## 🗄️ Database Testing

### OrderRepositoryTest.java (9 Tests)
**Purpose**: Tests JPA repository operations and custom queries

**Test Coverage**:
1. **CRUD Operations** - Save, find, update, delete
2. **Custom Queries** - findByCustomerId, findByStatus
3. **Relationships** - Order-OrderItem associations
4. **Data Integrity** - Cascading operations

**Database Configuration**:
```properties
# application-integration.properties
spring.datasource.url=jdbc:h2:mem:integrationdb
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
spring.sql.init.mode=always
```

**Schema Definition**:
```sql
-- schema.sql
CREATE TABLE IF NOT EXISTS ORDERS (
    order_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    order_date TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS ORDER_ITEMS (
    order_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (order_id) REFERENCES ORDERS(order_id)
);
```

## ⚙️ Test Configuration

### IntegrationTestConfig.java
**Purpose**: Provides mock configurations for external dependencies

```java
@TestConfiguration
public class IntegrationTestConfig {
    
    @Bean
    @Primary
    public EventPublisherService mockEventPublisherService() {
        return Mockito.mock(EventPublisherService.class);
    }
    
    @Bean
    @Primary
    public KafkaTemplate<String, Object> mockKafkaTemplate() {
        return Mockito.mock(KafkaTemplate.class);
    }
}
```

### Test Profiles
- **integration**: Used for integration tests with H2 database
- **test**: Default test profile for unit tests

## 🚀 Running Tests

### Run All Tests
```bash
# Run complete test suite
./mvnw test

# Run with Maven wrapper (Windows)
.\mvnw.cmd test
```

### Run Specific Test Categories

#### Unit Tests Only
```bash
# Run service layer tests
./mvnw test -Dtest="OrderServiceTest,PaymentServiceTest"

# Run repository tests  
./mvnw test -Dtest="OrderRepositoryTest"
```

#### Integration Tests Only
```bash
# Run integration tests
./mvnw test -Dtest="OrderControllerIntegrationTest"

# Run specific integration test method
./mvnw test -Dtest="OrderControllerIntegrationTest#getOrdersByUserId_ShouldReturnUserOrders"
```

#### Test Suite
```bash
# Run predefined test suite
./mvnw test -Dtest="OrderserviceTestSuite"
```

### Run Tests with Profiles
```bash
# Run with integration profile
./mvnw test -Dspring.profiles.active=integration

# Run with specific configuration
./mvnw test -Dtest=OrderRepositoryTest -Dspring.profiles.active=integration
```

### Generate Test Reports
```bash
# Run tests with detailed reporting
./mvnw test -Dsurefire.printSummary=true

# Generate coverage report (if configured)
./mvnw test jacoco:report
```

## 📊 Test Results

### Current Test Status (as of implementation)

#### ✅ **Successfully Passing (26/33 tests)**

**Unit Tests: 26/26 PASSING**
- **OrderServiceTest**: ✅ 8/8 tests
  - getAllOrdersByStatus() variations
  - updateOrderStatus() with validation
  - Error handling scenarios
  
- **PaymentServiceTest**: ✅ 9/9 tests
  - confirmPayment() workflows
  - Validation scenarios
  - Business rule enforcement
  
- **OrderRepositoryTest**: ✅ 9/9 tests
  - CRUD operations
  - Custom query methods
  - Relationship testing

#### 🔄 **Partially Working (Integration Tests)**
- **OrderControllerIntegrationTest**: Framework established, tests created
- **OrderControllerTest**: Context loading issues (7 tests affected)

### Test Execution Output
```
[INFO] Tests run: 26, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] Results:
[INFO] 
[INFO] Tests run: 26, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] BUILD SUCCESS
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. **H2 Database Connection Issues**
**Problem**: `Database not found` or connection errors

**Solution**:
```properties
# Ensure correct H2 configuration
spring.datasource.url=jdbc:h2:mem:integrationdb;DB_CLOSE_DELAY=-1
spring.h2.console.enabled=true
```

#### 2. **Mock Verification Failures**
**Problem**: `Wanted but not invoked` errors

**Solution**:
```java
// Ensure proper mock setup
when(mockRepository.findById(anyLong())).thenReturn(Optional.of(testEntity));

// Verify exact method calls
verify(mockRepository, times(1)).findById(1L);
```

#### 3. **Schema Loading Issues**
**Problem**: Table/column not found errors

**Solution**:
```properties
# Enable schema initialization
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true
```

#### 4. **Test Data Cleanup**
**Problem**: Tests affecting each other

**Solution**:
```java
@Transactional  // Automatic rollback
// OR
@DirtiesContext // Reload Spring context
// OR
@BeforeEach
void setUp() {
    repository.deleteAll();
}
```

### Debug Test Execution
```bash
# Run with debug information
./mvnw test -X

# Run single test with detailed output
./mvnw test -Dtest=OrderServiceTest -Dsurefire.printSummary=true
```

## 📝 Best Practices Implemented

### 1. **Test Isolation**
- Each test method is independent
- Proper setup and teardown
- No shared state between tests

### 2. **Meaningful Test Names**
```java
// Good: Descriptive test names
@Test
void getAllOrdersByStatus_WithValidStatus_ShouldReturnFilteredOrders()

// Bad: Unclear test names  
@Test
void testGetOrders()
```

### 3. **Arrange-Act-Assert Pattern**
```java
@Test
void updateOrderStatus_ShouldUpdateSuccessfully() {
    // Arrange: Setup test data
    Order testOrder = createTestOrder();
    when(orderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
    
    // Act: Execute the method under test
    boolean result = orderService.updateOrderStatus(1L, "DELIVERED");
    
    // Assert: Verify the results
    assertThat(result).isTrue();
    verify(orderRepository).save(testOrder);
}
```

### 4. **Comprehensive Error Testing**
- Null parameter validation
- Invalid input handling
- Exception scenarios
- Edge cases

### 5. **Mock Management**
- Minimal mocking (only external dependencies)
- Clear mock expectations
- Proper verification

## 🎯 Testing Benefits Achieved

### 1. **Quality Assurance**
- **Bug Prevention**: Early detection of issues
- **Regression Protection**: Prevents breaking existing functionality
- **Code Confidence**: Safe refactoring and changes

### 2. **Development Speed**
- **Fast Feedback**: Quick identification of problems
- **Automated Verification**: No manual testing needed
- **Documentation**: Tests serve as living documentation

### 3. **Maintainability**
- **Code Quality**: Forces good design practices
- **Refactoring Safety**: Tests ensure behavior preservation
- **Team Collaboration**: Clear expectations and behavior

### 4. **Business Value**
- **Reliability**: Reduces production issues
- **Customer Satisfaction**: Stable, working features
- **Cost Reduction**: Less debugging and fixing in production

---

## 📞 Support

For questions about testing implementation or issues:
1. Check the troubleshooting section above
2. Review test logs in `target/surefire-reports/`
3. Consult Spring Boot Testing documentation
4. Review JUnit 5 and Mockito documentation

**Last Updated**: September 12, 2025
**Test Framework Version**: JUnit 5, Spring Boot 3.5.4, Mockito 5.x
