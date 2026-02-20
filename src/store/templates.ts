import { DashboardItem } from '../types';

export interface Template {
  name: string;
  scenario: 'Retail' | 'SaaS' | 'HR' | 'Logistics' | 'Social' | 'Portfolio' | 'Finance';
  theme?: string;
  items: DashboardItem[];
}

// Grid uses 48 columns with 20px row height, 8px margins between visuals
// IMPORTANT: Each template uses UNIQUE item IDs (prefixed with template abbreviation) to prevent React key conflicts

// ─── Retail Dashboard (default initial state) ────────────────────────────────
// Classic layout: Slicers on left + KPIs to the right
export const RetailDashboardTemplate: Template = {
  name: 'Retail Dashboard',
  scenario: 'Retail',
  items: [
    // Row 0: Slicers (8w) + 5 KPI cards (40w) = 48
    { id: 'rd-slicer1', type: 'slicer', title: 'Store', layout: { x: 0, y: 0, w: 4, h: 5 }, props: { dimension: 'Store' } },
    { id: 'rd-slicer2', type: 'slicer', title: 'Region', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { dimension: 'Region' } },
    { id: 'rd-card1', type: 'card', title: 'Total Revenue', layout: { x: 8, y: 0, w: 8, h: 5 }, props: { metric: 'revenue', operation: 'sum', label: 'Sum of Revenue', colorIndex: 0 } },
    { id: 'rd-card2', type: 'card', title: 'Total Profit', layout: { x: 16, y: 0, w: 8, h: 5 }, props: { metric: 'profit', operation: 'sum', label: 'Sum of Profit', colorIndex: 2 } },
    { id: 'rd-card3', type: 'card', title: 'Avg Order', layout: { x: 24, y: 0, w: 8, h: 5 }, props: { metric: 'revenue', operation: 'avg', label: 'Avg per Transaction', colorIndex: 3 } },
    { id: 'rd-card4', type: 'card', title: 'Total Qty', layout: { x: 32, y: 0, w: 8, h: 5 }, props: { metric: 'quantity', operation: 'sum', label: 'Units Sold', colorIndex: 1 } },
    { id: 'rd-card5', type: 'card', title: 'Transactions', layout: { x: 40, y: 0, w: 8, h: 5 }, props: { metric: 'revenue', operation: 'count', label: 'Transactions', colorIndex: 4 } },
    // Row 5-14: Bar + Pie side by side
    { id: 'rd-chart1', type: 'bar', title: 'Revenue by Region', layout: { x: 0, y: 5, w: 24, h: 10 }, props: { dimension: 'Region', metric: 'revenue' } },
    { id: 'rd-chart2', type: 'pie', title: 'Revenue by Category', layout: { x: 24, y: 5, w: 24, h: 10 }, props: { dimension: 'Category', metric: 'revenue' } },
    // Row 15-21: Line chart full width
    { id: 'rd-chart3', type: 'line', title: 'Revenue Trend', layout: { x: 0, y: 15, w: 48, h: 7 }, props: { metric: 'revenue' } },
    // Row 22-31: Table full width
    { id: 'rd-table1', type: 'table', title: 'Sales Details', layout: { x: 0, y: 22, w: 48, h: 10 }, props: { maxRows: 100 } },
  ]
};

// ─── Sales (Retail enriched) ─────────────────────────────────────────────────
// Executive layout: Banner header, Slicers + KPIs, then hero chart with support visuals
export const RetailTemplate: Template = {
  name: 'Sales',
  scenario: 'Retail',
  theme: 'Sunset',
  items: [
    // Row 0-2: Banner header
    { id: 'sales-banner', type: 'banner', title: 'Sales Performance Dashboard', layout: { x: 0, y: 0, w: 48, h: 3 }, props: { title: 'Sales Performance Dashboard', subtitle: 'Retail Analytics Overview', variant: 'thinLine', accentColor: '#0078D4' } },
    // Row 3-7: Slicers (8w) + 4 KPI cards (40w) = 48
    { id: 'sales-slicer1', type: 'slicer', title: 'Store', layout: { x: 0, y: 3, w: 4, h: 5 }, props: { dimension: 'Store' } },
    { id: 'sales-slicer2', type: 'slicer', title: 'Region', layout: { x: 4, y: 3, w: 4, h: 5 }, props: { dimension: 'Region' } },
    { id: 'sales-card1', type: 'card', title: 'Total Revenue', layout: { x: 8, y: 3, w: 10, h: 5 }, props: { metric: 'revenue', operation: 'sum', label: 'Sum of Revenue', colorIndex: 0 } },
    { id: 'sales-card2', type: 'card', title: 'Total Profit', layout: { x: 18, y: 3, w: 10, h: 5 }, props: { metric: 'profit', operation: 'sum', label: 'Sum of Profit', colorIndex: 1 } },
    { id: 'sales-card3', type: 'card', title: 'Avg Order Value', layout: { x: 28, y: 3, w: 10, h: 5 }, props: { metric: 'revenue', operation: 'avg', label: 'Avg Order', colorIndex: 2 } },
    { id: 'sales-card4', type: 'card', title: 'Total Qty', layout: { x: 38, y: 3, w: 10, h: 5 }, props: { metric: 'quantity', operation: 'sum', label: 'Total Quantity', colorIndex: 3 } },
    // Row 8: Category slicer bar
    { id: 'sales-slicer3', type: 'slicer', title: 'Category', layout: { x: 0, y: 8, w: 48, h: 3 }, props: { dimension: 'Category' } },
    // Row 11-22: Hero bar (28w) + stacked support charts (20w)
    { id: 'sales-bar1', type: 'bar', title: 'Top 5 Region by Revenue', layout: { x: 0, y: 11, w: 28, h: 12 }, props: { dimension: 'Region', metric: 'revenue', topN: 5 } },
    { id: 'sales-donut1', type: 'donut', title: 'Profit by Category', layout: { x: 28, y: 11, w: 20, h: 6 }, props: { dimension: 'Category', metric: 'profit' } },
    { id: 'sales-waterfall1', type: 'waterfall', title: 'Profit Waterfall', layout: { x: 28, y: 17, w: 20, h: 6 }, props: { dimension: 'Region', metric: 'profit' } },
    // Row 23-30: Line + Treemap
    { id: 'sales-line1', type: 'line', title: 'Revenue Trend', layout: { x: 0, y: 23, w: 24, h: 8 }, props: { metric: 'revenue', comparison: 'both' } },
    { id: 'sales-treemap1', type: 'treemap', title: 'Revenue Treemap', layout: { x: 24, y: 23, w: 24, h: 8 }, props: { dimension: 'Category', metric: 'revenue' } },
    // Row 31-38: Detail table
    { id: 'sales-table1', type: 'table', title: 'Sales Details', layout: { x: 0, y: 31, w: 48, h: 8 }, props: { maxRows: 50 } },
  ]
};

