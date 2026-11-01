import { test, expect } from '@playwright/test';

test.describe('E2E-03: Role-Tailored Dashboards, Responsive Viewports & SVG Guardrail', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    const cookies = await page.context().cookies();
    for (const cookie of cookies) {
      await page.context().clearCookies({ name: cookie.name });
    }
  });

  test('Requester Dashboard metrics, drill-downs, and quick-actions', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'req1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Should land on Requester Dashboard
    await page.waitForURL('**/');
    const dashboard = page.locator('[data-testid="requester-dashboard"]');
    await expect(dashboard).toBeVisible({ timeout: 10000 });

    // Verify metric cards
    await expect(page.locator('[data-testid="card-open-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-waiting-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-resolved-tickets"]')).toBeVisible();

    // Verify quick actions
    await expect(page.locator('[data-testid="btn-create-ticket"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-view-tickets"]')).toBeVisible();

    // Test drill-down: click "My Open Tickets" card
    await page.click('[data-testid="card-open-tickets"]');
    await page.waitForURL('**/tickets?status=open');
  });

  test('IT Staff Dashboard operational metrics, queue drill-downs, and priority cards', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

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

    // Should land on Staff Dashboard
    await page.waitForURL('**/');
    const dashboard = page.locator('[data-testid="staff-dashboard"]');
    await expect(dashboard).toBeVisible({ timeout: 10000 });

    // Verify ribbon metric cards
    await expect(page.locator('[data-testid="card-new-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-open-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-in-progress-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-waiting-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-my-assigned-tickets"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-unassigned-tickets"]')).toBeVisible();

    // Verify Priority Breakdown
    await expect(page.locator('[data-testid="priority-breakdown-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-queue-card"]')).toBeVisible();

    // Drill-down test: click "Open" card
    await page.click('[data-testid="card-open-tickets"]');
    await page.waitForURL('**/staff/tickets?status=OPEN');
  });

  test('Responsive Viewports: zero horizontal scroll on mobile, tablet, and desktop', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'staff1@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');

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

    // 1. Mobile Viewport (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(mobileOverflow).toBe(true);

    // 2. Tablet Viewport (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    const tabletOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(tabletOverflow).toBe(true);

    // 3. Desktop Viewport (1280px)
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(300);
    const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
    expect(desktopOverflow).toBe(true);

    // 4. SVG Dimension Boundary Guardrail: no inline SVG exceeds 64px width or height
    const allSvgs = await page.$$eval('svg', (svgs) =>
      svgs.map((s) => {
        const rect = s.getBoundingClientRect();
        return { w: rect.width, h: rect.height };
      })
    );
    for (const svg of allSvgs) {
      expect(svg.w).toBeLessThanOrEqual(64);
      expect(svg.h).toBeLessThanOrEqual(64);
    }
  });
});
