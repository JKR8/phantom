import { create } from 'zustand';
import { DashboardState, Scenario, DashboardItem } from '../types';
import { generateRetailData } from '../engine/dataGenerator';

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

export const useStore = create<DashboardState>((set) => ({
  scenario: 'Retail',
  ...generateRetailData(),
  filters: {},
  items: initialItems,
  setScenario: (scenario: Scenario) => {
    if (scenario === 'Retail') {
      set({ scenario, ...generateRetailData(), filters: {} });
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
}));

// Selectors for filtered data
export const useFilteredSales = () => {
  const sales = useStore((state) => state.sales);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const filters = useStore((state) => state.filters);

  return sales.filter((sale) => {
    // Join with Store for Region/Country filters
    const store = stores.find((s) => s.id === sale.storeId);
    // Join with Product for Category filters
    const product = products.find((p) => p.id === sale.productId);

    for (const [column, value] of Object.entries(filters)) {
      if (column === 'Region' && store?.region !== value) return false;
      if (column === 'Category' && product?.category !== value) return false;
      if (column === 'Store' && store?.name !== value) return false;
      if (column === 'Product' && product?.name !== value) return false;
    }
    return true;
  });
};