// ─── Email Summary (Email Marketing Analytics) ──────────────────────────────
// Rebuilt with working PBI components - replaces KPI visuals with card visuals
// Layout: Banner header, 5 cards + 1 slicer, combo chart, bar chart, funnel, scatter, matrix
export const EmailTemplate: Template = {
  name: 'Email',
  scenario: 'Retail',
  items: [
    // ═══ Row 0-2: Banner Header ═══
    { id: 'email-banner', type: 'banner', title: 'Email Marketing Analytics', layout: { x: 0, y: 0, w: 48, h: 3 }, props: { title: 'Email Marketing Analytics', subtitle: 'Campaign Performance Dashboard', variant: 'subtle', accentColor: '#0078D4' } },

    // ═══ Row 3-6: KPI Row (using card visuals instead of kpi) ═══
    { id: 'email-slicer-kpi', type: 'slicer', title: 'Email Type', layout: { x: 0, y: 3, w: 8, h: 4 }, props: { dimension: 'Category' } },
    { id: 'email-card1', type: 'card', title: 'Emails Delivered', layout: { x: 8, y: 3, w: 8, h: 4 }, props: { metric: 'revenue', operation: 'sum', label: 'Delivered', colorIndex: 0 } },
    { id: 'email-card2', type: 'card', title: 'Conversions', layout: { x: 16, y: 3, w: 8, h: 4 }, props: { metric: 'profit', operation: 'sum', label: 'Conversions', colorIndex: 1 } },
    { id: 'email-card3', type: 'card', title: 'Click-to-Open Rate', layout: { x: 24, y: 3, w: 8, h: 4 }, props: { metric: 'discount', operation: 'avg', label: 'CTOR', colorIndex: 2 } },
    { id: 'email-card4', type: 'card', title: 'Total Clicks', layout: { x: 32, y: 3, w: 8, h: 4 }, props: { metric: 'quantity', operation: 'sum', label: 'Clicks', colorIndex: 3 } },
    { id: 'email-card5', type: 'card', title: 'Subscribers', layout: { x: 40, y: 3, w: 8, h: 4 }, props: { metric: 'quantity', operation: 'count', label: 'Subscribers', colorIndex: 4 } },

    // ═══ Row 7-16: Main Chart Area ═══
    { id: 'email-combo1', type: 'combo', title: 'Emails Sent & Conversion Rate', layout: { x: 0, y: 7, w: 31, h: 10 }, props: { dimension: 'Date', barMetric: 'revenue', lineMetric: 'profit' } },
    { id: 'email-bar1', type: 'bar', title: 'Performance by Category', layout: { x: 31, y: 7, w: 17, h: 10 }, props: { dimension: 'Category', metric: 'revenue' } },

    // ═══ Row 17-26: Bottom Section ═══
    { id: 'email-funnel1', type: 'funnel', title: 'Email to Conversion Pipeline', layout: { x: 0, y: 17, w: 13, h: 10 }, props: { dimension: 'Category', metric: 'revenue' } },
    { id: 'email-scatter1', type: 'scatter', title: 'Opens vs Conversion Rate', layout: { x: 13, y: 17, w: 19, h: 10 }, props: { xMetric: 'quantity', yMetric: 'profit', sizeMetric: 'revenue', dimension: 'Category' } },
    { id: 'email-matrix1', type: 'matrix', title: 'CTOR by Region & Store', layout: { x: 32, y: 17, w: 16, h: 10 }, props: { rows: 'Region', columns: 'Store', values: 'Revenue' } },
  ],
};

// ─── Marketing (SaaS) ────────────────────────────────────────────────────────
// Dashboard with slicers on left + KPIs
export const SaasMarketingTemplate: Template = {
  name: 'Marketing',
  scenario: 'SaaS',
  theme: 'Ocean',
  items: [
    // Row 0: Slicers (8w) + 4 KPI cards (40w) = 48
    { id: 'mkt-slicer1', type: 'slicer', title: 'Region', layout: { x: 0, y: 0, w: 4, h: 5 }, props: { dimension: 'region' } },
    { id: 'mkt-slicer2', type: 'slicer', title: 'Tier', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { dimension: 'tier' } },
    { id: 'mkt-card1', type: 'card', title: 'Total MRR', layout: { x: 8, y: 0, w: 10, h: 5 }, props: { metric: 'mrr', operation: 'sum', label: 'Total MRR', colorIndex: 0 } },
    { id: 'mkt-card2', type: 'card', title: 'Avg LTV', layout: { x: 18, y: 0, w: 10, h: 5 }, props: { metric: 'ltv', operation: 'avg', label: 'Avg LTV', colorIndex: 1 } },
    { id: 'mkt-card3', type: 'card', title: 'Churn Risk', layout: { x: 28, y: 0, w: 10, h: 5 }, props: { metric: 'churn', operation: 'sum', label: 'Total Churn', colorIndex: 4 } },
    { id: 'mkt-card4', type: 'card', title: 'Avg MRR', layout: { x: 38, y: 0, w: 10, h: 5 }, props: { metric: 'mrr', operation: 'avg', label: 'Avg MRR', colorIndex: 3 } },
    // Row 5-16: Hero pair (bar + funnel)
    { id: 'mkt-bar1', type: 'bar', title: 'MRR by Tier', layout: { x: 0, y: 5, w: 28, h: 12 }, props: { dimension: 'tier', metric: 'mrr' } },
    { id: 'mkt-funnel1', type: 'funnel', title: 'Conversion Funnel', layout: { x: 28, y: 5, w: 20, h: 12 }, props: { dimension: 'tier', metric: 'mrr' } },
    // Row 17-24: Analysis trio
    { id: 'mkt-line1', type: 'line', title: 'MRR Trend', layout: { x: 0, y: 17, w: 16, h: 8 }, props: { metric: 'mrr', comparison: 'both' } },
    { id: 'mkt-donut1', type: 'donut', title: 'Churn by Tier', layout: { x: 16, y: 17, w: 16, h: 8 }, props: { dimension: 'tier', metric: 'churn' } },
    { id: 'mkt-scatter1', type: 'scatter', title: 'MRR vs LTV', layout: { x: 32, y: 17, w: 16, h: 8 }, props: { xMetric: 'mrr', yMetric: 'ltv', dimension: 'tier' } },
    // Row 25-32: Detail table
    { id: 'mkt-table1', type: 'table', title: 'Customer List', layout: { x: 0, y: 25, w: 48, h: 8 }, props: { maxRows: 50 } },
  ]
};

