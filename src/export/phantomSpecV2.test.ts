import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  PHANTOM_V2_SCHEMA_ID,
  parseAndValidatePhantomSpecV2Markdown,
  parsePhantomSpecV2Markdown,
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
    const { document, validation } = parseAndValidatePhantomSpecV2Markdown(markdown);

    expect(validation).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });

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
