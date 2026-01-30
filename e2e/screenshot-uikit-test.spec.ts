/**
 * Quick script to screenshot the PBI UI Kit Test template
 * Run with: npx playwright test e2e/screenshot-uikit-test.spec.ts
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';

test('Screenshot PBI UI Kit Test Template', async ({ page, context }) => {
  // Capture console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Clear cache and storage
  await context.clearCookies();

  // Set large viewport
  await page.setViewportSize({ width: 1920, height: 1600 });

  // Navigate to preview server
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Wait for app to load
  await page.waitForTimeout(3000);

  // Click on the Templates dropdown
  const templatesButton = page.locator('button:has-text("Templates"), button:has-text("Retail Dashboard")').first();

  if (await templatesButton.isVisible()) {
    await templatesButton.click();
    await page.waitForTimeout(1000);
  }

  // Click the PBI UI Kit Test template
  const testOption = page.locator('text=PBI UI Kit Test').first();
  if (await testOption.isVisible({ timeout: 2000 })) {
    await testOption.click();
    await page.waitForTimeout(8000);

    const itemCount = await page.locator('.react-grid-item').count();
    console.log(`Found ${itemCount} grid items`);

    // Take full page screenshot
    await page.screenshot({ path: 'e2e/screenshots/pbi-uikit-test-full.png', fullPage: true });

    // Also take viewport screenshot
    await page.screenshot({ path: 'e2e/screenshots/pbi-uikit-test-viewport.png' });

    // Scroll to bottom for remaining charts
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'e2e/screenshots/pbi-uikit-test-bottom.png' });

  } else {
    console.log('Template not found');
  }

  if (errors.length > 0) {
    console.log('Console errors (first 5):', errors.slice(0, 5));
  }

  console.log('Screenshots saved');
});
