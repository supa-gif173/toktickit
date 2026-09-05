import { test, expect } from '@playwright/test';
import path from 'path';

test('End-to-End User Journey: Create Ticket', async ({ page }) => {
  // 1. Selecting a Mock Requester identity.
  await page.goto('/');
  
  // The app redirects to /login since there is no context
  await expect(page).toHaveURL(/.*login/);
  await expect(page.getByText('Development Access')).toBeVisible();

  // Select Alice from the dropdown
  await page.locator('select#requester-select').selectOption({ label: 'Alice Johnson (Finance)' });
  await page.getByRole('button', { name: 'Continue' }).click();

  // Redirects to Dashboard
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'TokTickIT' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My Tickets' })).toBeVisible();

  // 2. Navigating to the Create Ticket page.
  await page.getByRole('link', { name: 'Create Ticket' }).first().click();
  await expect(page).toHaveURL(/.*tickets\/new/);
  await expect(page.getByRole('heading', { name: 'Create New Ticket' })).toBeVisible();

  // 3. Filling out the ticket fields and attaching a mock file.
  const summary = `E2E Test Ticket ${Date.now()}`;
  await page.getByLabel(/Summary/).fill(summary);
  await page.getByLabel(/Description/).fill('This is a test description for an E2E journey.');
  
  // Select Category and System
  await page.locator('select#category').selectOption({ label: 'Hardware' });
  await page.locator('select#system').selectOption({ label: 'ERP System' });


  const pdfFileChooserPromise = page.waitForEvent('filechooser');
  await page.getByText('Click or drag files to upload').click();
  const pdfFileChooser = await pdfFileChooserPromise;
  await pdfFileChooser.setFiles({
    name: 'test-document.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 mock pdf data')
  });

  await expect(page.getByText('test-document.pdf')).toBeVisible();

  // 4. Submitting the form and verifying the successful redirection.
  await page.getByRole('button', { name: 'Submit Ticket' }).click();

  // Should redirect to ticket detail page
  await expect(page).toHaveURL(/.*tickets\/[0-9a-fA-F-]+/);
  await expect(page.getByRole('heading', { name: summary })).toBeVisible();

  // 5. Verifying the newly created ticket details appear correctly on the My Tickets dashboard.
  await page.getByRole('link', { name: 'Back to My Tickets' }).click();
  await expect(page).toHaveURL('/');
  
  // The new ticket summary should be in the table
  await expect(page.getByText(summary)).toBeVisible();
  
  // Test filtering by summary
  await page.getByLabel(/Search Summary/).fill(summary);
  await page.getByRole('button', { name: 'Search' }).click();
  
  // Should still see it
  await expect(page.getByText(summary)).toBeVisible();
});
