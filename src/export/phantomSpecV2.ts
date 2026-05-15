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

export const parseAndValidatePhantomSpecV2Markdown = (markdown: string) => {
  const document = parsePhantomSpecV2Markdown(markdown);
  return {
    document,
    validation: validatePhantomSpecV2Document(document),
  };
};
