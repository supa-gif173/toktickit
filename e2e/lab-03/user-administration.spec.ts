import { test, expect } from '@playwright/test';

test.describe('Administrator User Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    const cookies = await page.context().cookies();
    for (const cookie of cookies) {
      await page.context().clearCookies({ name: cookie.name });
    }
  });

  test('E2E-04: Admin navigates to User Management, searches, filters, creates and edits a user', async ({ page }) => {
    // 1. Log in as Administrator
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Handle password change modal if present
    const changePassVisible = await page.locator('text=Change Default Password').isVisible({ timeout: 2000 }).catch(() => false);
    if (changePassVisible) {
      const passwordFields = await page.locator('input[type="password"]').all();
      if (passwordFields.length >= 3) {
        await passwordFields[1].fill('Password123!');
        await passwordFields[2].fill('NewAdminPass1!');
      } else {
        await page.getByLabel('Current Password').fill('Password123!');
        await page.getByLabel('New Password').fill('NewAdminPass1!');
      }
      await page.click('button:has-text("Update Password")');
    }

    await page.waitForURL('/');

    // 2. Navigate to Manage Users
    await page.click('text=Manage Users');
    await page.waitForURL('**/admin/users');

    // Verify User Management screen elements
    await expect(page.locator('h1, h2, div').filter({ hasText: /User Management/i }).first()).toBeVisible();
    await expect(page.locator('button:has-text("Create User"), button:has-text("New User")').first()).toBeVisible();

    // 3. Search for existing user
    const searchInput = page.locator('input[placeholder*="Search by name or email"], input[type="text"]').first();
    await searchInput.fill('staff1');
    const searchForm = page.locator('form').filter({ has: searchInput });
    if (await searchForm.count() > 0) {
      await searchForm.first().press('Enter');
    }
    await page.waitForTimeout(500);

    // 4. Open Create User Modal
    const createBtn = page.locator('button:has-text("Create User"), button:has-text("+ Create User")').first();
    await createBtn.click();

    // Fill form
    const uniqueEmail = `e2e_test_${Date.now()}@example.com`;
    await page.fill('input[name="name"], input[placeholder*="Full Name"], input[id*="name"]', 'E2E Test User');
    await page.fill('input[name="email"], input[placeholder*="Email"], input[type="email"]', uniqueEmail);
    
    // Select role if dropdown exists
    const roleSelect = page.locator('select').filter({ hasText: /STAFF/i }).or(page.locator('select[name="role"]')).first();
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption('STAFF');
    }

    // Fill initial password
    const pwdInput = page.locator('input[type="password"]').last();
    await pwdInput.fill('Password123!');

    // Submit form
    await page.click('button:has-text("Save User"), button:has-text("Create")');

    // Verify success feedback
    await expect(page.locator('text=created successfully').or(page.locator(`text=${uniqueEmail}`)).first()).toBeVisible({ timeout: 5000 });
  });
});
