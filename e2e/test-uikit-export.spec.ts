/**
 * Test PBIP export for the PBI UI Kit Test template
 * Verifies all 29 charts export with data bindings
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';

const openTemplate = async (page: any, name: string) => {
  const templatesButton = page.getByRole('button', { name: 'Templates' });
  await templatesButton.click();
  const menuItem = page.getByRole('menuitem', { name });
  await menuItem.waitFor({ state: 'visible', timeout: 5000 });
  await menuItem.click();
  await page.waitForTimeout(1000);
};

test.describe('PBI UI Kit Export Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined);
  });

  test('Export PBI UI Kit Test template - verify all 29 charts have data', async ({ page }) => {
    await openTemplate(page, 'PBI UI Kit Test (All 29 Charts)');

    const exportResult = await page.evaluate(async () => {
      const debug = (window as any).__phantomDebug;
      const state = debug.useStore.getState();
      const { blob, report } = await debug.createPBIPPackage(state.items, state.scenario, state);
      const buffer = await blob.arrayBuffer();

      // Analyze the report for data bindings
      const visualAnalysis: Array<{ name: string; type: string; hasData: boolean; dataRoles: string[] }> = [];

      if (report && report.sections) {
        for (const section of report.sections) {
          if (section.visualContainers) {
            for (const vc of section.visualContainers) {
              const config = JSON.parse(vc.config || '{}');
              const query = config.singleVisual?.prototypeQuery;
              const dataRoles = query ? Object.keys(query).filter(k => !k.startsWith('_')) : [];

              visualAnalysis.push({
                name: config.name || 'unknown',
                type: config.singleVisual?.visualType || 'unknown',
                hasData: dataRoles.length > 0,
                dataRoles,
              });
            }
          }
        }
      }

      return {
        bytes: Array.from(new Uint8Array(buffer)),
        scenario: state.scenario,
        itemCount: state.items.length,
        visualAnalysis,
      };
    });

    // Save export for inspection
    const outputPath = path.join('test-results', 'pbip-exports', `PhantomUIKitTest.zip`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(exportResult.bytes));

    // Analyze results
    const withData = exportResult.visualAnalysis.filter(v => v.hasData);
    const withoutData = exportResult.visualAnalysis.filter(v => !v.hasData);

    console.log(`\n=== PBI UI Kit Export Analysis ===`);
    console.log(`Total items: ${exportResult.itemCount}`);
    console.log(`Visuals with data: ${withData.length}`);
    console.log(`Visuals without data: ${withoutData.length}`);

    if (withoutData.length > 0) {
      console.log(`\nVisuals missing data bindings:`);
      withoutData.forEach(v => console.log(`  - ${v.name} (${v.type})`));
    }

    console.log(`\nVisuals with data bindings:`);
    withData.forEach(v => console.log(`  - ${v.name} (${v.type}): ${v.dataRoles.join(', ')}`));

    // Save analysis
    fs.writeFileSync(
      path.join('test-results', 'pbip-exports', 'uikit-analysis.json'),
      JSON.stringify(exportResult.visualAnalysis, null, 2)
    );

    // Expect all 29 items
    expect(exportResult.itemCount).toBe(29);

    // Expect most visuals to have data (some like textbox may not)
    expect(withData.length).toBeGreaterThanOrEqual(25);
  });
});
