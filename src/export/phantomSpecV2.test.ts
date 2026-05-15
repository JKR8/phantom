import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  applyPhantomSpecV2Approval,
  applyPhantomSpecV2PromptResolution,
  createPhantomSpecV2AcceptedGaps,
  createPhantomSpecV2ApprovalPack,
  createPhantomSpecV2ApprovalStatus,
  createPhantomSpecV2DataContractExport,
  createPhantomSpecV2ElicitationPrompts,
  createPhantomSpecV2MetricRegistry,
  createPhantomSpecV2PowerBiExport,
  createPhantomSpecV2ReactProductExport,
  createPhantomSpecV2Summary,
  PHANTOM_V2_SCHEMA_ID,
  parseAndValidatePhantomSpecV2Markdown,
  parsePhantomSpecV2Markdown,
  replacePhantomSpecV2Frontmatter,
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

    const prompts = createPhantomSpecV2ElicitationPrompts(document);
    expect(prompts).toEqual([
      expect.objectContaining({
        id: 'component:elicitation_panel:pbi_fallback_behavior',
        ruleId: 'require_pbi_fallback_for_approximate_or_design_only',
        objectType: 'component',
        objectId: 'elicitation_panel',
        fieldPath: 'pbi_fallback_behavior',
        state: 'unanswered',
        ownerRole: 'dashboard_builder',
      }),
    ]);

    const summary = createPhantomSpecV2Summary(document);
    expect(summary.counts).toEqual({
      pages: 7,
      components: 3,
      metrics: 3,
      fields: 4,
      interactions: 4,
      acceptedGaps: 1,
      unresolvedPrompts: 1,
    });
    expect(summary.blocks.map((block) => block.id)).toContain('export_targets');

    const approvalPack = createPhantomSpecV2ApprovalPack(document, '2026-05-15T00:00:00.000Z');
    expect(approvalPack.generatedAt).toBe('2026-05-15T00:00:00.000Z');
    expect(approvalPack.readiness.react.score).toBeCloseTo(0.8667, 4);
    expect(approvalPack.readiness.powerBi.score).toBeCloseTo(0.8167, 4);
    expect(approvalPack.elicitationPrompts).toHaveLength(1);
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

  it('applies role-aware approval events and serializes updated frontmatter', async () => {
    const markdown = await readV2Spec();
    const document = parsePhantomSpecV2Markdown(markdown);
    const firstApproval = applyPhantomSpecV2Approval(document, {
      approver: 'A. Approver',
      role: 'approver',
      date: '2026-05-15',
      notes: 'Business owner approved the workshop output.',
    });

    expect(firstApproval.approval).toMatchObject({
      state: 'pending',
      approved: false,
      missingApprovalRoles: ['analytics_owner'],
    });

    const withFirstApproval = {
      ...document,
      frontmatter: firstApproval.frontmatter,
    };
    const secondApproval = applyPhantomSpecV2Approval(withFirstApproval, {
      approver: 'Analytics Lead',
      role: 'analytics_owner',
      date: '2026-05-15',
      notes: 'Metric definitions accepted for this draft.',
    });

    expect(secondApproval.approval).toMatchObject({
      state: 'approved',
      approved: true,
      missingApprovalRoles: [],
    });
    expect(secondApproval.approval.history).toEqual(expect.arrayContaining([
      expect.objectContaining({ role: 'approver', state: 'approved' }),
      expect.objectContaining({ role: 'analytics_owner', state: 'approved' }),
    ]));

    const updatedMarkdown = replacePhantomSpecV2Frontmatter(markdown, secondApproval.frontmatter);
    const updatedDocument = parsePhantomSpecV2Markdown(updatedMarkdown);
    expect(createPhantomSpecV2ApprovalStatus(updatedDocument)).toMatchObject({
      state: 'approved',
      approved: true,
      missingApprovalRoles: [],
    });
  });

  it('generates v0.2 React Product and Power BI handoff exports', async () => {
    const markdown = await readV2Spec();
    const document = parsePhantomSpecV2Markdown(markdown);
    const generatedAt = '2026-05-15T00:00:00.000Z';

    const dataContract = createPhantomSpecV2DataContractExport(document, generatedAt);
    expect(dataContract).toMatchObject({
      generatedAt,
      derivation: 'derived_from_metrics_components_interactions_and_exports',
    });
    expect(dataContract.fields).toHaveLength(4);
    expect(dataContract.metrics).toHaveLength(3);
    expect(dataContract.unresolvedPrompts).toHaveLength(1);

    const reactExport = createPhantomSpecV2ReactProductExport(document, generatedAt);
    expect(reactExport).toMatchObject({
      generatedAt,
      target: 'react',
      buildReady: false,
    });
    expect(reactExport.routeManifest).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'project_dashboard',
        path: '/',
        componentIds: ['project_header', 'readiness_score_panel', 'page_list_table', 'activity_feed'],
      }),
      expect.objectContaining({
        id: 'spec_canvas',
        path: '/spec-canvas',
      }),
    ]));
    expect(reactExport.components).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'elicitation_panel',
        renderTargets: expect.objectContaining({ power_bi: 'design_only' }),
        unresolvedPrompts: [
          expect.objectContaining({ fieldPath: 'pbi_fallback_behavior' }),
        ],
      }),
    ]));

    const powerBiExport = createPhantomSpecV2PowerBiExport(document, generatedAt);
    expect(powerBiExport).toMatchObject({
      generatedAt,
      target: 'power_bi',
      buildReady: false,
    });
    expect(powerBiExport.visualBuildMatrix).toEqual(expect.arrayContaining([
      expect.objectContaining({
        componentId: 'elicitation_panel',
        powerBiStatus: 'design_only',
        fallbackRequired: true,
      }),
      expect.objectContaining({
        componentId: 'readiness_score_panel',
        powerBiStatus: 'pbi_safe',
        fallbackRequired: false,
      }),
    ]));
    expect(powerBiExport.constraints).toEqual(expect.arrayContaining([
      'Power BI Mode is a constrained implementation guide, not a promise of visual parity.',
    ]));
  });

  it('resolves component elicitation prompts through controlled Markdown mutations', async () => {
    const markdown = await readV2Spec();
    const result = applyPhantomSpecV2PromptResolution(markdown, {
      objectType: 'component',
      objectId: 'elicitation_panel',
      fieldPath: 'pbi_fallback_behavior',
      value: 'Document Power BI as an implementation note and use React for exact workshop behavior.',
      ownerRole: 'dashboard_builder',
      date: '2026-05-15',
      notes: 'Accepted during workshop.',
    });

    expect(result.prompts).toEqual([]);
    expect(result.readiness.categories.requiredFieldsCompleteness).toMatchObject({
      numerator: 3,
      denominator: 3,
    });
    expect(result.readiness.score).toBeCloseTo(1, 4);
    expect(result.readiness.buildReady).toBe(false);
    expect(result.readiness.blockingIssues).toEqual([
      expect.objectContaining({ code: 'GATE_CURRENT_VERSION_APPROVAL_FAILED' }),
    ]);

    const updatedBlock = result.document.blocks.find((block) => block.header.id === 'component_instances');
    const components = Array.isArray(updatedBlock?.body.components) ? updatedBlock.body.components : [];
    expect(components).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'elicitation_panel',
        pbi_fallback_behavior: 'Document Power BI as an implementation note and use React for exact workshop behavior.',
        elicitation: expect.objectContaining({
          missing_fields: [],
          resolved_prompts: [
            expect.objectContaining({
              field: 'pbi_fallback_behavior',
              owner_role: 'dashboard_builder',
            }),
          ],
        }),
      }),
    ]));
  });
});
