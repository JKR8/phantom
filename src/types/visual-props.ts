/**
 * Visual Props Types
 *
 * Typed props interfaces for each visual type in Phantom.
 * These define the "Phantom-friendly" props (UI layer) that map to PBI constraints.
 *
 * Props are optional by default for backward compatibility.
 */

import type { PBIHexColor } from '../pbi-constraints/colors';
import type { PBIFontFamily, PBIFontSize } from '../pbi-constraints/fonts';
import type {
  PBILegendPosition,
  PBIAlignment,
  PBILabelPosition,
  PBIGridlineStyle,
  PBILineStyle,
  PBILineChartType,
  PBISlicerMode,
  PBIDisplayUnits,
  PBIMarkerShape,
} from '../pbi-constraints/layout';
import type { VisualType } from './index';

// ============================================================================
// Common PBI Styling Props (shared across visual types)
// ============================================================================

/**
 * Title configuration for visuals
 */
export interface PBITitleProps {
  show?: boolean;
  text?: string;
  fontFamily?: PBIFontFamily;
  fontSize?: PBIFontSize;
  fontColor?: PBIHexColor;
  alignment?: PBIAlignment;
  backgroundColor?: PBIHexColor;
}

/**
 * Legend configuration
 */
export interface PBILegendProps {
  show?: boolean;
  position?: PBILegendPosition;
  fontSize?: PBIFontSize;
  fontColor?: PBIHexColor;
  showTitle?: boolean;
  titleText?: string;
}

/**
 * Category axis (X-axis for column, Y-axis for bar) configuration
 */
export interface PBICategoryAxisProps {
  show?: boolean;
  showAxisTitle?: boolean;
  titleText?: string;
  labelFontSize?: PBIFontSize;
  labelFontColor?: PBIHexColor;
  innerPadding?: number;
  preferredCategoryWidth?: number;
}

/**
 * Value axis (Y-axis for column, X-axis for bar) configuration
 */
export interface PBIValueAxisProps {
  show?: boolean;
  showAxisTitle?: boolean;
  titleText?: string;
  labelFontSize?: PBIFontSize;
  labelFontColor?: PBIHexColor;
  gridlineShow?: boolean;
  gridlineColor?: PBIHexColor;
  gridlineStyle?: PBIGridlineStyle;
  start?: number;
  end?: number;
}

/**
 * Data point (bar/slice) styling
 */
export interface PBIDataPointProps {
  fill?: PBIHexColor;
  fillTransparency?: number;
}

/**
 * Data labels configuration
 */
export interface PBIDataLabelsProps {
  show?: boolean;
  position?: PBILabelPosition;
  fontSize?: PBIFontSize;
  fontColor?: PBIHexColor;
  displayUnits?: PBIDisplayUnits;
  precision?: number;
}

/**
 * Line styling props (for line, area, combo charts)
 */
export interface PBILineStylesProps {
  lineStyle?: PBILineStyle;
  lineChartType?: PBILineChartType;
  strokeWidth?: number;
  showMarker?: boolean;
  markerSize?: number;
  markerShape?: PBIMarkerShape;
}

// ============================================================================
// Phantom Visual Props (UI-friendly interfaces)
// ============================================================================

/**
 * Bar/Column Chart props
 */
export interface BarChartPhantomProps {
  /** Field name from scenario (dimension) */
  dimension?: string;
  /** Measure name */
  metric?: string;
  /** Optional grouping field (for stacked/grouped) */
  series?: string;
  /** Limit to top N items */
  topN?: number | 'All';
  /** Sort direction */
  sort?: 'asc' | 'desc' | 'alpha';
  /** Show "Other" for items beyond topN */
  showOther?: boolean;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  // PBI styling (optional, uses defaults if omitted)
  dataPoint?: Partial<PBIDataPointProps>;
  title?: Partial<PBITitleProps>;
  legend?: Partial<PBILegendProps>;
  categoryAxis?: Partial<PBICategoryAxisProps>;
  valueAxis?: Partial<PBIValueAxisProps>;
  labels?: Partial<PBIDataLabelsProps>;
}

/**
 * Line Chart props
 */
