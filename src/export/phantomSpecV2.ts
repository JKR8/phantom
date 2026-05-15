import { parseDocument, stringify } from 'yaml';

export const PHANTOM_V2_SCHEMA_ID = 'phantom.spec.v0.2';

export interface PhantomSpecV2BlockHeader {
  id: string;
  type: string;
  version: number;
}

export interface PhantomSpecV2Block {
  header: PhantomSpecV2BlockHeader;
  body: Record<string, unknown>;
  raw: string;
  startLine: number;
}

export interface PhantomSpecV2Document {
  frontmatter: Record<string, unknown>;
  markdown: string;
  blocks: PhantomSpecV2Block[];
}

export interface PhantomSpecV2ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  blockId?: string;
  line?: number;
}

export interface PhantomSpecV2ValidationResult {
  valid: boolean;
  errors: PhantomSpecV2ValidationIssue[];
  warnings: PhantomSpecV2ValidationIssue[];
}

export type PhantomSpecV2ReadinessTarget = 'react' | 'power_bi';

export interface PhantomSpecV2ReadinessCategoryScore {
  weight: number;
  numerator: number;
  denominator: number;
  score: number;
  contribution: number;
}

export interface PhantomSpecV2ReadinessGateResult {
  id: string;
  passed: boolean;
  message: string;
}

export interface PhantomSpecV2ReadinessScore {
  target: PhantomSpecV2ReadinessTarget;
  threshold: number;
  score: number;
  buildReady: boolean;
  categories: {
    requiredFieldsCompleteness: PhantomSpecV2ReadinessCategoryScore;
    metricCompleteness: PhantomSpecV2ReadinessCategoryScore;
    interactionCompleteness: PhantomSpecV2ReadinessCategoryScore;
    targetRenderCompatibility: PhantomSpecV2ReadinessCategoryScore;
  };
  gates: PhantomSpecV2ReadinessGateResult[];
  blockingIssues: PhantomSpecV2ValidationIssue[];
}

export interface PhantomSpecV2MetricRegistryEntry {
  id: string;
  displayName?: string;
  definition?: string;
  formula?: string;
  grain?: string;
  nullBehavior?: string;
  ownerRole?: string;
  sourceBinding?: unknown;
  comparisonRules?: unknown;
  complete: boolean;
  missingFields: string[];
}

export interface PhantomSpecV2AcceptedGap {
  fieldId?: string;
  fieldLabel?: string;
  fieldType?: string;
  ownerRole?: string;
  reason?: string;
  resolutionTarget?: string;
  readinessImpact?: string;
  complete: boolean;
  missingFields: string[];
}

export interface PhantomSpecV2ApprovalStatus {
  state?: string;
  currentVersion?: string;
  documentVersion?: string;
  requiredApprovals: string[];
  approved: boolean;
  stale: boolean;
  missingApprovalRoles: string[];
  currentVersionEvent?: Record<string, unknown>;
  history: Record<string, unknown>[];
}

export interface PhantomSpecV2Summary {
  schemaId?: unknown;
  id?: unknown;
  name?: unknown;
  version?: unknown;
  status?: unknown;
  roles: string[];
  exportTargets: unknown[];
  blocks: Array<PhantomSpecV2BlockHeader & { startLine: number }>;
  counts: {
    pages: number;
    components: number;
    metrics: number;
    fields: number;
    interactions: number;
    acceptedGaps: number;
    unresolvedPrompts: number;
  };
  readiness: PhantomSpecV2ReadinessScore;
  approval: PhantomSpecV2ApprovalStatus;
}

export interface PhantomSpecV2ApprovalPack {
  generatedAt: string;
  summary: PhantomSpecV2Summary;
  approval: PhantomSpecV2ApprovalStatus;
  readiness: {
    react: PhantomSpecV2ReadinessScore;
    powerBi: PhantomSpecV2ReadinessScore;
  };
  metrics: PhantomSpecV2MetricRegistryEntry[];
  acceptedGaps: PhantomSpecV2AcceptedGap[];
  elicitationPrompts: PhantomSpecV2ElicitationPrompt[];
  interactions: Record<string, unknown>[];
  exportTargets: Record<string, unknown>[];
}

export interface PhantomSpecV2ComponentContract {
  id: string;
  pageId?: string;
  type?: string;
  title?: string;
  bindings: Record<string, unknown>;
  renderTargets: Record<string, unknown>;
  acceptance: string[];
  unresolvedPrompts: PhantomSpecV2ElicitationPrompt[];
}

export interface PhantomSpecV2DataContractExport {
  generatedAt: string;
  derivation?: string;
  fields: Record<string, unknown>[];
  metrics: PhantomSpecV2MetricRegistryEntry[];
  acceptedGaps: PhantomSpecV2AcceptedGap[];
  unresolvedPrompts: PhantomSpecV2ElicitationPrompt[];
}

export interface PhantomSpecV2ReactProductExport {
  generatedAt: string;
  target: 'react';
  buildReady: boolean;
  readiness: PhantomSpecV2ReadinessScore;
  summary: PhantomSpecV2Summary;
  pages: Record<string, unknown>[];
  components: PhantomSpecV2ComponentContract[];
  dataContract: PhantomSpecV2DataContractExport;
  routeManifest: Array<{
    id: string;
    title?: string;
    path: string;
    componentIds: string[];
  }>;
  implementationNotes: string[];
}

