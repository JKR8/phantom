export interface Slot {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  description: string;
}

export type Archetype = 'Executive' | 'Diagnostic' | 'Operational';

export const SlotLayouts: Record<Archetype, Slot[]> = {
  Executive: [
    { id: 'kpi1', name: 'Primary KPI', x: 0, y: 0, w: 6, h: 4, description: 'Main Metric' },
    { id: 'kpi2', name: 'Secondary KPI', x: 6, y: 0, w: 6, h: 4, description: 'Secondary Metric' },
    { id: 'kpi3', name: 'Tertiary KPI', x: 12, y: 0, w: 6, h: 4, description: 'Tertiary Metric' },
    { id: 'kpi4', name: 'Quaternary KPI', x: 18, y: 0, w: 6, h: 4, description: 'Quaternary Metric' },
    { id: 'mainTrend', name: 'Main Trend', x: 0, y: 4, w: 16, h: 8, description: 'Primary Trend Analysis' },
    { id: 'breakdown', name: 'Breakdown', x: 16, y: 4, w: 8, h: 8, description: 'Categorical Breakdown' },
    { id: 'details', name: 'Details', x: 0, y: 12, w: 24, h: 6, description: 'Detailed Data Table' },
  ],
  Diagnostic: [
    { id: 'filters', name: 'Filter Bar', x: 0, y: 0, w: 4, h: 12, description: 'Slicers & Controls' },
    { id: 'chart1', name: 'Chart 1', x: 4, y: 0, w: 10, h: 6, description: 'Comparison Chart' },
    { id: 'chart2', name: 'Chart 2', x: 14, y: 0, w: 10, h: 6, description: 'Distribution Chart' },
    { id: 'chart3', name: 'Chart 3', x: 4, y: 6, w: 20, h: 6, description: 'Trend Over Time' },
    { id: 'table', name: 'Detail Table', x: 0, y: 12, w: 24, h: 8, description: 'Transaction Details' },
  ],
  Operational: [
    { id: 'kpiRow', name: 'KPIs', x: 0, y: 0, w: 24, h: 3, description: 'Status Indicators' },
    { id: 'grid1', name: 'Grid 1', x: 0, y: 3, w: 8, h: 6, description: 'Operational Metric 1' },
    { id: 'grid2', name: 'Grid 2', x: 8, y: 3, w: 8, h: 6, description: 'Operational Metric 2' },
    { id: 'grid3', name: 'Grid 3', x: 16, y: 3, w: 8, h: 6, description: 'Operational Metric 3' },
    { id: 'actions', name: 'Action List', x: 0, y: 9, w: 24, h: 8, description: 'Items Requiring Attention' },
  ]
};
