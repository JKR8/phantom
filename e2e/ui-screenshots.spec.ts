import { test, expect } from '@playwright/test';

const openTemplate = async (page: any, name: string) => {
  const templatesButton = page.getByRole('button', { name: 'Templates' });
  await templatesButton.click();
  const menuItem = page.getByRole('menuitem', { name });
  await menuItem.waitFor({ state: 'visible', timeout: 5000 });
  await menuItem.click();
  // Wait for template to fully render
  await page.waitForTimeout(1000);
};

test.describe('UI Screenshots for Visual Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined);
  });

  test('Retail Dashboard template screenshot', async ({ page }) => {
    await openTemplate(page, 'Retail Dashboard');
    await page.screenshot({ path: 'test-results/screenshots/01-retail-dashboard.png', fullPage: false });
  });

  test('Email template screenshot', async ({ page }) => {
    await openTemplate(page, 'Email');
    await page.screenshot({ path: 'test-results/screenshots/02-email-template.png', fullPage: false });
  });

  test('Sales template screenshot', async ({ page }) => {
    await openTemplate(page, 'Sales');
    await page.screenshot({ path: 'test-results/screenshots/03-sales-template.png', fullPage: false });
  });

  test('Marketing template screenshot', async ({ page }) => {
    await openTemplate(page, 'Marketing');
    await page.screenshot({ path: 'test-results/screenshots/04-marketing-template.png', fullPage: false });
  });

  test('HR Attrition template screenshot', async ({ page }) => {
    await openTemplate(page, 'HR Attrition');
    await page.screenshot({ path: 'test-results/screenshots/05-hr-attrition-template.png', fullPage: false });
  });

  test('Logistics template screenshot', async ({ page }) => {
    await openTemplate(page, 'Logistics Supply Chain');
    await page.screenshot({ path: 'test-results/screenshots/06-logistics-template.png', fullPage: false });
  });

  test('Finance template screenshot', async ({ page }) => {
    await openTemplate(page, 'Finance');
    await page.screenshot({ path: 'test-results/screenshots/07-finance-template.png', fullPage: false });
  });

  test('Social Media template screenshot', async ({ page }) => {
    await openTemplate(page, 'Social Media Sentiment');
    await page.screenshot({ path: 'test-results/screenshots/08-social-media-template.png', fullPage: false });
  });

  test('Zebra IBCS template screenshot', async ({ page }) => {
    await openTemplate(page, 'Zebra (IBCS)');
    await page.screenshot({ path: 'test-results/screenshots/09-zebra-ibcs-template.png', fullPage: false });
  });

  test('Properties Panel with bar chart selected', async ({ page }) => {
    await openTemplate(page, 'Retail Dashboard');

    // Select a bar chart
    const barId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items.find((i: any) => i.type === 'bar')?.id;
    });
    if (barId) {
      await page.evaluate((id: string) => {
        (window as any).__phantomDebug.useStore.getState().selectItem(id);
      }, barId);
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: 'test-results/screenshots/10-properties-panel-bar.png', fullPage: false });
  });

  test('Properties Panel with KPI card selected', async ({ page }) => {
    await openTemplate(page, 'Email');

    // Select a card/KPI
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
    await page.screenshot({ path: 'test-results/screenshots/11-properties-panel-kpi.png', fullPage: false });
  });

  test('Quick Shape Strip visible', async ({ page }) => {
    await openTemplate(page, 'Retail Dashboard');

    // Select a bar chart to show Quick Shape Strip
    const barId = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      return state.items.find((i: any) => i.type === 'bar')?.id;
    });
    if (barId) {
      await page.evaluate((id: string) => {
        (window as any).__phantomDebug.useStore.getState().selectItem(id);
      }, barId);
      await expect(page.getByTestId('quick-shape-strip')).toBeVisible();
      await page.waitForTimeout(300);
    }
    await page.screenshot({ path: 'test-results/screenshots/12-quick-shape-strip.png', fullPage: false });
  });

  test('Standard Layout Mode (Executive)', async ({ page }) => {
    // Switch to Executive layout
    const layoutToggle = page.getByRole('button', { name: /Layout/i });
    await layoutToggle.click();
    await page.getByRole('menuitem', { name: 'Executive' }).click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/screenshots/13-executive-layout.png', fullPage: false });
  });

  test('Variant Picker visible on drop', async ({ page }) => {
    // Clear canvas and drop a bar chart
    await page.getByTitle('New Screen').click();

    const source = page.getByTestId('visual-source-bar');
    const canvas = page.getByTestId('canvas-drop-area');
    await source.dragTo(canvas, { targetPosition: { x: 600, y: 400 } });

    await expect(page.getByTestId('variant-picker')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/screenshots/14-variant-picker.png', fullPage: false });

    // Dismiss picker
    await page.keyboard.press('Escape');
  });
});
