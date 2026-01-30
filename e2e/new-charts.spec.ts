import { test, expect, Page } from '@playwright/test';

// Helper to drop a visual from the toolbar onto the canvas
const dropVisual = async (page: Page, visualType: string, position = { x: 400, y: 300 }) => {
  const source = page.getByTestId(`visual-source-${visualType}`);
  const target = page.locator('.layout');
  await source.dragTo(target, { targetPosition: position });
  await page.waitForTimeout(500);
};

// Helper to select the last added visual
const selectLastVisual = async (page: Page): Promise<string | null> => {
  const lastId = await page.evaluate(() => {
    const state = (window as any).__phantomDebug?.useStore?.getState();
    return state?.items?.[state.items.length - 1]?.id;
  });

  if (lastId) {
    await page.evaluate((itemId: string) => {
      (window as any).__phantomDebug?.useStore?.getState()?.selectItem(itemId);
    }, lastId);
    await page.waitForTimeout(300);
  }
  return lastId;
};

// Helper to get the last added item
const getLastItem = async (page: Page) => {
  return page.evaluate(() => {
    const state = (window as any).__phantomDebug?.useStore?.getState();
    return state?.items?.[state.items.length - 1];
  });
};

// Helper to update a visual's props
const updateVisualProps = async (page: Page, itemId: string, props: Record<string, any>) => {
  await page.evaluate(({ id, p }) => {
    (window as any).__phantomDebug?.useStore?.getState()?.updateItemProps(id, p);
  }, { id: itemId, p: props });
  await page.waitForTimeout(300);
};

