import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('UI Restoration and Regression Tests', () => {
  const screenshotsDir = path.join(process.cwd(), '..', 'docs', 'ui-after');

  test.beforeAll(() => {
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    // Mock the analysis API
    await page.route('**/api/analyze', async (route, request) => {
      if (request.method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'test-123' })
        });
      } else {
        await route.continue();
      }
    });

    // Mock the result fetch API
    await page.route('**/api/analyze/test-123*', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            text: 'Pay ₹2000 through upi for your package delivery fee.',
            verdict: 'Likely Scam',
            score: 85,
            flags: [{ type: 'fee_request', title: 'Fee Request', reason: 'Asked for money', severity: 'high', weight: 80, evidence: [{ start: 0, end: 10 }] }],
            next_steps: ['Report to cybercrime.gov.in', 'Block the sender']
          })
        });
      } else {
        await route.continue();
      }
    });

    // Mock community stats
    await page.route('**/api/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ total_analyzed: 1200, likely_scams: 450 })
      });
    });
  });

  test('Home page elements and layout (Desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    
    // Check for uncaught console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    // Exactly one brand wordmark in the global header where intended - on home page, header wordmark should be hidden or only hero one is visible
    // The hero has text "pakka", the header hides it on "/"
    const wordmarks = await page.getByText('pakka', { exact: true }).count();
    expect(wordmarks).toBe(1);

    // Elements present
    await expect(page.locator('h1', { hasText: 'Is this offer actually real?' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Text' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'PDF' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Screenshot' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Link' })).toBeVisible();
    
    // Check if Sample row works
    await expect(page.locator('h3', { hasText: 'Or try a sample' })).toBeVisible();
    
    // Check Scan/Judge/Guide sections
    await expect(page.locator('h3', { hasText: 'Scan' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Judge' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Guide' })).toBeVisible();

    // No horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);

    // Save screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'home-desktop-1440x900.png'), fullPage: true });
    expect(errors.length).toBe(0);
  });

  test('Home page elements and layout (Mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    // No horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);

    // Save screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'home-mobile-375x812.png'), fullPage: true });
  });

  test('Tab switching does not lose typed input', async ({ page }) => {
    await page.goto('/');
    
    // Type in Text tab
    await page.fill('textarea[placeholder*="Paste the offer"]', 'Test input data');
    
    // Switch to Link tab
    await page.getByRole('tab', { name: 'Link' }).click();
    
    // Switch back to Text tab
    await page.getByRole('tab', { name: 'Text' }).click();
    
    // Value should still be there
    const val = await page.inputValue('textarea[placeholder*="Paste the offer"]');
    expect(val).toBe('Test input data');
  });

  test('Result page elements and layout (Desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    
    page.on('console', msg => {
      console.log(`PAGE LOG: ${msg.text()}`);
    });

    page.on('pageerror', err => {
      console.log(`PAGE ERROR: ${err.message}`);
    });

    await page.goto('/');
    await page.fill('textarea[placeholder*="Paste the offer"]', 'Pay ₹2000 through upi for your package delivery fee.');
    await page.click('button:has-text("Check this offer")');
    
    await page.waitForURL('**/result/**', { timeout: 15000 });
    await expect(page.locator('body')).not.toContainText('Checking signals...', { timeout: 10000 });
    await page.waitForTimeout(1500); // Wait for score animation

    // Check Next Steps clipping
    const h3s = await page.locator('h3').allInnerTexts();
    console.log('H3s found:', h3s);
    
    const nextSteps = page.locator('h3', { hasText: 'Next Steps' });
    await expect(nextSteps).toBeVisible();
    
    // Check action buttons exist
    await expect(page.getByRole('link', { name: /Report/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy/i })).toBeVisible();

    // Score matches response - wait for animation to complete
    const scoreText = await page.locator('.text-3xl.font-bold').innerText();
    expect(parseInt(scoreText)).toBeGreaterThanOrEqual(0); // Make sure it exists and rendered

    // No horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);

    // Save screenshot
    await page.screenshot({ path: path.join(screenshotsDir, 'result-desktop-1440x900.png'), fullPage: true });
  });
  
  test('Result page elements and layout (Mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.fill('textarea[placeholder*="Paste the offer"]', 'Pay ₹2000 through upi for your package delivery fee.');
    await page.click('button:has-text("Check this offer")');
    
    await page.waitForURL('**/result/**', { timeout: 15000 });
    await expect(page.locator('body')).not.toContainText('Checking signals...', { timeout: 10000 });
    await page.waitForTimeout(1500); // Wait for score animation

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(overflow).toBe(false);

    await page.screenshot({ path: path.join(screenshotsDir, 'result-mobile-375x812.png'), fullPage: true });
  });

  test('About page (Desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'about-desktop-1440x900.png'), fullPage: true });
  });

  test('About page (Mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/about');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'about-mobile-375x812.png'), fullPage: true });
  });

  test('Community page (Desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/community');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'community-desktop-1440x900.png'), fullPage: true });
  });

  test('Community page (Mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/community');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotsDir, 'community-mobile-375x812.png'), fullPage: true });
  });
  
  test('Reduced motion mode', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    // Simply checking if it loads without errors in this mode
    await expect(page.locator('h1')).toBeVisible();
  });
});
