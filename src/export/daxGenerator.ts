/**
 * DAX Generator - Creates Power BI measures from visual bindings
 * 
 * Scans dashboard items to identify unique metric+operation combinations,
 * then generates appropriate DAX measures including variance calculations.
 */

import { DashboardItem, Scenario } from '../types';
import { getFactTableForScenario, mapFieldToPBIColumn } from './schemaGenerator';

export interface DAXMeasure {
  name: string;
  expression: string;
  displayFolder?: string;
  formatString?: string;
  description?: string;
}

/**
 * Standard aggregation patterns
 */
const aggregationPatterns: Record<string, (table: string, column: string) => string> = {
  sum: (table, column) => `SUM(${table}[${column}])`,
  avg: (table, column) => `AVERAGE(${table}[${column}])`,
  average: (table, column) => `AVERAGE(${table}[${column}])`,
  count: (table, column) => `COUNTROWS(${table})`,
  min: (table, column) => `MIN(${table}[${column}])`,
  max: (table, column) => `MAX(${table}[${column}])`,
  distinctcount: (table, column) => `DISTINCTCOUNT(${table}[${column}])`,
};

/**
 * Extract unique metric+operation combinations from dashboard items
 */
export function extractMetricBindings(items: DashboardItem[], scenario: Scenario): Array<{
  metric: string;
  operation: string;
  table: string;
  column: string;
}> {
  const bindings = new Map<string, { metric: string; operation: string; table: string; column: string }>();
  const factTable = getFactTableForScenario(scenario);

  items.forEach(item => {
    const props = item.props || {};
    
    // Extract metric from various visual props
    const metric = props.metric || props.value || null;
    const operation = props.operation || 'sum';

    if (metric) {
      const key = `${metric}_${operation}`;
      if (!bindings.has(key)) {
        const mapping = mapFieldToPBIColumn(scenario, metric);
        bindings.set(key, {
          metric,
          operation,
          table: mapping.table,
          column: mapping.column,
        });
      }
    }

    // Check for variance props (showVariance, PL/PY fields)
    if (props.showVariance) {
      // Add PL and PY variants
      if (metric) {
        const plKey = `${metric}PL_${operation}`;
        const pyKey = `${metric}PY_${operation}`;
        
        if (!bindings.has(plKey)) {
          bindings.set(plKey, {
            metric: `${metric}PL`,
            operation,
            table: factTable,
            column: `${metric.charAt(0).toUpperCase() + metric.slice(1)}PL`,
          });
        }
        if (!bindings.has(pyKey)) {
          bindings.set(pyKey, {
            metric: `${metric}PY`,
            operation,
            table: factTable,
            column: `${metric.charAt(0).toUpperCase() + metric.slice(1)}PY`,
          });
        }
      }
    }
  });

  return Array.from(bindings.values());
}

/**
 * Generate base measures from bindings
 */
export function generateBaseMeasures(bindings: Array<{
  metric: string;
  operation: string;
  table: string;
  column: string;
}>, scenario: Scenario): DAXMeasure[] {
  const measures: DAXMeasure[] = [];
  const factTable = getFactTableForScenario(scenario);

  bindings.forEach(binding => {
    const { metric, operation, table, column } = binding;
    const pattern = aggregationPatterns[operation.toLowerCase()] || aggregationPatterns.sum;
    
    // Determine measure name
    const operationLabel = operation === 'sum' ? 'Total' : 
                          operation === 'avg' || operation === 'average' ? 'Avg' :
                          operation === 'count' ? 'Count of' :
                          operation.charAt(0).toUpperCase() + operation.slice(1);
    
    const metricLabel = metric.replace(/PL$/, ' Plan').replace(/PY$/, ' PY');
    const measureName = `${operationLabel} ${metricLabel}`.replace(/\s+/g, ' ').trim();
    
    // Determine format string
    let formatString = '#,##0';
    if (metric.toLowerCase().includes('rate') || metric.toLowerCase().includes('percentage')) {
      formatString = '0.0%';
    } else if (metric.toLowerCase().includes('revenue') || metric.toLowerCase().includes('profit') || 
               metric.toLowerCase().includes('cost') || metric.toLowerCase().includes('salary') ||
               metric.toLowerCase().includes('mrr') || metric.toLowerCase().includes('ltv')) {
      formatString = '$#,##0';
    }

    measures.push({
      name: measureName,
      expression: pattern(table, column),
      displayFolder: 'Base Measures',
      formatString,
      description: `${operationLabel} of ${metricLabel} from ${table} table`,
    });
  });

  return measures;
}

