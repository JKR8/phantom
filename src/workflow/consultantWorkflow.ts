import type {
  DashboardSpecification,
  ExportMode,
  RequirementDisposition,
  RequirementItem,
} from '../types';
import {
  checkPhantomReadiness,
  createPhantomDataPath,
  createPhantomDesignWorkflow,
  createPhantomImplementationGate,
  createPhantomWorkshopIntentCompleteness,
  type PhantomSpec,
} from '../export';

export type ConsultantWorkflowStepId =
  | 'brief'
  | 'clarify'
  | 'design'
  | 'interactions'
  | 'data'
  | 'review'
  | 'export';

export type ConsultantWorkflowStepStatus = 'ready' | 'needs-input' | 'blocked';

export interface ConsultantWorkflowStep {
  id: ConsultantWorkflowStepId;
  label: string;
  status: ConsultantWorkflowStepStatus;
  summary: string;
  nextAction?: string;
}

export interface RequirementSuggestion {
  id: string;
  title: string;
  detail: string;
  disposition: RequirementDisposition;
  ownerRole: string;
  source: 'readiness_check' | 'system';
  linkedComponentIds?: string[];
}

export interface ConsultantWorkflowModel {
  steps: ConsultantWorkflowStep[];
  suggestions: RequirementSuggestion[];
  openRequirements: RequirementItem[];
  resolvedRequirements: RequirementItem[];
  counts: Record<RequirementDisposition, number>;
}

const emptyCounts = (): Record<RequirementDisposition, number> => ({
  client_decision: 0,
  consultant_task: 0,
  assumption: 0,
  accepted_gap: 0,
  export_blocker: 0,
});

const hasText = (value: unknown) => typeof value === 'string' && value.trim().length > 0;

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const classifyReadinessIssue = (
  code: string,
  target: ExportMode,
): Pick<RequirementSuggestion, 'disposition' | 'ownerRole'> => {
  if (code === 'SPEC_NOT_APPROVED') {
    return { disposition: 'client_decision', ownerRole: 'client_stakeholder' };
  }
  if (code.startsWith('MISSING_')) {
    return { disposition: 'client_decision', ownerRole: 'facilitator' };
  }
  if (code === 'POWER_BI_UNSUPPORTED_VISUAL') {
    return { disposition: 'export_blocker', ownerRole: 'solution_architect' };
  }
  if (code === 'POWER_BI_APPROXIMATE_VISUAL') {
    return { disposition: 'consultant_task', ownerRole: 'consultant' };
  }
  if (code === 'NO_DATA_REQUIREMENTS' || code === 'DRILL_ACTION_WITHOUT_CONTEXT') {
    return { disposition: 'consultant_task', ownerRole: 'consultant' };
  }
  return {
    disposition: target === 'powerBi' ? 'export_blocker' : 'consultant_task',
    ownerRole: 'consultant',
  };
};

const suggestionFromIssue = (
  issue: { code: string; message: string; componentId?: string },
  target: ExportMode,
): RequirementSuggestion => {
  const classification = classifyReadinessIssue(issue.code, target);
  return {
    id: `readiness-${target}-${slug(issue.code)}-${slug(issue.componentId || issue.message)}`,
    title: issue.code.replace(/_/g, ' ').toLowerCase(),
    detail: issue.message,
    source: 'readiness_check',
    linkedComponentIds: issue.componentId ? [issue.componentId] : undefined,
    ...classification,
  };
};

