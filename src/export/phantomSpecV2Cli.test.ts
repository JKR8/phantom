import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const specPath = join(process.cwd(), 'phantom_product_spec_v0.2.md');

describe('phantom v0.2 spec CLI', () => {
  it('validates and summarizes Markdown phantom_block specs', async () => {
    const validate = await execFileAsync(
      process.execPath,
      ['tools/phantom-spec-v2-cli.mjs', 'validate', specPath],
      { cwd: process.cwd() },
    );
    expect(JSON.parse(validate.stdout)).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });

    const summary = await execFileAsync(
      process.execPath,
      ['tools/phantom-spec-v2-cli.mjs', 'summary', specPath],
      { cwd: process.cwd() },
    );
    expect(JSON.parse(summary.stdout)).toMatchObject({
      schemaId: 'phantom.spec.v0.2',
      counts: {
        pages: 7,
        components: 3,
        metrics: 3,
        fields: 4,
        interactions: 4,
        acceptedGaps: 1,
        unresolvedPrompts: 1,
      },
      readiness: {
        target: 'react',
        buildReady: false,
      },
    });
  });

  it('exports an approval pack for agent handoff', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-v2-approval-pack-'));
    const outPath = join(tempDir, 'approval-pack.json');

    try {
      const { stdout } = await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-v2-cli.mjs', 'export-approval-pack', specPath, outPath],
        { cwd: process.cwd() },
      );
      expect(JSON.parse(stdout)).toMatchObject({
        outPath,
        approved: false,
        reactBuildReady: false,
        powerBiBuildReady: false,
      });

      const pack = JSON.parse(await readFile(outPath, 'utf8'));
      expect(pack.metrics).toHaveLength(3);
      expect(pack.elicitationPrompts).toEqual([
        expect.objectContaining({
          id: 'component:elicitation_panel:pbi_fallback_behavior',
          ruleId: 'require_pbi_fallback_for_approximate_or_design_only',
        }),
      ]);
      expect(pack.acceptedGaps).toEqual([
        expect.objectContaining({
          fieldId: 'pbi_fallback_behavior',
          complete: true,
        }),
      ]);
      expect(pack.readiness.powerBi.blockingIssues).toEqual(expect.arrayContaining([
        expect.objectContaining({
          code: 'READINESS_BELOW_THRESHOLD',
        }),
      ]));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('appends approval events to Markdown frontmatter through the CLI', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-v2-approve-'));
    const firstOut = join(tempDir, 'first.md');
    const secondOut = join(tempDir, 'second.md');

    try {
      const first = await execFileAsync(
        process.execPath,
        [
          'tools/phantom-spec-v2-cli.mjs',
          'approve',
          specPath,
          '--role',
          'approver',
          '--approver',
          'A. Approver',
          '--date',
          '2026-05-15',
          '--out',
          firstOut,
        ],
        { cwd: process.cwd() },
      );
      expect(JSON.parse(first.stdout).approval).toMatchObject({
        state: 'pending',
        approved: false,
        missingApprovalRoles: ['analytics_owner'],
      });

      const second = await execFileAsync(
        process.execPath,
        [
          'tools/phantom-spec-v2-cli.mjs',
          'approve',
          firstOut,
          '--role',
          'analytics_owner',
          '--approver',
          'Analytics Lead',
          '--date',
          '2026-05-15',
          '--out',
          secondOut,
        ],
        { cwd: process.cwd() },
      );
      expect(JSON.parse(second.stdout).approval).toMatchObject({
        state: 'approved',
        approved: true,
        missingApprovalRoles: [],
      });

      const inspection = await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-v2-cli.mjs', 'inspect', secondOut, 'approval'],
        { cwd: process.cwd() },
      );
      expect(JSON.parse(inspection.stdout).history).toEqual(expect.arrayContaining([
        expect.objectContaining({ role: 'approver', state: 'approved' }),
        expect.objectContaining({ role: 'analytics_owner', state: 'approved' }),
      ]));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('exports React Product and Power BI packs from Markdown specs', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-v2-export-packs-'));
    const reactOut = join(tempDir, 'react-pack.json');
    const powerBiOut = join(tempDir, 'powerbi-pack.json');

    try {
      const react = await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-v2-cli.mjs', 'export-react-pack', specPath, reactOut],
        { cwd: process.cwd() },
      );
      expect(JSON.parse(react.stdout)).toMatchObject({
        outPath: reactOut,
        target: 'react',
        buildReady: false,
        pages: 7,
        components: 3,
        unresolvedPrompts: 1,
      });

      const reactPack = JSON.parse(await readFile(reactOut, 'utf8'));
      expect(reactPack.routeManifest).toEqual(expect.arrayContaining([
        expect.objectContaining({ id: 'project_dashboard', path: '/' }),
        expect.objectContaining({ id: 'spec_canvas', path: '/spec-canvas' }),
      ]));

      const powerBi = await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-v2-cli.mjs', 'export-powerbi-pack', specPath, powerBiOut],
        { cwd: process.cwd() },
      );
      expect(JSON.parse(powerBi.stdout)).toMatchObject({
        outPath: powerBiOut,
        target: 'power_bi',
        buildReady: false,
        visuals: 3,
        fallbackRequired: 1,
      });

      const powerBiPack = JSON.parse(await readFile(powerBiOut, 'utf8'));
      expect(powerBiPack.visualBuildMatrix).toEqual(expect.arrayContaining([
        expect.objectContaining({
          componentId: 'elicitation_panel',
          powerBiStatus: 'design_only',
          fallbackRequired: true,
        }),
      ]));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
