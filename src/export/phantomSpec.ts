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

export interface PhantomSpecValidationResult {
  valid: boolean;
  errors: string[];
}

export interface PhantomSpecSummary {
  specVersion?: string;
  mode?: string;
  scenario?: string;
  views: number;
  components: number;
  metrics: string[];
  dimensions: string[];
  powerBi: Record<string, number>;
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
  designSources: string[];
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
    signOffStatus: DashboardSpecification['signOffStatus'];
    designEntryPoint: 'figma-led' | 'phantom-led';
    designSources: DesignSource[];
  };
  designWorkflow: PhantomDesignWorkflow;
  workshopIntent: PhantomWorkshopIntent;
  dataSources: unknown;
  fields: PhantomDataContractField[];
  metrics: string[];
  dimensions: string[];
  filters: Record<string, unknown>;
  components: PhantomDataContractComponent[];
  drillActions: DrillAction[];
  implementationNotes: string[];
}

export interface PhantomPowerBiImplementationGuide {
  guideVersion: '0.1.0';
  sourceSpecVersion: typeof PHANTOM_SPEC_VERSION;
  generatedAt: string;
  project: {
    scenario: Scenario;
    sourceMode: ExportMode;
    signOffStatus: DashboardSpecification['signOffStatus'];
    designEntryPoint: 'figma-led' | 'phantom-led';
    designSources: DesignSource[];
  };
  designWorkflow: PhantomDesignWorkflow;
  workshopIntent: PhantomWorkshopIntent;
  readiness: PhantomReadinessReport;
  summary: {
    views: number;
    components: number;
    readyVisuals: number;
    approximateVisuals: number;
    unsupportedVisuals: number;
    drillActions: number;
  };
  components: Array<{
    id: string;
    title: string;
    type: string;
    powerBiStatus: PhantomExportStatus;
    designSources: string[];
    fields: string[];
    metrics: string[];
    dimensions: string[];
    notes: string[];
  }>;
  drillActions: DrillAction[];
  buildChecklist: string[];
}

export interface PhantomReactImplementationTask {
  componentId: string;
  title: string;
  type: string;
  suggestedComponent: string;
  designSources: string[];
  fields: string[];
  metrics: string[];
  dimensions: string[];
  powerBiStatus: PhantomExportStatus;
  workItems: string[];
}

export type PhantomHandoffTarget = 'dual-track' | 'react-product' | 'power-bi' | 'fix-before-handoff';

export interface PhantomHandoffRecommendation {
  target: PhantomHandoffTarget;
  guidance: string;
}

export interface PhantomApprovalStatus {
  subject: 'approval';
  signOffStatus: NonNullable<DashboardSpecification['signOffStatus']>;
  approvedForImplementation: boolean;
  guidance: string;
  requiredNextSteps: string[];
}

export interface PhantomDesignMappingSummary {
  totalSources: number;
  mappedSources: number;
  unmappedSources: number;
  linkedViewIds: string[];
  linkedComponentIds: string[];
  sourceIdsWithoutMappings: string[];
}

export type PhantomDesignWorkflowStatus = 'ready' | 'needs-design-source' | 'needs-mapping';

export interface PhantomDesignWorkflow {
  subject: 'design-workflow';
  entryPoint: 'figma-led' | 'phantom-led';
  designPlane: 'figma' | 'phantom';
  phantomRole: string;
  status: PhantomDesignWorkflowStatus;
  mapping: PhantomDesignMappingSummary;
  handoffModes: Array<'react-product' | 'power-bi'>;
  requiredNextSteps: string[];
  agentCommands: string[];
}

export interface PhantomHandoffSummary {
  subject: 'handoff-summary';
  project: {
    scenario: Scenario;
    mode: ExportMode;
    signOffStatus: DashboardSpecification['signOffStatus'];
    designEntryPoint: 'figma-led' | 'phantom-led';
    designSources: DesignSource[];
  };
  approval: PhantomApprovalStatus;
  designWorkflow: PhantomDesignWorkflow;
  designMapping: PhantomDesignMappingSummary;
  workshopIntent: PhantomWorkshopIntent;
  workshopCompleteness: PhantomWorkshopIntentCompleteness;
  readiness: {
    react: PhantomReadinessReport;
    powerBi: PhantomReadinessReport;
  };
  handoffRecommendation: PhantomHandoffRecommendation;
  counts: {
    views: number;
    components: number;
    fields: number;
    metrics: number;
    dimensions: number;
    drillActions: number;
    reactImplementationTasks: number;
    powerBiReadyVisuals: number;
    powerBiApproximateVisuals: number;
    powerBiUnsupportedVisuals: number;
  };
  nextActions: string[];
}

