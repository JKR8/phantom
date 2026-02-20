import { ScenarioType, ScenarioFields, RecommendedMeasures, RecommendedDimensions } from './semanticLayer';

export interface BindingRecipe {
  dimension?: string;
  metric?: string;
  metricName?: string;
  metric2?: string;
  series?: string; // For stacked/grouped charts - creates segments
  xMetric?: string;
  yMetric?: string;
  sizeMetric?: string;
  playAxis?: string;
  operation?: string;
  label?: string;
  fields?: string[];
  columns?: string[] | string;
  rows?: string;
  values?: string;
  maxRows?: number;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
  comparison?: 'none' | 'pl' | 'py' | 'both';
  timeGrain?: 'month' | 'quarter' | 'year';
  title?: string;
  // Combo chart specific
  barMetric?: string;
  lineMetric?: string;
  // Map chart specific
  geoDimension?: string;
  mapType?: 'us' | 'world';
  displayMode?: 'choropleth' | 'bubble';
  // KPI visual specific
  goalText?: string;
  goalValue?: number;
}

export const getRecipeForVisual = (visualType: string, scenario: ScenarioType): BindingRecipe => {
  const fields = ScenarioFields[scenario];
  if (!fields) return {};

  const fieldNames = new Set(fields.map(f => f.name));

  // Find the first available measures from the recommended list
  const availableMeasures = RecommendedMeasures[scenario].filter(m => fieldNames.has(m));
  const coreMeasures = availableMeasures.filter((m) => !m.endsWith('PL') && !m.endsWith('PY'));
  const rankedMeasures = coreMeasures.length > 0 ? coreMeasures : availableMeasures;
  const primaryMeasure = rankedMeasures[0];
  const secondaryMeasure = rankedMeasures[1] || primaryMeasure;
  const tertiaryMeasure = rankedMeasures[2] || secondaryMeasure;

  // Find the first available dimensions from the recommended list
  const availableDimensions = RecommendedDimensions[scenario].filter(d => fieldNames.has(d));
  const primaryCategory = availableDimensions[0];

  // Find the time dimension by its role, as it's usually unique
  const timeDimension = fields.find(f => f.role === 'Time')?.name;
  
  // Find a geo dimension by its role
  const geoDimension = fields.find(f => f.role === 'Geography')?.name;

  // Find a secondary category for stacking/grouping that is different from the primary
  const secondaryCategory = availableDimensions.find(d => d !== primaryCategory && d !== timeDimension);
  
  const allMeasures = rankedMeasures.length > 0
    ? rankedMeasures
    : fields.filter(f => f.role === 'Measure').map(f => f.name);

  switch (visualType) {
    case 'bar':
    case 'column':
    case 'groupedBar':
    case 'lollipop':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
        topN: 5,
        sort: 'desc',
        showOther: true,
      };

    case 'stackedBar':
    case 'stackedColumn':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
        series: secondaryCategory, // Required for stacked segments
        topN: 5,
        sort: 'desc',
        showOther: true,
      };

    case 'line':
    case 'area':
    case 'lineForecast':
    case 'lineStepped':
      return {
        dimension: timeDimension || primaryCategory,
        metric: primaryMeasure,
        comparison: 'both',
        timeGrain: 'month',
      };

    case 'stackedArea':
      return {
        dimension: timeDimension || primaryCategory,
        metric: primaryMeasure,
        series: secondaryCategory,
        timeGrain: 'month',
      };

    case 'combo':
      return {
        dimension: primaryCategory,
        barMetric: primaryMeasure,
        lineMetric: availableMeasures[1] || secondaryMeasure,
        topN: 5,
        sort: 'desc',
      };

    case 'map':
    case 'mapChoropleth':
      return {
        geoDimension: geoDimension || primaryCategory,
        metric: primaryMeasure,
        mapType: 'us',
        displayMode: 'choropleth',
      };

    case 'mapBubble':
      return {
        geoDimension: geoDimension || primaryCategory,
        metric: primaryMeasure,
        mapType: 'us',
        displayMode: 'bubble',
      };

    case 'pie':
    case 'donut':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
        topN: 6,
        sort: 'desc',
        showOther: true,
      };

    case 'funnel':
    case 'treemap':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
        topN: 'All',
        sort: 'desc',
      };

    case 'ribbon':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
        topN: 5,
      };

    case 'barbell':
    case 'diverging':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
        metric2: secondaryMeasure,
      };

    case 'slope':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
      };

    case 'scatter':
      return {
        xMetric: primaryMeasure,
        yMetric: secondaryMeasure,
        sizeMetric: tertiaryMeasure,
        playAxis: timeDimension,
        dimension: primaryCategory
      };

    case 'card':
    case 'kpi':
    case 'gauge':
    case 'bullet':
      return {
        metric: primaryMeasure,
        operation: 'sum',
        label: primaryMeasure,
        goalText: 'vs prev',
      };

    case 'nudgeKpi':
      return {
        metricName: primaryMeasure || 'Revenue',
        metric: primaryMeasure,
        operation: 'sum',
      };

    case 'multiRowCard':
      return {
        fields: allMeasures.slice(0, 3)
      };

    case 'table':
      return {
        columns: [
            primaryCategory,
            ...allMeasures.slice(0, 3)
        ].filter(Boolean) as string[],
        maxRows: 25
      };

    case 'matrix':
      return {
        rows: primaryCategory,
        columns: timeDimension,
        values: primaryMeasure
      };

    case 'waterfall':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure
      };

    case 'slicer':
      return {
        dimension: primaryCategory
      };

    // Text/Layout visuals
    case 'textBox':
      return { title: 'Text Box' };
    case 'banner':
      return { title: 'Report Title' };

    default:
      return {};
  }
};

