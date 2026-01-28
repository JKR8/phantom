/**
 * Layout Converter - Converts Phantom grid layout to Power BI pixel positions
 * 
 * Phantom uses a 24-column grid system.
 * Power BI uses absolute pixel positions on a configurable canvas (default 1280×720).
 */

import { DashboardItem, Scenario, VisualType } from '../types';
import { mapFieldToPBIColumn } from './schemaGenerator';

// Power BI canvas dimensions (default 16:9)
export const PBI_CANVAS_WIDTH = 1280;
export const PBI_CANVAS_HEIGHT = 720;

// Phantom grid configuration
export const PHANTOM_GRID_COLS = 24;
export const PHANTOM_ROW_HEIGHT = 40; // Approximate row height in pixels

// Power BI visual type identifiers (from reverse-engineering Power BI exports)
export const PBI_VISUAL_TYPES: Record<VisualType, string> = {
  bar: 'clusteredBarChart',
  column: 'clusteredColumnChart',
  stackedBar: 'stackedBarChart',
  stackedColumn: 'stackedColumnChart',
  line: 'lineChart',
  area: 'areaChart',
  scatter: 'scatterChart',
  pie: 'pieChart',
  donut: 'donutChart',
  funnel: 'funnel',
  treemap: 'treemap',
  gauge: 'gauge',
  card: 'card',
  multiRowCard: 'multiRowCard',
  table: 'tableEx',
  matrix: 'pivotTable',
  waterfall: 'waterfallChart',
  slicer: 'slicer',
  // Portfolio-specific visuals map to closest PBI equivalents
  controversyBar: 'clusteredBarChart',
  entityTable: 'tableEx',
  controversyTable: 'tableEx',
  portfolioCard: 'card',
  portfolioHeader: 'textbox',
  dateRangePicker: 'slicer',
  portfolioHeaderBar: 'textbox',
  controversyBottomPanel: 'tableEx',
  justificationSearch: 'slicer',
  portfolioKPICards: 'multiRowCard',
};

export interface PBIPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PBIVisualConfig {
  name: string;
  visualType: string;
  position: PBIPosition;
  title: string;
  phantomProps: any;
  originalType: VisualType;
}

/**
 * Convert Phantom grid position to Power BI pixel position
 */
export function gridToPixels(layout: { x: number; y: number; w: number; h: number }): PBIPosition {
  const colWidth = PBI_CANVAS_WIDTH / PHANTOM_GRID_COLS;
  
  // Calculate horizontal position and width
  const x = Math.round(layout.x * colWidth);
  const width = Math.round(layout.w * colWidth);
  
  // Calculate vertical position and height
  // Use a scaling factor to fit content appropriately
  const rowHeight = PBI_CANVAS_HEIGHT / 18; // Assuming ~18 rows fill the canvas
  const y = Math.round(layout.y * rowHeight);
  const height = Math.round(layout.h * rowHeight);
  
  // Ensure minimum dimensions
  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.max(50, width),
    height: Math.max(30, height),
  };
}

/**
 * Get Power BI visual type identifier
 */
export function getPBIVisualType(phantomType: VisualType): string {
  return PBI_VISUAL_TYPES[phantomType] || 'card';
}

/**
 * Convert all dashboard items to PBI visual configurations
 */
export function convertLayoutToPBI(items: DashboardItem[], scenario: Scenario): PBIVisualConfig[] {
  return items.map((item, index) => ({
    name: `visual_${item.id}`,
    visualType: getPBIVisualType(item.type),
    position: gridToPixels(item.layout),
    title: item.title,
    phantomProps: item.props || {},
    originalType: item.type,
  }));
}

/**
 * Generate Power BI layout JSON structure
 * This is a simplified version - full implementation would include all visual config
 */
