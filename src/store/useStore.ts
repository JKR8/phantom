import { create } from 'zustand';
import { DashboardState, Scenario, DashboardItem, LayoutMode, DbDashboard } from '../types';
import { generateRetailData, generateSaaSData, generateHRData, generateLogisticsData, generatePortfolioData, generateSocialData, generateFinanceData } from '../engine/dataGenerator';
import { useThemeStore, PALETTES, DEFAULT_PALETTE } from './useThemeStore';

const initialItems: DashboardItem[] = [
  { id: 'slicer1', type: 'slicer', title: 'Filter by Store', layout: { x: 0, y: 0, w: 6, h: 2 }, props: { dimension: 'Store' } },
  { id: 'card1', type: 'card', title: 'Total Revenue', layout: { x: 6, y: 0, w: 6, h: 2 }, props: { metric: 'revenue', operation: 'sum', label: 'Sum of Revenue', colorIndex: 0 } },
  { id: 'card2', type: 'card', title: 'Total Profit', layout: { x: 12, y: 0, w: 6, h: 2 }, props: { metric: 'profit', operation: 'sum', label: 'Sum of Profit', colorIndex: 2 } },
  { id: 'card3', type: 'card', title: 'Avg Order Value', layout: { x: 18, y: 0, w: 6, h: 2 }, props: { metric: 'revenue', operation: 'avg', label: 'Average per Transaction', colorIndex: 3 } },
  { id: 'chart1', type: 'bar', title: 'Revenue by Region', layout: { x: 0, y: 2, w: 12, h: 5 }, props: { dimension: 'Region', metric: 'revenue' } },
  { id: 'chart2', type: 'pie', title: 'Revenue by Category', layout: { x: 12, y: 2, w: 12, h: 5 }, props: { dimension: 'Category', metric: 'revenue' } },
  { id: 'chart3', type: 'line', title: 'Revenue Trend', layout: { x: 0, y: 7, w: 24, h: 5 }, props: { metric: 'revenue' } },
  { id: 'table1', type: 'table', title: 'Sales Details', layout: { x: 0, y: 12, w: 24, h: 6 }, props: { maxRows: 100 } },
];

import { Templates } from './templates';

