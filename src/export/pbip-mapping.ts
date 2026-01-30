/**
 * PBIP Mapping Module
 *
 * Centralized mapping functions for converting Phantom visual configurations
 * to Power BI Project (PBIP) query state and visual objects.
 *
 * This module extracts the mapping logic from pbipWriter.ts for better
 * maintainability and testability.
 */

import type { DashboardItem, Scenario, VisualType } from '../types';
import type { DAXMeasure } from './daxGenerator';
import type { PBISchema } from './schemaGenerator';
import { mapFieldToPBIColumn, getFactTableForScenario } from './schemaGenerator';
import { ScenarioFields, ScenarioType } from '../store/semanticLayer';
// PBI_CSS_TOKENS will be used in future for styling validation
// import { PBI_CSS_TOKENS } from '../tokens/pbi-css-tokens';
import { MOKKUP_BRAND_COLORS, MOKKUP_SERIES_COLORS } from '../pbi-constraints/colors';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get measure name from metric and operation
 */
export function getMeasureName(metric: string, operation = 'sum'): string {
  const metricLabel = metric.replace(/PL$/, ' Plan').replace(/PY$/, ' PY');
  const opLabel = getOperationLabel(operation);
  return `${opLabel} ${metricLabel}`.replace(/\s+/g, ' ').trim();
}

/**
 * Get operation label for display
 */
export function getOperationLabel(operation: string): string {
  const op = operation.toLowerCase();
  if (op === 'sum') return 'Total';
  if (op === 'avg' || op === 'average') return 'Avg';
  if (op === 'count') return 'Count of';
  if (op === 'min') return 'Min';
  if (op === 'max') return 'Max';
  return operation.charAt(0).toUpperCase() + operation.slice(1);
}

/**
 * Get default table columns for a scenario
 */
export function getDefaultTableColumns(scenario: ScenarioType): string[] {
  const fields = ScenarioFields[scenario] || [];
  const dimension = fields.find((f) => f.role !== 'Measure' && f.role !== 'Identifier')?.name;
  const measures = fields.filter((f) => f.role === 'Measure').slice(0, 2).map((f) => f.name);
  return [dimension, ...measures].filter(Boolean) as string[];
}

/**
 * Build a query projection for a field
 */
export function buildQueryProjection(
  table: string,
  field: string,
  isMeasure: boolean,
  options?: { active?: boolean; displayName?: string }
): Record<string, unknown> {
  const base: Record<string, unknown> = isMeasure
    ? {
        field: {
          Measure: {
            Expression: { SourceRef: { Entity: table } },
            Property: field,
          },
        },
        queryRef: `${table}.${field}`,
        nativeQueryRef: field,
      }
    : {
        field: {
          Column: {
            Expression: { SourceRef: { Entity: table } },
            Property: field,
          },
        },
        queryRef: `${table}.${field}`,
        nativeQueryRef: field,
      };

  if (options?.active) {
    base.active = true;
  }
  if (options?.displayName) {
    base.displayName = options.displayName;
  }

  return base;
}

/**
 * Build sort definition for visuals
 */
export function buildSortDefinition(
  table: string,
  field: string,
  direction: 'Ascending' | 'Descending' = 'Descending'
): Record<string, unknown> {
  return {
    sort: [
      {
        field: {
          Aggregation: {
            Expression: {
              Column: {
                Expression: { SourceRef: { Entity: table } },
                Property: field,
              },
            },
            Function: 0,
          },
        },
        direction,
      },
    ],
    isDefaultSort: true,
  };
}

/**
 * Create a literal expression
 */
export function makeLiteral(value: string): Record<string, unknown> {
  return { expr: { Literal: { Value: value } } };
}

/**
 * Create a decimal literal
 */
export function makeDecimalLiteral(value: number): Record<string, unknown> {
  return makeLiteral(`${value}D`);
}

/**
 * Create an integer literal
 */
export function makeIntegerLiteral(value: number): Record<string, unknown> {
  return makeLiteral(`${value}L`);
}

/**
 * Create a solid color expression
 */
export function makeSolidColor(color: string): Record<string, unknown> {
  return { solid: { color: makeLiteral(`'${color}'`) } };
}

// ============================================================================
// Query State Mapping
// ============================================================================

export interface QueryStateContext {
  scenario: Scenario;
  measures: DAXMeasure[];
  factTable: string;
  scenarioFields: typeof ScenarioFields[ScenarioType];
}