export function generatePBILayoutJSON(visuals: PBIVisualConfig[], scenario: Scenario): object {
  return {
    id: 0,
    reportId: generateReportId(),
    sections: [
      {
        name: 'ReportSection',
        displayName: 'Dashboard',
        displayOption: 0,
        width: PBI_CANVAS_WIDTH,
        height: PBI_CANVAS_HEIGHT,
        filters: [],
        ordinal: 0,
        visualContainers: visuals.map((visual, index) => ({
          x: visual.position.x,
          y: visual.position.y,
          z: index,
          width: visual.position.width,
          height: visual.position.height,
          config: JSON.stringify({
            name: visual.name,
            layouts: [
              {
                id: 0,
                position: {
                  x: visual.position.x,
                  y: visual.position.y,
                  z: index,
                  width: visual.position.width,
                  height: visual.position.height,
                },
              },
            ],
            singleVisual: {
              visualType: visual.visualType,
              projections: generateProjections(visual, scenario),
              prototypeQuery: generatePrototypeQuery(visual, scenario),
              title: visual.title,
              showTitle: true,
              titleText: visual.title,
            },
          }),
          filters: '[]',
          tabOrder: index,
        })),
      },
    ],
    config: JSON.stringify({
      version: '5.50',
      themeCollection: {
        baseTheme: {
          name: 'CY23SU08',
          version: '5.50',
        },
      },
      slowDataSourceSettings: {
        isCrossHighlightingDisabled: false,
        isSlicerSelectionsButtonEnabled: false,
        isFilterSelectionsButtonEnabled: true,
        isFieldWellButtonEnabled: false,
        isApplyAllButtonEnabled: true,
      },
      linguisticSchemaSyncVersion: 2,
      activeSectionIndex: 0,
    }),
  };
}

/**
 * Generate a unique report ID
 */
function generateReportId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate projections (field bindings) for a visual
 */
function generateProjections(visual: PBIVisualConfig, scenario: Scenario): object {
  const projections: Record<string, any[]> = {};
  const props = visual.phantomProps;
  const metricOperation = (props?.operation || 'sum').toString().toLowerCase();

  const toColumnRef = (field?: string) => {
    if (!field) return null;
    const mapping = mapFieldToPBIColumn(scenario, field);
    return `${mapping.table}[${mapping.column}]`;
  };

  const toAggregateRef = (field?: string, operation = 'sum') => {
    if (!field) return null;
    const mapping = mapFieldToPBIColumn(scenario, field);
    const columnRef = `${mapping.table}[${mapping.column}]`;
    const op = operation.toLowerCase();
    if (op === 'avg' || op === 'average') return `AVERAGE(${columnRef})`;
    if (op === 'min') return `MIN(${columnRef})`;
    if (op === 'max') return `MAX(${columnRef})`;
    if (op === 'count') return `COUNT(${columnRef})`;
    if (op === 'distinctcount') return `DISTINCTCOUNT(${columnRef})`;
    return `SUM(${columnRef})`;
  };

  // Handle different visual types
  switch (visual.originalType) {
    case 'bar':
    case 'column':
    case 'stackedBar':
    case 'stackedColumn':
    case 'line':
    case 'area':
      if (props.dimension) {
        const dimRef = toColumnRef(props.dimension);
        if (dimRef) projections['Category'] = [{ queryRef: dimRef }];
      }
      if (props.metric) {
        const metricRef = toAggregateRef(props.metric);
        if (metricRef) projections['Values'] = [{ queryRef: metricRef }];
      }
      break;

    case 'pie':
    case 'donut':
      if (props.dimension) {
        const dimRef = toColumnRef(props.dimension);
        if (dimRef) projections['Legend'] = [{ queryRef: dimRef }];
      }
      if (props.metric) {
        const metricRef = toAggregateRef(props.metric);
        if (metricRef) projections['Values'] = [{ queryRef: metricRef }];
      }
      break;

    case 'card':
      if (props.metric) {
        const metricRef = toAggregateRef(props.metric, metricOperation);
        if (metricRef) projections['Values'] = [{ queryRef: metricRef }];
      }
      break;

    case 'table':
      projections['Values'] = [];
      if (Array.isArray(props.columns)) {
        props.columns.forEach((col: string) => {
          const colRef = toColumnRef(col);
          if (colRef) projections['Values'].push({ queryRef: colRef });
        });
      }
      break;

    case 'matrix':
      if (props.rows) {
        const rowRef = toColumnRef(props.rows);
        if (rowRef) projections['Rows'] = [{ queryRef: rowRef }];
      }
      if (props.columns) {
        const colRef = toColumnRef(props.columns);
        if (colRef) projections['Columns'] = [{ queryRef: colRef }];
      }
      if (props.values) {
        const valRef = toAggregateRef(props.values, metricOperation);
        if (valRef) projections['Values'] = [{ queryRef: valRef }];
      }
      break;

    case 'slicer':
      if (props.dimension) {
        const dimRef = toColumnRef(props.dimension);
        if (dimRef) projections['Values'] = [{ queryRef: dimRef }];
      }
      break;

    case 'waterfall':
      if (props.dimension) {
        const dimRef = toColumnRef(props.dimension);
        if (dimRef) projections['Category'] = [{ queryRef: dimRef }];
      }
      if (props.metric) {
        const metricRef = toAggregateRef(props.metric);
        if (metricRef) projections['Values'] = [{ queryRef: metricRef }];
      }
      break;

    case 'scatter':
      if (props.dimension) {
        const dimRef = toColumnRef(props.dimension);
        if (dimRef) projections['Category'] = [{ queryRef: dimRef }];
      }
      if (props.xMetric) {
        const xRef = toAggregateRef(props.xMetric);
        if (xRef) projections['X'] = [{ queryRef: xRef }];
      }
      if (props.yMetric) {
        const yRef = toAggregateRef(props.yMetric);
        if (yRef) projections['Y'] = [{ queryRef: yRef }];
      }
      if (props.sizeMetric) {
        const sizeRef = toAggregateRef(props.sizeMetric);
        if (sizeRef) projections['Size'] = [{ queryRef: sizeRef }];
      }
      break;

    case 'funnel':
      if (props.dimension) {
        const dimRef = toColumnRef(props.dimension);
        if (dimRef) projections['Category'] = [{ queryRef: dimRef }];
      }
      if (props.metric) {
        const metricRef = toAggregateRef(props.metric);
        if (metricRef) projections['Values'] = [{ queryRef: metricRef }];
      }
      break;

    case 'treemap':
      if (props.dimension) {
        const dimRef = toColumnRef(props.dimension);
        if (dimRef) projections['Group'] = [{ queryRef: dimRef }];
      }
      if (props.metric) {
        const metricRef = toAggregateRef(props.metric);
        if (metricRef) projections['Values'] = [{ queryRef: metricRef }];
      }
      break;

    case 'gauge':
      if (props.metric) {
        const metricRef = toAggregateRef(props.metric, metricOperation);
        if (metricRef) projections['Values'] = [{ queryRef: metricRef }];
      }
      break;
  }

  return projections;
}

