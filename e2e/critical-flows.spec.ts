/**
 * Critical User Flow Tests
 *
 * The core flow: PBI UI Kit → Canvas Rendering → PBIP Export
 * Tests all 25 PBI UI Kit visual types for proper rendering and PBIP export
 */

import { test, expect } from '@playwright/test';
import JSZip from 'jszip';

/**
 * PBI UI Kit 2.0 - All 25 visual types from the left sidebar
 * Matches exactly: src/components/VisualizationsPane.tsx pbiUiKitVisuals
 */
const PBI_UI_KIT_VISUALS: Record<string, { pbiType: string; props: Record<string, any> }> = {
  // 1-2: Area Charts
  area: { pbiType: 'areaChart', props: { metric: 'revenue' } },
  stackedArea: { pbiType: 'areaChart', props: { metric: 'revenue' } },

  // 3-6: Bar Charts
  bar: { pbiType: 'clusteredBarChart', props: { dimension: 'Region', metric: 'revenue' } },
  groupedBar: { pbiType: 'clusteredBarChart', props: { dimension: 'Region', metric: 'revenue' } },
  lollipop: { pbiType: 'clusteredBarChart', props: { dimension: 'Region', metric: 'revenue' } },
  stackedBar: { pbiType: 'stackedBarChart', props: { dimension: 'Region', metric: 'revenue' } },

  // 7, 12, 26: Comparison Charts
  barbell: { pbiType: 'clusteredBarChart', props: { dimension: 'Region', metric: 'revenue', metric2: 'profit' } },
  diverging: { pbiType: 'clusteredBarChart', props: { dimension: 'Region', metric: 'revenue', metric2: 'profit' } },
  slope: { pbiType: 'lineChart', props: { metric: 'revenue' } },

  // 9, 10, 15: KPI & Gauge
  bullet: { pbiType: 'gauge', props: { metric: 'revenue' } },
  card: { pbiType: 'cardVisual', props: { metric: 'revenue', operation: 'sum' } },
  gauge: { pbiType: 'gauge', props: { metric: 'revenue' } },

  // 11: Combination
  combo: { pbiType: 'comboChart', props: { dimension: 'Region', barMetric: 'revenue', lineMetric: 'profit' } },

  // 24: Specialized
  ribbon: { pbiType: 'ribbonChart', props: { dimension: 'Region', metric: 'revenue' } },

  // 17-19: Line Charts
  line: { pbiType: 'lineChart', props: { metric: 'revenue' } },
  lineForecast: { pbiType: 'lineChart', props: { metric: 'revenue', showForecast: true } },
  lineStepped: { pbiType: 'lineChart', props: { metric: 'revenue', stepped: true } },

  // 20-21: Maps
  mapBubble: { pbiType: 'filledMap', props: { dimension: 'Region', metric: 'revenue' } },
  mapChoropleth: { pbiType: 'filledMap', props: { dimension: 'Region', metric: 'revenue' } },

  // 22-23: Pie Charts
  pie: { pbiType: 'pieChart', props: { dimension: 'Category', metric: 'revenue' } },
  donut: { pbiType: 'donutChart', props: { dimension: 'Category', metric: 'revenue' } },

  // 25: Scatter
  scatter: { pbiType: 'scatterChart', props: { xMetric: 'revenue', yMetric: 'profit' } },

  // 27: Table
  table: { pbiType: 'tableEx', props: { maxRows: 25 } },

  // 28: Treemap
  treemap: { pbiType: 'treemap', props: { dimension: 'Category', metric: 'revenue' } },

  // 29: Waterfall
  waterfall: { pbiType: 'waterfallChart', props: { dimension: 'Category', metric: 'revenue' } },
};

// Verify we have exactly 29 visuals
const EXPECTED_VISUAL_COUNT = 25;
const SCENARIOS = ['Retail', 'SaaS', 'HR', 'Logistics', 'Finance', 'Social', 'Portfolio'] as const;

