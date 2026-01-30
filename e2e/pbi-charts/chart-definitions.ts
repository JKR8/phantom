/**
 * PBI UI Kit 2.0 Chart Definitions
 *
 * Registry of all 29 chart types with metadata for testing.
 * Includes expected PBI visual type mapping, supported props, and implementation status.
 *
 * NOTE (2024): All 29 charts were previously marked `implemented: true` even when
 * the underlying components didn't support the `variant` prop. This allowed
 * variant charts (bullet, lollipop, barbell, diverging, gantt, slope, dotStrip,
 * ribbon, lineForecast, lineStepped) to appear to pass tests while actually
 * rendering identically to their base chart types. The CSS verification tests
 * check that CSS exists but don't verify the visual is correct for the variant.
 *
 * FIX: Components now properly support variant props:
 * - GaugeChart: variant='gauge'|'bullet'
 * - BarChart: variant='default'|'grouped'|'lollipop'|'barbell'|'diverging'|'gantt'
 * - LineChart: variant='default'|'slope', showForecast, stepped
 * - ScatterChart: variant='default'|'dotStrip'
 * - StackedBarChart: variant='default'|'ribbon'
 */

export type ChartCategory =
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'kpi'
  | 'table'
  | 'comparison'
  | 'statistical'
  | 'specialized'
  | 'map';

export interface ChartDefinition {
  /** Internal type ID matching Phantom's VisualType */
  id: string;
  /** Human-readable name */
  displayName: string;
  /** Chart category for grouping */
  category: ChartCategory;
  /** data-testid for drag source in PBI UI Kit pane */
  dragSourceId: string;
  /** If this is a variant, the parent chart ID */
  variantOf?: string;
  /** data-testid for variant picker option */
  variantPickerId?: string;
  /** Props configurable in properties panel */
  supportedProps: string[];
  /** Expected default props from bindingRecipes */
  defaultProps: Record<string, unknown>;
  /** Regex to match generated smart title */
  smartTitlePattern: RegExp;
  /** Expected Power BI visual type in PBIP export */
  pbiVisualType: string;
  /** Whether this chart is fully implemented */
  implemented: boolean;
  /** CSS spec number (1-29) */
  cssSpecNumber: number;
}

/**
 * All 29 PBI UI Kit 2.0 chart types
 */
