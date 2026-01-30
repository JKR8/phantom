import { test, expect } from '@playwright/test';

test.describe('Save & Share UI (Guest Mode)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined);
  });

  test('Save button is disabled for guests', async ({ page }) => {
    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeVisible();
    await expect(saveButton).toBeDisabled();
  });

  test('Share button is hidden when no dashboard saved', async ({ page }) => {
    // ShareButton returns null when dashboardId is null (guest mode)
    const shareButton = page.getByRole('button', { name: 'Share' });
    await expect(shareButton).toHaveCount(0);
  });

  test('Editable dashboard title — click to edit', async ({ page }) => {
    // Fluent UI Title2 renders as <span>, not <h2>. Use the title attribute
    // set by AppShell: title="Click to rename"
    const titleEl = page.locator('[title="Click to rename"]');
    await expect(titleEl).toBeVisible();
    await expect(titleEl).toContainText('Phantom');
    await titleEl.click();

    // Input should appear in the header (use type="text" to avoid matching the switch)
    const titleInput = page.locator('header input[type="text"]');
    await expect(titleInput).toBeVisible({ timeout: 5000 });

    // Clear and type a new name
    await titleInput.fill('My Custom Dashboard');
    await titleInput.blur();

    // Title should update — the element re-renders with new text
    await expect(page.locator('[title="Click to rename"]')).toContainText('My Custom Dashboard');

    // Store should reflect the change
    const name = await page.evaluate(() => {
      return (window as any).__phantomDebug.useStore.getState().dashboardName;
    });
    expect(name).toBe('My Custom Dashboard');
  });

  test('UserMenu shows "Sign In" for guests', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await expect(signInButton).toBeVisible();
  });
});
