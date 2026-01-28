import { DashboardItem } from '../types';

export interface Template {
  name: string;
  scenario: 'Retail' | 'SaaS' | 'HR' | 'Logistics' | 'Social' | 'Portfolio' | 'Finance';
  theme?: string;
  items: DashboardItem[];
}

// ─── Retail Dashboard (default initial state) ────────────────────────────────
// Matches the default view when opening the app
export const RetailDashboardTemplate: Template = {
  name: 'Retail Dashboard',
  scenario: 'Retail',
  items: [
    { id: 'slicer1', type: 'slicer', title: 'Store', layout: { x: 0, y: 0, w: 2, h: 5 }, props: { dimension: 'Store' } },
    { id: 'slicer2', type: 'slicer', title: 'Region', layout: { x: 2, y: 0, w: 2, h: 5 }, props: { dimension: 'Region' } },
    { id: 'card1', type: 'card', title: 'Total Revenue', layout: { x: 4, y: 0, w: 4, h: 5 }, props: { metric: 'revenue', operation: 'sum', label: 'Sum of Revenue', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Total Profit', layout: { x: 8, y: 0, w: 4, h: 5 }, props: { metric: 'profit', operation: 'sum', label: 'Sum of Profit', colorIndex: 2 } },
    { id: 'card3', type: 'card', title: 'Avg Order', layout: { x: 12, y: 0, w: 4, h: 5 }, props: { metric: 'revenue', operation: 'avg', label: 'Avg per Transaction', colorIndex: 3 } },
    { id: 'card4', type: 'card', title: 'Total Qty', layout: { x: 16, y: 0, w: 4, h: 5 }, props: { metric: 'quantity', operation: 'sum', label: 'Units Sold', colorIndex: 1 } },
    { id: 'card5', type: 'card', title: 'Transactions', layout: { x: 20, y: 0, w: 4, h: 5 }, props: { metric: 'revenue', operation: 'count', label: 'Transactions', colorIndex: 4 } },
    { id: 'chart1', type: 'bar', title: 'Revenue by Region', layout: { x: 0, y: 5, w: 12, h: 10 }, props: { dimension: 'Region', metric: 'revenue' } },
    { id: 'chart2', type: 'pie', title: 'Revenue by Category', layout: { x: 12, y: 5, w: 12, h: 10 }, props: { dimension: 'Category', metric: 'revenue' } },
    { id: 'chart3', type: 'line', title: 'Revenue Trend', layout: { x: 0, y: 15, w: 24, h: 7 }, props: { metric: 'revenue' } },
    { id: 'table1', type: 'table', title: 'Sales Details', layout: { x: 0, y: 22, w: 24, h: 10 }, props: { maxRows: 100 } },
  ]
};

// ─── Sales (Retail enriched) ─────────────────────────────────────────────────
// Pattern B: KPIs → slicer bar → hero + stacked support → analysis trio → detail
// Theme: Sunset (warm, retail)
export const RetailTemplate: Template = {
  name: 'Sales',
  scenario: 'Retail',
  theme: 'Sunset',
  items: [
    // Row 0-3: KPI strip
    { id: 'card1', type: 'card', title: 'Total Revenue', layout: { x: 0, y: 0, w: 6, h: 4 }, props: { metric: 'revenue', operation: 'sum', label: 'Sum of Revenue', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Total Profit', layout: { x: 6, y: 0, w: 6, h: 4 }, props: { metric: 'profit', operation: 'sum', label: 'Sum of Profit', colorIndex: 1 } },
    { id: 'card3', type: 'card', title: 'Avg Order Value', layout: { x: 12, y: 0, w: 6, h: 4 }, props: { metric: 'revenue', operation: 'avg', label: 'Avg Order', colorIndex: 2 } },
    { id: 'card4', type: 'card', title: 'Total Qty', layout: { x: 18, y: 0, w: 6, h: 4 }, props: { metric: 'quantity', operation: 'sum', label: 'Total Quantity', colorIndex: 3 } },
    // Row 4-7: Slicer bar
    { id: 'slicer1', type: 'slicer', title: 'Store', layout: { x: 0, y: 4, w: 8, h: 4 }, props: { dimension: 'Store' } },
    { id: 'slicer2', type: 'slicer', title: 'Region', layout: { x: 8, y: 4, w: 8, h: 4 }, props: { dimension: 'Region' } },
    { id: 'slicer3', type: 'slicer', title: 'Category', layout: { x: 16, y: 4, w: 8, h: 4 }, props: { dimension: 'Category' } },
    // Row 8-21: Hero (14w) + 2 stacked support (10w)
    { id: 'chart1', type: 'bar', title: 'Top 5 Region by Revenue', layout: { x: 0, y: 8, w: 14, h: 14 }, props: { dimension: 'Region', metric: 'revenue', topN: 5 } },
    { id: 'donut1', type: 'donut', title: 'Profit by Category', layout: { x: 14, y: 8, w: 10, h: 8 }, props: { dimension: 'Category', metric: 'profit' } },
    { id: 'waterfall1', type: 'waterfall', title: 'Profit Waterfall', layout: { x: 14, y: 16, w: 10, h: 6 }, props: { dimension: 'Region', metric: 'profit' } },
    // Row 22-29: Analysis row
    { id: 'chart3', type: 'line', title: 'Revenue Trend', layout: { x: 0, y: 22, w: 12, h: 8 }, props: { metric: 'revenue', comparison: 'both' } },
    { id: 'treemap1', type: 'treemap', title: 'Revenue Treemap', layout: { x: 12, y: 22, w: 12, h: 8 }, props: { dimension: 'Category', metric: 'revenue' } },
    // Row 30-35: Detail table
    { id: 'table1', type: 'table', title: 'Sales Details', layout: { x: 0, y: 30, w: 24, h: 6 }, props: { maxRows: 50 } },
  ]
};

// ─── Marketing (SaaS) ────────────────────────────────────────────────────────
// Pattern A: KPIs → slicer bar → hero pair → analysis trio → detail
// Theme: Ocean (modern tech)
export const SaasMarketingTemplate: Template = {
  name: 'Marketing',
  scenario: 'SaaS',
  theme: 'Ocean',
  items: [
    // Row 0-3: KPI strip
    { id: 'card1', type: 'card', title: 'Total MRR', layout: { x: 0, y: 0, w: 6, h: 4 }, props: { metric: 'mrr', operation: 'sum', label: 'Total MRR', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Avg LTV', layout: { x: 6, y: 0, w: 6, h: 4 }, props: { metric: 'ltv', operation: 'avg', label: 'Avg LTV', colorIndex: 1 } },
    { id: 'card3', type: 'card', title: 'Churn Risk', layout: { x: 12, y: 0, w: 6, h: 4 }, props: { metric: 'churn', operation: 'sum', label: 'Total Churn', colorIndex: 4 } },
    { id: 'card4', type: 'card', title: 'Avg MRR', layout: { x: 18, y: 0, w: 6, h: 4 }, props: { metric: 'mrr', operation: 'avg', label: 'Avg MRR', colorIndex: 3 } },
    // Row 4-7: Slicer bar
    { id: 'slicer1', type: 'slicer', title: 'Region', layout: { x: 0, y: 4, w: 12, h: 4 }, props: { dimension: 'Region' } },
    { id: 'slicer2', type: 'slicer', title: 'Tier', layout: { x: 12, y: 4, w: 12, h: 4 }, props: { dimension: 'Tier' } },
    // Row 8-21: Hero pair (14w bar + 10w funnel)
    { id: 'chart1', type: 'bar', title: 'MRR by Tier', layout: { x: 0, y: 8, w: 14, h: 14 }, props: { dimension: 'Tier', metric: 'mrr' } },
    { id: 'chart2', type: 'funnel', title: 'Conversion Funnel', layout: { x: 14, y: 8, w: 10, h: 14 }, props: { dimension: 'Tier', metric: 'mrr' } },
    // Row 22-29: Analysis trio (8w each)
    { id: 'line1', type: 'line', title: 'MRR Trend', layout: { x: 0, y: 22, w: 8, h: 8 }, props: { metric: 'mrr', comparison: 'both' } },
    { id: 'donut1', type: 'donut', title: 'Churn by Tier', layout: { x: 8, y: 22, w: 8, h: 8 }, props: { dimension: 'Tier', metric: 'churn' } },
    { id: 'scatter1', type: 'scatter', title: 'MRR vs LTV', layout: { x: 16, y: 22, w: 8, h: 8 }, props: { xMetric: 'mrr', yMetric: 'ltv', dimension: 'Tier' } },
    // Row 30-35: Detail table
    { id: 'table1', type: 'table', title: 'Customer List', layout: { x: 0, y: 30, w: 24, h: 6 }, props: { maxRows: 50 } },
  ]
};

// ─── HR Attrition ────────────────────────────────────────────────────────────
// Pattern B: KPIs → slicer bar → hero + gauge stack → analysis trio → detail
// Theme: Warm Neutral (professional warm)
export const HrTemplate: Template = {
  name: 'HR Attrition',
  scenario: 'HR',
  theme: 'Warm Neutral',
  items: [
    // Row 0-3: KPI strip
    { id: 'card1', type: 'card', title: 'Total Employees', layout: { x: 0, y: 0, w: 6, h: 4 }, props: { metric: 'salary', operation: 'count', label: 'Headcount', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Avg Salary', layout: { x: 6, y: 0, w: 6, h: 4 }, props: { metric: 'salary', operation: 'avg', label: 'Avg Salary', colorIndex: 1 } },
    { id: 'card3', type: 'card', title: 'Attrition Rate', layout: { x: 12, y: 0, w: 6, h: 4 }, props: { metric: 'attrition', operation: 'avg', label: 'Attrition %', colorIndex: 4 } },
    { id: 'card4', type: 'card', title: 'Avg Tenure', layout: { x: 18, y: 0, w: 6, h: 4 }, props: { metric: 'tenure', operation: 'avg', label: 'Avg Tenure (yrs)', colorIndex: 2 } },
    // Row 4-7: Slicer bar
    { id: 'slicer1', type: 'slicer', title: 'Department', layout: { x: 0, y: 4, w: 12, h: 4 }, props: { dimension: 'Department' } },
    { id: 'slicer2', type: 'slicer', title: 'Role', layout: { x: 12, y: 4, w: 12, h: 4 }, props: { dimension: 'role' } },
    // Row 8-21: Hero bar (14w) + gauge + pie stacked (10w)
    { id: 'chart1', type: 'bar', title: 'Headcount by Dept', layout: { x: 0, y: 8, w: 14, h: 14 }, props: { dimension: 'Department', metric: 'salary' } },
    { id: 'gauge1', type: 'gauge', title: 'Attrition vs Target', layout: { x: 14, y: 8, w: 10, h: 8 }, props: { metric: 'attrition', target: 0.1 } },
    { id: 'chart2', type: 'pie', title: 'Ratings Distribution', layout: { x: 14, y: 16, w: 10, h: 6 }, props: { dimension: 'rating', metric: 'salary' } },
    // Row 22-29: Analysis trio (8w each)
    { id: 'stackedCol1', type: 'stackedColumn', title: 'Attrition by Dept', layout: { x: 0, y: 22, w: 8, h: 8 }, props: { dimension: 'Department', metric: 'attrition' } },
    { id: 'scatter1', type: 'scatter', title: 'Salary vs Tenure', layout: { x: 8, y: 22, w: 8, h: 8 }, props: { xMetric: 'salary', yMetric: 'tenure', dimension: 'Department' } },
    { id: 'waterfall1', type: 'waterfall', title: 'Salary by Dept', layout: { x: 16, y: 22, w: 8, h: 8 }, props: { dimension: 'Department', metric: 'salary' } },
    // Row 30-35: Detail table
    { id: 'table1', type: 'table', title: 'Employee Directory', layout: { x: 0, y: 30, w: 24, h: 6 }, props: { maxRows: 50 } },
  ]
};

// ─── Logistics Supply Chain ──────────────────────────────────────────────────
// Pattern A: KPIs → slicer bar → hero pair → analysis trio → detail matrix
// Theme: Industrial (blue-grey-amber)
export const LogisticsTemplate: Template = {
  name: 'Logistics Supply Chain',
  scenario: 'Logistics',
  theme: 'Industrial',
  items: [
    // Row 0-3: KPI strip
    { id: 'card1', type: 'card', title: 'Total Shipments', layout: { x: 0, y: 0, w: 6, h: 4 }, props: { metric: 'cost', operation: 'count', label: 'Count', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Total Cost', layout: { x: 6, y: 0, w: 6, h: 4 }, props: { metric: 'cost', operation: 'sum', label: 'Total Cost', colorIndex: 1 } },
    { id: 'card3', type: 'card', title: 'On Time %', layout: { x: 12, y: 0, w: 6, h: 4 }, props: { metric: 'onTime', operation: 'avg', label: 'On Time Rate', colorIndex: 2 } },
    { id: 'card4', type: 'card', title: 'Avg Weight', layout: { x: 18, y: 0, w: 6, h: 4 }, props: { metric: 'weight', operation: 'avg', label: 'Avg Weight', colorIndex: 3 } },
    // Row 4-7: Slicer bar
    { id: 'slicer1', type: 'slicer', title: 'Status', layout: { x: 0, y: 4, w: 8, h: 4 }, props: { dimension: 'status' } },
    { id: 'slicer2', type: 'slicer', title: 'Carrier', layout: { x: 8, y: 4, w: 8, h: 4 }, props: { dimension: 'carrier' } },
    { id: 'slicer3', type: 'slicer', title: 'Origin', layout: { x: 16, y: 4, w: 8, h: 4 }, props: { dimension: 'origin' } },
    // Row 8-21: Hero pair
    { id: 'chart1', type: 'bar', title: 'Cost by Carrier', layout: { x: 0, y: 8, w: 14, h: 14 }, props: { dimension: 'carrier', metric: 'cost' } },
    { id: 'chart2', type: 'pie', title: 'Status Breakdown', layout: { x: 14, y: 8, w: 10, h: 14 }, props: { dimension: 'status', metric: 'weight' } },
    // Row 22-29: Analysis trio (8w each)
    { id: 'stackedBar1', type: 'stackedBar', title: 'Cost by Origin', layout: { x: 0, y: 22, w: 8, h: 8 }, props: { dimension: 'origin', metric: 'cost' } },
    { id: 'treemap1', type: 'treemap', title: 'Weight by Dest', layout: { x: 8, y: 22, w: 8, h: 8 }, props: { dimension: 'destination', metric: 'weight' } },
    { id: 'waterfall1', type: 'waterfall', title: 'Cost Bridge', layout: { x: 16, y: 22, w: 8, h: 8 }, props: { dimension: 'status', metric: 'cost' } },
    // Row 30-35: Detail matrix
    { id: 'map1', type: 'matrix', title: 'Origin vs Destination', layout: { x: 0, y: 30, w: 24, h: 6 }, props: { rows: 'Origin', columns: 'Destination', values: 'Cost' } },
  ]
};

// ─── Finance ─────────────────────────────────────────────────────────────────
// Pattern B: KPIs → slicer bar → hero matrix + bar stack → analysis trio → detail
// Theme: Boardroom (navy/teal/gold)
export const FinanceTemplate: Template = {
  name: 'Finance',
  scenario: 'Finance',
  theme: 'Boardroom',
  items: [
    // Row 0-3: KPI strip
    { id: 'card1', type: 'card', title: 'Total Amount', layout: { x: 0, y: 0, w: 6, h: 4 }, props: { metric: 'Amount', operation: 'sum', label: 'Total Amount', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Total Variance', layout: { x: 6, y: 0, w: 6, h: 4 }, props: { metric: 'Variance', operation: 'sum', label: 'Total Variance', colorIndex: 1 } },
    { id: 'card3', type: 'card', title: 'Avg Amount', layout: { x: 12, y: 0, w: 6, h: 4 }, props: { metric: 'Amount', operation: 'avg', label: 'Avg Amount', colorIndex: 2 } },
    { id: 'card4', type: 'card', title: 'Avg Variance', layout: { x: 18, y: 0, w: 6, h: 4 }, props: { metric: 'Variance', operation: 'avg', label: 'Avg Variance', colorIndex: 3 } },
    // Row 4-7: Slicer bar
    { id: 'slicer1', type: 'slicer', title: 'Account', layout: { x: 0, y: 4, w: 8, h: 4 }, props: { dimension: 'Account' } },
    { id: 'slicer2', type: 'slicer', title: 'Region', layout: { x: 8, y: 4, w: 8, h: 4 }, props: { dimension: 'Region' } },
    { id: 'slicer3', type: 'slicer', title: 'Scenario', layout: { x: 16, y: 4, w: 8, h: 4 }, props: { dimension: 'Scenario' } },
    // Row 8-21: Hero matrix (14w) + bar + stacked (10w each stacked)
    { id: 'matrix1', type: 'matrix', title: 'P&L Matrix', layout: { x: 0, y: 8, w: 14, h: 14 }, props: { rows: 'Account', columns: 'Region', values: 'Amount' } },
    { id: 'bar1', type: 'bar', title: 'Amount by BU', layout: { x: 14, y: 8, w: 10, h: 8 }, props: { dimension: 'BusinessUnit', metric: 'Amount' } },
    { id: 'stackedCol1', type: 'stackedColumn', title: 'Amount by Scenario', layout: { x: 14, y: 16, w: 10, h: 6 }, props: { dimension: 'Scenario', metric: 'Amount' } },
    // Row 22-29: Analysis trio (8w each)
    { id: 'line1', type: 'line', title: 'Amount Trend', layout: { x: 0, y: 22, w: 8, h: 8 }, props: { metric: 'Amount', comparison: 'both' } },
    { id: 'waterfall1', type: 'waterfall', title: 'Variance Bridge', layout: { x: 8, y: 22, w: 8, h: 8 }, props: { dimension: 'BusinessUnit', metric: 'Variance' } },
    { id: 'donut1', type: 'donut', title: 'Amount by Account', layout: { x: 16, y: 22, w: 8, h: 8 }, props: { dimension: 'Account', metric: 'Amount' } },
    // Row 30-35: Detail table
    { id: 'table1', type: 'table', title: 'Finance Records', layout: { x: 0, y: 30, w: 24, h: 6 }, props: { maxRows: 50 } },
  ]
};

// ─── Zebra (IBCS) ────────────────────────────────────────────────────────────
// Asymmetric: KPIs → slicer bar → tall matrix + 3 stacked charts → detail table
export const ZebraTemplate: Template = {
  name: 'Zebra (IBCS)',
  scenario: 'Finance',
  theme: 'Zebra (IBCS)',
  items: [
    // Row 0-3: KPI strip with variance
    { id: 'card1', type: 'card', title: 'Total Amount', layout: { x: 0, y: 0, w: 6, h: 4 }, props: { metric: 'Amount', operation: 'sum', label: 'Total Amount', showVariance: true } },
    { id: 'card2', type: 'card', title: 'Total Variance', layout: { x: 6, y: 0, w: 6, h: 4 }, props: { metric: 'Variance', operation: 'sum', label: 'Total Variance', showVariance: true } },
    { id: 'card3', type: 'card', title: 'Avg Amount', layout: { x: 12, y: 0, w: 6, h: 4 }, props: { metric: 'Amount', operation: 'avg', label: 'Avg Amount', showVariance: true } },
    { id: 'card4', type: 'card', title: 'Avg Variance', layout: { x: 18, y: 0, w: 6, h: 4 }, props: { metric: 'Variance', operation: 'avg', label: 'Avg Variance', showVariance: true } },
    // Row 4-7: Slicer bar
    { id: 'slicer1', type: 'slicer', title: 'Account', layout: { x: 0, y: 4, w: 8, h: 4 }, props: { dimension: 'Account' } },
    { id: 'slicer2', type: 'slicer', title: 'Region', layout: { x: 8, y: 4, w: 8, h: 4 }, props: { dimension: 'Region' } },
    { id: 'slicer3', type: 'slicer', title: 'Scenario', layout: { x: 16, y: 4, w: 8, h: 4 }, props: { dimension: 'Scenario' } },
    // Row 8-29: Tall matrix (14w) + 3 stacked charts (10w)
    { id: 'matrix1', type: 'matrix', title: 'Amount by Account and Scenario', layout: { x: 0, y: 8, w: 14, h: 22 }, props: { rows: 'Account', columns: 'Scenario', values: 'Amount' } },
    { id: 'line1', type: 'line', title: 'Amount AC vs PL', layout: { x: 14, y: 8, w: 10, h: 8 }, props: { metric: 'Amount', comparison: 'pl', timeGrain: 'month' } },
    { id: 'waterfall1', type: 'waterfall', title: 'Variance Bridge', layout: { x: 14, y: 16, w: 10, h: 8 }, props: { dimension: 'Region', metric: 'Variance' } },
    { id: 'stackedCol1', type: 'stackedColumn', title: 'Amount by Scenario', layout: { x: 14, y: 24, w: 10, h: 6 }, props: { dimension: 'Scenario', metric: 'Amount' } },
    // Row 30-35: Detail table
    { id: 'table1', type: 'table', title: 'Finance Records', layout: { x: 0, y: 30, w: 24, h: 6 }, props: { maxRows: 50 } },
  ]
};

// ─── Social Media Sentiment ──────────────────────────────────────────────────
// Dense showcase: 5 rows of 4, all slots filled to 24w
export const SocialTemplate: Template = {
  name: 'Social Media Sentiment',
  scenario: 'Social',
  theme: 'Social',
  items: [
    // Row 0-5: KPIs + slicer (4 × 6w, h:6)
    { id: 'card1', type: 'card', title: 'Net Sentiment', layout: { x: 0, y: 0, w: 6, h: 6 }, props: { metric: 'SentimentScore', operation: 'avg', label: 'Avg Sentiment', showVariance: true } },
    { id: 'gauge1', type: 'gauge', title: 'Engagements vs Target', layout: { x: 6, y: 0, w: 6, h: 6 }, props: { metric: 'Engagements', target: 3000000 } },
    { id: 'slicer1', type: 'slicer', title: 'Platform', layout: { x: 12, y: 0, w: 6, h: 6 }, props: { dimension: 'Platform' } },
    { id: 'multi1', type: 'multiRowCard', title: 'Social KPIs', layout: { x: 18, y: 0, w: 6, h: 6 }, props: { fields: ['Engagements', 'Mentions', 'SentimentScore'] } },

    // Row 6-11: Trend row (4 × 6w, h:6)
    { id: 'line1', type: 'line', title: 'Engagement Trend', layout: { x: 0, y: 6, w: 6, h: 6 }, props: { metric: 'Engagements' } },
    { id: 'area1', type: 'area', title: 'Mentions Trend', layout: { x: 6, y: 6, w: 6, h: 6 }, props: { metric: 'Mentions' } },
    { id: 'stackedBar1', type: 'stackedBar', title: 'Sentiment Breakdown', layout: { x: 12, y: 6, w: 6, h: 6 }, props: { dimension: 'Sentiment', metric: 'Mentions' } },
    { id: 'stackedColumn1', type: 'stackedColumn', title: 'Engagements AC vs PL', layout: { x: 18, y: 6, w: 6, h: 6 }, props: { metric: 'Engagements' } },

    // Row 12-17: Comparisons (4 × 6w, h:6)
    { id: 'bar1', type: 'bar', title: 'Engagements by Platform', layout: { x: 0, y: 12, w: 6, h: 6 }, props: { dimension: 'Platform', metric: 'Engagements' } },
    { id: 'column1', type: 'column', title: 'Mentions by Location', layout: { x: 6, y: 12, w: 6, h: 6 }, props: { dimension: 'Location', metric: 'Mentions' } },
    { id: 'pie1', type: 'pie', title: 'Mentions Share', layout: { x: 12, y: 12, w: 6, h: 6 }, props: { dimension: 'Platform', metric: 'Mentions' } },
    { id: 'donut1', type: 'donut', title: 'Engagements by Sentiment', layout: { x: 18, y: 12, w: 6, h: 6 }, props: { dimension: 'Sentiment', metric: 'Engagements' } },

    // Row 18-23: Distribution (4 × 6w, h:6)
    { id: 'funnel1', type: 'funnel', title: 'Engagement Funnel', layout: { x: 0, y: 18, w: 6, h: 6 }, props: { dimension: 'Platform', metric: 'Engagements' } },
    { id: 'treemap1', type: 'treemap', title: 'Mentions Treemap', layout: { x: 6, y: 18, w: 6, h: 6 }, props: { dimension: 'Platform', metric: 'Mentions' } },
    { id: 'scatter1', type: 'scatter', title: 'Engagement vs Mentions', layout: { x: 12, y: 18, w: 6, h: 6 }, props: { xMetric: 'Engagements', yMetric: 'Mentions', sizeMetric: 'SentimentScore', dimension: 'Platform' } },
    { id: 'waterfall1', type: 'waterfall', title: 'Engagements Bridge', layout: { x: 18, y: 18, w: 6, h: 6 }, props: { dimension: 'Platform', metric: 'Engagements' } },

    // Row 24-29: Detail band (table 12w + matrix 12w, h:6)
    { id: 'table1', type: 'table', title: 'Recent Posts', layout: { x: 0, y: 24, w: 12, h: 6 }, props: { maxRows: 8, columns: ['Date', 'Platform', 'Sentiment', 'Engagements', 'Mentions'] } },
    { id: 'matrix1', type: 'matrix', title: 'Platform x Sentiment', layout: { x: 12, y: 24, w: 12, h: 6 }, props: { rows: 'Platform', columns: 'Sentiment', values: 'Engagements' } },

    // Row 30-35: Slicer + KPI summary band (fills bottom)
    { id: 'slicer2', type: 'slicer', title: 'Sentiment', layout: { x: 0, y: 30, w: 6, h: 6 }, props: { dimension: 'Sentiment' } },
    { id: 'slicer3', type: 'slicer', title: 'Location', layout: { x: 6, y: 30, w: 6, h: 6 }, props: { dimension: 'Location' } },
    { id: 'card2', type: 'card', title: 'Total Engagements', layout: { x: 12, y: 30, w: 6, h: 6 }, props: { metric: 'Engagements', operation: 'sum', label: 'Total Engagements', colorIndex: 0 } },
    { id: 'card3', type: 'card', title: 'Total Mentions', layout: { x: 18, y: 30, w: 6, h: 6 }, props: { metric: 'Mentions', operation: 'sum', label: 'Total Mentions', colorIndex: 1 } },
  ]
};

// ─── Portfolio Monitoring ────────────────────────────────────────────────────
// Custom domain layout with specialized widgets
export const PortfolioMonitoringTemplate: Template = {
  name: 'Portfolio Monitoring',
  scenario: 'Portfolio',
  theme: 'Portfolio',
  items: [
    // Row 0-5: Header bar (full width, taller)
    { id: 'headerBar1', type: 'portfolioHeaderBar', title: '', layout: { x: 0, y: 0, w: 24, h: 6 }, props: {} },

    // Row 6-9: Filters + Search + KPI cards
    { id: 'slicer1', type: 'slicer', title: 'Sector', layout: { x: 0, y: 6, w: 3, h: 4 }, props: { dimension: 'Sector' } },
    { id: 'slicer2', type: 'slicer', title: 'Score', layout: { x: 3, y: 6, w: 3, h: 4 }, props: { dimension: 'Score' } },
    { id: 'slicer3', type: 'slicer', title: 'Change Of Direction', layout: { x: 6, y: 6, w: 3, h: 4 }, props: { dimension: 'ChangeDirection' } },
    { id: 'justSearch1', type: 'justificationSearch', title: 'Justification', layout: { x: 9, y: 6, w: 6, h: 4 }, props: {} },
    { id: 'kpiUnique', type: 'portfolioCard', title: 'Unique Entity', layout: { x: 15, y: 6, w: 3, h: 4 }, props: { metric: 'uniqueEntity' } },
    { id: 'kpiThreshold', type: 'portfolioCard', title: 'Above Threshold', layout: { x: 18, y: 6, w: 3, h: 4 }, props: { metric: 'aboveThreshold' } },
    { id: 'kpiNegative', type: 'portfolioCard', title: 'Negative Changes', layout: { x: 21, y: 6, w: 3, h: 4 }, props: { metric: 'negativeChanges' } },

    // Row 10-21: Chart (left) + Entity table (right)
    { id: 'barChart1', type: 'controversyBar', title: 'Controversy Score Change', layout: { x: 0, y: 10, w: 10, h: 12 }, props: { dimension: 'Group' } },
    { id: 'entityTable1', type: 'entityTable', title: 'Entity Name', layout: { x: 10, y: 10, w: 14, h: 12 }, props: { maxRows: 10 } },

    // Row 22-37: Bottom band - Tabs + 3-panel layout (full width)
    { id: 'bottomPanel1', type: 'controversyBottomPanel', title: '', layout: { x: 0, y: 22, w: 24, h: 16 }, props: {} },
  ]
};

export const Templates = [RetailDashboardTemplate, RetailTemplate, SaasMarketingTemplate, HrTemplate, LogisticsTemplate, FinanceTemplate, ZebraTemplate, SocialTemplate, PortfolioMonitoringTemplate];
