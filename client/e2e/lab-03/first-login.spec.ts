import { test, expect } from '@playwright/test';

test.describe('E2E-02: Initial password login and change', () => {
  test('User must change password before accessing app', async ({ page }) => {
    // req2@example.com is seeded with mustChangePassword = true
    await page.goto('/login');
    await page.fill('input[type="email"]', 'req2@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Should navigate to dashboard but overlay the Change Password modal
    await expect(page).toHaveURL(/.*\/$/);
    await expect(page.getByRole('heading', { name: 'Change Password' })).toBeVisible();

    // Verify main content is inaccessible / pointer-events: none (via filter blur)
    const mainContent = page.locator('main');
    await expect(mainContent).toHaveCSS('pointer-events', 'none');

    // Attempt invalid password
    await page.fill('input[type="password"]:visible', 'wrongpass'); // Current
    await page.getByLabel('New Password', { exact: true }).fill('newpass1');
    await page.getByLabel('Confirm New Password', { exact: true }).fill('newpass2');
    await page.click('button:has-text("Change Password")');
    await expect(page.locator('text=Passwords do not match')).toBeVisible();

    // Fill valid new password
    await page.fill('input[type="password"]:visible', 'Password123!'); // Current
    await page.getByLabel('New Password', { exact: true }).fill('StrongNewPass1!');
    await page.getByLabel('Confirm New Password', { exact: true }).fill('StrongNewPass1!');
    await page.click('button:has-text("Change Password")');

    // Modal should disappear
    await expect(page.getByRole('heading', { name: 'Change Password' })).not.toBeVisible();
    await expect(mainContent).toHaveCSS('pointer-events', 'auto');
  });
});