// ─── HR Attrition ────────────────────────────────────────────────────────────
// HR dashboard with slicers on left + KPIs
export const HrTemplate: Template = {
  name: 'HR Attrition',
  scenario: 'HR',
  theme: 'Warm Neutral',
  items: [
    // Row 0: Slicers (8w) + 4 KPI cards (40w) = 48
    { id: 'hr-slicer1', type: 'slicer', title: 'Department', layout: { x: 0, y: 0, w: 4, h: 5 }, props: { dimension: 'department' } },
    { id: 'hr-slicer2', type: 'slicer', title: 'Role', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { dimension: 'role' } },
    { id: 'hr-card1', type: 'card', title: 'Total Employees', layout: { x: 8, y: 0, w: 10, h: 5 }, props: { metric: 'salary', operation: 'count', label: 'Headcount', colorIndex: 0 } },
    { id: 'hr-card2', type: 'card', title: 'Avg Salary', layout: { x: 18, y: 0, w: 10, h: 5 }, props: { metric: 'salary', operation: 'avg', label: 'Avg Salary', colorIndex: 1 } },
    { id: 'hr-card3', type: 'card', title: 'Attrition Rate', layout: { x: 28, y: 0, w: 10, h: 5 }, props: { metric: 'attrition', operation: 'avg', label: 'Attrition %', colorIndex: 4 } },
    { id: 'hr-card4', type: 'card', title: 'Avg Tenure', layout: { x: 38, y: 0, w: 10, h: 5 }, props: { metric: 'tenure', operation: 'avg', label: 'Avg Tenure (yrs)', colorIndex: 2 } },
    // Row 5-16: Hero bar + gauge + pie stacked
    { id: 'hr-bar1', type: 'bar', title: 'Headcount by Dept', layout: { x: 0, y: 5, w: 28, h: 12 }, props: { dimension: 'department', metric: 'salary' } },
    { id: 'hr-gauge1', type: 'gauge', title: 'Attrition vs Target', layout: { x: 28, y: 5, w: 20, h: 6 }, props: { metric: 'attrition', target: 0.1 } },
    { id: 'hr-pie1', type: 'pie', title: 'Ratings Distribution', layout: { x: 28, y: 11, w: 20, h: 6 }, props: { dimension: 'rating', metric: 'salary' } },
    // Row 17-24: Analysis trio
    { id: 'hr-stackedCol1', type: 'stackedColumn', title: 'Attrition by Dept', layout: { x: 0, y: 17, w: 16, h: 8 }, props: { dimension: 'department', metric: 'attrition', series: 'role' } },
    { id: 'hr-scatter1', type: 'scatter', title: 'Salary vs Tenure', layout: { x: 16, y: 17, w: 16, h: 8 }, props: { xMetric: 'salary', yMetric: 'tenure', dimension: 'department' } },
    { id: 'hr-waterfall1', type: 'waterfall', title: 'Salary by Dept', layout: { x: 32, y: 17, w: 16, h: 8 }, props: { dimension: 'department', metric: 'salary' } },
    // Row 25-32: Detail table
    { id: 'hr-table1', type: 'table', title: 'Employee Directory', layout: { x: 0, y: 25, w: 48, h: 8 }, props: { maxRows: 50 } },
  ]
};

// ─── Logistics Supply Chain ──────────────────────────────────────────────────
// Operations dashboard with slicers on left + KPIs
export const LogisticsTemplate: Template = {
  name: 'Logistics Supply Chain',
  scenario: 'Logistics',
  theme: 'Industrial',
  items: [
    // Row 0: Slicers (8w) + 4 KPI cards (40w) = 48
    { id: 'log-slicer1', type: 'slicer', title: 'Status', layout: { x: 0, y: 0, w: 4, h: 5 }, props: { dimension: 'status' } },
    { id: 'log-slicer2', type: 'slicer', title: 'Carrier', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { dimension: 'carrier' } },
    { id: 'log-card1', type: 'card', title: 'Total Shipments', layout: { x: 8, y: 0, w: 10, h: 5 }, props: { metric: 'cost', operation: 'count', label: 'Count', colorIndex: 0 } },
    { id: 'log-card2', type: 'card', title: 'Total Cost', layout: { x: 18, y: 0, w: 10, h: 5 }, props: { metric: 'cost', operation: 'sum', label: 'Total Cost', colorIndex: 1 } },
    { id: 'log-card3', type: 'card', title: 'On Time %', layout: { x: 28, y: 0, w: 10, h: 5 }, props: { metric: 'onTime', operation: 'avg', label: 'On Time Rate', colorIndex: 2 } },
    { id: 'log-card4', type: 'card', title: 'Avg Weight', layout: { x: 38, y: 0, w: 10, h: 5 }, props: { metric: 'weight', operation: 'avg', label: 'Avg Weight', colorIndex: 3 } },
    // Row 5: Origin slicer bar
    { id: 'log-slicer3', type: 'slicer', title: 'Origin', layout: { x: 0, y: 5, w: 48, h: 3 }, props: { dimension: 'origin' } },
    // Row 8-19: Hero pair (bar + pie)
    { id: 'log-bar1', type: 'bar', title: 'Cost by Carrier', layout: { x: 0, y: 8, w: 28, h: 12 }, props: { dimension: 'carrier', metric: 'cost' } },
    { id: 'log-pie1', type: 'pie', title: 'Status Breakdown', layout: { x: 28, y: 8, w: 20, h: 12 }, props: { dimension: 'status', metric: 'weight' } },
    // Row 20-27: Analysis trio
    { id: 'log-stackedBar1', type: 'stackedBar', title: 'Cost by Origin', layout: { x: 0, y: 20, w: 16, h: 8 }, props: { dimension: 'origin', metric: 'cost', series: 'carrier' } },
    { id: 'log-treemap1', type: 'treemap', title: 'Weight by Dest', layout: { x: 16, y: 20, w: 16, h: 8 }, props: { dimension: 'destination', metric: 'weight' } },
    { id: 'log-waterfall1', type: 'waterfall', title: 'Cost Bridge', layout: { x: 32, y: 20, w: 16, h: 8 }, props: { dimension: 'status', metric: 'cost' } },
    // Row 28-35: Detail matrix
    { id: 'log-matrix1', type: 'matrix', title: 'Origin vs Destination', layout: { x: 0, y: 28, w: 48, h: 8 }, props: { rows: 'origin', columns: 'destination', values: 'cost' } },
  ]
};

