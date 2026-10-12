import { test, expect } from '@playwright/test';

test('smoke test landing page', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  const heading = page.locator('h1');
  await expect(heading).toContainText('Is this offer actually real?');
});
