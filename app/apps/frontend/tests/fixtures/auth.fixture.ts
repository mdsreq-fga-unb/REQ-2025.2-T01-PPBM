import { test as base, expect, type Page } from '@playwright/test';

/**
 * Test credentials for admin user
 * 
 * These credentials must exist in your Supabase Auth AND in the database:
 * 1. Create a user in Supabase Dashboard → Authentication → Users
 * 2. Add the email to the 'admins' table in your database
 * 
 * Configure via environment variables or .env.test file:
 * - TEST_ADMIN_EMAIL: Admin user email
 * - TEST_ADMIN_PASSWORD: Admin user password
 */
export const TEST_ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@bombeiroMirim.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
};

/**
 * Extended test fixture with authenticated admin page
 */
export const test = base.extend<{
  authenticatedPage: Page;
  adminPage: Page;
}>({
  /**
   * Provides a page that's already logged in as admin
   */
  authenticatedPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },

  /**
   * Alias for authenticatedPage - provides admin-authenticated page
   */
  adminPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
});

/**
 * Helper function to perform admin login
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');

  // Wait for the login form to be visible
  await page.waitForSelector('input[type="email"]', { state: 'visible' });

  // Fill in credentials
  await page.fill('input[type="email"]', TEST_ADMIN.email);
  await page.fill('input[type="password"]', TEST_ADMIN.password);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for either redirect to admin or error message
  try {
    await page.waitForURL(/\/admin/, { timeout: 15000 });
  } catch (error) {
    // Check if there's an error message on the page
    const errorEl = page.locator('.bg-red-50, [class*="error"], [class*="alert"]');
    if (await errorEl.isVisible()) {
      const errorText = await errorEl.textContent();
      throw new Error(
        `Login failed: ${errorText}\n\n` +
        `Make sure the test credentials are valid:\n` +
        `  Email: ${TEST_ADMIN.email}\n` +
        `  Password: ${TEST_ADMIN.password}\n\n` +
        `To fix this:\n` +
        `1. Create a user in Supabase Dashboard → Authentication → Users\n` +
        `2. Add the email to the 'admins' table in your database\n` +
        `3. Or set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables`
      );
    }
    throw error;
  }

  // Verify we're on an admin page
  await expect(page).toHaveURL(/\/admin/);
}

/**
 * Helper function to logout
 */
export async function logout(page: Page): Promise<void> {
  // Click on logout button/link (adjust selector based on actual UI)
  const logoutButton = page.locator('text=Sair').or(page.locator('[data-testid="logout"]'));

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL('/login');
  }
}

/**
 * Helper to navigate to a specific admin page
 */
export async function navigateToAdminPage(page: Page, path: string): Promise<void> {
  const fullPath = path.startsWith('/admin') ? path : `/admin/${path}`;
  await page.goto(fullPath);
  await page.waitForLoadState('networkidle');
}

/**
 * Helper to check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  // Check for presence of admin header or sidebar
  const adminHeader = page.locator('.admin-header').or(page.locator('[data-testid="admin-header"]'));
  return await adminHeader.isVisible().catch(() => false);
}

/**
 * Helper to wait for toast notification
 */
export async function waitForToast(page: Page, text?: string): Promise<void> {
  const toastSelector = text
    ? `text=${text}`
    : '.toast, [role="alert"], .alert';

  await page.waitForSelector(toastSelector, {
    state: 'visible',
    timeout: 5000
  });
}

/**
 * Helper to dismiss toast notification
 */
export async function dismissToast(page: Page): Promise<void> {
  const closeButton = page.locator('.toast-close, [data-testid="toast-close"]');
  if (await closeButton.isVisible()) {
    await closeButton.click();
  }
}

// Re-export expect for convenience
export { expect } from '@playwright/test';