/**
 * Resolve a dimension field to table/column
 */
function resolveColumn(
  field: string | undefined,
  scenario: Scenario
): { table: string; column: string } | null {
  if (!field) return null;
  const mapping = mapFieldToPBIColumn(scenario, field);
  return { table: mapping.table, column: mapping.column };
}

/**
 * Resolve a metric to table/measure
 */
function resolveMeasure(
  metric: string | undefined,
  operation: string,
  measures: DAXMeasure[],
  factTable: string
): { table: string; measure: string } | null {
  if (!metric) return null;
  const name = getMeasureName(metric, operation);
  if (!measures.some((m) => m.name === name)) return null;
  return { table: factTable, measure: name };
}

/**
 * Resolve a named measure
 */
function resolveNamedMeasure(
  name: string | undefined,
  measures: DAXMeasure[],
  factTable: string
): { table: string; measure: string } | null {
  if (!name) return null;
  if (!measures.some((m) => m.name === name)) return null;
  return { table: factTable, measure: name };
}

/**
 * Maps Phantom visual type + props to PBIP query state.
 * Single source of truth for Phantom → PBIP data binding conversion.
 */
export function mapToPBIPQueryState(
  item: DashboardItem,
  scenario: Scenario,
  measures: DAXMeasure[],
  _schema: PBISchema
): Record<string, unknown> {
  // Cast to Record<string, any> for dynamic property access
  const props = (item.props || {}) as Record<string, any>;
  const operation = (props.operation || 'sum').toString().toLowerCase();
  const factTable = getFactTableForScenario(scenario);
  const scenarioFields = ScenarioFields[scenario as ScenarioType] || [];
  const defaultCategory = scenarioFields.find(
    (f) => f.role === 'Category' || f.role === 'Entity' || f.role === 'Geography'
  )?.name;
  const defaultTime = scenarioFields.find((f) => f.role === 'Time')?.name;

  const queryState: Record<string, unknown> = {};

  // Helper to add KPI variance measures for Retail
  const addRetailKpiMeasures = (metric?: string, op?: string) => {
    if (!metric) return [];
    const metricLabel = metric.charAt(0).toUpperCase() + metric.slice(1);
    const candidates = [
      getMeasureName(`${metric}PY`, op || 'sum'),
      getMeasureName(`${metric}PL`, op || 'sum'),
      `${metricLabel} ΔPY%`,
      `${metricLabel} ΔPL%`,
    ];
    return candidates
      .map((name) => resolveNamedMeasure(name, measures, factTable))
      .filter(Boolean)
      .map((m) => buildQueryProjection(m!.table, m!.measure, true));
  };

  // Special handling for Retail cards with reference labels
  if (item.type === 'card' && scenario === 'Retail') {
    const metric = resolveMeasure(props.metric, operation, measures, factTable);
    if (metric) {
      const projections = [buildQueryProjection(metric.table, metric.measure, true)];
      const metricLabel = (props.metric || '').charAt(0).toUpperCase() + (props.metric || '').slice(1);

      // Add variance measures as reference labels
      const pyPctMeasure = resolveNamedMeasure(`${metricLabel} ΔPY%`, measures, factTable);
      if (pyPctMeasure) {
        projections.push(buildQueryProjection(pyPctMeasure.table, pyPctMeasure.measure, true));
      }

      const plPctMeasure = resolveNamedMeasure(`${metricLabel} ΔPL%`, measures, factTable);
      if (plPctMeasure) {
        projections.push(buildQueryProjection(plPctMeasure.table, plPctMeasure.measure, true));
      }

      queryState.Values = { projections };
    }
    return queryState;
  }

  // Main switch for visual types
  switch (item.type) {
    case 'bar':
    case 'column':
    case 'stackedBar':
    case 'stackedColumn': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField, scenario);
      const metric = resolveMeasure(props.metric, operation, measures, factTable);
      if (dim)
        queryState.Category = {
          projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })],
        };
      if (metric) {
        queryState.Y = {
          projections: [
            buildQueryProjection(metric.table, metric.measure, true, { displayName: metric.measure }),
          ],
        };
        (queryState as Record<string, unknown>)._sortDefinition = { isDefaultSort: true };
      }
      break;
    }

    case 'line':
    case 'area':
    case 'stackedArea': {
      const dimField = props.dimension || defaultTime;
      const dim = resolveColumn(dimField, scenario);
      const metric = resolveMeasure(props.metric, operation, measures, factTable);
      if (dim)
        queryState.Category = {
          projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })],
        };
      if (metric) queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
      break;
    }

    case 'pie':
    case 'donut':
    case 'treemap': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField, scenario);
      const metric = resolveMeasure(props.metric, operation, measures, factTable);
      if (dim)
        queryState.Category = {
          projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })],
        };
      if (metric) queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
      break;
    }

    case 'funnel': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField, scenario);
      const metric = resolveMeasure(props.metric, operation, measures, factTable);
      if (dim)
        queryState.Category = {
          projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })],
        };
      if (metric) {
        queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
        (queryState as Record<string, unknown>)._sortDefinition = buildSortDefinition(
          factTable,
          metric.measure.replace('Total ', '')
        );
      }
      break;
    }

    case 'waterfall': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField, scenario);
      const metric = resolveMeasure(props.metric, operation, measures, factTable);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      if (metric) queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
      break;
    }

    case 'card':
    case 'gauge': {
      const metric = resolveMeasure(props.metric, operation, measures, factTable);
      if (metric) {
        const projections = [buildQueryProjection(metric.table, metric.measure, true)];
        if (scenario === 'Retail') {
          projections.push(...addRetailKpiMeasures(props.metric, operation));
        }
        queryState.Values = { projections };
      }
      break;
    }

    case 'kpi': {
      const metric = resolveMeasure(props.metric, operation, measures, factTable);
      if (metric) {
        queryState.Indicator = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };

        const pyMeasureName = getMeasureName(`${props.metric}PY`, operation);
        const pyMeasure = resolveNamedMeasure(pyMeasureName, measures, factTable);
        if (pyMeasure) {
          queryState.Goal = { projections: [buildQueryProjection(pyMeasure.table, pyMeasure.measure, true)] };
        }

        queryState.TrendLine = { projections: [buildQueryProjection('DateTable', 'Month', false)] };
      }
      break;
    }

    case 'scatter':
    case 'regressionScatter': {
      const x = resolveMeasure(props.xMetric, operation, measures, factTable);
      const y = resolveMeasure(props.yMetric, operation, measures, factTable);
      const size = resolveMeasure(props.sizeMetric, operation, measures, factTable);
      const dim = resolveColumn(props.dimension, scenario);

      if (dim)
        queryState.Category = {
          projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })],
        };
      if (dim) queryState.Series = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      if (size) queryState.Size = { projections: [buildQueryProjection(size.table, size.measure, true)] };
      if (x)
        queryState.X = {
          projections: [buildQueryProjection(x.table, x.measure, true, { active: true })],
        };
      if (y) queryState.Y = { projections: [buildQueryProjection(y.table, y.measure, true)] };
      break;
    }

    case 'combo': {
      const dimField = props.dimension || defaultTime;
      const dim = resolveColumn(dimField, scenario);
      const barMetric = resolveMeasure(props.barMetric || props.metric, operation, measures, factTable);
      const lineMetric = resolveMeasure(props.lineMetric, operation, measures, factTable);

      if (dim)
        queryState.Category = {
          projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })],
        };
      if (barMetric)
        queryState.Y = {
          projections: [buildQueryProjection(barMetric.table, barMetric.measure, true, { displayName: 'Bars' })],
        };
      if (lineMetric)
        queryState.Y2 = {
          projections: [buildQueryProjection(lineMetric.table, lineMetric.measure, true, { displayName: 'Line' })],
        };
      (queryState as Record<string, unknown>)._sortDefinition = { isDefaultSort: true };
      break;
    }

    case 'table': {
      const columns =
        props.columns && props.columns.length > 0
          ? props.columns
          : getDefaultTableColumns(scenario as ScenarioType);
      const projections: Record<string, unknown>[] = [];

      columns.forEach((col: string) => {
        const dimension = resolveColumn(col, scenario);
        if (dimension) {
          projections.push(buildQueryProjection(dimension.table, dimension.column, false));
          return;
        }
        const measure = resolveMeasure(col, operation, measures, factTable);
        if (measure) projections.push(buildQueryProjection(measure.table, measure.measure, true));
      });

      queryState.Values = { projections };
      break;
    }

    case 'matrix': {
      const row = resolveColumn(props.rows, scenario);
      const col = resolveColumn(props.columns, scenario);
      const val = resolveMeasure(props.values, operation, measures, factTable);

      if (row)
        queryState.Rows = {
          projections: [buildQueryProjection(row.table, row.column, false, { active: true })],
        };
      if (col)
        queryState.Columns = {
          projections: [buildQueryProjection(col.table, col.column, false, { active: true })],
        };
      if (val) queryState.Values = { projections: [buildQueryProjection(val.table, val.measure, true)] };
      break;
    }

    case 'slicer':
    case 'dateRangePicker':
    case 'justificationSearch': {
      const dim = resolveColumn(props.dimension || (item.type === 'dateRangePicker' ? 'Date' : undefined), scenario);
      if (dim)
        queryState.Values = {
          projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })],
        };
      break;
    }

    case 'multiRowCard':
    case 'portfolioCard':
    case 'portfolioKPICards': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField, scenario);
      const metric = resolveMeasure(props.metric, operation, measures, factTable);
      const projections: Record<string, unknown>[] = [];

      if (dim) projections.push(buildQueryProjection(dim.table, dim.column, false));
      if (metric) projections.push(buildQueryProjection(metric.table, metric.measure, true));
      if (scenario === 'Retail') {
        projections.push(...addRetailKpiMeasures(props.metric, operation));
      }
      if (projections.length > 0) queryState.Values = { projections };
      break;
    }

    case 'entityTable':
    case 'controversyTable':
    case 'controversyBottomPanel': {
      const columns =
        props.columns && props.columns.length > 0
          ? props.columns
          : getDefaultTableColumns(scenario as ScenarioType);
      const projections: Record<string, unknown>[] = [];

      columns.forEach((col: string) => {
        const dimension = resolveColumn(col, scenario);
        if (dimension) {
          projections.push(buildQueryProjection(dimension.table, dimension.column, false));
          return;
        }
        const measure = resolveMeasure(col, operation, measures, factTable);
        if (measure) projections.push(buildQueryProjection(measure.table, measure.measure, true));
      });

      if (projections.length > 0) queryState.Values = { projections };
      break;
    }

    case 'controversyBar': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField, scenario);
      const metric = resolveMeasure(props.metric, operation, measures, factTable);

      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      if (metric) queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
      break;
    }

    case 'portfolioHeader':
    case 'portfolioHeaderBar':
      // Text visuals - no query state needed
      break;

    default:
      // Unknown type - return empty query state
      break;
  }

  return queryState;
}