export const CHART_DEFINITIONS: ChartDefinition[] = [
  // === AREA CHARTS (CSS #1-2) ===
  {
    id: 'area',
    displayName: 'Area (Layered)',
    category: 'area',
    dragSourceId: 'visual-source-area',
    supportedProps: ['metric', 'comparison', 'timeGrain'],
    defaultProps: {
      comparison: 'both',
      timeGrain: 'month',
    },
    smartTitlePattern: /\w+ Trend/i,
    pbiVisualType: 'areaChart',
    implemented: true,
    cssSpecNumber: 1,
  },
  {
    id: 'stackedArea',
    displayName: 'Area (Stacked)',
    category: 'area',
    dragSourceId: 'visual-source-stackedArea',
    supportedProps: ['dimension', 'metric', 'timeGrain'],
    defaultProps: {
      timeGrain: 'month',
    },
    smartTitlePattern: /\w+ by \w+ Over Time|Stacked Area/i,
    pbiVisualType: 'areaChart',
    implemented: true,
    cssSpecNumber: 2,
  },

  // === BAR CHARTS (CSS #3-6) ===
  {
    id: 'bar',
    displayName: 'Bar',
    category: 'bar',
    dragSourceId: 'visual-source-bar',
    supportedProps: ['dimension', 'metric', 'topN', 'sort', 'showOther'],
    defaultProps: {
      topN: 5,
      sort: 'desc',
      showOther: true,
    },
    smartTitlePattern: /Top \d+ \w+ by \w+|\w+ by \w+/i,
    pbiVisualType: 'clusteredBarChart',
    implemented: true,
    cssSpecNumber: 3,
  },
  {
    id: 'groupedBar',
    displayName: 'Bar (Grouped)',
    category: 'bar',
    dragSourceId: 'visual-source-groupedBar',
    supportedProps: ['dimension', 'metric', 'topN', 'sort', 'showOther'],
    defaultProps: {
      topN: 5,
      sort: 'desc',
      showOther: true,
    },
    smartTitlePattern: /Top \d+ \w+ by \w+|\w+ by \w+/i,
    pbiVisualType: 'clusteredBarChart',
    implemented: true,
    cssSpecNumber: 4,
  },
  {
    id: 'lollipop',
    displayName: 'Bar (Lollipop)',
    category: 'bar',
    dragSourceId: 'visual-source-lollipop',
    supportedProps: ['dimension', 'metric', 'topN', 'sort', 'showOther'],
    defaultProps: {
      topN: 5,
      sort: 'desc',
      showOther: true,
    },
    smartTitlePattern: /Top \d+ \w+ by \w+|\w+ by \w+/i,
    pbiVisualType: 'clusteredBarChart',
    implemented: true,
    cssSpecNumber: 5,
  },
  {
    id: 'stackedBar',
    displayName: 'Bar (Stacked)',
    category: 'bar',
    dragSourceId: 'visual-source-stackedBar',
    supportedProps: ['dimension', 'metric', 'topN', 'sort', 'showOther'],
    defaultProps: {
      topN: 5,
      sort: 'desc',
      showOther: true,
    },
    smartTitlePattern: /Top \d+ \w+ by \w+|\w+ by \w+/i,
    pbiVisualType: 'stackedBarChart',
    implemented: true,
    cssSpecNumber: 6,
  },

  // === COMPARISON CHARTS (CSS #7, 12, 26) ===
  {
    id: 'barbell',
    displayName: 'Barbell',
    category: 'comparison',
    dragSourceId: 'visual-source-barbell',
    supportedProps: ['dimension', 'metric'],
    defaultProps: {},
    smartTitlePattern: /\w+ Comparison|\w+ by \w+|Barbell/i,
    pbiVisualType: 'clusteredBarChart',
    implemented: true,
    cssSpecNumber: 7,
  },
  {
    id: 'diverging',
    displayName: 'Diverging',
    category: 'comparison',
    dragSourceId: 'visual-source-diverging',
    supportedProps: ['dimension', 'metric'],
    defaultProps: {},
    smartTitlePattern: /\w+ Comparison|\w+ by \w+|Diverging/i,
    pbiVisualType: 'clusteredBarChart',
    implemented: true,
    cssSpecNumber: 12,
  },
  {
    id: 'slope',
    displayName: 'Slope',
    category: 'comparison',
    dragSourceId: 'visual-source-slope',
    supportedProps: ['dimension', 'metric'],
    defaultProps: {},
    smartTitlePattern: /\w+ Comparison|\w+ by \w+|Slope/i,
    pbiVisualType: 'lineChart',
    implemented: true,
    cssSpecNumber: 26,
  },

  // === STATISTICAL CHARTS (CSS #8, 16) ===
  {
    id: 'boxplot',
    displayName: 'Boxplot',
    category: 'statistical',
    dragSourceId: 'visual-source-boxplot',
    supportedProps: ['dimension', 'metric', 'whiskerMethod', 'showOutliers', 'showMean'],
    defaultProps: {},
    smartTitlePattern: /\w+ by \w+|Boxplot/i,
    pbiVisualType: 'PhantomStatisticalVisual',
    implemented: true,
    cssSpecNumber: 8,
  },
  {
    id: 'histogram',
    displayName: 'Histogram',
    category: 'statistical',
    dragSourceId: 'visual-source-histogram',
    supportedProps: ['metric', 'binMethod', 'binCount', 'showDensityCurve', 'showMeanLine'],
    defaultProps: {},
    smartTitlePattern: /\w+ Distribution|Histogram/i,
    pbiVisualType: 'PhantomStatisticalVisual',
    implemented: true,
    cssSpecNumber: 16,
  },

  // === KPI & GAUGE (CSS #9, 10, 15) ===
  {
    id: 'bullet',
    displayName: 'Bullet',
    category: 'kpi',
    dragSourceId: 'visual-source-bullet',
    supportedProps: ['metric', 'operation', 'label'],
    defaultProps: {
      operation: 'sum',
      goalText: 'vs prev',
    },
    smartTitlePattern: /Total \w+|KPI|Bullet/i,
    pbiVisualType: 'gauge',
    implemented: true,
    cssSpecNumber: 9,
  },
  {
    id: 'card',
    displayName: 'Card/KPI',
    category: 'kpi',
    dragSourceId: 'visual-source-card',
    supportedProps: ['metric', 'operation', 'label'],
    defaultProps: {
      operation: 'sum',
      goalText: 'vs prev',
    },
    smartTitlePattern: /Total \w+|KPI/i,
    pbiVisualType: 'cardVisual',
    implemented: true,
    cssSpecNumber: 10,
  },
  {
    id: 'gauge',
    displayName: 'Gauge',
    category: 'kpi',
    dragSourceId: 'visual-source-gauge',
    supportedProps: ['metric', 'operation', 'target'],
    defaultProps: {
      operation: 'sum',
      goalText: 'vs prev',
    },
    smartTitlePattern: /Total \w+|KPI|Gauge/i,
    pbiVisualType: 'gauge',
    implemented: true,
    cssSpecNumber: 15,
  },

  // === COMBINATION (CSS #11) ===
  {
    id: 'combo',
    displayName: 'Combo',
    category: 'bar',
    dragSourceId: 'visual-source-combo',
    supportedProps: ['dimension', 'barMetric', 'lineMetric', 'topN', 'sort'],
    defaultProps: {
      topN: 5,
      sort: 'desc',
    },
    smartTitlePattern: /\w+ vs \w+|Combo Chart/i,
    pbiVisualType: 'comboChart',
    implemented: true,
    cssSpecNumber: 11,
  },

  // === SPECIALIZED (CSS #13, 14, 24) ===
  {
    id: 'dotStrip',
    displayName: 'Dot Strip',
    category: 'specialized',
    dragSourceId: 'visual-source-dotStrip',
    supportedProps: ['dimension', 'metric'],
    defaultProps: {},
    smartTitlePattern: /\w+ by \w+|Dot Strip/i,
    pbiVisualType: 'scatterChart',
    implemented: true,
    cssSpecNumber: 13,
  },
  {
    id: 'gantt',
    displayName: 'Gantt',
    category: 'specialized',
    dragSourceId: 'visual-source-gantt',
    supportedProps: ['dimension', 'metric'],
    defaultProps: {},
    smartTitlePattern: /\w+ Timeline|Gantt/i,
    pbiVisualType: 'PhantomStatisticalVisual',
    implemented: true,
    cssSpecNumber: 14,
  },
  {
    id: 'ribbon',
    displayName: 'Ribbon',
    category: 'specialized',
    dragSourceId: 'visual-source-ribbon',
    supportedProps: ['dimension', 'metric', 'topN'],
    defaultProps: {
      topN: 5,
    },
    smartTitlePattern: /Top \d+ \w+ by \w+|\w+ by \w+|Ribbon/i,
    pbiVisualType: 'ribbonChart',
    implemented: true,
    cssSpecNumber: 24,
  },

  // === LINE CHARTS (CSS #17-19) ===
  {
    id: 'line',
    displayName: 'Line',
    category: 'line',
    dragSourceId: 'visual-source-line',
    supportedProps: ['metric', 'comparison', 'timeGrain'],
    defaultProps: {
      comparison: 'both',
      timeGrain: 'month',
    },
    smartTitlePattern: /\w+ Trend/i,
    pbiVisualType: 'lineChart',
    implemented: true,
    cssSpecNumber: 17,
  },
  {
    id: 'lineForecast',
    displayName: 'Line (Forecast)',
    category: 'line',
    dragSourceId: 'visual-source-lineForecast',
    supportedProps: ['metric', 'comparison', 'timeGrain'],
    defaultProps: {
      comparison: 'both',
      timeGrain: 'month',
    },
    smartTitlePattern: /\w+ Trend|Forecast/i,
    pbiVisualType: 'lineChart',
    implemented: true,
    cssSpecNumber: 18,
  },
  {
    id: 'lineStepped',
    displayName: 'Line (Stepped)',
    category: 'line',
    dragSourceId: 'visual-source-lineStepped',
    supportedProps: ['metric', 'comparison', 'timeGrain'],
    defaultProps: {
      comparison: 'both',
      timeGrain: 'month',
    },
    smartTitlePattern: /\w+ Trend|Stepped/i,
    pbiVisualType: 'lineChart',
    implemented: true,
    cssSpecNumber: 19,
  },

  // === MAPS (CSS #20-21) ===
  {
    id: 'mapBubble',
    displayName: 'Map (Bubble)',
    category: 'map',
    dragSourceId: 'visual-source-mapBubble',
    supportedProps: ['geoDimension', 'metric', 'mapType', 'displayMode'],
    defaultProps: {
      mapType: 'us',
      displayMode: 'bubble',
    },
    smartTitlePattern: /\w+ by \w+|Map/i,
    pbiVisualType: 'filledMap',
    implemented: true,
    cssSpecNumber: 20,
  },
  {
    id: 'mapChoropleth',
    displayName: 'Map (Choropleth)',
    category: 'map',
    dragSourceId: 'visual-source-mapChoropleth',
    supportedProps: ['geoDimension', 'metric', 'mapType', 'displayMode'],
    defaultProps: {
      mapType: 'us',
      displayMode: 'choropleth',
    },
    smartTitlePattern: /\w+ by \w+|Map|Choropleth/i,
    pbiVisualType: 'filledMap',
    implemented: true,
    cssSpecNumber: 21,
  },

  // === PIE CHARTS (CSS #22-23) ===
  {
    id: 'pie',
    displayName: 'Pie',
    category: 'pie',
    dragSourceId: 'visual-source-pie',
    supportedProps: ['dimension', 'metric', 'topN', 'sort', 'showOther'],
    defaultProps: {
      topN: 6,
      sort: 'desc',
      showOther: true,
    },
    smartTitlePattern: /\w+ by \w+|Distribution/i,
    pbiVisualType: 'pieChart',
    implemented: true,
    cssSpecNumber: 22,
  },
  {
    id: 'donut',
    displayName: 'Donut',
    category: 'pie',
    dragSourceId: 'visual-source-donut',
    supportedProps: ['dimension', 'metric', 'topN', 'sort', 'showOther'],
    defaultProps: {
      topN: 6,
      sort: 'desc',
      showOther: true,
    },
    smartTitlePattern: /\w+ by \w+|Distribution/i,
    pbiVisualType: 'donutChart',
    implemented: true,
    cssSpecNumber: 23,
  },

  // === SCATTER (CSS #25) ===
  {
    id: 'scatter',
    displayName: 'Scatter',
    category: 'comparison',
    dragSourceId: 'visual-source-scatter',
    supportedProps: ['dimension', 'xMetric', 'yMetric', 'sizeMetric'],
    defaultProps: {},
    smartTitlePattern: /\w+ vs \w+|Scatter/i,
    pbiVisualType: 'scatterChart',
    implemented: true,
    cssSpecNumber: 25,
  },

  // === TABLE (CSS #27) ===
  {
    id: 'table',
    displayName: 'Table',
    category: 'table',
    dragSourceId: 'visual-source-table',
    supportedProps: ['columns', 'maxRows'],
    defaultProps: {
      maxRows: 25,
    },
    smartTitlePattern: /\w+ Details|Table/i,
    pbiVisualType: 'tableEx',
    implemented: true,
    cssSpecNumber: 27,
  },

  // === TREEMAP (CSS #28) ===
  {
    id: 'treemap',
    displayName: 'Treemap',
    category: 'pie',
    dragSourceId: 'visual-source-treemap',
    supportedProps: ['dimension', 'metric', 'topN', 'sort'],
    defaultProps: {
      topN: 'All',
      sort: 'desc',
    },
    smartTitlePattern: /\w+ by \w+|Treemap/i,
    pbiVisualType: 'treemap',
    implemented: true,
    cssSpecNumber: 28,
  },

  // === WATERFALL (CSS #29) ===
  {
    id: 'waterfall',
    displayName: 'Waterfall',
    category: 'bar',
    dragSourceId: 'visual-source-waterfall',
    supportedProps: ['dimension', 'metric'],
    defaultProps: {},
    smartTitlePattern: /\w+ Waterfall|Waterfall/i,
    pbiVisualType: 'waterfallChart',
    implemented: true,
    cssSpecNumber: 29,
  },
];

/**
 * Get all implemented charts for testing
 */
export const getImplementedCharts = (): ChartDefinition[] =>
  CHART_DEFINITIONS.filter((c) => c.implemented);

/**
 * Get all partial/unimplemented charts
 */
export const getPartialCharts = (): ChartDefinition[] =>
  CHART_DEFINITIONS.filter((c) => !c.implemented);

/**
 * Get chart definition by ID
 */
export const getChartById = (id: string): ChartDefinition | undefined =>
  CHART_DEFINITIONS.find((c) => c.id === id);

/**
 * Get charts by category
 */
export const getChartsByCategory = (category: ChartCategory): ChartDefinition[] =>
  CHART_DEFINITIONS.filter((c) => c.category === category);