/**
 * Generate variance measures for AC vs PY and AC vs PL
 */
export function generateVarianceMeasures(bindings: Array<{
  metric: string;
  operation: string;
  table: string;
  column: string;
}>, scenario: Scenario): DAXMeasure[] {
  const measures: DAXMeasure[] = [];
  
  // Find metrics that have AC, PL, PY variants
  const baseMetrics = new Set<string>();
  bindings.forEach(b => {
    const base = b.metric.replace(/PL$/, '').replace(/PY$/, '');
    baseMetrics.add(base);
  });

  baseMetrics.forEach(baseMetric => {
    const hasPL = bindings.some(b => b.metric === `${baseMetric}PL`);
    const hasPY = bindings.some(b => b.metric === `${baseMetric}PY`);
    const hasBase = bindings.some(b => b.metric === baseMetric);

    if (!hasBase) return;

    const baseMeasureName = `Total ${baseMetric}`;
    const metricLabel = baseMetric.charAt(0).toUpperCase() + baseMetric.slice(1);

    // Δ PY (Variance to Prior Year)
    if (hasPY) {
      measures.push({
        name: `${metricLabel} ΔPY`,
        expression: `
VAR _AC = [Total ${metricLabel}]
VAR _PY = [Total ${metricLabel} PY]
RETURN
_AC - _PY`,
        displayFolder: 'Variance Measures',
        formatString: '$#,##0',
        description: `${metricLabel} variance vs Prior Year (AC - PY)`,
      });

      // Δ PY % (Percentage Variance)
      measures.push({
        name: `${metricLabel} ΔPY%`,
        expression: `
VAR _AC = [Total ${metricLabel}]
VAR _PY = [Total ${metricLabel} PY]
RETURN
IF(_PY <> 0, DIVIDE(_AC - _PY, ABS(_PY)), BLANK())`,
        displayFolder: 'Variance Measures',
        formatString: '0.0%',
        description: `${metricLabel} percentage variance vs Prior Year`,
      });
    }

    // Δ PL (Variance to Plan)
    if (hasPL) {
      measures.push({
        name: `${metricLabel} ΔPL`,
        expression: `
VAR _AC = [Total ${metricLabel}]
VAR _PL = [Total ${metricLabel} Plan]
RETURN
_AC - _PL`,
        displayFolder: 'Variance Measures',
        formatString: '$#,##0',
        description: `${metricLabel} variance vs Plan (AC - PL)`,
      });

      // Δ PL % (Percentage Variance)
      measures.push({
        name: `${metricLabel} ΔPL%`,
        expression: `
VAR _AC = [Total ${metricLabel}]
VAR _PL = [Total ${metricLabel} Plan]
RETURN
IF(_PL <> 0, DIVIDE(_AC - _PL, ABS(_PL)), BLANK())`,
        displayFolder: 'Variance Measures',
        formatString: '0.0%',
        description: `${metricLabel} percentage variance vs Plan`,
      });
    }
  });

  return measures;
}

/**
 * Generate waterfall-specific measures
 * Waterfall charts need special DAX for bridge analysis
 */