// ─── Finance ─────────────────────────────────────────────────────────────────
// Finance dashboard with slicer row below KPIs (formal layout)
export const FinanceTemplate: Template = {
  name: 'Finance',
  scenario: 'Finance',
  theme: 'Boardroom',
  items: [
    // Row 0: Slicers (8w) + 4 KPI cards (40w) = 48
    { id: 'fin-slicer1', type: 'slicer', title: 'Account', layout: { x: 0, y: 0, w: 4, h: 5 }, props: { dimension: 'account' } },
    { id: 'fin-slicer2', type: 'slicer', title: 'Region', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { dimension: 'region' } },
    { id: 'fin-card1', type: 'card', title: 'Total Amount', layout: { x: 8, y: 0, w: 10, h: 5 }, props: { metric: 'amount', operation: 'sum', label: 'Total Amount', colorIndex: 0 } },
    { id: 'fin-card2', type: 'card', title: 'Total Variance', layout: { x: 18, y: 0, w: 10, h: 5 }, props: { metric: 'variance', operation: 'sum', label: 'Total Variance', colorIndex: 1 } },
    { id: 'fin-card3', type: 'card', title: 'Avg Amount', layout: { x: 28, y: 0, w: 10, h: 5 }, props: { metric: 'amount', operation: 'avg', label: 'Avg Amount', colorIndex: 2 } },
    { id: 'fin-card4', type: 'card', title: 'Avg Variance', layout: { x: 38, y: 0, w: 10, h: 5 }, props: { metric: 'variance', operation: 'avg', label: 'Avg Variance', colorIndex: 3 } },
    // Row 5: Scenario slicer bar
    { id: 'fin-slicer3', type: 'slicer', title: 'Scenario', layout: { x: 0, y: 5, w: 48, h: 3 }, props: { dimension: 'scenario' } },
    // Row 8-19: Hero matrix + bar + stacked
    { id: 'fin-matrix1', type: 'matrix', title: 'P&L Matrix', layout: { x: 0, y: 8, w: 28, h: 12 }, props: { rows: 'account', columns: 'region', values: 'amount' } },
    { id: 'fin-bar1', type: 'bar', title: 'Amount by BU', layout: { x: 28, y: 8, w: 20, h: 6 }, props: { dimension: 'businessUnit', metric: 'amount' } },
    { id: 'fin-stackedCol1', type: 'stackedColumn', title: 'Amount by Scenario', layout: { x: 28, y: 14, w: 20, h: 6 }, props: { dimension: 'scenario', metric: 'amount', series: 'businessUnit' } },
    // Row 20-27: Analysis trio
    { id: 'fin-line1', type: 'line', title: 'Amount Trend', layout: { x: 0, y: 20, w: 16, h: 8 }, props: { metric: 'amount', comparison: 'both' } },
    { id: 'fin-waterfall1', type: 'waterfall', title: 'Variance Bridge', layout: { x: 16, y: 20, w: 16, h: 8 }, props: { dimension: 'businessUnit', metric: 'variance' } },
    { id: 'fin-donut1', type: 'donut', title: 'Amount by Account', layout: { x: 32, y: 20, w: 16, h: 8 }, props: { dimension: 'account', metric: 'amount' } },
    // Row 28-35: Detail table
    { id: 'fin-table1', type: 'table', title: 'Finance Records', layout: { x: 0, y: 28, w: 48, h: 8 }, props: { maxRows: 50 } },
  ]
};

// ─── Zebra (IBCS) ────────────────────────────────────────────────────────────
// IBCS-style formal finance layout with tall matrix
export const ZebraTemplate: Template = {
  name: 'Zebra (IBCS)',
  scenario: 'Finance',
  theme: 'Zebra (IBCS)',
  items: [
    // Row 0: Slicers (8w) + 4 KPI cards (40w) = 48
    { id: 'ibcs-slicer1', type: 'slicer', title: 'Account', layout: { x: 0, y: 0, w: 4, h: 5 }, props: { dimension: 'Account' } },
    { id: 'ibcs-slicer2', type: 'slicer', title: 'Region', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { dimension: 'Region' } },
    { id: 'ibcs-card1', type: 'card', title: 'Total Amount', layout: { x: 8, y: 0, w: 10, h: 5 }, props: { metric: 'Amount', operation: 'sum', label: 'Total Amount', showVariance: true } },
    { id: 'ibcs-card2', type: 'card', title: 'Total Variance', layout: { x: 18, y: 0, w: 10, h: 5 }, props: { metric: 'Variance', operation: 'sum', label: 'Total Variance', showVariance: true } },
    { id: 'ibcs-card3', type: 'card', title: 'Avg Amount', layout: { x: 28, y: 0, w: 10, h: 5 }, props: { metric: 'Amount', operation: 'avg', label: 'Avg Amount', showVariance: true } },
    { id: 'ibcs-card4', type: 'card', title: 'Avg Variance', layout: { x: 38, y: 0, w: 10, h: 5 }, props: { metric: 'Variance', operation: 'avg', label: 'Avg Variance', showVariance: true } },
    // Row 5: Scenario slicer bar
    { id: 'ibcs-slicer3', type: 'slicer', title: 'Scenario', layout: { x: 0, y: 5, w: 48, h: 3 }, props: { dimension: 'Scenario' } },
    // Row 8-27: Tall matrix + 3 stacked charts
    { id: 'ibcs-matrix1', type: 'matrix', title: 'Amount by Account and Scenario', layout: { x: 0, y: 8, w: 28, h: 20 }, props: { rows: 'Account', columns: 'Scenario', values: 'Amount' } },
    { id: 'ibcs-line1', type: 'line', title: 'Amount AC vs PL', layout: { x: 28, y: 8, w: 20, h: 7 }, props: { metric: 'Amount', comparison: 'pl', timeGrain: 'month' } },
    { id: 'ibcs-waterfall1', type: 'waterfall', title: 'Variance Bridge', layout: { x: 28, y: 15, w: 20, h: 7 }, props: { dimension: 'Region', metric: 'Variance' } },
    { id: 'ibcs-stackedCol1', type: 'stackedColumn', title: 'Amount by Scenario', layout: { x: 28, y: 22, w: 20, h: 6 }, props: { dimension: 'Scenario', metric: 'Amount', series: 'BusinessUnit' } },
    // Row 28-35: Detail table
    { id: 'ibcs-table1', type: 'table', title: 'Finance Records', layout: { x: 0, y: 28, w: 48, h: 8 }, props: { maxRows: 50 } },
  ]
};