export interface PhantomWorkshopIntent {
  subject?: 'workshop-intent';
  businessQuestions?: string;
  audience?: string;
  decisions?: string;
  acceptanceCriteria?: string;
  buildNotes?: string;
}

export interface PhantomWorkshopIntentCompleteness {
  complete: boolean;
  present: string[];
  missing: string[];
}

export interface PhantomWorkshopIntentInspection extends PhantomWorkshopIntent {
  subject: 'workshop-intent';
  completeness: PhantomWorkshopIntentCompleteness;
}

export interface PhantomDesignSourceInput {
  id?: string;
  type: DesignSource['type'];
  name?: string;
  url?: string;
  frameId?: string;
  componentId?: string;
  linkedViewIds?: string[];
  linkedComponentIds?: string[];
  notes?: string;
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

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'design-source';

export const createDesignSource = (input: PhantomDesignSourceInput): DesignSource => {
  const name = input.name || input.frameId || input.componentId || input.url || 'Design source';
  const id = input.id || `${input.type}-${slug(input.frameId || input.componentId || name)}`;

  return {
    id,
    type: input.type,
    name,
    ...(input.url ? { url: input.url } : {}),
    ...(input.frameId ? { frameId: input.frameId } : {}),
    ...(input.componentId ? { componentId: input.componentId } : {}),
    ...(input.linkedViewIds?.length ? { linkedViewIds: input.linkedViewIds } : {}),
    ...(input.linkedComponentIds?.length ? { linkedComponentIds: input.linkedComponentIds } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  };
};

export const mergeDesignSourceIntoSpec = (
  spec: PhantomSpec,
  input: PhantomDesignSourceInput,
): PhantomSpec => {
  const designSource = createDesignSource(input);
  const designSources = [
    ...spec.project.designSources.filter((source) => source.id !== designSource.id),
    designSource,
  ];
  const designEntryPoint = designSource.type === 'phantomDefault' ? spec.project.designEntryPoint : 'figma-led';
  const specification = {
    ...spec.project.specification,
    designEntryPoint,
    designSources,
  };

  return {
    ...spec,
    project: {
      ...spec.project,
      specification,
      designEntryPoint,
      designSources,
    },
  };
};

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

const pushValidationError = (condition: boolean, message: string, errors: string[]) => {
  if (!condition) errors.push(message);
};

export const validatePhantomSpec = (spec: unknown): PhantomSpecValidationResult => {
  const errors: string[] = [];
  const candidate = spec as Partial<PhantomSpec> | null;

  pushValidationError(!!candidate && typeof candidate === 'object', 'Spec must be a JSON object.', errors);
  if (!candidate || typeof candidate !== 'object') {
    return { valid: false, errors };
  }

  pushValidationError(typeof candidate.specVersion === 'string', 'specVersion is required.', errors);
  pushValidationError(candidate.mode === 'react' || candidate.mode === 'powerBi', 'mode must be react or powerBi.', errors);
  pushValidationError(!!candidate.project && typeof candidate.project === 'object', 'project is required.', errors);
  pushValidationError(typeof candidate.project?.scenario === 'string', 'project.scenario is required.', errors);
  pushValidationError(Array.isArray(candidate.views), 'views must be an array.', errors);
  pushValidationError((candidate.views?.length || 0) > 0, 'At least one view is required.', errors);

  for (const [viewIndex, view] of (candidate.views || []).entries()) {
    pushValidationError(typeof view.id === 'string', `views[${viewIndex}].id is required.`, errors);
    pushValidationError(Array.isArray(view.components), `views[${viewIndex}].components must be an array.`, errors);
    for (const [componentIndex, component] of (view.components || []).entries()) {
      const prefix = `views[${viewIndex}].components[${componentIndex}]`;
      pushValidationError(typeof component.id === 'string', `${prefix}.id is required.`, errors);
      pushValidationError(typeof component.type === 'string', `${prefix}.type is required.`, errors);
      pushValidationError(!!component.layout && typeof component.layout === 'object', `${prefix}.layout is required.`, errors);
      pushValidationError(!!component.dataRequirements && typeof component.dataRequirements === 'object', `${prefix}.dataRequirements is required.`, errors);
      pushValidationError(!!component.exportTargets?.react?.status, `${prefix}.exportTargets.react.status is required.`, errors);
      pushValidationError(!!component.exportTargets?.powerBi?.status, `${prefix}.exportTargets.powerBi.status is required.`, errors);
    }
  }

  pushValidationError(!!candidate.dataContract && typeof candidate.dataContract === 'object', 'dataContract is required.', errors);
  pushValidationError(Array.isArray(candidate.dataContract?.metrics), 'dataContract.metrics must be an array.', errors);
  pushValidationError(Array.isArray(candidate.dataContract?.dimensions), 'dataContract.dimensions must be an array.', errors);
  pushValidationError(Array.isArray(candidate.dataContract?.fields), 'dataContract.fields must be an array.', errors);

  return { valid: errors.length === 0, errors };
};

export const summarizePhantomSpec = (spec: PhantomSpec): PhantomSpecSummary => {
  const components = getSpecComponents(spec);
  const powerBi = components.reduce<Record<string, number>>((acc, component) => {
    const status = component.exportTargets.powerBi.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    specVersion: spec.specVersion,
    mode: spec.mode,
    scenario: spec.project.scenario,
    views: spec.views.length,
    components: components.length,
    metrics: spec.dataContract.metrics,
    dimensions: spec.dataContract.dimensions,
    powerBi,
  };
};

const getDataContractFieldKind = (spec: PhantomSpec, field: string): PhantomDataContractField['kind'] => {
  if (spec.dataContract.metrics.includes(field)) return 'metric';
  if (spec.dataContract.dimensions.includes(field)) return 'dimension';
  return 'field';
};

const markdownList = (items: string[]) => (items.length ? items.map((item) => `- ${item}`).join('\n') : '- None specified');

const createWorkshopIntent = (specification: DashboardSpecification): PhantomWorkshopIntent => ({
  businessQuestions: specification.businessQuestions,
  audience: specification.audience,
  decisions: specification.decisions,
  acceptanceCriteria: specification.acceptanceCriteria,
  buildNotes: specification.buildNotes,
});

const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

const WORKSHOP_INTENT_REQUIRED_FIELDS: Array<{ key: keyof PhantomWorkshopIntent; label: string }> = [
  { key: 'businessQuestions', label: 'business questions' },
  { key: 'audience', label: 'audience' },
  { key: 'decisions', label: 'decisions/actions' },
  { key: 'acceptanceCriteria', label: 'acceptance criteria' },
];

const createWorkshopIntentCompleteness = (
  intent: PhantomWorkshopIntent,
): PhantomWorkshopIntentCompleteness => {
  const present = WORKSHOP_INTENT_REQUIRED_FIELDS
    .filter((field) => hasText(intent[field.key]))
    .map((field) => field.label);
  const missing = WORKSHOP_INTENT_REQUIRED_FIELDS
    .filter((field) => !hasText(intent[field.key]))
    .map((field) => field.label);

  return {
    complete: missing.length === 0,
    present,
    missing,
  };
};

export const createPhantomWorkshopIntentCompleteness = (spec: PhantomSpec): PhantomWorkshopIntentCompleteness =>
  createWorkshopIntentCompleteness(createWorkshopIntent(spec.project.specification));

export const createPhantomWorkshopIntent = (spec: PhantomSpec): PhantomWorkshopIntentInspection => {
  const intent = createWorkshopIntent(spec.project.specification);
  return {
    subject: 'workshop-intent',
    ...intent,
    completeness: createWorkshopIntentCompleteness(intent),
  };
};

export const createPhantomApprovalStatus = (spec: PhantomSpec): PhantomApprovalStatus => {
  const signOffStatus = spec.project.specification.signOffStatus || 'draft';
  const approvedForImplementation = signOffStatus === 'approved';

  return {
    subject: 'approval',
    signOffStatus,
    approvedForImplementation,
    guidance: approvedForImplementation
      ? 'Spec is approved for implementation handoff.'
      : `Spec sign-off is ${signOffStatus}; confirm client approval before treating this as an implementation contract.`,
    requiredNextSteps: approvedForImplementation
      ? []
      : ['Move sign-off status to approved after client or delivery lead review.'],
  };
};

export const createDesignSourcesMarkdown = (designSources: DesignSource[]) => {
  if (!designSources.length) return '- None specified';

  return designSources
    .map((source) => {
      const details = [
        `type: ${source.type}`,
        source.url ? `url: ${source.url}` : null,
        source.frameId ? `frame: ${source.frameId}` : null,
        source.componentId ? `component: ${source.componentId}` : null,
        source.linkedViewIds?.length ? `views: ${source.linkedViewIds.join(', ')}` : null,
        source.linkedComponentIds?.length ? `components: ${source.linkedComponentIds.join(', ')}` : null,
        source.notes ? `notes: ${source.notes}` : null,
      ].filter(Boolean);
      return `- ${source.name} (${details.join('; ')})`;
    })
    .join('\n');
};

export const createPhantomDesignMappingSummary = (designSources: DesignSource[]): PhantomDesignMappingSummary => {
  const mappedSources = designSources.filter((source) =>
    (source.linkedViewIds || []).length > 0 || (source.linkedComponentIds || []).length > 0,
  );

  return {
    totalSources: designSources.length,
    mappedSources: mappedSources.length,
    unmappedSources: designSources.length - mappedSources.length,
    linkedViewIds: uniq(designSources.flatMap((source) => source.linkedViewIds || [])),
    linkedComponentIds: uniq(designSources.flatMap((source) => source.linkedComponentIds || [])),
    sourceIdsWithoutMappings: designSources
      .filter((source) => (source.linkedViewIds || []).length === 0 && (source.linkedComponentIds || []).length === 0)
      .map((source) => source.id),
  };
};

export const createPhantomDesignWorkflow = (spec: PhantomSpec): PhantomDesignWorkflow => {
  const entryPoint = spec.project.designEntryPoint;
  const mapping = createPhantomDesignMappingSummary(spec.project.designSources);
  const isFigmaLed = entryPoint === 'figma-led';
  const status: PhantomDesignWorkflowStatus = !isFigmaLed
    ? 'ready'
    : mapping.totalSources === 0
      ? 'needs-design-source'
      : mapping.unmappedSources > 0
        ? 'needs-mapping'
        : 'ready';
  const agentCommands = [
    'npm run phantom:spec -- inspect <spec.json> design-workflow',
    'npm run phantom:spec -- inspect <spec.json> handoff-summary',
    'npm run phantom:spec -- export-handoff-pack <spec.json> <out-dir>',
  ];

  if (isFigmaLed) {
    agentCommands.splice(
      1,
      0,
      'npm run phantom:spec -- import-design-source <spec.json> --type figmaFrame --name "<name>" --url <figma-url> --views main --components <ids> --out <out-spec.json>',
    );
  }

  return {
    subject: 'design-workflow',
    entryPoint,
    designPlane: isFigmaLed ? 'figma' : 'phantom',
    phantomRole: isFigmaLed
      ? 'Import or link Figma frames/components, then attach analytics workflow, data contracts, drill-throughs, readiness checks, and React or Power BI handoff.'
      : 'Use Phantom defaults for layout, analytical components, data contracts, drill-throughs, readiness checks, and React or Power BI handoff without requiring Figma.',
    status,
    mapping,
    handoffModes: ['react-product', 'power-bi'],
    requiredNextSteps: [
      ...(isFigmaLed && mapping.totalSources === 0
        ? ['Import or link at least one Figma frame, Figma component, screenshot, or external design reference.']
        : []),
      ...(isFigmaLed && mapping.unmappedSources > 0
        ? ['Map every design source to at least one Phantom view or component before engineering handoff.']
        : []),
      'Capture workshop intent: business questions, audience, decisions/actions, and acceptance criteria.',
      'Choose React Product Mode for custom analytical apps, Power BI Mode for constrained Power BI-safe report specs, or keep both tracks for comparison.',
      'Export the handoff pack and use the generated readiness report, data contract, React backlog, and Power BI build matrix as the implementation source of truth.',
    ],
    agentCommands,
  };
};

const componentName = (type: string) =>
  `${type
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') || 'Analytical'}Component`;

export const createReactImplementationBacklog = (spec: PhantomSpec): PhantomReactImplementationTask[] =>
  getSpecComponents(spec).map((component) => {
    const fields = component.dataRequirements.fields;
    const linkedDesignSources = spec.project.designSources
      .filter((source) => (source.linkedComponentIds || []).includes(component.id))
      .map((source) => source.id);
    const workItems = [
      `Replace placeholder with ${componentName(component.type)}.`,
      fields.length
        ? `Bind data fields: ${fields.join(', ')}.`
        : 'Confirm whether this component is design-only or needs a data binding.',
      'Apply interaction, filter, and drill behavior from the Phantom Spec.',
    ];
    if (spec.project.designSources.length > 0) {
      workItems.push('Apply linked design-source guidance for visual fidelity.');
    }
    if (component.exportTargets.powerBi.status !== 'ready') {
      workItems.push(`React implementation can exceed Power BI constraints; Power BI status is ${component.exportTargets.powerBi.status}.`);
    }

    return {
      componentId: component.id,
      title: component.title,
      type: component.type,
      suggestedComponent: componentName(component.type),
      designSources: linkedDesignSources,
      fields,
      metrics: component.dataRequirements.metrics,
      dimensions: component.dataRequirements.dimensions,
      powerBiStatus: component.exportTargets.powerBi.status,
      workItems,
    };
  });

export const createReactImplementationBacklogMarkdown = (tasks: PhantomReactImplementationTask[]) => {
  if (!tasks.length) return '- No components to implement.';

  return tasks
    .map((task) => `### ${task.title}

- Component ID: ${task.componentId}
- Type: ${task.type}
- Suggested React component: ${task.suggestedComponent}
- Linked design sources: ${task.designSources.join(', ') || 'None'}
- Required fields: ${task.fields.join(', ') || 'None'}
- Metrics: ${task.metrics.join(', ') || 'None'}
- Dimensions: ${task.dimensions.join(', ') || 'None'}
- Power BI compatibility: ${task.powerBiStatus}

${task.workItems.map((item) => `- [ ] ${item}`).join('\n')}`)
    .join('\n\n');
};

export const createHandoffRecommendation = (
  reactReady: boolean,
  powerBiReady: boolean,
): PhantomHandoffRecommendation => {
  if (reactReady && powerBiReady) {
    return {
      target: 'dual-track',
      guidance: 'Ready for both React Product Mode and Power BI Mode handoff.',
    };
  }
  if (reactReady) {
    return {
      target: 'react-product',
      guidance: 'Use React Product Mode for this handoff; resolve Power BI blockers before treating it as Power BI-ready.',
    };
  }
  if (powerBiReady) {
    return {
      target: 'power-bi',
      guidance: 'Use Power BI Mode for this handoff; resolve React blockers before generating React implementation work.',
    };
  }
  return {
    target: 'fix-before-handoff',
    guidance: 'Resolve readiness blockers before using this spec for implementation handoff.',
  };
};

export const createHandoffNextActions = (
  reactReadiness: PhantomReadinessReport,
  powerBiReadiness: PhantomReadinessReport,
) => [
  ...reactReadiness.errors.map((issue) => `React blocker: ${issue.message}`),
  ...reactReadiness.warnings.map((issue) => `React warning: ${issue.message}`),
  ...powerBiReadiness.errors.map((issue) => `Power BI blocker: ${issue.message}`),
  ...powerBiReadiness.warnings.map((issue) => `Power BI warning: ${issue.message}`),
];

export const createPhantomDataContract = (
  spec: PhantomSpec,
  generatedAt = new Date().toISOString(),
): PhantomDataContract => {
  const components = spec.views.flatMap((view) =>
    view.components.map((component) => {
      const designSources = spec.project.designSources
        .filter((source) => (source.linkedComponentIds || []).includes(component.id))
        .map((source) => source.id);

      return {
        viewId: view.id,
        viewName: view.name,
        componentId: component.id,
        title: component.title,
        type: component.type,
        designSources,
        fields: component.dataRequirements.fields,
        metrics: component.dataRequirements.metrics,
        dimensions: component.dataRequirements.dimensions,
        filters: (component.props as Record<string, unknown>).filters || [],
        expectedGrain: (component.props as Record<string, unknown>).grain || null,
        exportTargets: component.exportTargets,
      };
    }),
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
      signOffStatus: spec.project.specification.signOffStatus || 'draft',
      designEntryPoint: spec.project.designEntryPoint,
      designSources: spec.project.designSources,
    },
    designWorkflow: createPhantomDesignWorkflow(spec),
    workshopIntent: createWorkshopIntent(spec.project.specification),
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
    .map((component) => `| ${component.componentId} | ${component.title} | ${component.type} | ${component.designSources.join(', ') || 'None'} | ${component.fields.join(', ') || 'None'} |`)
    .join('\n');
  const drillRows = contract.drillActions
    .map((action) => `| ${action.id} | ${action.label} | ${action.sourceComponentId} | ${action.targetType}:${action.targetId} | ${action.context.map((context) => `${context.source}->${context.target}`).join(', ') || 'None'} |`)
    .join('\n');

  return `# ${contract.project.scenario} Data Contract

Generated from Phantom Spec ${contract.sourceSpecVersion}.

## Project

- Mode: ${contract.project.mode}
- Sign-off: ${contract.project.signOffStatus || 'draft'}
- Entry point: ${contract.project.designEntryPoint}
- Design sources: ${contract.project.designSources.length}

## Design Sources

${createDesignSourcesMarkdown(contract.project.designSources)}

## Design Workflow

- Design plane: ${contract.designWorkflow.designPlane}
- Phantom role: ${contract.designWorkflow.phantomRole}
- Status: ${contract.designWorkflow.status}
- Handoff modes: ${contract.designWorkflow.handoffModes.join(', ')}

### Design Workflow Next Steps

${markdownList(contract.designWorkflow.requiredNextSteps)}

## Workshop Intent

- Business questions: ${contract.workshopIntent.businessQuestions || 'Not specified'}
- Audience: ${contract.workshopIntent.audience || 'Not specified'}
- Decisions/actions: ${contract.workshopIntent.decisions || 'Not specified'}
- Acceptance criteria: ${contract.workshopIntent.acceptanceCriteria || 'Not specified'}
- Build notes: ${contract.workshopIntent.buildNotes || 'Not specified'}

## Metrics

${markdownList(contract.metrics)}

## Dimensions

${markdownList(contract.dimensions)}

## Fields

| Field | Kind | Required By |
| --- | --- | --- |
${fieldRows || '| None | field | None |'}

## Components

| Component ID | Title | Type | Design Sources | Required Fields |
| --- | --- | --- | --- | --- |
${componentRows || '| None | None | None | None | None |'}

## Drill Actions

| Action ID | Label | Source | Target | Context |
| --- | --- | --- | --- | --- |
${drillRows || '| None | None | None | None | None |'}

## Implementation Notes

${markdownList(contract.implementationNotes)}
`;
};

export const createPowerBiImplementationGuide = (
  spec: PhantomSpec,
  generatedAt = new Date().toISOString(),
): PhantomPowerBiImplementationGuide => {
  const components = getSpecComponents(spec);
  const readyVisuals = components.filter((component) => component.exportTargets.powerBi.status === 'ready').length;
  const approximateVisuals = components.filter((component) => component.exportTargets.powerBi.status === 'approximate').length;
  const unsupportedVisuals = components.filter((component) => component.exportTargets.powerBi.status === 'unsupported').length;

  return {
    guideVersion: '0.1.0',
    sourceSpecVersion: spec.specVersion,
    generatedAt,
    project: {
      scenario: spec.project.scenario,
      sourceMode: spec.mode,
      signOffStatus: spec.project.specification.signOffStatus || 'draft',
      designEntryPoint: spec.project.designEntryPoint,
      designSources: spec.project.designSources,
    },
    designWorkflow: createPhantomDesignWorkflow(spec),
    workshopIntent: createWorkshopIntent(spec.project.specification),
    readiness: checkPhantomReadiness(spec, 'powerBi'),
    summary: {
      views: spec.views.length,
      components: components.length,
      readyVisuals,
      approximateVisuals,
      unsupportedVisuals,
      drillActions: spec.interactions.drillActions.length,
    },
    components: components.map((component) => ({
      id: component.id,
      title: component.title,
      type: component.type,
      powerBiStatus: component.exportTargets.powerBi.status,
      designSources: spec.project.designSources
        .filter((source) => (source.linkedComponentIds || []).includes(component.id))
        .map((source) => source.id),
      fields: component.dataRequirements.fields,
      metrics: component.dataRequirements.metrics,
      dimensions: component.dataRequirements.dimensions,
      notes: component.exportTargets.powerBi.notes,
    })),
    drillActions: spec.interactions.drillActions,
    buildChecklist: [
      'Confirm every unsupported visual has been replaced with a Power BI-safe alternative or moved to React Product Mode.',
      'Review approximate visuals and choose the nearest native Power BI visual or document a custom visual requirement.',
      'Create field wells from each component data requirement before styling visuals.',
      'Implement drill-through pages or buttons for supported drill actions and document any behavior that requires bookmarks or custom navigation.',
      'Apply theme palette, typography, spacing, and design-source references after data bindings are correct.',
      'Run a final Power BI readiness check before client handoff.',
    ],
  };
};

export const createPowerBiImplementationGuideMarkdown = (guide: PhantomPowerBiImplementationGuide) => {
  const componentRows = guide.components
    .map((component) => `| ${component.id} | ${component.title} | ${component.type} | ${component.powerBiStatus} | ${component.designSources.join(', ') || 'None'} | ${component.fields.join(', ') || 'None'} | ${component.notes.join(' ') || 'None'} |`)
    .join('\n');
  const drillRows = guide.drillActions
    .map((action) => `| ${action.id} | ${action.label} | ${action.sourceComponentId} | ${action.targetType}:${action.targetId} | ${action.context.map((context) => `${context.source}->${context.target}`).join(', ') || 'None'} | ${action.preserveFilters ? 'Yes' : 'No'} |`)
    .join('\n');
  const blockerList = [
    ...guide.readiness.errors.map((issue) => `- ERROR ${issue.code}: ${issue.message}`),
    ...guide.readiness.warnings.map((issue) => `- WARNING ${issue.code}: ${issue.message}`),
  ];

  return `# ${guide.project.scenario} Power BI Implementation Guide

Generated from Phantom Spec ${guide.sourceSpecVersion}.

## Readiness

- Ready for Power BI handoff: ${guide.readiness.ready ? 'Yes' : 'No'}
- Source mode: ${guide.project.sourceMode}
- Sign-off: ${guide.project.signOffStatus || 'draft'}
- Entry point: ${guide.project.designEntryPoint}
- Design sources: ${guide.project.designSources.length}
- Components: ${guide.summary.components}
- Ready visuals: ${guide.summary.readyVisuals}
- Approximate visuals: ${guide.summary.approximateVisuals}
- Unsupported visuals: ${guide.summary.unsupportedVisuals}
- Drill actions: ${guide.summary.drillActions}

## Design Sources

${createDesignSourcesMarkdown(guide.project.designSources)}

## Design Workflow

- Design plane: ${guide.designWorkflow.designPlane}
- Phantom role: ${guide.designWorkflow.phantomRole}
- Status: ${guide.designWorkflow.status}
- Handoff modes: ${guide.designWorkflow.handoffModes.join(', ')}

### Design Workflow Next Steps

${markdownList(guide.designWorkflow.requiredNextSteps)}

## Workshop Intent

- Business questions: ${guide.workshopIntent.businessQuestions || 'Not specified'}
- Audience: ${guide.workshopIntent.audience || 'Not specified'}
- Decisions/actions: ${guide.workshopIntent.decisions || 'Not specified'}
- Acceptance criteria: ${guide.workshopIntent.acceptanceCriteria || 'Not specified'}
- Build notes: ${guide.workshopIntent.buildNotes || 'Not specified'}

## Issues

${blockerList.length ? blockerList.join('\n') : '- None'}

## Visual Build Matrix

| Component ID | Title | Type | Power BI Status | Design Sources | Required Fields | Notes |
| --- | --- | --- | --- | --- | --- | --- |
${componentRows || '| None | None | None | ready | None | None | None |'}

## Drill-Through And Navigation

| Action ID | Label | Source | Target | Context | Preserve Filters |
| --- | --- | --- | --- | --- | --- |
${drillRows || '| None | None | None | None | None | No |'}

## Build Checklist

${markdownList(guide.buildChecklist)}
`;
};

export const createPhantomHandoffSummary = (spec: PhantomSpec): PhantomHandoffSummary => {
  const contract = createPhantomDataContract(spec);
  const reactBacklog = createReactImplementationBacklog(spec);
  const powerBiGuide = createPowerBiImplementationGuide(spec);
  const reactReadiness = checkPhantomReadiness(spec, 'react');
  const handoffRecommendation = createHandoffRecommendation(reactReadiness.ready, powerBiGuide.readiness.ready);
  const workshopIntent = createWorkshopIntent(spec.project.specification);

  return {
    subject: 'handoff-summary',
    project: {
      scenario: spec.project.scenario,
      mode: spec.mode,
      signOffStatus: spec.project.specification.signOffStatus || 'draft',
      designEntryPoint: spec.project.designEntryPoint,
      designSources: spec.project.designSources,
    },
    approval: createPhantomApprovalStatus(spec),
    designWorkflow: createPhantomDesignWorkflow(spec),
    designMapping: createPhantomDesignMappingSummary(spec.project.designSources),
    workshopIntent,
    workshopCompleteness: createWorkshopIntentCompleteness(workshopIntent),
    readiness: {
      react: reactReadiness,
      powerBi: powerBiGuide.readiness,
    },
    handoffRecommendation,
    counts: {
      views: spec.views.length,
      components: getSpecComponents(spec).length,
      fields: contract.fields.length,
      metrics: contract.metrics.length,
      dimensions: contract.dimensions.length,
      drillActions: spec.interactions.drillActions.length,
      reactImplementationTasks: reactBacklog.length,
      powerBiReadyVisuals: powerBiGuide.summary.readyVisuals,
      powerBiApproximateVisuals: powerBiGuide.summary.approximateVisuals,
      powerBiUnsupportedVisuals: powerBiGuide.summary.unsupportedVisuals,
    },
    nextActions: createHandoffNextActions(reactReadiness, powerBiGuide.readiness),
  };
};

export const checkPhantomReadiness = (spec: PhantomSpec, target: ExportMode = spec.mode): PhantomReadinessReport => {
  const errors: PhantomReadinessIssue[] = [];
  const warnings: PhantomReadinessIssue[] = [];
  const components = getSpecComponents(spec);
  const componentIds = new Set(components.map((component) => component.id));
  const viewIds = new Set(spec.views.map((view) => view.id));

  if (components.length === 0) {
    errors.push({
      severity: 'error',
      code: 'NO_COMPONENTS',
      message: 'Spec has no components to hand off.',
    });
  }

  if (spec.project.specification.signOffStatus !== 'approved') {
    warnings.push({
      severity: 'warning',
      code: 'SPEC_NOT_APPROVED',
      message: `Spec sign-off is ${spec.project.specification.signOffStatus || 'draft'}; confirm client approval before treating this as an implementation contract.`,
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

  for (const source of spec.project.designSources) {
    const missingViewIds = (source.linkedViewIds || []).filter((viewId) => !viewIds.has(viewId));
    const missingComponentIds = (source.linkedComponentIds || []).filter((componentId) => !componentIds.has(componentId));
    const isUnmapped = (source.linkedViewIds || []).length === 0 && (source.linkedComponentIds || []).length === 0;

    if (spec.project.designEntryPoint === 'figma-led' && isUnmapped) {
      warnings.push({
        severity: 'warning',
        code: 'UNMAPPED_DESIGN_SOURCE',
        message: `${source.name} is not mapped to any Phantom view or component.`,
      });
    }

    if (missingViewIds.length > 0) {
      warnings.push({
        severity: 'warning',
        code: 'BROKEN_DESIGN_SOURCE_VIEW_LINK',
        message: `${source.name} maps to missing Phantom view IDs: ${missingViewIds.join(', ')}.`,
      });
    }

    if (missingComponentIds.length > 0) {
      warnings.push({
        severity: 'warning',
        code: 'BROKEN_DESIGN_SOURCE_COMPONENT_LINK',
        message: `${source.name} maps to missing Phantom component IDs: ${missingComponentIds.join(', ')}.`,
      });
    }
  }

  if (!hasText(spec.project.specification.businessQuestions)) {
    warnings.push({
      severity: 'warning',
      code: 'MISSING_BUSINESS_QUESTIONS',
      message: 'Workshop intent has no business questions; implementation teams may not know what decisions the experience must support.',
    });
  }

  if (!hasText(spec.project.specification.audience)) {
    warnings.push({
      severity: 'warning',
      code: 'MISSING_AUDIENCE',
      message: 'Workshop intent has no audience; UX, density, and distribution decisions are underspecified.',
    });
  }

  if (!hasText(spec.project.specification.decisions)) {
    warnings.push({
      severity: 'warning',
      code: 'MISSING_DECISIONS',
      message: 'Workshop intent has no decisions or actions; implementation teams may not know what the experience should help users do.',
    });
  }

  if (!hasText(spec.project.specification.acceptanceCriteria)) {
    warnings.push({
      severity: 'warning',
      code: 'MISSING_ACCEPTANCE_CRITERIA',
      message: 'Workshop intent has no acceptance criteria for client sign-off or implementation QA.',
    });
  }

  return {
    target,
    ready: errors.length === 0,
    errors,
    warnings,
  };
};
