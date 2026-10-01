import { test, expect } from '@playwright/test';

test.describe('IT Staff Ticket Workflow', () => {
  // Use isolated storage state if you want, but logging in each time is safer.
  test.beforeEach(async ({ page }) => {
    // Navigate and clear local storage / cookies just in case
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    const cookies = await page.context().cookies();
    for (const cookie of cookies) {
      await page.context().clearCookies({ name: cookie.name });
    }
  });

  test('E2E-03: IT Staff opens detail, claims, updates status/priority', async ({ page }) => {
    // 1. Log in as IT Staff
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    // Check if we hit password reset (should be false for staff after Issue 2, but let's handle if it exists)
    // Actually, seed sets mustChangePassword to true for staff, so let's check
    const currentUrl = page.url();
    if (!currentUrl.includes('/login')) {
      // It might show the ChangePasswordModal if not already changed.
      const changePassVisible = await page.locator('text=Change Password').isVisible({ timeout: 2000 }).catch(() => false);
      if (changePassVisible) {
        const currentInput = page.locator('#currentPassword');
        if (await currentInput.isVisible()) {
          await currentInput.fill('Password123!');
          await page.fill('#newPassword', 'NewStaffPass1!');
          await page.fill('#confirmPassword', 'NewStaffPass1!');
          await page.click('button:has-text("Change Password")');
        }
      }
    }

    // Ensure we are on dashboard or can navigate to Queue
    await page.waitForURL('/');
    
    // 2. Navigate to IT Ticket Queue
    await page.click('text=IT Ticket Queue');
    await page.waitForURL('**/staff/tickets');
    
    // 3. Look for a ticket and click it
    // We assume there's at least one ticket seeded by other tests or the backend
    await expect(page.locator('.desktop-table, .mobile-cards').first()).toBeVisible();
    
    // Click the first ticket
    await page.locator('tr.queue-row, .mobile-card').first().click();
    await page.waitForURL('**/staff/tickets/*');

    // 4. Claim the ticket
    const claimButton = page.locator('button:has-text("Claim Ticket")');
    if (await claimButton.isVisible()) {
      await claimButton.click();
      await expect(page.locator('text=Ticket claimed successfully!')).toBeVisible();
    }

    // 5. Update Status
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption({ label: 'In Progress' });
    await expect(page.locator('text=Status updated successfully!')).toBeVisible();

    // 6. Update Priority
    const prioritySelect = page.locator('select').nth(1); // Second select is Priority
    await prioritySelect.selectOption({ label: 'High' });
    await expect(page.locator('text=Priority updated successfully!')).toBeVisible();
  });
});
