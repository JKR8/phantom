/**
 * PBI CSS Classes
 *
 * CSS class definitions matching Power BI UI Kit 2.0
 * These can be used directly as React inline styles or with CSS-in-JS libraries.
 *
 * Source: docs/power-bi-chart-css.md
 */

import { PBI_CSS_TOKENS } from './pbi-css-tokens';
import type { CSSProperties } from 'react';

const { colors, typography, spacing } = PBI_CSS_TOKENS;

/**
 * Chart container styles - common to all chart types
 */
export const PBI_CHART_CONTAINER: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: `${spacing[12]}px`,
  padding: `${spacing[16]}px`,
  isolation: 'isolate',
  position: 'relative',
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
};

/**
 * Chart content area - flex container for chart body
 */
export const PBI_CHART_CONTENT: CSSProperties = {
  display: 'flex',
  flex: '1 0 0',
  minHeight: '1px',
  minWidth: '1px',
  width: '100%',
};

/**
 * Chart heading container
 */
export const PBI_CHART_HEADING: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: `${spacing[16]}px`,
  isolation: 'isolate',
  alignItems: 'flex-start',
  position: 'relative',
  width: '100%',
};

/**
 * Chart title text
 */
export const PBI_CHART_TITLE: CSSProperties = {
  fontFamily: typography.chartTitle.fontFamily,
  fontWeight: typography.chartTitle.fontWeight,
  fontSize: `${typography.chartTitle.fontSize}px`,
  lineHeight: `${typography.chartTitle.lineHeight}px`,
  color: colors.text.primary,
};

/**
 * Legend container - horizontal
 */
export const PBI_LEGEND_HORIZONTAL: CSSProperties = {
  display: 'flex',
  gap: `${spacing[8]}px`,
  alignItems: 'center',
};

/**
 * Legend container - stacked (vertical)
 */
export const PBI_LEGEND_STACKED: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: `${spacing[8]}px`,
  alignItems: 'flex-start',
  justifyContent: 'center',
};

/**
 * Legend title text
 */
export const PBI_LEGEND_TITLE: CSSProperties = {
  fontFamily: typography.legendTitle.fontFamily,
  fontWeight: typography.legendTitle.fontWeight,
  fontSize: `${typography.legendTitle.fontSize}px`,
  lineHeight: `${typography.legendTitle.lineHeight}px`,
  color: colors.text.tertiary,
  whiteSpace: 'nowrap',
};

/**
 * Legend items container
 */
export const PBI_LEGEND_ITEMS: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
};

/**
 * Legend value item (dot + text)
 */
export const PBI_LEGEND_VALUE: CSSProperties = {
  display: 'flex',
  gap: `${spacing[4]}px`,
  height: '20px',
  alignItems: 'center',
  padding: `0 ${spacing[4]}px`,
};

/**
 * Legend color dot
 */
export const PBI_LEGEND_DOT: CSSProperties = {
  width: '12px',
  height: '12px',
  borderRadius: '100px',
  flexShrink: 0,
};

/**
 * Legend value text
 */
export const PBI_LEGEND_VALUE_TEXT: CSSProperties = {
  fontFamily: typography.legendValue.fontFamily,
  fontWeight: typography.legendValue.fontWeight,
  fontSize: `${typography.legendValue.fontSize}px`,
  lineHeight: `${typography.legendValue.lineHeight}px`,
  color: colors.text.tertiary,
  whiteSpace: 'nowrap',
};

/**
 * Sequential (gradient) legend container
 */
export const PBI_LEGEND_SEQUENTIAL: CSSProperties = {
  display: 'flex',
  gap: `${spacing[8]}px`,
  alignItems: 'center',
  width: '272px',
};

/**
 * Sequential legend gradient bar
 */
export const PBI_LEGEND_GRADIENT: CSSProperties = {
  flex: '1 0 0',
  height: '24px',
  minWidth: '1px',
  minHeight: '1px',
  background: `linear-gradient(to right, ${colors.brand[50]}, ${colors.brand[500]})`,
};

/**
 * Y-axis container
 */
export const PBI_Y_AXIS: CSSProperties = {
  display: 'flex',
  gap: '3px',
  height: '217px',
  alignItems: 'center',
};

/**
 * Y-axis title (rotated)
 */
export const PBI_Y_AXIS_TITLE: CSSProperties = {
  fontFamily: typography.axisTitle.fontFamily,
  fontWeight: typography.axisTitle.fontWeight,
  fontSize: `${typography.axisTitle.fontSize}px`,
  lineHeight: `${typography.axisTitle.lineHeight}px`,
  color: colors.text.primary,
  textAlign: 'center',
  transform: 'rotate(-90deg)',
  width: '217px',
  whiteSpace: 'pre-wrap',
};

