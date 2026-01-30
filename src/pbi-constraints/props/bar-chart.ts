/**
 * Power BI Bar Chart Props
 *
 * Constrained props interface for bar/column charts that ensures
 * only PBI-valid values can be used.
 */

import type { PBIHexColor } from '../colors';
import type { PBIFontFamily, PBIFontSize } from '../fonts';
import type {
  PBILegendPosition,
  PBIAlignment,
  PBILabelPosition,
  PBIGridlineStyle,
} from '../layout';

/**
 * Data binding for a column field
 */
export interface PBIColumnBinding {
  /** Field name in the data model */
  field: string;
  /** Table name in the semantic model */
  table: string;
}

/**
 * Data binding for a measure field
 */
export interface PBIMeasureBinding extends PBIColumnBinding {
  /** Whether this is a DAX measure (vs calculated column) */
  isMeasure?: boolean;
}

/**
 * Title configuration for visuals
 */
export interface PBITitleProps {
  /** Show the title */
  show: boolean;
  /** Title text */
  text?: string;
  /** Font family */
  fontFamily?: PBIFontFamily;
  /** Font size in points */
  fontSize?: PBIFontSize;
  /** Font color */
  fontColor?: PBIHexColor;
  /** Text alignment */
  alignment?: PBIAlignment;
  /** Background color */
  backgroundColor?: PBIHexColor;
}

/**
 * Legend configuration
 */
export interface PBILegendProps {
  /** Show the legend */
  show: boolean;
  /** Legend position */
  position?: PBILegendPosition;
  /** Font size */
  fontSize?: PBIFontSize;
  /** Font color */
  fontColor?: PBIHexColor;
  /** Show title in legend */
  showTitle?: boolean;
  /** Legend title text */
  titleText?: string;
}

/**
 * Category axis (X-axis for column, Y-axis for bar) configuration
 */
export interface PBICategoryAxisProps {
  /** Show the axis */
  show: boolean;
  /** Show axis title */
  showAxisTitle?: boolean;
  /** Axis title text */
  titleText?: string;
  /** Label font size */
  labelFontSize?: PBIFontSize;
  /** Label font color */
  labelFontColor?: PBIHexColor;
  /** Inner padding between categories */
  innerPadding?: number;
  /** Preferred category width */
  preferredCategoryWidth?: number;
}

/**
 * Value axis (Y-axis for column, X-axis for bar) configuration
 */
export interface PBIValueAxisProps {
  /** Show the axis */
  show: boolean;
  /** Show axis title */
  showAxisTitle?: boolean;
  /** Axis title text */
  titleText?: string;
  /** Label font size */
  labelFontSize?: PBIFontSize;
  /** Label font color */
  labelFontColor?: PBIHexColor;
  /** Show gridlines */
  gridlineShow?: boolean;
  /** Gridline color */
  gridlineColor?: PBIHexColor;
  /** Gridline style */
  gridlineStyle?: PBIGridlineStyle;
  /** Fixed start value */
  start?: number;
  /** Fixed end value */
  end?: number;
}

/**
 * Data point (bar) styling
 */
export interface PBIDataPointProps {
  /** Fill color */
  fill?: PBIHexColor;
  /** Fill transparency (0-100) */
  fillTransparency?: number;
}

/**
 * Data labels configuration
 */
export interface PBIDataLabelsProps {
  /** Show data labels */
  show: boolean;
  /** Label position */
  position?: PBILabelPosition;
  /** Font size */
  fontSize?: PBIFontSize;
  /** Font color */
  fontColor?: PBIHexColor;
  /** Display units (0=Auto, 1=None, 1000=K, 1000000=M, etc) */
  displayUnits?: number;
  /** Decimal places */
  precision?: number;
}

/**
 * Constrained props for PBI Bar Chart (clusteredBarChart) and Column Chart (clusteredColumnChart)
 */
export interface PBIBarChartProps {
  // Data binding
  /** Category field binding (dimension) */
  category: PBIColumnBinding;
  /** Value field binding (measure) */
  value: PBIMeasureBinding;
  /** Series field for grouped/stacked charts */
  series?: PBIColumnBinding;

  // Visual title
  /** Title configuration */
  title?: PBITitleProps;

  // Legend
  /** Legend configuration */
  legend?: PBILegendProps;

  // Axes
  /** Category axis configuration */
  categoryAxis?: PBICategoryAxisProps;
  /** Value axis configuration */
  valueAxis?: PBIValueAxisProps;

  // Data styling
  /** Data point styling */
  dataPoint?: PBIDataPointProps;
  /** Data labels configuration */
  labels?: PBIDataLabelsProps;

  // Layout
  /** Whether this is a horizontal bar chart (true) or vertical column chart (false) */
  horizontal?: boolean;
}

/**
 * Default values for bar chart props
 */
export const DEFAULT_BAR_CHART_PROPS: Partial<PBIBarChartProps> = {
  title: {
    show: false,
  },
  legend: {
    show: false,
    position: 'Top',
  },
  categoryAxis: {
    show: true,
    showAxisTitle: false,
  },
  valueAxis: {
    show: false,
    showAxisTitle: false,
    gridlineShow: true,
  },
  labels: {
    show: true,
    position: 'InsideEnd',
    fontSize: 8,
  },
  horizontal: true,
};
