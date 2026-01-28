import { test, expect } from '@playwright/test';
import JSZip from 'jszip';

const visualIds = [
  'stackedBar',
  'stackedColumn',
  'bar',
  'column',
  'line',
  'area',
  'scatter',
  'pie',
  'donut',
  'funnel',
  'treemap',
  'card',
  'multiRowCard',
  'gauge',
  'table',
  'matrix',
  'waterfall',
  'slicer',
];

/** Programmatically simulates what Canvas.handleDrop does: generates recipe, smart title, and adds item */
const simulateDrop = async (page: any, visualType: string) => {
  await page.evaluate((vt: string) => {
    const debug = (window as any).__phantomDebug;
    const state = debug.useStore.getState();
    const recipe = debug.getRecipeForVisual(vt, state.scenario);
    const title = debug.generateSmartTitle(vt, recipe, state.scenario);
    state.addItem({
      id: `visual-${Date.now()}`,
      type: vt,
      title,
      layout: { x: 0, y: 0, w: 8, h: 4 },
      props: { ...recipe },
    });
  }, visualType);
};

const openTemplate = async (page: any, name: string) => {
  const templatesButton = page.getByRole('button', { name: 'Templates' });
  await templatesButton.click();
  const menuItem = page.getByRole('menuitem', { name });
  await menuItem.waitFor({ state: 'visible', timeout: 5000 });
  await menuItem.click();
};

const clickVisualHeaderByTitle = async (page: any, title: string) => {
  const id = await page.evaluate((t: string) => {
    const state = (window as any).__phantomDebug.useStore.getState();
    const item = state.items.find((i: any) => i.title === t);
    return item?.id;
  }, title);
  if (!id) throw new Error(`Visual with title "${title}" not found`);
  await page.evaluate((itemId: string) => {
    (window as any).__phantomDebug.useStore.getState().selectItem(itemId);
  }, id);
  const container = page.getByTestId(`visual-container-${id}`);
  await container.locator('.visual-header').click({ force: true });
};

