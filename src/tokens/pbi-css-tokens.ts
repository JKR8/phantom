/**
 * PBI CSS Tokens
 *
 * Design tokens extracted from Power BI UI Kit 2.0 CSS
 * Source: docs/power-bi-chart-css.md
 *
 * This file serves as the single source of truth for all PBI visual styling values.
 * All components should use these tokens instead of hardcoded values.
 */

import type { PBIHexColor } from '../pbi-constraints/colors';

/**
 * Data visualization category colors (1-9)
 * These are the standard Power BI data colors from the UI Kit 2.0
 */
export const PBI_DATA_VIZ_COLORS = {
  category1: '#118dff' as PBIHexColor,  // Blue
  category2: '#12239e' as PBIHexColor,  // Dark Blue
  category3: '#e66c37' as PBIHexColor,  // Orange
  category4: '#6b007b' as PBIHexColor,  // Purple
  category5: '#e044a7' as PBIHexColor,  // Pink
  category6: '#744ec2' as PBIHexColor,  // Violet
  category7: '#d9b300' as PBIHexColor,  // Gold
  category8: '#d64550' as PBIHexColor,  // Red
  category9: '#e8c600' as PBIHexColor,  // Yellow
} as const;

/**
 * Data visualization colors as an array (for iteration)
 */
export const PBI_DATA_VIZ_COLORS_ARRAY: PBIHexColor[] = [
  PBI_DATA_VIZ_COLORS.category1,
  PBI_DATA_VIZ_COLORS.category2,
  PBI_DATA_VIZ_COLORS.category3,
  PBI_DATA_VIZ_COLORS.category4,
  PBI_DATA_VIZ_COLORS.category5,
  PBI_DATA_VIZ_COLORS.category6,
  PBI_DATA_VIZ_COLORS.category7,
  PBI_DATA_VIZ_COLORS.category8,
  PBI_DATA_VIZ_COLORS.category9,
];

/**
 * Text colors from PBI UI Kit 2.0
 */
export const PBI_TEXT_COLORS = {
  /** Primary text - headings, callout values */
  primary: '#020617' as PBIHexColor,
  /** Tertiary text - legend titles, table headers */
  tertiary: '#475569' as PBIHexColor,
  /** Quaternary text - axis values, dimensions */
  quaternary: '#64748b' as PBIHexColor,
  /** White text - for dark backgrounds, inside bars */
  white: '#ffffff' as PBIHexColor,
  /** Success text - positive variance indicators */
  success: '#047857' as PBIHexColor,
  /** Danger text - negative variance indicators */
  danger: '#dc2626' as PBIHexColor,
} as const;

/**
 * Background colors from PBI UI Kit 2.0
 */
export const PBI_BACKGROUND_COLORS = {
  /** Primary background - card, chart backgrounds */
  primary: '#ffffff' as PBIHexColor,
  /** Tertiary background - bar chart backgrounds, alternating rows */
  tertiary: '#f1f5f9' as PBIHexColor,
  /** Success background - positive indicator pill */
  success: '#ecfdf5' as PBIHexColor,
  /** Danger background - negative indicator pill */
  danger: '#fef2f2' as PBIHexColor,
} as const;

/**
 * Border colors from PBI UI Kit 2.0
 */
export const PBI_BORDER_COLORS = {
  /** Secondary border - table dividers, card borders */
  secondary: '#e2e8f0' as PBIHexColor,
} as const;

/**
 * Brand colors for sequential legends
 */
export const PBI_BRAND_COLORS = {
  /** Brand 50 - sequential legend min */
  50: '#eff6ff' as PBIHexColor,
  /** Brand 500 - sequential legend max */
  500: '#3b82f6' as PBIHexColor,
} as const;

/**
 * Typography style definitions from PBI UI Kit 2.0
 * All use Inter font family with specific sizes and weights
 */
