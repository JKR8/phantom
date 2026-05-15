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

export interface PhantomDataContractField {
  name: string;
  kind: 'metric' | 'dimension' | 'field';
  requiredBy: string[];
}

export interface PhantomDataContractComponent {
  viewId: string;
  viewName: string;
  componentId: string;
  title: string;
  type: string;
  fields: string[];
  metrics: string[];
  dimensions: string[];
  filters: unknown;
  expectedGrain: unknown;
  exportTargets: PhantomSpecComponent['exportTargets'];
}

export interface PhantomDataContract {
  contractVersion: '0.1.0';
  sourceSpecVersion: typeof PHANTOM_SPEC_VERSION;
  generatedAt: string;
  project: {
    scenario: Scenario;
    mode: ExportMode;
    designEntryPoint: 'figma-led' | 'phantom-led';
    designSources: DesignSource[];
  };
  dataSources: unknown;
  fields: PhantomDataContractField[];
  metrics: string[];
  dimensions: string[];
  filters: Record<string, unknown>;
  components: PhantomDataContractComponent[];
  drillActions: DrillAction[];
  implementationNotes: string[];
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

const getDataContractFieldKind = (spec: PhantomSpec, field: string): PhantomDataContractField['kind'] => {
  if (spec.dataContract.metrics.includes(field)) return 'metric';
  if (spec.dataContract.dimensions.includes(field)) return 'dimension';
  return 'field';
};

const markdownList = (items: string[]) => (items.length ? items.map((item) => `- ${item}`).join('\n') : '- None specified');

export const createPhantomDataContract = (
  spec: PhantomSpec,
  generatedAt = new Date().toISOString(),
): PhantomDataContract => {
  const components = spec.views.flatMap((view) =>
    view.components.map((component) => ({
      viewId: view.id,
      viewName: view.name,
      componentId: component.id,
      title: component.title,
      type: component.type,
      fields: component.dataRequirements.fields,
      metrics: component.dataRequirements.metrics,
      dimensions: component.dataRequirements.dimensions,
      filters: (component.props as Record<string, unknown>).filters || [],
      expectedGrain: (component.props as Record<string, unknown>).grain || null,
      exportTargets: component.exportTargets,
    })),
  );
  const fields = uniq([
    ...spec.dataContract.fields,
    ...components.flatMap((component) => component.fields),
  ]);

  return {
    contractVersion: '0.1.0',
    sourceSpecVersion: spec.specVersion,
    generatedAt,
    project: {
      scenario: spec.project.scenario,
      mode: spec.mode,
      designEntryPoint: spec.project.designEntryPoint,
      designSources: spec.project.designSources,
    },
    dataSources: (spec.project.specification as Record<string, unknown>).dataSources || [],
    fields: fields.map((name) => ({
      name,
      kind: getDataContractFieldKind(spec, name),
      requiredBy: components
        .filter((component) => component.fields.includes(name))
        .map((component) => component.componentId),
    })),
    metrics: spec.dataContract.metrics,
    dimensions: spec.dataContract.dimensions,
    filters: spec.filters,
    components,
    drillActions: spec.interactions.drillActions,
    implementationNotes: [
      'Map each component to a client-owned API, warehouse/dbt model, or optional semantic endpoint.',
      'Preserve component IDs in implementation so tests, agents, and drill actions can reference stable targets.',
      'Use designSources for Figma-led visual fidelity, but treat this contract as the source of truth for analytical behavior.',
    ],
  };
};

export const createPhantomDataContractMarkdown = (contract: PhantomDataContract) => {
  const fieldRows = contract.fields
    .map((field) => `| ${field.name} | ${field.kind} | ${field.requiredBy.join(', ') || 'None'} |`)
    .join('\n');
  const componentRows = contract.components
    .map((component) => `| ${component.componentId} | ${component.title} | ${component.type} | ${component.fields.join(', ') || 'None'} |`)
    .join('\n');
  const drillRows = contract.drillActions
    .map((action) => `| ${action.id} | ${action.label} | ${action.sourceComponentId} | ${action.targetType}:${action.targetId} | ${action.context.map((context) => `${context.source}->${context.target}`).join(', ') || 'None'} |`)
    .join('\n');

  return `# ${contract.project.scenario} Data Contract

Generated from Phantom Spec ${contract.sourceSpecVersion}.

## Project

- Mode: ${contract.project.mode}
- Entry point: ${contract.project.designEntryPoint}
- Design sources: ${contract.project.designSources.length}

## Metrics

${markdownList(contract.metrics)}

## Dimensions

${markdownList(contract.dimensions)}

## Fields

| Field | Kind | Required By |
| --- | --- | --- |
${fieldRows || '| None | field | None |'}

## Components

| Component ID | Title | Type | Required Fields |
| --- | --- | --- | --- |
${componentRows || '| None | None | None | None |'}

## Drill Actions

| Action ID | Label | Source | Target | Context |
| --- | --- | --- | --- | --- |
${drillRows || '| None | None | None | None | None |'}

## Implementation Notes

${markdownList(contract.implementationNotes)}
`;
};

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
