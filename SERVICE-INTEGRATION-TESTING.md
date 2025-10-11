# Service Integration Testing Implementation

This repository includes comprehensive service integration testing for the Inventory Management System microservices architecture.

## Documentation

- [Service Integration Testing Guide](./service-integration-testing-guide.md) - Detailed guide on integration testing approach and implementation
- [Integration Testing Guide](./integration-testing-guide.md) - Quick reference guide for running integration tests

## Integration Test Types

### Single Service Integration Tests

Located within each service's test directory:

- OrderService (`backend/Orderservice/src/test/java/.../integration/`)
- InventoryService (`backend/inventoryservice/src/test/java/.../integration/`)

These tests validate the functionality of a single service with mocked external dependencies.

### Cross-Service Integration Tests

Located in the dedicated integration tests module (`integration-tests/`):

- Order-Inventory Integration - Tests the interaction between Order and Inventory services
- Payment-Order Integration - Tests the payment processing flow

### End-to-End API Tests

These tests validate the complete system through the API Gateway.

## Running the Tests

### Via Script

The simplest way to run all integration tests:

```bash
./run-integration-tests.sh
```

### Manual Execution

To run integration tests for a specific service:

```bash
cd backend/Orderservice
mvn test -Dspring.profiles.active=integration
```

To run cross-service tests:

```bash
cd integration-tests
mvn verify -Pintegration-test
```

## Test Configuration

Integration tests use:

- H2 in-memory databases for individual service tests
- TestContainers for cross-service tests (providing MySQL, Kafka, etc.)
- Mocked external services for third-party dependencies

## CI/CD Integration

Integration tests are automatically run in the CI/CD pipeline:

- On pull requests to main branch
- Nightly runs on the main branch
- Before production deployments

## Best Practices

1. Each service should have its own integration tests
2. Use TestContainers for infrastructure dependencies
3. Mock external services and APIs
4. Include appropriate test data setup and cleanup
5. Ensure tests are isolated and repeatable
