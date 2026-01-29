export interface Slot {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  description: string;
}

// Archetype metadata for UI display
export interface ArchetypeInfo {
  name: string;
  description: string;
  icon: string;
}

export const ArchetypeDescriptions: Record<string, ArchetypeInfo> = {
  Executive: {
    name: 'Executive',
    description: '4 KPIs at top, main chart with breakdown, details table at bottom',
    icon: 'BoardRegular'
  },
  Diagnostic: {
    name: 'Diagnostic',
    description: 'Filter sidebar, 3 analysis charts, detail table',
    icon: 'DataAreaRegular'
  },
  Operational: {
    name: 'Operational',
    description: 'KPI row, 3 metric grids, action list',
    icon: 'GridRegular'
  }
};

export type Archetype = 'Executive' | 'Diagnostic' | 'Operational';

// Grid uses 48 columns with 20px row height, 8px margins between visuals
// All layouts designed to fit within 32 rows (~900px canvas height)
export const SlotLayouts: Record<Archetype, Slot[]> = {
  Executive: [
    { id: 'kpi1', name: 'Primary KPI', x: 0, y: 0, w: 12, h: 6, description: 'Main Metric' },
    { id: 'kpi2', name: 'Secondary KPI', x: 12, y: 0, w: 12, h: 6, description: 'Secondary Metric' },
    { id: 'kpi3', name: 'Tertiary KPI', x: 24, y: 0, w: 12, h: 6, description: 'Tertiary Metric' },
    { id: 'kpi4', name: 'Quaternary KPI', x: 36, y: 0, w: 12, h: 6, description: 'Quaternary Metric' },
    { id: 'mainTrend', name: 'Main Trend', x: 0, y: 6, w: 32, h: 14, description: 'Primary Trend Analysis' },
    { id: 'breakdown', name: 'Breakdown', x: 32, y: 6, w: 16, h: 14, description: 'Categorical Breakdown' },
    { id: 'details', name: 'Details', x: 0, y: 20, w: 48, h: 10, description: 'Detailed Data Table' },
  ],
  Diagnostic: [
    { id: 'filters', name: 'Filter Bar', x: 0, y: 0, w: 8, h: 20, description: 'Slicers & Controls' },
    { id: 'chart1', name: 'Chart 1', x: 8, y: 0, w: 20, h: 10, description: 'Comparison Chart' },
    { id: 'chart2', name: 'Chart 2', x: 28, y: 0, w: 20, h: 10, description: 'Distribution Chart' },
    { id: 'chart3', name: 'Chart 3', x: 8, y: 10, w: 40, h: 10, description: 'Trend Over Time' },
    { id: 'table', name: 'Detail Table', x: 0, y: 20, w: 48, h: 10, description: 'Transaction Details' },
  ],
  Operational: [
    { id: 'kpiRow', name: 'KPIs', x: 0, y: 0, w: 48, h: 5, description: 'Status Indicators' },
    { id: 'grid1', name: 'Grid 1', x: 0, y: 5, w: 16, h: 10, description: 'Operational Metric 1' },
    { id: 'grid2', name: 'Grid 2', x: 16, y: 5, w: 16, h: 10, description: 'Operational Metric 2' },
    { id: 'grid3', name: 'Grid 3', x: 32, y: 5, w: 16, h: 10, description: 'Operational Metric 3' },
    { id: 'actions', name: 'Action List', x: 0, y: 15, w: 48, h: 15, description: 'Items Requiring Attention' },
  ]
};
