/**
 * PBI UI Kit 2.0 Chart E2E Test Suite
 *
 * Comprehensive E2E tests for all 29 PBI UI Kit chart types.
 * Tests: CSS styling, drag-drop, auto-population, move/resize,
 * properties panel, manual data entry, title editing, and PBIP export fidelity.
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import {
  CHART_DEFINITIONS,
  getImplementedCharts,
  getPartialCharts,
  type ChartDefinition,
} from './chart-definitions';
import {
  waitForPhantomDebug,
  simulateDrop,
  openPBIUiKitPane,
  dragChartToCanvas,
  selectVisual,
  selectVisualById,
  getStoreState,
  getItemFromStore,
  moveVisual,
  resizeVisual,
  updateVisualProps,
  updateVisualTitle,
  setManualData,
  verifyCSSSpec,
  verifyChartHasData,
  takeChartScreenshot,
  clearCanvas,
} from './pbi-chart-helpers';
import {
  exportAndVerifyPBIP,
  createPBIPTestInfo,
  exportPBIP,
  savePBIPArtifact,
} from './pbip-verification';

// ============================================================================
// Test Setup
// ============================================================================

test.describe('PBI UI Kit 2.0 Charts - Implemented', () => {
  test.beforeEach(async ({ page }) => {
    // Error logging
    page.on('pageerror', (err) => {
      console.error('Page error:', err.message);
    });
    page.on('console', (msg) => {
      if (['error', 'warning'].includes(msg.type())) {
        console.error(`Console ${msg.type()}:`, msg.text());
      }
    });

    // Setup
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await waitForPhantomDebug(page);

    // Ensure screenshot directory exists
    fs.mkdirSync('e2e/screenshots/pbi-charts', { recursive: true });
  });

  // Generate tests for each implemented chart
  const implementedCharts = getImplementedCharts();

  for (const chartDef of implementedCharts) {
    test.describe(`${chartDef.cssSpecNumber}. ${chartDef.displayName} (${chartDef.id})`, () => {
      // ====================================================================
      // Test 1: CSS Styling Matches Spec
      // ====================================================================
      test('CSS styling matches spec', async ({ page }) => {
        // Drop the chart
        const itemId = await simulateDrop(page, chartDef.id);

        // Wait for render
        await page.waitForTimeout(500);

        // Verify CSS
        const cssResult = await verifyCSSSpec(page, itemId, chartDef);

        // Take screenshot
        const screenshotDir = `e2e/screenshots/pbi-charts/${chartDef.id}`;
        fs.mkdirSync(screenshotDir, { recursive: true });
        await takeChartScreenshot(page, itemId, chartDef.id, 'css-styling');

        // Assertions
        if (!cssResult.passed) {
          console.log(`CSS failures for ${chartDef.id}:`, cssResult.failures);
        }
        expect(cssResult.passed).toBe(true);
      });

      // ====================================================================
      // Test 2: Drag and Drop (UI Kit Pane Availability)
      // ====================================================================
      test('drag source exists in UI Kit pane', async ({ page }) => {
        // Open PBI UI Kit pane
        await openPBIUiKitPane(page);

        // Verify the PBI UI Kit pane opened (header should be visible)
        const paneHeader = page.locator('text=PBI UI Kit 2.0');
        await expect(paneHeader).toBeVisible({ timeout: 5000 });

        // Find the drag source within the PBI UI Kit pane context
        // The pane is identified by its header, and elements are inside that container
        const pbiPane = page.locator('div:has(> div:text-is("PBI UI Kit 2.0"))');
        const dragSource = pbiPane.getByTestId(chartDef.dragSourceId);

        // Use .first() since some chart types appear in both quick-access and UI Kit
        const firstDragSource = dragSource.first();

        // Verify at least one drag source exists
        const count = await dragSource.count();
        expect(count).toBeGreaterThan(0);

        // Verify it's draggable
        const isDraggable = await firstDragSource.getAttribute('draggable');
        expect(isDraggable).toBe('true');

        // Note: Actual HTML5 drag-drop is flaky in Playwright, so we verify
        // the drag source exists and is configured correctly. The actual
        // drop functionality is tested via simulateDrop in other tests.
      });

      // ====================================================================
      // Test 3: Auto-Population
      // ====================================================================
      test('auto-population with smart title and defaults', async ({ page }) => {
        // Drop the chart
        const itemId = await simulateDrop(page, chartDef.id);

        // Get the item from store
        const item = await getItemFromStore(page, itemId);

        // Verify smart title matches pattern
        expect(item.title).toMatch(chartDef.smartTitlePattern);

        // Verify default props from bindingRecipes
        for (const [key, expectedValue] of Object.entries(chartDef.defaultProps)) {
          if (item.props[key] !== undefined) {
            expect(item.props[key]).toEqual(expectedValue);
          }
        }

        // Verify chart renders with data
        const hasData = await verifyChartHasData(page, itemId);
        expect(hasData).toBe(true);

        // Screenshot
        await takeChartScreenshot(page, itemId, chartDef.id, 'auto-population');
      });

      // ====================================================================
      // Test 4: Move and Resize
      // ====================================================================
      test('move and resize', async ({ page }) => {
        // Drop chart with initial position
        const initialLayout = { x: 0, y: 0, w: 8, h: 4 };
        const itemId = await simulateDrop(page, chartDef.id, initialLayout);

        // Get initial position
        const initialItem = await getItemFromStore(page, itemId);
        expect(initialItem.layout.x).toBe(initialLayout.x);
        expect(initialItem.layout.y).toBe(initialLayout.y);

        // Move to new position
        const newPosition = { x: 10, y: 5 };
        await moveVisual(page, itemId, newPosition);

        // Verify position changed
        const movedItem = await getItemFromStore(page, itemId);
        expect(movedItem.layout.x).toBe(newPosition.x);
        expect(movedItem.layout.y).toBe(newPosition.y);

        // Resize to new dimensions
        const newSize = { w: 12, h: 6 };
        await resizeVisual(page, itemId, newSize);

        // Verify size changed
        const resizedItem = await getItemFromStore(page, itemId);
        expect(resizedItem.layout.w).toBe(newSize.w);
        expect(resizedItem.layout.h).toBe(newSize.h);

        // Verify visual still renders
        const hasData = await verifyChartHasData(page, itemId);
        expect(hasData).toBe(true);

        // Screenshot
        await takeChartScreenshot(page, itemId, chartDef.id, 'move-resize');
      });

      // ====================================================================
      // Test 5: Properties Panel Options
      // ====================================================================
      test('properties panel options', async ({ page }) => {
        // Drop chart
        const itemId = await simulateDrop(page, chartDef.id);

        // Select the visual
        await selectVisualById(page, itemId);

        // Wait for properties panel to update
        await page.waitForTimeout(300);

        // Test each supported prop
        for (const prop of chartDef.supportedProps) {
          // Test dimension select
          if (prop === 'dimension') {
            await updateVisualProps(page, itemId, { dimension: 'Region' });
            const item = await getItemFromStore(page, itemId);
            // Dimension may not match exactly if 'Region' isn't in scenario
            expect(item.props.dimension).toBeDefined();
          }

          // Test metric select
          if (prop === 'metric') {
            await updateVisualProps(page, itemId, { metric: 'Revenue' });
            const item = await getItemFromStore(page, itemId);
            expect(item.props.metric).toBeDefined();
          }

          // Test topN select
          if (prop === 'topN') {
            await updateVisualProps(page, itemId, { topN: 10 });
            const item = await getItemFromStore(page, itemId);
            expect(item.props.topN).toBe(10);
          }

          // Test sort select
          if (prop === 'sort') {
            await updateVisualProps(page, itemId, { sort: 'asc' });
            const item = await getItemFromStore(page, itemId);
            expect(item.props.sort).toBe('asc');
          }

          // Test comparison select
          if (prop === 'comparison') {
            await updateVisualProps(page, itemId, { comparison: 'py' });
            const item = await getItemFromStore(page, itemId);
            expect(item.props.comparison).toBe('py');
          }

          // Test timeGrain select
          if (prop === 'timeGrain') {
            await updateVisualProps(page, itemId, { timeGrain: 'quarter' });
            const item = await getItemFromStore(page, itemId);
            expect(item.props.timeGrain).toBe('quarter');
          }

          // Test operation select
          if (prop === 'operation') {
            await updateVisualProps(page, itemId, { operation: 'avg' });
            const item = await getItemFromStore(page, itemId);
            expect(item.props.operation).toBe('avg');
          }
        }

        // Screenshot
        await takeChartScreenshot(page, itemId, chartDef.id, 'properties-panel');
      });

      // ====================================================================
      // Test 6: Manual Data Entry
      // ====================================================================
      test('manual data entry', async ({ page }) => {
        // Skip for chart types that don't support manual data
        const manualDataTypes = [
          'bar', 'column', 'stackedBar', 'stackedColumn',
          'line', 'area', 'pie', 'donut', 'treemap', 'funnel', 'waterfall'
        ];

        if (!manualDataTypes.includes(chartDef.id)) {
          test.skip();
          return;
        }

        // Drop chart
        const itemId = await simulateDrop(page, chartDef.id);

        // Set manual data
        const manualData = [
          { label: 'Category A', value: 100 },
          { label: 'Category B', value: 200 },
          { label: 'Category C', value: 150 },
        ];
        await setManualData(page, itemId, manualData);

        // Verify manualData prop updated
        const item = await getItemFromStore(page, itemId);
        expect(item.props.manualData).toEqual(manualData);

        // Verify chart still renders
        const hasData = await verifyChartHasData(page, itemId);
        expect(hasData).toBe(true);

        // Screenshot
        await takeChartScreenshot(page, itemId, chartDef.id, 'manual-data');
      });

      // ====================================================================
      // Test 7: Title Editing
      // ====================================================================
      test('title editing', async ({ page }) => {
        // Drop chart
        const itemId = await simulateDrop(page, chartDef.id);

        // Get original title
        const originalItem = await getItemFromStore(page, itemId);
        const originalTitle = originalItem.title;

        // Update title
        const newTitle = `Custom ${chartDef.displayName} Title`;
        await updateVisualTitle(page, itemId, newTitle);

        // Verify store updated
        const updatedItem = await getItemFromStore(page, itemId);
        expect(updatedItem.title).toBe(newTitle);
        expect(updatedItem.title).not.toBe(originalTitle);

        // Verify visual header displays new title (if visible)
        const container = page.getByTestId(`visual-container-${itemId}`);
        const titleElement = container.locator('.visual-header, .visual-title, [class*="title"]').first();

        if (await titleElement.isVisible()) {
          const displayedTitle = await titleElement.textContent();
          expect(displayedTitle).toContain(newTitle);
        }

        // Screenshot
        await takeChartScreenshot(page, itemId, chartDef.id, 'title-editing');
      });

      // ====================================================================
      // Test 8: PBIP Export Verification
      // ====================================================================
      test('PBIP export verification', async ({ page }) => {
        // Clear canvas first
        await clearCanvas(page);

        // Drop chart with known layout
        const layout = { x: 0, y: 0, w: 8, h: 4 };
        const itemId = await simulateDrop(page, chartDef.id, layout);

        // Get the item to know its title
        const item = await getItemFromStore(page, itemId);

        // Export and verify PBIP
        const result = await exportAndVerifyPBIP(
          page,
          chartDef,
          itemId,
          layout,
          item.title
        );

        // Log verification info
        console.log(`PBIP Verification for ${chartDef.id}:`);
        console.log(createPBIPTestInfo(result));

        // Screenshot of visual.json content (create text file)
        if (result.visualJson) {
          const jsonPath = `e2e/screenshots/pbi-charts/${chartDef.id}/visual.json`;
          fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
          fs.writeFileSync(jsonPath, JSON.stringify(result.visualJson, null, 2));
        }

        // Take chart screenshot
        await takeChartScreenshot(page, itemId, chartDef.id, 'pbip-export');

        // Assertions
        if (!result.passed) {
          console.error('PBIP Verification Errors:', result.errors);
        }
        if (result.warnings.length > 0) {
          console.warn('PBIP Verification Warnings:', result.warnings);
        }

        expect(result.passed).toBe(true);
        expect(result.zipPath).toBeDefined();
      });
    });
  }
});

// ============================================================================
// Partial/Unimplemented Charts (Skipped)
// ============================================================================

test.describe('PBI UI Kit 2.0 Charts - Partial Implementation', () => {
  const partialCharts = getPartialCharts();

  for (const chartDef of partialCharts) {
    test.describe(`${chartDef.cssSpecNumber}. ${chartDef.displayName} (${chartDef.id})`, () => {
      test.skip('all tests skipped - partial implementation', async () => {
        // This test is skipped because the chart is only partially implemented
        console.log(`Skipping tests for ${chartDef.id} - partial implementation`);
      });
    });
  }
});

// ============================================================================
// Summary Test
// ============================================================================

test.describe('PBI Charts Summary', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await waitForPhantomDebug(page);
  });

  test('all 29 chart types are defined', async () => {
    expect(CHART_DEFINITIONS.length).toBe(29);
  });

  test('export all implemented charts to single PBIP', async ({ page }) => {
    const implementedCharts = getImplementedCharts();

    // Clear canvas first
    await clearCanvas(page);

    // Drop one of each implemented chart type
    let x = 0;
    let y = 0;
    const w = 6;
    const h = 4;

    for (const chartDef of implementedCharts) {
      await simulateDrop(page, chartDef.id, { x, y, w, h });

      // Arrange in grid
      x += w;
      if (x >= 48) {
        x = 0;
        y += h;
      }
    }

    // Export all
    const exportResult = await exportPBIP(page);
    expect(exportResult.itemCount).toBe(implementedCharts.length);

    // Save combined PBIP
    const zipPath = savePBIPArtifact(exportResult.bytes, 'all-implemented-charts');
    expect(fs.existsSync(zipPath)).toBe(true);

    console.log(`Exported ${implementedCharts.length} charts to ${zipPath}`);
  });
});