// ============================================================================
// Visual Objects Mapping (Styling)
// ============================================================================

/**
 * Maps Phantom props to PBIP visual objects (styling).
 */
export function mapToPBIPVisualObjects(
  item: DashboardItem,
  pbiType: string,
  scenario: Scenario,
  themeColors?: string[]
): Record<string, unknown[]> {
  const objects: Record<string, unknown[]> = {};
  const primaryColor = themeColors && themeColors.length > 0 ? themeColors[0] : '#118DFF';

  // Special handling for textbox visuals
  if (pbiType === 'textbox') {
    const propsAny = (item.props || {}) as Record<string, any>;
    const textContent = item.title || propsAny.title || propsAny.text || '';
    objects.general = [
      {
        properties: {
          paragraphs: {
            expr: {
              Literal: {
                Value: JSON.stringify([
                  {
                    textRuns: [
                      {
                        value: textContent,
                        textStyle: {
                          fontFamily: 'Segoe UI',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        },
                      },
                    ],
                    horizontalTextAlignment: 'left',
                  },
                ]),
              },
            },
          },
        },
      },
    ];
    return objects;
  }

  // Retail-specific styling (Mokkup template)
  if (scenario === 'Retail') {
    return buildRetailVisualObjects(item, pbiType, themeColors);
  }

  // Default styling
  return buildDefaultVisualObjects(item, pbiType, primaryColor);
}