export interface LineChartPhantomProps {
  /** Time/category dimension */
  dimension?: string;
  /** Measure name */
  metric?: string;
  /** Series grouping field */
  series?: string;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  /** Time grain for time series */
  timeGrain?: 'month' | 'quarter' | 'year';
  /** Comparison lines to show */
  comparison?: 'none' | 'pl' | 'py' | 'both';
  // PBI styling
  dataPoint?: Partial<PBIDataPointProps>;
  title?: Partial<PBITitleProps>;
  legend?: Partial<PBILegendProps>;
  categoryAxis?: Partial<PBICategoryAxisProps>;
  valueAxis?: Partial<PBIValueAxisProps>;
  labels?: Partial<PBIDataLabelsProps>;
  lineStyles?: Partial<PBILineStylesProps>;
}

/**
 * Area Chart props (extends line)
 */
export interface AreaChartPhantomProps extends LineChartPhantomProps {
  /** Area fill opacity */
  fillOpacity?: number;
}

/**
 * Combo Chart props
 */
export interface ComboChartPhantomProps {
  /** Time/category dimension */
  dimension?: string;
  /** Metric for bars/columns */
  barMetric?: string;
  /** Metric for line (optional, defaults to barMetric) */
  lineMetric?: string;
  /** Legacy: single metric */
  metric?: string;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  // PBI styling
  title?: Partial<PBITitleProps>;
  legend?: Partial<PBILegendProps>;
  categoryAxis?: Partial<PBICategoryAxisProps>;
  valueAxis?: Partial<PBIValueAxisProps>;
  lineStyles?: Partial<PBILineStylesProps>;
}

/**
 * Pie/Donut Chart props
 */
export interface PieChartPhantomProps {
  /** Category dimension */
  dimension?: string;
  /** Measure name */
  metric?: string;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  /** Show percentages */
  showPercentage?: boolean;
  /** Inner radius for donut (0 = pie) */
  innerRadius?: number;
  // PBI styling
  title?: Partial<PBITitleProps>;
  legend?: Partial<PBILegendProps>;
  labels?: Partial<PBIDataLabelsProps>;
}

/**
 * Card/KPI Visual props
 */
export interface CardPhantomProps {
  /** Measure name */
  metric?: string;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  /** Display label */
  label?: string;
  /** Color index for accent bar */
  colorIndex?: number;
  /** Explicit accent color (overrides colorIndex) */
  accentColor?: PBIHexColor;
  // Variance display
  showVariance?: boolean;
  /** Prior Year variance metric */
  varianceMetricPY?: string;
  /** Plan variance metric */
  varianceMetricPL?: string;
  /** Goal text for KPI visual */
  goalText?: string;
  /** Goal value for KPI comparison */
  goalValue?: number;
}

/**
 * Multi-Row Card props
 */
export interface MultiRowCardPhantomProps {
  /** Category dimension */
  dimension?: string;
  /** Measure name */
  metric?: string;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  /** Maximum rows to display */
  maxRows?: number;
}

/**
 * Slicer props
 */
export interface SlicerPhantomProps {
  /** Field to filter on */
  dimension?: string;
  /** Slicer display mode */
  mode?: PBISlicerMode;
  /** Allow multiple selections */
  multiSelect?: boolean;
  /** Show search box */
  showSearch?: boolean;
  /** Show select all option */
  showSelectAll?: boolean;
}

/**
 * Date Slicer props
 */
export interface DateSlicerPhantomProps extends SlicerPhantomProps {
  /** Date range type */
  rangeType?: 'relative' | 'absolute' | 'between';
  /** Relative range value (e.g., "Last 30 days") */
  relativeRange?: string;
}

/**
 * Table props
 */
export interface TablePhantomProps {
  /** Columns to display (field names) - alias for columns */
  fields?: string[];
  /** Columns to display (field names) */
  columns?: string[];
  /** Maximum rows to display */
  maxRows?: number;
  /** Enable sorting */
  sortable?: boolean;
  /** Enable filtering */
  filterable?: boolean;
}

/**
 * Matrix props
 */
export interface MatrixPhantomProps {
  /** Row fields */
  rows?: string;
  /** Column fields */
  columns?: string;
  /** Value measures */
  values?: string;
  /** Show row totals */
  showRowTotals?: boolean;
  /** Show column totals */
  showColumnTotals?: boolean;
}

/**
 * Scatter Plot props
 */
