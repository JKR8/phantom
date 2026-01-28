import { test, expect } from '@playwright/test';

test.describe('Store Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/editor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.layout')).toBeVisible({ timeout: 15000 });
    await page.waitForFunction(() => (window as any).__phantomDebug !== undefined);
  });

  test('isDirty tracks mutations', async ({ page }) => {
    // GridLayout fires onLayoutChange on mount which sets isDirty=true.
    // Start from a known clean baseline.
    await page.evaluate(() => {
      (window as any).__phantomDebug.useStore.getState().markClean();
    });

    // markClean should have set isDirty to false
    const cleanDirty = await page.evaluate(() => {
      return (window as any).__phantomDebug.useStore.getState().isDirty;
    });
    expect(cleanDirty).toBe(false);

    // addItem sets isDirty to true
    const dirtyAfterAdd = await page.evaluate(() => {
      const state = (window as any).__phantomDebug.useStore.getState();
      state.addItem({
        id: 'test-dirty',
        type: 'card',
        title: 'Test',
        layout: { x: 0, y: 0, w: 6, h: 2 },
        props: { metric: 'revenue' },
      });
      return (window as any).__phantomDebug.useStore.getState().isDirty;
    });
    expect(dirtyAfterAdd).toBe(true);

    // markClean resets isDirty — read atomically to avoid GridLayout race
    const dirtyAfterClean = await page.evaluate(() => {
      (window as any).__phantomDebug.useStore.getState().markClean();
      return (window as any).__phantomDebug.useStore.getState().isDirty;
    });
    expect(dirtyAfterClean).toBe(false);
  });

  test('setDashboardMeta updates metadata and marks dirty on name change', async ({ page }) => {
    // First mark clean so we can detect that name change triggers isDirty
    const result = await page.evaluate(() => {
      const store = (window as any).__phantomDebug.useStore.getState();
      store.markClean();
      store.setDashboardMeta({
        id: 'test-id-123',
        name: 'Test Dashboard',
        isPublic: true,
        shareId: 'share-abc',
      });
      const s = (window as any).__phantomDebug.useStore.getState();
      return {
        dashboardId: s.dashboardId,
        dashboardName: s.dashboardName,
        isPublic: s.isPublic,
        shareId: s.shareId,
        isDirty: s.isDirty,
      };
    });

    expect(result.dashboardId).toBe('test-id-123');
    expect(result.dashboardName).toBe('Test Dashboard');
    expect(result.isPublic).toBe(true);
    expect(result.shareId).toBe('share-abc');
    // Name change should mark dirty
    expect(result.isDirty).toBe(true);
  });

  test('getSerializableState returns correct shape', async ({ page }) => {
    const snapshot = await page.evaluate(() => {
      return (window as any).__phantomDebug.useStore.getState().getSerializableState();
    });

    expect(snapshot).toHaveProperty('scenario');
    expect(snapshot).toHaveProperty('items');
    expect(snapshot).toHaveProperty('filters');
    expect(snapshot).toHaveProperty('layoutMode');
    expect(snapshot).toHaveProperty('themePalette');
    expect(Array.isArray(snapshot.items)).toBe(true);
    expect(typeof snapshot.scenario).toBe('string');
  });

  test('loadDashboardFromDb hydrates store', async ({ page }) => {
    const mockDb = {
      id: 'db-id-456',
      name: 'Loaded Dashboard',
      scenario: 'SaaS',
      items: [
        { id: 'loaded-1', type: 'card', title: 'MRR Card', layout: { x: 0, y: 0, w: 6, h: 2 }, props: { metric: 'mrr' } },
      ],
      filters: { Tier: 'Enterprise' },
      layout_mode: 'Standard',
      is_public: false,
      share_id: null,
      theme_palette: null,
      updated_at: '2025-01-01T00:00:00Z',
    };

    // Load and read atomically to avoid GridLayout onLayoutChange race
    const state = await page.evaluate((db: any) => {
      (window as any).__phantomDebug.useStore.getState().loadDashboardFromDb(db);
      const s = (window as any).__phantomDebug.useStore.getState();
      return {
        dashboardId: s.dashboardId,
        dashboardName: s.dashboardName,
        scenario: s.scenario,
        items: s.items,
        filters: s.filters,
        layoutMode: s.layoutMode,
        isDirty: s.isDirty,
      };
    }, mockDb);

    expect(state.dashboardId).toBe('db-id-456');
    expect(state.dashboardName).toBe('Loaded Dashboard');
    expect(state.scenario).toBe('SaaS');
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe('MRR Card');
    expect(state.filters).toEqual({ Tier: 'Enterprise' });
    expect(state.layoutMode).toBe('Standard');
    expect(state.isDirty).toBe(false);
  });

  test('resetToNew clears all persistence fields', async ({ page }) => {
    // First set some state
    await page.evaluate(() => {
      const store = (window as any).__phantomDebug.useStore.getState();
      store.setDashboardMeta({
        id: 'test-reset-id',
        name: 'Will Be Reset',
        isPublic: true,
        shareId: 'share-xyz',
      });
      store.markDirty();
    });

    // Verify state was set
    const beforeReset = await page.evaluate(() => {
      return (window as any).__phantomDebug.useStore.getState().dashboardId;
    });
    expect(beforeReset).toBe('test-reset-id');

    // Reset and read atomically to avoid GridLayout onLayoutChange race
    const afterReset = await page.evaluate(() => {
      (window as any).__phantomDebug.useStore.getState().resetToNew();
      const s = (window as any).__phantomDebug.useStore.getState();
      return {
        dashboardId: s.dashboardId,
        dashboardName: s.dashboardName,
        isDirty: s.isDirty,
        isPublic: s.isPublic,
        shareId: s.shareId,
        scenario: s.scenario,
        itemCount: s.items.length,
      };
    });

    expect(afterReset.dashboardId).toBeNull();
    expect(afterReset.dashboardName).toBe('Untitled Dashboard');
    expect(afterReset.isDirty).toBe(false);
    expect(afterReset.isPublic).toBe(false);
    expect(afterReset.shareId).toBeNull();
    expect(afterReset.scenario).toBe('Retail');
    expect(afterReset.itemCount).toBeGreaterThan(0); // initialItems
  });
});