const SCENARIO_VISUALS: Record<(typeof SCENARIOS)[number], string[]> = {
  Retail: ['card', 'bar', 'line', 'pie', 'table'],
  SaaS: ['card', 'stackedBar', 'lineForecast', 'donut', 'table'],
  HR: ['card', 'barbell', 'bar', 'line', 'table'],
  Logistics: ['card', 'mapBubble', 'waterfall', 'line', 'table'],
  Finance: ['card', 'combo', 'bar', 'line', 'table'],
  Social: ['card', 'scatter', 'donut', 'line', 'table'],
  Portfolio: ['card', 'treemap', 'ribbon', 'line', 'table'],
};

async function setScenarioAndAddRecipeVisuals(page: any, scenario: (typeof SCENARIOS)[number], visualTypes: string[]) {
  return page.evaluate(
    ({ scenarioName, types }) => {
      const debug = (window as any).__phantomDebug;
      const store = debug.useStore;
      store.getState().setScenario(scenarioName);
      store.getState().clearCanvas();

      const items = types.map((type: string, index: number) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const recipe = debug.getRecipeForVisual(type, scenarioName);
        const title = debug.generateSmartTitle(type, recipe, scenarioName) || `${scenarioName} ${type}`;
        const item = {
          id: `${scenarioName.toLowerCase()}-${type}-${index + 1}`,
          type,
          title,
          layout: { x: col * 16, y: row * 8, w: 16, h: 8 },
          props: { ...recipe },
        };

        store.getState().addItem(item);
        return { id: item.id, type: item.type };
      });

      const currentState = store.getState();
      return {
        scenario: currentState.scenario,
        itemCount: currentState.items.length,
        items,
      };
    },
    { scenarioName: scenario, types: visualTypes }
  );
}

async function exportCurrentPBIP(page: any) {
  return page.evaluate(async () => {
    const debug = (window as any).__phantomDebug;
    const state = debug.useStore.getState();
    const { blob } = await debug.createPBIPPackage(state.items, state.scenario, state);
    const buffer = await blob.arrayBuffer();
    return {
      bytes: Array.from(new Uint8Array(buffer)),
      scenario: state.scenario,
      itemCount: state.items.length,
    };
  });
}

function getVisualJsonPaths(zip: JSZip, projectName: string) {
  return Object.keys(zip.files).filter((filePath) =>
    filePath.startsWith(`${projectName}.Report/definition/pages/page1/visuals/`) &&
    filePath.endsWith('/visual.json')
  );
}

async function getSemanticModelStats(zip: JSZip, projectName: string) {
  const tableFilePaths = Object.keys(zip.files).filter((filePath) =>
    filePath.startsWith(`${projectName}.SemanticModel/definition/tables/`) &&
    filePath.endsWith('.tmdl')
  );

  let tablesWithEmbeddedData = 0;
  let measureCount = 0;
  for (const tableFilePath of tableFilePaths) {
    const tableTmdl = await zip.file(tableFilePath)!.async('string');
    if (tableTmdl.includes('partition ') && tableTmdl.includes('#table(')) {
      tablesWithEmbeddedData++;
    }
    measureCount += (tableTmdl.match(/measure /g) || []).length;
  }

  const modelTmdlPath = `${projectName}.SemanticModel/definition/model.tmdl`;
  const modelTmdl = await zip.file(modelTmdlPath)!.async('string');
  const relationshipCount = (modelTmdl.match(/relationship /g) || []).length;

  return {
    tableFileCount: tableFilePaths.length,
    tablesWithEmbeddedData,
    measureCount,
    relationshipCount,
  };
}

function extractQueryProjections(queryState: Record<string, any>) {
  return Object.values(queryState).flatMap((bucket) => {
    if (!bucket || typeof bucket !== 'object' || !Array.isArray((bucket as any).projections)) {
      return [];
    }
    return (bucket as any).projections;
  });
}

