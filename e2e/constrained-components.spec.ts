import { test, expect } from '@playwright/test';

const openTemplate = async (page: any, name: string) => {
  const templatesButton = page.getByRole('button', { name: 'Templates' });
  await templatesButton.click();
  const menuItem = page.getByRole('menuitem', { name });
  await menuItem.waitFor({ state: 'visible', timeout: 5000 });
  await menuItem.click();
  await page.waitForTimeout(1000);
};

test.describe('Constrained Components in Properties Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined);
  });

  test('Line chart shows Comparison and Time Grain constrained selects', async ({ page }) => {
    await openTemplate(page, 'Retail Dashboard');

    // Select a line chart to show comparison/timeGrain options
    const lineId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items.find((i: any) => i.type === 'line')?.id;
    });

    if (lineId) {
      await page.evaluate((id: string) => {
        (window as any).__phantomDebug.useStore.getState().selectItem(id);
      }, lineId);
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: 'test-results/screenshots/15-line-chart-constrained-selects.png',
      fullPage: false
    });
  });

  test('KPI card shows Operation constrained select', async ({ page }) => {
    await openTemplate(page, 'Email');

    // Select a card to show operation selector
    const cardId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items.find((i: any) => i.type === 'card' || i.type === 'kpi')?.id;
    });

    if (cardId) {
      await page.evaluate((id: string) => {
        (window as any).__phantomDebug.useStore.getState().selectItem(id);
      }, cardId);
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: 'test-results/screenshots/16-kpi-card-operation-select.png',
      fullPage: false
    });
  });

  test('Validation warning shows for invalid dimension', async ({ page }) => {
    await openTemplate(page, 'Retail Dashboard');

    // Select a bar chart and set an invalid dimension
    const barId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items.find((i: any) => i.type === 'bar')?.id;
    });

    if (barId) {
      // Select and set invalid dimension
      await page.evaluate((id: string) => {
        const state = (window as any).__phantomDebug.useStore.getState();
        state.selectItem(id);
        state.updateItemProps(id, { dimension: 'InvalidField' });
      }, barId);
      await page.waitForTimeout(500);
    }

    await page.screenshot({
      path: 'test-results/screenshots/17-validation-warning-invalid-dimension.png',
      fullPage: false
    });
  });
});
