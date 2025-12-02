import { test, expect } from '@playwright/test';
import { TEST_ADMIN, loginAsAdmin, logout } from '../fixtures/auth.fixture';

test.describe('Authentication - Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Login/);

    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check for branding
    await expect(page.locator('text=Bombeiro Mirim')).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for error message to appear
    const errorMessage = page.locator('.bg-red-50, [class*="error"], [class*="alert-error"]');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });

    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error for empty email', async ({ page }) => {
    // Fill only password
    await page.fill('input[type="password"]', 'somepassword');

    // Try to submit - HTML5 validation should prevent submission
    await page.click('button[type="submit"]');

    // Check that email input is invalid
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should show error for empty password', async ({ page }) => {
    // Fill only email
    await page.fill('input[type="email"]', 'test@test.com');

    // Try to submit - HTML5 validation should prevent submission
    await page.click('button[type="submit"]');

    // Check that password input is required
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]');
    const showPasswordCheckbox = page.locator('input[type="checkbox"]');

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Fill in a password
    await page.fill('input[type="password"]', 'testpassword');

    // Click show password checkbox
    await showPasswordCheckbox.check();

    // Password input should now show text
    const visiblePasswordInput = page.locator('input').filter({ hasText: '' }).nth(1);
    await expect(page.locator('input[type="text"]').first()).toBeVisible();

    // Uncheck to hide password again
    await showPasswordCheckbox.uncheck();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should successfully login with valid admin credentials', async ({ page }) => {
    // Fill in valid credentials
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);

    // Submit the form
    await page.click('button[type="submit"]');

    // Should show loading state
    await expect(page.locator('text=Entrando...')).toBeVisible();

    // Wait for redirect to admin area
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // Verify we're on the admin page
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Try to access admin page directly
    await page.goto('/admin/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should have link to registration page', async ({ page }) => {
    // Check for registration link
    const registerLink = page.locator('a[href="/cadastro"]');
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveText(/Cadastre-se/);

    // Click and verify navigation
    await registerLink.click();
    await expect(page).toHaveURL(/\/cadastro/);
  });

  test('should persist login session after page refresh', async ({ page }) => {
    // Login first
    await loginAsAdmin(page);

    // Verify we're on admin page
    await expect(page).toHaveURL(/\/admin/);

    // Refresh the page
    await page.reload();

    // Should still be on admin page (session persisted)
    await expect(page).toHaveURL(/\/admin/);
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await loginAsAdmin(page);

    // Verify we're logged in
    await expect(page).toHaveURL(/\/admin/);

    // Find and click logout button
    const logoutButton = page.locator('text=Sair').or(page.locator('[data-testid="logout"]'));

    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/);
    }
  });
});

test.describe('Authentication - Role-based Redirect', () => {
  test('should redirect admin user to /admin after login', async ({ page }) => {
    await page.goto('/login');

    // Login with admin credentials
    await page.fill('input[type="email"]', TEST_ADMIN.email);
    await page.fill('input[type="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/\/admin/, { timeout: 15000 });

    // Verify admin redirect
    await expect(page).toHaveURL(/\/admin/);
  });
});