test.describe('PBI UI Kit to PBIP Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/editor');
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined, { timeout: 30000 });
  });

  test('all 25 PBI UI Kit visuals render and export correctly', async ({ page }) => {
    const visualTypes = Object.keys(PBI_UI_KIT_VISUALS);
    expect(visualTypes.length).toBe(EXPECTED_VISUAL_COUNT);

    const visuals: any[] = [];

    // Create a grid of all 29 visuals (6 columns)
    visualTypes.forEach((type, index) => {
      const col = index % 6;
      const row = Math.floor(index / 6);
      visuals.push({
        id: `v-${type}`,
        type,
        title: type,
        layout: { x: col * 8, y: row * 6, w: 8, h: 6 },
        props: PBI_UI_KIT_VISUALS[type].props,
      });
    });

    // Add all visuals to canvas
    await page.evaluate((visuals) => {
      const state = (window as any).__phantomDebug.useStore.getState();
      state.clearCanvas();
      visuals.forEach((v: any) => state.addItem(v));
    }, visuals);

    await page.waitForTimeout(2000);

    // Verify all 29 visuals rendered
    const itemCount = await page.evaluate(() => {
      return (window as any).__phantomDebug.useStore.getState().items.length;
    });
    expect(itemCount).toBe(EXPECTED_VISUAL_COUNT);

    // Take screenshot of all visuals
    await page.screenshot({ path: 'test-results/pbi-ui-kit-all-25.png', fullPage: true });

    // Export to PBIP
    const exportResult = await page.evaluate(async () => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      const { blob } = await debug.createPBIPPackage(state.items, state.scenario, state);
      const buffer = await blob.arrayBuffer();
      return {
        bytes: Array.from(new Uint8Array(buffer)),
        scenario: state.scenario,
        itemCount: state.items.length,
      };
    });

    expect(exportResult.itemCount).toBe(EXPECTED_VISUAL_COUNT);

    // Validate PBIP structure
    const zip = await JSZip.loadAsync(Uint8Array.from(exportResult.bytes));
    const projectName = `Phantom${exportResult.scenario}`;

    // Verify all 29 visuals have correct PBI type mappings
    for (const [type, mapping] of Object.entries(PBI_UI_KIT_VISUALS)) {
      const visualFile = zip.file(`${projectName}.Report/definition/pages/page1/visuals/v-${type}/visual.json`);
      expect(visualFile, `Visual file for ${type} should exist`).toBeTruthy();

      const visualJson = await visualFile!.async('string');
      const visual = JSON.parse(visualJson);
      expect(visual.visual.visualType, `${type} should map to ${mapping.pbiType}`).toBe(mapping.pbiType);
    }
  });

  test('dashboard with PBI UI Kit visuals - realistic layout', async ({ page }) => {
    // Create a realistic dashboard using only PBI UI Kit visuals
    await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      state.clearCanvas();

      const visuals = [
        // KPI row: cards and gauge
        { id: 'card-1', type: 'card', title: 'Revenue', layout: { x: 0, y: 0, w: 8, h: 5 }, props: { metric: 'revenue', operation: 'sum' } },
        { id: 'card-2', type: 'card', title: 'Profit', layout: { x: 8, y: 0, w: 8, h: 5 }, props: { metric: 'profit', operation: 'sum' } },
        { id: 'card-3', type: 'card', title: 'Quantity', layout: { x: 16, y: 0, w: 8, h: 5 }, props: { metric: 'quantity', operation: 'sum' } },
        { id: 'gauge-1', type: 'gauge', title: 'Target', layout: { x: 24, y: 0, w: 8, h: 5 }, props: { metric: 'revenue' } },
        { id: 'bullet-1', type: 'bullet', title: 'Progress', layout: { x: 32, y: 0, w: 8, h: 5 }, props: { metric: 'profit' } },

        // Chart row 1: bar variants
        { id: 'bar-1', type: 'bar', title: 'By Region', layout: { x: 0, y: 5, w: 12, h: 8 }, props: { dimension: 'Region', metric: 'revenue' } },
        { id: 'groupedBar-1', type: 'groupedBar', title: 'Grouped', layout: { x: 12, y: 5, w: 12, h: 8 }, props: { dimension: 'Region', metric: 'revenue' } },
        { id: 'stackedBar-1', type: 'stackedBar', title: 'Stacked', layout: { x: 24, y: 5, w: 12, h: 8 }, props: { dimension: 'Region', metric: 'revenue' } },
        { id: 'lollipop-1', type: 'lollipop', title: 'Lollipop', layout: { x: 36, y: 5, w: 12, h: 8 }, props: { dimension: 'Region', metric: 'revenue' } },

        // Chart row 2: line variants
        { id: 'line-1', type: 'line', title: 'Trend', layout: { x: 0, y: 13, w: 16, h: 7 }, props: { metric: 'revenue' } },
        { id: 'area-1', type: 'area', title: 'Area', layout: { x: 16, y: 13, w: 16, h: 7 }, props: { metric: 'revenue' } },
        { id: 'stackedArea-1', type: 'stackedArea', title: 'Stacked Area', layout: { x: 32, y: 13, w: 16, h: 7 }, props: { metric: 'revenue' } },

        // Chart row 3: pie, donut, treemap, combo
        { id: 'pie-1', type: 'pie', title: 'By Category', layout: { x: 0, y: 20, w: 12, h: 8 }, props: { dimension: 'Category', metric: 'revenue' } },
        { id: 'donut-1', type: 'donut', title: 'Donut', layout: { x: 12, y: 20, w: 12, h: 8 }, props: { dimension: 'Category', metric: 'revenue' } },
        { id: 'treemap-1', type: 'treemap', title: 'Treemap', layout: { x: 24, y: 20, w: 12, h: 8 }, props: { dimension: 'Category', metric: 'revenue' } },
        { id: 'combo-1', type: 'combo', title: 'Combo', layout: { x: 36, y: 20, w: 12, h: 8 }, props: { dimension: 'Region', barMetric: 'revenue', lineMetric: 'profit' } },

        // Chart row 4: specialized
        { id: 'waterfall-1', type: 'waterfall', title: 'Waterfall', layout: { x: 0, y: 28, w: 12, h: 8 }, props: { dimension: 'Category', metric: 'revenue' } },
        { id: 'scatter-1', type: 'scatter', title: 'Scatter', layout: { x: 12, y: 28, w: 12, h: 8 }, props: { xMetric: 'revenue', yMetric: 'profit' } },
        { id: 'ribbon-1', type: 'ribbon', title: 'Ribbon', layout: { x: 24, y: 28, w: 12, h: 8 }, props: { dimension: 'Region', metric: 'revenue' } },

        // Table
        { id: 'table-1', type: 'table', title: 'Details', layout: { x: 0, y: 36, w: 48, h: 8 }, props: { maxRows: 50 } },
      ];

      visuals.forEach(v => state.addItem(v));
    });

    await page.waitForTimeout(2000);

    // Verify 20 visuals render
    const itemCount = await page.evaluate(() => (window as any).__phantomDebug.useStore.getState().items.length);
    expect(itemCount).toBe(20);

    // Verify charts have data
    await expect(page.locator('.recharts-bar-rectangle').first()).toBeVisible();
    await expect(page.locator('.recharts-pie-sector').first()).toBeVisible();
    await expect(page.locator('.recharts-line').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/pbi-ui-kit-dashboard.png', fullPage: true });

    // Export and validate
    const exportResult = await page.evaluate(async () => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      const { blob } = await debug.createPBIPPackage(state.items, state.scenario, state);
      const buffer = await blob.arrayBuffer();
      return { bytes: Array.from(new Uint8Array(buffer)), scenario: state.scenario };
    });

    const zip = await JSZip.loadAsync(Uint8Array.from(exportResult.bytes));
    const projectName = `Phantom${exportResult.scenario}`;

    // Verify PBIP structure
    expect(zip.file(`${projectName}.pbip`)).toBeTruthy();
    expect(zip.file(`${projectName}.Report/definition/report.json`)).toBeTruthy();
    expect(zip.file(`${projectName}.SemanticModel/definition/model.tmdl`)).toBeTruthy();

    // Verify all 20 visuals exported
    const visualsFolder = zip.folder(`${projectName}.Report/definition/pages/page1/visuals`);
    const visualFolders = Object.keys(visualsFolder?.files || {}).filter(f => f.endsWith('/visual.json'));
    expect(visualFolders.length).toBe(20);
  });

  test('comparison charts: barbell, diverging, slope', async ({ page }) => {
    await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      state.clearCanvas();

      const visuals = [
        { id: 'barbell-1', type: 'barbell', title: 'Barbell', layout: { x: 0, y: 0, w: 16, h: 10 }, props: { dimension: 'Region', metric: 'revenue', metric2: 'profit' } },
        { id: 'diverging-1', type: 'diverging', title: 'Diverging', layout: { x: 16, y: 0, w: 16, h: 10 }, props: { dimension: 'Region', metric: 'revenue', metric2: 'profit' } },
        { id: 'slope-1', type: 'slope', title: 'Slope', layout: { x: 32, y: 0, w: 16, h: 10 }, props: { metric: 'revenue' } },
      ];

      visuals.forEach(v => state.addItem(v));
    });

    await page.waitForTimeout(1000);

    const itemCount = await page.evaluate(() => (window as any).__phantomDebug.useStore.getState().items.length);
    expect(itemCount).toBe(3);

    await page.screenshot({ path: 'test-results/pbi-ui-kit-comparison.png', fullPage: true });
  });

  test('line chart variants: line, lineForecast, lineStepped', async ({ page }) => {
    await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      state.clearCanvas();

      const visuals = [
        { id: 'line-1', type: 'line', title: 'Line', layout: { x: 0, y: 0, w: 16, h: 10 }, props: { metric: 'revenue' } },
        { id: 'lineForecast-1', type: 'lineForecast', title: 'Forecast', layout: { x: 16, y: 0, w: 16, h: 10 }, props: { metric: 'revenue', showForecast: true } },
        { id: 'lineStepped-1', type: 'lineStepped', title: 'Stepped', layout: { x: 32, y: 0, w: 16, h: 10 }, props: { metric: 'revenue', stepped: true } },
      ];

      visuals.forEach(v => state.addItem(v));
    });

    await page.waitForTimeout(1000);

    const itemCount = await page.evaluate(() => (window as any).__phantomDebug.useStore.getState().items.length);
    expect(itemCount).toBe(3);

    // Verify line charts render
    await expect(page.locator('.recharts-line').first()).toBeVisible();

    await page.screenshot({ path: 'test-results/pbi-ui-kit-line-variants.png', fullPage: true });
  });

  test('map charts: mapBubble, mapChoropleth', async ({ page }) => {
    await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      state.clearCanvas();

      const visuals = [
        { id: 'mapBubble-1', type: 'mapBubble', title: 'Bubble Map', layout: { x: 0, y: 0, w: 24, h: 14 }, props: { dimension: 'Region', metric: 'revenue' } },
        { id: 'mapChoropleth-1', type: 'mapChoropleth', title: 'Choropleth', layout: { x: 24, y: 0, w: 24, h: 14 }, props: { dimension: 'Region', metric: 'revenue' } },
      ];

      visuals.forEach(v => state.addItem(v));
    });

    await page.waitForTimeout(1000);

    const itemCount = await page.evaluate(() => (window as any).__phantomDebug.useStore.getState().items.length);
    expect(itemCount).toBe(2);

    await page.screenshot({ path: 'test-results/pbi-ui-kit-maps.png', fullPage: true });
  });

  test('specialized chart: ribbon', async ({ page }) => {
    await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      state.clearCanvas();

      const visuals = [
        { id: 'ribbon-1', type: 'ribbon', title: 'Ribbon', layout: { x: 0, y: 0, w: 24, h: 10 }, props: { dimension: 'Region', metric: 'revenue' } },
      ];

      visuals.forEach(v => state.addItem(v));
    });

    await page.waitForTimeout(1000);

    const itemCount = await page.evaluate(() => (window as any).__phantomDebug.useStore.getState().items.length);
    expect(itemCount).toBe(1);

    await page.screenshot({ path: 'test-results/pbi-ui-kit-specialized.png', fullPage: true });
  });

  test('semantic model has complete data structure', async ({ page }) => {
    await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      state.clearCanvas();
      state.addItem({ id: 'bar-1', type: 'bar', title: 'Bar', layout: { x: 0, y: 0, w: 12, h: 6 }, props: { dimension: 'Region', metric: 'revenue' } });
    });

    const exportResult = await page.evaluate(async () => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      const { blob } = await debug.createPBIPPackage(state.items, state.scenario, state);
      const buffer = await blob.arrayBuffer();
      return { bytes: Array.from(new Uint8Array(buffer)), scenario: state.scenario };
    });

    const zip = await JSZip.loadAsync(Uint8Array.from(exportResult.bytes));
    const projectName = `Phantom${exportResult.scenario}`;

    // Verify all Retail tables exist
    const tables = ['Sales', 'Store', 'Product', 'DateTable'];
    for (const table of tables) {
      const tmdl = await zip.file(`${projectName}.SemanticModel/definition/tables/${table}.tmdl`)!.async('string');
      expect(tmdl, `Table ${table} should exist`).toContain(`table ${table}`);
    }

    // Verify Sales table has all columns
    const salesTmdl = await zip.file(`${projectName}.SemanticModel/definition/tables/Sales.tmdl`)!.async('string');
    const expectedColumns = ['SaleID', 'Date', 'StoreID', 'ProductID', 'Quantity', 'Revenue', 'Profit', 'Discount'];
    for (const col of expectedColumns) {
      expect(salesTmdl, `Sales should have ${col} column`).toContain(`column ${col}`);
    }

    // Verify relationships in model
    const modelTmdl = await zip.file(`${projectName}.SemanticModel/definition/model.tmdl`)!.async('string');
    expect(modelTmdl).toContain('relationship');
    expect(modelTmdl).toContain('fromColumn: Sales.');
  });

  for (const scenario of SCENARIOS) {
    test(`scenario PBIP export validation: ${scenario}`, async ({ page }) => {
      const visualTypes = SCENARIO_VISUALS[scenario];

      const stateAfterSetup = await setScenarioAndAddRecipeVisuals(page, scenario, visualTypes);
      expect(stateAfterSetup.scenario).toBe(scenario);
      expect(stateAfterSetup.itemCount).toBe(visualTypes.length);

      const exportResult = await exportCurrentPBIP(page);
      expect(exportResult.scenario).toBe(scenario);
      expect(exportResult.itemCount).toBe(visualTypes.length);

      const zip = await JSZip.loadAsync(Uint8Array.from(exportResult.bytes));
      const projectName = `Phantom${exportResult.scenario}`;

      expect(zip.file(`${projectName}.pbip`)).toBeTruthy();
      expect(zip.file(`${projectName}.Report/definition/report.json`)).toBeTruthy();
      expect(zip.file(`${projectName}.SemanticModel/definition/model.tmdl`)).toBeTruthy();

      const visualJsonPaths = getVisualJsonPaths(zip, projectName);
      expect(visualJsonPaths.length).toBe(visualTypes.length);

      const semanticStats = await getSemanticModelStats(zip, projectName);
      expect(semanticStats.tableFileCount).toBeGreaterThan(0);
      expect(semanticStats.tablesWithEmbeddedData).toBeGreaterThan(0);
      expect(semanticStats.measureCount).toBeGreaterThan(0);
      expect(semanticStats.relationshipCount).toBeGreaterThan(0);
    });
  }

  test('data binding completeness for visuals with dimension and metric', async ({ page }) => {
    const visualTypes = Object.entries(PBI_UI_KIT_VISUALS)
      .filter(([, mapping]) => Boolean(mapping.props.dimension && mapping.props.metric))
      .map(([type]) => type);

    const visuals = visualTypes.map((type, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      return {
        id: `binding-${type}`,
        type,
        title: `Binding ${type}`,
        layout: { x: col * 12, y: row * 6, w: 12, h: 6 },
        props: { ...PBI_UI_KIT_VISUALS[type].props },
      };
    });

    await page.evaluate((items) => {
      const state = (window as any).__phantomDebug.useStore.getState();
      state.setScenario('Retail');
      state.clearCanvas();
      items.forEach((item: any) => state.addItem(item));
    }, visuals);

    const exportResult = await exportCurrentPBIP(page);
    const zip = await JSZip.loadAsync(Uint8Array.from(exportResult.bytes));
    const projectName = `Phantom${exportResult.scenario}`;

    for (const type of visualTypes) {
      const visualPath = `${projectName}.Report/definition/pages/page1/visuals/binding-${type}/visual.json`;
      const visualFile = zip.file(visualPath);
      expect(visualFile, `${type} should have exported visual.json`).toBeTruthy();

      const visual = JSON.parse(await visualFile!.async('string'));
      const queryState = visual.visual?.query?.queryState as Record<string, any> | undefined;
      expect(queryState, `${type} should include queryState`).toBeTruthy();

      const projections = extractQueryProjections(queryState || {});
      const hasDimensionProjection = projections.some((projection: any) => Boolean(projection?.field?.Column));
      const hasMetricProjection = projections.some((projection: any) => Boolean(projection?.field?.Measure));

      expect(projections.length, `${type} should have at least one projection`).toBeGreaterThan(0);
      expect(hasDimensionProjection, `${type} should include a dimension projection`).toBeTruthy();
      expect(hasMetricProjection, `${type} should include a metric projection`).toBeTruthy();
    }
  });

  test('position conversion is accurate for all layout positions', async ({ page }) => {
    // Test visuals at various positions to verify grid-to-pixel conversion
    await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      state.clearCanvas();

      const visuals = [
        { id: 'pos-0-0', type: 'card', title: 'Origin', layout: { x: 0, y: 0, w: 8, h: 5 }, props: { metric: 'revenue' } },
        { id: 'pos-24-0', type: 'card', title: 'Mid Top', layout: { x: 24, y: 0, w: 8, h: 5 }, props: { metric: 'revenue' } },
        { id: 'pos-40-0', type: 'card', title: 'Right', layout: { x: 40, y: 0, w: 8, h: 5 }, props: { metric: 'revenue' } },
        { id: 'pos-0-10', type: 'card', title: 'Left Mid', layout: { x: 0, y: 10, w: 8, h: 5 }, props: { metric: 'revenue' } },
        { id: 'pos-full', type: 'bar', title: 'Full Width', layout: { x: 0, y: 15, w: 48, h: 10 }, props: { dimension: 'Region', metric: 'revenue' } },
      ];

      visuals.forEach(v => state.addItem(v));
    });

    const exportResult = await page.evaluate(async () => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      const { blob } = await debug.createPBIPPackage(state.items, state.scenario, state);
      const buffer = await blob.arrayBuffer();
      return { bytes: Array.from(new Uint8Array(buffer)), scenario: state.scenario };
    });

    const zip = await JSZip.loadAsync(Uint8Array.from(exportResult.bytes));
    const projectName = `Phantom${exportResult.scenario}`;

    // Grid: 48 cols on 1280px = 26.67px/col, row height 20px
    const colWidth = 1280 / 48;

    // Verify positions
    const positions = [
      { id: 'pos-0-0', expectedX: 0, expectedY: 0 },
      { id: 'pos-24-0', expectedX: Math.round(24 * colWidth), expectedY: 0 },
      { id: 'pos-40-0', expectedX: Math.round(40 * colWidth), expectedY: 0 },
      { id: 'pos-0-10', expectedX: 0, expectedY: 200 }, // 10 * 20px
      { id: 'pos-full', expectedX: 0, expectedY: 300, expectedWidth: 1280 }, // 48 cols full width
    ];

    for (const pos of positions) {
      const visualJson = await zip.file(`${projectName}.Report/definition/pages/page1/visuals/${pos.id}/visual.json`)!.async('string');
      const visual = JSON.parse(visualJson);

      expect(visual.position.x, `${pos.id} x position`).toBe(pos.expectedX);
      expect(visual.position.y, `${pos.id} y position`).toBe(pos.expectedY);
      if (pos.expectedWidth) {
        expect(visual.position.width, `${pos.id} width`).toBe(pos.expectedWidth);
      }
    }
  });
});
