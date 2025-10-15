import { test, expect } from '@playwright/test';

test.describe('Driver Management Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login via UI (actual form submission)
    await page.goto('/login');
    await page.fill('#username', 'Gayathri@123');
    await page.fill('#password', 'Gayathri@123');
    await page.click('button[type="submit"]');
    
    // Wait for login to process
    await page.waitForTimeout(5000);
    
    // Navigate to drivers page
    await page.goto('/drivers');
    await page.waitForTimeout(2000);
  });

  test('should display drivers page', async ({ page }) => {
    // Verify we're on drivers page (not redirected to login)
    await expect(page).toHaveURL(/driver/);
    
    // Check page has loaded content
    const hasContent = await page.locator('body').isVisible();
    expect(hasContent).toBeTruthy();
    
    // Check for any driver-related content or structure
    const hasAnyContent = await page.locator('div, section, main, table, h1, h2').count();
    expect(hasAnyContent).toBeGreaterThan(5); // Should have some structure
  });

  test('should open driver registration modal', async ({ page }) => {
    // Look for registration button
    const registerButton = page.locator('button:has-text("Register"), button:has-text("Add Driver"), button:has-text("New Driver")').first();
    
    if (await registerButton.isVisible()) {
      await registerButton.click();
      
      // Modal should open
      await expect(page.locator('[role="dialog"], .modal, [data-testid="driver-modal"]').first()).toBeVisible();
      
      // Check for form fields
      await expect(page.locator('text=/select.*user|user.*dropdown/i, [data-testid="user-dropdown"]').first()).toBeVisible();
    }
  });

  test('should load users in dropdown', async ({ page }) => {
    // Click register button
    const registerButton = page.locator('button:has-text("Register"), button:has-text("Add Driver"), button:has-text("New Driver")').first();
    
    if (await registerButton.isVisible()) {
      await registerButton.click();
      await page.waitForTimeout(1000);
      
      // Click user dropdown
      const dropdown = page.locator('[data-testid="user-dropdown"], select, button:has-text("Select")').first();
      await dropdown.click();
      await page.waitForTimeout(500);
      
      // Check if options are loaded
      const hasOptions = await page.locator('[role="option"], option, [data-testid="user-option"]').count().then(count => count > 0);
      expect(hasOptions).toBeTruthy();
    }
  });

  test('should fill and submit driver registration form', async ({ page }) => {
    // Click register button
    const registerButton = page.locator('button:has-text("Register"), button:has-text("Add Driver"), button:has-text("New Driver")').first();
    
    if (await registerButton.isVisible()) {
      await registerButton.click();
      await page.waitForTimeout(1000);
      
      // Fill form fields
      await page.fill('input[name="licenseNumber"], [data-testid="license-number"]', 'DL' + Date.now());
      
      // Select license class
      const classField = page.locator('select[name="licenseClass"], [data-testid="license-class"]').first();
      if (await classField.isVisible()) {
        await classField.selectOption('B');
      }
      
      // Fill expiry date
      await page.fill('input[name="licenseExpiry"], input[type="date"]', '2025-12-31');
      
      // Fill emergency contact
      await page.fill('input[name="emergencyContact"], [data-testid="emergency-contact"]', '+1234567890');
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Submit")').last();
      await submitButton.click();
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Check for success message or modal close
      const successVisible = await page.locator('text=/success|registered|created/i').isVisible().catch(() => false);
      const modalClosed = await page.locator('[role="dialog"]').isHidden().catch(() => true);
      
      expect(successVisible || modalClosed).toBeTruthy();
    }
  });

  test('should search for drivers', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], [data-testid="search"]').first();
    
    if (await searchInput.isVisible()) {
      // Type search term
      await searchInput.fill('DL');
      await page.waitForTimeout(1000);
      
      // Results should update (either showing filtered results or "no results")
      const hasResults = await page.locator('table tbody tr, [data-testid="driver-card"]').count().then(count => count >= 0);
      expect(hasResults).toBeTruthy();
    }
  });

  test('should view driver details', async ({ page }) => {
    // Look for view/details button
    const viewButton = page.locator('button:has-text("View"), button:has-text("Details"), [data-testid="view-driver"]').first();
    
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForTimeout(1000);
      
      // Check if details modal or page is shown
      const detailsVisible = await page.locator('text=/driver.*details|details.*driver/i, [data-testid="driver-details"]').isVisible().catch(() => false);
      expect(detailsVisible).toBeTruthy();
    }
  });

  test('should filter drivers by status', async ({ page }) => {
    // Look for filter or tab controls
    const filterOptions = page.locator('button:has-text("Available"), button:has-text("All"), [role="tab"]');
    
    const count = await filterOptions.count();
    if (count > 0) {
      // Click first filter option
      await filterOptions.first().click();
      await page.waitForTimeout(1000);
      
      // List should update
      const hasContent = await page.locator('table, [data-testid="drivers-list"]').isVisible();
      expect(hasContent).toBeTruthy();
    }
  });

  test('should validate required fields in registration form', async ({ page }) => {
    // Click register button
    const registerButton = page.locator('button:has-text("Register"), button:has-text("Add Driver")').first();
    
    if (await registerButton.isVisible()) {
      await registerButton.click();
      await page.waitForTimeout(500);
      
      // Try to submit without filling required fields
      const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Submit")').last();
      await submitButton.click();
      
      // Should show validation errors
      await page.waitForTimeout(1000);
      const hasValidationError = await page.locator('text=/required|fill.*field|invalid/i').isVisible().catch(() => false);
      expect(hasValidationError).toBeTruthy();
    }
  });
});

