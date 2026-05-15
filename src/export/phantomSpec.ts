import type { DashboardItem, DashboardSpecification, DesignSource, DrillAction, ExportMode, LayoutMode, Scenario } from '../types';

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
    designEntryPoint: 'figma-led' | 'phantom-led';
    designSources: DesignSource[];
  };
  views: Array<{
    id: string;
    name: string;
    type: 'dashboard';
    layoutMode: LayoutMode;
    components: PhantomSpecComponent[];
  }>;
  interactions: {
    drillActions: DrillAction[];
  };
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

export interface PhantomReadinessIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  componentId?: string;
  drillActionId?: string;
}

export interface PhantomReadinessReport {
  target: ExportMode;
  ready: boolean;
  errors: PhantomReadinessIssue[];
  warnings: PhantomReadinessIssue[];
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
  drillActions?: DrillAction[];
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
      designEntryPoint: input.specification?.designEntryPoint || 'phantom-led',
      designSources: input.specification?.designSources || [],
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
    interactions: {
      drillActions: input.drillActions || [],
    },
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

const getSpecComponents = (spec: PhantomSpec) => spec.views.flatMap((view) => view.components);

export const checkPhantomReadiness = (spec: PhantomSpec, target: ExportMode = spec.mode): PhantomReadinessReport => {
  const errors: PhantomReadinessIssue[] = [];
  const warnings: PhantomReadinessIssue[] = [];
  const components = getSpecComponents(spec);
  const componentIds = new Set(components.map((component) => component.id));

  if (components.length === 0) {
    errors.push({
      severity: 'error',
      code: 'NO_COMPONENTS',
      message: 'Spec has no components to hand off.',
    });
  }

  for (const component of components) {
    if (component.dataRequirements.fields.length === 0 && !['textBox', 'banner'].includes(component.type)) {
      warnings.push({
        severity: 'warning',
        code: 'NO_DATA_REQUIREMENTS',
        message: `${component.title} has no detected data requirements.`,
        componentId: component.id,
      });
    }

    if (target === 'powerBi') {
      const status = component.exportTargets.powerBi.status;
      if (status === 'unsupported') {
        errors.push({
          severity: 'error',
          code: 'POWER_BI_UNSUPPORTED_VISUAL',
          message: `${component.title} is design-only and cannot be treated as Power BI-ready.`,
          componentId: component.id,
        });
      }
      if (status === 'approximate') {
        warnings.push({
          severity: 'warning',
          code: 'POWER_BI_APPROXIMATE_VISUAL',
          message: `${component.title} has approximate Power BI support and needs implementation notes.`,
          componentId: component.id,
        });
      }
    }
  }

  for (const action of spec.interactions.drillActions) {
    if (!componentIds.has(action.sourceComponentId)) {
      errors.push({
        severity: 'error',
        code: 'BROKEN_DRILL_SOURCE',
        message: `${action.label} references a missing source component.`,
        drillActionId: action.id,
      });
    }
    if (action.context.length === 0) {
      warnings.push({
        severity: 'warning',
        code: 'DRILL_ACTION_WITHOUT_CONTEXT',
        message: `${action.label} does not pass any context to its target.`,
        drillActionId: action.id,
      });
    }
  }

  if (spec.project.designEntryPoint === 'figma-led' && spec.project.designSources.length === 0) {
    warnings.push({
      severity: 'warning',
      code: 'FIGMA_LED_WITHOUT_SOURCE',
      message: 'Project is marked Figma-led but has no linked design sources.',
    });
  }

  return {
    target,
    ready: errors.length === 0,
    errors,
    warnings,
  };
};
