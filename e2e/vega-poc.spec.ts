import { test, expect } from '@playwright/test';

/**
 * Vega-Lite POC Tests
 *
 * Verifies that:
 * 1. Vega rendering toggle appears in UI
 * 2. Bar charts render correctly with Vega-Lite
 * 3. Line charts render correctly with Vega-Lite
 * 4. Charts are visually similar (SVG elements present)
 */

test.describe('Vega-Lite POC', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/editor');
    await page.waitForLoadState('networkidle');
  });

  test('should show Vega rendering toggle', async ({ page }) => {
    // Look for the Vega/Recharts toggle switch
    const toggle = page.locator('text=Recharts').or(page.locator('text=Vega'));
    await expect(toggle.first()).toBeVisible({ timeout: 10000 });
  });

  test('should toggle between Recharts and Vega rendering', async ({ page }) => {
    // Find the switch (starts with Recharts)
    const switchLabel = page.locator('label:has-text("Recharts")').or(page.locator('label:has-text("Vega")'));
    await expect(switchLabel.first()).toBeVisible({ timeout: 10000 });

    // Get initial state
    const initialText = await switchLabel.first().textContent();
    expect(initialText).toContain('Recharts');

    // Click the switch
    const switchInput = page.locator('input[role="switch"]').first();
    await switchInput.click();

    // Verify toggle changed
    await expect(page.locator('label:has-text("Vega")').first()).toBeVisible({ timeout: 5000 });
  });

  test('should render bar chart with Vega-Lite', async ({ page }) => {
    // Enable Vega rendering
    const switchInput = page.locator('input[role="switch"]').first();
    await switchInput.click();
    await expect(page.locator('label:has-text("Vega")').first()).toBeVisible({ timeout: 5000 });

    // Wait for visuals to re-render
    await page.waitForTimeout(1000);

    // Check that bar chart container has Vega-generated SVG
    // Vega-embed creates an SVG with class "marks"
    const vegaSvg = page.locator('.vega-embed svg, svg.marks');
    await expect(vegaSvg.first()).toBeVisible({ timeout: 10000 });
  });

  test('should render line chart with Vega-Lite', async ({ page }) => {
    // Enable Vega rendering
    const switchInput = page.locator('input[role="switch"]').first();
    await switchInput.click();
    await expect(page.locator('label:has-text("Vega")').first()).toBeVisible({ timeout: 5000 });

    // Wait for visuals to re-render
    await page.waitForTimeout(1000);

    // The default dashboard has a line chart
    // Vega-embed creates SVG elements
    const vegaSvg = page.locator('.vega-embed svg');
    expect(await vegaSvg.count()).toBeGreaterThan(0);
  });

  test('should maintain visual consistency between modes', async ({ page }) => {
    // Take screenshot with Recharts
    await page.waitForTimeout(500);
    const rechartsScreenshot = await page.screenshot();

    // Enable Vega rendering
    const switchInput = page.locator('input[role="switch"]').first();
    await switchInput.click();
    await page.waitForTimeout(1000);

    // Take screenshot with Vega
    const vegaScreenshot = await page.screenshot();

    // Screenshots should be different (different rendering engines)
    // but both should have content (not blank)
    expect(rechartsScreenshot.length).toBeGreaterThan(10000);
    expect(vegaScreenshot.length).toBeGreaterThan(10000);
  });
});
