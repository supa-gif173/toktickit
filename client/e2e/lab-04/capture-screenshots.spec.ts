import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactsDir = path.resolve(__dirname, '../../../artifacts/lab-04/screenshots');

test.describe.serial('Lab 4 Live Screenshot Evidence Generator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    const cookies = await page.context().cookies();
    for (const cookie of cookies) {
      await page.context().clearCookies({ name: cookie.name });
    }
  });

  test('Capture IT Staff and Admin Dashboard Screenshots', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Login as IT Staff
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
    const staffDash = page.locator('[data-testid="staff-dashboard"]');
    await expect(staffDash).toBeVisible({ timeout: 10000 });

    // Desktop 1280x800
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactsDir, 'staff-dashboard/01-staff-dashboard-desktop.png') });

    // Tablet 768x1024
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactsDir, 'staff-dashboard/02-staff-dashboard-tablet.png') });

    // Mobile 375x812
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactsDir, 'staff-dashboard/03-staff-dashboard-mobile.png') });

    // Back to Desktop for element screenshots
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    // Priority Breakdown Card
    const priorityCard = page.locator('[data-testid="priority-breakdown-card"]');
    if (await priorityCard.isVisible()) {
      await priorityCard.screenshot({ path: path.join(artifactsDir, 'staff-dashboard/04-staff-dashboard-priority-breakdown.png') });
    }

    // Recent Queue Card
    const recentCard = page.locator('[data-testid="recent-queue-card"]');
    if (await recentCard.isVisible()) {
      await recentCard.screenshot({ path: path.join(artifactsDir, 'staff-dashboard/05-staff-dashboard-recent-queue.png') });
    }

    // Drilldown Unassigned
    await page.click('[data-testid="card-unassigned-tickets"]');
    await page.waitForURL('**/staff/tickets?unassigned=true');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactsDir, 'staff-dashboard/07-dashboard-drilldown-unassigned.png') });

    // Drilldown Urgent
    await page.goto('/');
    await page.waitForSelector('[data-testid="priority-urgent"]');
    await page.click('[data-testid="priority-urgent"]');
    await page.waitForURL('**/staff/tickets?priority=URGENT');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactsDir, 'staff-dashboard/08-dashboard-drilldown-urgent.png') });

    // Login as Admin to capture Admin Stats
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/');
    const adminStats = page.locator('[data-testid="admin-stats-card"]');
    await expect(adminStats).toBeVisible({ timeout: 10000 });
    await adminStats.screenshot({ path: path.join(artifactsDir, 'staff-dashboard/06-admin-dashboard-users.png') });
  });

  test('Capture Requester Dashboard Screenshots', async ({ page }) => {
    test.setTimeout(60000);

    // Login as Requester
    await page.goto('/login');
    await page.fill('input[type="email"]', 'req1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/');
    const reqDash = page.locator('[data-testid="requester-dashboard"]');
    await expect(reqDash).toBeVisible({ timeout: 10000 });

    // Desktop 1280x800
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactsDir, 'requester-dashboard/01-requester-dashboard-desktop.png') });

    // Tablet 768x1024
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactsDir, 'requester-dashboard/02-requester-dashboard-tablet.png') });

    // Mobile 375x812
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactsDir, 'requester-dashboard/03-requester-dashboard-mobile.png') });

    // Back to Desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    // Quick Actions
    const quickActions = page.locator('[data-testid="btn-create-ticket"]').locator('..').locator('..');
    if (await quickActions.isVisible()) {
      await quickActions.screenshot({ path: path.join(artifactsDir, 'requester-dashboard/04-requester-quick-actions.png') });
    }

    // Recent Tickets
    const recentTickets = page.locator('[data-testid="recent-tickets-table"], [data-testid="empty-recent-tickets"]').first();
    if (await recentTickets.isVisible()) {
      await recentTickets.screenshot({ path: path.join(artifactsDir, 'requester-dashboard/05-requester-recent-tickets.png') });
    }

    // Drilldown Open Tickets
    await page.click('[data-testid="card-open-tickets"]');
    await page.waitForURL('**/tickets?status=open');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactsDir, 'requester-dashboard/06-requester-drilldown-open.png') });

    // Drilldown Waiting on Requester
    await page.goto('/');
    await page.waitForSelector('[data-testid="card-waiting-tickets"]');
    await page.click('[data-testid="card-waiting-tickets"]');
    await page.waitForURL('**/tickets?status=WAITING_FOR_REQUESTER');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactsDir, 'requester-dashboard/07-requester-drilldown-waiting.png') });
  });

  test('Capture Actions Taken and Ticket Workflow Screenshots', async ({ page, context }) => {
    test.setTimeout(90000);

    // Login as IT Staff
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/');
    await page.click('text=IT Ticket Queue');
    await page.waitForURL('**/staff/tickets');

    // Click on the first ticket
    await expect(page.locator('.desktop-table, .mobile-cards').first()).toBeVisible({ timeout: 10000 });
    await page.locator('tr.queue-row, .mobile-card').first().click();
    await page.waitForURL('**/staff/tickets/*');

    await page.setViewportSize({ width: 1280, height: 800 });
    const actionsSection = page.locator('[data-testid="actions-taken-section"]');
    await expect(actionsSection).toBeVisible({ timeout: 10000 });

    // 01: Actions Taken table desktop
    await actionsSection.screenshot({ path: path.join(artifactsDir, 'actions-taken/01-actions-taken-table-desktop.png') });

    // Transition from NEW to IN_PROGRESS if needed
    const statusSelect = page.locator('select.form-select').first();
    const currentStatusVal = await statusSelect.inputValue();
    if (currentStatusVal === 'NEW') {
      await statusSelect.selectOption('IN_PROGRESS');
      await page.waitForTimeout(500);
    }

    // 08: Resolution Gate Blocked (Attempt transition to RESOLVED before completing action)
    const canSelectResolved = await statusSelect.locator('option[value="RESOLVED"]').count();
    if (canSelectResolved > 0) {
      await statusSelect.selectOption('RESOLVED');
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(artifactsDir, 'actions-taken/08-resolution-gate-blocked.png') });
    }

    // 02: Create Action modal
    await page.click('[data-testid="add-action-btn"]');
    const createModal = page.locator('[data-testid="create-action-modal"]');
    await expect(createModal).toBeVisible();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactsDir, 'actions-taken/02-create-action-modal.png') });

    // 03: Create Action validation error (blank description)
    await page.click('[data-testid="submit-create-action-btn"]');
    const createError = page.locator('[data-testid="create-form-error"]');
    await expect(createError).toBeVisible();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactsDir, 'actions-taken/03-create-action-validation-error.png') });

    // 04: Assignee dropdown
    const assigneeSelect = page.locator('#create-action-assignee');
    await assigneeSelect.selectOption({ index: 1 });
    await page.fill('#create-action-description', 'Replaced faulty RAM module and initiated diagnostic memory sweep.');
    await page.check('#create-action-followup-toggle');
    const followupNote = page.locator('#create-action-followup-note');
    await followupNote.fill('Check memory telemetry log tomorrow morning.');
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(artifactsDir, 'actions-taken/04-action-assignee-dropdown.png') });

    // Submit Create Action
    await page.click('[data-testid="submit-create-action-btn"]');
    await expect(createModal).toBeHidden({ timeout: 5000 });

    // 05: Edit Action modal transitioning to COMPLETED
    const editBtn = page.locator('[data-testid^="edit-action-btn-"]').first();
    await editBtn.click();
    const editModal = page.locator('[data-testid="edit-action-modal"]');
    await expect(editModal).toBeVisible();
    await page.selectOption('#edit-action-status', 'COMPLETED');
    await page.fill('#edit-action-result', 'Memory passed 4 full passes of MemTest86 with zero errors.');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactsDir, 'actions-taken/05-edit-action-modal.png') });

    // Submit Edit Action
    await page.click('[data-testid="submit-edit-action-btn"]');
    await expect(editModal).toBeHidden({ timeout: 5000 });

    // 06: Completed Action Terminal Lock badge
    const lockBadge = page.locator('[data-testid="terminal-locked-badge"]').first();
    await expect(lockBadge).toBeVisible();
    await actionsSection.screenshot({ path: path.join(artifactsDir, 'actions-taken/06-completed-action-terminal-lock.png') });

    // 07: Resolution Gate Checklist
    const gateChecklist = page.locator('[data-testid="resolution-gate-checklist"]');
    if (await gateChecklist.isVisible()) {
      await gateChecklist.screenshot({ path: path.join(artifactsDir, 'actions-taken/07-resolution-gate-checklist.png') });
    }

    // 08 & 09: Resolution Gate
    // Claim ticket if unassigned
    const claimBtn = page.locator('button:has-text("Claim Ticket")');
    if (await claimBtn.isVisible()) {
      await claimBtn.click();
      await page.waitForTimeout(500);
    }

    // Try transitioning to RESOLVED (now that prerequisites are met)
    const canResolveNow = await statusSelect.locator('option[value="RESOLVED"]').count();
    if (canResolveNow > 0) {
      await statusSelect.selectOption('RESOLVED');
      await page.waitForTimeout(600);
    }
    await page.screenshot({ path: path.join(artifactsDir, 'actions-taken/09-resolution-gate-success.png') });

    // 10: Concurrency 409 Conflict Simulation
    const secondPage = await context.newPage();
    await secondPage.goto(page.url());
    await secondPage.waitForSelector('select.form-select');

    // In page 1, change status to CLOSED
    const canCloseInP1 = await statusSelect.locator('option[value="CLOSED"]').count();
    if (canCloseInP1 > 0) {
      await statusSelect.selectOption('CLOSED');
      await page.waitForTimeout(600);
    }
    // In page 2, try to update status from stale version (attempting CLOSED)
    const secondStatusSelect = secondPage.locator('select.form-select').first();
    const canCloseInP2 = await secondStatusSelect.locator('option[value="CLOSED"]').count();
    if (canCloseInP2 > 0) {
      await secondStatusSelect.selectOption('CLOSED');
      await secondPage.waitForTimeout(600);
      await secondPage.screenshot({ path: path.join(artifactsDir, 'actions-taken/10-concurrency-409-conflict-banner.png') });
    }
    await secondPage.close();

    // Reload page to get latest data
    await page.reload();
    await page.waitForTimeout(500);

    // 11: Ticket Status History Timeline
    const historyWidget = page.locator('[data-testid="ticket-history-widget"]');
    if (await historyWidget.isVisible()) {
      await historyWidget.screenshot({ path: path.join(artifactsDir, 'actions-taken/11-ticket-status-history-timeline.png') });
    }

    // 14: Tablet view of Actions Taken
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactsDir, 'actions-taken/14-actions-taken-tablet.png') });

    // 15: Mobile view of Actions Taken
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(artifactsDir, 'actions-taken/15-actions-taken-mobile.png') });

    // Switch back to desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);

    // 12 & 13: Requester View of Actions Taken (Read-only & Advisory Resolved Toggle)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'req1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/');
    const recentTicket = page.locator('[data-testid^="recent-ticket-"]').first();
    if (await recentTicket.isVisible({ timeout: 5000 }).catch(() => false)) {
      await recentTicket.click();
      await page.waitForURL('**/tickets/*');
    } else {
      await page.click('text=View My Tickets');
      await page.waitForURL('**/tickets');
      await page.locator('tbody tr a, .mobile-card a').first().click();
      await page.waitForURL('**/tickets/*');
    }
    await page.waitForTimeout(500);

    // 12: Requester Actions Readonly
    const reqActions = page.locator('[data-testid="actions-taken-section"]');
    if (await reqActions.isVisible()) {
      await reqActions.screenshot({ path: path.join(artifactsDir, 'actions-taken/12-requester-actions-readonly.png') });
    }

    // 13: Requester Advisory Resolved Toggle
    const resolveToggle = page.locator('[data-testid="requester-resolve-toggle"]').first();
    if (await resolveToggle.isVisible()) {
      await resolveToggle.click();
      await page.waitForTimeout(500);
      const resolveCard = resolveToggle.locator('..').locator('..');
      await resolveCard.screenshot({ path: path.join(artifactsDir, 'actions-taken/13-requester-advisory-resolved-toggle.png') });
    }
  });
});