// ─── Social Media Sentiment ──────────────────────────────────────────────────
// Grid-style dashboard showing many chart types
export const SocialTemplate: Template = {
  name: 'Social Media Sentiment',
  scenario: 'Social',
  theme: 'Social',
  items: [
    // Row 0-5: KPIs + slicer (varied widths)
    { id: 'soc-card1', type: 'card', title: 'Net Sentiment', layout: { x: 0, y: 0, w: 12, h: 6 }, props: { metric: 'sentimentScore', operation: 'avg', label: 'Avg Sentiment', showVariance: true } },
    { id: 'soc-gauge1', type: 'gauge', title: 'Engagements vs Target', layout: { x: 12, y: 0, w: 12, h: 6 }, props: { metric: 'engagements', target: 3000000 } },
    { id: 'soc-slicer1', type: 'slicer', title: 'Platform', layout: { x: 24, y: 0, w: 12, h: 6 }, props: { dimension: 'platform' } },
    { id: 'soc-multi1', type: 'multiRowCard', title: 'Social KPIs', layout: { x: 36, y: 0, w: 12, h: 6 }, props: { fields: ['engagements', 'mentions', 'sentimentScore'] } },

    // Row 6-11: Trend row
    { id: 'soc-line1', type: 'line', title: 'Engagement Trend', layout: { x: 0, y: 6, w: 12, h: 6 }, props: { metric: 'engagements' } },
    { id: 'soc-area1', type: 'area', title: 'Mentions Trend', layout: { x: 12, y: 6, w: 12, h: 6 }, props: { metric: 'mentions' } },
    { id: 'soc-stackedBar1', type: 'stackedBar', title: 'Sentiment Breakdown', layout: { x: 24, y: 6, w: 12, h: 6 }, props: { dimension: 'sentiment', metric: 'mentions', series: 'platform' } },
    { id: 'soc-stackedCol1', type: 'stackedColumn', title: 'Engagements AC vs PL', layout: { x: 36, y: 6, w: 12, h: 6 }, props: { dimension: 'platform', metric: 'engagements', series: 'sentiment' } },

    // Row 12-17: Comparisons
    { id: 'soc-bar1', type: 'bar', title: 'Engagements by Platform', layout: { x: 0, y: 12, w: 12, h: 6 }, props: { dimension: 'platform', metric: 'engagements' } },
    { id: 'soc-column1', type: 'column', title: 'Mentions by Location', layout: { x: 12, y: 12, w: 12, h: 6 }, props: { dimension: 'location', metric: 'mentions' } },
    { id: 'soc-pie1', type: 'pie', title: 'Mentions Share', layout: { x: 24, y: 12, w: 12, h: 6 }, props: { dimension: 'platform', metric: 'mentions' } },
    { id: 'soc-donut1', type: 'donut', title: 'Engagements by Sentiment', layout: { x: 36, y: 12, w: 12, h: 6 }, props: { dimension: 'sentiment', metric: 'engagements' } },

    // Row 18-23: Distribution
    { id: 'soc-funnel1', type: 'funnel', title: 'Engagement Funnel', layout: { x: 0, y: 18, w: 12, h: 6 }, props: { dimension: 'platform', metric: 'engagements' } },
    { id: 'soc-treemap1', type: 'treemap', title: 'Mentions Treemap', layout: { x: 12, y: 18, w: 12, h: 6 }, props: { dimension: 'platform', metric: 'mentions' } },
    { id: 'soc-scatter1', type: 'scatter', title: 'Engagement vs Mentions', layout: { x: 24, y: 18, w: 12, h: 6 }, props: { xMetric: 'engagements', yMetric: 'mentions', sizeMetric: 'sentimentScore', dimension: 'platform' } },
    { id: 'soc-waterfall1', type: 'waterfall', title: 'Engagements Bridge', layout: { x: 36, y: 18, w: 12, h: 6 }, props: { dimension: 'platform', metric: 'engagements' } },

    // Row 24-29: Detail band
    { id: 'soc-table1', type: 'table', title: 'Recent Posts', layout: { x: 0, y: 24, w: 24, h: 6 }, props: { maxRows: 8, columns: ['date', 'platform', 'sentiment', 'engagements', 'mentions'] } },
    { id: 'soc-matrix1', type: 'matrix', title: 'Platform x Sentiment', layout: { x: 24, y: 24, w: 24, h: 6 }, props: { rows: 'platform', columns: 'sentiment', values: 'engagements' } },

    // Row 30-35: Slicer + KPI summary band
    { id: 'soc-slicer2', type: 'slicer', title: 'Sentiment', layout: { x: 0, y: 30, w: 12, h: 6 }, props: { dimension: 'sentiment' } },
    { id: 'soc-slicer3', type: 'slicer', title: 'Location', layout: { x: 12, y: 30, w: 12, h: 6 }, props: { dimension: 'location' } },
    { id: 'soc-card2', type: 'card', title: 'Total Engagements', layout: { x: 24, y: 30, w: 12, h: 6 }, props: { metric: 'engagements', operation: 'sum', label: 'Total Engagements', colorIndex: 0 } },
    { id: 'soc-card3', type: 'card', title: 'Total Mentions', layout: { x: 36, y: 30, w: 12, h: 6 }, props: { metric: 'mentions', operation: 'sum', label: 'Total Mentions', colorIndex: 1 } },
  ]
};

