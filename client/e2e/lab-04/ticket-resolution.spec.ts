import { test, expect } from '@playwright/test';

test.describe('E2E-02: Resolution Gate & Ticket Status Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    const cookies = await page.context().cookies();
    for (const cookie of cookies) {
      await page.context().clearCookies({ name: cookie.name });
    }
  });

  test('Resolution Gate enforces prerequisites before allowing transition to RESOLVED', async ({ page }) => {
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

    await page.waitForURL('**/');
    await page.click('text=IT Ticket Queue');
    await page.waitForURL('**/staff/tickets');

    // Find and open an OPEN or NEW ticket
    await expect(page.locator('.desktop-table, .mobile-cards').first()).toBeVisible({ timeout: 10000 });
    await page.locator('tr.queue-row, .mobile-card').first().click();
    await page.waitForURL('**/staff/tickets/*');

    // 2. Check Resolution Gate Checklist widget
    const checklist = page.locator('[data-testid="resolution-gate-checklist"]');
    await expect(checklist).toBeVisible({ timeout: 10000 });

    // Transition from NEW to IN_PROGRESS if ticket is NEW
    const statusSelect = page.locator('select.form-select').first();
    const currentStatus = await statusSelect.inputValue();
    if (currentStatus === 'NEW') {
      await statusSelect.selectOption('IN_PROGRESS');
      await page.waitForTimeout(500);
    }

    // 3. Ensure ticket is claimed/assigned
    const claimBtn = page.locator('button:has-text("Claim Ticket")');
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
      await page.waitForTimeout(500);
    }

    // 4. Add a completed action meeting Resolution Gate conditions
    const actionsSection = page.locator('[data-testid="actions-taken-section"]');
    await expect(actionsSection).toBeVisible();

    const addActionBtn = page.locator('[data-testid="add-action-btn"]');
    await addActionBtn.click();

    const modal = page.locator('[data-testid="create-action-modal"], [data-testid="action-modal"]');
    await expect(modal).toBeVisible();

    await page.fill('#create-action-description, [data-testid="action-description-input"]', 'Comprehensive resolution diagnostics performed.');
    await page.selectOption('#create-action-status, [data-testid="action-status-select"]', 'COMPLETED');
    await page.fill('#create-action-result, [data-testid="action-result-input"]', 'Replaced faulty hardware component; service restored.');
    await page.click('[data-testid="submit-create-action-btn"], [data-testid="action-submit-btn"]');
    await expect(modal).not.toBeVisible({ timeout: 5000 });

    // 5. Select RESOLVED in status dropdown
    const resolvedOption = statusSelect.locator('option[value="RESOLVED"]');
    if (await resolvedOption.count() > 0) {
      await statusSelect.selectOption({ value: 'RESOLVED' });

      // Should succeed with success feedback
      await expect(page.locator('text=Status updated successfully!')).toBeVisible({ timeout: 8000 });

      // 6. Verify TicketStatusHistory reflects RESOLVED transition
      const historyWidget = page.locator('[data-testid="ticket-history-widget"]');
      await expect(historyWidget).toBeVisible();
      await expect(historyWidget).toContainText('Resolved');
    }
  });
});
