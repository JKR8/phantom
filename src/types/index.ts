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

export interface FinanceRecord {
  id: string;
  date: string;
  account: string;
  region: string;
  businessUnit: string;
  scenario: 'Actual' | 'Budget' | 'Forecast';
  amount: number;
  variance: number;
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

// Social scenario types
export interface SocialPost {
  id: string;
  date: string;
  user: string;
  location: string;
  platform: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  engagements: number;
  mentions: number;
  sentimentScore: number; // -1 to 1
}

export type Scenario = 'Retail' | 'SaaS' | 'HR' | 'Logistics' | 'Social' | 'Portfolio' | 'Finance';
export type LayoutMode = 'Free' | 'Standard';

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

export interface DashboardSnapshot {
  scenario: Scenario;
  items: DashboardItem[];
  filters: Record<string, any>;
  layoutMode: LayoutMode;
  themePalette: string;
}

export interface DbDashboard {
  id: string;
  user_id: string;
  name: string;
  scenario: string;
  items: DashboardItem[];
  filters: Record<string, any>;
  layout_mode: string;
  theme_palette: string;
  is_public: boolean;
  share_id: string | null;
  created_at: string;
  updated_at: string;
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
  financeRecords: FinanceRecord[];
  portfolioEntities: PortfolioEntity[];
  controversyScores: ControversyScore[];
  socialPosts: SocialPost[];
  filters: Record<string, any>;
  items: DashboardItem[];
  selectedItemId: string | null;
  layoutMode: LayoutMode;
  setScenario: (scenario: Scenario) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setFilter: (column: string, value: any) => void;
  clearFilters: () => void;
  addItem: (item: DashboardItem) => void;
  removeItem: (id: string) => void;
  updateLayout: (layout: any[]) => void;
  loadTemplate: (templateName: string) => void;
  selectItem: (id: string | null) => void;
  updateItemProps: (id: string, props: any) => void;
  updateItemTitle: (id: string, title: string) => void;
  clearCanvas: () => void;
  // Persistence fields
  dashboardId: string | null;
  dashboardName: string;
  isPublic: boolean;
  shareId: string | null;
  isDirty: boolean;
  lastSavedAt: string | null;
  // Persistence actions
  setDashboardMeta: (meta: { id?: string | null; name?: string; isPublic?: boolean; shareId?: string | null }) => void;
  markDirty: () => void;
  markClean: () => void;
  loadDashboardFromDb: (db: DbDashboard) => void;
  getSerializableState: () => DashboardSnapshot;
  resetToNew: () => void;
}
