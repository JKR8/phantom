import type { DashboardItem, DashboardSpecification, ExportMode, LayoutMode, Scenario } from '../types';

export const PHANTOM_SPEC_VERSION = '0.1.0';

export type PhantomExportStatus = 'ready' | 'approximate' | 'unsupported';

export interface PhantomSpecComponent {
  id: string;
  type: string;
  title: string;
  layout: DashboardItem['layout'];
  props: Record<string, unknown>;
  dataRequirements: {
    metrics: string[];
    dimensions: string[];
    fields: string[];
  };
  exportTargets: {
    react: {
      status: PhantomExportStatus;
    };
    powerBi: {
      status: PhantomExportStatus;
      notes: string[];
    };
  };
}

export interface PhantomSpec {
  specVersion: typeof PHANTOM_SPEC_VERSION;
  generatedAt: string;
  mode: ExportMode;
  project: {
    scenario: Scenario;
    themePalette: string;
    specification: DashboardSpecification;
  };
  views: Array<{
    id: string;
    name: string;
    type: 'dashboard';
    layoutMode: LayoutMode;
    components: PhantomSpecComponent[];
  }>;
  filters: Record<string, unknown>;
  dataContract: {
    metrics: string[];
    dimensions: string[];
    fields: string[];
  };
  exportTargets: {
    react: {
      status: 'starter-spec';
      notes: string[];
    };
    powerBi: {
      status: 'compatibility-spec';
      notes: string[];
    };
  };
}

const PBI_DESIGN_ONLY_VISUALS = new Set(['histogram', 'boxplot', 'violin', 'regressionScatter', 'barbell', 'slope']);
const PBI_APPROXIMATE_VISUALS = new Set(['lollipop', 'diverging', 'bullet', 'lineForecast']);

const asStringArray = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  if (typeof value === 'string' && value.length > 0) return [value];
  return [];
};

const uniq = (values: string[]) => [...new Set(values.filter(Boolean))].sort();

export const getPowerBiExportStatus = (visualType: string): PhantomSpecComponent['exportTargets']['powerBi'] => {
  if (PBI_DESIGN_ONLY_VISUALS.has(visualType)) {
    return {
      status: 'unsupported',
      notes: ['Design-only in Power BI Mode. Use React Product Mode or choose a Power BI-safe alternative.'],
    };
  }

  if (PBI_APPROXIMATE_VISUALS.has(visualType)) {
    return {
      status: 'approximate',
      notes: ['Approximate Power BI export. Implementation may require a closest-native visual or custom build notes.'],
    };
  }

  return {
    status: 'ready',
    notes: [],
  };
};

export const getComponentDataRequirements = (item: DashboardItem): PhantomSpecComponent['dataRequirements'] => {
  const props = (item.props || {}) as Record<string, unknown>;
  const dimensions = uniq([
    ...asStringArray(props.dimension),
    ...asStringArray(props.category),
    ...asStringArray(props.rows),
    ...asStringArray(props.columns),
  ]);
  const metrics = uniq([
    ...asStringArray(props.metric),
    ...asStringArray(props.value),
    ...asStringArray(props.values),
  ]);
  const fields = uniq([
    ...dimensions,
    ...metrics,
    ...asStringArray(props.fields),
  ]);

  return { metrics, dimensions, fields };
};

export const createPhantomSpec = (input: {
  scenario: Scenario;
  items: DashboardItem[];
  filters: Record<string, unknown>;
  layoutMode: LayoutMode;
  exportMode: ExportMode;
  themePalette: string;
  specification?: DashboardSpecification;
  generatedAt?: string;
}): PhantomSpec => {
  const components = input.items.map((item): PhantomSpecComponent => ({
    id: item.id,
    type: item.type,
    title: item.title,
    layout: item.layout,
    props: (item.props || {}) as Record<string, unknown>,
    dataRequirements: getComponentDataRequirements(item),
    exportTargets: {
      react: { status: 'ready' },
      powerBi: getPowerBiExportStatus(item.type),
    },
  }));

  const metrics = uniq(components.flatMap((component) => component.dataRequirements.metrics));
  const dimensions = uniq(components.flatMap((component) => component.dataRequirements.dimensions));
  const fields = uniq(components.flatMap((component) => component.dataRequirements.fields));

  return {
    specVersion: PHANTOM_SPEC_VERSION,
    generatedAt: input.generatedAt || new Date().toISOString(),
    mode: input.exportMode,
    project: {
      scenario: input.scenario,
      themePalette: input.themePalette,
      specification: input.specification || { signOffStatus: 'draft' },
    },
    views: [
      {
        id: 'main',
        name: `${input.scenario} Dashboard`,
        type: 'dashboard',
        layoutMode: input.layoutMode,
        components,
      },
    ],
    filters: input.filters,
    dataContract: {
      metrics,
      dimensions,
      fields,
    },
    exportTargets: {
      react: {
        status: 'starter-spec',
        notes: ['Use this spec as the contract for React component scaffolding, data adapters, filters, and drill-through routes.'],
      },
      powerBi: {
        status: 'compatibility-spec',
        notes: ['Use component-level Power BI statuses to identify ready, approximate, and unsupported visuals before implementation.'],
      },
    },
  };
};