export interface ScatterPhantomProps {
  /** X-axis measure */
  xMetric?: string;
  /** Y-axis measure */
  yMetric?: string;
  /** Size measure (bubble size) */
  sizeMetric?: string;
  /** Category for bubble identity/color */
  dimension?: string;
  /** Show trend line */
  showTrendLine?: boolean;
  // PBI styling
  title?: Partial<PBITitleProps>;
  legend?: Partial<PBILegendProps>;
  categoryAxis?: Partial<PBICategoryAxisProps>;
  valueAxis?: Partial<PBIValueAxisProps>;
}

/**
 * Gauge props
 */
export interface GaugePhantomProps {
  /** Current value measure */
  metric?: string;
  /** Target/goal value */
  target?: number;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

/**
 * Treemap props
 */
export interface TreemapPhantomProps {
  /** Category dimension */
  dimension?: string;
  /** Measure name */
  metric?: string;
  /** Secondary grouping */
  group?: string;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  // PBI styling
  title?: Partial<PBITitleProps>;
  legend?: Partial<PBILegendProps>;
  labels?: Partial<PBIDataLabelsProps>;
}

/**
 * Funnel props
 */
export interface FunnelPhantomProps {
  /** Category dimension */
  dimension?: string;
  /** Measure name */
  metric?: string;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  // PBI styling
  title?: Partial<PBITitleProps>;
  labels?: Partial<PBIDataLabelsProps>;
}

/**
 * Waterfall props
 */
export interface WaterfallPhantomProps {
  /** Category dimension */
  dimension?: string;
  /** Measure name */
  metric?: string;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  /** Show total bar */
  showTotal?: boolean;
  // PBI styling
  title?: Partial<PBITitleProps>;
  categoryAxis?: Partial<PBICategoryAxisProps>;
  valueAxis?: Partial<PBIValueAxisProps>;
}

/**
 * Map props
 */
export interface MapPhantomProps {
  /** Location field */
  location?: string;
  /** Size measure (for bubble map) */
  sizeMetric?: string;
  /** Color measure (for choropleth) */
  colorMetric?: string;
  /** Map type */
  mapType?: 'bubble' | 'choropleth';
}

/**
 * Statistical chart props (boxplot, histogram, violin)
 */
export interface StatisticalChartPhantomProps {
  /** Category dimension */
  dimension?: string;
  /** Measure name */
  metric?: string;
  /** For histogram: number of bins */
  bins?: number;
  // PBI styling
  title?: Partial<PBITitleProps>;
  categoryAxis?: Partial<PBICategoryAxisProps>;
  valueAxis?: Partial<PBIValueAxisProps>;
}

// ============================================================================
// Portfolio-specific visual props
// ============================================================================

export interface PortfolioCardPhantomProps {
  metric?: string;
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  label?: string;
  colorIndex?: number;
}

export interface ControversyBarPhantomProps extends BarChartPhantomProps {
  // Inherits all bar chart props
}

export interface PortfolioTablePhantomProps extends TablePhantomProps {
  // Inherits all table props
}

export interface PortfolioHeaderPhantomProps {
  title?: string;
  text?: string;
}

// ============================================================================
// Type mapping utilities
// ============================================================================

/**
 * Map from visual type to its props interface
 */
export interface PhantomPropsMap {
  bar: BarChartPhantomProps;
  column: BarChartPhantomProps;
  stackedBar: BarChartPhantomProps;
  stackedColumn: BarChartPhantomProps;
  line: LineChartPhantomProps;
  area: AreaChartPhantomProps;
  stackedArea: AreaChartPhantomProps;
  combo: ComboChartPhantomProps;
  pie: PieChartPhantomProps;
  donut: PieChartPhantomProps;
  card: CardPhantomProps;
  kpi: CardPhantomProps;
  multiRowCard: MultiRowCardPhantomProps;
  slicer: SlicerPhantomProps;
  table: TablePhantomProps;
  matrix: MatrixPhantomProps;
  scatter: ScatterPhantomProps;
  gauge: GaugePhantomProps;
  treemap: TreemapPhantomProps;
  funnel: FunnelPhantomProps;
  waterfall: WaterfallPhantomProps;
  map: MapPhantomProps;
  boxplot: StatisticalChartPhantomProps;
  histogram: StatisticalChartPhantomProps;
  violin: StatisticalChartPhantomProps;
  regressionScatter: ScatterPhantomProps;
  // Portfolio-specific
  controversyBar: ControversyBarPhantomProps;
  entityTable: PortfolioTablePhantomProps;
  controversyTable: PortfolioTablePhantomProps;
  portfolioCard: PortfolioCardPhantomProps;
  portfolioHeader: PortfolioHeaderPhantomProps;
  dateRangePicker: DateSlicerPhantomProps;
  portfolioHeaderBar: PortfolioHeaderPhantomProps;
  controversyBottomPanel: PortfolioTablePhantomProps;
  justificationSearch: SlicerPhantomProps;
  portfolioKPICards: PortfolioCardPhantomProps;
}

/**
 * Get the props type for a specific visual type
 */
export type PhantomPropsForType<T extends VisualType> = T extends keyof PhantomPropsMap
  ? PhantomPropsMap[T]
  : Record<string, unknown>;

/**
 * Discriminated union for type-safe visual props access
 */
export type PhantomVisualProps =
  | { type: 'bar' | 'column' | 'stackedBar' | 'stackedColumn'; props: BarChartPhantomProps }
  | { type: 'line'; props: LineChartPhantomProps }
  | { type: 'area' | 'stackedArea'; props: AreaChartPhantomProps }
  | { type: 'combo'; props: ComboChartPhantomProps }
  | { type: 'pie' | 'donut'; props: PieChartPhantomProps }
  | { type: 'card' | 'kpi'; props: CardPhantomProps }
  | { type: 'multiRowCard'; props: MultiRowCardPhantomProps }
  | { type: 'slicer'; props: SlicerPhantomProps }
  | { type: 'table'; props: TablePhantomProps }
  | { type: 'matrix'; props: MatrixPhantomProps }
  | { type: 'scatter' | 'regressionScatter'; props: ScatterPhantomProps }
  | { type: 'gauge'; props: GaugePhantomProps }
  | { type: 'treemap'; props: TreemapPhantomProps }
  | { type: 'funnel'; props: FunnelPhantomProps }
  | { type: 'waterfall'; props: WaterfallPhantomProps }
  | { type: 'map'; props: MapPhantomProps }
  | { type: 'boxplot' | 'histogram' | 'violin'; props: StatisticalChartPhantomProps }
  | { type: 'controversyBar'; props: ControversyBarPhantomProps }
  | { type: 'entityTable' | 'controversyTable' | 'controversyBottomPanel'; props: PortfolioTablePhantomProps }
  | { type: 'portfolioCard' | 'portfolioKPICards'; props: PortfolioCardPhantomProps }
  | { type: 'portfolioHeader' | 'portfolioHeaderBar'; props: PortfolioHeaderPhantomProps }
  | { type: 'dateRangePicker'; props: DateSlicerPhantomProps }
  | { type: 'justificationSearch'; props: SlicerPhantomProps };

/**
 * Union of all phantom props types
 */
export type AnyPhantomProps =
  | BarChartPhantomProps
  | LineChartPhantomProps
  | AreaChartPhantomProps
  | ComboChartPhantomProps
  | PieChartPhantomProps
  | CardPhantomProps
  | MultiRowCardPhantomProps
  | SlicerPhantomProps
  | DateSlicerPhantomProps
  | TablePhantomProps
  | MatrixPhantomProps
  | ScatterPhantomProps
  | GaugePhantomProps
  | TreemapPhantomProps
  | FunnelPhantomProps
  | WaterfallPhantomProps
  | MapPhantomProps
  | StatisticalChartPhantomProps
  | PortfolioCardPhantomProps
  | PortfolioTablePhantomProps
  | PortfolioHeaderPhantomProps
  | ControversyBarPhantomProps;

/**
 * Default props for visual types
 */
export const DEFAULT_PHANTOM_PROPS: Partial<Record<VisualType, AnyPhantomProps>> = {
  bar: { sort: 'desc', operation: 'sum' },
  column: { sort: 'desc', operation: 'sum' },
  line: { operation: 'sum' },
  area: { operation: 'sum', fillOpacity: 0.5 },
  pie: { operation: 'sum' },
  donut: { operation: 'sum', innerRadius: 50 },
  card: { operation: 'sum' },
  kpi: { operation: 'sum', goalText: 'vs prev' },
  slicer: { mode: 'Dropdown', multiSelect: false },
  table: { maxRows: 100 },
  scatter: { showTrendLine: false },
  gauge: { min: 0, max: 100 },
  treemap: { operation: 'sum' },
  funnel: { operation: 'sum' },
  waterfall: { operation: 'sum', showTotal: true },
};
