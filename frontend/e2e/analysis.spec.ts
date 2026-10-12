import { test, expect, Page } from '@playwright/test';

test.describe('Analysis E2E Tests', () => {
  // Common helper to wait for result load
  const waitForResult = async (page: Page) => {
    await page.waitForURL('**/result/**', { timeout: 15000 });
    // Wait for the analyzing text to go away on the result page if it exists
    await expect(page.locator('body')).not.toContainText('Checking signals...', { timeout: 10000 });
    await page.waitForTimeout(500); 
  };

  test('Genuine input analysis', async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    await page.goto('/');
    await page.fill('textarea[placeholder*="Paste the offer email"]', 'This is a normal message asking how you are doing today.');
    await page.click('button:has-text("Check this offer")');
    await waitForResult(page);
    await expect(page.locator('body')).toContainText('Looks Pakka');
  });

  test('Scam input analysis - Fee request', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea[placeholder*="Paste the offer email"]', 'Pay ₹2000 through upi for your package delivery fee.');
    await page.click('button:has-text("Check this offer")');
    await waitForResult(page);
    await expect(page.locator('body')).toContainText('Likely Scam');
    // Verify fee_request red flag was caught
    await expect(page.locator('body')).toContainText('Fee Request');
  });

  test('Insufficient information input', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea[placeholder*="Paste the offer email"]', 'jagftmmt');
    await page.click('button:has-text("Check this offer")');
    await waitForResult(page);
    await expect(page.locator('body')).toContainText('Insufficient Information');
  });

  test('Empty or whitespace input', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea[placeholder*="Paste the offer email"]', '   \n   ');
    // Button should be disabled or it should block submission
    const button = page.locator('button:has-text("Check this offer")');
    await expect(button).toBeDisabled();
  });

  test('Language switching on result page', async ({ page }) => {
    await page.goto('/');
    await page.fill('textarea[placeholder*="Paste the offer email"]', 'Pay ₹2000 through upi');
    await page.click('button:has-text("Check this offer")');
    await waitForResult(page);

    // Default language is English
    await expect(page.locator('body')).toContainText('Likely Scam');

    // Switch to Hindi
    await page.getByRole('button', { name: 'hi', exact: true }).click();
    await expect(page.locator('body')).toContainText('संभावित घोटाला (Likely Scam)');

    // Switch to Bengali
    await page.getByRole('button', { name: 'bn', exact: true }).click();
    await expect(page.locator('body')).toContainText('সম্ভাব্য প্রতারণা (Likely Scam)');
  });
});
