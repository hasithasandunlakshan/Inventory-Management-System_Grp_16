/**
 * Helper functions for authentication in tests
 * Credentials: Gayathri@123 / Gayathri@123
 */

/**
 * Login and set authentication state
 */
export async function loginViaAPI(page: any, username = 'Gayathri@123', password = 'Gayathri@123') {
  // Make login API call
  const response = await page.request.post('http://localhost:8090/api/auth/login', {
    data: { username, password }
  });
  
  const body = await response.json();
  
  if (!body.success || !body.token) {
    throw new Error('Login failed: ' + (body.error || 'Unknown error'));
  }
  
  // Set storage state in the context
  await page.context().addCookies([]);
  
  await page.context().addInitScript(({ token, user }) => {
    localStorage.setItem('inventory_auth_token', token);
    localStorage.setItem('inventory_user', JSON.stringify(user));
  }, { token: body.token, user: body.user });
}

/**
 * Login via UI (for testing the login form itself)
 * Note: Manager role redirects to /dashboard/manager
 */
export async function login(page: any, username = 'Gayathri@123', password = 'Gayathri@123') {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for login form to be visible
  await page.waitForSelector('#username', { timeout: 5000 });
  
  // Fill username and password using id selectors
  await page.fill('#username', username);
  await page.fill('#password', password);
  
  // Click sign in button
  await page.click('button[type="submit"]');
  
  // Wait for navigation - manager goes to /dashboard/manager
  await page.waitForURL('**/dashboard**', { timeout: 20000 }).catch(async () => {
    // Check for error message
    const errorText = await page.locator('[role="alert"]').textContent().catch(() => '');
    console.log('Login may have failed. Error:', errorText);
  });
}

export async function logout(page: any) {
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")').first();
  
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL(/login|^\/$/, { timeout: 5000 });
  }
}

export async function getAuthToken(page: any): Promise<string | null> {
  return await page.evaluate(() => localStorage.getItem('inventory_auth_token'));
}

export async function setAuthToken(page: any, token: string) {
  await page.evaluate((token: string) => {
    localStorage.setItem('inventory_auth_token', token);
  }, token);
}

export async function clearAuthToken(page: any) {
  await page.evaluate(() => {
    localStorage.removeItem('inventory_auth_token');
  });
}

export async function isLoggedIn(page: any): Promise<boolean> {
  const token = await getAuthToken(page);
  return token !== null && token !== '';
}

