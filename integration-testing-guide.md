# Running Service Integration Tests

This guide explains how to run the service integration tests for the Inventory Management System.

## Prerequisites

- Java 17 or higher
- Maven 3.6 or higher
- Docker and Docker Compose (for running tests with TestContainers)

## Types of Integration Tests

1. **Single Service Integration Tests** - Tests within a single service that mock external dependencies
2. **Cross-Service Integration Tests** - Tests that validate interactions between multiple services
3. **End-to-End Tests** - Tests that run against a fully deployed system

## Running Tests

### 1. Single Service Integration Tests

These tests are located within each service's test directory and use the `integration` profile:

```bash
# Example: Run integration tests for the Order Service
cd backend/Orderservice
mvn test -Dspring.profiles.active=integration
```

### 2. Cross-Service Integration Tests

These tests are in the `integration-tests` directory and use TestContainers to set up required infrastructure:

```bash
cd integration-tests
mvn verify -Pintegration-test
```

### 3. End-to-End Tests with Docker Compose

To run integration tests against a fully deployed system:

```bash
# Start all services
docker-compose up -d

# Run the tests
mvn test -Dspring.profiles.active=e2e
```

## Test Configuration

### Adding a New Integration Test

1. Create a new test class in the appropriate test directory
2. Add the required annotations:
   ```java
   @SpringBootTest
   @ActiveProfiles("integration")
   @Import(IntegrationTestConfig.class)
   public class MyIntegrationTest {
       // Test methods here
   }
   ```

### Mocking External Services

Use the `IntegrationTestConfig` class to provide mock implementations of external services:

```java
@TestConfiguration
@Profile("integration")
public class IntegrationTestConfig {
    @Bean
    @Primary
    public ExternalService externalServiceMock() {
        return Mockito.mock(ExternalService.class);
    }
}
```

## Common Issues and Solutions

1. **Kafka Connection Errors**

   - Check if Kafka is enabled in your test profile
   - Use `@EmbeddedKafka` for Kafka-dependent tests

2. **Database Errors**

   - Ensure you're using H2 or TestContainers for test databases
   - Check that schema initialization is properly configured

3. **Missing Beans**
   - Make sure all required beans are mocked in your test configuration
   - Check that your test class is properly importing the test configuration

## Best Practices

1. Use clear, descriptive test names
2. Set up test data in `@BeforeEach` methods
3. Clean up after tests to ensure isolation
4. Use `@Transactional` to automatically roll back database changes
5. Organize tests by functionality, not by class structure