// ─── PBI UI Kit Test Template ─────────────────────────────────────────────────
// All 25 PBI UI Kit 2.0 chart types in menu order - for testing which render correctly
export const PbiUiKitTestTemplate: Template = {
  name: 'PBI UI Kit Test (All 25 Charts)',
  scenario: 'Retail',
  items: [
    // Row 0: Area Charts (CSS #1-2) + Bar Charts (CSS #3-4)
    { id: 'test-area', type: 'area', title: '1. Area Chart', layout: { x: 0, y: 0, w: 12, h: 7 }, props: { metric: 'revenue' } },
    { id: 'test-stackedArea', type: 'stackedArea', title: '2. Stacked Area', layout: { x: 12, y: 0, w: 12, h: 7 }, props: { metric: 'revenue' } },
    { id: 'test-bar', type: 'bar', title: '3. Bar Chart', layout: { x: 24, y: 0, w: 12, h: 7 }, props: { dimension: 'Region', metric: 'revenue' } },
    { id: 'test-groupedBar', type: 'groupedBar', title: '4. Grouped Bar', layout: { x: 36, y: 0, w: 12, h: 7 }, props: { dimension: 'Region', metric: 'revenue' } },

    // Row 1: Bar Charts continued (CSS #5-6) + Comparison (CSS #7, 12)
    { id: 'test-lollipop', type: 'lollipop', title: '5. Lollipop', layout: { x: 0, y: 7, w: 12, h: 7 }, props: { dimension: 'Region', metric: 'revenue' } },
    { id: 'test-stackedBar', type: 'stackedBar', title: '6. Stacked Bar', layout: { x: 12, y: 7, w: 12, h: 7 }, props: { dimension: 'Region', metric: 'revenue', series: 'Category' } },
    { id: 'test-barbell', type: 'barbell', title: '7. Barbell Chart', layout: { x: 24, y: 7, w: 12, h: 7 }, props: { dimension: 'Region', metric: 'revenue', metric2: 'profit' } },
    { id: 'test-diverging', type: 'diverging', title: '12. Diverging Chart', layout: { x: 36, y: 7, w: 12, h: 7 }, props: { dimension: 'Region', metric: 'revenue', metric2: 'profit' } },

    // Row 2: Comparison (CSS #26) + KPI (CSS #9)
    { id: 'test-slope', type: 'slope', title: '26. Slope Chart', layout: { x: 0, y: 14, w: 12, h: 7 }, props: { metric: 'revenue' } },
    { id: 'test-bullet', type: 'bullet', title: '9. Bullet Chart', layout: { x: 12, y: 14, w: 12, h: 7 }, props: { metric: 'revenue', target: 50000 } },

    // Row 3: KPI & Gauge (CSS #10, 15) + Combination (CSS #11) + Specialized (CSS #13)
    { id: 'test-card', type: 'card', title: '10. Card/KPI', layout: { x: 0, y: 21, w: 12, h: 7 }, props: { metric: 'revenue', operation: 'sum', label: 'Total Revenue' } },
    { id: 'test-gauge', type: 'gauge', title: '15. Gauge Chart', layout: { x: 12, y: 21, w: 12, h: 7 }, props: { metric: 'revenue', target: 100000 } },
    { id: 'test-combo', type: 'combo', title: '11. Combo Chart', layout: { x: 24, y: 21, w: 12, h: 7 }, props: { dimension: 'Date', barMetric: 'revenue', lineMetric: 'profit' } },

    // Row 4: Specialized (CSS #24) + Line Charts (CSS #17-18)
    { id: 'test-ribbon', type: 'ribbon', title: '24. Ribbon Chart', layout: { x: 0, y: 28, w: 12, h: 7 }, props: { dimension: 'Region', metric: 'revenue' } },
    { id: 'test-line', type: 'line', title: '17. Line Chart', layout: { x: 24, y: 28, w: 12, h: 7 }, props: { metric: 'revenue' } },
    { id: 'test-lineForecast', type: 'lineForecast', title: '18. Line Forecast', layout: { x: 36, y: 28, w: 12, h: 7 }, props: { metric: 'revenue' } },

    // Row 5: Line Charts (CSS #19) + Maps (CSS #20-21) + Pie (CSS #22)
    { id: 'test-lineStepped', type: 'lineStepped', title: '19. Stepped Line', layout: { x: 0, y: 35, w: 12, h: 7 }, props: { metric: 'revenue' } },
    { id: 'test-mapBubble', type: 'mapBubble', title: '20. Bubble Map', layout: { x: 12, y: 35, w: 12, h: 7 }, props: { geoDimension: 'Region', metric: 'revenue' } },
    { id: 'test-mapChoropleth', type: 'mapChoropleth', title: '21. Choropleth Map', layout: { x: 24, y: 35, w: 12, h: 7 }, props: { geoDimension: 'Region', metric: 'revenue' } },
    { id: 'test-pie', type: 'pie', title: '22. Pie Chart', layout: { x: 36, y: 35, w: 12, h: 7 }, props: { dimension: 'Category', metric: 'revenue' } },

    // Row 6: Pie (CSS #23) + Scatter (CSS #25) + Table (CSS #27) + Treemap (CSS #28)
    { id: 'test-donut', type: 'donut', title: '23. Donut Chart', layout: { x: 0, y: 42, w: 12, h: 7 }, props: { dimension: 'Category', metric: 'revenue' } },
    { id: 'test-scatter', type: 'scatter', title: '25. Scatter Plot', layout: { x: 12, y: 42, w: 12, h: 7 }, props: { xMetric: 'revenue', yMetric: 'profit', dimension: 'Category' } },
    { id: 'test-table', type: 'table', title: '27. Table', layout: { x: 24, y: 42, w: 12, h: 7 }, props: { maxRows: 10 } },
    { id: 'test-treemap', type: 'treemap', title: '28. Treemap', layout: { x: 36, y: 42, w: 12, h: 7 }, props: { dimension: 'Category', metric: 'revenue' } },

    // Row 7: Waterfall (CSS #29)
    { id: 'test-waterfall', type: 'waterfall', title: '29. Waterfall', layout: { x: 0, y: 49, w: 12, h: 7 }, props: { dimension: 'Region', metric: 'profit' } },
  ]
};