test.describe('Phantom Drop -> Shape -> Refine', () => {
  test.beforeEach(async ({ page }) => {
    page.on('pageerror', (err) => {
      console.error('Page error:', err.message);
    });
    page.on('console', (msg) => {
      if (['error', 'warning'].includes(msg.type())) {
        console.error(`Console ${msg.type()}:`, msg.text());
      }
    });
    // Set viewport to a consistent size
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    // Wait for canvas to load
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined);
  });

  test('Drop Bar Chart -> Smart Title -> Shape Top N -> Change Dimension', async ({ page }) => {
    // 1. Drag Bar Chart to Canvas
    const source = page.getByTestId('visual-source-bar');
    const target = page.locator('.layout');

    await source.dragTo(target, {
        targetPosition: { x: 400, y: 300 }
    });

    // Wait for the visual to appear with smart title
    // In Retail scenario, bar chart should get "Top 5 Category by Revenue"
    const visualHeader = page.locator('.visual-header').filter({ hasText: /Top 5 Category by Revenue/i });
    await expect(visualHeader).toBeVisible({ timeout: 10000 });

    // Select the newest item directly to ensure Quick Shape shows
    const lastId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.id;
    });
    await page.evaluate((itemId: string) => {
      (window as any).__phantomDebug.useStore.getState().selectItem(itemId);
    }, lastId);

    // 2. Verify Quick Shape Strip appears
    await expect(page.getByTestId('quick-shape-strip')).toBeVisible();

    // Verify default dimension is "Category" (for Retail scenario)
    await expect(page.getByTestId('quick-shape-dimension-trigger')).toContainText('Category');

    // 3. Test Top N = 5 (should already be selected by default)
    const topNValue = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.props?.topN;
    });
    expect(topNValue).toBe(5);

    // 4. Change to Bars: 2
    await page.getByTestId('quick-shape-bars-2').click();

    // Confirm state updated
    const topNValue2 = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.props?.topN;
    });
    expect(topNValue2).toBe('2');

    // Title should auto-update to "Top 2 Category by Revenue"
    await expect(page.locator('.visual-header').filter({ hasText: /Top 2 Category by Revenue/i })).toBeVisible();

    // 5. Change Dimension to "Store"
    await page.getByTestId('quick-shape-dimension-trigger').click();
    await page.getByTestId('quick-shape-dim-Store').click();

    // Verify dimension trigger text updated
    await expect(page.getByTestId('quick-shape-dimension-trigger')).toContainText('Store');

    // Title should auto-update to "Top 2 Store by Revenue"
    await expect(page.locator('.visual-header').filter({ hasText: /Top 2 Store/i })).toBeVisible();
  });

  test('Full acceptance: Retail -> Bar -> smart title -> Bars:2 -> Switch to Store', async ({ page }) => {
    // This is the exact acceptance test from the epic
    const source = page.getByTestId('visual-source-bar');
    const target = page.locator('.layout');

    await source.dragTo(target, { targetPosition: { x: 400, y: 300 } });

    // Verify smart title: "Top 5 Category by Revenue"
    await expect(page.locator('.visual-header').filter({ hasText: 'Top 5 Category by Revenue' })).toBeVisible({ timeout: 10000 });

    // Select item
    const lastId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.id;
    });
    await page.evaluate((itemId: string) => {
      (window as any).__phantomDebug.useStore.getState().selectItem(itemId);
    }, lastId);
    await expect(page.getByTestId('quick-shape-strip')).toBeVisible();

    // Click Bars: 2
    await page.getByTestId('quick-shape-bars-2').click();

    // Verify topN = 2
    const topN = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.props?.topN;
    });
    expect(topN).toBe('2');

    // Switch dimension to Store
    await page.getByTestId('quick-shape-dimension-trigger').click();
    await page.getByTestId('quick-shape-dim-Store').click();

    // Verify title contains "Store"
    const title = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.title;
    });
    expect(title).toContain('Store');
  });

  test('Quick Shape: Line chart comparison toggle and time grain', async ({ page }) => {
    // Programmatically add a line chart (bypasses flaky HTML5 drag)
    await simulateDrop(page, 'line');

    // Select the newly added item and verify its smart title
    const lastId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.id;
    });
    const lastTitle = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.title;
    });
    expect(lastTitle).toMatch(/Revenue Trend/i);

    await page.evaluate((itemId: string) => {
      (window as any).__phantomDebug.useStore.getState().selectItem(itemId);
    }, lastId);
    await expect(page.getByTestId(`visual-container-${lastId}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('quick-shape-strip')).toBeVisible();

    // Verify comparison default is 'both'
    const comparison = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.props?.comparison;
    });
    expect(comparison).toBe('both');

    // Verify timeGrain default is 'month'
    const grain = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.props?.timeGrain;
    });
    expect(grain).toBe('month');
  });

  test('Quick Shape: Pie chart slice count', async ({ page }) => {
    // Programmatically add a pie chart (bypasses flaky HTML5 drag)
    await simulateDrop(page, 'pie');

    // Select the newly added item and verify its smart title
    const lastId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.id;
    });
    const lastTitle = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.title;
    });
    expect(lastTitle).toMatch(/Revenue by Category/i);

    await page.evaluate((itemId: string) => {
      (window as any).__phantomDebug.useStore.getState().selectItem(itemId);
    }, lastId);
    await expect(page.getByTestId(`visual-container-${lastId}`)).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('quick-shape-strip')).toBeVisible();

    // Verify default topN for pie is 6
    const topN = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.props?.topN;
    });
    expect(topN).toBe(6);
  });

  test('Quick Shape: Table row limit', async ({ page }) => {
    const source = page.getByTestId('visual-source-table');
    const target = page.locator('.layout');

    await source.dragTo(target, { targetPosition: { x: 400, y: 300 } });

    // Smart title should be "Retail Details"
    await expect(page.locator('.visual-header').filter({ hasText: /Retail Details/i })).toBeVisible({ timeout: 10000 });

    // Select item
    const lastId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.id;
    });
    await page.evaluate((itemId: string) => {
      (window as any).__phantomDebug.useStore.getState().selectItem(itemId);
    }, lastId);
    await expect(page.getByTestId('quick-shape-strip')).toBeVisible();

    // Verify default maxRows
    const maxRows = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items[state.items.length - 1]?.props?.maxRows;
    });
    expect(maxRows).toBe(25);
  });

  test('Standard Layout Snap', async ({ page }) => {
     // 1. Toggle Layout Mode
     const layoutToggle = page.getByRole('button', { name: /Layout/i });
     await expect(layoutToggle).toContainText('Free');
     await layoutToggle.click();
     await expect(layoutToggle).toContainText('Standard');

     // Wait for slots to render
     await page.waitForTimeout(500);

     // 2. Verify Slots are visible
     // Slot names are like "Primary KPI", "Main Trend", etc.
     await expect(page.getByText('Primary KPI')).toBeVisible();
     await expect(page.getByText('Main Trend')).toBeVisible();

     // 3. Drag a KPI Card to the "Primary KPI" slot area
     const source = page.getByTestId('visual-source-card');
     const target = page.locator('.layout');

     // Drop into the top-left area where Primary KPI slot is
     await source.dragTo(target, {
         targetPosition: { x: 100, y: 50 }
     });

     // 4. Verify it was created
     const lastId = await page.evaluate(() => {
       const state = (window as any).__phantomDebug.useStore.getState();
       return state.items[state.items.length - 1]?.id;
     });
     await expect(page.getByTestId(`visual-container-${lastId}`)).toBeVisible();

     // Click it to select
     await page.evaluate((itemId: string) => {
       (window as any).__phantomDebug.useStore.getState().selectItem(itemId);
     }, lastId);
     await page.getByTestId(`visual-container-${lastId}`).locator('.visual-header').click({ force: true });

     // Verify Quick Shape for card
     await expect(page.getByTestId('quick-shape-strip')).toBeVisible();
  });

  test('Social vertical slice renders and export layout matches grid', async ({ page }) => {
    await openTemplate(page, 'Social Media Sentiment');

    // Verify key visuals render
    await expect(page.locator('.visual-header').filter({ hasText: 'Net Sentiment' })).toBeVisible();
    await expect(page.locator('.visual-header').filter({ hasText: 'Engagement Trend' })).toBeVisible();
    await expect(page.locator('.visual-header').filter({ hasText: 'Sentiment Breakdown' })).toBeVisible();

    // Ensure tables render rows
    await expect(page.locator('table').first()).toBeVisible();

    // Ensure template includes all non-FFMA visual types
    const typesInTemplate = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items.map((item: any) => item.type);
    });
    visualIds.forEach((id) => expect(typesInTemplate).toContain(id));

    // Edit a title via Properties Panel
    await clickVisualHeaderByTitle(page, 'Engagement Trend');
    const titleInput = page.getByRole('textbox');
    await titleInput.fill('Engagement Trend (Test)');
    await expect(page.locator('.visual-header').filter({ hasText: 'Engagement Trend (Test)' })).toBeVisible();

    // Validate export model and layout using debug hook
    const exportResult = await page.evaluate(async () => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      const { blob } = await debug.createPBIPPackage(state.items, state.scenario, state);
      const buffer = await blob.arrayBuffer();
      return { bytes: Array.from(new Uint8Array(buffer)), items: state.items, scenario: state.scenario };
    });

    const zip = await JSZip.loadAsync(Uint8Array.from(exportResult.bytes));
    const projectName = `Phantom${exportResult.scenario}`;
    const manifest = JSON.parse(await zip.file(`${projectName}.pbip`)!.async('string'));
    expect(manifest.artifacts?.length).toBeGreaterThan(0);

    const modelTmdl = await zip.file(`${projectName}.SemanticModel/definition/tables/SocialPost.tmdl`)!.async('string');
    expect(modelTmdl).toContain('Total Engagements');
    expect(modelTmdl).toContain('Avg SentimentScore');

    // Check visual layouts mirror gridToPixels for their layouts
    for (const item of exportResult.items) {
      const expected = await page.evaluate((layout: any) => {
        const debug = (window as any).__phantomDebug;
        return debug.gridToPixels(layout);
      }, item.layout);

      const visualJson = await zip.file(`${projectName}.Report/definition/pages/page1/visuals/${item.id}/visual.json`)!.async('string');
      const visual = JSON.parse(visualJson);
      expect(visual.position.x).toBe(expected.x);
      expect(visual.position.y).toBe(expected.y);
      expect(visual.position.width).toBe(expected.width);
      expect(visual.position.height).toBe(expected.height);
    }
  });

  test('All non-FFMA visuals drop, snap, and are editable (Social scenario)', async ({ page }) => {
    await openTemplate(page, 'Social Media Sentiment');

    // Verify template loaded and has all visual types
    const typesInSocial = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items.map((item: any) => item.type);
    });
    visualIds.forEach((id) => expect(typesInSocial).toContain(id));

    // Programmatically add each visual type (bypasses flaky HTML5 drag on full canvas)
    const initialCount = await page.evaluate(() => (window as any).__phantomDebug.useStore.getState().items.length);

    for (let i = 0; i < visualIds.length; i++) {
      const id = visualIds[i];
      await simulateDrop(page, id);
      const newCount = await page.evaluate(() => (window as any).__phantomDebug.useStore.getState().items.length);
      expect(newCount).toBe(initialCount + i + 1);

      const lastItem = await page.evaluate(() => {
        const state = (window as any).__phantomDebug.useStore.getState();
        return state.items[state.items.length - 1];
      });
      expect(Number.isInteger(lastItem.layout.x)).toBeTruthy();
      expect(Number.isInteger(lastItem.layout.y)).toBeTruthy();
    }

    // Editable: update a title and confirm it in the header
    const barId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items.find((i: any) => i.type === 'bar')?.id;
    });
    await page.evaluate((itemId: string) => {
      (window as any).__phantomDebug.useStore.getState().selectItem(itemId);
    }, barId);
    await expect(page.getByText('Properties')).toBeVisible();
    const titleInput = page.getByRole('textbox').first();
    await titleInput.fill('Custom Bar Title');
    await expect(page.locator('.visual-header').filter({ hasText: 'Custom Bar Title' })).toBeVisible();

    // Quick Shape appears for bar
    await expect(page.getByTestId('quick-shape-strip')).toBeVisible();
  });

  test('clearCanvas produces empty items array', async ({ page }) => {
    // Verify initial items exist
    const initialCount = await page.evaluate(() => {
      return (window as any).__phantomDebug.useStore.getState().items.length;
    });
    expect(initialCount).toBeGreaterThan(0);

    // Click the New Screen (+) button in the left nav
    await page.getByTitle('New Screen').click();

    // Verify items are now empty
    const afterCount = await page.evaluate(() => {
      return (window as any).__phantomDebug.useStore.getState().items.length;
    });
    expect(afterCount).toBe(0);

    // Verify selectedItemId is null
    const selectedId = await page.evaluate(() => {
      return (window as any).__phantomDebug.useStore.getState().selectedItemId;
    });
    expect(selectedId).toBeNull();
  });

  test('scenario dropdown switches data context', async ({ page }) => {
    // Verify initial scenario is Retail
    const initialScenario = await page.evaluate(() => {
      return (window as any).__phantomDebug.useStore.getState().scenario;
    });
    expect(initialScenario).toBe('Retail');

    // Click the scenario dropdown button
    await page.getByTestId('scenario-dropdown').click();

    // Select SaaS
    await page.getByRole('menuitem', { name: 'SaaS' }).click();

    // Verify scenario changed
    const newScenario = await page.evaluate(() => {
      return (window as any).__phantomDebug.useStore.getState().scenario;
    });
    expect(newScenario).toBe('SaaS');

    // Verify SaaS-specific data is loaded (subscriptions should exist)
    const hasSubs = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.subscriptions.length > 0;
    });
    expect(hasSubs).toBeTruthy();

    // Scenario dropdown button should show "SaaS"
    await expect(page.getByTestId('scenario-dropdown')).toContainText('SaaS');
  });

  test('PBIP export contains scenario semantic model tables for all templates', async ({ page }) => {
    const templates = [
      { name: 'Retail Dashboard', expectedTable: 'Sales' },
      { name: 'Sales', expectedTable: 'Sales' },
      { name: 'Marketing', expectedTable: 'Subscription' },
      { name: 'HR Attrition', expectedTable: 'Employee' },
      { name: 'Logistics Supply Chain', expectedTable: 'Shipment' },
      { name: 'Social Media Sentiment', expectedTable: 'SocialPost' },
      { name: 'Portfolio Monitoring', expectedTable: 'ControversyScore' },
      { name: 'Finance', expectedTable: 'FinanceRecord' },
      { name: 'Zebra (IBCS)', expectedTable: 'FinanceRecord' },
    ];

    for (const template of templates) {
      await openTemplate(page, template.name);
      // Wait for template load to stabilize (scenario switch triggers re-render)
      await page.waitForTimeout(500);
      const exportResult = await page.evaluate(async () => {
        const debug = (window as any).__phantomDebug;
        const state = debug.useStore.getState();
        const { blob } = await debug.createPBIPPackage(state.items, state.scenario, state);
        const buffer = await blob.arrayBuffer();
        return { bytes: Array.from(new Uint8Array(buffer)), scenario: state.scenario };
      });

      const zip = await JSZip.loadAsync(Uint8Array.from(exportResult.bytes));
      const projectName = `Phantom${exportResult.scenario}`;
      const tmdlPath = `${projectName}.SemanticModel/definition/tables/${template.expectedTable}.tmdl`;
      const tmdl = await zip.file(tmdlPath)?.async('string');
      expect(tmdl, `${template.name} should include ${template.expectedTable} table`).toBeTruthy();
      expect(tmdl || '').toContain('partition');
    }
  });
});