export interface PhantomSpecV2PowerBiExport {
  generatedAt: string;
  target: 'power_bi';
  buildReady: boolean;
  readiness: PhantomSpecV2ReadinessScore;
  summary: PhantomSpecV2Summary;
  visualBuildMatrix: Array<{
    componentId: string;
    title?: string;
    type?: string;
    powerBiStatus?: unknown;
    guidance: string;
    fallbackRequired: boolean;
  }>;
  acceptedGaps: PhantomSpecV2AcceptedGap[];
  constraints: string[];
}

export interface PhantomSpecV2ElicitationPrompt {
  id: string;
  ruleId?: string;
  objectType: 'component' | 'metric' | 'interaction' | 'data_field';
  objectId: string;
  fieldPath: string;
  state: 'unanswered' | 'accepted_gap';
  ownerRole?: string;
  severity: 'info' | 'warning' | 'error';
  prompt: string;
  reason: string;
}

export interface PhantomSpecV2ApprovalInput {
  approver: string;
  role: string;
  state?: 'approved' | 'rejected' | 'revoked' | 'pending';
  notes?: string;
  date?: string;
}

export interface PhantomSpecV2PromptResolutionInput {
  objectType: 'component';
  objectId: string;
  fieldPath: string;
  value: string;
  ownerRole?: string;
  notes?: string;
  date?: string;
}

const requiredBlockIds = [
  'pages',
  'component_library',
  'component_instances',
  'metrics',
  'readiness_scoring',
  'data_contract_preview',
  'interactions',
  'elicitation_rules',
  'export_targets',
  'v1_acceptance_criteria',
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const asRecords = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

const hasText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const hasValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return value !== undefined && value !== null && value !== '';
};

const getBlock = (document: PhantomSpecV2Document, id: string) =>
  document.blocks.find((block) => block.header.id === id);

const stringIds = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
      .map((item) => (isRecord(item) ? item.id : item))
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];

const missingKeys = (record: Record<string, unknown>, keys: string[]) =>
  keys.filter((key) => !hasValue(record[key]));

const parseYaml = (raw: string, label: string): Record<string, unknown> => {
  const document = parseDocument(raw);
  if (document.errors.length > 0) {
    throw new Error(`${label} YAML parse failed: ${document.errors.map((error) => error.message).join('; ')}`);
  }
  const parsed = document.toJSON();
  if (!isRecord(parsed)) {
    throw new Error(`${label} YAML must parse to an object.`);
  }
  return parsed;
};

const stringifyYaml = (value: Record<string, unknown>) => stringify(value).trimEnd();

const extractFrontmatter = (markdown: string) => {
  const normalized = markdown.replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---')) {
    return {
      frontmatter: {},
      body: normalized,
    };
  }
  const closing = normalized.indexOf('\n---', 3);
  if (closing < 0) {
    throw new Error('Frontmatter opening marker found without a closing marker.');
  }
  const rawFrontmatter = normalized.slice(3, closing).trim();
  const bodyStart = normalized.indexOf('\n', closing + 4);

  return {
    frontmatter: parseYaml(rawFrontmatter, 'Frontmatter'),
    body: bodyStart >= 0 ? normalized.slice(bodyStart + 1) : '',
  };
};

const lineNumberAt = (text: string, index: number) =>
  text.slice(0, index).split(/\r?\n/).length;

export const parsePhantomSpecV2Markdown = (markdown: string): PhantomSpecV2Document => {
  const { frontmatter, body } = extractFrontmatter(markdown);
  const blocks: PhantomSpecV2Block[] = [];
  const blockPattern = /```ya?ml\s*\r?\n([\s\S]*?)\r?\n```/g;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(body)) !== null) {
    const raw = match[1];
    const parsed = parseYaml(raw, `YAML block at line ${lineNumberAt(body, match.index)}`);
    const phantomBlock = parsed.phantom_block;
    if (!isRecord(phantomBlock)) {
      continue;
    }
    const { id, type, version } = phantomBlock;
    if (typeof id !== 'string' || typeof type !== 'string' || typeof version !== 'number') {
      throw new Error(`phantom_block at line ${lineNumberAt(body, match.index)} must include string id/type and numeric version.`);
    }
    blocks.push({
      header: { id, type, version },
      body: parsed,
      raw,
      startLine: lineNumberAt(body, match.index),
    });
  }

  return {
    frontmatter,
    markdown: body,
    blocks,
  };
};

const pushIssue = (
  issues: PhantomSpecV2ValidationIssue[],
  issue: Omit<PhantomSpecV2ValidationIssue, 'severity'> & { severity?: PhantomSpecV2ValidationIssue['severity'] },
) => {
  issues.push({
    severity: issue.severity || 'error',
    code: issue.code,
    message: issue.message,
    blockId: issue.blockId,
    line: issue.line,
  });
};

