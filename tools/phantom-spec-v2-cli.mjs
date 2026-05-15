#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseDocument, stringify } from 'yaml';

const [, , command, specPath, ...args] = process.argv;
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

const usage = () => {
  console.log(`Phantom v0.2 Spec CLI

Usage:
  npm run phantom:spec:v2 -- validate <spec.md>
  npm run phantom:spec:v2 -- summary <spec.md>
  npm run phantom:spec:v2 -- readiness <spec.md> react|power_bi
  npm run phantom:spec:v2 -- inspect <spec.md> blocks|metrics|accepted-gaps|prompts|approval|exports|all
  npm run phantom:spec:v2 -- export-approval-pack <spec.md> <out.json>
  npm run phantom:spec:v2 -- export-react-pack <spec.md> <out.json>
  npm run phantom:spec:v2 -- export-powerbi-pack <spec.md> <out.json>
  npm run phantom:spec:v2 -- approve <spec.md> --role approver --approver "Name" --out <out.md>

Commands operate on Markdown specs with YAML frontmatter and fenced phantom_block YAML sections.
`);
};

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const asRecords = (value) => (Array.isArray(value) ? value.filter(isRecord) : []);
const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const hasValue = (value) => {
  if (Array.isArray(value)) return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return value !== undefined && value !== null && value !== '';
};
const stringIds = (value) =>
  (Array.isArray(value) ? value : [])
    .map((item) => (isRecord(item) ? item.id : item))
    .filter((item) => typeof item === 'string' && item.trim().length > 0);
const missingKeys = (record, keys) => keys.filter((key) => !hasValue(record[key]));
const lineNumberAt = (text, index) => text.slice(0, index).split(/\r?\n/).length;

const parseYaml = (raw, label) => {
  const document = parseDocument(raw);
  if (document.errors.length > 0) {
    throw new Error(`${label} YAML parse failed: ${document.errors.map((error) => error.message).join('; ')}`);
  }
  const parsed = document.toJSON();
  if (!isRecord(parsed)) throw new Error(`${label} YAML must parse to an object.`);
  return parsed;
};

const extractFrontmatter = (markdown) => {
  const normalized = markdown.replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---')) return { frontmatter: {}, body: normalized };
  const closing = normalized.indexOf('\n---', 3);
  if (closing < 0) throw new Error('Frontmatter opening marker found without a closing marker.');
  const rawFrontmatter = normalized.slice(3, closing).trim();
  const bodyStart = normalized.indexOf('\n', closing + 4);
  return {
    frontmatter: parseYaml(rawFrontmatter, 'Frontmatter'),
    body: bodyStart >= 0 ? normalized.slice(bodyStart + 1) : '',
  };
};

