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
// Executive layout: Slicers on left + KPIs, then hero chart with support visuals
export const RetailTemplate: Template = {
  name: 'Sales',
  scenario: 'Retail',
  theme: 'Sunset',
  items: [
    // Row 0: Slicers (8w) + 4 KPI cards (40w) = 48
    { id: 'sales-slicer1', type: 'slicer', title: 'Store', layout: { x: 0, y: 0, w: 4, h: 5 }, props: { dimension: 'Store' } },
    { id: 'sales-slicer2', type: 'slicer', title: 'Region', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { dimension: 'Region' } },
    { id: 'sales-card1', type: 'card', title: 'Total Revenue', layout: { x: 8, y: 0, w: 10, h: 5 }, props: { metric: 'revenue', operation: 'sum', label: 'Sum of Revenue', colorIndex: 0 } },
    { id: 'sales-card2', type: 'card', title: 'Total Profit', layout: { x: 18, y: 0, w: 10, h: 5 }, props: { metric: 'profit', operation: 'sum', label: 'Sum of Profit', colorIndex: 1 } },
    { id: 'sales-card3', type: 'card', title: 'Avg Order Value', layout: { x: 28, y: 0, w: 10, h: 5 }, props: { metric: 'revenue', operation: 'avg', label: 'Avg Order', colorIndex: 2 } },
    { id: 'sales-card4', type: 'card', title: 'Total Qty', layout: { x: 38, y: 0, w: 10, h: 5 }, props: { metric: 'quantity', operation: 'sum', label: 'Total Quantity', colorIndex: 3 } },
    // Row 5: Category slicer bar
    { id: 'sales-slicer3', type: 'slicer', title: 'Category', layout: { x: 0, y: 5, w: 48, h: 3 }, props: { dimension: 'Category' } },
    // Row 8-19: Hero bar (28w) + stacked support charts (20w)
    { id: 'sales-bar1', type: 'bar', title: 'Top 5 Region by Revenue', layout: { x: 0, y: 8, w: 28, h: 12 }, props: { dimension: 'Region', metric: 'revenue', topN: 5 } },
    { id: 'sales-donut1', type: 'donut', title: 'Profit by Category', layout: { x: 28, y: 8, w: 20, h: 6 }, props: { dimension: 'Category', metric: 'profit' } },
    { id: 'sales-waterfall1', type: 'waterfall', title: 'Profit Waterfall', layout: { x: 28, y: 14, w: 20, h: 6 }, props: { dimension: 'Region', metric: 'profit' } },
    // Row 20-27: Line + Treemap
    { id: 'sales-line1', type: 'line', title: 'Revenue Trend', layout: { x: 0, y: 20, w: 24, h: 8 }, props: { metric: 'revenue', comparison: 'both' } },
    { id: 'sales-treemap1', type: 'treemap', title: 'Revenue Treemap', layout: { x: 24, y: 20, w: 24, h: 8 }, props: { dimension: 'Category', metric: 'revenue' } },
    // Row 28-35: Detail table
    { id: 'sales-table1', type: 'table', title: 'Sales Details', layout: { x: 0, y: 28, w: 48, h: 8 }, props: { maxRows: 50 } },
  ]
};