export const validatePhantomSpecV2Document = (document: PhantomSpecV2Document): PhantomSpecV2ValidationResult => {
  const errors: PhantomSpecV2ValidationIssue[] = [];
  const warnings: PhantomSpecV2ValidationIssue[] = [];
  const addError = (issue: Omit<PhantomSpecV2ValidationIssue, 'severity'>) => pushIssue(errors, issue);
  const addWarning = (issue: Omit<PhantomSpecV2ValidationIssue, 'severity'>) => pushIssue(warnings, { ...issue, severity: 'warning' });

  if (document.frontmatter.schema_id !== PHANTOM_V2_SCHEMA_ID) {
    addError({
      code: 'INVALID_SCHEMA_ID',
      message: `Expected frontmatter schema_id to be ${PHANTOM_V2_SCHEMA_ID}.`,
    });
  }
  if (document.frontmatter.phantom_spec_version !== 0.2) {
    addError({
      code: 'INVALID_SPEC_VERSION',
      message: 'Expected frontmatter phantom_spec_version to be 0.2.',
    });
  }
  if (!Array.isArray(document.frontmatter.roles) || document.frontmatter.roles.length === 0) {
    addError({
      code: 'MISSING_ROLES',
      message: 'Frontmatter must define at least one role.',
    });
  }
  if (!Array.isArray(document.frontmatter.export_targets) || document.frontmatter.export_targets.length === 0) {
    addError({
      code: 'MISSING_EXPORT_TARGETS',
      message: 'Frontmatter must define export_targets.',
    });
  }

  const blocksById = new Map<string, PhantomSpecV2Block>();
  for (const block of document.blocks) {
    if (blocksById.has(block.header.id)) {
      addError({
        code: 'DUPLICATE_BLOCK_ID',
        message: `Duplicate phantom_block id: ${block.header.id}.`,
        blockId: block.header.id,
        line: block.startLine,
      });
    }
    blocksById.set(block.header.id, block);
    if (block.header.version !== 0.2) {
      addWarning({
        code: 'UNEXPECTED_BLOCK_VERSION',
        message: `Block ${block.header.id} uses version ${block.header.version}; expected 0.2 for v0.2 spec blocks.`,
        blockId: block.header.id,
        line: block.startLine,
      });
    }
  }

  for (const blockId of requiredBlockIds) {
    if (!blocksById.has(blockId)) {
      addError({
        code: 'MISSING_REQUIRED_BLOCK',
        message: `Missing required v0.2 phantom_block: ${blockId}.`,
        blockId,
      });
    }
  }

  const pages = blocksById.get('pages')?.body.pages;
  if (!Array.isArray(pages) || pages.length === 0) {
    addError({
      code: 'MISSING_PAGES',
      message: 'The pages block must define at least one page.',
      blockId: 'pages',
    });
  }

  const metrics = blocksById.get('metrics')?.body.metrics;
  if (!Array.isArray(metrics) || metrics.length === 0) {
    addError({
      code: 'MISSING_METRICS',
      message: 'The metrics block must define at least one metric.',
      blockId: 'metrics',
    });
  }

  const readinessModel = blocksById.get('readiness_scoring')?.body.readiness_model;
  if (!isRecord(readinessModel) || !isRecord(readinessModel.weighted_score)) {
    addError({
      code: 'MISSING_READINESS_MODEL',
      message: 'The readiness_scoring block must define readiness_model.weighted_score.',
      blockId: 'readiness_scoring',
    });
  }

  const acceptance = blocksById.get('v1_acceptance_criteria')?.body.criteria;
  if (!Array.isArray(acceptance) || acceptance.length === 0) {
    addError({
      code: 'MISSING_ACCEPTANCE_CRITERIA',
      message: 'The v1_acceptance_criteria block must define criteria.',
      blockId: 'v1_acceptance_criteria',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

const scoreCategory = (
  weight: number,
  numerator: number,
  denominator: number,
): PhantomSpecV2ReadinessCategoryScore => {
  const score = denominator === 0 ? 1 : numerator / denominator;

  return {
    weight,
    numerator,
    denominator,
    score,
    contribution: score * weight,
  };
};

const requiredFieldsCompleteness = (
  document: PhantomSpecV2Document,
  weight: number,
): PhantomSpecV2ReadinessCategoryScore => {
  const components = asRecords(getBlock(document, 'component_instances')?.body.components);
  const completeComponents = components.filter((component) => {
    const elicitation = isRecord(component.elicitation) ? component.elicitation : {};
    return asRecords(elicitation.missing_fields).length === 0
      && (!Array.isArray(elicitation.missing_fields) || elicitation.missing_fields.length === 0);
  });

  return scoreCategory(weight, completeComponents.length, components.length);
};

const metricCompleteness = (
  document: PhantomSpecV2Document,
  weight: number,
): PhantomSpecV2ReadinessCategoryScore => {
  const metrics = asRecords(getBlock(document, 'metrics')?.body.metrics);
  const completeMetrics = metrics.filter((metric) =>
    hasText(metric.display_name)
    && hasText(metric.definition)
    && hasText(metric.formula)
    && hasText(metric.grain)
    && hasText(metric.null_behavior)
    && hasText(metric.owner_role)
    && hasValue(metric.source_binding),
  );

  return scoreCategory(weight, completeMetrics.length, metrics.length);
};

const interactionCompleteness = (
  document: PhantomSpecV2Document,
  weight: number,
): PhantomSpecV2ReadinessCategoryScore => {
  const interactions = asRecords(getBlock(document, 'interactions')?.body.interactions);
  const completeInteractions = interactions.filter((interaction) =>
    hasText(interaction.trigger)
    && hasText(interaction.source_component)
    && hasValue(interaction.target)
    && hasValue(interaction.filter_context)
    && hasText(interaction.back_behavior)
    && hasText(interaction.permission_scope),
  );

  return scoreCategory(weight, completeInteractions.length, interactions.length);
};

const targetRenderCompatibility = (
  document: PhantomSpecV2Document,
  weight: number,
  target: PhantomSpecV2ReadinessTarget,
): PhantomSpecV2ReadinessCategoryScore => {
  const components = asRecords(getBlock(document, 'component_instances')?.body.components);
  const compatibleComponents = components.filter((component) => {
    const renderTargets = isRecord(component.render_targets) ? component.render_targets : {};
    const status = target === 'react' ? renderTargets.react : renderTargets.power_bi;
    return status === 'react_ready' || status === 'pbi_safe' || status === 'pbi_approximate';
  });

  return scoreCategory(weight, compatibleComponents.length, components.length);
};

const dataGapGate = (document: PhantomSpecV2Document): PhantomSpecV2ReadinessGateResult => {
  const dataContract = getBlock(document, 'data_contract_preview')?.body.data_contract;
  const fields = asRecords(isRecord(dataContract) ? dataContract.fields : undefined);
  const unownedGaps = fields.filter((field) =>
    field.source === 'to_be_defined'
    && (!isRecord(field.accepted_gap) || !hasText(field.accepted_gap.owner_role)),
  );

  return {
    id: 'no_unowned_data_gaps',
    passed: unownedGaps.length === 0,
    message: unownedGaps.length === 0
      ? 'All to-be-defined data gaps have accepted-gap owners.'
      : `Unowned data gaps: ${unownedGaps.map((field) => field.id).filter(Boolean).join(', ')}.`,
  };
};

const approvalGate = (document: PhantomSpecV2Document): PhantomSpecV2ReadinessGateResult => {
  const approval = isRecord(document.frontmatter.approval) ? document.frontmatter.approval : {};
  const state = approval.state;
  const currentVersion = approval.current_version;
  const history = asRecords(approval.history);
  const currentApproval = [...history].reverse().find((event) => event.version === currentVersion);
  const passed = state === 'approved'
    && currentApproval?.state === 'approved'
    && hasText(currentApproval.approver);

  return {
    id: 'current_version_approval',
    passed,
    message: passed
      ? `Current version ${currentVersion} is approved.`
      : `Current version ${String(currentVersion || 'unknown')} is not approved.`,
  };
};

const drillTargetGate = (document: PhantomSpecV2Document): PhantomSpecV2ReadinessGateResult => {
  const interactions = asRecords(getBlock(document, 'interactions')?.body.interactions);
  const broken = interactions.filter((interaction) => {
    const type = String(interaction.type || '');
    if (!type.startsWith('drill_') && type !== 'open_page' && type !== 'inspect_spec_object') return false;
    return !isRecord(interaction.target) || !hasText(interaction.target.id) || !hasText(interaction.target.type);
  });

  return {
    id: 'all_drill_targets_defined',
    passed: broken.length === 0,
    message: broken.length === 0
      ? 'All navigational and drill interactions define target type and id.'
      : `Interactions with missing targets: ${broken.map((interaction) => interaction.id).filter(Boolean).join(', ')}.`,
  };
};

export const scorePhantomSpecV2Readiness = (
  document: PhantomSpecV2Document,
  target: PhantomSpecV2ReadinessTarget = 'react',
): PhantomSpecV2ReadinessScore => {
  const readinessModelValue = getBlock(document, 'readiness_scoring')?.body.readiness_model;
  const readinessModel = isRecord(readinessModelValue)
    ? readinessModelValue
    : {};
  const weightedScore = isRecord(readinessModel.weighted_score) ? readinessModel.weighted_score : {};
  const categoryWeight = (key: string, fallback: number) => {
    const category = isRecord(weightedScore[key]) ? weightedScore[key] : {};
    return typeof category.weight === 'number' ? category.weight : fallback;
  };
  const categories = {
    requiredFieldsCompleteness: requiredFieldsCompleteness(
      document,
      categoryWeight('required_fields_completeness', 0.4),
    ),
    metricCompleteness: metricCompleteness(
      document,
      categoryWeight('metric_completeness', 0.25),
    ),
    interactionCompleteness: interactionCompleteness(
      document,
      categoryWeight('interaction_completeness', 0.2),
    ),
    targetRenderCompatibility: targetRenderCompatibility(
      document,
      categoryWeight('target_render_compatibility', 0.15),
      target,
    ),
  };
  const score = Object.values(categories)
    .reduce((total, category) => total + category.contribution, 0);
  const threshold = typeof readinessModel.threshold === 'number' ? readinessModel.threshold : 0.85;
  const gates = [
    approvalGate(document),
    dataGapGate(document),
    drillTargetGate(document),
  ];
  const blockingIssues: PhantomSpecV2ValidationIssue[] = [
    ...(score >= threshold
      ? []
      : [{
        severity: 'error' as const,
        code: 'READINESS_BELOW_THRESHOLD',
        message: `Readiness score ${score.toFixed(3)} is below threshold ${threshold}.`,
      }]),
    ...gates
      .filter((gate) => !gate.passed)
      .map((gate) => ({
        severity: 'error' as const,
        code: `GATE_${gate.id.toUpperCase()}_FAILED`,
        message: gate.message,
      })),
  ];

  return {
    target,
    threshold,
    score,
    buildReady: score >= threshold && gates.every((gate) => gate.passed),
    categories,
    gates,
    blockingIssues,
  };
};

export const createPhantomSpecV2MetricRegistry = (
  document: PhantomSpecV2Document,
): PhantomSpecV2MetricRegistryEntry[] =>
  asRecords(getBlock(document, 'metrics')?.body.metrics)
    .map((metric) => {
      const requiredKeys = [
        'display_name',
        'definition',
        'formula',
        'grain',
        'null_behavior',
        'owner_role',
        'source_binding',
      ];
      const missingFields = missingKeys(metric, requiredKeys);
      return {
        id: String(metric.id || ''),
        displayName: hasText(metric.display_name) ? metric.display_name : undefined,
        definition: hasText(metric.definition) ? metric.definition : undefined,
        formula: hasText(metric.formula) ? metric.formula : undefined,
        grain: hasText(metric.grain) ? metric.grain : undefined,
        nullBehavior: hasText(metric.null_behavior) ? metric.null_behavior : undefined,
        ownerRole: hasText(metric.owner_role) ? metric.owner_role : undefined,
        sourceBinding: metric.source_binding,
        comparisonRules: metric.comparison_rules,
        complete: missingFields.length === 0,
        missingFields,
      };
    });

export const createPhantomSpecV2AcceptedGaps = (
  document: PhantomSpecV2Document,
): PhantomSpecV2AcceptedGap[] => {
  const dataContract = getBlock(document, 'data_contract_preview')?.body.data_contract;
  const fields = asRecords(isRecord(dataContract) ? dataContract.fields : undefined);
  return fields
    .filter((field) => isRecord(field.accepted_gap) || field.status === 'accepted_gap')
    .map((field) => {
      const acceptedGap = isRecord(field.accepted_gap) ? field.accepted_gap : {};
      const missingFields = missingKeys(acceptedGap, ['owner_role', 'reason', 'resolution_target']);
      return {
        fieldId: hasText(field.id) ? field.id : undefined,
        fieldLabel: hasText(field.display_name)
          ? field.display_name
          : hasText(field.label) ? field.label : undefined,
        fieldType: hasText(field.type) ? field.type : undefined,
        ownerRole: hasText(acceptedGap.owner_role) ? acceptedGap.owner_role : undefined,
        reason: hasText(acceptedGap.reason) ? acceptedGap.reason : undefined,
        resolutionTarget: hasText(acceptedGap.resolution_target) ? acceptedGap.resolution_target : undefined,
        readinessImpact: hasText(acceptedGap.readiness_impact) ? acceptedGap.readiness_impact : undefined,
        complete: missingFields.length === 0,
        missingFields,
      };
    });
};

const findElicitationRule = (
  document: PhantomSpecV2Document,
  fieldPath: string,
  fallbackRuleId?: string,
) => {
  const rules = asRecords(getBlock(document, 'elicitation_rules')?.body.rules);
  return rules.find((rule) =>
    rule.id === fallbackRuleId
    || (Array.isArray(rule.require) && rule.require.includes(fieldPath)),
  );
};

const promptLabel = (fieldPath: string) =>
  (fieldPath.split('.').pop() || fieldPath).replace(/_/g, ' ');

const createPrompt = (
  document: PhantomSpecV2Document,
  objectType: PhantomSpecV2ElicitationPrompt['objectType'],
  objectId: string,
  fieldPath: string,
  reason: string,
  ownerRole?: string,
  fallbackRuleId?: string,
  state: PhantomSpecV2ElicitationPrompt['state'] = 'unanswered',
): PhantomSpecV2ElicitationPrompt => {
  const rule = findElicitationRule(document, fieldPath, fallbackRuleId);
  return {
    id: `${objectType}:${objectId}:${fieldPath}`,
    ruleId: hasText(rule?.id) ? rule.id : fallbackRuleId,
    objectType,
    objectId,
    fieldPath,
    state,
    ownerRole,
    severity: state === 'accepted_gap' ? 'warning' : 'error',
    prompt: `Confirm ${promptLabel(fieldPath)} for ${objectId}.`,
    reason,
  };
};

export const createPhantomSpecV2ElicitationPrompts = (
  document: PhantomSpecV2Document,
): PhantomSpecV2ElicitationPrompt[] => {
  const prompts: PhantomSpecV2ElicitationPrompt[] = [];
  const components = asRecords(getBlock(document, 'component_instances')?.body.components);
  const fields = (() => {
    const dataContract = getBlock(document, 'data_contract_preview')?.body.data_contract;
    return asRecords(isRecord(dataContract) ? dataContract.fields : undefined);
  })();
  const interactions = asRecords(getBlock(document, 'interactions')?.body.interactions);

  for (const component of components) {
    const id = hasText(component.id) ? component.id : 'unknown_component';
    const type = hasText(component.type) ? component.type : 'component';
    const elicitation = isRecord(component.elicitation) ? component.elicitation : {};
    const ownerRole = type.includes('kpi') ? 'analytics_owner' : 'dashboard_builder';
    for (const fieldPath of stringIds(elicitation.missing_fields)) {
      prompts.push(createPrompt(
        document,
        'component',
        id,
        fieldPath,
        `${type} has unresolved scaffolding declared in component elicitation metadata.`,
        ownerRole,
        fieldPath === 'pbi_fallback_behavior' ? 'require_pbi_fallback_for_approximate_or_design_only' : undefined,
      ));
    }
  }

  for (const metric of createPhantomSpecV2MetricRegistry(document)) {
    for (const fieldPath of metric.missingFields) {
      prompts.push(createPrompt(
        document,
        'metric',
        metric.id,
        `metric.${fieldPath}`,
        'Metric registry entries must include grain, null behavior, owner, and source binding before approval.',
        metric.ownerRole || 'analytics_owner',
        'require_metric_scaffolding_for_kpi',
      ));
    }
  }

  for (const interaction of interactions) {
    const id = hasText(interaction.id) ? interaction.id : 'unknown_interaction';
    const type = String(interaction.type || '');
    if (!type.startsWith('drill_')) continue;
    const target = isRecord(interaction.target) ? interaction.target : {};
    const missingPaths = [
      ...(!hasText(target.type) ? ['interaction.target.type'] : []),
      ...(!hasText(target.id) ? ['interaction.target.id'] : []),
      ...(!hasValue(interaction.filter_context) ? ['interaction.filter_context.carry'] : []),
      ...(!hasText(interaction.back_behavior) ? ['interaction.back_behavior'] : []),
    ];
    for (const fieldPath of missingPaths) {
      prompts.push(createPrompt(
        document,
        'interaction',
        id,
        fieldPath,
        'Drill-through interactions need explicit target, filter context, and back behavior.',
        'facilitator',
        'require_drill_target',
      ));
    }
  }

  for (const field of fields) {
    if (field.status !== 'accepted_gap') continue;
    const acceptedGap = isRecord(field.accepted_gap) ? field.accepted_gap : {};
    const missingFields = missingKeys(acceptedGap, ['owner_role', 'reason', 'resolution_target']);
    for (const fieldPath of missingFields) {
      prompts.push(createPrompt(
        document,
        'data_field',
        hasText(field.id) ? field.id : 'unknown_field',
        `accepted_gap.${fieldPath}`,
        'Accepted gaps are allowed only when ownership, reason, and resolution target are explicit.',
        hasText(acceptedGap.owner_role) ? acceptedGap.owner_role : 'data_engineer',
        'require_accepted_gap_metadata',
        'accepted_gap',
      ));
    }
  }

  return prompts;
};

export const createPhantomSpecV2ApprovalStatus = (
  document: PhantomSpecV2Document,
): PhantomSpecV2ApprovalStatus => {
  const approval = isRecord(document.frontmatter.approval) ? document.frontmatter.approval : {};
  const currentVersion = hasText(approval.current_version) ? approval.current_version : undefined;
  const documentVersion = hasText(document.frontmatter.version) ? document.frontmatter.version : undefined;
  const history = asRecords(approval.history);
  const currentVersionEvent = [...history].reverse().find((event) => event.version === currentVersion);
  const requiredApprovals = stringIds(approval.required_approvals);
  const approvedRoles = new Set(
    history
      .filter((event) => event.version === currentVersion && event.state === 'approved')
      .map((event) => event.role)
      .filter((role): role is string => typeof role === 'string' && role.trim().length > 0),
  );
  const currentApprover = currentVersionEvent?.approver;
  const missingApprovalRoles = requiredApprovals.filter((role) => !approvedRoles.has(role));
  const approved = approval.state === 'approved'
    && currentVersionEvent?.state === 'approved'
    && hasText(currentApprover)
    && missingApprovalRoles.length === 0;

  return {
    state: hasText(approval.state) ? approval.state : undefined,
    currentVersion,
    documentVersion,
    requiredApprovals,
    approved,
    stale: Boolean(currentVersion && documentVersion && currentVersion !== documentVersion)
      || !currentVersionEvent
      || currentVersionEvent.state !== approval.state,
    missingApprovalRoles,
    currentVersionEvent,
    history,
  };
};

export const createPhantomSpecV2Summary = (
  document: PhantomSpecV2Document,
  target: PhantomSpecV2ReadinessTarget = 'react',
): PhantomSpecV2Summary => {
  const pages = asRecords(getBlock(document, 'pages')?.body.pages);
  const components = asRecords(getBlock(document, 'component_instances')?.body.components);
  const metrics = createPhantomSpecV2MetricRegistry(document);
  const dataContract = getBlock(document, 'data_contract_preview')?.body.data_contract;
  const fields = asRecords(isRecord(dataContract) ? dataContract.fields : undefined);
  const interactions = asRecords(getBlock(document, 'interactions')?.body.interactions);
  const acceptedGaps = createPhantomSpecV2AcceptedGaps(document);
  const prompts = createPhantomSpecV2ElicitationPrompts(document);

  return {
    schemaId: document.frontmatter.schema_id,
    id: document.frontmatter.id,
    name: document.frontmatter.name,
    version: document.frontmatter.version,
    status: document.frontmatter.status,
    roles: stringIds(document.frontmatter.roles),
    exportTargets: Array.isArray(document.frontmatter.export_targets) ? document.frontmatter.export_targets : [],
    blocks: document.blocks.map((block) => ({
      ...block.header,
      startLine: block.startLine,
    })),
    counts: {
      pages: pages.length,
      components: components.length,
      metrics: metrics.length,
      fields: fields.length,
      interactions: interactions.length,
      acceptedGaps: acceptedGaps.length,
      unresolvedPrompts: prompts.filter((prompt) => prompt.state === 'unanswered').length,
    },
    readiness: scorePhantomSpecV2Readiness(document, target),
    approval: createPhantomSpecV2ApprovalStatus(document),
  };
};

export const createPhantomSpecV2ApprovalPack = (
  document: PhantomSpecV2Document,
  generatedAt = new Date().toISOString(),
): PhantomSpecV2ApprovalPack => ({
  generatedAt,
  summary: createPhantomSpecV2Summary(document),
  approval: createPhantomSpecV2ApprovalStatus(document),
  readiness: {
    react: scorePhantomSpecV2Readiness(document, 'react'),
    powerBi: scorePhantomSpecV2Readiness(document, 'power_bi'),
  },
  metrics: createPhantomSpecV2MetricRegistry(document),
  acceptedGaps: createPhantomSpecV2AcceptedGaps(document),
  elicitationPrompts: createPhantomSpecV2ElicitationPrompts(document),
  interactions: asRecords(getBlock(document, 'interactions')?.body.interactions),
  exportTargets: asRecords(getBlock(document, 'export_targets')?.body.exports),
});

const slugPath = (value: unknown) =>
  `/${String(value || 'page')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'page'}`;

const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const createComponentContracts = (
  document: PhantomSpecV2Document,
): PhantomSpecV2ComponentContract[] => {
  const prompts = createPhantomSpecV2ElicitationPrompts(document);
  return asRecords(getBlock(document, 'component_instances')?.body.components)
    .map((component) => {
      const id = hasText(component.id) ? component.id : 'unknown_component';
      return {
        id,
        pageId: hasText(component.page_id) ? component.page_id : undefined,
        type: hasText(component.type) ? component.type : undefined,
        title: hasText(component.title) ? component.title : undefined,
        bindings: isRecord(component.bindings) ? component.bindings : {},
        renderTargets: isRecord(component.render_targets) ? component.render_targets : {},
        acceptance: stringList(component.acceptance),
        unresolvedPrompts: prompts.filter((prompt) =>
          prompt.objectType === 'component' && prompt.objectId === id,
        ),
      };
    });
};

export const createPhantomSpecV2DataContractExport = (
  document: PhantomSpecV2Document,
  generatedAt = new Date().toISOString(),
): PhantomSpecV2DataContractExport => {
  const dataContract = getBlock(document, 'data_contract_preview')?.body.data_contract;
  return {
    generatedAt,
    derivation: isRecord(dataContract) && hasText(dataContract.derivation)
      ? dataContract.derivation
      : undefined,
    fields: asRecords(isRecord(dataContract) ? dataContract.fields : undefined),
    metrics: createPhantomSpecV2MetricRegistry(document),
    acceptedGaps: createPhantomSpecV2AcceptedGaps(document),
    unresolvedPrompts: createPhantomSpecV2ElicitationPrompts(document),
  };
};

export const createPhantomSpecV2ReactProductExport = (
  document: PhantomSpecV2Document,
  generatedAt = new Date().toISOString(),
): PhantomSpecV2ReactProductExport => {
  const pages = asRecords(getBlock(document, 'pages')?.body.pages);
  const components = createComponentContracts(document);
  const readiness = scorePhantomSpecV2Readiness(document, 'react');
  return {
    generatedAt,
    target: 'react',
    buildReady: readiness.buildReady,
    readiness,
    summary: createPhantomSpecV2Summary(document, 'react'),
    pages,
    components,
    dataContract: createPhantomSpecV2DataContractExport(document, generatedAt),
    routeManifest: pages.map((page, index) => {
      const id = hasText(page.id) ? page.id : `page_${index + 1}`;
      return {
        id,
        title: hasText(page.title) ? page.title : undefined,
        path: index === 0 ? '/' : slugPath(page.title || id),
        componentIds: stringList(page.components),
      };
    }),
    implementationNotes: [
      'Use this pack as a React Product Mode implementation contract, not a generated finished application.',
      'Do not treat buildReady as true until all readiness gates pass.',
      'Resolve unresolvedPrompts before asking stakeholders to approve a final build version.',
    ],
  };
};

export const createPhantomSpecV2PowerBiExport = (
  document: PhantomSpecV2Document,
  generatedAt = new Date().toISOString(),
): PhantomSpecV2PowerBiExport => {
  const components = createComponentContracts(document);
  const readiness = scorePhantomSpecV2Readiness(document, 'power_bi');
  return {
    generatedAt,
    target: 'power_bi',
    buildReady: readiness.buildReady,
    readiness,
    summary: createPhantomSpecV2Summary(document, 'power_bi'),
    visualBuildMatrix: components.map((component) => {
      const status = component.renderTargets.power_bi;
      const fallbackRequired = status === 'design_only' || status === 'pbi_approximate';
      return {
        componentId: component.id,
        title: component.title,
        type: component.type,
        powerBiStatus: status,
        guidance: status === 'pbi_safe'
          ? 'Build with native Power BI visual behavior.'
          : status === 'pbi_approximate'
            ? 'Build with native Power BI approximation and document the fallback behavior.'
            : 'Keep as design guidance or custom implementation outside native Power BI.',
        fallbackRequired,
      };
    }),
    acceptedGaps: createPhantomSpecV2AcceptedGaps(document),
    constraints: [
      'Power BI Mode is a constrained implementation guide, not a promise of visual parity.',
      'Components marked design_only require explicit accepted gap or fallback notes.',
      'Drill, filter, and approval semantics must remain traceable to the v0.2 spec.',
    ],
  };
};

export const applyPhantomSpecV2Approval = (
  document: PhantomSpecV2Document,
  input: PhantomSpecV2ApprovalInput,
) => {
  if (!hasText(input.approver)) {
    throw new Error('Approval approver is required.');
  }
  if (!hasText(input.role)) {
    throw new Error('Approval role is required.');
  }

  const previousApproval = isRecord(document.frontmatter.approval)
    ? document.frontmatter.approval
    : {};
  const currentVersion = hasText(previousApproval.current_version)
    ? previousApproval.current_version
    : hasText(document.frontmatter.version) ? document.frontmatter.version : 'unknown';
  const state = input.state || 'approved';
  const history = [
    ...asRecords(previousApproval.history),
    {
      version: currentVersion,
      date: input.date || new Date().toISOString().slice(0, 10),
      approver: input.approver,
      role: input.role,
      state,
      notes: input.notes || '',
    },
  ];
  const requiredApprovals = stringIds(previousApproval.required_approvals);
  const approvedRoles = new Set(
    history
      .filter((event) => event.version === currentVersion && event.state === 'approved')
      .map((event) => event.role)
      .filter((role): role is string => typeof role === 'string' && role.trim().length > 0),
  );
  const nextState = state === 'rejected' || state === 'revoked'
    ? state
    : requiredApprovals.every((role) => approvedRoles.has(role)) ? 'approved' : 'pending';
  const frontmatter = {
    ...document.frontmatter,
    approval: {
      ...previousApproval,
      state: nextState,
      current_version: currentVersion,
      history,
    },
  };
  const nextDocument = {
    ...document,
    frontmatter,
  };

  return {
    frontmatter,
    approval: createPhantomSpecV2ApprovalStatus(nextDocument),
  };
};

export const replacePhantomSpecV2Frontmatter = (
  markdown: string,
  frontmatter: Record<string, unknown>,
) => {
  const normalized = markdown.replace(/^\uFEFF/, '');
  const nextFrontmatter = `---\n${stringifyYaml(frontmatter)}\n---`;
  if (!normalized.startsWith('---')) {
    return `${nextFrontmatter}\n\n${normalized}`;
  }
  const closing = normalized.indexOf('\n---', 3);
  if (closing < 0) {
    throw new Error('Frontmatter opening marker found without a closing marker.');
  }
  const bodyStart = normalized.indexOf('\n', closing + 4);
  const body = bodyStart >= 0 ? normalized.slice(bodyStart + 1) : '';
  return `${nextFrontmatter}\n\n${body}`;
};

const replacePhantomSpecV2Block = (
  markdown: string,
  block: PhantomSpecV2Block,
  nextBody: Record<string, unknown>,
) => {
  const nextRaw = stringifyYaml(nextBody);
  if (!markdown.includes(block.raw)) {
    throw new Error(`Could not locate raw block ${block.header.id} in Markdown.`);
  }
  return markdown.replace(block.raw, nextRaw);
};

export const applyPhantomSpecV2PromptResolution = (
  markdown: string,
  input: PhantomSpecV2PromptResolutionInput,
) => {
  if (input.objectType !== 'component') {
    throw new Error('Only component prompt resolution is supported in this mutation.');
  }
  if (!hasText(input.objectId)) {
    throw new Error('Prompt resolution objectId is required.');
  }
  if (!hasText(input.fieldPath)) {
    throw new Error('Prompt resolution fieldPath is required.');
  }
  if (!hasText(input.value)) {
    throw new Error('Prompt resolution value is required.');
  }

  const document = parsePhantomSpecV2Markdown(markdown);
  const block = getBlock(document, 'component_instances');
  if (!block) {
    throw new Error('Missing component_instances block.');
  }
  const components = asRecords(block.body.components);
  const componentIndex = components.findIndex((component) => component.id === input.objectId);
  if (componentIndex < 0) {
    throw new Error(`Component not found: ${input.objectId}.`);
  }

  const component = components[componentIndex];
  const elicitation = isRecord(component.elicitation) ? component.elicitation : {};
  const missingFields = stringIds(elicitation.missing_fields);
  if (!missingFields.includes(input.fieldPath)) {
    throw new Error(`Prompt ${input.fieldPath} is not unresolved for component ${input.objectId}.`);
  }
  const resolvedPrompts = asRecords(elicitation.resolved_prompts);
  const nextComponent = {
    ...component,
    [input.fieldPath]: input.value,
    elicitation: {
      ...elicitation,
      missing_fields: missingFields.filter((field) => field !== input.fieldPath),
      resolved_prompts: [
        ...resolvedPrompts,
        {
          field: input.fieldPath,
          value: input.value,
          owner_role: input.ownerRole || 'facilitator',
          date: input.date || new Date().toISOString().slice(0, 10),
          notes: input.notes || '',
        },
      ],
    },
  };
  const nextBlockBody = {
    ...block.body,
    components: components.map((componentItem, index) =>
      index === componentIndex ? nextComponent : componentItem,
    ),
  };
  const nextMarkdown = replacePhantomSpecV2Block(markdown, block, nextBlockBody);
  const nextDocument = parsePhantomSpecV2Markdown(nextMarkdown);

  return {
    markdown: nextMarkdown,
    document: nextDocument,
    prompts: createPhantomSpecV2ElicitationPrompts(nextDocument),
    readiness: scorePhantomSpecV2Readiness(nextDocument),
  };
};

export const parseAndValidatePhantomSpecV2Markdown = (markdown: string) => {
  const document = parsePhantomSpecV2Markdown(markdown);
  return {
    document,
    validation: validatePhantomSpecV2Document(document),
    readiness: scorePhantomSpecV2Readiness(document),
  };
};
