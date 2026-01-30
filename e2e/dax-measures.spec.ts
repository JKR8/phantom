import { test, expect } from '@playwright/test';
import JSZip from 'jszip';

const openTemplate = async (page: any, name: string) => {
  const templatesButton = page.getByRole('button', { name: 'Templates' });
  await templatesButton.click();
  const menuItem = page.getByRole('menuitem', { name });
  await menuItem.waitFor({ state: 'visible', timeout: 5000 });
  await menuItem.click();
};

test.describe('DAX Measure Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined);
  });

  test('generateBaseMeasures produces correct operation labels (sum → Total, avg → Avg, count → Count of)', async ({ page }) => {
    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const bindings = [
        { metric: 'revenue', operation: 'sum', table: 'Sales', column: 'Revenue' },
        { metric: 'revenue', operation: 'avg', table: 'Sales', column: 'Revenue' },
        { metric: 'revenue', operation: 'count', table: 'Sales', column: 'Revenue' },
        { metric: 'cost', operation: 'min', table: 'Shipment', column: 'Cost' },
        { metric: 'cost', operation: 'max', table: 'Shipment', column: 'Cost' },
      ];
      return debug.generateBaseMeasures(bindings, 'Retail');
    });

    expect(measures).toHaveLength(5);
    expect(measures[0].name).toBe('Total revenue');
    expect(measures[0].expression).toContain('SUM(Sales[Revenue])');
    expect(measures[1].name).toBe('Avg revenue');
    expect(measures[1].expression).toContain('AVERAGE(Sales[Revenue])');
    expect(measures[2].name).toBe('Count of revenue');
    expect(measures[2].expression).toContain('COUNTROWS(Sales)');
    expect(measures[3].name).toBe('Min cost');
    expect(measures[3].expression).toContain('MIN(Shipment[Cost])');
    expect(measures[4].name).toBe('Max cost');
    expect(measures[4].expression).toContain('MAX(Shipment[Cost])');
  });

  test('generateVarianceMeasures uses correct operation label for avg bindings', async ({ page }) => {
    // This directly tests the recent fix: variance measures should use the binding's operation label,
    // not hardcoded "Total"
    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const bindings = [
        { metric: 'revenue', operation: 'avg', table: 'Sales', column: 'Revenue' },
        { metric: 'revenuePY', operation: 'avg', table: 'Sales', column: 'RevenuePY' },
        { metric: 'revenuePL', operation: 'avg', table: 'Sales', column: 'RevenuePL' },
      ];
      return debug.generateVarianceMeasures(bindings, 'Retail');
    });

    // Should produce 4 measures: ΔPY, ΔPY%, ΔPL, ΔPL%
    expect(measures).toHaveLength(4);

    // ΔPY should reference [Avg Revenue] not [Total Revenue]
    const deltaPY = measures.find((m: any) => m.name === 'Revenue ΔPY');
    expect(deltaPY).toBeTruthy();
    expect(deltaPY.expression).toContain('[Avg Revenue]');
    expect(deltaPY.expression).toContain('[Avg Revenue PY]');
    expect(deltaPY.expression).not.toContain('[Total Revenue]');

    // ΔPY% should also use Avg
    const deltaPYPct = measures.find((m: any) => m.name === 'Revenue ΔPY%');
    expect(deltaPYPct).toBeTruthy();
    expect(deltaPYPct.expression).toContain('[Avg Revenue]');

    // ΔPL should reference [Avg Revenue Plan]
    const deltaPL = measures.find((m: any) => m.name === 'Revenue ΔPL');
    expect(deltaPL).toBeTruthy();
    expect(deltaPL.expression).toContain('[Avg Revenue]');
    expect(deltaPL.expression).toContain('[Avg Revenue Plan]');

    // ΔPL% should also use Avg
    const deltaPLPct = measures.find((m: any) => m.name === 'Revenue ΔPL%');
    expect(deltaPLPct).toBeTruthy();
    expect(deltaPLPct.expression).toContain('[Avg Revenue]');
  });

  test('generateVarianceMeasures uses "Total" label for sum bindings', async ({ page }) => {
    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const bindings = [
        { metric: 'revenue', operation: 'sum', table: 'Sales', column: 'Revenue' },
        { metric: 'revenuePY', operation: 'sum', table: 'Sales', column: 'RevenuePY' },
      ];
      return debug.generateVarianceMeasures(bindings, 'Retail');
    });

    expect(measures).toHaveLength(2); // ΔPY, ΔPY%
    expect(measures[0].expression).toContain('[Total Revenue]');
    expect(measures[0].expression).toContain('[Total Revenue PY]');
  });

  test('extractMetricBindings pulls unique metric+operation from items', async ({ page }) => {
    const bindings = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const items = [
        { id: '1', type: 'card', title: 'Rev', layout: { x: 0, y: 0, w: 6, h: 2 }, props: { metric: 'revenue', operation: 'sum' } },
        { id: '2', type: 'card', title: 'Avg Rev', layout: { x: 6, y: 0, w: 6, h: 2 }, props: { metric: 'revenue', operation: 'avg' } },
        { id: '3', type: 'bar', title: 'Bar', layout: { x: 0, y: 2, w: 12, h: 4 }, props: { metric: 'profit', dimension: 'Category' } },
        // Duplicate metric+operation should be deduped
        { id: '4', type: 'card', title: 'Rev2', layout: { x: 12, y: 0, w: 6, h: 2 }, props: { metric: 'revenue', operation: 'sum' } },
      ];
      return debug.extractMetricBindings(items, 'Retail');
    });

    // Should have 3 unique bindings: revenue_sum, revenue_avg, profit_sum
    expect(bindings).toHaveLength(3);
    const metrics = bindings.map((b: any) => `${b.metric}_${b.operation}`);
    expect(metrics).toContain('revenue_sum');
    expect(metrics).toContain('revenue_avg');
    expect(metrics).toContain('profit_sum');
  });

  test('generateAllMeasures produces Retail-specific KPIs', async ({ page }) => {
    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      return debug.generateAllMeasures(state.items, 'Retail');
    });

    const names = measures.map((m: any) => m.name);
    // Retail KPIs
    expect(names).toContain('Margin %');
    expect(names).toContain('YoY Growth');
    expect(names).toContain('Revenue per Store');
    expect(names).toContain('Avg Order Value');
  });

  test('generateAllMeasures produces SaaS-specific KPIs for SaaS scenario', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).__phantomDebug.useStore.getState().setScenario('SaaS');
    });
    await openTemplate(page, 'Marketing');

    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      return debug.generateAllMeasures(state.items, 'SaaS');
    });

    const names = measures.map((m: any) => m.name);
    expect(names).toContain('Churn Rate');
    expect(names).toContain('ARR');
    expect(names).toContain('Customer Count');
    expect(names).toContain('ARPU');
  });

  test('generateAllMeasures produces HR-specific KPIs', async ({ page }) => {
    await openTemplate(page, 'HR Attrition');

    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      return debug.generateAllMeasures(state.items, 'HR');
    });

    const names = measures.map((m: any) => m.name);
    expect(names).toContain('Headcount');
    expect(names).toContain('Attrition Rate');
    expect(names).toContain('Avg Performance Rating');
    expect(names).toContain('Avg Tenure');
  });

  test('generateAllMeasures produces Logistics-specific KPIs', async ({ page }) => {
    await openTemplate(page, 'Logistics Supply Chain');

    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      return debug.generateAllMeasures(state.items, 'Logistics');
    });

    const names = measures.map((m: any) => m.name);
    expect(names).toContain('Total Shipments');
    expect(names).toContain('On-Time Rate');
    expect(names).toContain('Avg Shipment Cost');
    expect(names).toContain('Delivered Count');
    expect(names).toContain('In Transit Count');
    expect(names).toContain('Delayed Count');
  });

  test('generateAllMeasures produces Portfolio-specific KPIs', async ({ page }) => {
    // Portfolio scenario doesn't have a dedicated template, set scenario directly
    await page.evaluate(() => {
      (window as any).__phantomDebug.useStore.getState().setScenario('Portfolio');
    });
    // Wait for scenario switch to complete
    await page.waitForTimeout(500);

    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      return debug.generateAllMeasures(state.items, 'Portfolio');
    });

    const names = measures.map((m: any) => m.name);
    expect(names).toContain('Unique Entities');
    expect(names).toContain('Above Threshold');
    expect(names).toContain('Negative Changes');
    expect(names).toContain('Avg Controversy Score');
    expect(names).toContain('Total Market Value');
  });

  test('generateAllMeasures produces Finance-specific KPIs', async ({ page }) => {
    await openTemplate(page, 'Finance');

    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      return debug.generateAllMeasures(state.items, 'Finance');
    });

    const names = measures.map((m: any) => m.name);
    expect(names).toContain('Budget Variance %');
    expect(names).toContain('Forecast Accuracy');
    expect(names).toContain('Net Variance');
  });

  test('generateAllMeasures produces Social-specific KPIs', async ({ page }) => {
    await openTemplate(page, 'Social Media Sentiment');

    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      return debug.generateAllMeasures(state.items, 'Social');
    });

    const names = measures.map((m: any) => m.name);
    expect(names).toContain('Avg Engagement Rate');
    expect(names).toContain('Positive Sentiment %');
    expect(names).toContain('Net Sentiment');
    expect(names).toContain('Total Mentions');
  });

  test('generateAllMeasures deduplicates measures by name', async ({ page }) => {
    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      // Create items with duplicate metrics
      const items = [
        { id: '1', type: 'card', title: 'R1', layout: { x: 0, y: 0, w: 6, h: 2 }, props: { metric: 'revenue', operation: 'sum' } },
        { id: '2', type: 'bar', title: 'R2', layout: { x: 0, y: 2, w: 12, h: 4 }, props: { metric: 'revenue', operation: 'sum', dimension: 'Category' } },
      ];
      return debug.generateAllMeasures(items, 'Retail');
    });

    // Check no duplicates
    const names = measures.map((m: any) => m.name);
    const uniqueNames = [...new Set(names)];
    expect(names.length).toBe(uniqueNames.length);
  });

  test('PBIP export TMDL includes DAX measures for Retail', async ({ page }) => {
    const exportResult = await page.evaluate(async () => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      const { blob } = await debug.createPBIPPackage(state.items, state.scenario, state);
      const buffer = await blob.arrayBuffer();
      return { bytes: Array.from(new Uint8Array(buffer)), scenario: state.scenario };
    });

    const zip = await JSZip.loadAsync(Uint8Array.from(exportResult.bytes));
    const projectName = `Phantom${exportResult.scenario}`;
    const salesTmdl = await zip.file(`${projectName}.SemanticModel/definition/tables/Sales.tmdl`)!.async('string');

    // Should contain base measures (metric name preserves case from item props: lowercase 'revenue')
    expect(salesTmdl).toContain('Total revenue');
    expect(salesTmdl).toContain('SUM(Sales[Revenue])');
    // Should contain Retail KPIs
    expect(salesTmdl).toContain('Margin %');
    expect(salesTmdl).toContain('YoY Growth');
  });

  test('base measure format strings: currency for revenue/profit, percentage for rate', async ({ page }) => {
    const measures = await page.evaluate(() => {
      const debug = (window as any).__phantomDebug;
      const bindings = [
        { metric: 'revenue', operation: 'sum', table: 'Sales', column: 'Revenue' },
        { metric: 'profit', operation: 'sum', table: 'Sales', column: 'Profit' },
        { metric: 'quantity', operation: 'sum', table: 'Sales', column: 'Quantity' },
      ];
      return debug.generateBaseMeasures(bindings, 'Retail');
    });

    const revMeasure = measures.find((m: any) => m.name === 'Total revenue');
    expect(revMeasure.formatString).toBe('$#,##0');

    const profitMeasure = measures.find((m: any) => m.name === 'Total profit');
    expect(profitMeasure.formatString).toBe('$#,##0');

    const qtyMeasure = measures.find((m: any) => m.name === 'Total quantity');
    expect(qtyMeasure.formatString).toBe('#,##0');
  });
});
