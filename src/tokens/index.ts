/**
 * PBI Design Tokens
 *
 * Central export point for all Power BI UI Kit 2.0 design tokens.
 * These tokens are extracted from docs/power-bi-chart-css.md and serve as
 * the single source of truth for visual styling.
 */

// CSS Tokens (colors, typography, spacing, dimensions)
export {
  PBI_CSS_TOKENS,
  PBI_DATA_VIZ_COLORS,
  PBI_DATA_VIZ_COLORS_ARRAY,
  PBI_TEXT_COLORS,
  PBI_BACKGROUND_COLORS,
  PBI_BORDER_COLORS,
  PBI_BRAND_COLORS,
  PBI_TYPOGRAPHY,
  PBI_SPACING,
  PBI_DIMENSIONS,
  PBI_RADIUS,
  getDataVizColor,
  getTypographyStyle,
  isValidDataVizColor,
} from './pbi-css-tokens';
export type { PBITypographyStyle, PBIDataVizCategoryIndex } from './pbi-css-tokens';

// CSS Classes (React inline styles)
export {
  PBI_CSS_CLASSES,
  // Containers
  PBI_CHART_CONTAINER,
  PBI_CHART_CONTENT,
  PBI_CHART_HEADING,
  PBI_CHART_TITLE,
  // Legend
  PBI_LEGEND_HORIZONTAL,
  PBI_LEGEND_STACKED,
  PBI_LEGEND_TITLE,
  PBI_LEGEND_ITEMS,
  PBI_LEGEND_VALUE,
  PBI_LEGEND_DOT,
  PBI_LEGEND_VALUE_TEXT,
  PBI_LEGEND_SEQUENTIAL,
  PBI_LEGEND_GRADIENT,
  // Axes
  PBI_Y_AXIS,
  PBI_Y_AXIS_TITLE,
  PBI_Y_AXIS_VALUES,
  PBI_X_AXIS,
  PBI_X_AXIS_TITLE,
  PBI_X_AXIS_VALUES,
  // Bar chart
  PBI_BAR_ROW,
  PBI_BAR_DIMENSION,
  PBI_BAR_CONTAINER,
  PBI_BAR_BACKGROUND,
  PBI_BAR_LABEL,
  PBI_BAR_LABEL_INSIDE,
  // Table
  PBI_TABLE_HEADER,
  PBI_TABLE_HEADER_TEXT,
  PBI_TABLE_CELL,
  PBI_TABLE_CELL_TEXT,
  // KPI Card
  PBI_KPI_CARD,
  PBI_KPI_CARD_CONTENT,
  PBI_KPI_CARD_TITLE,
  PBI_KPI_CARD_VALUE,
  PBI_KPI_CARD_DIVIDER,
  PBI_KPI_INDICATOR,
  PBI_KPI_INDICATOR_POSITIVE,
  PBI_KPI_INDICATOR_NEGATIVE,
  PBI_KPI_INDICATOR_VALUE,
  // Donut
  PBI_DONUT_CENTER,
  PBI_DONUT_CENTER_VALUE,
  PBI_DONUT_CENTER_HELPER,
  // Gauge
  PBI_GAUGE_VALUE,
  PBI_GAUGE_LABEL,
  // Scatter
  PBI_SCATTER_DOT,
  // Line
  PBI_LINE_DOT,
  PBI_LINE_DOT_LABEL,
} from './pbi-css-classes';