/**
 * Generate a contextual smart title based on visual type, recipe, and scenario.
 * Pure function — called from drop handler and QuickShapeStrip.
 */
export const generateSmartTitle = (
  visualType: string,
  recipe: BindingRecipe,
  scenario: ScenarioType
): string => {
  const dim = recipe.dimension || '';
  const met = recipe.metric || '';
  const topN = recipe.topN;

  switch (visualType) {
    case 'bar':
    case 'column':
    case 'stackedBar':
    case 'stackedColumn':
    case 'groupedBar':
    case 'lollipop':
    case 'ribbon': {
      const prefix = topN && topN !== 'All' ? `Top ${topN} ` : '';
      const dimLabel = dim ? `${dim}` : 'Items';
      const metLabel = met || 'Value';
      return `${prefix}${dimLabel} by ${metLabel}`;
    }

    case 'line':
    case 'area':
    case 'lineForecast':
    case 'lineStepped':
      return met ? `${met} Trend` : 'Trend';

    case 'stackedArea':
      return met && dim ? `${met} by ${dim} Over Time` : 'Stacked Area';

    case 'combo':
      return recipe.barMetric && recipe.lineMetric
        ? `${recipe.barMetric} vs ${recipe.lineMetric}`
        : 'Combo Chart';

    case 'map':
    case 'mapBubble':
    case 'mapChoropleth':
      return recipe.metric && recipe.geoDimension
        ? `${recipe.metric} by ${recipe.geoDimension}`
        : 'Map';

    case 'pie':
    case 'donut':
      return met && dim ? `${met} by ${dim}` : met || 'Distribution';

    case 'card':
    case 'kpi':
    case 'gauge':
    case 'bullet':
      return met ? `Total ${met}` : 'KPI';

    case 'multiRowCard':
      return `${scenario} KPIs`;

    case 'table':
      return `${scenario} Details`;

    case 'matrix':
      return `${scenario} Matrix`;

    case 'scatter':
      return recipe.xMetric && recipe.yMetric
        ? `${recipe.xMetric} vs ${recipe.yMetric}`
        : 'Scatter';

    case 'funnel':
      return met && dim ? `${met} by ${dim}` : 'Funnel';

    case 'treemap':
      return met && dim ? `${met} by ${dim}` : 'Treemap';

    case 'waterfall':
      return met ? `${met} Waterfall` : 'Waterfall';

    case 'slicer':
      return dim ? `Filter by ${dim}` : 'Slicer';

    // Comparison charts
    case 'barbell':
    case 'diverging':
    case 'slope':
      return met ? `${met} Comparison` : 'Comparison';

    // Text/Layout visuals
    case 'textBox':
      return recipe.title || 'Text Box';
    case 'banner':
      return recipe.title || 'Report Title';

    default:
      return visualType.charAt(0).toUpperCase() + visualType.slice(1);
  }
};
