import { DashboardItem } from '../types';

export interface Template {
  name: string;
  scenario: 'Retail' | 'SaaS' | 'HR' | 'Logistics' | 'Social' | 'Portfolio';
  theme?: string;
  items: DashboardItem[];
}

export const RetailTemplate: Template = {
  name: 'Sales',
  scenario: 'Retail',
  items: [
    { id: 'slicer1', type: 'slicer', title: 'Filter by Store', layout: { x: 0, y: 0, w: 4, h: 4 }, props: { dimension: 'Store' } },
    { id: 'card1', type: 'card', title: 'Total Revenue', layout: { x: 4, y: 0, w: 4, h: 2 }, props: { metric: 'revenue', operation: 'sum', label: 'Sum of Revenue', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Total Profit', layout: { x: 8, y: 0, w: 4, h: 2 }, props: { metric: 'profit', operation: 'sum', label: 'Sum of Profit', colorIndex: 2 } },
    { id: 'card3', type: 'card', title: 'Avg Order Value', layout: { x: 12, y: 0, w: 4, h: 2 }, props: { metric: 'revenue', operation: 'avg', label: 'Avg Order', colorIndex: 3 } },
    { id: 'chart1', type: 'bar', title: 'Revenue by Region', layout: { x: 4, y: 2, w: 10, h: 6 }, props: { dimension: 'Region', metric: 'revenue' } },
    { id: 'chart2', type: 'pie', title: 'Revenue by Category', layout: { x: 14, y: 2, w: 10, h: 6 }, props: { dimension: 'Category', metric: 'revenue' } },
    { id: 'chart3', type: 'line', title: 'Revenue Trend', layout: { x: 0, y: 8, w: 24, h: 5 }, props: { metric: 'revenue' } },
  ]
};

export const SaasMarketingTemplate: Template = {
  name: 'Marketing',
  scenario: 'SaaS',
  items: [
    { id: 'slicer1', type: 'slicer', title: 'Filter by Region', layout: { x: 0, y: 0, w: 4, h: 4 }, props: { dimension: 'Region' } },
    { id: 'card1', type: 'card', title: 'Total MRR', layout: { x: 4, y: 0, w: 6, h: 2 }, props: { metric: 'mrr', operation: 'sum', label: 'Total MRR', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'LTV', layout: { x: 10, y: 0, w: 6, h: 2 }, props: { metric: 'ltv', operation: 'avg', label: 'Avg LTV', colorIndex: 1 } },
    { id: 'card3', type: 'card', title: 'Churn Risk', layout: { x: 16, y: 0, w: 6, h: 2 }, props: { metric: 'churn', operation: 'sum', label: 'Total Churn', colorIndex: 4 } },
    { id: 'chart1', type: 'bar', title: 'MRR by Tier', layout: { x: 4, y: 2, w: 10, h: 6 }, props: { dimension: 'Tier', metric: 'mrr' } },
    { id: 'chart2', type: 'funnel', title: 'Conversion Funnel', layout: { x: 14, y: 2, w: 10, h: 6 }, props: { dimension: 'Tier', metric: 'mrr' } },
    { id: 'table1', type: 'table', title: 'Customer List', layout: { x: 0, y: 8, w: 24, h: 6 }, props: { maxRows: 50 } },
  ]
};

export const HrTemplate: Template = {
  name: 'HR Attrition',
  scenario: 'HR',
  items: [
    { id: 'slicer1', type: 'slicer', title: 'Filter by Department', layout: { x: 0, y: 0, w: 6, h: 4 }, props: { dimension: 'Department' } },
    { id: 'card1', type: 'card', title: 'Total Employees', layout: { x: 6, y: 0, w: 6, h: 2 }, props: { metric: 'salary', operation: 'count', label: 'Headcount', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Avg Salary', layout: { x: 12, y: 0, w: 6, h: 2 }, props: { metric: 'salary', operation: 'avg', label: 'Avg Salary', colorIndex: 2 } },
    { id: 'card3', type: 'card', title: 'Attrition Rate', layout: { x: 18, y: 0, w: 6, h: 2 }, props: { metric: 'attrition', operation: 'avg', label: 'Attrition %', colorIndex: 4 } },
    { id: 'chart1', type: 'bar', title: 'Headcount by Dept', layout: { x: 6, y: 2, w: 10, h: 6 }, props: { dimension: 'Department', metric: 'salary' } },
    { id: 'chart2', type: 'pie', title: 'Ratings Distribution', layout: { x: 16, y: 2, w: 8, h: 6 }, props: { dimension: 'rating', metric: 'salary' } },
    { id: 'table1', type: 'table', title: 'Employee Directory', layout: { x: 0, y: 8, w: 24, h: 6 }, props: { maxRows: 50 } },
  ]
};

export const LogisticsTemplate: Template = {
  name: 'Logistics Supply Chain',
  scenario: 'Logistics',
  items: [
    { id: 'slicer1', type: 'slicer', title: 'Filter by Status', layout: { x: 0, y: 0, w: 4, h: 4 }, props: { dimension: 'status' } },
    { id: 'card1', type: 'card', title: 'Total Shipments', layout: { x: 4, y: 0, w: 4, h: 2 }, props: { metric: 'cost', operation: 'count', label: 'Count', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Total Cost', layout: { x: 8, y: 0, w: 4, h: 2 }, props: { metric: 'cost', operation: 'sum', label: 'Total Cost', colorIndex: 2 } },
    { id: 'card3', type: 'card', title: 'On Time %', layout: { x: 12, y: 0, w: 4, h: 2 }, props: { metric: 'onTime', operation: 'avg', label: 'On Time Rate', colorIndex: 3 } },
    { id: 'chart1', type: 'bar', title: 'Cost by Carrier', layout: { x: 4, y: 2, w: 10, h: 6 }, props: { dimension: 'carrier', metric: 'cost' } },
    { id: 'chart2', type: 'pie', title: 'Status Breakdown', layout: { x: 14, y: 2, w: 10, h: 6 }, props: { dimension: 'status', metric: 'weight' } },
    { id: 'map1', type: 'matrix', title: 'Origin vs Destination', layout: { x: 0, y: 8, w: 24, h: 6 }, props: {} },
  ]
};

export const FinanceTemplate: Template = {
  name: 'Finance',
  scenario: 'Retail',
  items: [
    { id: 'multi1', type: 'multiRowCard', title: 'Key Metrics', layout: { x: 0, y: 0, w: 6, h: 4 }, props: {} },
    { id: 'matrix1', type: 'matrix', title: 'P&L Matrix', layout: { x: 6, y: 0, w: 18, h: 8 }, props: {} },
    { id: 'waterfall1', type: 'waterfall', title: 'Profit Bridge', layout: { x: 0, y: 8, w: 12, h: 6 }, props: { dimension: 'Region', metric: 'profit' } },
    { id: 'waterfall2', type: 'waterfall', title: 'Revenue Bridge', layout: { x: 12, y: 8, w: 12, h: 6 }, props: { dimension: 'Category', metric: 'revenue' } },
  ]
};

export const ZebraTemplate: Template = {
  name: 'Zebra (IBCS)',
  scenario: 'Retail',
  theme: 'Zebra (IBCS)',
  items: [
    // Top row - 4 KPI cards
    { id: 'card1', type: 'card', title: 'Gross Profit', layout: { x: 0, y: 0, w: 6, h: 2 }, props: { metric: 'profit', operation: 'sum', label: 'Gross Profit', showVariance: true } },
    { id: 'card2', type: 'card', title: 'Cost', layout: { x: 6, y: 0, w: 6, h: 2 }, props: { metric: 'revenue', operation: 'sum', label: 'Cost', showVariance: true } },
    { id: 'card3', type: 'card', title: 'Revenue', layout: { x: 12, y: 0, w: 6, h: 2 }, props: { metric: 'revenue', operation: 'sum', label: 'Revenue', showVariance: true } },
    { id: 'card4', type: 'card', title: 'Gross Margin %', layout: { x: 18, y: 0, w: 6, h: 2 }, props: { metric: 'profit', operation: 'avg', label: 'Gross Margin %', isPercentage: true, showVariance: true } },
    // Left side - Matrix table
    { id: 'matrix1', type: 'matrix', title: 'AC, PY, PL by BusinessUnit, Division', layout: { x: 0, y: 2, w: 14, h: 14 }, props: {} },
    // Right side - 3 stacked charts
    { id: 'line1', type: 'line', title: 'AC and PL by Month', layout: { x: 14, y: 2, w: 10, h: 5 }, props: { metric: 'revenue' } },
    { id: 'waterfall1', type: 'waterfall', title: 'ΔPY Variance', layout: { x: 14, y: 7, w: 10, h: 4 }, props: { dimension: 'Region', metric: 'revenue' } },
    { id: 'stackedCol1', type: 'stackedColumn', title: 'AC and PL by Month', layout: { x: 14, y: 11, w: 10, h: 5 }, props: { dimension: 'Month', metric: 'revenue' } },
  ]
};

export const SocialTemplate: Template = {
  name: 'Social Media Sentiment',
  scenario: 'Social',
  theme: 'Social',
  items: [
    // Row 1: KPI cards + slicers
    { id: 'card1', type: 'card', title: 'Net Sentiment', layout: { x: 0, y: 0, w: 4, h: 2 }, props: { metric: 'profit', operation: 'avg', label: 'Net Sentiment', isPercentage: true, showVariance: true, accentColor: '#7B5EA7' } },
    { id: 'card2', type: 'card', title: 'Positive', layout: { x: 4, y: 0, w: 4, h: 2 }, props: { metric: 'quantity', operation: 'sum', label: 'Positive', showVariance: true } },
    { id: 'card3', type: 'card', title: 'Negative', layout: { x: 8, y: 0, w: 4, h: 2 }, props: { metric: 'quantity', operation: 'avg', label: 'Negative', isPercentage: true, showVariance: true } },
    { id: 'slicer1', type: 'slicer', title: 'Age Group', layout: { x: 16, y: 0, w: 4, h: 2 }, props: { dimension: 'Region' } },
    { id: 'slicer2', type: 'slicer', title: 'Location', layout: { x: 20, y: 0, w: 4, h: 2 }, props: { dimension: 'Category' } },

    // Row 2: Charts
    { id: 'area1', type: 'area', title: 'Sentiment Trend by', layout: { x: 0, y: 2, w: 14, h: 6 }, props: { metric: 'revenue' } },
    { id: 'stackedBar1', type: 'stackedBar', title: 'Sentiment Breakdown', layout: { x: 14, y: 2, w: 4, h: 6 }, props: { dimension: 'Category', metric: 'revenue' } },

    // Right side KPIs
    { id: 'card4', type: 'card', title: 'Total Engagements', layout: { x: 18, y: 2, w: 6, h: 2 }, props: { metric: 'revenue', operation: 'sum', label: 'Total Engagements', showVariance: true, accentColor: '#26C6DA' } },
    { id: 'card5', type: 'card', title: 'Positive', layout: { x: 18, y: 4, w: 3, h: 2 }, props: { metric: 'profit', operation: 'sum', label: 'Positive', showVariance: true, accentColor: '#26C6DA' } },
    { id: 'card6', type: 'card', title: 'Negative', layout: { x: 21, y: 4, w: 3, h: 2 }, props: { metric: 'quantity', operation: 'sum', label: 'Negative', showVariance: true, accentColor: '#7B5EA7' } },

    // Right side table
    { id: 'table1', type: 'table', title: 'Engagement Breakdown by Age Group', layout: { x: 18, y: 6, w: 6, h: 6 }, props: { maxRows: 8 } },

    // Bottom row: Hashtag cards + table
    { id: 'card7', type: 'card', title: 'Hashtag 1', layout: { x: 0, y: 8, w: 4, h: 2 }, props: { metric: 'quantity', operation: 'sum', label: 'Hashtag 1', showVariance: false, accentColor: '#7B5EA7' } },
    { id: 'card8', type: 'card', title: 'Hashtag 2', layout: { x: 4, y: 8, w: 4, h: 2 }, props: { metric: 'quantity', operation: 'sum', label: 'Hashtag 2', showVariance: false } },
    { id: 'card9', type: 'card', title: 'Hashtag 3', layout: { x: 0, y: 10, w: 4, h: 2 }, props: { metric: 'quantity', operation: 'sum', label: 'Hashtag 3', showVariance: false } },
    { id: 'card10', type: 'card', title: 'Hashtag 4', layout: { x: 4, y: 10, w: 4, h: 2 }, props: { metric: 'quantity', operation: 'sum', label: 'Hashtag 4', showVariance: false } },
    { id: 'table2', type: 'table', title: 'Channel and Mention', layout: { x: 8, y: 8, w: 10, h: 4 }, props: { maxRows: 4 } },
  ]
};

export const PortfolioMonitoringTemplate: Template = {
  name: 'Portfolio Monitoring',
  scenario: 'Portfolio',
  theme: 'Portfolio',
  items: [
    // Row 0-1: Header bar (full width)
    { id: 'headerBar1', type: 'portfolioHeaderBar', title: '', layout: { x: 0, y: 0, w: 24, h: 2 }, props: {} },

    // Row 2-3: Filters (4 × w=3) + Search (w=3) + 3 KPI cards (3 × w=3)
    { id: 'slicer1', type: 'slicer', title: 'Sector and Investment', layout: { x: 0, y: 2, w: 3, h: 2 }, props: { dimension: 'Sector' } },
    { id: 'slicer2', type: 'slicer', title: 'Score', layout: { x: 3, y: 2, w: 3, h: 2 }, props: { dimension: 'Score' } },
    { id: 'slicer3', type: 'slicer', title: 'Change Of Direction', layout: { x: 6, y: 2, w: 3, h: 2 }, props: { dimension: 'ChangeDirection' } },
    { id: 'justSearch1', type: 'justificationSearch', title: 'Justification', layout: { x: 9, y: 2, w: 6, h: 2 }, props: {} },
    { id: 'kpiUnique', type: 'portfolioCard', title: 'Unique Entity', layout: { x: 15, y: 2, w: 3, h: 2 }, props: { metric: 'uniqueEntity' } },
    { id: 'kpiThreshold', type: 'portfolioCard', title: 'Above Threshold', layout: { x: 18, y: 2, w: 3, h: 2 }, props: { metric: 'aboveThreshold' } },
    { id: 'kpiNegative', type: 'portfolioCard', title: 'Negative Changes', layout: { x: 21, y: 2, w: 3, h: 2 }, props: { metric: 'negativeChanges' } },

    // Row 4-9: Chart (left) + Entity table (right)
    { id: 'barChart1', type: 'controversyBar', title: 'Controversy Score Change', layout: { x: 0, y: 4, w: 10, h: 6 }, props: { dimension: 'Group' } },
    { id: 'entityTable1', type: 'entityTable', title: 'Entity Name', layout: { x: 10, y: 4, w: 14, h: 6 }, props: { maxRows: 10 } },

    // Row 10-17: Bottom band - Tabs + 3-panel layout (full width)
    { id: 'bottomPanel1', type: 'controversyBottomPanel', title: '', layout: { x: 0, y: 10, w: 24, h: 8 }, props: {} },
  ]
};

export const Templates = [RetailTemplate, SaasMarketingTemplate, HrTemplate, LogisticsTemplate, FinanceTemplate, ZebraTemplate, SocialTemplate, PortfolioMonitoringTemplate];