/**
 * Y-axis values container
 */
export const PBI_Y_AXIS_VALUES: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  fontFamily: typography.axisValue.fontFamily,
  fontWeight: typography.axisValue.fontWeight,
  fontSize: `${typography.axisValue.fontSize}px`,
  lineHeight: `${typography.axisValue.lineHeight}px`,
  color: colors.text.quaternary,
  textAlign: 'right',
};

/**
 * X-axis container
 */
export const PBI_X_AXIS: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '3px',
  alignItems: 'center',
  fontSize: `${typography.axisValue.fontSize}px`,
  lineHeight: `${typography.axisValue.lineHeight}px`,
};

/**
 * X-axis values container
 */
export const PBI_X_AXIS_VALUES: CSSProperties = {
  display: 'flex',
  width: '100%',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  fontFamily: typography.axisValue.fontFamily,
  fontWeight: typography.axisValue.fontWeight,
  fontSize: `${typography.axisValue.fontSize}px`,
  lineHeight: `${typography.axisValue.lineHeight}px`,
  color: colors.text.quaternary,
};

/**
 * X-axis title
 */
export const PBI_X_AXIS_TITLE: CSSProperties = {
  fontFamily: typography.axisTitle.fontFamily,
  fontWeight: typography.axisTitle.fontWeight,
  fontSize: `${typography.axisTitle.fontSize}px`,
  lineHeight: `${typography.axisTitle.lineHeight}px`,
  color: colors.text.primary,
  textAlign: 'center',
  width: '100%',
  whiteSpace: 'pre-wrap',
};

/**
 * Bar row container
 */
export const PBI_BAR_ROW: CSSProperties = {
  display: 'flex',
  flex: '1 0 0',
  gap: `${spacing[4]}px`,
  alignItems: 'center',
  minHeight: '1px',
  minWidth: '1px',
  width: '100%',
};

/**
 * Bar dimension label
 */
export const PBI_BAR_DIMENSION: CSSProperties = {
  fontFamily: typography.dimensionLabel.fontFamily,
  fontWeight: typography.dimensionLabel.fontWeight,
  fontSize: `${typography.dimensionLabel.fontSize}px`,
  lineHeight: `${typography.dimensionLabel.lineHeight}px`,
  color: colors.text.quaternary,
  width: '72px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/**
 * Bar container (holds the bar rectangle)
 */
export const PBI_BAR_CONTAINER: CSSProperties = {
  flex: '1 0 0',
  height: '100%',
  minHeight: '1px',
  minWidth: '1px',
  position: 'relative',
};

/**
 * Bar background (optional, for Lollipop or percent charts)
 */
export const PBI_BAR_BACKGROUND: CSSProperties = {
  position: 'absolute',
  background: colors.background.tertiary,
  inset: 0,
};

/**
 * Bar data label (right of bar)
 */
export const PBI_BAR_LABEL: CSSProperties = {
  position: 'absolute',
  left: '4px',
  top: '50%',
  transform: 'translateY(-50%)',
  fontFamily: typography.dataLabel.fontFamily,
  fontWeight: typography.dataLabel.fontWeight,
  fontSize: `${typography.dataLabel.fontSize}px`,
  lineHeight: `${typography.dataLabel.lineHeight}px`,
  color: colors.text.primary,
  whiteSpace: 'nowrap',
};

/**
 * Bar data label (inside bar, white text)
 */
export const PBI_BAR_LABEL_INSIDE: CSSProperties = {
  ...PBI_BAR_LABEL,
  color: colors.text.white,
};

/**
 * Table header cell
 */
export const PBI_TABLE_HEADER: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  height: '24px',
  padding: `0 ${spacing[4]}px`,
  borderBottom: `1px solid ${colors.border.secondary}`,
};

/**
 * Table header text
 */
