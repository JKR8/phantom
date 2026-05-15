#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseDocument } from 'yaml';

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
  npm run phantom:spec:v2 -- inspect <spec.md> blocks|metrics|accepted-gaps|approval|exports|all
  npm run phantom:spec:v2 -- export-approval-pack <spec.md> <out.json>

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

const approvalStatus = (document) => {
  const approval = isRecord(document.frontmatter.approval) ? document.frontmatter.approval : {};
  const currentVersion = hasText(approval.current_version) ? approval.current_version : undefined;
  const documentVersion = hasText(document.frontmatter.version) ? document.frontmatter.version : undefined;
  const history = asRecords(approval.history);
  const currentVersionEvent = history.find((event) => event.version === currentVersion);
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
  interactions: asRecords(getBlock(document, 'interactions')?.body.interactions),
  exportTargets: asRecords(getBlock(document, 'export_targets')?.body.exports),
});

const print = (value) => console.log(JSON.stringify(value, null, 2));
const normalizeTarget = (value) => (value === 'powerBi' || value === 'power-bi' || value === 'pbi' ? 'power_bi' : value || 'react');

try {
  if (!command || ['help', '--help', '-h'].includes(command)) {
    usage();
    process.exit(0);
  }
  const validCommands = ['validate', 'summary', 'readiness', 'inspect', 'export-approval-pack'];
  if (!validCommands.includes(command)) throw new Error(`Unknown command: ${command}`);
  if (!specPath) throw new Error('Missing spec Markdown path.');

  const document = parseMarkdownSpec(await readFile(resolve(specPath), 'utf8'));
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
      approval: approvalStatus(document),
      exports: asRecords(getBlock(document, 'export_targets')?.body.exports),
    };
    if (!(subject in subjects)) throw new Error('Inspect subject must be blocks, metrics, accepted-gaps, approval, exports, or all.');
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
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
}