export const useStore = create<DashboardState>((set, get) => ({
  scenario: 'Retail',
  ...generateRetailData(),
  customers: [],
  subscriptions: [],
  employees: [],
  shipments: [],
  financeRecords: [],
  portfolioEntities: [],
  controversyScores: [],
  socialPosts: [],
  filters: {},
  items: initialItems,
  selectedItemId: null,
  layoutMode: 'Free',
  // Persistence fields
  dashboardId: null,
  dashboardName: 'Untitled Dashboard',
  isPublic: false,
  shareId: null,
  isDirty: false,
  lastSavedAt: null,
  setScenario: (scenario: Scenario) => {
    const emptyState = { stores: [], products: [], sales: [], customers: [], subscriptions: [], employees: [], shipments: [], financeRecords: [], portfolioEntities: [], controversyScores: [], socialPosts: [], filters: {} };
    if (scenario === 'Retail') {
      set({ scenario, ...emptyState, ...generateRetailData(), isDirty: true });
    } else if (scenario === 'SaaS') {
      set({ scenario, ...emptyState, ...generateSaaSData(), isDirty: true });
    } else if (scenario === 'HR') {
      set({ scenario, ...emptyState, ...generateHRData(), isDirty: true });
    } else if (scenario === 'Logistics') {
      set({ scenario, ...emptyState, ...generateLogisticsData(), isDirty: true });
    } else if (scenario === 'Portfolio') {
      set({ scenario, ...emptyState, ...generatePortfolioData(), isDirty: true });
    } else if (scenario === 'Social') {
      set({ scenario, ...emptyState, ...generateSocialData(), isDirty: true });
    } else if (scenario === 'Finance') {
      set({ scenario, ...emptyState, ...generateFinanceData(), isDirty: true });
    }
  },
  setLayoutMode: (mode: LayoutMode) => set({ layoutMode: mode, isDirty: true }),
  setFilter: (column, value) => {
    set((state) => {
      const newFilters = { ...state.filters };
      if (value === null || value === undefined) {
        delete newFilters[column];
      } else {
        newFilters[column] = value;
      }
      return { filters: newFilters, isDirty: true };
    });
  },
  clearFilters: () => set({ filters: {}, isDirty: true }),
  addItem: (item) => set((state) => ({ items: [...state.items, item], isDirty: true })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id), isDirty: true })),
  updateLayout: (layout) =>
    set((state) => {
      const newItems = state.items.map((item) => {
        const layoutItem = layout.find((l: any) => l.i === item.id);
        if (layoutItem) {
          return {
            ...item,
            layout: {
              ...item.layout,
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            },
          };
        }
        return item;
      });
      return { items: newItems, isDirty: true };
    }),
  selectItem: (id: string | null) => set({ selectedItemId: id }),
  updateItemProps: (id: string, props: any) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, props: { ...item.props, ...props } } : item
      ),
      isDirty: true,
    })),
  updateItemTitle: (id: string, title: string) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, title } : item
      ),
      isDirty: true,
    })),
  clearCanvas: () => set({ items: [], selectedItemId: null, filters: {}, isDirty: true }),
  loadTemplate: (templateName: string) => {
    const template = Templates.find(t => t.name === templateName);
    if (template) {
        // Switch scenario first if needed
        const currentScenario = get().scenario;
        if (currentScenario !== template.scenario) {
            get().setScenario(template.scenario);
        }

        // Switch theme if specified, otherwise reset to default
        if (template.theme) {
            const palette = PALETTES.find(p => p.name === template.theme);
            if (palette) {
                useThemeStore.getState().setPalette(palette);
            }
        } else {
            useThemeStore.getState().setPalette(DEFAULT_PALETTE);
        }

        // Then set items
        set({ items: JSON.parse(JSON.stringify(template.items)), isDirty: true });
    }
  },
  // Persistence actions
  setDashboardMeta: (meta) => set((state) => ({
    dashboardId: meta.id !== undefined ? meta.id : state.dashboardId,
    dashboardName: meta.name !== undefined ? meta.name : state.dashboardName,
    isPublic: meta.isPublic !== undefined ? meta.isPublic : state.isPublic,
    shareId: meta.shareId !== undefined ? meta.shareId : state.shareId,
  })),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
  loadDashboardFromDb: (db: DbDashboard) => {
    const scenario = db.scenario as Scenario;
    const emptyState = { stores: [], products: [], sales: [], customers: [], subscriptions: [], employees: [], shipments: [], financeRecords: [], portfolioEntities: [], controversyScores: [], socialPosts: [], filters: {} };
    let dataState = {};
    if (scenario === 'Retail') dataState = generateRetailData();
    else if (scenario === 'SaaS') dataState = generateSaaSData();
    else if (scenario === 'HR') dataState = generateHRData();
    else if (scenario === 'Logistics') dataState = generateLogisticsData();
    else if (scenario === 'Portfolio') dataState = generatePortfolioData();
    else if (scenario === 'Social') dataState = generateSocialData();
    else if (scenario === 'Finance') dataState = generateFinanceData();

    // Restore theme palette
    if (db.theme_palette) {
      const palette = PALETTES.find(p => p.name === db.theme_palette);
      if (palette) useThemeStore.getState().setPalette(palette);
    }

    set({
      ...emptyState,
      ...dataState,
      scenario,
      items: db.items || [],
      filters: db.filters || {},
      layoutMode: (db.layout_mode || 'Free') as LayoutMode,
      selectedItemId: null,
      dashboardId: db.id,
      dashboardName: db.name,
      isPublic: db.is_public,
      shareId: db.share_id,
      isDirty: false,
      lastSavedAt: db.updated_at,
    });
  },
  getSerializableState: () => {
    const state = get();
    return {
      scenario: state.scenario,
      items: state.items,
      filters: state.filters,
      layoutMode: state.layoutMode,
      themePalette: useThemeStore.getState().activePalette.name,
    };
  },
  resetToNew: () => {
    const emptyState = { stores: [], products: [], sales: [], customers: [], subscriptions: [], employees: [], shipments: [], financeRecords: [], portfolioEntities: [], controversyScores: [], socialPosts: [], filters: {} };
    set({
      ...emptyState,
      ...generateRetailData(),
      scenario: 'Retail',
      items: initialItems,
      selectedItemId: null,
      layoutMode: 'Free',
      dashboardId: null,
      dashboardName: 'Untitled Dashboard',
      isPublic: false,
      shareId: null,
      isDirty: false,
      lastSavedAt: null,
    });
    useThemeStore.getState().setPalette(DEFAULT_PALETTE);
  },
}));

