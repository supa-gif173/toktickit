import { test, expect } from '@playwright/test';

test.describe('E2E-01: Authentication Flow', () => {
  test('Full Login and Logout flow', async ({ page }) => {
    // Navigate to home, should redirect to login
    await page.goto('/');
    await expect(page).toHaveURL(/.*\/login/);

    // Login as active requester
    await page.fill('input[type="email"]', 'req1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*\/$/);
    
    // Verify user info in navbar
    await expect(page.locator('header')).toContainText('Requester One');
    await expect(page.locator('header')).toContainText('REQUESTER');

    // Logout
    await page.click('button[title="Log Out"]');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