/**
 * Build Retail-specific visual objects (Mokkup template styling)
 */
function buildRetailVisualObjects(
  item: DashboardItem,
  pbiType: string,
  themeColors?: string[]
): Record<string, unknown[]> {
  const objects: Record<string, unknown[]> = {};

  // cardVisual styling
  if (pbiType === 'cardVisual' && item.type === 'card') {
    objects.calloutArea = [{ properties: { size: makeLiteral('60D') } }];

    objects.calloutValue = [
      {
        properties: {
          fontFamily: makeLiteral("'''Segoe UI Bold'', wf_segoe-ui_bold, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('28D'),
          fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textPrimary),
          horizontalAlignment: makeLiteral("'center'"),
          labelDisplayUnits: makeLiteral('1D'),
        },
      },
    ];

    objects.calloutLabel = [
      {
        properties: {
          fontFamily: makeLiteral("'''Segoe UI'', wf_segoe-ui_normal, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('12D'),
          fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textSecondary),
          position: makeLiteral("'aboveValue'"),
          show: makeLiteral('true'),
        },
      },
    ];

    objects.referenceLabelsLayout = [
      {
        properties: {
          position: makeLiteral("'below'"),
          layout: makeLiteral("'vertical'"),
          spacing: makeLiteral('4D'),
        },
      },
    ];

    objects.divider = [
      {
        properties: {
          show: makeLiteral('true'),
          color: makeSolidColor('#F0F0F0'),
          width: makeLiteral('1D'),
        },
      },
    ];

    objects.referenceLabelValue = [
      {
        properties: {
          fontFamily: makeLiteral("'''Segoe UI Semibold'', wf_segoe-ui_semibold, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('12D'),
          labelDisplayUnits: makeLiteral('0D'),
        },
      },
    ];

    objects.referenceLabelTitle = [
      {
        properties: {
          fontFamily: makeLiteral("'''Segoe UI'', wf_segoe-ui_normal, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('11D'),
          fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textSecondary),
          show: makeLiteral('true'),
        },
      },
    ];

    objects.referenceLabelDetail = [
      {
        properties: {
          fontFamily: makeLiteral("'''Segoe UI'', wf_segoe-ui_normal, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('11D'),
          fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textSecondary),
          show: makeLiteral('true'),
        },
      },
    ];

    objects.referenceLabelsBackground = [{ properties: { show: makeLiteral('false') } }];

    objects.cardBackground = [
      {
        properties: {
          color: makeSolidColor(MOKKUP_BRAND_COLORS.background),
          show: makeLiteral('true'),
        },
      },
    ];

    objects.padding = [
      {
        properties: {
          top: makeLiteral('6D'),
          bottom: makeLiteral('6D'),
          left: makeLiteral('10D'),
          right: makeLiteral('10D'),
        },
      },
    ];

    return objects;
  }

  // KPI visual styling
  if (pbiType === 'kpi') {
    const goalText = ((item.props || {}) as Record<string, any>).goalText || 'vs prev';
    const showDistance =
      goalText.toLowerCase().includes('vs') ||
      goalText.toLowerCase().includes('prev') ||
      goalText.toLowerCase() === 'py';

    objects.goals = [
      {
        properties: {
          goalText: makeLiteral(`'${goalText}'`),
          fontSize: makeLiteral('10D'),
          goalFontFamily: makeLiteral("'''Segoe UI'', wf_segoe-ui_normal, helvetica, arial, sans-serif'"),
          goalFontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textSecondary),
          showGoal: makeLiteral('true'),
          direction: makeLiteral("'High is good'"),
          distanceLabel: makeLiteral("'Percent'"),
          distanceFontColor: makeSolidColor(MOKKUP_BRAND_COLORS.success),
          distanceFontFamily: makeLiteral(
            "'''Segoe UI Semibold'', wf_segoe-ui_semibold, helvetica, arial, sans-serif'"
          ),
          showDistance: makeLiteral(showDistance ? 'true' : 'false'),
          titleFontSize: makeLiteral('10D'),
          titleBold: makeLiteral('false'),
          titleItalic: makeLiteral('false'),
          titleUnderline: makeLiteral('false'),
          underline: makeLiteral('false'),
          italic: makeLiteral('false'),
          bold: makeLiteral('false'),
        },
      },
    ];

    objects.indicator = [
      {
        properties: {
          horizontalAlignment: makeLiteral("'left'"),
          verticalAlignment: makeLiteral("'middle'"),
          fontFamily: makeLiteral("'''Segoe UI Bold'', wf_segoe-ui_bold, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('18D'),
          indicatorDisplayUnits: makeLiteral('1D'),
          showIcon: makeLiteral('false'),
          bold: makeLiteral('false'),
          italic: makeLiteral('false'),
          underline: makeLiteral('false'),
        },
      },
    ];

    objects.trendline = [
      {
        properties: {
          transparency: makeLiteral('20D'),
          show: makeLiteral('false'),
        },
      },
    ];

    objects.status = [
      {
        properties: {
          direction: makeLiteral("'Negative'"),
          goodColor: makeSolidColor(MOKKUP_BRAND_COLORS.textPrimary),
          neutralColor: makeSolidColor(MOKKUP_BRAND_COLORS.textPrimary),
          badColor: makeSolidColor(MOKKUP_BRAND_COLORS.textPrimary),
        },
      },
    ];

    objects.lastDate = [{ properties: { show: makeLiteral('false') } }];

    return objects;
  }

  // Slicer styling
  if (pbiType === 'slicer') {
    objects.data = [{ properties: { mode: makeLiteral("'Dropdown'") } }];
    objects.header = [{ properties: { show: makeLiteral('false') } }];
    objects.selection = [{ properties: { strictSingleSelect: makeLiteral('true') } }];
    objects.items = [{ properties: { background: makeSolidColor(MOKKUP_BRAND_COLORS.background) } }];
    return objects;
  }

  // Bar/column chart styling
  if (item.type === 'bar' || item.type === 'column') {
    objects.categoryAxis = [
      {
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('false'),
          innerPadding: makeLiteral('62.5L'),
          preferredCategoryWidth: makeLiteral('20D'),
        },
      },
    ];

    objects.valueAxis = [
      {
        properties: {
          show: makeLiteral('false'),
          showAxisTitle: makeLiteral('false'),
          end: makeLiteral('null'),
          invertAxis: makeLiteral('false'),
          gridlineShow: makeLiteral('true'),
        },
      },
    ];

    objects.legend = [
      {
        properties: {
          show: makeLiteral('false'),
          showGradientLegend: makeLiteral('false'),
          position: makeLiteral("'Top'"),
        },
      },
    ];

    objects.labels = [
      {
        properties: {
          show: makeLiteral('true'),
          labelPosition: makeLiteral("'InsideEnd'"),
          enableTitleDataLabel: makeLiteral('false'),
          fontSize: makeLiteral('8D'),
        },
      },
    ];

    objects.dataPoint = [
      {
        properties: {
          fill: makeSolidColor(MOKKUP_BRAND_COLORS.primary),
          fillTransparency: makeLiteral('0D'),
        },
      },
      { properties: { fill: makeSolidColor(MOKKUP_BRAND_COLORS.primary) } },
    ];

    return objects;
  }

  // Line/area chart styling
  if (item.type === 'line' || item.type === 'area' || item.type === 'stackedArea') {
    const primaryColor = themeColors && themeColors.length > 0 ? themeColors[0] : '#118DFF';

    objects.categoryAxis = [
      {
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('false'),
          innerPadding: makeLiteral('62.5L'),
        },
      },
    ];

    objects.valueAxis = [
      {
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('false'),
          invertAxis: makeLiteral('false'),
          gridlineShow: makeLiteral('false'),
          gridlineStyle: makeLiteral("'solid'"),
        },
      },
    ];

    objects.legend = [{ properties: { show: makeLiteral('false') } }];

    objects.labels = [
      {
        properties: {
          show: makeLiteral('false'),
          labelPosition: makeLiteral("'Under'"),
          enableTitleDataLabel: makeLiteral('false'),
          fontSize: makeLiteral('8D'),
        },
      },
    ];

    objects.lineStyles = [
      {
        properties: {
          lineStyle: makeLiteral("'solid'"),
          lineChartType: makeLiteral("'smooth'"),
          strokeWidth: makeLiteral('1L'),
          showMarker: makeLiteral('true'),
          markerSize: makeLiteral('4D'),
        },
      },
    ];

    objects.dataPoint = [{ properties: { fill: makeSolidColor(primaryColor) } }];

    objects.title = [
      {
        properties: {
          show: makeLiteral('true'),
          text: makeLiteral(`'${(item.title || '').replace(/'/g, "''")}'`),
          fontColor: makeSolidColor('#252423'),
          fontSize: makeLiteral('12L'),
        },
      },
    ];

    return objects;
  }

  // Pie/donut styling
  if (item.type === 'pie' || item.type === 'donut') {
    objects.legend = [{ properties: { show: makeLiteral('true'), position: makeLiteral("'Top'") } }];
    objects.dataLabels = [{ properties: { show: makeLiteral('false') } }];
    objects.title = [
      {
        properties: {
          show: makeLiteral('true'),
          text: makeLiteral(`'${(item.title || '').replace(/'/g, "''")}'`),
          fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textPrimary),
          fontSize: makeLiteral('12L'),
        },
      },
    ];
    objects.dataPoint = MOKKUP_SERIES_COLORS.map((color, index) => ({
      properties: { fill: makeSolidColor(color) },
      ...(index > 0 ? { selector: { data: [{ dataViewWildcard: { matchingOption: index } }] } } : {}),
    }));

    return objects;
  }

  // Stacked bar/column styling
  if (item.type === 'stackedBar' || item.type === 'stackedColumn') {
    objects.categoryAxis = [
      {
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('false'),
          innerPadding: makeLiteral('62.5L'),
          preferredCategoryWidth: makeLiteral('20D'),
        },
      },
    ];

    objects.valueAxis = [
      {
        properties: {
          show: makeLiteral('false'),
          showAxisTitle: makeLiteral('false'),
          end: makeLiteral('null'),
          invertAxis: makeLiteral('false'),
          gridlineShow: makeLiteral('true'),
        },
      },
    ];

    objects.legend = [
      {
        properties: {
          show: makeLiteral('true'),
          showGradientLegend: makeLiteral('false'),
          position: makeLiteral("'Top'"),
        },
      },
    ];

    objects.labels = [
      {
        properties: {
          show: makeLiteral('true'),
          labelPosition: makeLiteral("'InsideCenter'"),
          enableTitleDataLabel: makeLiteral('false'),
          fontSize: makeLiteral('8D'),
        },
      },
    ];

    objects.dataPoint = MOKKUP_SERIES_COLORS.map((color, index) => ({
      properties: {
        fill: makeSolidColor(color),
        fillTransparency: makeLiteral('0D'),
      },
      ...(index > 0 ? { selector: { data: [{ dataViewWildcard: { matchingOption: index } }] } } : {}),
    }));

    return objects;
  }

  // Default: return basic title styling
  return buildDefaultVisualObjects(item, pbiType, themeColors?.[0] || '#118DFF');
}

