import { ScenarioType, ScenarioFields } from './semanticLayer';

export interface BindingRecipe {
  dimension?: string;
  metric?: string;
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

  const getRole = (role: string) => fields.find(f => f.role === role)?.name;
  const getRoles = (role: string) => fields.filter(f => f.role === role).map(f => f.name);
  const getRoleFallback = (roles: string[]) => {
    for (const r of roles) {
      const field = fields.find(f => f.role === r);
      if (field) return field.name;
    }
    return undefined;
  };

  const primaryMeasure = getRole('Measure');
  const secondaryMeasure = fields.filter(f => f.role === 'Measure')[1]?.name || primaryMeasure;
  const tertiaryMeasure = fields.filter(f => f.role === 'Measure')[2]?.name || secondaryMeasure;

  const primaryCategory = getRoleFallback(['Category', 'Entity', 'Geography']);
  const timeDimension = getRole('Time');

  switch (visualType) {
    case 'bar':
    case 'column':
    case 'stackedBar':
    case 'stackedColumn':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
        topN: 5,
        sort: 'desc',
        showOther: true,
      };

    case 'line':
    case 'area':
      return {
        dimension: timeDimension || primaryCategory,
        metric: primaryMeasure,
        comparison: 'both',
        timeGrain: 'month',
      };

    case 'stackedArea':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
        timeGrain: 'month',
      };

    case 'combo':
      return {
        dimension: primaryCategory,
        barMetric: primaryMeasure,
        lineMetric: secondaryMeasure,
        topN: 5,
        sort: 'desc',
      };

    case 'map':
      return {
        geoDimension: getRole('Geography') || primaryCategory,
        metric: primaryMeasure,
        mapType: 'us',
        displayMode: 'choropleth',
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
    case 'portfolioCard':
      return {
        metric: primaryMeasure,
        operation: 'sum',
        label: primaryMeasure,
        goalText: 'vs prev',
      };

    case 'multiRowCard':
      return {
        fields: getRoles('Measure').slice(0, 3)
      };

    case 'table':
      return {
        columns: [
            primaryCategory,
            ...getRoles('Measure').slice(0, 3)
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

    // Statistical visuals
    case 'boxplot':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
      };

    case 'histogram':
      return {
        metric: primaryMeasure,
        dimension: primaryCategory, // Optional: for filtering
      };

    case 'violin':
      return {
        dimension: primaryCategory,
        metric: primaryMeasure,
      };

    case 'regressionScatter':
      return {
        xMetric: primaryMeasure,
        yMetric: secondaryMeasure,
        dimension: primaryCategory,
      };

    // Portfolio-specific visuals
    case 'controversyBar':
      return { dimension: 'Group' };
    case 'entityTable':
    case 'controversyTable':
      return { maxRows: 10 };

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
    case 'stackedColumn': {
      const prefix = topN && topN !== 'All' ? `Top ${topN} ` : '';
      const dimLabel = dim ? `${dim}` : 'Items';
      const metLabel = met || 'Value';
      return `${prefix}${dimLabel} by ${metLabel}`;
    }

    case 'line':
    case 'area':
      return met ? `${met} Trend` : 'Trend';

    case 'stackedArea':
      return met && dim ? `${met} by ${dim} Over Time` : 'Stacked Area';

    case 'combo':
      return recipe.barMetric && recipe.lineMetric
        ? `${recipe.barMetric} vs ${recipe.lineMetric}`
        : 'Combo Chart';

    case 'map':
      return recipe.metric && recipe.geoDimension
        ? `${recipe.metric} by ${recipe.geoDimension}`
        : 'Map';

    case 'pie':
    case 'donut':
      return met && dim ? `${met} by ${dim}` : met || 'Distribution';

    case 'card':
    case 'kpi':
    case 'gauge':
    case 'portfolioCard':
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

    // Statistical visuals
    case 'boxplot':
      return met && dim ? `${met} by ${dim}` : 'Boxplot';

    case 'histogram':
      return met ? `${met} Distribution` : 'Histogram';

    case 'violin':
      return met && dim ? `${met} by ${dim}` : 'Violin';

    case 'regressionScatter':
      return recipe.xMetric && recipe.yMetric
        ? `${recipe.xMetric} vs ${recipe.yMetric} (Regression)`
        : 'Regression';

    default:
      return visualType.charAt(0).toUpperCase() + visualType.slice(1);
  }
};
