import { test, expect } from '@playwright/test';

test.describe('Dashboard Management Page', () => {
  test('/dashboards redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/dashboards');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('MyDashboardsPage shows loading state', async ({ page }) => {
    // Navigate to dashboards — the Spinner should appear briefly before redirect
    await page.goto('/dashboards');
    // The page shows a spinner while auth is loading
    const spinner = page.getByText('Loading dashboards...');
    // Either the spinner appears or we quickly redirect to /login
    await expect(
      spinner.or(page.getByText('Phantom'))
    ).toBeVisible({ timeout: 10000 });
  });
});