// ─── Retail Analytics (PBI UI Kit Only) ─────────────────────────────────────
// Dashboard using only PBI UI Kit components to ensure proper rendering in Power BI
export const RetailAnalyticsPbiTemplate: Template = {
  name: 'Retail Analytics (PBI Kit)',
  scenario: 'Retail',
  items: [
    // Row 0-4: KPI Cards row (5 cards across top)
    { id: 'ra-card1', type: 'card', title: 'Total Revenue', layout: { x: 0, y: 0, w: 10, h: 5 }, props: { metric: 'revenue', operation: 'sum', label: 'Revenue', colorIndex: 0 } },
    { id: 'ra-card2', type: 'card', title: 'Total Profit', layout: { x: 10, y: 0, w: 10, h: 5 }, props: { metric: 'profit', operation: 'sum', label: 'Profit', colorIndex: 1 } },
    { id: 'ra-card3', type: 'card', title: 'Units Sold', layout: { x: 20, y: 0, w: 9, h: 5 }, props: { metric: 'quantity', operation: 'sum', label: 'Quantity', colorIndex: 2 } },
    { id: 'ra-card4', type: 'card', title: 'Avg Order', layout: { x: 29, y: 0, w: 9, h: 5 }, props: { metric: 'revenue', operation: 'avg', label: 'Avg Order', colorIndex: 3 } },
    { id: 'ra-card5', type: 'card', title: 'Transactions', layout: { x: 38, y: 0, w: 10, h: 5 }, props: { metric: 'revenue', operation: 'count', label: 'Count', colorIndex: 4 } },

    // Row 5-7: Slicer bar for filtering
    { id: 'ra-slicer1', type: 'slicer', title: 'Store', layout: { x: 0, y: 5, w: 12, h: 3 }, props: { dimension: 'Store' } },
    { id: 'ra-slicer2', type: 'slicer', title: 'Region', layout: { x: 12, y: 5, w: 12, h: 3 }, props: { dimension: 'Region' } },
    { id: 'ra-slicer3', type: 'slicer', title: 'Category', layout: { x: 24, y: 5, w: 12, h: 3 }, props: { dimension: 'Category' } },
    { id: 'ra-slicer4', type: 'slicer', title: 'Product', layout: { x: 36, y: 5, w: 12, h: 3 }, props: { dimension: 'Product' } },

    // Row 8-16: Main chart area - Bar + Donut + Gauge
    { id: 'ra-bar1', type: 'bar', title: 'Revenue by Region', layout: { x: 0, y: 8, w: 20, h: 9 }, props: { dimension: 'Region', metric: 'revenue', topN: 5 } },
    { id: 'ra-donut1', type: 'donut', title: 'Revenue by Category', layout: { x: 20, y: 8, w: 14, h: 9 }, props: { dimension: 'Category', metric: 'revenue' } },
    { id: 'ra-gauge1', type: 'gauge', title: 'Revenue vs Target', layout: { x: 34, y: 8, w: 14, h: 9 }, props: { metric: 'revenue', target: 500000 } },

    // Row 17-25: Trend + Comparison charts
    { id: 'ra-line1', type: 'line', title: 'Revenue Trend', layout: { x: 0, y: 17, w: 16, h: 9 }, props: { metric: 'revenue' } },
    { id: 'ra-area1', type: 'area', title: 'Profit Trend', layout: { x: 16, y: 17, w: 16, h: 9 }, props: { metric: 'profit' } },
    { id: 'ra-stackedBar1', type: 'stackedBar', title: 'Revenue by Store', layout: { x: 32, y: 17, w: 16, h: 9 }, props: { dimension: 'Store', metric: 'revenue', series: 'Category' } },

    // Row 26-34: Distribution + Detail
    { id: 'ra-treemap1', type: 'treemap', title: 'Revenue Treemap', layout: { x: 0, y: 26, w: 16, h: 9 }, props: { dimension: 'Category', metric: 'revenue' } },
    { id: 'ra-waterfall1', type: 'waterfall', title: 'Profit Bridge', layout: { x: 16, y: 26, w: 16, h: 9 }, props: { dimension: 'Region', metric: 'profit' } },
    { id: 'ra-scatter1', type: 'scatter', title: 'Revenue vs Profit', layout: { x: 32, y: 26, w: 16, h: 9 }, props: { xMetric: 'revenue', yMetric: 'profit', dimension: 'Category' } },

    // Row 35-42: Table for details
    { id: 'ra-table1', type: 'table', title: 'Sales Details', layout: { x: 0, y: 35, w: 48, h: 8 }, props: { maxRows: 50 } },
  ]
};

