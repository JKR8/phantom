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

// Grid uses 48 columns with 20px row height, 8px margins between visuals
export const SlotLayouts: Record<Archetype, Slot[]> = {
  Executive: [
    { id: 'kpi1', name: 'Primary KPI', x: 0, y: 0, w: 12, h: 8, description: 'Main Metric' },
    { id: 'kpi2', name: 'Secondary KPI', x: 12, y: 0, w: 12, h: 8, description: 'Secondary Metric' },
    { id: 'kpi3', name: 'Tertiary KPI', x: 24, y: 0, w: 12, h: 8, description: 'Tertiary Metric' },
    { id: 'kpi4', name: 'Quaternary KPI', x: 36, y: 0, w: 12, h: 8, description: 'Quaternary Metric' },
    { id: 'mainTrend', name: 'Main Trend', x: 0, y: 8, w: 32, h: 16, description: 'Primary Trend Analysis' },
    { id: 'breakdown', name: 'Breakdown', x: 32, y: 8, w: 16, h: 16, description: 'Categorical Breakdown' },
    { id: 'details', name: 'Details', x: 0, y: 24, w: 48, h: 12, description: 'Detailed Data Table' },
  ],
  Diagnostic: [
    { id: 'filters', name: 'Filter Bar', x: 0, y: 0, w: 8, h: 24, description: 'Slicers & Controls' },
    { id: 'chart1', name: 'Chart 1', x: 8, y: 0, w: 20, h: 12, description: 'Comparison Chart' },
    { id: 'chart2', name: 'Chart 2', x: 28, y: 0, w: 20, h: 12, description: 'Distribution Chart' },
    { id: 'chart3', name: 'Chart 3', x: 8, y: 12, w: 40, h: 12, description: 'Trend Over Time' },
    { id: 'table', name: 'Detail Table', x: 0, y: 24, w: 48, h: 16, description: 'Transaction Details' },
  ],
  Operational: [
    { id: 'kpiRow', name: 'KPIs', x: 0, y: 0, w: 48, h: 6, description: 'Status Indicators' },
    { id: 'grid1', name: 'Grid 1', x: 0, y: 6, w: 16, h: 12, description: 'Operational Metric 1' },
    { id: 'grid2', name: 'Grid 2', x: 16, y: 6, w: 16, h: 12, description: 'Operational Metric 2' },
    { id: 'grid3', name: 'Grid 3', x: 32, y: 6, w: 16, h: 12, description: 'Operational Metric 3' },
    { id: 'actions', name: 'Action List', x: 0, y: 18, w: 48, h: 16, description: 'Items Requiring Attention' },
  ]
};
