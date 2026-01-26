import { DashboardItem } from '../types';

export interface Template {
  name: string;
  scenario: 'Retail' | 'SaaS' | 'HR' | 'Logistics';
  items: DashboardItem[];
}

export const RetailTemplate: Template = {
  name: 'Retail Sales',
  scenario: 'Retail',
  items: [
    { id: 'slicer1', type: 'slicer', title: 'Filter by Store', layout: { x: 0, y: 0, w: 2, h: 4 }, props: { dimension: 'Store' } },
    { id: 'card1', type: 'card', title: 'Total Revenue', layout: { x: 2, y: 0, w: 2, h: 2 }, props: { metric: 'revenue', operation: 'sum', label: 'Sum of Revenue', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Total Profit', layout: { x: 4, y: 0, w: 2, h: 2 }, props: { metric: 'profit', operation: 'sum', label: 'Sum of Profit', colorIndex: 2 } },
    { id: 'card3', type: 'card', title: 'Avg Order Value', layout: { x: 6, y: 0, w: 2, h: 2 }, props: { metric: 'revenue', operation: 'avg', label: 'Avg Order', colorIndex: 3 } },
    { id: 'chart1', type: 'bar', title: 'Revenue by Region', layout: { x: 2, y: 2, w: 5, h: 6 }, props: { dimension: 'Region', metric: 'revenue' } },
    { id: 'chart2', type: 'pie', title: 'Revenue by Category', layout: { x: 7, y: 2, w: 5, h: 6 }, props: { dimension: 'Category', metric: 'revenue' } },
    { id: 'chart3', type: 'line', title: 'Revenue Trend', layout: { x: 0, y: 8, w: 12, h: 5 }, props: { metric: 'revenue' } },
  ]
};

export const SaasMarketingTemplate: Template = {
  name: 'SaaS Marketing',
  scenario: 'SaaS',
  items: [
    { id: 'slicer1', type: 'slicer', title: 'Filter by Region', layout: { x: 0, y: 0, w: 2, h: 4 }, props: { dimension: 'Region' } },
    { id: 'card1', type: 'card', title: 'Total MRR', layout: { x: 2, y: 0, w: 3, h: 2 }, props: { metric: 'mrr', operation: 'sum', label: 'Total MRR', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'LTV', layout: { x: 5, y: 0, w: 3, h: 2 }, props: { metric: 'ltv', operation: 'avg', label: 'Avg LTV', colorIndex: 1 } },
    { id: 'card3', type: 'card', title: 'Churn Risk', layout: { x: 8, y: 0, w: 3, h: 2 }, props: { metric: 'churn', operation: 'sum', label: 'Total Churn', colorIndex: 4 } },
    { id: 'chart1', type: 'bar', title: 'MRR by Tier', layout: { x: 2, y: 2, w: 5, h: 6 }, props: { dimension: 'Tier', metric: 'mrr' } }, 
    { id: 'chart2', type: 'funnel', title: 'Conversion Funnel', layout: { x: 7, y: 2, w: 5, h: 6 }, props: { dimension: 'Tier', metric: 'mrr' } },
    { id: 'table1', type: 'table', title: 'Customer List', layout: { x: 0, y: 8, w: 12, h: 6 }, props: { maxRows: 50 } },
  ]
};

export const HrTemplate: Template = {
  name: 'HR Attrition',
  scenario: 'HR',
  items: [
    { id: 'slicer1', type: 'slicer', title: 'Filter by Department', layout: { x: 0, y: 0, w: 3, h: 4 }, props: { dimension: 'Department' } },
    { id: 'card1', type: 'card', title: 'Total Employees', layout: { x: 3, y: 0, w: 3, h: 2 }, props: { metric: 'salary', operation: 'count', label: 'Headcount', colorIndex: 0 } }, // count not implemented, using generic logic?
    { id: 'card2', type: 'card', title: 'Avg Salary', layout: { x: 6, y: 0, w: 3, h: 2 }, props: { metric: 'salary', operation: 'avg', label: 'Avg Salary', colorIndex: 2 } },
    { id: 'card3', type: 'card', title: 'Attrition Rate', layout: { x: 9, y: 0, w: 3, h: 2 }, props: { metric: 'attrition', operation: 'avg', label: 'Attrition %', colorIndex: 4 } },
    { id: 'chart1', type: 'bar', title: 'Headcount by Dept', layout: { x: 3, y: 2, w: 5, h: 6 }, props: { dimension: 'Department', metric: 'salary' } }, // Need count metric? Using salary as proxy for now
    { id: 'chart2', type: 'pie', title: 'Ratings Distribution', layout: { x: 8, y: 2, w: 4, h: 6 }, props: { dimension: 'rating', metric: 'salary' } },
    { id: 'table1', type: 'table', title: 'Employee Directory', layout: { x: 0, y: 8, w: 12, h: 6 }, props: { maxRows: 50 } },
  ]
};

export const LogisticsTemplate: Template = {
  name: 'Logistics Supply Chain',
  scenario: 'Logistics',
  items: [
    { id: 'slicer1', type: 'slicer', title: 'Filter by Status', layout: { x: 0, y: 0, w: 2, h: 4 }, props: { dimension: 'status' } },
    { id: 'card1', type: 'card', title: 'Total Shipments', layout: { x: 2, y: 0, w: 2, h: 2 }, props: { metric: 'cost', operation: 'count', label: 'Count', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Total Cost', layout: { x: 4, y: 0, w: 2, h: 2 }, props: { metric: 'cost', operation: 'sum', label: 'Total Cost', colorIndex: 2 } },
    { id: 'card3', type: 'card', title: 'On Time %', layout: { x: 6, y: 0, w: 2, h: 2 }, props: { metric: 'onTime', operation: 'avg', label: 'On Time Rate', colorIndex: 3 } },
    { id: 'chart1', type: 'bar', title: 'Cost by Carrier', layout: { x: 2, y: 2, w: 5, h: 6 }, props: { dimension: 'carrier', metric: 'cost' } },
    { id: 'chart2', type: 'pie', title: 'Status Breakdown', layout: { x: 7, y: 2, w: 5, h: 6 }, props: { dimension: 'status', metric: 'weight' } },
    { id: 'map1', type: 'matrix', title: 'Origin vs Destination', layout: { x: 0, y: 8, w: 12, h: 6 }, props: {} }, // Matrix as placeholder for Map
  ]
};

export const FinanceTemplate: Template = {
  name: 'Finance Executive',
  scenario: 'Retail',
  items: [
    { id: 'multi1', type: 'multiRowCard', title: 'Key Metrics', layout: { x: 0, y: 0, w: 3, h: 4 }, props: {} },
    { id: 'matrix1', type: 'matrix', title: 'P&L Matrix', layout: { x: 3, y: 0, w: 9, h: 8 }, props: {} },
    { id: 'waterfall1', type: 'waterfall', title: 'Profit Bridge', layout: { x: 0, y: 8, w: 6, h: 6 }, props: { dimension: 'Region', metric: 'profit' } },
    { id: 'waterfall2', type: 'waterfall', title: 'Revenue Bridge', layout: { x: 6, y: 8, w: 6, h: 6 }, props: { dimension: 'Category', metric: 'revenue' } },
  ]
};

export const ZebraTemplate: Template = {
  name: 'Zebra (IBCS)',
  scenario: 'Retail', 
  items: [
    { id: 'card1', type: 'card', title: 'Revenue', layout: { x: 0, y: 0, w: 3, h: 2 }, props: { metric: 'revenue', operation: 'sum', label: 'ACT', colorIndex: 0 } },
    { id: 'card2', type: 'card', title: 'Profit', layout: { x: 3, y: 0, w: 3, h: 2 }, props: { metric: 'profit', operation: 'sum', label: 'ACT', colorIndex: 0 } },
    { id: 'card3', type: 'card', title: 'Quantity', layout: { x: 6, y: 0, w: 3, h: 2 }, props: { metric: 'quantity', operation: 'sum', label: 'ACT', colorIndex: 0 } },
    { id: 'matrix1', type: 'matrix', title: 'Regional Performance', layout: { x: 0, y: 2, w: 6, h: 6 }, props: {} },
    { id: 'waterfall1', type: 'waterfall', title: 'Revenue Contribution', layout: { x: 6, y: 2, w: 6, h: 6 }, props: { dimension: 'Category', metric: 'revenue' } },
    { id: 'bar1', type: 'bar', title: 'Store Ranking', layout: { x: 0, y: 8, w: 12, h: 6 }, props: { dimension: 'Store', metric: 'revenue' } },
  ]
};

export const Templates = [RetailTemplate, SaasMarketingTemplate, HrTemplate, LogisticsTemplate, FinanceTemplate, ZebraTemplate];