// Generic Selector for filtered data
export const useFilteredSales = () => { // Keeping name for compatibility but it returns any[]
  const state = useStore();
  const { scenario, filters } = state;

  let data: any[] = [];

  if (scenario === 'Retail') {
    data = state.sales;
  } else if (scenario === 'SaaS') {
    data = state.subscriptions;
  } else if (scenario === 'HR') {
    data = state.employees;
  } else if (scenario === 'Logistics') {
    data = state.shipments;
  } else if (scenario === 'Portfolio') {
    data = state.controversyScores;
  } else if (scenario === 'Social') {
    data = state.socialPosts;
  } else if (scenario === 'Finance') {
    data = state.financeRecords;
  }

  return data.filter((item) => {
    // Universal filtering logic
    // For Retail: Join Store/Product
    // For others: Direct property match

    for (const [column, value] of Object.entries(filters)) {
      if (!value) continue;

      if (scenario === 'Retail') {
        const store = state.stores.find((s) => s.id === item.storeId);
        const product = state.products.find((p) => p.id === item.productId);
        if (column === 'Region' && store?.region !== value) return false;
        if (column === 'Category' && product?.category !== value) return false;
        if (column === 'Store' && store?.name !== value) return false;
        if (column === 'Product' && product?.name !== value) return false;
      } else if (scenario === 'SaaS') {
        const customer = state.customers.find(c => c.id === item.customerId);
        if (column === 'Region' && customer?.region !== value) return false;
        if (column === 'Tier' && customer?.tier !== value) return false;
      } else if (scenario === 'Portfolio') {
        // Portfolio filtering
        if (column === 'Region' && item.region !== value) return false;
        if (column === 'Sector') {
          const entity = state.portfolioEntities.find(e => e.id === item.entityId);
          if (entity?.sector !== value) return false;
        }
        if (column === 'Category' && item.category !== value) return false;
        if (column === 'Score' && item.score !== parseInt(value)) return false;
        if (column === 'ChangeDirection') {
          if (value === 'Increase' && item.scoreChange <= 0) return false;
          if (value === 'Decrease' && item.scoreChange >= 0) return false;
          if (value === 'No Change' && item.scoreChange !== 0) return false;
        }
        if (column === 'Group' && item.group !== value) return false;
      } else if (scenario === 'Social') {
        if (column === 'Platform' && item.platform !== value) return false;
        if (column === 'Sentiment' && item.sentiment !== value) return false;
        if (column === 'Location' && item.location !== value) return false;
        if (column === 'User' && item.user !== value) return false;
      } else if (scenario === 'Finance') {
        if (column === 'Account' && item.account !== value) return false;
        if (column === 'Region' && item.region !== value) return false;
        if (column === 'BusinessUnit' && item.businessUnit !== value) return false;
        if (column === 'Scenario' && item.scenario !== value) return false;
      } else {
        // HR and Logistics are flat for now
        const key = column.toLowerCase();
        if (item[key] !== undefined && item[key] !== value) return false;
        if (item[column.toLowerCase()] !== value && item[column] !== value) return false;
      }
    }
    return true;
  });
};

// Portfolio-specific selector for entities
export const useFilteredPortfolioEntities = () => {
  const state = useStore();
  const { filters, portfolioEntities } = state;

  return portfolioEntities.filter((entity) => {
    for (const [column, value] of Object.entries(filters)) {
      if (!value) continue;
      if (column === 'Region' && entity.region !== value) return false;
      if (column === 'Sector' && entity.sector !== value) return false;
    }
    return true;
  });
};

// Portfolio-specific selector for controversy scores
export const useFilteredControversyScores = () => {
  const state = useStore();
  const { filters, controversyScores, portfolioEntities } = state;

  return controversyScores.filter((score) => {
    for (const [column, value] of Object.entries(filters)) {
      if (!value) continue;
      if (column === 'Region' && score.region !== value) return false;
      if (column === 'Sector') {
        const entity = portfolioEntities.find(e => e.id === score.entityId);
        if (entity?.sector !== value) return false;
      }
      if (column === 'Category' && score.category !== value) return false;
      if (column === 'Score' && score.score !== parseInt(value)) return false;
      if (column === 'ChangeDirection') {
        if (value === 'Increase' && score.scoreChange <= 0) return false;
        if (value === 'Decrease' && score.scoreChange >= 0) return false;
        if (value === 'No Change' && score.scoreChange !== 0) return false;
      }
      if (column === 'Group' && score.group !== value) return false;
    }
    return true;
  });
};