export const PBI_TYPOGRAPHY = {
  /** Chart titles - 16px/19px Semibold */
  chartTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 19,
  },
  /** Legend titles - 13px/16px Semibold */
  legendTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 16,
  },
  /** Legend values - 13px/16px Regular */
  legendValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 16,
  },
  /** Axis titles - 12px/14px Semibold */
  axisTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 14,
  },
  /** Axis values - 12px/14px Regular */
  axisValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 14,
  },
  /** KPI card value - 32px/38px Semibold */
  kpiValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 32,
    fontWeight: 600,
    lineHeight: 38,
  },
  /** KPI card label - 14px/17px Regular */
  kpiLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 17,
  },
  /** Donut center value - 21px/26px Semibold */
  donutCenter: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 21,
    fontWeight: 600,
    lineHeight: 26,
  },
  /** Table header - 13px/16px Semibold */
  tableHeader: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 16,
  },
  /** Table cell - 13px/16px Regular */
  tableCell: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 16,
  },
  /** Bar/dimension label - 12px/14px Regular */
  dimensionLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 14,
  },
  /** Data label - 12px/14px Regular */
  dataLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 14,
  },
  /** KPI indicator value - 16px/19px Regular */
  kpiIndicatorValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 19,
  },
  /** Gauge value - 21px/26px Regular */
  gaugeValue: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 21,
    fontWeight: 400,
    lineHeight: 26,
  },
  /** Gauge min/max/target - 11px/13px Regular */
  gaugeLabel: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 13,
  },
} as const;

/**
 * Spacing values from PBI UI Kit 2.0
 */
export const PBI_SPACING = {
  /** 4px - small gaps, between legend items */
  4: 4,
  /** 8px - medium gaps, between legend dot and text */
  8: 8,
  /** 12px - standard gaps, between chart elements */
  12: 12,
  /** 16px - large gaps, chart padding */
  16: 16,
} as const;

/**
 * Dimension values from PBI UI Kit 2.0
 */
export const PBI_DIMENSIONS = {
  /** Default chart dimensions */
  chart: {
    defaultWidth: 500,
    defaultHeight: 300,
  },
  /** Legend dimensions */
  legend: {
    dotSize: 12,
    itemHeight: 20,
    gradientHeight: 24,
    gradientWidth: 272,
  },
  /** Bar chart dimensions */
  bar: {
    labelWidth: 72,
    innerPadding: '11.84%',
  },
  /** Table dimensions */
  table: {
    headerHeight: 24,
    cellHeight: 40,
    columnFirstWidth: 286,
  },
  /** KPI card dimensions */
  kpiCard: {
    defaultWidth: 328,
    indicatorHeight: 23,
    arrowSize: 20,
  },
  /** Donut chart dimensions */
  donut: {
    innerRingSize: 104,
    centerLabelWidth: 103,
  },
  /** Pie chart dimensions */
  pie: {
    defaultSize: 150,
  },
  /** Scatter plot dot sizes */
  scatterDot: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
  },
  /** Gauge dimensions */
  gauge: {
    arcWidth: 320,
    arcHeight: 171,
  },
  /** Axis dimensions */
  axis: {
    yAxisTitleWidth: 18,
    yAxisHeight: 217,
    xAxisWidth: 305,
    tickGap: 3,
  },
  /** Line chart data point */
  linePoint: {
    dotSize: 6,
  },
} as const;

/**
 * Border radius values from PBI UI Kit 2.0
 */
export const PBI_RADIUS = {
  /** 4px - KPI indicator pills */
  4: 4,
  /** 8px - card containers */
  8: 8,
  /** 100px - legend dots (circular) */
  full: 100,
} as const;

/**
 * Combined PBI CSS Tokens object for easy import
 */
export const PBI_CSS_TOKENS = {
  colors: {
    dataViz: PBI_DATA_VIZ_COLORS,
    dataVizArray: PBI_DATA_VIZ_COLORS_ARRAY,
    text: PBI_TEXT_COLORS,
    background: PBI_BACKGROUND_COLORS,
    border: PBI_BORDER_COLORS,
    brand: PBI_BRAND_COLORS,
  },
  typography: PBI_TYPOGRAPHY,
  spacing: PBI_SPACING,
  dimensions: PBI_DIMENSIONS,
  radius: PBI_RADIUS,
} as const;

/**
 * Type for typography style names
 */
export type PBITypographyStyle = keyof typeof PBI_TYPOGRAPHY;

/**
 * Type for data visualization category index (1-9)
 */
export type PBIDataVizCategoryIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Get a data visualization color by index (1-based)
 */
export function getDataVizColor(index: PBIDataVizCategoryIndex): PBIHexColor {
  return PBI_DATA_VIZ_COLORS_ARRAY[index - 1];
}

/**
 * Get typography style by name
 */
export function getTypographyStyle(name: PBITypographyStyle) {
  return PBI_TYPOGRAPHY[name];
}

/**
 * Check if a color is a valid PBI data viz color
 */
export function isValidDataVizColor(color: string): boolean {
  return PBI_DATA_VIZ_COLORS_ARRAY.includes(color as PBIHexColor);
}

export default PBI_CSS_TOKENS;
