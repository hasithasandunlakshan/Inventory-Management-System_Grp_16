# Playwright Tests for Inventory Management System

## Test Suites

### 1. Authentication Tests (`auth.spec.ts`)
- ✅ Display login page
- ✅ Login with valid credentials
- ✅ Show error with invalid credentials
- ✅ Validate empty fields
- ✅ Logout functionality
- ✅ Session persistence

### 2. Driver Management Tests (`drivers.spec.ts`)
- ✅ Display drivers page
- ✅ Open driver registration modal
- ✅ Load users in dropdown
- ✅ Fill and submit registration form
- ✅ Search for drivers
- ✅ View driver details
- ✅ Filter drivers by status
- ✅ Validate required fields

### 3. Navigation Tests (`navigation.spec.ts`)
- ✅ Navigate to dashboard
- ✅ Navigate to drivers page
- ✅ Navigate to vehicles page
- ✅ Navigate to suppliers page
- ✅ Navigate to products page
- ✅ Browser back/forward navigation
- ✅ Display navigation menu
- ✅ Highlight active navigation item

### 4. API Integration Tests (`api.spec.ts`)
- ✅ Authenticate user via API
- ✅ Fetch drivers list
- ✅ Fetch available drivers
- ✅ Fetch users for dropdown
- ✅ Fetch vehicles list
- ✅ Handle unauthorized access
- ✅ Handle forbidden access
- ✅ Register driver via API
- ✅ Fetch current user info
- ✅ Handle network timeout

### 5. Responsive Design Tests (`responsive.spec.ts`)
- ✅ Desktop layout (1920x1080)
- ✅ Tablet layout (iPad Pro)
- ✅ Mobile layout (iPhone 12)
- ✅ Mobile menu functionality
- ✅ Touch interactions
- ✅ Multiple screen sizes

## Prerequisites

1. **Start Backend:** API Gateway (8090), User Service (8080), Resource Service (8086)
2. **Start Frontend:** `npm run dev` (port 3000)
3. **Test Credentials:** Gayathri@123 / Gayathri@123 (MANAGER role)

## Quick Start

```bash
# Run all tests (Chromium only - faster)
npx playwright test --project=chromium

# Run in UI mode (recommended)
npx playwright test --ui

# Run specific file
npx playwright test drivers.spec.ts --project=chromium

# View report
npx playwright show-report
```

## Test Reports

### View HTML Report
```bash
npx playwright show-report
```

### Generate Trace
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## Debugging

### Playwright Inspector
```bash
npx playwright test --debug
```

Features:
- Step through tests
- Pick locators
- Record at cursor
- View console logs

### Screenshots and Videos
Tests automatically capture:
- Screenshots on failure
- Videos on failure (in `test-results/`)

### Console Logs
Check terminal for:
- Test execution logs
- Failed assertions
- Network errors

## Configuration

Configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:3000`
- Test directory: `./playwrighttests`
- Retries: 2 on CI, 0 locally
- Parallel execution enabled
- Screenshots/videos on failure

## Helper Functions

Located in `helpers/auth.ts`:
```typescript
import { login, logout, getAuthToken } from './helpers/auth';

// Use in tests
test('my test', async ({ page }) => {
  await login(page); // Uses Gayathri@123 by default
  // Your test code
});
```

## Best Practices

1. **Use data-testid attributes** for reliable selectors
2. **Wait for network to be idle** before assertions
3. **Clean up after tests** (logout, clear data)
4. **Use Page Object Model** for complex pages
5. **Mock API responses** for flaky tests
6. **Run tests in parallel** for speed
7. **Check console errors** in tests

## Troubleshooting

### Tests Failing?

1. **Check services are running:**
   ```bash
   curl http://localhost:3000
   curl http://localhost:8090/health
   ```

2. **Check test user exists:**
   - Login manually with `Gayathri@123`/`Gayathri@123`

3. **Clear browser state:**
   ```bash
   npx playwright test --project=chromium --headed
   # Check browser console for errors
   ```

4. **Update snapshots:**
   ```bash
   npx playwright test --update-snapshots
   ```

### Slow Tests?

1. **Run specific browser only:**
   ```bash
   npx playwright test --project=chromium
   ```

2. **Increase timeout:**
   ```typescript
   test.setTimeout(60000); // 60 seconds
   ```

3. **Disable video recording:**
   Edit `playwright.config.ts`, remove `video` option

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Examples](https://playwright.dev/docs/examples)

## Next Steps

1. Add more test cases for:
   - Vehicle management
   - Assignment workflows
   - Supplier management
   - Product management
   - Order processing

2. Implement Page Object Model

3. Add visual regression testing

4. Set up CI/CD pipeline

5. Add performance testing

6. Add accessibility testing

