import { test, expect } from '@playwright/test';

test.describe('Statistical Visuals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForSelector('[data-testid="canvas-drop-area"]', { timeout: 10000 });
  });

  test('statistical visuals appear in the visualizations pane', async ({ page }) => {
    // Check that statistical visual buttons exist
    await expect(page.locator('[data-testid="visual-source-boxplot"]')).toBeVisible();
    await expect(page.locator('[data-testid="visual-source-histogram"]')).toBeVisible();
    await expect(page.locator('[data-testid="visual-source-violin"]')).toBeVisible();
    await expect(page.locator('[data-testid="visual-source-regressionScatter"]')).toBeVisible();
  });

  test('can drop boxplot onto canvas and it renders', async ({ page }) => {
    // Get initial count
    const initialCount = await page.evaluate(() => {
      return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
    });

    const source = page.getByTestId('visual-source-boxplot');
    const target = page.locator('.layout');

    await source.dragTo(target, {
      targetPosition: { x: 400, y: 300 }
    });

    await page.waitForTimeout(500);

    // Check item was added
    const newCount = await page.evaluate(() => {
      return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
    });
    expect(newCount).toBe(initialCount + 1);

    // Check the new item is a boxplot
    const lastItem = await page.evaluate(() => {
      const state = (window as any).__phantomDebug?.useStore?.getState();
      return state?.items?.[state.items.length - 1];
    });
    expect(lastItem?.type).toBe('boxplot');
  });

  test('can drop histogram onto canvas and it renders', async ({ page }) => {
    const initialCount = await page.evaluate(() => {
      return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
    });

    const source = page.getByTestId('visual-source-histogram');
    const target = page.locator('.layout');

    await source.dragTo(target, {
      targetPosition: { x: 400, y: 300 }
    });

    await page.waitForTimeout(500);

    const newCount = await page.evaluate(() => {
      return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
    });
    expect(newCount).toBe(initialCount + 1);

    const lastItem = await page.evaluate(() => {
      const state = (window as any).__phantomDebug?.useStore?.getState();
      return state?.items?.[state.items.length - 1];
    });
    expect(lastItem?.type).toBe('histogram');
  });

  test('can drop violin onto canvas and it renders', async ({ page }) => {
    const initialCount = await page.evaluate(() => {
      return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
    });

    const source = page.getByTestId('visual-source-violin');
    const target = page.locator('.layout');

    await source.dragTo(target, {
      targetPosition: { x: 400, y: 300 }
    });

    await page.waitForTimeout(500);

    const newCount = await page.evaluate(() => {
      return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
    });
    expect(newCount).toBe(initialCount + 1);

    const lastItem = await page.evaluate(() => {
      const state = (window as any).__phantomDebug?.useStore?.getState();
      return state?.items?.[state.items.length - 1];
    });
    expect(lastItem?.type).toBe('violin');
  });

  test('can drop regression scatter onto canvas and it renders', async ({ page }) => {
    const initialCount = await page.evaluate(() => {
      return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
    });

    const source = page.getByTestId('visual-source-regressionScatter');
    const target = page.locator('.layout');

    await source.dragTo(target, {
      targetPosition: { x: 400, y: 300 }
    });

    await page.waitForTimeout(500);

    const newCount = await page.evaluate(() => {
      return (window as any).__phantomDebug?.useStore?.getState()?.items?.length || 0;
    });
    expect(newCount).toBe(initialCount + 1);

    const lastItem = await page.evaluate(() => {
      const state = (window as any).__phantomDebug?.useStore?.getState();
      return state?.items?.[state.items.length - 1];
    });
    expect(lastItem?.type).toBe('regressionScatter');
  });

  test('boxplot properties panel shows whisker method setting', async ({ page }) => {
    const source = page.getByTestId('visual-source-boxplot');
    const target = page.locator('.layout');

    await source.dragTo(target, {
      targetPosition: { x: 400, y: 300 }
    });

    await page.waitForTimeout(500);

    // Select the visual
    const lastId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug?.useStore?.getState();
      return state?.items?.[state.items.length - 1]?.id;
    });

    if (lastId) {
      await page.evaluate((itemId: string) => {
        (window as any).__phantomDebug?.useStore?.getState()?.selectItem(itemId);
      }, lastId);
    }

    await page.waitForTimeout(300);

    // Check that Whisker Method label appears in properties
    const whiskerLabel = page.getByText('Whisker Method');
    await expect(whiskerLabel).toBeVisible({ timeout: 5000 });
  });

  test('histogram properties panel shows bin method setting', async ({ page }) => {
    const source = page.getByTestId('visual-source-histogram');
    const target = page.locator('.layout');

    await source.dragTo(target, {
      targetPosition: { x: 400, y: 300 }
    });

    await page.waitForTimeout(500);

    const lastId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug?.useStore?.getState();
      return state?.items?.[state.items.length - 1]?.id;
    });

    if (lastId) {
      await page.evaluate((itemId: string) => {
        (window as any).__phantomDebug?.useStore?.getState()?.selectItem(itemId);
      }, lastId);
    }

    await page.waitForTimeout(300);

    const binLabel = page.getByText('Bin Method');
    await expect(binLabel).toBeVisible({ timeout: 5000 });
  });

  test('regression scatter properties panel shows regression type setting', async ({ page }) => {
    const source = page.getByTestId('visual-source-regressionScatter');
    const target = page.locator('.layout');

    await source.dragTo(target, {
      targetPosition: { x: 400, y: 300 }
    });

    await page.waitForTimeout(500);

    const lastId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug?.useStore?.getState();
      return state?.items?.[state.items.length - 1]?.id;
    });

    if (lastId) {
      await page.evaluate((itemId: string) => {
        (window as any).__phantomDebug?.useStore?.getState()?.selectItem(itemId);
      }, lastId);
    }

    await page.waitForTimeout(300);

    const regressionLabel = page.getByText('Regression Type');
    await expect(regressionLabel).toBeVisible({ timeout: 5000 });
  });
});