/**
 * Generate prototype query structure for a visual
 */
function generatePrototypeQuery(visual: PBIVisualConfig, scenario: Scenario): object {
  const projections = generateProjections(visual, scenario);
  const tableRefs = new Map<string, Set<string>>();

  Object.values(projections).forEach((entries) => {
    entries.forEach((entry) => {
      const queryRef: string | undefined = entry?.queryRef;
      if (!queryRef) return;
      const match = queryRef.match(/([A-Za-z0-9_]+)\[([^\]]+)\]/);
      if (!match) return;
      const table = match[1];
      const column = match[2];
      if (!tableRefs.has(table)) {
        tableRefs.set(table, new Set());
      }
      tableRefs.get(table)!.add(column);
    });
  });

  const from = Array.from(tableRefs.keys()).map((table) => ({
    Name: table,
    Entity: table,
    Type: 0,
  }));

  const select = Array.from(tableRefs.entries()).flatMap(([table, columns]) => {
    return Array.from(columns).map((column) => ({
      Column: {
        Expression: { SourceRef: { Source: table } },
        Property: column,
      },
      Name: `${table}.${column}`,
    }));
  });

  return {
    version: 2,
    From: from,
    Select: select,
    OrderBy: [],
  };
}

/**
 * Calculate optimal canvas dimensions based on dashboard content
 */
export function calculateOptimalCanvas(items: DashboardItem[]): { width: number; height: number } {
  let maxX = 0;
  let maxY = 0;

  items.forEach((item) => {
    const rightEdge = item.layout.x + item.layout.w;
    const bottomEdge = item.layout.y + item.layout.h;
    maxX = Math.max(maxX, rightEdge);
    maxY = Math.max(maxY, bottomEdge);
  });

  // Scale to fit within reasonable bounds while maintaining aspect ratio
  const aspectRatio = 16 / 9;
  const baseWidth = PBI_CANVAS_WIDTH;
  const contentHeight = (maxY / 18) * PBI_CANVAS_HEIGHT;
  
  return {
    width: baseWidth,
    height: Math.max(PBI_CANVAS_HEIGHT, Math.ceil(contentHeight)),
  };
}