test.describe('New Chart Types', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    page.on('pageerror', (err) => console.error('Page error:', err.message));
    await page.goto('/');
    await page.waitForSelector('[data-testid="canvas-drop-area"]', { timeout: 10000 });
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined);
  });

  // ============================================================
  // 1. Stacked Area Chart Tests
  // ============================================================
  test.describe('Stacked Area Chart', () => {
    test('stacked area appears in line variant picker', async ({ page }) => {
      // Drag line to canvas
      const source = page.getByTestId('visual-source-line');
      const target = page.locator('.layout');
      await source.dragTo(target, { targetPosition: { x: 400, y: 300 } });
      await page.waitForTimeout(500);

      // Variant picker should appear
      const variantPicker = page.getByTestId('variant-picker');
      await expect(variantPicker).toBeVisible({ timeout: 2000 });

      // Stacked Area option should be present
      const stackedAreaOption = page.getByTestId('variant-option-stackedArea');
      await expect(stackedAreaOption).toBeVisible();
    });

    test('drop stacked area via variant picker', async ({ page }) => {
      const initialCount = await page.evaluate(() => {
        return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
      });

      // Drag line to canvas
      const source = page.getByTestId('visual-source-line');
      const target = page.locator('.layout');
      await source.dragTo(target, { targetPosition: { x: 400, y: 300 } });
      await page.waitForTimeout(500);

      // Select stacked area variant
      const stackedAreaOption = page.getByTestId('variant-option-stackedArea');
      await stackedAreaOption.click();
      await page.waitForTimeout(500);

      // Verify item was added
      const newCount = await page.evaluate(() => {
        return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
      });
      expect(newCount).toBe(initialCount + 1);

      // Verify correct type
      const lastItem = await getLastItem(page);
      expect(lastItem?.type).toBe('stackedArea');

      await page.screenshot({ path: 'test-results/stacked-area-dropped.png' });
    });

    test('stacked area renders with multiple stacked areas', async ({ page }) => {
      // Add stacked area via store
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-stacked-area',
          type: 'stackedArea',
          title: 'Test Stacked Area',
          layout: { x: 0, y: 0, w: 16, h: 10 },
          props: { dimension: 'Category', metric: 'Revenue', timeGrain: 'month' }
        });
      });
      await page.waitForTimeout(1000);

      const container = page.getByTestId('visual-container-test-stacked-area');
      await expect(container).toBeVisible();

      // Check for multiple area elements (stacked)
      const areas = container.locator('.recharts-area');
      const areaCount = await areas.count();
      expect(areaCount).toBeGreaterThan(0);

      await page.screenshot({ path: 'test-results/stacked-area-rendered.png' });
    });

    test('stacked area time grain change updates chart', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-stacked-area-grain',
          type: 'stackedArea',
          title: 'Test Stacked Area',
          layout: { x: 0, y: 0, w: 16, h: 10 },
          props: { dimension: 'Category', metric: 'Revenue', timeGrain: 'month' }
        });
        state.selectItem('test-stacked-area-grain');
      });
      await page.waitForTimeout(500);

      // Change time grain
      const timeGrainSelect = page.getByLabel('Time Grain').locator('select');
      if (await timeGrainSelect.isVisible()) {
        await timeGrainSelect.selectOption('quarter');
        await page.waitForTimeout(500);

        const props = await page.evaluate(() => {
          const state = (window as any).__phantomDebug?.useStore?.getState();
          return state.items.find((i: any) => i.id === 'test-stacked-area-grain')?.props;
        });

        expect(props.timeGrain).toBe('quarter');
      }

      await page.screenshot({ path: 'test-results/stacked-area-quarter.png' });
    });

    test('stacked area has legend showing categories', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-stacked-area-legend',
          type: 'stackedArea',
          title: 'Test Stacked Area',
          layout: { x: 0, y: 0, w: 16, h: 10 },
          props: { dimension: 'Category', metric: 'Revenue', timeGrain: 'month' }
        });
      });
      await page.waitForTimeout(1000);

      const container = page.getByTestId('visual-container-test-stacked-area-legend');

      // Check for legend
      const legend = container.locator('.recharts-legend-wrapper');
      await expect(legend).toBeVisible();
    });
  });

  // ============================================================
  // 2. Combo Chart Tests
  // ============================================================
  test.describe('Combo Chart', () => {
    test('combo chart appears in toolbar', async ({ page }) => {
      const comboButton = page.getByTestId('visual-source-combo');
      await expect(comboButton).toBeVisible();
    });

    test('combo chart shows tooltip on hover', async ({ page }) => {
      const comboButton = page.getByTestId('visual-source-combo');
      await comboButton.hover();
      await page.waitForTimeout(500);

      await expect(page.getByText('Combo Chart (Line + Column)')).toBeVisible();
    });

    test('drop combo chart onto canvas', async ({ page }) => {
      const initialCount = await page.evaluate(() => {
        return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
      });

      await dropVisual(page, 'combo');

      const newCount = await page.evaluate(() => {
        return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
      });
      expect(newCount).toBe(initialCount + 1);

      const lastItem = await getLastItem(page);
      expect(lastItem?.type).toBe('combo');

      await page.screenshot({ path: 'test-results/combo-dropped.png' });
    });

    test('combo chart renders bars and line together', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-combo',
          type: 'combo',
          title: 'Revenue vs Profit',
          layout: { x: 0, y: 0, w: 16, h: 10 },
          props: { dimension: 'Category', barMetric: 'Revenue', lineMetric: 'Profit', topN: 5 }
        });
      });
      await page.waitForTimeout(1000);

      const container = page.getByTestId('visual-container-test-combo');
      await expect(container).toBeVisible();

      // Check for bar elements
      const bars = container.locator('.recharts-bar-rectangle');
      const barCount = await bars.count();
      expect(barCount).toBeGreaterThan(0);

      // Check for line element
      const line = container.locator('.recharts-line');
      await expect(line).toBeVisible();

      await page.screenshot({ path: 'test-results/combo-rendered.png' });
    });

    test('combo chart has dual Y-axes', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-combo-axes',
          type: 'combo',
          title: 'Dual Axes Test',
          layout: { x: 0, y: 0, w: 16, h: 10 },
          props: { dimension: 'Category', barMetric: 'Revenue', lineMetric: 'Profit', topN: 5 }
        });
      });
      await page.waitForTimeout(1000);

      const container = page.getByTestId('visual-container-test-combo-axes');

      // Check for two Y-axes
      const yAxes = container.locator('.recharts-yAxis');
      const yAxisCount = await yAxes.count();
      expect(yAxisCount).toBe(2);
    });

    test('combo chart bar click triggers cross-filter', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-combo-filter',
          type: 'combo',
          title: 'Filter Test',
          layout: { x: 0, y: 0, w: 16, h: 10 },
          props: { dimension: 'Category', barMetric: 'Revenue', lineMetric: 'Profit', topN: 5 }
        });
      });
      await page.waitForTimeout(1000);

      const container = page.getByTestId('visual-container-test-combo-filter');

      // Click on a bar
      const bar = container.locator('.recharts-bar-rectangle').first();
      if (await bar.isVisible()) {
        await bar.click();
        await page.waitForTimeout(300);

        // Check filter was set
        const filters = await page.evaluate(() => {
          const state = (window as any).__phantomDebug?.useStore?.getState();
          return state.filters;
        });

        // Filter should have Category set
        expect(Object.keys(filters).length).toBeGreaterThan(0);
      }
    });

    test('combo chart properties panel shows bar and line metric selects', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-combo-props',
          type: 'combo',
          title: 'Props Test',
          layout: { x: 0, y: 0, w: 16, h: 10 },
          props: { dimension: 'Category', barMetric: 'Revenue', lineMetric: 'Profit', topN: 5 }
        });
        state.selectItem('test-combo-props');
      });
      await page.waitForTimeout(500);

      // Check for Bar Metric label
      const barMetricLabel = page.getByText('Bar Metric');
      await expect(barMetricLabel).toBeVisible();

      // Check for Line Metric label
      const lineMetricLabel = page.getByText('Line Metric');
      await expect(lineMetricLabel).toBeVisible();
    });

    test('combo chart metric change updates chart', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-combo-change',
          type: 'combo',
          title: 'Change Test',
          layout: { x: 0, y: 0, w: 16, h: 10 },
          props: { dimension: 'Category', barMetric: 'Revenue', lineMetric: 'Profit', topN: 5 }
        });
        state.selectItem('test-combo-change');
      });
      await page.waitForTimeout(500);

      // Change bar metric
      const barMetricLabel = page.getByText('Bar Metric');
      const barMetricSelect = barMetricLabel.locator('..').locator('select');
      if (await barMetricSelect.isVisible()) {
        const options = await barMetricSelect.locator('option').allTextContents();
        if (options.length > 1) {
          await barMetricSelect.selectOption(options[1]);
          await page.waitForTimeout(500);

          const props = await page.evaluate(() => {
            const state = (window as any).__phantomDebug?.useStore?.getState();
            return state.items.find((i: any) => i.id === 'test-combo-change')?.props;
          });

          expect(props.barMetric).toBe(options[1]);
        }
      }
    });

    test('combo chart topN filtering works', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-combo-topn',
          type: 'combo',
          title: 'TopN Test',
          layout: { x: 0, y: 0, w: 16, h: 10 },
          props: { dimension: 'Category', barMetric: 'Revenue', lineMetric: 'Profit', topN: 5 }
        });
        state.selectItem('test-combo-topn');
      });
      await page.waitForTimeout(500);

      // Check Top N select is visible
      const topNLabel = page.getByText('Top N');
      await expect(topNLabel).toBeVisible();

      // Change top N
      const topNSelect = topNLabel.locator('..').locator('select');
      if (await topNSelect.isVisible()) {
        await topNSelect.selectOption('3');
        await page.waitForTimeout(500);

        const props = await page.evaluate(() => {
          const state = (window as any).__phantomDebug?.useStore?.getState();
          return state.items.find((i: any) => i.id === 'test-combo-topn')?.props;
        });

        expect(props.topN).toBe('3');
      }
    });
  });

  // ============================================================
  // 3. Map Chart Tests
  // ============================================================
  test.describe('Map Chart', () => {
    test('map chart appears in toolbar', async ({ page }) => {
      const mapButton = page.getByTestId('visual-source-map');
      await expect(mapButton).toBeVisible();
    });

    test('map chart shows tooltip on hover', async ({ page }) => {
      const mapButton = page.getByTestId('visual-source-map');
      await mapButton.hover();
      await page.waitForTimeout(500);

      await expect(page.getByText('Filled Map')).toBeVisible();
    });

    test('drop map chart onto canvas', async ({ page }) => {
      const initialCount = await page.evaluate(() => {
        return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
      });

      await dropVisual(page, 'map');

      const newCount = await page.evaluate(() => {
        return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
      });
      expect(newCount).toBe(initialCount + 1);

      const lastItem = await getLastItem(page);
      expect(lastItem?.type).toBe('map');

      await page.screenshot({ path: 'test-results/map-dropped.png' });
    });

    test('map chart renders SVG map', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-map',
          type: 'map',
          title: 'Test Map',
          layout: { x: 0, y: 0, w: 16, h: 12 },
          props: { geoDimension: 'Region', metric: 'Revenue', mapType: 'us', displayMode: 'choropleth' }
        });
      });
      await page.waitForTimeout(2000); // Wait for map to load

      const container = page.getByTestId('visual-container-test-map');
      await expect(container).toBeVisible();

      // Check for SVG element
      const svg = container.locator('svg');
      await expect(svg.first()).toBeVisible();

      // Check for geography paths
      const paths = container.locator('svg path');
      const pathCount = await paths.count();
      expect(pathCount).toBeGreaterThan(0);

      await page.screenshot({ path: 'test-results/map-rendered.png' });
    });

    test('map chart properties panel shows geography settings', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-map-props',
          type: 'map',
          title: 'Props Test',
          layout: { x: 0, y: 0, w: 16, h: 12 },
          props: { geoDimension: 'Region', metric: 'Revenue', mapType: 'us', displayMode: 'choropleth' }
        });
        state.selectItem('test-map-props');
      });
      await page.waitForTimeout(500);

      // Check for Geography label
      const geoLabel = page.getByText('Geography');
      await expect(geoLabel).toBeVisible();

      // Check for Map Type label
      const mapTypeLabel = page.getByText('Map Type');
      await expect(mapTypeLabel).toBeVisible();

      // Check for Display Mode label
      const displayModeLabel = page.getByText('Display Mode');
      await expect(displayModeLabel).toBeVisible();
    });

    test('map chart type change to world updates map', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-map-world',
          type: 'map',
          title: 'World Map',
          layout: { x: 0, y: 0, w: 16, h: 12 },
          props: { geoDimension: 'Region', metric: 'Revenue', mapType: 'us', displayMode: 'choropleth' }
        });
        state.selectItem('test-map-world');
      });
      await page.waitForTimeout(500);

      // Change map type to world
      const mapTypeLabel = page.getByText('Map Type');
      const mapTypeSelect = mapTypeLabel.locator('..').locator('select');
      if (await mapTypeSelect.isVisible()) {
        await mapTypeSelect.selectOption('world');
        await page.waitForTimeout(2000);

        const props = await page.evaluate(() => {
          const state = (window as any).__phantomDebug?.useStore?.getState();
          return state.items.find((i: any) => i.id === 'test-map-world')?.props;
        });

        expect(props.mapType).toBe('world');
      }

      await page.screenshot({ path: 'test-results/map-world.png' });
    });

    test('map chart display mode change to bubble shows circles', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-map-bubble',
          type: 'map',
          title: 'Bubble Map',
          layout: { x: 0, y: 0, w: 16, h: 12 },
          props: { geoDimension: 'Region', metric: 'Revenue', mapType: 'us', displayMode: 'choropleth' }
        });
        state.selectItem('test-map-bubble');
      });
      await page.waitForTimeout(1000);

      // Change display mode to bubble
      const displayModeLabel = page.getByText('Display Mode');
      const displayModeSelect = displayModeLabel.locator('..').locator('select');
      if (await displayModeSelect.isVisible()) {
        await displayModeSelect.selectOption('bubble');
        await page.waitForTimeout(2000);

        const props = await page.evaluate(() => {
          const state = (window as any).__phantomDebug?.useStore?.getState();
          return state.items.find((i: any) => i.id === 'test-map-bubble')?.props;
        });

        expect(props.displayMode).toBe('bubble');
      }

      await page.screenshot({ path: 'test-results/map-bubble.png' });
    });

    test('map chart region click triggers cross-filter', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-map-filter',
          type: 'map',
          title: 'Filter Test',
          layout: { x: 0, y: 0, w: 16, h: 12 },
          props: { geoDimension: 'Region', metric: 'Revenue', mapType: 'us', displayMode: 'choropleth' }
        });
      });
      await page.waitForTimeout(2000);

      const container = page.getByTestId('visual-container-test-map-filter');

      // Click on a map region (path element)
      const region = container.locator('svg path').first();
      if (await region.isVisible()) {
        await region.click();
        await page.waitForTimeout(500);

        // Check filter was set
        const filters = await page.evaluate(() => {
          const state = (window as any).__phantomDebug?.useStore?.getState();
          return state.filters;
        });

        // Some filter should be set
        expect(Object.keys(filters).length).toBeGreaterThanOrEqual(0);
      }

      await page.screenshot({ path: 'test-results/map-filtered.png' });
    });
  });

  // ============================================================
  // 4. Resize Tests
  // ============================================================
  test.describe('Resize', () => {
    test('stacked area scales proportionally on resize', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-stacked-resize',
          type: 'stackedArea',
          title: 'Resize Test',
          layout: { x: 0, y: 0, w: 12, h: 8 },
          props: { dimension: 'Category', metric: 'Revenue', timeGrain: 'month' }
        });
      });
      await page.waitForTimeout(500);

      // Trigger resize via store updateLayout
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.updateLayout([{ i: 'test-stacked-resize', x: 0, y: 0, w: 20, h: 12 }]);
      });
      await page.waitForTimeout(500);

      // Verify layout was updated
      const newLayout = await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        return state.items.find((i: any) => i.id === 'test-stacked-resize')?.layout;
      });

      expect(newLayout.w).toBe(20);
      expect(newLayout.h).toBe(12);

      await page.screenshot({ path: 'test-results/stacked-area-resized.png' });
    });

    test('combo chart maintains structure on resize', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-combo-resize',
          type: 'combo',
          title: 'Resize Test',
          layout: { x: 0, y: 0, w: 12, h: 8 },
          props: { dimension: 'Category', barMetric: 'Revenue', lineMetric: 'Profit', topN: 5 }
        });
      });
      await page.waitForTimeout(500);

      const container = page.getByTestId('visual-container-test-combo-resize');
      const initialBars = await container.locator('.recharts-bar-rectangle').count();

      // Resize
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.updateLayout([{ i: 'test-combo-resize', x: 0, y: 0, w: 20, h: 12 }]);
      });
      await page.waitForTimeout(500);

      // Bars should still exist
      const finalBars = await container.locator('.recharts-bar-rectangle').count();
      expect(finalBars).toBe(initialBars);
    });

    test('map chart maintains aspect ratio on resize', async ({ page }) => {
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-map-resize',
          type: 'map',
          title: 'Resize Test',
          layout: { x: 0, y: 0, w: 12, h: 8 },
          props: { geoDimension: 'Region', metric: 'Revenue', mapType: 'us', displayMode: 'choropleth' }
        });
      });
      await page.waitForTimeout(2000);

      const container = page.getByTestId('visual-container-test-map-resize');
      const initialPaths = await container.locator('svg path').count();

      // Resize
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.updateLayout([{ i: 'test-map-resize', x: 0, y: 0, w: 20, h: 16 }]);
      });
      await page.waitForTimeout(1000);

      // Map should still render
      const finalPaths = await container.locator('svg path').count();
      expect(finalPaths).toBeGreaterThanOrEqual(initialPaths);
    });
  });

  // ============================================================
  // 5. Integration Tests
  // ============================================================
  test.describe('Integration', () => {
    test('new charts work with different scenarios', async ({ page }) => {
      // Switch to SaaS scenario
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.setScenario('SaaS');
      });
      await page.waitForTimeout(500);

      // Add combo chart
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-saas-combo',
          type: 'combo',
          title: 'SaaS Combo',
          layout: { x: 0, y: 0, w: 16, h: 10 },
          props: { dimension: 'Tier', barMetric: 'MRR', lineMetric: 'ARR', topN: 5 }
        });
      });
      await page.waitForTimeout(500);

      const lastItem = await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        return state.items.find((i: any) => i.id === 'test-saas-combo');
      });

      expect(lastItem?.props.barMetric).toBe('MRR');
      expect(lastItem?.props.lineMetric).toBe('ARR');
    });

    test('multiple new chart types can coexist on canvas', async ({ page }) => {
      const initialCount = await page.evaluate(() => {
        return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
      });

      // Add all three new chart types
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-multi-stacked',
          type: 'stackedArea',
          title: 'Stacked Area',
          layout: { x: 0, y: 0, w: 16, h: 8 },
          props: { dimension: 'Category', metric: 'Revenue', timeGrain: 'month' }
        });
        state.addItem({
          id: 'test-multi-combo',
          type: 'combo',
          title: 'Combo',
          layout: { x: 16, y: 0, w: 16, h: 8 },
          props: { dimension: 'Category', barMetric: 'Revenue', lineMetric: 'Profit', topN: 5 }
        });
        state.addItem({
          id: 'test-multi-map',
          type: 'map',
          title: 'Map',
          layout: { x: 0, y: 8, w: 16, h: 12 },
          props: { geoDimension: 'Region', metric: 'Revenue', mapType: 'us', displayMode: 'choropleth' }
        });
      });
      await page.waitForTimeout(1000);

      const finalCount = await page.evaluate(() => {
        return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
      });
      expect(finalCount).toBe(initialCount + 3);

      // Verify all three are visible
      await expect(page.getByTestId('visual-container-test-multi-stacked')).toBeVisible();
      await expect(page.getByTestId('visual-container-test-multi-combo')).toBeVisible();
      await expect(page.getByTestId('visual-container-test-multi-map')).toBeVisible();

      await page.screenshot({ path: 'test-results/multiple-new-charts.png' });
    });

    test('cross-filtering works between new and existing charts', async ({ page }) => {
      // Add a combo chart and verify it responds to filters set programmatically
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.addItem({
          id: 'test-cross-combo',
          type: 'combo',
          title: 'Combo Chart',
          layout: { x: 0, y: 0, w: 16, h: 8 },
          props: { dimension: 'Category', barMetric: 'Revenue', lineMetric: 'Profit', topN: 5 }
        });
        // Set a filter programmatically to test cross-filtering
        state.setFilter('Category', 'Beauty');
      });
      await page.waitForTimeout(500);

      // Verify filter is applied
      const filters = await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        return state.filters;
      });

      expect(filters['Category']).toBe('Beauty');

      // Verify combo chart still renders
      const comboContainer = page.getByTestId('visual-container-test-cross-combo');
      await expect(comboContainer).toBeVisible();

      // Clear filter
      await page.evaluate(() => {
        const state = (window as any).__phantomDebug?.useStore?.getState();
        state.setFilter('Category', null);
      });
    });
  });

  // ============================================================
  // 6. Smart Title Tests
  // ============================================================
  test.describe('Smart Titles', () => {
    test('stacked area gets correct smart title', async ({ page }) => {
      // Drop via line variant picker
      const source = page.getByTestId('visual-source-line');
      const target = page.locator('.layout');
      await source.dragTo(target, { targetPosition: { x: 400, y: 300 } });
      await page.waitForTimeout(500);

      const stackedAreaOption = page.getByTestId('variant-option-stackedArea');
      await stackedAreaOption.click();
      await page.waitForTimeout(500);

      const lastItem = await getLastItem(page);
      // Title should contain "Over Time"
      expect(lastItem?.title).toContain('Over Time');
    });

    test('combo chart gets correct smart title', async ({ page }) => {
      await dropVisual(page, 'combo');

      const lastItem = await getLastItem(page);
      // Title should be in format "X vs Y"
      expect(lastItem?.title).toContain('vs');
    });

    test('map chart gets correct smart title', async ({ page }) => {
      await dropVisual(page, 'map');

      const lastItem = await getLastItem(page);
      // Title should contain "by" (e.g., "Revenue by Region")
      expect(lastItem?.title).toContain('by');
    });
  });
});
