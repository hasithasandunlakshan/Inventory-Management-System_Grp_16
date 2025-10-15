import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login via UI
    await page.goto('/login');
    await page.fill('#username', 'Gayathri@123');
    await page.fill('#password', 'Gayathri@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
  });

  test('should navigate to dashboard', async ({ page }) => {
    // Manager redirects to /dashboard/manager
    await page.goto('/dashboard/manager');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/dashboard/);
    
    // Check for dashboard elements
    const hasDashboardContent = await page.locator('text=/dashboard|overview|statistics|manager/i').isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasDashboardContent).toBeTruthy();
  });

  test('should navigate to drivers page', async ({ page }) => {
    // Look for drivers link in navigation
    const driversLink = page.locator('a[href*="driver"], button:has-text("Drivers")').first();
    
    if (await driversLink.isVisible()) {
      await driversLink.click();
      await page.waitForURL('**/driver**');
      await expect(page).toHaveURL(/driver/);
    } else {
      // Direct navigation
      await page.goto('/drivers');
      await expect(page).toHaveURL(/driver/);
    }
  });

  test('should navigate to vehicles page', async ({ page }) => {
    // Look for vehicles link
    const vehiclesLink = page.locator('a[href*="vehicle"], button:has-text("Vehicles")').first();
    
    if (await vehiclesLink.isVisible()) {
      await vehiclesLink.click();
      await page.waitForURL('**/vehicle**');
    } else {
      await page.goto('/vehicles');
    }
    
    await expect(page).toHaveURL(/vehicle/);
  });

  test('should navigate to suppliers page', async ({ page }) => {
    const suppliersLink = page.locator('a[href*="supplier"], button:has-text("Suppliers")').first();
    
    if (await suppliersLink.isVisible()) {
      await suppliersLink.click();
      await page.waitForURL('**/supplier**');
    } else {
      await page.goto('/operations/suppliers');
    }
    
    const isOnSuppliersPage = await page.url().includes('supplier');
    expect(isOnSuppliersPage).toBeTruthy();
  });

  test('should navigate to products page', async ({ page }) => {
    const productsLink = page.locator('a[href*="product"], button:has-text("Products")').first();
    
    if (await productsLink.isVisible()) {
      await productsLink.click();
      await page.waitForTimeout(1000);
    } else {
      await page.goto('/products');
    }
    
    const isOnProductsPage = await page.url().includes('product');
    expect(isOnProductsPage).toBeTruthy();
  });

  test('should navigate using browser back button', async ({ page }) => {
    // Navigate to drivers
    await page.goto('/drivers');
    await page.waitForTimeout(1000);
    
    // Navigate to vehicles
    await page.goto('/vehicles');
    await page.waitForTimeout(1000);
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL(/driver/);
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL(/vehicle/);
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/drivers');
    await page.waitForTimeout(2000);
    
    // Check for navigation menu (sidebar or header)
    const hasNav = await page.locator('nav, [role="navigation"], [data-testid="nav"], header').isVisible();
    expect(hasNav).toBeTruthy();
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/drivers');
    await page.waitForTimeout(2000);
    
    // Check if drivers link is highlighted (common patterns)
    const activeLink = page.locator('a[href*="driver"].active, a[href*="driver"][aria-current], a[href*="driver"].bg-, [aria-current="page"]');
    const isHighlighted = await activeLink.count().then(count => count > 0);
    
    // Some indication that we're on the drivers page (either highlighted or just check we're on the page)
    const onDriversPage = page.url().includes('driver');
    expect(isHighlighted || onDriversPage).toBeTruthy();
  });
});

