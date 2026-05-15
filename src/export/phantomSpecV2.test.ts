import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  createPhantomSpecV2AcceptedGaps,
  createPhantomSpecV2ApprovalPack,
  createPhantomSpecV2ApprovalStatus,
  createPhantomSpecV2MetricRegistry,
  createPhantomSpecV2Summary,
  PHANTOM_V2_SCHEMA_ID,
  parseAndValidatePhantomSpecV2Markdown,
  parsePhantomSpecV2Markdown,
  scorePhantomSpecV2Readiness,
  validatePhantomSpecV2Document,
} from './phantomSpecV2';

const readV2Spec = () => readFile(join(process.cwd(), 'phantom_product_spec_v0.2.md'), 'utf8');

describe('phantomSpecV2', () => {
  it('parses the Phantom v0.2 markdown spec frontmatter and structured blocks', async () => {
    const markdown = await readV2Spec();
    const document = parsePhantomSpecV2Markdown(markdown);

    expect(document.frontmatter).toMatchObject({
      phantom_spec_version: 0.2,
      schema_id: PHANTOM_V2_SCHEMA_ID,
      id: 'phantom',
      status: 'draft',
      primary_workflow: 'stakeholder_workshop',
    });
    expect(document.frontmatter.roles).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'facilitator' }),
      expect.objectContaining({ id: 'agent' }),
    ]));
    expect(document.frontmatter.export_targets).toEqual(['react_app', 'power_bi_build_notes', 'approval_pack']);
    expect(document.blocks.map((block) => block.header.id)).toEqual([
      'example_block',
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
    ]);
  });

  it('validates the Phantom v0.2 spec as the executable target document', async () => {
    const markdown = await readV2Spec();
    const { document, validation, readiness } = parseAndValidatePhantomSpecV2Markdown(markdown);

    expect(validation).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
    expect(readiness.target).toBe('react');

    const pagesBlock = document.blocks.find((block) => block.header.id === 'pages');
    const metricsBlock = document.blocks.find((block) => block.header.id === 'metrics');
    const readinessBlock = document.blocks.find((block) => block.header.id === 'readiness_scoring');
    const exportBlock = document.blocks.find((block) => block.header.id === 'export_targets');

    expect(pagesBlock?.body.pages).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'spec_canvas' }),
      expect.objectContaining({ id: 'approval_view' }),
      expect.objectContaining({ id: 'export_panel' }),
    ]));
    expect(metricsBlock?.body.metrics).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'build_readiness_score', grain: 'spec_version' }),
      expect.objectContaining({ id: 'target_render_compatibility' }),
    ]));
    expect(readinessBlock?.body.readiness_model).toMatchObject({
      threshold: 0.85,
      weighted_score: {
        required_fields_completeness: { weight: 0.4 },
        metric_completeness: { weight: 0.25 },
        interaction_completeness: { weight: 0.2 },
        target_render_compatibility: { weight: 0.15 },
      },
    });
    expect(exportBlock?.body.exports).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'react_app' }),
      expect.objectContaining({ id: 'power_bi_build_notes' }),
      expect.objectContaining({ id: 'approval_pack' }),
    ]));
  });

  it('scores v0.2 readiness from weighted model categories and gates', async () => {
    const markdown = await readV2Spec();
    const document = parsePhantomSpecV2Markdown(markdown);
    const reactReadiness = scorePhantomSpecV2Readiness(document, 'react');
    const powerBiReadiness = scorePhantomSpecV2Readiness(document, 'power_bi');

    expect(reactReadiness.threshold).toBe(0.85);
    expect(reactReadiness.categories).toMatchObject({
      requiredFieldsCompleteness: {
        weight: 0.4,
        numerator: 2,
        denominator: 3,
      },
      metricCompleteness: {
        weight: 0.25,
        numerator: 3,
        denominator: 3,
      },
      interactionCompleteness: {
        weight: 0.2,
        numerator: 4,
        denominator: 4,
      },
      targetRenderCompatibility: {
        weight: 0.15,
        numerator: 3,
        denominator: 3,
      },
    });
    expect(reactReadiness.score).toBeCloseTo(0.8667, 4);
    expect(reactReadiness.gates).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'current_version_approval',
        passed: false,
      }),
      expect.objectContaining({
        id: 'no_unowned_data_gaps',
        passed: true,
      }),
      expect.objectContaining({
        id: 'all_drill_targets_defined',
        passed: true,
      }),
    ]));
    expect(reactReadiness.buildReady).toBe(false);
    expect(reactReadiness.blockingIssues).toEqual([
      expect.objectContaining({
        code: 'GATE_CURRENT_VERSION_APPROVAL_FAILED',
      }),
    ]);

    expect(powerBiReadiness.categories.targetRenderCompatibility).toMatchObject({
      numerator: 2,
      denominator: 3,
    });
    expect(powerBiReadiness.score).toBeCloseTo(0.8167, 4);
    expect(powerBiReadiness.blockingIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'READINESS_BELOW_THRESHOLD',
      }),
    ]));
  });

  it('exposes v0.2 spec inspection surfaces for agents and approval packs', async () => {
    const markdown = await readV2Spec();
    const document = parsePhantomSpecV2Markdown(markdown);

    const metrics = createPhantomSpecV2MetricRegistry(document);
    expect(metrics).toHaveLength(3);
    expect(metrics).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'build_readiness_score',
        grain: 'spec_version',
        nullBehavior: 'Missing category scores count as zero.',
        ownerRole: 'analytics_owner',
        complete: true,
        missingFields: [],
      }),
    ]));

    const acceptedGaps = createPhantomSpecV2AcceptedGaps(document);
    expect(acceptedGaps).toEqual([
      expect.objectContaining({
        fieldId: 'pbi_fallback_behavior',
        ownerRole: 'dashboard_builder',
        reason: 'Power BI export is limited to build notes in v1.',
        resolutionTarget: 'post_v1',
        complete: true,
      }),
    ]);

    const approval = createPhantomSpecV2ApprovalStatus(document);
    expect(approval).toMatchObject({
      state: 'pending',
      currentVersion: '0.2.0-draft',
      documentVersion: '0.2.0',
      approved: false,
      stale: true,
      requiredApprovals: ['approver', 'analytics_owner'],
      missingApprovalRoles: ['approver', 'analytics_owner'],
    });

    const summary = createPhantomSpecV2Summary(document);
    expect(summary.counts).toEqual({
      pages: 7,
      components: 3,
      metrics: 3,
      fields: 4,
      interactions: 4,
      acceptedGaps: 1,
    });
    expect(summary.blocks.map((block) => block.id)).toContain('export_targets');

    const approvalPack = createPhantomSpecV2ApprovalPack(document, '2026-05-15T00:00:00.000Z');
    expect(approvalPack.generatedAt).toBe('2026-05-15T00:00:00.000Z');
    expect(approvalPack.readiness.react.score).toBeCloseTo(0.8667, 4);
    expect(approvalPack.readiness.powerBi.score).toBeCloseTo(0.8167, 4);
    expect(approvalPack.exportTargets).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'react_app' }),
      expect.objectContaining({ id: 'approval_pack' }),
    ]));
  });

  it('reports missing required v0.2 blocks', async () => {
    const markdown = await readV2Spec();
    const document = parsePhantomSpecV2Markdown(markdown);
    const incomplete = {
      ...document,
      blocks: document.blocks.filter((block) => block.header.id !== 'metrics'),
    };
    const validation = validatePhantomSpecV2Document(incomplete);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'MISSING_REQUIRED_BLOCK',
        blockId: 'metrics',
      }),
      expect.objectContaining({
        code: 'MISSING_METRICS',
        blockId: 'metrics',
      }),
    ]));
  });
});
