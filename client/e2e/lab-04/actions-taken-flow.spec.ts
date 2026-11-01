import { test, expect } from '@playwright/test';

test.describe('E2E-01: Actions Taken Lifecycle & RBAC Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    const cookies = await page.context().cookies();
    for (const cookie of cookies) {
      await page.context().clearCookies({ name: cookie.name });
    }
  });

  test('IT Staff adds action, edits to completion, and Requester views read-only list', async ({ page }) => {
    // 1. Log in as IT Staff
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Handle password change modal if present
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

    // Navigate to Staff Queue
    await page.waitForURL('**/');
    await page.click('text=IT Ticket Queue');
    await page.waitForURL('**/staff/tickets');

    // Click on the first ticket in queue
    await expect(page.locator('.desktop-table, .mobile-cards').first()).toBeVisible({ timeout: 10000 });
    await page.locator('tr.queue-row, .mobile-card').first().click();
    await page.waitForURL('**/staff/tickets/*');

    // 2. Verify Actions Taken Section is visible
    const actionsSection = page.locator('[data-testid="actions-taken-section"]');
    await expect(actionsSection).toBeVisible({ timeout: 10000 });

    // Click "+ Add Action" button
    const addActionBtn = page.locator('[data-testid="add-action-btn"]');
    await expect(addActionBtn).toBeVisible();
    await addActionBtn.click();

    // Fill Create Action Modal
    const modal = page.locator('[data-testid="create-action-modal"], [data-testid="action-modal"]');
    await expect(modal).toBeVisible();
    await page.fill('#create-action-description, [data-testid="action-description-input"]', 'Investigated server logs and isolated memory bottleneck.');
    await page.selectOption('#create-action-status, [data-testid="action-status-select"]', 'IN_PROGRESS');

    // Submit Action
    await page.click('[data-testid="submit-create-action-btn"], [data-testid="action-submit-btn"]');
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // Verify created action appears in table
    await expect(actionsSection).toContainText('Investigated server logs and isolated memory bottleneck.');

    // 3. Edit Action to COMPLETED with Result
    const editBtn = page.locator('[data-testid^="edit-action-btn-"]').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      const editModal = page.locator('[data-testid="edit-action-modal"], [data-testid="action-modal"]');
      await expect(editModal).toBeVisible();

      await page.selectOption('#edit-action-status, [data-testid="action-status-select"]', 'COMPLETED');
      await page.fill('#edit-action-result, [data-testid="action-result-input"]', 'Allocated additional JVM heap size and restarted service.');
      await page.click('[data-testid="submit-edit-action-btn"], [data-testid="action-submit-btn"]');
      await expect(editModal).not.toBeVisible({ timeout: 5000 });

      // Action row should now have locked badge
      await expect(actionsSection).toContainText('[Locked]');
    }

    // 4. Logout IT Staff
    await page.click('button[title="Log Out"], button:has-text("Logout"), button:has-text("Log out")');
    await page.waitForTimeout(500);

    // 5. Log in as Requester
    await page.goto('/login');
    await page.fill('input[type="email"]', 'req1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Navigate to My Tickets and open detail
    await page.goto('/tickets');
    await page.waitForSelector('tbody tr a, .mobile-card a');
    await page.locator('tbody tr a, .mobile-card a').first().click();
    await page.waitForURL('**/tickets/*');

    // Verify Actions Taken is rendered in Read-Only mode
    const reqActionsSection = page.locator('[data-testid="actions-taken-section"]');
    await expect(reqActionsSection).toBeVisible({ timeout: 10000 });
    // Add action button must NOT exist for requesters
    await expect(page.locator('[data-testid="add-action-btn"]')).not.toBeVisible();
  });
});