/**
 * Build default visual objects styling
 */
function buildDefaultVisualObjects(
  item: DashboardItem,
  pbiType: string,
  _primaryColor: string
): Record<string, unknown[]> {
  const objects: Record<string, unknown[]> = {};

  // Title formatting
  objects.title = [
    {
      properties: {
        show: makeLiteral('true'),
        text: makeLiteral(`'${(item.title || '').replace(/'/g, "''")}'`),
        fontColor: makeSolidColor('#252423'),
        fontSize: makeLiteral('12L'),
      },
    },
  ];

  // Axis formatting for chart types
  const axisTypes: VisualType[] = [
    'bar',
    'column',
    'stackedBar',
    'stackedColumn',
    'line',
    'area',
    'stackedArea',
    'waterfall',
    'scatter',
    'controversyBar',
  ];
  if (axisTypes.includes(item.type)) {
    objects.categoryAxis = [
      {
        properties: {
          fontSize: makeLiteral('9L'),
          fontColor: makeSolidColor('#605E5C'),
        },
      },
    ];
    objects.valueAxis = [
      {
        properties: {
          fontSize: makeLiteral('9L'),
          fontColor: makeSolidColor('#605E5C'),
          gridlineShow: makeLiteral('true'),
          gridlineColor: makeSolidColor('#F3F2F1'),
        },
      },
    ];
  }

  // Legend formatting
  const legendTypes: VisualType[] = ['pie', 'donut', 'stackedBar', 'stackedColumn', 'line', 'area', 'stackedArea'];
  if (legendTypes.includes(item.type)) {
    objects.legend = [
      {
        properties: {
          show: makeLiteral('true'),
          fontSize: makeLiteral('9L'),
          fontColor: makeSolidColor('#605E5C'),
        },
      },
    ];
  }

  // Slicer styling
  if (pbiType === 'slicer') {
    objects.slicer = [{ properties: { slicerType: makeLiteral("'Dropdown'") } }];
  }

  // Pie/donut: hide labels
  if (item.type === 'pie' || item.type === 'donut') {
    objects.dataLabels = [{ properties: { show: makeLiteral('false') } }];
  }

  return objects;
}

/**
 * Re-export getPBIVisualType from layoutConverter for convenience
 */
export { getPBIVisualType } from './layoutConverter';
