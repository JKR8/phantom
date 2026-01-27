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
  revenuePL: number; // Plan
  revenuePY: number; // Previous Year
  profit: number;
  profitPL: number;
  profitPY: number;
}

export interface Customer {
  id: string;
  name: string;
  tier: 'Starter' | 'Professional' | 'Enterprise';
  region: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  date: string;
  mrr: number;
  mrrPL: number;
  mrrPY: number;
  churn: number; // 0 or 1 for boolean-like, or a value
  ltv: number;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  salary: number;
  rating: number; // 1-5
  attrition: number; // 0 or 1
  tenure: number; // years
}

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  carrier: string;
  cost: number;
  weight: number;
  status: 'Delivered' | 'In Transit' | 'Delayed';
  date: string;
  onTime: number; // 0 or 1
}

// Portfolio Monitoring types
export interface PortfolioEntity {
  id: string;
  name: string;
  sector: string;
  region: string;
  marketValue: number;
  sourceRegion: string;
  source: string;
  accountReportName: string;  // e.g. "Global Equity Fund"
  accountCode: string;        // the "Acc" column (ID like "ACC001")
}

export interface ControversyScore {
  id: string;
  entityId: string;
  entityName: string;
  category: string;
  score: number;
  previousScore: number;
  scoreChange: number;
  validFrom: string;
  marketValue: number;
  justification: string;
  source: string;
  region: string;
  group: string; // For bar chart grouping (USA, EMEA, APAC, CEMAR, Gulf+, Basic Capital, etc.)
}

export type Scenario = 'Retail' | 'SaaS' | 'HR' | 'Logistics' | 'Social' | 'Portfolio';

export type VisualType =
  | 'bar'
  | 'column'
  | 'stackedBar'
  | 'stackedColumn'
  | 'line'
  | 'area'
  | 'scatter'
  | 'pie'
  | 'donut'
  | 'treemap'
  | 'funnel'
  | 'gauge'
  | 'card'
  | 'multiRowCard'
  | 'table'
  | 'matrix'
  | 'waterfall'
  | 'slicer'
  | 'controversyBar'
  | 'entityTable'
  | 'controversyTable'
  | 'portfolioCard'
  | 'portfolioHeader'
  | 'dateRangePicker'
  | 'portfolioHeaderBar'
  | 'controversyBottomPanel'
  | 'justificationSearch'
  | 'portfolioKPICards';

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
  customers: Customer[];
  subscriptions: Subscription[];
  employees: Employee[];
  shipments: Shipment[];
  portfolioEntities: PortfolioEntity[];
  controversyScores: ControversyScore[];
  filters: Record<string, any>;
  items: DashboardItem[];
  selectedItemId: string | null;
  setScenario: (scenario: Scenario) => void;
  setFilter: (column: string, value: any) => void;
  clearFilters: () => void;
  addItem: (item: DashboardItem) => void;
  removeItem: (id: string) => void;
  updateLayout: (layout: any[]) => void;
  loadTemplate: (templateName: string) => void;
  selectItem: (id: string | null) => void;
  updateItemProps: (id: string, props: any) => void;
  updateItemTitle: (id: string, title: string) => void;
}
