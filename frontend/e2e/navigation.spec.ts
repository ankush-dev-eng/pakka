import { test, expect } from '@playwright/test';

test.describe('Navigation and UI Tests', () => {
  test('About and Community navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to About
    await page.click('text=About');
    await expect(page.locator('h1', { hasText: 'About Pakka' })).toBeVisible();

    // Navigate to Community
    await page.click('text=Community');
    await expect(page.locator('h1', { hasText: 'Community Safety' })).toBeVisible();
  });

  test('Desktop and mobile layout', async ({ page }) => {
    // Desktop is default in config
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // Mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
  });
});
