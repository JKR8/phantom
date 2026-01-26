import { create } from 'zustand';
import { DashboardState, Scenario, DashboardItem } from '../types';
import { generateRetailData, generateSaaSData, generateHRData, generateLogisticsData } from '../engine/dataGenerator';

const initialItems: DashboardItem[] = [
  { id: 'slicer1', type: 'slicer', title: 'Filter by Store', layout: { x: 0, y: 0, w: 3, h: 2 }, props: { dimension: 'Store' } },
  { id: 'card1', type: 'card', title: 'Total Revenue', layout: { x: 3, y: 0, w: 3, h: 2 }, props: { metric: 'revenue', operation: 'sum', label: 'Sum of Revenue', colorIndex: 0 } },
  { id: 'card2', type: 'card', title: 'Total Profit', layout: { x: 6, y: 0, w: 3, h: 2 }, props: { metric: 'profit', operation: 'sum', label: 'Sum of Profit', colorIndex: 2 } },
  { id: 'card3', type: 'card', title: 'Avg Order Value', layout: { x: 9, y: 0, w: 3, h: 2 }, props: { metric: 'revenue', operation: 'avg', label: 'Average per Transaction', colorIndex: 3 } },
  { id: 'chart1', type: 'bar', title: 'Revenue by Region', layout: { x: 0, y: 2, w: 6, h: 5 }, props: { dimension: 'Region', metric: 'revenue' } },
  { id: 'chart2', type: 'pie', title: 'Revenue by Category', layout: { x: 6, y: 2, w: 6, h: 5 }, props: { dimension: 'Category', metric: 'revenue' } },
  { id: 'chart3', type: 'line', title: 'Revenue Trend', layout: { x: 0, y: 7, w: 12, h: 5 }, props: { metric: 'revenue' } },
  { id: 'table1', type: 'table', title: 'Sales Details', layout: { x: 0, y: 12, w: 12, h: 6 }, props: { maxRows: 100 } },
];

import { Templates } from './templates';

export const useStore = create<DashboardState>((set, get) => ({
  scenario: 'Retail',
  ...generateRetailData(),
  customers: [],
  subscriptions: [],
  employees: [],
  shipments: [],
  filters: {},
  items: initialItems,
  setScenario: (scenario: Scenario) => {
    const emptyState = { stores: [], products: [], sales: [], customers: [], subscriptions: [], employees: [], shipments: [], filters: {} };
    if (scenario === 'Retail') {
      set({ scenario, ...emptyState, ...generateRetailData() });
    } else if (scenario === 'SaaS') {
      set({ scenario, ...emptyState, ...generateSaaSData() });
    } else if (scenario === 'HR') {
      set({ scenario, ...emptyState, ...generateHRData() });
    } else if (scenario === 'Logistics') {
      set({ scenario, ...emptyState, ...generateLogisticsData() });
    }
  },
  setFilter: (column, value) => {
    set((state) => {
      const newFilters = { ...state.filters };
      if (value === null || value === undefined) {
        delete newFilters[column];
      } else {
        newFilters[column] = value;
      }
      return { filters: newFilters };
    });
  },
  clearFilters: () => set({ filters: {} }),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
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
      return { items: newItems };
    }),
  loadTemplate: (templateName: string) => {
    const template = Templates.find(t => t.name === templateName);
    if (template) {
        // Switch scenario first if needed
        const currentScenario = get().scenario;
        if (currentScenario !== template.scenario) {
            get().setScenario(template.scenario);
        }
        // Then set items
        set({ items: template.items });
    }
  }
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
        } else {
            // HR and Logistics are flat for now
            // e.g. item['department'] === value
            // We need to map 'dimension' names to keys if they differ
            // assuming direct match for now
            const key = column.toLowerCase(); // simplistic
            if (item[key] !== undefined && item[key] !== value) return false;
             // Try case-insensitive match on keys? 
             // actually for HR: dimension='Department' -> item.department
             if (item[column.toLowerCase()] !== value && item[column] !== value) return false;
        }
    }
    return true;
  });
};