// ─── Executive Summary ────────────────────────────────────────────────────────
// Professional executive template with banner header, KPI cards, trend line, comparison bar, text callouts
export const ExecutiveSummaryTemplate: Template = {
  name: 'Executive Summary',
  scenario: 'Retail',
  items: [
    // Row 0-3: Banner header with company branding
    { id: 'exec-banner', type: 'banner', title: 'Executive Summary', layout: { x: 0, y: 0, w: 48, h: 4 }, props: { title: 'Executive Summary', subtitle: 'Quarterly Business Review - Q4 2024', variant: 'gradient', accentColor: '#1A1A2E', titleFontSize: 28, showLogo: true } },

    // Row 4-8: KPI Cards row (4 cards across top)
    { id: 'exec-card1', type: 'card', title: 'Total Revenue', layout: { x: 0, y: 4, w: 12, h: 5 }, props: { metric: 'revenue', operation: 'sum', label: 'Revenue', colorIndex: 0 } },
    { id: 'exec-card2', type: 'card', title: 'Total Profit', layout: { x: 12, y: 4, w: 12, h: 5 }, props: { metric: 'profit', operation: 'sum', label: 'Profit', colorIndex: 1 } },
    { id: 'exec-card3', type: 'card', title: 'Profit Margin', layout: { x: 24, y: 4, w: 12, h: 5 }, props: { metric: 'profit', operation: 'avg', label: 'Margin %', colorIndex: 2 } },
    { id: 'exec-card4', type: 'card', title: 'Transactions', layout: { x: 36, y: 4, w: 12, h: 5 }, props: { metric: 'revenue', operation: 'count', label: 'Transactions', colorIndex: 3 } },

    // Row 9: Section header
    { id: 'exec-text1', type: 'textBox', title: 'Performance Trends', layout: { x: 0, y: 9, w: 48, h: 2 }, props: { text: 'Performance Trends', fontSize: 16, bold: true, fontColor: '#252423' } },

    // Row 11-20: Trend line chart (full width)
    { id: 'exec-line1', type: 'line', title: 'Revenue & Profit Trend', layout: { x: 0, y: 11, w: 48, h: 10 }, props: { metric: 'revenue', comparison: 'both' } },

    // Row 21: Section header
    { id: 'exec-text2', type: 'textBox', title: 'Regional Analysis', layout: { x: 0, y: 21, w: 48, h: 2 }, props: { text: 'Regional Analysis', fontSize: 16, bold: true, fontColor: '#252423' } },

    // Row 23-32: Comparison bar chart + Donut
    { id: 'exec-bar1', type: 'bar', title: 'Revenue by Region', layout: { x: 0, y: 23, w: 28, h: 10 }, props: { dimension: 'Region', metric: 'revenue' } },
    { id: 'exec-donut1', type: 'donut', title: 'Profit Distribution', layout: { x: 28, y: 23, w: 20, h: 10 }, props: { dimension: 'Category', metric: 'profit' } },

    // Row 33: Key Insights callout
    { id: 'exec-text3', type: 'textBox', title: 'Key Insights', layout: { x: 0, y: 33, w: 48, h: 3 }, props: { text: 'Key Insights: Revenue grew 15% YoY with strongest performance in Electronics. Profit margins improved across all regions.', fontSize: 14, fontColor: '#605E5C', backgroundColor: '#F5F5F5', padding: 12 } },
  ]
};

// ─── Operational Dashboard ────────────────────────────────────────────────────
// Operational template with slicers, matrix/table, combo chart, gauge, waterfall
export const OperationalDashboardTemplate: Template = {
  name: 'Operational Dashboard',
  scenario: 'Retail',
  items: [
    // Row 0-2: Banner header
    { id: 'ops-banner', type: 'banner', title: 'Operational Dashboard', layout: { x: 0, y: 0, w: 48, h: 3 }, props: { title: 'Operational Dashboard', subtitle: 'Real-time Operations Monitor', variant: 'thinLine', accentColor: '#2E7D32', showAccentBar: true } },

    // Row 3-5: Slicers for filtering
    { id: 'ops-slicer1', type: 'slicer', title: 'Store', layout: { x: 0, y: 3, w: 12, h: 3 }, props: { dimension: 'Store' } },
    { id: 'ops-slicer2', type: 'slicer', title: 'Region', layout: { x: 12, y: 3, w: 12, h: 3 }, props: { dimension: 'Region' } },
    { id: 'ops-slicer3', type: 'slicer', title: 'Category', layout: { x: 24, y: 3, w: 12, h: 3 }, props: { dimension: 'Category' } },
    { id: 'ops-slicer4', type: 'slicer', title: 'Product', layout: { x: 36, y: 3, w: 12, h: 3 }, props: { dimension: 'Product' } },

    // Row 6-10: KPI cards + Gauge
    { id: 'ops-card1', type: 'card', title: 'Revenue Today', layout: { x: 0, y: 6, w: 10, h: 5 }, props: { metric: 'revenue', operation: 'sum', label: 'Revenue', colorIndex: 0 } },
    { id: 'ops-card2', type: 'card', title: 'Orders', layout: { x: 10, y: 6, w: 10, h: 5 }, props: { metric: 'quantity', operation: 'sum', label: 'Units', colorIndex: 1 } },
    { id: 'ops-card3', type: 'card', title: 'Avg Order', layout: { x: 20, y: 6, w: 10, h: 5 }, props: { metric: 'revenue', operation: 'avg', label: 'AOV', colorIndex: 2 } },
    { id: 'ops-gauge1', type: 'gauge', title: 'Target Progress', layout: { x: 30, y: 6, w: 18, h: 5 }, props: { metric: 'revenue', target: 500000 } },

    // Row 11-20: Combo chart for trends + Matrix for details
    { id: 'ops-combo1', type: 'combo', title: 'Sales vs Profit Trend', layout: { x: 0, y: 11, w: 28, h: 10 }, props: { dimension: 'Date', barMetric: 'revenue', lineMetric: 'profit' } },
    { id: 'ops-matrix1', type: 'matrix', title: 'Regional Performance', layout: { x: 28, y: 11, w: 20, h: 10 }, props: { rows: 'Region', columns: 'Category', values: 'Revenue' } },

    // Row 21-30: Waterfall for variance + Table for details
    { id: 'ops-waterfall1', type: 'waterfall', title: 'Profit Variance Analysis', layout: { x: 0, y: 21, w: 24, h: 10 }, props: { dimension: 'Region', metric: 'profit' } },
    { id: 'ops-table1', type: 'table', title: 'Recent Transactions', layout: { x: 24, y: 21, w: 24, h: 10 }, props: { maxRows: 25 } },
  ]
};

export const Templates = [
  // Primary working templates
  RetailDashboardTemplate,
  RetailTemplate,
  EmailTemplate,
  SaasMarketingTemplate,
  HrTemplate,
  LogisticsTemplate,
  FinanceTemplate,
  SocialTemplate,
  ExecutiveSummaryTemplate,
  OperationalDashboardTemplate,
  // IBCS reference template (working)
  ZebraTemplate,
  // PBI Kit test template (for component testing)
  PbiUiKitTestTemplate,
  RetailAnalyticsPbiTemplate,
];