// ─── Marketing (SaaS) ────────────────────────────────────────────────────────
// Dashboard with slicers on left + KPIs
export const SaasMarketingTemplate: Template = {
  name: 'Marketing',
  scenario: 'SaaS',
  theme: 'Ocean',
  items: [
    // Row 0: Slicers (8w) + 4 KPI cards (40w) = 48
    { id: 'mkt-slicer1', type: 'slicer', title: 'Region', layout: { x: 0, y: 0, w: 4, h: 5 }, props: { dimension: 'Region' } },
    { id: 'mkt-slicer2', type: 'slicer', title: 'Tier', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { dimension: 'Tier' } },
    { id: 'mkt-card1', type: 'card', title: 'Total MRR', layout: { x: 8, y: 0, w: 10, h: 5 }, props: { metric: 'mrr', operation: 'sum', label: 'Total MRR', colorIndex: 0 } },
    { id: 'mkt-card2', type: 'card', title: 'Avg LTV', layout: { x: 18, y: 0, w: 10, h: 5 }, props: { metric: 'ltv', operation: 'avg', label: 'Avg LTV', colorIndex: 1 } },
    { id: 'mkt-card3', type: 'card', title: 'Churn Risk', layout: { x: 28, y: 0, w: 10, h: 5 }, props: { metric: 'churn', operation: 'sum', label: 'Total Churn', colorIndex: 4 } },
    { id: 'mkt-card4', type: 'card', title: 'Avg MRR', layout: { x: 38, y: 0, w: 10, h: 5 }, props: { metric: 'mrr', operation: 'avg', label: 'Avg MRR', colorIndex: 3 } },
    // Row 5-16: Hero pair (bar + funnel)
    { id: 'mkt-bar1', type: 'bar', title: 'MRR by Tier', layout: { x: 0, y: 5, w: 28, h: 12 }, props: { dimension: 'Tier', metric: 'mrr' } },
    { id: 'mkt-funnel1', type: 'funnel', title: 'Conversion Funnel', layout: { x: 28, y: 5, w: 20, h: 12 }, props: { dimension: 'Tier', metric: 'mrr' } },
    // Row 17-24: Analysis trio
    { id: 'mkt-line1', type: 'line', title: 'MRR Trend', layout: { x: 0, y: 17, w: 16, h: 8 }, props: { metric: 'mrr', comparison: 'both' } },
    { id: 'mkt-donut1', type: 'donut', title: 'Churn by Tier', layout: { x: 16, y: 17, w: 16, h: 8 }, props: { dimension: 'Tier', metric: 'churn' } },
    { id: 'mkt-scatter1', type: 'scatter', title: 'MRR vs LTV', layout: { x: 32, y: 17, w: 16, h: 8 }, props: { xMetric: 'mrr', yMetric: 'ltv', dimension: 'Tier' } },
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
    { id: 'hr-slicer1', type: 'slicer', title: 'Department', layout: { x: 0, y: 0, w: 4, h: 5 }, props: { dimension: 'Department' } },
    { id: 'hr-slicer2', type: 'slicer', title: 'Role', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { dimension: 'role' } },
    { id: 'hr-card1', type: 'card', title: 'Total Employees', layout: { x: 8, y: 0, w: 10, h: 5 }, props: { metric: 'salary', operation: 'count', label: 'Headcount', colorIndex: 0 } },
    { id: 'hr-card2', type: 'card', title: 'Avg Salary', layout: { x: 18, y: 0, w: 10, h: 5 }, props: { metric: 'salary', operation: 'avg', label: 'Avg Salary', colorIndex: 1 } },
    { id: 'hr-card3', type: 'card', title: 'Attrition Rate', layout: { x: 28, y: 0, w: 10, h: 5 }, props: { metric: 'attrition', operation: 'avg', label: 'Attrition %', colorIndex: 4 } },
    { id: 'hr-card4', type: 'card', title: 'Avg Tenure', layout: { x: 38, y: 0, w: 10, h: 5 }, props: { metric: 'tenure', operation: 'avg', label: 'Avg Tenure (yrs)', colorIndex: 2 } },
    // Row 5-16: Hero bar + gauge + pie stacked
    { id: 'hr-bar1', type: 'bar', title: 'Headcount by Dept', layout: { x: 0, y: 5, w: 28, h: 12 }, props: { dimension: 'Department', metric: 'salary' } },
    { id: 'hr-gauge1', type: 'gauge', title: 'Attrition vs Target', layout: { x: 28, y: 5, w: 20, h: 6 }, props: { metric: 'attrition', target: 0.1 } },
    { id: 'hr-pie1', type: 'pie', title: 'Ratings Distribution', layout: { x: 28, y: 11, w: 20, h: 6 }, props: { dimension: 'rating', metric: 'salary' } },
    // Row 17-24: Analysis trio
    { id: 'hr-stackedCol1', type: 'stackedColumn', title: 'Attrition by Dept', layout: { x: 0, y: 17, w: 16, h: 8 }, props: { dimension: 'Department', metric: 'attrition' } },
    { id: 'hr-scatter1', type: 'scatter', title: 'Salary vs Tenure', layout: { x: 16, y: 17, w: 16, h: 8 }, props: { xMetric: 'salary', yMetric: 'tenure', dimension: 'Department' } },
    { id: 'hr-waterfall1', type: 'waterfall', title: 'Salary by Dept', layout: { x: 32, y: 17, w: 16, h: 8 }, props: { dimension: 'Department', metric: 'salary' } },
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
    { id: 'log-stackedBar1', type: 'stackedBar', title: 'Cost by Origin', layout: { x: 0, y: 20, w: 16, h: 8 }, props: { dimension: 'origin', metric: 'cost' } },
    { id: 'log-treemap1', type: 'treemap', title: 'Weight by Dest', layout: { x: 16, y: 20, w: 16, h: 8 }, props: { dimension: 'destination', metric: 'weight' } },
    { id: 'log-waterfall1', type: 'waterfall', title: 'Cost Bridge', layout: { x: 32, y: 20, w: 16, h: 8 }, props: { dimension: 'status', metric: 'cost' } },
    // Row 28-35: Detail matrix
    { id: 'log-matrix1', type: 'matrix', title: 'Origin vs Destination', layout: { x: 0, y: 28, w: 48, h: 8 }, props: { rows: 'Origin', columns: 'Destination', values: 'Cost' } },
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
    { id: 'fin-slicer1', type: 'slicer', title: 'Account', layout: { x: 0, y: 0, w: 4, h: 5 }, props: { dimension: 'Account' } },
    { id: 'fin-slicer2', type: 'slicer', title: 'Region', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { dimension: 'Region' } },
    { id: 'fin-card1', type: 'card', title: 'Total Amount', layout: { x: 8, y: 0, w: 10, h: 5 }, props: { metric: 'Amount', operation: 'sum', label: 'Total Amount', colorIndex: 0 } },
    { id: 'fin-card2', type: 'card', title: 'Total Variance', layout: { x: 18, y: 0, w: 10, h: 5 }, props: { metric: 'Variance', operation: 'sum', label: 'Total Variance', colorIndex: 1 } },
    { id: 'fin-card3', type: 'card', title: 'Avg Amount', layout: { x: 28, y: 0, w: 10, h: 5 }, props: { metric: 'Amount', operation: 'avg', label: 'Avg Amount', colorIndex: 2 } },
    { id: 'fin-card4', type: 'card', title: 'Avg Variance', layout: { x: 38, y: 0, w: 10, h: 5 }, props: { metric: 'Variance', operation: 'avg', label: 'Avg Variance', colorIndex: 3 } },
    // Row 5: Scenario slicer bar
    { id: 'fin-slicer3', type: 'slicer', title: 'Scenario', layout: { x: 0, y: 5, w: 48, h: 3 }, props: { dimension: 'Scenario' } },
    // Row 8-19: Hero matrix + bar + stacked
    { id: 'fin-matrix1', type: 'matrix', title: 'P&L Matrix', layout: { x: 0, y: 8, w: 28, h: 12 }, props: { rows: 'Account', columns: 'Region', values: 'Amount' } },
    { id: 'fin-bar1', type: 'bar', title: 'Amount by BU', layout: { x: 28, y: 8, w: 20, h: 6 }, props: { dimension: 'BusinessUnit', metric: 'Amount' } },
    { id: 'fin-stackedCol1', type: 'stackedColumn', title: 'Amount by Scenario', layout: { x: 28, y: 14, w: 20, h: 6 }, props: { dimension: 'Scenario', metric: 'Amount' } },
    // Row 20-27: Analysis trio
    { id: 'fin-line1', type: 'line', title: 'Amount Trend', layout: { x: 0, y: 20, w: 16, h: 8 }, props: { metric: 'Amount', comparison: 'both' } },
    { id: 'fin-waterfall1', type: 'waterfall', title: 'Variance Bridge', layout: { x: 16, y: 20, w: 16, h: 8 }, props: { dimension: 'BusinessUnit', metric: 'Variance' } },
    { id: 'fin-donut1', type: 'donut', title: 'Amount by Account', layout: { x: 32, y: 20, w: 16, h: 8 }, props: { dimension: 'Account', metric: 'Amount' } },
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
    { id: 'ibcs-stackedCol1', type: 'stackedColumn', title: 'Amount by Scenario', layout: { x: 28, y: 22, w: 20, h: 6 }, props: { dimension: 'Scenario', metric: 'Amount' } },
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
    { id: 'soc-card1', type: 'card', title: 'Net Sentiment', layout: { x: 0, y: 0, w: 12, h: 6 }, props: { metric: 'SentimentScore', operation: 'avg', label: 'Avg Sentiment', showVariance: true } },
    { id: 'soc-gauge1', type: 'gauge', title: 'Engagements vs Target', layout: { x: 12, y: 0, w: 12, h: 6 }, props: { metric: 'Engagements', target: 3000000 } },
    { id: 'soc-slicer1', type: 'slicer', title: 'Platform', layout: { x: 24, y: 0, w: 12, h: 6 }, props: { dimension: 'Platform' } },
    { id: 'soc-multi1', type: 'multiRowCard', title: 'Social KPIs', layout: { x: 36, y: 0, w: 12, h: 6 }, props: { fields: ['Engagements', 'Mentions', 'SentimentScore'] } },

    // Row 6-11: Trend row
    { id: 'soc-line1', type: 'line', title: 'Engagement Trend', layout: { x: 0, y: 6, w: 12, h: 6 }, props: { metric: 'Engagements' } },
    { id: 'soc-area1', type: 'area', title: 'Mentions Trend', layout: { x: 12, y: 6, w: 12, h: 6 }, props: { metric: 'Mentions' } },
    { id: 'soc-stackedBar1', type: 'stackedBar', title: 'Sentiment Breakdown', layout: { x: 24, y: 6, w: 12, h: 6 }, props: { dimension: 'Sentiment', metric: 'Mentions' } },
    { id: 'soc-stackedCol1', type: 'stackedColumn', title: 'Engagements AC vs PL', layout: { x: 36, y: 6, w: 12, h: 6 }, props: { metric: 'Engagements' } },

    // Row 12-17: Comparisons
    { id: 'soc-bar1', type: 'bar', title: 'Engagements by Platform', layout: { x: 0, y: 12, w: 12, h: 6 }, props: { dimension: 'Platform', metric: 'Engagements' } },
    { id: 'soc-column1', type: 'column', title: 'Mentions by Location', layout: { x: 12, y: 12, w: 12, h: 6 }, props: { dimension: 'Location', metric: 'Mentions' } },
    { id: 'soc-pie1', type: 'pie', title: 'Mentions Share', layout: { x: 24, y: 12, w: 12, h: 6 }, props: { dimension: 'Platform', metric: 'Mentions' } },
    { id: 'soc-donut1', type: 'donut', title: 'Engagements by Sentiment', layout: { x: 36, y: 12, w: 12, h: 6 }, props: { dimension: 'Sentiment', metric: 'Engagements' } },

    // Row 18-23: Distribution
    { id: 'soc-funnel1', type: 'funnel', title: 'Engagement Funnel', layout: { x: 0, y: 18, w: 12, h: 6 }, props: { dimension: 'Platform', metric: 'Engagements' } },
    { id: 'soc-treemap1', type: 'treemap', title: 'Mentions Treemap', layout: { x: 12, y: 18, w: 12, h: 6 }, props: { dimension: 'Platform', metric: 'Mentions' } },
    { id: 'soc-scatter1', type: 'scatter', title: 'Engagement vs Mentions', layout: { x: 24, y: 18, w: 12, h: 6 }, props: { xMetric: 'Engagements', yMetric: 'Mentions', sizeMetric: 'SentimentScore', dimension: 'Platform' } },
    { id: 'soc-waterfall1', type: 'waterfall', title: 'Engagements Bridge', layout: { x: 36, y: 18, w: 12, h: 6 }, props: { dimension: 'Platform', metric: 'Engagements' } },

    // Row 24-29: Detail band
    { id: 'soc-table1', type: 'table', title: 'Recent Posts', layout: { x: 0, y: 24, w: 24, h: 6 }, props: { maxRows: 8, columns: ['Date', 'Platform', 'Sentiment', 'Engagements', 'Mentions'] } },
    { id: 'soc-matrix1', type: 'matrix', title: 'Platform x Sentiment', layout: { x: 24, y: 24, w: 24, h: 6 }, props: { rows: 'Platform', columns: 'Sentiment', values: 'Engagements' } },

    // Row 30-35: Slicer + KPI summary band
    { id: 'soc-slicer2', type: 'slicer', title: 'Sentiment', layout: { x: 0, y: 30, w: 12, h: 6 }, props: { dimension: 'Sentiment' } },
    { id: 'soc-slicer3', type: 'slicer', title: 'Location', layout: { x: 12, y: 30, w: 12, h: 6 }, props: { dimension: 'Location' } },
    { id: 'soc-card2', type: 'card', title: 'Total Engagements', layout: { x: 24, y: 30, w: 12, h: 6 }, props: { metric: 'Engagements', operation: 'sum', label: 'Total Engagements', colorIndex: 0 } },
    { id: 'soc-card3', type: 'card', title: 'Total Mentions', layout: { x: 36, y: 30, w: 12, h: 6 }, props: { metric: 'Mentions', operation: 'sum', label: 'Total Mentions', colorIndex: 1 } },
  ]
};

export const Templates = [RetailDashboardTemplate, RetailTemplate, SaasMarketingTemplate, HrTemplate, LogisticsTemplate, FinanceTemplate, ZebraTemplate, SocialTemplate];