const uniqueSuggestions = (suggestions: RequirementSuggestion[]) => {
  const seen = new Set<string>();
  return suggestions.filter((suggestion) => {
    const key = `${suggestion.title}::${suggestion.detail}::${suggestion.disposition}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const createRequirementItemFromSuggestion = (
  suggestion: RequirementSuggestion,
  overrides: Partial<RequirementItem> = {},
): RequirementItem => {
  const now = new Date().toISOString();
  return {
    id: `req-${slug(suggestion.id)}-${Date.now()}`,
    title: suggestion.title,
    detail: suggestion.detail,
    disposition: suggestion.disposition,
    status: 'open',
    ownerRole: suggestion.ownerRole,
    source: suggestion.source,
    linkedComponentIds: suggestion.linkedComponentIds,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

export const createConsultantWorkflowModel = (spec: PhantomSpec): ConsultantWorkflowModel => {
  const specification: DashboardSpecification = spec.project.specification || {};
  const requirementItems = specification.requirementItems || [];
  const openRequirements = requirementItems.filter((item) => item.status !== 'resolved');
  const resolvedRequirements = requirementItems.filter((item) => item.status === 'resolved');
  const counts = requirementItems.reduce((acc, item) => {
    acc[item.disposition] += 1;
    return acc;
  }, emptyCounts());

  const intent = createPhantomWorkshopIntentCompleteness(spec);
  const dataPath = createPhantomDataPath(spec);
  const designWorkflow = createPhantomDesignWorkflow(spec);
  const implementationGate = createPhantomImplementationGate(spec);
  const reactReadiness = checkPhantomReadiness(spec, 'react');
  const powerBiReadiness = checkPhantomReadiness(spec, 'powerBi');
  const components = spec.views.flatMap((view) => view.components);
  const hasRawNotes = hasText(specification.rawRequirementNotes);
  const hasClientOpenItems = openRequirements.some((item) => item.disposition === 'client_decision');
  const hasExportBlockers = openRequirements.some((item) => item.disposition === 'export_blocker')
    || implementationGate.blockingReasons.length > 0;

  const readinessSuggestions = uniqueSuggestions([
    ...reactReadiness.errors.map((issue) => suggestionFromIssue(issue, 'react')),
    ...reactReadiness.warnings.map((issue) => suggestionFromIssue(issue, 'react')),
    ...powerBiReadiness.errors.map((issue) => suggestionFromIssue(issue, 'powerBi')),
    ...powerBiReadiness.warnings.map((issue) => suggestionFromIssue(issue, 'powerBi')),
    ...dataPath.requiredNextSteps.map((step) => ({
      id: `data-path-${slug(step)}`,
      title: 'data path needs refinement',
      detail: step,
      disposition: step.toLowerCase().includes('source system')
        ? 'client_decision'
        : 'consultant_task' as RequirementDisposition,
      ownerRole: step.toLowerCase().includes('source system')
        ? 'client_stakeholder'
        : 'consultant',
      source: 'system' as const,
    })),
    ...designWorkflow.requiredNextSteps.map((step) => ({
      id: `design-workflow-${slug(step)}`,
      title: 'design source needs refinement',
      detail: step,
      disposition: designWorkflow.entryPoint === 'figma-led'
        ? 'client_decision'
        : 'consultant_task' as RequirementDisposition,
      ownerRole: designWorkflow.entryPoint === 'figma-led'
        ? 'client_stakeholder'
        : 'consultant',
      source: 'system' as const,
    })),
  ]);

  const existingTitles = new Set(requirementItems.map((item) => `${item.title}::${item.detail || ''}`));
  const suggestions = readinessSuggestions.filter((suggestion) =>
    !existingTitles.has(`${suggestion.title}::${suggestion.detail}`),
  );

  const steps: ConsultantWorkflowStep[] = [
    {
      id: 'brief',
      label: 'Brief',
      status: intent.complete ? 'ready' : hasRawNotes ? 'needs-input' : 'blocked',
      summary: intent.complete
        ? 'Workshop intent is captured.'
        : `Missing ${intent.missing.join(', ') || 'workshop context'}.`,
      nextAction: intent.complete ? undefined : 'Capture the client question, audience, action, and acceptance criteria.',
    },
    {
      id: 'clarify',
      label: 'Clarify',
      status: hasClientOpenItems || suggestions.length > 0 ? 'needs-input' : 'ready',
      summary: `${openRequirements.length} open requirement item${openRequirements.length === 1 ? '' : 's'}.`,
      nextAction: suggestions.length > 0 ? 'Classify generated prompts as client decisions, consultant tasks, assumptions, gaps, or blockers.' : undefined,
    },
    {
      id: 'design',
      label: 'Design',
      status: components.length > 0 && designWorkflow.status === 'ready'
        ? 'ready'
        : components.length > 0
          ? 'needs-input'
          : 'blocked',
      summary: `${components.length} component${components.length === 1 ? '' : 's'} on the canvas.`,
      nextAction: components.length === 0 ? 'Add visuals, filters, tables, and narrative elements to the canvas.' : designWorkflow.requiredNextSteps[0],
    },
    {
      id: 'interactions',
      label: 'Interactions',
      status: spec.interactions.drillActions.length > 0 ? 'ready' : 'needs-input',
      summary: `${spec.interactions.drillActions.length} drill or journey action${spec.interactions.drillActions.length === 1 ? '' : 's'}.`,
      nextAction: spec.interactions.drillActions.length === 0 ? 'Define what happens when a stakeholder clicks a KPI, chart mark, table row, or filter.' : undefined,
    },
    {
      id: 'data',
      label: 'Data',
      status: dataPath.requiredNextSteps.length === 0 ? 'ready' : 'needs-input',
      summary: dataPath.requiredNextSteps.length === 0
        ? 'Data path is mapped.'
        : `${dataPath.requiredNextSteps.length} data mapping task${dataPath.requiredNextSteps.length === 1 ? '' : 's'}.`,
      nextAction: dataPath.requiredNextSteps[0],
    },
    {
      id: 'review',
      label: 'Review',
      status: implementationGate.approvedForImplementation
        ? 'ready'
        : implementationGate.workshopIntentComplete
          ? 'needs-input'
          : 'blocked',
      summary: implementationGate.approvedForImplementation ? 'Approved for handoff.' : 'Not yet approved.',
      nextAction: implementationGate.approvedForImplementation ? undefined : 'Review client-facing decisions and move sign-off to approved.',
    },
    {
      id: 'export',
      label: 'Export',
      status: implementationGate.readyForImplementation
        ? 'ready'
        : hasExportBlockers
          ? 'blocked'
          : 'needs-input',
      summary: implementationGate.readyForImplementation ? 'Spec is build-ready.' : 'Handoff pack needs more decisions.',
      nextAction: implementationGate.requiredNextSteps[0],
    },
  ];

  return {
    steps,
    suggestions,
    openRequirements,
    resolvedRequirements,
    counts,
  };
};
