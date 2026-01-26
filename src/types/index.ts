export interface Store {
  id: string;
  name: string;
  region: string;
  country: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface Sale {
  id: string;
  storeId: string;
  productId: string;
  date: string;
  quantity: number;
  revenue: number;
  profit: number;
}

export type Scenario = 'Retail' | 'SaaS';

export type VisualType = 'bar' | 'line' | 'pie' | 'card' | 'table' | 'slicer';

export interface DashboardItem {
  id: string;
  type: VisualType;
  title: string;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  props?: any;
}

export interface DashboardState {
  scenario: Scenario;
  stores: Store[];
  products: Product[];
  sales: Sale[];
  filters: Record<string, any>;
  items: DashboardItem[];
  setScenario: (scenario: Scenario) => void;
  setFilter: (column: string, value: any) => void;
  clearFilters: () => void;
  addItem: (item: DashboardItem) => void;
  removeItem: (id: string) => void;
  updateLayout: (layout: any[]) => void;
}
