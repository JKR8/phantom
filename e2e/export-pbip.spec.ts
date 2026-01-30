import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const openTemplate = async (page: any, name: string) => {
  const templatesButton = page.getByRole('button', { name: 'Templates' });
  await templatesButton.click();
  const menuItem = page.getByRole('menuitem', { name });
  await menuItem.waitFor({ state: 'visible', timeout: 5000 });
  await menuItem.click();
  await page.waitForTimeout(1000);
};

test.describe('PBIP Export Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined);
  });

  test('Export Retail Dashboard as PBIP', async ({ page }) => {
    await openTemplate(page, 'Retail Dashboard');

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

    const outputPath = path.join('test-results', 'pbip-exports', `PhantomRetail.zip`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(exportResult.bytes));

    console.log(`Exported Retail Dashboard: ${exportResult.itemCount} items to ${outputPath}`);
    expect(exportResult.itemCount).toBeGreaterThan(0);
  });

  test('Export Email template as PBIP', async ({ page }) => {
    await openTemplate(page, 'Email');

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

    const outputPath = path.join('test-results', 'pbip-exports', `PhantomEmail.zip`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(exportResult.bytes));

    console.log(`Exported Email template: ${exportResult.itemCount} items to ${outputPath}`);
    expect(exportResult.itemCount).toBeGreaterThan(0);
  });

  test('Export Finance template as PBIP', async ({ page }) => {
    await openTemplate(page, 'Finance');

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

    const outputPath = path.join('test-results', 'pbip-exports', `PhantomFinance.zip`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(exportResult.bytes));

    console.log(`Exported Finance template: ${exportResult.itemCount} items to ${outputPath}`);
    expect(exportResult.itemCount).toBeGreaterThan(0);
  });

  test('Export Social Media template as PBIP', async ({ page }) => {
    await openTemplate(page, 'Social Media Sentiment');

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

    const outputPath = path.join('test-results', 'pbip-exports', `PhantomSocial.zip`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, Buffer.from(exportResult.bytes));

    console.log(`Exported Social Media template: ${exportResult.itemCount} items to ${outputPath}`);
    expect(exportResult.itemCount).toBeGreaterThan(0);
  });
});
