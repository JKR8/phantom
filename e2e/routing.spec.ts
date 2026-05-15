import { test, expect } from '@playwright/test';

test.describe('Routing & Guest Mode', () => {
  test('Root redirects guest to /editor', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/editor');
    expect(page.url()).toContain('/editor');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
  });

  test('/editor loads full editor in guest mode', async ({ page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    // Visualizations pane at bottom
    await expect(page.getByTestId('visual-source-bar')).toBeVisible();
    // Left nav buttons
    await expect(page.getByTitle('New Screen')).toBeVisible();
  });

  test('/spec-v2 shows the v0.2 workshop spec surface', async ({ page }) => {
    await page.goto('/spec-v2');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText('Phantom v0.2 spec workspace')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('v0.2 spec valid')).toBeVisible();
    await expect(page.getByText('React readiness')).toBeVisible();
    await expect(page.getByText('Power BI readiness')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Spec canvas' })).toBeVisible();
    await expect(page.getByText('Confirm pbi fallback behavior for elicitation_panel.')).toBeVisible();
    await page.getByRole('button', { name: 'Resolve prompt' }).click();
    await expect(page.getByText('All prompts resolved')).toBeVisible();
    await expect(page.getByText('100%')).toBeVisible();

    await page.getByRole('button', { name: 'data', exact: true }).click();
    await expect(page.getByText('Power BI fallback behavior', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'approval', exact: true }).click();
    await expect(page.getByText('Current version')).toBeVisible();
    await expect(page.getByText('0.2.0-draft', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Approve as approver' }).click();
    await expect(page.getByText('Missing roles: analytics_owner')).toBeVisible();
    await page.getByRole('button', { name: 'Approve as analytics owner' }).click();
    await expect(page.getByText('Missing roles: none')).toBeVisible();
    await expect(page.getByText('Build ready')).toHaveCount(2);

    await page.getByRole('button', { name: 'exports', exact: true }).click();
    await expect(page.getByText('React Product Mode')).toBeVisible();
    await expect(page.getByText('Power BI Mode')).toBeVisible();
    await expect(page.getByText('Build ready: yes')).toHaveCount(2);
  });

  test('/dashboards redirects guest to /login', async ({ page }) => {
    await page.goto('/dashboards');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('/login shows auth form or Supabase-not-configured message', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    // Without Supabase env vars, shows "not configured" message with guest link
    await expect(page.getByText('Phantom')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Continue as Guest')).toBeVisible();
  });

  test('"Continue as Guest" link navigates to /editor', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Continue as Guest')).toBeVisible({ timeout: 10000 });
    await page.getByText('Continue as Guest').click();
    await page.waitForURL('**/editor');
    expect(page.url()).toContain('/editor');
  });

  test('/share/:bogus shows not-found error', async ({ page }) => {
    await page.goto('/share/bogus-id-12345');
    await page.waitForLoadState('domcontentloaded');
    // Without Supabase, shows an error message
    await expect(page.getByText(/not found|error|not configured/i)).toBeVisible({ timeout: 10000 });
  });

  test('404 page renders for unknown routes', async ({ page }) => {
    await page.goto('/xyz-unknown-route');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('404')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("doesn't exist")).toBeVisible();
  });

  test('Sign In button visible in top bar (guest mode)', async ({ page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });
});