export function generateWaterfallMeasures(items: DashboardItem[], scenario: Scenario): DAXMeasure[] {
  const measures: DAXMeasure[] = [];
  const waterfallItems = items.filter(item => item.type === 'waterfall');

  waterfallItems.forEach((item, index) => {
    const props = item.props || {};
    const dimension = props.dimension || 'Region';
    const metric = props.metric || 'revenue';
    const metricLabel = metric.charAt(0).toUpperCase() + metric.slice(1);
    const suffix = waterfallItems.length > 1 ? ` ${index + 1}` : '';

    // Get the dimension table/column mapping
    const dimMapping = mapFieldToPBIColumn(scenario, dimension);
    const factTable = getFactTableForScenario(scenario);
    const metricMapping = mapFieldToPBIColumn(scenario, metric);

    // Waterfall Start (PY Total)
    measures.push({
      name: `Waterfall${suffix} Start`,
      expression: `
// Starting point - Prior Year total
VAR _PY = CALCULATE(
    SUM(${factTable}[${metricLabel}PY]),
    ALLEXCEPT(${factTable}, ${dimMapping.table}[${dimMapping.column}])
)
RETURN _PY`,
      displayFolder: 'Waterfall',
      formatString: '$#,##0',
      description: `Waterfall bridge starting point (PY total) by ${dimension}`,
    });

    // Waterfall Variance per dimension value
    measures.push({
      name: `Waterfall${suffix} Variance`,
      expression: `
// Variance contribution by ${dimension}
VAR _AC = SUM(${factTable}[${metricLabel}])
VAR _PY = SUM(${factTable}[${metricLabel}PY])
RETURN
_AC - _PY`,
      displayFolder: 'Waterfall',
      formatString: '$#,##0',
      description: `Waterfall bridge variance contribution by ${dimension}`,
    });

    // Waterfall End (AC Total)
    measures.push({
      name: `Waterfall${suffix} End`,
      expression: `
// Ending point - Actual total
VAR _AC = CALCULATE(
    SUM(${factTable}[${metricLabel}]),
    ALLEXCEPT(${factTable}, ${dimMapping.table}[${dimMapping.column}])
)
RETURN _AC`,
      displayFolder: 'Waterfall',
      formatString: '$#,##0',
      description: `Waterfall bridge ending point (AC total) by ${dimension}`,
    });

    // Waterfall Running Total (for proper bar positioning)
    measures.push({
      name: `Waterfall${suffix} Running`,
      expression: `
// Running total for waterfall positioning
// This measure calculates cumulative variance for each bar
VAR _CurrentDim = SELECTEDVALUE(${dimMapping.table}[${dimMapping.column}])
VAR _AllDims = VALUES(${dimMapping.table}[${dimMapping.column}])
VAR _PYTotal = CALCULATE(SUM(${factTable}[${metricLabel}PY]), ALL(${dimMapping.table}))
VAR _RunningVariance = 
    SUMX(
        FILTER(_AllDims, ${dimMapping.table}[${dimMapping.column}] <= _CurrentDim),
        VAR _DimVal = ${dimMapping.table}[${dimMapping.column}]
        RETURN
        CALCULATE(
            SUM(${factTable}[${metricLabel}]) - SUM(${factTable}[${metricLabel}PY]),
            ${dimMapping.table}[${dimMapping.column}] = _DimVal
        )
    )
RETURN
_PYTotal + _RunningVariance`,
      displayFolder: 'Waterfall',
      formatString: '$#,##0',
      description: `Running total for waterfall chart positioning by ${dimension}`,
    });
  });

  return measures;
}

/**
 * Generate portfolio-specific measures
 */
