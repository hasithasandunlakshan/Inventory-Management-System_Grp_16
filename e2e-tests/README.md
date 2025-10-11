# End-to-End Testing for Inventory Management System

This project contains end-to-end (E2E) tests for the Inventory Management System using Selenium WebDriver and JUnit 5.

## Prerequisites

- Java JDK 11 or higher
- Maven
- Chrome, Firefox, or Edge browser installed
- The Inventory Management System application running locally or on a test environment

## Project Structure

```
e2e-tests/
├── pom.xml
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/
│   │           └── inventorymanagementsystem/
│   │               └── e2e/
│   │                   ├── pages/        # Page Object Models
│   │                   └── utils/        # Utility classes
│   └── test/
│       ├── java/
│       │   └── com/
│       │       └── inventorymanagementsystem/
│       │           └── e2e/              # Test classes
│       └── resources/
│           └── config.properties        # Configuration file
```

## Configuration

Before running the tests, update the `src/test/resources/config.properties` file with your specific settings:

```properties
# Base URL of your application
base.url=http://localhost:3000

# Browser to use for tests (chrome, firefox, edge)
browser=chrome

# User credentials for testing
user.username=admin@inventory.com
user.password=admin123
```

## Running the Tests

### Using Maven

```bash
cd e2e-tests
mvn clean test
```

### Running Specific Test Classes

```bash
mvn test -Dtest=LoginTest
```

### Running with Different Browsers

Update the `browser` property in `config.properties` to use different browsers:

- chrome
- firefox
- edge
- safari

## Page Objects

This project follows the Page Object Model (POM) design pattern, which provides the following benefits:

- Separation of test logic from UI interaction
- Improved test maintenance
- Better readability and reusability

Main page objects include:

- LoginPage
- DashboardPage
- InventoryPage
- ProductsPage
- OrdersPage

## Test Categories

1. **Authentication Tests**:

   - Successful login
   - Failed login attempts
   - Login form validation

2. **Inventory Management Tests**:

   - Viewing inventory
   - Searching items
   - Adding new items

3. **End-to-End Workflow Tests**:
   - Complete user journeys across multiple system components

## Debugging and Troubleshooting

If tests are failing, check the following:

1. Ensure the application is running and accessible
2. Verify that the browser driver is compatible with your browser version
3. Check element selectors in page objects
4. Review the test output for detailed error messages

## Extending the Test Suite

To add new tests:

1. Create page objects for new screens
2. Write new test classes extending BaseTest
3. Follow the existing patterns for assertions and page interactions

## Headless Mode

To run tests in headless mode (without browser UI), uncomment the headless options in the DriverManager.java file.
