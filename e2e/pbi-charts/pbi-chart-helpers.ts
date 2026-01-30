/**
 * PBI Chart E2E Test Helpers
 *
 * Shared helper functions for testing PBI UI Kit 2.0 charts.
 */

import type { Page } from '@playwright/test';
import type { ChartDefinition } from './chart-definitions';
import { PBI_CSS_TOKENS, type CSSVerificationResult, type CSSFailure } from './pbi-css-tokens';

// ============================================================================
// Core Test Helpers
// ============================================================================

/**
 * Wait for Phantom debug hooks to be available
 */
export async function waitForPhantomDebug(page: Page): Promise<void> {
  await page.waitForFunction(() => (window as any).__phantomDebug !== undefined, {
    timeout: 15000,
  });
}

/**
 * Programmatic drop - bypasses HTML5 drag-drop flakiness
 * Returns the ID of the newly created item
 */
export async function simulateDrop(
  page: Page,
  visualType: string,
  layout?: { x: number; y: number; w: number; h: number }
): Promise<string> {
  const itemId = await page.evaluate(
    ({ vt, layoutOverride }) => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      const recipe = debug.getRecipeForVisual(vt, state.scenario);
      const title = debug.generateSmartTitle(vt, recipe, state.scenario);
      const id = `visual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      state.addItem({
        id,
        type: vt,
        title,
        layout: layoutOverride || { x: 0, y: 0, w: 8, h: 4 },
        props: { ...recipe },
      });

      return id;
    },
    { vt: visualType, layoutOverride: layout }
  );

  // Wait for visual to render
  await page.waitForTimeout(200);
  return itemId;
}

/**
 * Open PBI UI Kit pane
 */
export async function openPBIUiKitPane(page: Page): Promise<void> {
  // The PBI UI Kit button has title="PBI UI Kit 2.0"
  const pbiButton = page.locator('button[title="PBI UI Kit 2.0"]');

  if (await pbiButton.isVisible({ timeout: 2000 })) {
    await pbiButton.click();
    await page.waitForTimeout(300);
    return;
  }

  // Fallback: look for the DesignIdeasRegular icon button in the nav
  const navButtons = page.locator('nav button');
  const count = await navButtons.count();

  // Try each nav button until we find one that opens PBI UI Kit pane
  for (let i = 0; i < count; i++) {
    const btn = navButtons.nth(i);
    const title = await btn.getAttribute('title');
    if (title?.includes('PBI') || title?.includes('UI Kit')) {
      await btn.click();
      await page.waitForTimeout(300);
      return;
    }
  }

  // Last resort: click the last nav button (PBI UI Kit is typically last)
  if (count > 0) {
    await navButtons.nth(count - 1).click();
    await page.waitForTimeout(300);
  }
}

/**
 * HTML5 drag from PBI UI Kit pane to canvas
 */
export async function dragChartToCanvas(
  page: Page,
  sourceTestId: string,
  position: { x: number; y: number }
): Promise<void> {
  const source = page.getByTestId(sourceTestId);
  const canvas = page.locator('.layout');

  await source.waitFor({ state: 'visible', timeout: 5000 });
  await canvas.waitFor({ state: 'visible', timeout: 5000 });

  const sourceBounds = await source.boundingBox();
  const canvasBounds = await canvas.boundingBox();

  if (!sourceBounds || !canvasBounds) {
    throw new Error('Could not get bounding boxes for drag operation');
  }

  const startX = sourceBounds.x + sourceBounds.width / 2;
  const startY = sourceBounds.y + sourceBounds.height / 2;
  const endX = canvasBounds.x + position.x;
  const endY = canvasBounds.y + position.y;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 10 });
  await page.mouse.up();

  await page.waitForTimeout(300);
}

/**
 * Select a visual by clicking on it
 */
export async function selectVisual(page: Page, visualId: string): Promise<void> {
  const container = page.getByTestId(`visual-container-${visualId}`);
  await container.waitFor({ state: 'visible', timeout: 5000 });
  await container.click();
  await page.waitForTimeout(200);
}

/**
 * Select a visual by ID through the store
 */
export async function selectVisualById(page: Page, visualId: string): Promise<void> {
  await page.evaluate((id) => {
    const debug = (window as any).__phantomDebug;
    debug.useStore.getState().selectItem(id);
  }, visualId);
  await page.waitForTimeout(200);
}

/**
 * Get the current store state
 */
export async function getStoreState(page: Page): Promise<any> {
  return page.evaluate(() => {
    const debug = (window as any).__phantomDebug;
    return debug.useStore.getState();
  });
}

/**
 * Get a specific item from the store
 */
export async function getItemFromStore(page: Page, itemId: string): Promise<any> {
  return page.evaluate((id) => {
    const debug = (window as any).__phantomDebug;
    const state = debug.useStore.getState();
    return state.items.find((item: any) => item.id === id);
  }, itemId);
}

// ============================================================================
// Move and Resize Helpers
// ============================================================================

/**
 * Move a visual to a new position
 * Uses the updateLayout function which expects array with {i, x, y, w, h} items
 */
export async function moveVisual(
  page: Page,
  visualId: string,
  newLayout: { x: number; y: number }
): Promise<void> {
  await page.evaluate(
    ({ id, layout }) => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      const item = state.items.find((i: any) => i.id === id);
      if (item) {
        // updateLayout expects an array with {i, x, y, w, h} format
        state.updateLayout([
          { i: id, x: layout.x, y: layout.y, w: item.layout.w, h: item.layout.h }
        ]);
      }
    },
    { id: visualId, layout: newLayout }
  );
  await page.waitForTimeout(100);
}

/**
 * Resize a visual to new dimensions
 * Uses the updateLayout function which expects array with {i, x, y, w, h} items
 */
export async function resizeVisual(
  page: Page,
  visualId: string,
  newSize: { w: number; h: number }
): Promise<void> {
  await page.evaluate(
    ({ id, size }) => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      const item = state.items.find((i: any) => i.id === id);
      if (item) {
        // updateLayout expects an array with {i, x, y, w, h} format
        state.updateLayout([
          { i: id, x: item.layout.x, y: item.layout.y, w: size.w, h: size.h }
        ]);
      }
    },
    { id: visualId, size: newSize }
  );
  await page.waitForTimeout(100);
}

// ============================================================================
// Properties Panel Helpers
// ============================================================================

/**
 * Update a visual's props through the store
 */
export async function updateVisualProps(
  page: Page,
  visualId: string,
  props: Record<string, unknown>
): Promise<void> {
  await page.evaluate(
    ({ id, newProps }) => {
      const debug = (window as any).__phantomDebug;
      debug.useStore.getState().updateItemProps(id, newProps);
    },
    { id: visualId, newProps: props }
  );
  await page.waitForTimeout(100);
}

/**
 * Update a visual's title through the store
 */
export async function updateVisualTitle(page: Page, visualId: string, title: string): Promise<void> {
  await page.evaluate(
    ({ id, newTitle }) => {
      const debug = (window as any).__phantomDebug;
      debug.useStore.getState().updateItemTitle(id, newTitle);
    },
    { id: visualId, newTitle: title }
  );
  await page.waitForTimeout(100);
}

/**
 * Set manual data for a visual
 */
export async function setManualData(
  page: Page,
  visualId: string,
  data: Array<{ label: string; value: number }>
): Promise<void> {
  await updateVisualProps(page, visualId, { manualData: data });
}

// ============================================================================
// CSS Verification Helpers
// ============================================================================

/**
 * Verify CSS styling matches PBI spec
 */
export async function verifyCSSSpec(
  page: Page,
  visualId: string,
  chartDef: ChartDefinition
): Promise<CSSVerificationResult> {
  const failures: CSSFailure[] = [];

  // Get the visual container
  const container = page.getByTestId(`visual-container-${visualId}`);
  const isVisible = await container.isVisible();

  if (!isVisible) {
    failures.push({
      property: 'visibility',
      expected: 'visible',
      actual: 'not visible',
      element: `visual-container-${visualId}`,
    });
    return { passed: false, failures };
  }

  // Check title font if visible
  const titleElement = container.locator('.visual-header, .visual-title, [class*="title"]').first();
  if (await titleElement.isVisible()) {
    const titleStyles = await titleElement.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
      };
    });

    // Check font family contains Inter or Segoe UI
    const hasValidFont =
      titleStyles.fontFamily.includes('Inter') || titleStyles.fontFamily.includes('Segoe UI');

    if (!hasValidFont) {
      failures.push({
        property: 'fontFamily',
        expected: 'Inter or Segoe UI',
        actual: titleStyles.fontFamily,
        element: 'title',
      });
    }
  }

  // For KPI/Card types, check value styling
  if (['card', 'kpi', 'gauge'].includes(chartDef.id)) {
    const valueElement = container.locator('[class*="value"], [class*="kpi"], .callout-value').first();
    if (await valueElement.isVisible()) {
      const valueStyles = await valueElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
        };
      });

      // KPI values should be at least 20px
      const fontSize = parseInt(valueStyles.fontSize, 10);
      if (fontSize < 20) {
        failures.push({
          property: 'fontSize',
          expected: '>=20px',
          actual: valueStyles.fontSize,
          element: 'kpi-value',
        });
      }
    }
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Verify chart renders with data elements
 */
export async function verifyChartHasData(page: Page, visualId: string): Promise<boolean> {
  const container = page.getByTestId(`visual-container-${visualId}`);
  await container.waitFor({ state: 'visible', timeout: 5000 });

  // Check for common data elements (SVG paths, bars, lines, etc.)
  const hasDataElements = await container.evaluate((el) => {
    const svg = el.querySelector('svg');
    if (svg) {
      const paths = svg.querySelectorAll('path, rect, circle, line');
      return paths.length > 0;
    }

    // Check for canvas
    const canvas = el.querySelector('canvas');
    if (canvas) {
      return true;
    }

    // Check for table rows
    const rows = el.querySelectorAll('tr, [role="row"]');
    if (rows.length > 0) {
      return true;
    }

    // Check for value display (KPI/Card)
    const values = el.querySelectorAll('[class*="value"], [class*="kpi"], [class*="callout"]');
    if (values.length > 0) {
      return true;
    }

    return false;
  });

  return hasDataElements;
}

// ============================================================================
// Screenshot Helpers
// ============================================================================

/**
 * Take a screenshot of a specific visual
 */
export async function takeChartScreenshot(
  page: Page,
  visualId: string,
  chartId: string,
  testName: string
): Promise<string> {
  const container = page.getByTestId(`visual-container-${visualId}`);
  const screenshotPath = `e2e/screenshots/pbi-charts/${chartId}/${testName}.png`;

  await container.screenshot({
    path: screenshotPath,
    animations: 'disabled',
  });

  return screenshotPath;
}

/**
 * Take a full-page screenshot
 */
export async function takeFullPageScreenshot(page: Page, name: string): Promise<string> {
  const screenshotPath = `e2e/screenshots/pbi-charts/${name}.png`;

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  return screenshotPath;
}

// ============================================================================
// Cleanup Helpers
// ============================================================================

/**
 * Clear all items from the canvas
 */
export async function clearCanvas(page: Page): Promise<void> {
  await page.evaluate(() => {
    const debug = (window as any).__phantomDebug;
    const state = debug.useStore.getState();
    state.items.forEach((item: any) => {
      state.removeItem(item.id);
    });
  });
  await page.waitForTimeout(100);
}

/**
 * Remove a specific item from the canvas
 */
export async function removeItem(page: Page, itemId: string): Promise<void> {
  await page.evaluate((id) => {
    const debug = (window as any).__phantomDebug;
    debug.useStore.getState().removeItem(id);
  }, itemId);
  await page.waitForTimeout(100);
}
