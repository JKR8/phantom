/**
 * Export PBIP files for all 7 scenarios to disk.
 * Extracts each ZIP so Power BI Desktop can open the .pbip file directly.
 */
import { test } from '@playwright/test';
import JSZip from 'jszip';
import * as fs from 'fs';
import * as path from 'path';

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

const OUTPUT_DIR = path.resolve('test-results/pbip-exports');

test.describe('Export all PBIP files', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/editor');
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined, { timeout: 30000 });
  });

  for (const scenario of SCENARIOS) {
    test(`export ${scenario}`, async ({ page }) => {
      // Set scenario and add visuals
      await page.evaluate(
        ({ scenarioName, types }) => {
          const debug = (window as any).__phantomDebug;
          const store = debug.useStore;
          store.getState().setScenario(scenarioName);
          store.getState().clearCanvas();

          types.forEach((type: string, index: number) => {
            const col = index % 3;
            const row = Math.floor(index / 3);
            const recipe = debug.getRecipeForVisual(type, scenarioName);
            const title = debug.generateSmartTitle(type, recipe, scenarioName) || `${scenarioName} ${type}`;
            store.getState().addItem({
              id: `${scenarioName.toLowerCase()}-${type}-${index + 1}`,
              type,
              title,
              layout: { x: col * 16, y: row * 8, w: 16, h: 8 },
              props: { ...recipe },
            });
          });
        },
        { scenarioName: scenario, types: SCENARIO_VISUALS[scenario] }
      );

      // Export PBIP
      const exportBytes: number[] = await page.evaluate(async () => {
        const debug = (window as any).__phantomDebug;
        const state = debug.useStore.getState();
        const { blob } = await debug.createPBIPPackage(state.items, state.scenario, state);
        const buffer = await blob.arrayBuffer();
        return Array.from(new Uint8Array(buffer));
      });

      // Extract ZIP to folder
      const zip = await JSZip.loadAsync(Uint8Array.from(exportBytes));
      const scenarioDir = path.join(OUTPUT_DIR, scenario);
      fs.mkdirSync(scenarioDir, { recursive: true });

      for (const [filePath, file] of Object.entries(zip.files)) {
        const fullPath = path.join(scenarioDir, filePath);
        if (file.dir) {
          fs.mkdirSync(fullPath, { recursive: true });
        } else {
          fs.mkdirSync(path.dirname(fullPath), { recursive: true });
          const content = await file.async('nodebuffer');
          fs.writeFileSync(fullPath, content);
        }
      }

      console.log(`Exported ${scenario} to ${scenarioDir}`);
    });
  }
});
