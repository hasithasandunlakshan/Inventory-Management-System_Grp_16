# Order-Inventory Integration Test

This project contains tests for the integration between the Order Service and Inventory Service.

## Overview

These tests validate that:

- Order Service can properly request inventory checks
- Inventory Service responds correctly to these requests
- Order confirmations properly update inventory levels
- Order cancellations properly release reserved inventory

## Prerequisites

- Docker and Docker Compose installed
- Java 17 or higher
- Maven 3.6 or higher

## Setup

1. Start the required services in Docker:

```bash
docker-compose up -d kafka mysql
```

2. Run the tests:

```bash
mvn verify -Pintegration-test
```

## Test Coverage

The integration tests cover the following scenarios:

1. **Order Creation with Inventory Check**

   - Validates that the Order Service checks product availability before creating an order
   - Ensures inventory is properly reserved upon order creation

2. **Order Payment Confirmation Flow**

   - Tests that confirming payment properly adjusts inventory levels
   - Validates that order status is updated correctly

3. **Order Cancellation Flow**

   - Verifies that cancelling an order properly releases reserved inventory
   - Ensures order status is updated correctly

4. **Error Handling**
   - Tests behavior when ordering products with insufficient inventory
   - Verifies proper error messages are returned

## Configuration

The test configuration is managed through the following files:

- `application-integration-test.properties`: Contains database and service connection settings
- `IntegrationTestConfig.java`: Provides mock beans and test configurations

## Adding New Tests

To add a new integration test:

1. Create a new test class extending `BaseIntegrationTest`
2. Use `@MockBean` to mock external service responses as needed
3. Set up test data in the `@BeforeEach` method
4. Write test methods with assertions
