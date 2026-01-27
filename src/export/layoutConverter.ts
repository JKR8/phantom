/**
 * Layout Converter - Converts Phantom grid layout to Power BI pixel positions
 * 
 * Phantom uses a 24-column grid system.
 * Power BI uses absolute pixel positions on a configurable canvas (default 1280×720).
 */

import { DashboardItem, VisualType } from '../types';

// Power BI canvas dimensions (default 16:9)
export const PBI_CANVAS_WIDTH = 1280;
export const PBI_CANVAS_HEIGHT = 720;

// Phantom grid configuration
export const PHANTOM_GRID_COLS = 24;
export const PHANTOM_ROW_HEIGHT = 40; // Approximate row height in pixels

// Power BI visual type identifiers (from reverse-engineering PBIT files)
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
export function convertLayoutToPBI(items: DashboardItem[]): PBIVisualConfig[] {
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
export function generatePBILayoutJSON(visuals: PBIVisualConfig[]): object {
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
              projections: generateProjections(visual),
              prototypeQuery: generatePrototypeQuery(visual),
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
function generateProjections(visual: PBIVisualConfig): object {
  const projections: Record<string, any[]> = {};
  const props = visual.phantomProps;

  // Handle different visual types
  switch (visual.originalType) {
    case 'bar':
    case 'column':
    case 'stackedBar':
    case 'stackedColumn':
    case 'line':
    case 'area':
      if (props.dimension) {
        projections['Category'] = [{ queryRef: `${props.dimension}` }];
      }
      if (props.metric) {
        projections['Values'] = [{ queryRef: `Sum(${props.metric})` }];
      }
      break;

    case 'pie':
    case 'donut':
      if (props.dimension) {
        projections['Legend'] = [{ queryRef: `${props.dimension}` }];
      }
      if (props.metric) {
        projections['Values'] = [{ queryRef: `Sum(${props.metric})` }];
      }
      break;

    case 'card':
      if (props.metric) {
        projections['Values'] = [{ queryRef: `Sum(${props.metric})` }];
      }
      break;

    case 'table':
    case 'matrix':
      // Tables/matrices need column definitions
      projections['Values'] = [];
      break;

    case 'slicer':
      if (props.dimension) {
        projections['Values'] = [{ queryRef: `${props.dimension}` }];
      }
      break;

    case 'waterfall':
      if (props.dimension) {
        projections['Category'] = [{ queryRef: `${props.dimension}` }];
      }
      if (props.metric) {
        projections['Values'] = [{ queryRef: `Sum(${props.metric})` }];
      }
      break;
  }

  return projections;
}

/**
 * Generate prototype query structure for a visual
 */
function generatePrototypeQuery(visual: PBIVisualConfig): object {
  return {
    version: 2,
    From: [],
    Select: [],
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
