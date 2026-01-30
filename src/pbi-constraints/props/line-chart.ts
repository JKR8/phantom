/**
 * Power BI Line Chart Props
 *
 * Constrained props interface for line and area charts that ensures
 * only PBI-valid values can be used.
 */

import type { PBIHexColor } from '../colors';
import type { PBILineStyle, PBILineChartType, PBIMarkerShape } from '../layout';
import {
  PBIColumnBinding,
  PBIMeasureBinding,
  PBITitleProps,
  PBILegendProps,
  PBICategoryAxisProps,
  PBIValueAxisProps,
  PBIDataLabelsProps,
} from './bar-chart';

/**
 * Line styles configuration
 */
export interface PBILineStylesProps {
  /** Line style (solid, dashed, dotted) */
  lineStyle?: PBILineStyle;
  /** Line chart type (smooth, straight, stepped) */
  lineChartType?: PBILineChartType;
  /** Stroke width (1-10) */
  strokeWidth?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  /** Show markers at data points */
  showMarker?: boolean;
  /** Marker size */
  markerSize?: number;
  /** Marker shape */
  markerShape?: PBIMarkerShape;
}

/**
 * Line data point styling
 */
export interface PBILineDataPointProps {
  /** Line/fill color */
  fill?: PBIHexColor;
}

/**
 * Constrained props for PBI Line Chart (lineChart)
 */
export interface PBILineChartProps {
  // Data binding
  /** Category field binding (typically time/date for x-axis) */
  category: PBIColumnBinding;
  /** Value field binding (measure for y-axis) */
  value: PBIMeasureBinding;
  /** Series field for multi-line charts */
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

  // Line styling
  /** Line styles configuration */
  lineStyles?: PBILineStylesProps;
  /** Data point styling */
  dataPoint?: PBILineDataPointProps;

  // Data labels
  /** Data labels configuration */
  labels?: PBIDataLabelsProps;
}

/**
 * Default values for line chart props
 */
export const DEFAULT_LINE_CHART_PROPS: Partial<PBILineChartProps> = {
  title: {
    show: true,
    fontFamily: 'Segoe UI Semibold',
    fontSize: 12,
    alignment: 'left',
  },
  legend: {
    show: false,
  },
  categoryAxis: {
    show: true,
    showAxisTitle: false,
  },
  valueAxis: {
    show: true,
    showAxisTitle: false,
    gridlineShow: false,
  },
  lineStyles: {
    lineStyle: 'solid',
    lineChartType: 'smooth',
    strokeWidth: 2,
    showMarker: true,
    markerSize: 4,
  },
  labels: {
    show: false,
  },
};

/**
 * Constrained props for PBI Area Chart (areaChart)
 */
export interface PBIAreaChartProps extends PBILineChartProps {
  /** Area fill transparency (0-100) */
  areaTransparency?: number;
}

/**
 * Default values for area chart props
 */
export const DEFAULT_AREA_CHART_PROPS: Partial<PBIAreaChartProps> = {
  ...DEFAULT_LINE_CHART_PROPS,
  areaTransparency: 40,
};
