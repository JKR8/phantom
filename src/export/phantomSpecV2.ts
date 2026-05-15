import { parseDocument } from 'yaml';

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

const hasText = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0;

const hasValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return value !== undefined && value !== null && value !== '';
};

const getBlock = (document: PhantomSpecV2Document, id: string) =>
  document.blocks.find((block) => block.header.id === id);

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
  const currentApproval = history.find((event) => event.version === currentVersion);
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

export const parseAndValidatePhantomSpecV2Markdown = (markdown: string) => {
  const document = parsePhantomSpecV2Markdown(markdown);
  return {
    document,
    validation: validatePhantomSpecV2Document(document),
    readiness: scorePhantomSpecV2Readiness(document),
  };
};