export const PBI_TABLE_HEADER_TEXT: CSSProperties = {
  fontFamily: typography.tableHeader.fontFamily,
  fontWeight: typography.tableHeader.fontWeight,
  fontSize: `${typography.tableHeader.fontSize}px`,
  lineHeight: `${typography.tableHeader.lineHeight}px`,
  color: colors.text.tertiary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

/**
 * Table data cell
 */
export const PBI_TABLE_CELL: CSSProperties = {
  display: 'flex',
  height: '40px',
  padding: `0 ${spacing[4]}px`,
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${colors.border.secondary}`,
  isolation: 'isolate',
};

/**
 * Table cell text
 */
export const PBI_TABLE_CELL_TEXT: CSSProperties = {
  fontFamily: typography.tableCell.fontFamily,
  fontWeight: typography.tableCell.fontWeight,
  fontSize: `${typography.tableCell.fontSize}px`,
  lineHeight: `${typography.tableCell.lineHeight}px`,
  color: colors.text.tertiary,
  flex: '1 0 0',
  minWidth: '1px',
};

/**
 * KPI card container
 */
export const PBI_KPI_CARD: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  background: colors.background.primary,
  border: `1px solid ${colors.border.secondary}`,
  borderRadius: '8px',
  overflow: 'clip',
};

/**
 * KPI card content area
 */
export const PBI_KPI_CARD_CONTENT: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: `${spacing[4]}px`,
  padding: `${spacing[16]}px`,
};

/**
 * KPI card title
 */
export const PBI_KPI_CARD_TITLE: CSSProperties = {
  fontFamily: typography.kpiLabel.fontFamily,
  fontWeight: typography.kpiLabel.fontWeight,
  fontSize: `${typography.kpiLabel.fontSize}px`,
  lineHeight: `${typography.kpiLabel.lineHeight}px`,
  color: colors.text.tertiary,
};

/**
 * KPI card value
 */
export const PBI_KPI_CARD_VALUE: CSSProperties = {
  fontFamily: typography.kpiValue.fontFamily,
  fontWeight: typography.kpiValue.fontWeight,
  fontSize: `${typography.kpiValue.fontSize}px`,
  lineHeight: `${typography.kpiValue.lineHeight}px`,
  color: colors.text.primary,
};

/**
 * KPI card divider
 */
export const PBI_KPI_CARD_DIVIDER: CSSProperties = {
  height: '1px',
  width: '100%',
  background: colors.border.secondary,
};

/**
 * KPI indicator container (positive/negative)
 */
export const PBI_KPI_INDICATOR: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '23px',
  padding: `0 ${spacing[4]}px`,
  borderRadius: '4px',
  position: 'relative',
};

/**
 * KPI indicator - positive variant
 */
export const PBI_KPI_INDICATOR_POSITIVE: CSSProperties = {
  ...PBI_KPI_INDICATOR,
  background: colors.background.success,
  color: colors.text.success,
};

/**
 * KPI indicator - negative variant
 */
export const PBI_KPI_INDICATOR_NEGATIVE: CSSProperties = {
  ...PBI_KPI_INDICATOR,
  background: colors.background.danger,
  color: colors.text.danger,
};

/**
 * KPI indicator value text
 */
export const PBI_KPI_INDICATOR_VALUE: CSSProperties = {
  fontFamily: typography.kpiIndicatorValue.fontFamily,
  fontWeight: typography.kpiIndicatorValue.fontWeight,
  fontSize: `${typography.kpiIndicatorValue.fontSize}px`,
  lineHeight: `${typography.kpiIndicatorValue.lineHeight}px`,
};

/**
 * Donut center label container
 */
export const PBI_DONUT_CENTER: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  width: '103px',
};

/**
 * Donut center value
 */
export const PBI_DONUT_CENTER_VALUE: CSSProperties = {
  fontFamily: typography.donutCenter.fontFamily,
  fontWeight: typography.donutCenter.fontWeight,
  fontSize: `${typography.donutCenter.fontSize}px`,
  lineHeight: `${typography.donutCenter.lineHeight}px`,
  color: colors.text.primary,
};

/**
 * Donut center helper text
 */
export const PBI_DONUT_CENTER_HELPER: CSSProperties = {
  fontFamily: typography.axisValue.fontFamily,
  fontWeight: typography.axisValue.fontWeight,
  fontSize: `${typography.axisValue.fontSize}px`,
  lineHeight: `${typography.axisValue.lineHeight}px`,
  color: colors.text.quaternary,
};

/**
 * Gauge value display
 */
export const PBI_GAUGE_VALUE: CSSProperties = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  fontFamily: typography.gaugeValue.fontFamily,
  fontWeight: typography.gaugeValue.fontWeight,
  fontSize: `${typography.gaugeValue.fontSize}px`,
  lineHeight: `${typography.gaugeValue.lineHeight}px`,
  color: colors.text.primary,
  textAlign: 'center',
  whiteSpace: 'nowrap',
};

/**
 * Gauge min/max/target labels
 */
export const PBI_GAUGE_LABEL: CSSProperties = {
  position: 'absolute',
  fontFamily: typography.gaugeLabel.fontFamily,
  fontWeight: typography.gaugeLabel.fontWeight,
  fontSize: `${typography.gaugeLabel.fontSize}px`,
  lineHeight: `${typography.gaugeLabel.lineHeight}px`,
  color: colors.text.primary,
  whiteSpace: 'nowrap',
};

/**
 * Scatter plot dot
 */
export const PBI_SCATTER_DOT: CSSProperties = {
  position: 'absolute',
  borderRadius: '50%',
  transform: 'translate(-50%, -50%)',
};

/**
 * Line chart data point
 */
export const PBI_LINE_DOT: CSSProperties = {
  width: '6px',
  height: '6px',
  borderRadius: '50%',
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
};

/**
 * Line chart data point label
 */
export const PBI_LINE_DOT_LABEL: CSSProperties = {
  position: 'absolute',
  bottom: '13px',
  left: '50%',
  transform: 'translate(-50%, 50%)',
  fontFamily: typography.dataLabel.fontFamily,
  fontWeight: typography.dataLabel.fontWeight,
  fontSize: `${typography.dataLabel.fontSize}px`,
  lineHeight: `${typography.dataLabel.lineHeight}px`,
  color: colors.text.primary,
  textAlign: 'center',
  whiteSpace: 'nowrap',
};

/**
 * Combined CSS classes object for easy import
 */
export const PBI_CSS_CLASSES = {
  // Containers
  chartContainer: PBI_CHART_CONTAINER,
  chartContent: PBI_CHART_CONTENT,
  chartHeading: PBI_CHART_HEADING,
  chartTitle: PBI_CHART_TITLE,

  // Legend
  legendHorizontal: PBI_LEGEND_HORIZONTAL,
  legendStacked: PBI_LEGEND_STACKED,
  legendTitle: PBI_LEGEND_TITLE,
  legendItems: PBI_LEGEND_ITEMS,
  legendValue: PBI_LEGEND_VALUE,
  legendDot: PBI_LEGEND_DOT,
  legendValueText: PBI_LEGEND_VALUE_TEXT,
  legendSequential: PBI_LEGEND_SEQUENTIAL,
  legendGradient: PBI_LEGEND_GRADIENT,

  // Axes
  yAxis: PBI_Y_AXIS,
  yAxisTitle: PBI_Y_AXIS_TITLE,
  yAxisValues: PBI_Y_AXIS_VALUES,
  xAxis: PBI_X_AXIS,
  xAxisTitle: PBI_X_AXIS_TITLE,
  xAxisValues: PBI_X_AXIS_VALUES,

  // Bar chart
  barRow: PBI_BAR_ROW,
  barDimension: PBI_BAR_DIMENSION,
  barContainer: PBI_BAR_CONTAINER,
  barBackground: PBI_BAR_BACKGROUND,
  barLabel: PBI_BAR_LABEL,
  barLabelInside: PBI_BAR_LABEL_INSIDE,

  // Table
  tableHeader: PBI_TABLE_HEADER,
  tableHeaderText: PBI_TABLE_HEADER_TEXT,
  tableCell: PBI_TABLE_CELL,
  tableCellText: PBI_TABLE_CELL_TEXT,

  // KPI Card
  kpiCard: PBI_KPI_CARD,
  kpiCardContent: PBI_KPI_CARD_CONTENT,
  kpiCardTitle: PBI_KPI_CARD_TITLE,
  kpiCardValue: PBI_KPI_CARD_VALUE,
  kpiCardDivider: PBI_KPI_CARD_DIVIDER,
  kpiIndicator: PBI_KPI_INDICATOR,
  kpiIndicatorPositive: PBI_KPI_INDICATOR_POSITIVE,
  kpiIndicatorNegative: PBI_KPI_INDICATOR_NEGATIVE,
  kpiIndicatorValue: PBI_KPI_INDICATOR_VALUE,

  // Donut
  donutCenter: PBI_DONUT_CENTER,
  donutCenterValue: PBI_DONUT_CENTER_VALUE,
  donutCenterHelper: PBI_DONUT_CENTER_HELPER,

  // Gauge
  gaugeValue: PBI_GAUGE_VALUE,
  gaugeLabel: PBI_GAUGE_LABEL,

  // Scatter
  scatterDot: PBI_SCATTER_DOT,

  // Line
  lineDot: PBI_LINE_DOT,
  lineDotLabel: PBI_LINE_DOT_LABEL,
} as const;

export default PBI_CSS_CLASSES;