const parseMarkdownSpec = (markdown) => {
  const { frontmatter, body } = extractFrontmatter(markdown);
  const blocks = [];
  const blockPattern = /```ya?ml\s*\r?\n([\s\S]*?)\r?\n```/g;
  let match;
  while ((match = blockPattern.exec(body)) !== null) {
    const raw = match[1];
    const parsed = parseYaml(raw, `YAML block at line ${lineNumberAt(body, match.index)}`);
    const phantomBlock = parsed.phantom_block;
    if (!isRecord(phantomBlock)) continue;
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
  return { frontmatter, markdown: body, blocks };
};

const getBlock = (document, id) => document.blocks.find((block) => block.header.id === id);
const dataFields = (document) => {
  const dataContract = getBlock(document, 'data_contract_preview')?.body.data_contract;
  return asRecords(isRecord(dataContract) ? dataContract.fields : undefined);
};

const validate = (document) => {
  const errors = [];
  const warnings = [];
  const addError = (code, message, blockId) => errors.push({ severity: 'error', code, message, blockId });
  const addWarning = (code, message, blockId) => warnings.push({ severity: 'warning', code, message, blockId });

  if (document.frontmatter.schema_id !== 'phantom.spec.v0.2') {
    addError('INVALID_SCHEMA_ID', 'Expected frontmatter schema_id to be phantom.spec.v0.2.');
  }
  if (document.frontmatter.phantom_spec_version !== 0.2) {
    addError('INVALID_SPEC_VERSION', 'Expected frontmatter phantom_spec_version to be 0.2.');
  }
  if (!Array.isArray(document.frontmatter.roles) || document.frontmatter.roles.length === 0) {
    addError('MISSING_ROLES', 'Frontmatter must define at least one role.');
  }
  if (!Array.isArray(document.frontmatter.export_targets) || document.frontmatter.export_targets.length === 0) {
    addError('MISSING_EXPORT_TARGETS', 'Frontmatter must define export_targets.');
  }

  const seen = new Set();
  for (const block of document.blocks) {
    if (seen.has(block.header.id)) addError('DUPLICATE_BLOCK_ID', `Duplicate phantom_block id: ${block.header.id}.`, block.header.id);
    seen.add(block.header.id);
    if (block.header.version !== 0.2) addWarning('UNEXPECTED_BLOCK_VERSION', `Block ${block.header.id} uses version ${block.header.version}.`, block.header.id);
  }
  for (const blockId of requiredBlockIds) {
    if (!seen.has(blockId)) addError('MISSING_REQUIRED_BLOCK', `Missing required v0.2 phantom_block: ${blockId}.`, blockId);
  }
  if (asRecords(getBlock(document, 'pages')?.body.pages).length === 0) addError('MISSING_PAGES', 'The pages block must define at least one page.', 'pages');
  if (asRecords(getBlock(document, 'metrics')?.body.metrics).length === 0) addError('MISSING_METRICS', 'The metrics block must define at least one metric.', 'metrics');
  const readinessModel = getBlock(document, 'readiness_scoring')?.body.readiness_model;
  if (!isRecord(readinessModel) || !isRecord(readinessModel.weighted_score)) {
    addError('MISSING_READINESS_MODEL', 'The readiness_scoring block must define readiness_model.weighted_score.', 'readiness_scoring');
  }

  return { valid: errors.length === 0, errors, warnings };
};

const scoreCategory = (weight, numerator, denominator) => {
  const score = denominator === 0 ? 1 : numerator / denominator;
  return { weight, numerator, denominator, score, contribution: score * weight };
};

const metricRegistry = (document) =>
  asRecords(getBlock(document, 'metrics')?.body.metrics).map((metric) => {
    const missingFields = missingKeys(metric, ['display_name', 'definition', 'formula', 'grain', 'null_behavior', 'owner_role', 'source_binding']);
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

const acceptedGaps = (document) =>
  dataFields(document)
    .filter((field) => isRecord(field.accepted_gap) || field.status === 'accepted_gap')
    .map((field) => {
      const acceptedGap = isRecord(field.accepted_gap) ? field.accepted_gap : {};
      const missingFields = missingKeys(acceptedGap, ['owner_role', 'reason', 'resolution_target']);
      return {
        fieldId: hasText(field.id) ? field.id : undefined,
        fieldLabel: hasText(field.display_name) ? field.display_name : undefined,
        fieldType: hasText(field.type) ? field.type : undefined,
        ownerRole: hasText(acceptedGap.owner_role) ? acceptedGap.owner_role : undefined,
        reason: hasText(acceptedGap.reason) ? acceptedGap.reason : undefined,
        resolutionTarget: hasText(acceptedGap.resolution_target) ? acceptedGap.resolution_target : undefined,
        readinessImpact: hasText(acceptedGap.readiness_impact) ? acceptedGap.readiness_impact : undefined,
        complete: missingFields.length === 0,
        missingFields,
      };
    });

const findElicitationRule = (document, fieldPath, fallbackRuleId) => {
  const rules = asRecords(getBlock(document, 'elicitation_rules')?.body.rules);
  return rules.find((rule) => rule.id === fallbackRuleId || (Array.isArray(rule.require) && rule.require.includes(fieldPath)));
};

const promptLabel = (fieldPath) => (fieldPath.split('.').pop() || fieldPath).replace(/_/g, ' ');

const createPrompt = (document, objectType, objectId, fieldPath, reason, ownerRole, fallbackRuleId, state = 'unanswered') => {
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

const elicitationPrompts = (document) => {
  const prompts = [];
  const components = asRecords(getBlock(document, 'component_instances')?.body.components);
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

  for (const metric of metricRegistry(document)) {
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

  for (const field of dataFields(document)) {
    if (field.status !== 'accepted_gap') continue;
    const acceptedGap = isRecord(field.accepted_gap) ? field.accepted_gap : {};
    for (const fieldPath of missingKeys(acceptedGap, ['owner_role', 'reason', 'resolution_target'])) {
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

const approvalStatus = (document) => {
  const approval = isRecord(document.frontmatter.approval) ? document.frontmatter.approval : {};
  const currentVersion = hasText(approval.current_version) ? approval.current_version : undefined;
  const documentVersion = hasText(document.frontmatter.version) ? document.frontmatter.version : undefined;
  const history = asRecords(approval.history);
  const currentVersionEvent = [...history].reverse().find((event) => event.version === currentVersion);
  const requiredApprovals = stringIds(approval.required_approvals);
  const approvedRoles = new Set(history
    .filter((event) => event.version === currentVersion && event.state === 'approved')
    .map((event) => event.role)
    .filter((role) => typeof role === 'string' && role.trim().length > 0));
  const missingApprovalRoles = requiredApprovals.filter((role) => !approvedRoles.has(role));
  const approved = approval.state === 'approved'
    && currentVersionEvent?.state === 'approved'
    && hasText(currentVersionEvent?.approver)
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

const readiness = (document, target = 'react') => {
  const readinessModelValue = getBlock(document, 'readiness_scoring')?.body.readiness_model;
  const readinessModel = isRecord(readinessModelValue) ? readinessModelValue : {};
  const weightedScore = isRecord(readinessModel.weighted_score) ? readinessModel.weighted_score : {};
  const weight = (key, fallback) => {
    const category = isRecord(weightedScore[key]) ? weightedScore[key] : {};
    return typeof category.weight === 'number' ? category.weight : fallback;
  };
  const components = asRecords(getBlock(document, 'component_instances')?.body.components);
  const metrics = metricRegistry(document);
  const interactions = asRecords(getBlock(document, 'interactions')?.body.interactions);
  const compatibleStatuses = new Set(['react_ready', 'pbi_safe', 'pbi_approximate']);
  const categories = {
    requiredFieldsCompleteness: scoreCategory(
      weight('required_fields_completeness', 0.4),
      components.filter((component) => asRecords(isRecord(component.elicitation) ? component.elicitation.missing_fields : undefined).length === 0
        && (!Array.isArray(isRecord(component.elicitation) ? component.elicitation.missing_fields : undefined)
          || component.elicitation.missing_fields.length === 0)).length,
      components.length,
    ),
    metricCompleteness: scoreCategory(weight('metric_completeness', 0.25), metrics.filter((metric) => metric.complete).length, metrics.length),
    interactionCompleteness: scoreCategory(
      weight('interaction_completeness', 0.2),
      interactions.filter((interaction) => hasText(interaction.trigger)
        && hasText(interaction.source_component)
        && hasValue(interaction.target)
        && hasValue(interaction.filter_context)
        && hasText(interaction.back_behavior)
        && hasText(interaction.permission_scope)).length,
      interactions.length,
    ),
    targetRenderCompatibility: scoreCategory(
      weight('target_render_compatibility', 0.15),
      components.filter((component) => {
        const renderTargets = isRecord(component.render_targets) ? component.render_targets : {};
        const status = target === 'react' ? renderTargets.react : renderTargets.power_bi;
        return compatibleStatuses.has(status);
      }).length,
      components.length,
    ),
  };
  const score = Object.values(categories).reduce((total, category) => total + category.contribution, 0);
  const threshold = typeof readinessModel.threshold === 'number' ? readinessModel.threshold : 0.85;
  const approval = approvalStatus(document);
  const unownedGaps = dataFields(document).filter((field) => field.source === 'to_be_defined' && (!isRecord(field.accepted_gap) || !hasText(field.accepted_gap.owner_role)));
  const brokenDrillTargets = interactions.filter((interaction) => {
    const type = String(interaction.type || '');
    if (!type.startsWith('drill_') && type !== 'open_page' && type !== 'inspect_spec_object') return false;
    return !isRecord(interaction.target) || !hasText(interaction.target.id) || !hasText(interaction.target.type);
  });
  const gates = [
    { id: 'current_version_approval', passed: approval.approved, message: approval.approved ? `Current version ${approval.currentVersion} is approved.` : `Current version ${approval.currentVersion || 'unknown'} is not approved.` },
    { id: 'no_unowned_data_gaps', passed: unownedGaps.length === 0, message: unownedGaps.length === 0 ? 'All to-be-defined data gaps have accepted-gap owners.' : `Unowned data gaps: ${unownedGaps.map((field) => field.id).filter(Boolean).join(', ')}.` },
    { id: 'all_drill_targets_defined', passed: brokenDrillTargets.length === 0, message: brokenDrillTargets.length === 0 ? 'All navigational and drill interactions define target type and id.' : `Interactions with missing targets: ${brokenDrillTargets.map((interaction) => interaction.id).filter(Boolean).join(', ')}.` },
  ];
  const blockingIssues = [
    ...(score >= threshold ? [] : [{ severity: 'error', code: 'READINESS_BELOW_THRESHOLD', message: `Readiness score ${score.toFixed(3)} is below threshold ${threshold}.` }]),
    ...gates.filter((gate) => !gate.passed).map((gate) => ({ severity: 'error', code: `GATE_${gate.id.toUpperCase()}_FAILED`, message: gate.message })),
  ];
  return { target, threshold, score, buildReady: score >= threshold && gates.every((gate) => gate.passed), categories, gates, blockingIssues };
};

const summary = (document, target = 'react') => {
  const pages = asRecords(getBlock(document, 'pages')?.body.pages);
  const components = asRecords(getBlock(document, 'component_instances')?.body.components);
  const fields = dataFields(document);
  const interactions = asRecords(getBlock(document, 'interactions')?.body.interactions);
  const prompts = elicitationPrompts(document);
  return {
    schemaId: document.frontmatter.schema_id,
    id: document.frontmatter.id,
    name: document.frontmatter.name,
    version: document.frontmatter.version,
    status: document.frontmatter.status,
    roles: stringIds(document.frontmatter.roles),
    exportTargets: Array.isArray(document.frontmatter.export_targets) ? document.frontmatter.export_targets : [],
    blocks: document.blocks.map((block) => ({ ...block.header, startLine: block.startLine })),
    counts: {
      pages: pages.length,
      components: components.length,
      metrics: metricRegistry(document).length,
      fields: fields.length,
      interactions: interactions.length,
      acceptedGaps: acceptedGaps(document).length,
      unresolvedPrompts: prompts.filter((prompt) => prompt.state === 'unanswered').length,
    },
    readiness: readiness(document, target),
    approval: approvalStatus(document),
  };
};

const approvalPack = (document) => ({
  generatedAt: new Date().toISOString(),
  summary: summary(document),
  approval: approvalStatus(document),
  readiness: {
    react: readiness(document, 'react'),
    powerBi: readiness(document, 'power_bi'),
  },
  metrics: metricRegistry(document),
  acceptedGaps: acceptedGaps(document),
  elicitationPrompts: elicitationPrompts(document),
  interactions: asRecords(getBlock(document, 'interactions')?.body.interactions),
  exportTargets: asRecords(getBlock(document, 'export_targets')?.body.exports),
});

const slugPath = (value) => `/${String(value || 'page')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'page'}`;

const stringList = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []);

const componentContracts = (document) => {
  const prompts = elicitationPrompts(document);
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
        unresolvedPrompts: prompts.filter((prompt) => prompt.objectType === 'component' && prompt.objectId === id),
      };
    });
};

const dataContractExport = (document, generatedAt = new Date().toISOString()) => {
  const dataContract = getBlock(document, 'data_contract_preview')?.body.data_contract;
  return {
    generatedAt,
    derivation: isRecord(dataContract) && hasText(dataContract.derivation) ? dataContract.derivation : undefined,
    fields: dataFields(document),
    metrics: metricRegistry(document),
    acceptedGaps: acceptedGaps(document),
    unresolvedPrompts: elicitationPrompts(document),
  };
};

const reactPack = (document, generatedAt = new Date().toISOString()) => {
  const pages = asRecords(getBlock(document, 'pages')?.body.pages);
  const ready = readiness(document, 'react');
  return {
    generatedAt,
    target: 'react',
    buildReady: ready.buildReady,
    readiness: ready,
    summary: summary(document, 'react'),
    pages,
    components: componentContracts(document),
    dataContract: dataContractExport(document, generatedAt),
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

const powerBiPack = (document, generatedAt = new Date().toISOString()) => {
  const ready = readiness(document, 'power_bi');
  return {
    generatedAt,
    target: 'power_bi',
    buildReady: ready.buildReady,
    readiness: ready,
    summary: summary(document, 'power_bi'),
    visualBuildMatrix: componentContracts(document).map((component) => {
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
    acceptedGaps: acceptedGaps(document),
    constraints: [
      'Power BI Mode is a constrained implementation guide, not a promise of visual parity.',
      'Components marked design_only require explicit accepted gap or fallback notes.',
      'Drill, filter, and approval semantics must remain traceable to the v0.2 spec.',
    ],
  };
};

const print = (value) => console.log(JSON.stringify(value, null, 2));
const normalizeTarget = (value) => (value === 'powerBi' || value === 'power-bi' || value === 'pbi' ? 'power_bi' : value || 'react');
const optionValue = (name) => {
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  const npmConfigName = `npm_config_${name.replace(/^--/, '').replace(/-/g, '_')}`;
  const value = process.env[npmConfigName];
  return value && value !== 'true' ? value : undefined;
};

const applyApproval = (document, input) => {
  if (!hasText(input.approver)) throw new Error('Approval approver is required.');
  if (!hasText(input.role)) throw new Error('Approval role is required.');
  const previousApproval = isRecord(document.frontmatter.approval) ? document.frontmatter.approval : {};
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
  const approvedRoles = new Set(history
    .filter((event) => event.version === currentVersion && event.state === 'approved')
    .map((event) => event.role)
    .filter((role) => typeof role === 'string' && role.trim().length > 0));
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
  const nextDocument = { ...document, frontmatter };
  return {
    frontmatter,
    approval: approvalStatus(nextDocument),
  };
};

const replaceFrontmatter = (markdown, frontmatter) => {
  const normalized = markdown.replace(/^\uFEFF/, '');
  const nextFrontmatter = `---\n${stringify(frontmatter).trimEnd()}\n---`;
  if (!normalized.startsWith('---')) return `${nextFrontmatter}\n\n${normalized}`;
  const closing = normalized.indexOf('\n---', 3);
  if (closing < 0) throw new Error('Frontmatter opening marker found without a closing marker.');
  const bodyStart = normalized.indexOf('\n', closing + 4);
  const body = bodyStart >= 0 ? normalized.slice(bodyStart + 1) : '';
  return `${nextFrontmatter}\n\n${body}`;
};

try {
  if (!command || ['help', '--help', '-h'].includes(command)) {
    usage();
    process.exit(0);
  }
  const validCommands = [
    'validate',
    'summary',
    'readiness',
    'inspect',
    'export-approval-pack',
    'export-react-pack',
    'export-powerbi-pack',
    'approve',
  ];
  if (!validCommands.includes(command)) throw new Error(`Unknown command: ${command}`);
  if (!specPath) throw new Error('Missing spec Markdown path.');

  const rawMarkdown = await readFile(resolve(specPath), 'utf8');
  const document = parseMarkdownSpec(rawMarkdown);
  const validation = validate(document);

  if (command === 'validate') {
    print(validation);
    process.exit(validation.valid ? 0 : 1);
  }
  if (!validation.valid) {
    console.error(JSON.stringify(validation, null, 2));
    process.exit(1);
  }
  if (command === 'summary') print(summary(document));
  if (command === 'readiness') {
    const report = readiness(document, normalizeTarget(args[0]));
    const output = JSON.stringify(report, null, 2);
    if (report.buildReady) console.log(output);
    else {
      console.error(output);
      process.exit(1);
    }
  }
  if (command === 'inspect') {
    const subject = args[0] || 'all';
    const subjects = {
      all: summary(document),
      blocks: summary(document).blocks,
      metrics: metricRegistry(document),
      'accepted-gaps': acceptedGaps(document),
      prompts: elicitationPrompts(document),
      approval: approvalStatus(document),
      exports: asRecords(getBlock(document, 'export_targets')?.body.exports),
    };
    if (!(subject in subjects)) throw new Error('Inspect subject must be blocks, metrics, accepted-gaps, prompts, approval, exports, or all.');
    print(subjects[subject]);
  }
  if (command === 'export-approval-pack') {
    const outPath = args[0];
    if (!outPath) throw new Error('Missing output path for export-approval-pack.');
    const pack = approvalPack(document);
    await writeFile(resolve(outPath), `${JSON.stringify(pack, null, 2)}\n`);
    print({
      outPath,
      generatedAt: pack.generatedAt,
      approved: pack.approval.approved,
      reactBuildReady: pack.readiness.react.buildReady,
      powerBiBuildReady: pack.readiness.powerBi.buildReady,
    });
  }
  if (command === 'export-react-pack') {
    const outPath = args[0];
    if (!outPath) throw new Error('Missing output path for export-react-pack.');
    const pack = reactPack(document);
    await writeFile(resolve(outPath), `${JSON.stringify(pack, null, 2)}\n`);
    print({
      outPath,
      target: pack.target,
      buildReady: pack.buildReady,
      pages: pack.pages.length,
      components: pack.components.length,
      unresolvedPrompts: pack.dataContract.unresolvedPrompts.length,
    });
  }
  if (command === 'export-powerbi-pack') {
    const outPath = args[0];
    if (!outPath) throw new Error('Missing output path for export-powerbi-pack.');
    const pack = powerBiPack(document);
    await writeFile(resolve(outPath), `${JSON.stringify(pack, null, 2)}\n`);
    print({
      outPath,
      target: pack.target,
      buildReady: pack.buildReady,
      visuals: pack.visualBuildMatrix.length,
      fallbackRequired: pack.visualBuildMatrix.filter((visual) => visual.fallbackRequired).length,
    });
  }
  if (command === 'approve') {
    const role = optionValue('--role') || args[0] || '';
    const approver = optionValue('--approver') || args[1] || '';
    const date = optionValue('--date') || args[2];
    const outPath = optionValue('--out') || args[3];
    if (!outPath) throw new Error('Missing --out path for approve.');
    const result = applyApproval(document, {
      approver,
      role,
      state: optionValue('--state') || 'approved',
      notes: optionValue('--notes') || '',
      date,
    });
    await writeFile(resolve(outPath), replaceFrontmatter(rawMarkdown, result.frontmatter));
    print({
      outPath,
      approval: result.approval,
    });
  }
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
}