export function generatePortfolioMeasures(items: DashboardItem[], scenario: Scenario): DAXMeasure[] {
  if (scenario !== 'Portfolio') return [];

  const measures: DAXMeasure[] = [];

  // Unique Entity Count
  measures.push({
    name: 'Unique Entities',
    expression: `DISTINCTCOUNT(ControversyScore[EntityID])`,
    displayFolder: 'Portfolio KPIs',
    formatString: '#,##0',
    description: 'Count of unique entities in the portfolio',
  });

  // Above Threshold (score >= 4)
  measures.push({
    name: 'Above Threshold',
    expression: `
CALCULATE(
    DISTINCTCOUNT(ControversyScore[EntityID]),
    ControversyScore[Score] >= 4
)`,
    displayFolder: 'Portfolio KPIs',
    formatString: '#,##0',
    description: 'Count of entities with controversy score >= 4',
  });

  // Negative Changes
  measures.push({
    name: 'Negative Changes',
    expression: `
CALCULATE(
    COUNTROWS(ControversyScore),
    ControversyScore[ScoreChange] < 0
)`,
    displayFolder: 'Portfolio KPIs',
    formatString: '#,##0',
    description: 'Count of negative score changes (deterioration)',
  });

  // Average Score
  measures.push({
    name: 'Avg Controversy Score',
    expression: `AVERAGE(ControversyScore[Score])`,
    displayFolder: 'Portfolio KPIs',
    formatString: '0.00',
    description: 'Average controversy score across entities',
  });

  // Total Market Value
  measures.push({
    name: 'Total Market Value',
    expression: `SUM(PortfolioEntity[MarketValue])`,
    displayFolder: 'Portfolio KPIs',
    formatString: '$#,##0.00',
    description: 'Total market value of portfolio entities',
  });

  // Score Change Summary
  measures.push({
    name: 'Net Score Change',
    expression: `SUM(ControversyScore[ScoreChange])`,
    displayFolder: 'Portfolio KPIs',
    formatString: '+#,##0;-#,##0;0',
    description: 'Net change in controversy scores (positive = improvement)',
  });

  // Positive Changes
  measures.push({
    name: 'Positive Changes',
    expression: `
CALCULATE(
    COUNTROWS(ControversyScore),
    ControversyScore[ScoreChange] > 0
)`,
    displayFolder: 'Portfolio KPIs',
    formatString: '#,##0',
    description: 'Count of positive score changes (improvement)',
  });

  return measures;
}

/**
 * Generate HR-specific measures
 */
export function generateHRMeasures(items: DashboardItem[], scenario: Scenario): DAXMeasure[] {
  if (scenario !== 'HR') return [];

  const measures: DAXMeasure[] = [];

  // Headcount
  measures.push({
    name: 'Headcount',
    expression: `COUNTROWS(Employee)`,
    displayFolder: 'HR KPIs',
    formatString: '#,##0',
    description: 'Total employee headcount',
  });

  // Attrition Rate
  measures.push({
    name: 'Attrition Rate',
    expression: `
VAR _Attrited = CALCULATE(COUNTROWS(Employee), Employee[Attrition] = 1)
VAR _Total = COUNTROWS(Employee)
RETURN
IF(_Total > 0, DIVIDE(_Attrited, _Total), BLANK())`,
    displayFolder: 'HR KPIs',
    formatString: '0.0%',
    description: 'Percentage of employees who have left',
  });

  // Average Rating
  measures.push({
    name: 'Avg Performance Rating',
    expression: `AVERAGE(Employee[Rating])`,
    displayFolder: 'HR KPIs',
    formatString: '0.0',
    description: 'Average employee performance rating (1-5 scale)',
  });

  // Average Tenure
  measures.push({
    name: 'Avg Tenure',
    expression: `AVERAGE(Employee[Tenure])`,
    displayFolder: 'HR KPIs',
    formatString: '0.0',
    description: 'Average employee tenure in years',
  });

  return measures;
}

/**
 * Generate Logistics-specific measures
 */
export function generateLogisticsMeasures(items: DashboardItem[], scenario: Scenario): DAXMeasure[] {
  if (scenario !== 'Logistics') return [];

  const measures: DAXMeasure[] = [];

  // Shipment Count
  measures.push({
    name: 'Total Shipments',
    expression: `COUNTROWS(Shipment)`,
    displayFolder: 'Logistics KPIs',
    formatString: '#,##0',
    description: 'Total number of shipments',
  });

  // On-Time Delivery Rate
  measures.push({
    name: 'On-Time Rate',
    expression: `
VAR _OnTime = CALCULATE(COUNTROWS(Shipment), Shipment[OnTime] = 1)
VAR _Total = COUNTROWS(Shipment)
RETURN
IF(_Total > 0, DIVIDE(_OnTime, _Total), BLANK())`,
    displayFolder: 'Logistics KPIs',
    formatString: '0.0%',
    description: 'Percentage of shipments delivered on time',
  });

  // Average Cost per Shipment
  measures.push({
    name: 'Avg Shipment Cost',
    expression: `AVERAGE(Shipment[Cost])`,
    displayFolder: 'Logistics KPIs',
    formatString: '$#,##0.00',
    description: 'Average cost per shipment',
  });

  // Status breakdown measures
  ['Delivered', 'In Transit', 'Delayed'].forEach(status => {
    measures.push({
      name: `${status} Count`,
      expression: `CALCULATE(COUNTROWS(Shipment), Shipment[Status] = "${status}")`,
      displayFolder: 'Logistics KPIs',
      formatString: '#,##0',
      description: `Count of shipments with ${status} status`,
    });
  });

  return measures;
}

/**
 * Generate SaaS-specific measures
 */
export function generateSaaSMeasures(items: DashboardItem[], scenario: Scenario): DAXMeasure[] {
  if (scenario !== 'SaaS') return [];

  const measures: DAXMeasure[] = [];

  // Churn Rate
  measures.push({
    name: 'Churn Rate',
    expression: `
VAR _Churned = CALCULATE(COUNTROWS(Subscription), Subscription[Churn] = 1)
VAR _Total = COUNTROWS(Subscription)
RETURN
IF(_Total > 0, DIVIDE(_Churned, _Total), BLANK())`,
    displayFolder: 'SaaS KPIs',
    formatString: '0.0%',
    description: 'Percentage of subscriptions that churned',
  });

  // ARR (Annual Recurring Revenue)
  measures.push({
    name: 'ARR',
    expression: `SUM(Subscription[MRR]) * 12`,
    displayFolder: 'SaaS KPIs',
    formatString: '$#,##0',
    description: 'Annual Recurring Revenue (MRR × 12)',
  });

  // Customer Count
  measures.push({
    name: 'Customer Count',
    expression: `DISTINCTCOUNT(Subscription[CustomerID])`,
    displayFolder: 'SaaS KPIs',
    formatString: '#,##0',
    description: 'Count of unique customers',
  });

  // ARPU (Average Revenue Per User)
  measures.push({
    name: 'ARPU',
    expression: `
VAR _TotalMRR = SUM(Subscription[MRR])
VAR _Customers = DISTINCTCOUNT(Subscription[CustomerID])
RETURN
IF(_Customers > 0, DIVIDE(_TotalMRR, _Customers), BLANK())`,
    displayFolder: 'SaaS KPIs',
    formatString: '$#,##0',
    description: 'Average MRR per customer',
  });

  return measures;
}

/**
 * Main function - generate all DAX measures for a dashboard
 */
export function generateAllMeasures(items: DashboardItem[], scenario: Scenario): DAXMeasure[] {
  const bindings = extractMetricBindings(items, scenario);
  
  const measures: DAXMeasure[] = [
    ...generateBaseMeasures(bindings, scenario),
    ...generateVarianceMeasures(bindings, scenario),
    ...generateWaterfallMeasures(items, scenario),
    ...generatePortfolioMeasures(items, scenario),
    ...generateHRMeasures(items, scenario),
    ...generateLogisticsMeasures(items, scenario),
    ...generateSaaSMeasures(items, scenario),
  ];

  // Deduplicate measures by name
  const seen = new Set<string>();
  return measures.filter(m => {
    if (seen.has(m.name)) return false;
    seen.add(m.name);
    return true;
  });
}
