import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

const createReadySpec = () => ({
  specVersion: '0.1.0',
  mode: 'react',
  generatedAt: '2026-05-15T00:00:00.000Z',
  project: {
    scenario: 'Retail',
    layoutMode: 'Free',
    themePalette: 'Default',
    specification: {
      signOffStatus: 'approved',
      businessQuestions: 'Which regions are growing?',
      audience: 'Executives',
      decisions: 'Prioritise regions.',
      acceptanceCriteria: 'Revenue by region is clear and drillable.',
      grain: 'daily',
      refreshCadence: 'daily',
      sourceSystems: 'Snowflake mart; CRM',
      dataSources: [
        {
          id: 'orders-mart',
          type: 'dbt',
          name: 'Orders mart',
          model: 'mart_orders',
          linkedComponentIds: ['visual-1', 'visual-2'],
          linkedFields: ['Region', 'Account', 'revenue'],
        },
      ],
    },
    designEntryPoint: 'figma-led',
    designSources: [
      {
        id: 'figma-1',
        type: 'figmaFrame',
        name: 'Client frame',
        linkedViewIds: ['main', 'detail'],
        linkedComponentIds: ['visual-1'],
      },
    ],
  },
  views: [
    {
      id: 'main',
      name: 'Executive Overview',
      layoutMode: 'Free',
      components: [
        {
          id: 'visual-1',
          type: 'bar',
          title: 'Revenue by Region',
          layout: { x: 0, y: 0, w: 12, h: 8 },
          props: { dimension: 'Region', metric: 'revenue' },
          dataRequirements: {
            metrics: ['revenue'],
            dimensions: ['Region'],
            fields: ['Region', 'revenue'],
          },
          exportTargets: {
            react: { status: 'ready' },
            powerBi: { status: 'ready' },
          },
        },
      ],
    },
    {
      id: 'detail',
      name: 'Region Detail',
      layoutMode: 'Free',
      components: [
        {
          id: 'visual-2',
          type: 'table',
          title: 'Regional Accounts',
          layout: { x: 0, y: 8, w: 12, h: 8 },
          props: { dimensions: ['Region', 'Account'], metrics: ['revenue'] },
          dataRequirements: {
            metrics: ['revenue'],
            dimensions: ['Region', 'Account'],
            fields: ['Region', 'Account', 'revenue'],
          },
          exportTargets: {
            react: { status: 'ready' },
            powerBi: { status: 'ready' },
          },
        },
      ],
    },
  ],
  filters: {},
  dataContract: {
    metrics: ['revenue'],
    dimensions: ['Region', 'Account'],
    fields: ['Region', 'Account', 'revenue'],
  },
  interactions: {
    drillActions: [
      {
        id: 'drill-1',
        sourceComponentId: 'visual-1',
        trigger: 'click',
        targetType: 'view',
        targetId: 'detail',
        label: 'Open region detail',
        context: [{ source: 'Region', target: 'Region' }],
        preserveFilters: true,
      },
    ],
  },
});

describe('phantom spec CLI', () => {
  it('exports React starters with route and component contracts', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-react-export-'));
    const specPath = join(tempDir, 'spec.json');
    const outDir = join(tempDir, 'react-starter');
    const spec = createReadySpec();

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-cli.mjs', 'export-react', specPath, outDir],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);

      expect(result.files).toContain('src/routes.ts');
      expect(result.files).toContain('src/component-contracts.ts');
      expect(result.files).toContain('src/design-handoff.json');
      expect(result.files).toContain('src/implementation-gate.json');
      expect(result.components).toBe(2);
      expect(result.drillActions).toBe(1);

      const routes = await readFile(join(outDir, 'src/routes.ts'), 'utf8');
      expect(routes).toContain('export type PhantomRouteDefinition');
      expect(routes).toContain('"path": "/"');
      expect(routes).toContain('"path": "/region-detail"');
      expect(routes).toContain('"drill-1"');

      const componentContracts = await readFile(join(outDir, 'src/component-contracts.ts'), 'utf8');
      expect(componentContracts).toContain('export type ComponentContract');
      expect(componentContracts).toContain('"id": "visual-1"');
      expect(componentContracts).toContain('"designSources": [');
      expect(componentContracts).toContain('"figma-1"');

      const designHandoff = JSON.parse(await readFile(join(outDir, 'src/design-handoff.json'), 'utf8'));
      expect(designHandoff).toMatchObject({
        subject: 'design-handoff',
        entryPoint: 'figma-led',
        designPlane: 'figma',
        sourceMode: 'figma-imported',
        missingMappings: [],
      });
      expect(designHandoff.components.map((component: { componentId: string }) => component.componentId))
        .toEqual(['visual-1', 'visual-2']);

      const implementationGate = JSON.parse(await readFile(join(outDir, 'src/implementation-gate.json'), 'utf8'));
      expect(implementationGate).toMatchObject({
        subject: 'implementation-gate',
        readyForImplementation: true,
        approvedForImplementation: true,
      });

      const app = await readFile(join(outDir, 'src/App.tsx'), 'utf8');
      expect(app).toContain("from './design-handoff.json'");
      expect(app).toContain("from './implementation-gate.json'");
      expect(app).toContain("from './component-contracts'");
      expect(app).toContain("from './routes'");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);

  it('exports handoff packs with implementation gate artifacts for agents', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-handoff-pack-'));
    const specPath = join(tempDir, 'spec.json');
    const outDir = join(tempDir, 'handoff-pack');
    const spec = createReadySpec();

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-cli.mjs', 'export-handoff-pack', specPath, outDir],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);

      expect(result.files).toContain('handoff-summary.json');
      expect(result.files).toContain('implementation-gate.json');
      expect(result.files).toContain('design-handoff.json');
      expect(result.files).toContain('HANDOFF_MANIFEST.json');
      expect(result.directories).toEqual(['data-contract', 'power-bi', 'react-starter']);

      const manifest = JSON.parse(await readFile(join(outDir, 'HANDOFF_MANIFEST.json'), 'utf8'));
      expect(manifest.implementationGate).toMatchObject({
        subject: 'implementation-gate',
        readyForImplementation: true,
        approvedForImplementation: true,
        designReady: true,
        dataPathReady: true,
        workshopIntentComplete: true,
      });
      expect(manifest.dataPath).toMatchObject({
        subject: 'data-path',
        unmappedComponents: [],
        unmappedFields: [],
      });
      expect(manifest.artifacts.implementationGate).toBe('implementation-gate.json');
      expect(manifest.designHandoff).toMatchObject({
        subject: 'design-handoff',
        sourceMode: 'figma-imported',
        missingMappings: [],
      });
      expect(manifest.artifacts.designHandoff).toBe('design-handoff.json');
      expect(manifest.artifacts.reactStarter).toContain('react-starter/src/routes.ts');
      expect(manifest.artifacts.reactStarter).toContain('react-starter/src/component-contracts.ts');

      const handoffSummary = JSON.parse(await readFile(join(outDir, 'handoff-summary.json'), 'utf8'));
      expect(handoffSummary.implementationGate).toEqual(manifest.implementationGate);
      expect(handoffSummary.dataPath).toEqual(manifest.dataPath);
      expect(handoffSummary.designHandoff).toEqual(manifest.designHandoff);

      const implementationGate = JSON.parse(await readFile(join(outDir, 'implementation-gate.json'), 'utf8'));
      expect(implementationGate).toEqual(manifest.implementationGate);

      const designHandoff = JSON.parse(await readFile(join(outDir, 'design-handoff.json'), 'utf8'));
      expect(designHandoff).toEqual(manifest.designHandoff);

      const readme = await readFile(join(outDir, 'README.md'), 'utf8');
      expect(readme).toContain('## Implementation Gate');
      expect(readme).toContain('Ready for implementation: Yes');
      expect(readme).toContain('Data path ready: Yes');
      expect(readme).toContain('## Data Path');
      expect(readme).toContain('## Design Handoff');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);

  it('inspects data paths for adapter and model planning', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-data-path-'));
    const specPath = join(tempDir, 'spec.json');
    const spec = createReadySpec();

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-cli.mjs', 'inspect', specPath, 'data-path'],
        { cwd: process.cwd() },
      );
      const dataPath = JSON.parse(stdout);

      expect(dataPath).toMatchObject({
        subject: 'data-path',
        grain: 'daily',
        refreshCadence: 'daily',
        sourceSystems: ['Snowflake mart', 'CRM'],
        unmappedComponents: [],
        unmappedFields: [],
        requiredNextSteps: [],
      });
      expect(dataPath.dataSources[0]).toMatchObject({
        id: 'orders-mart',
        type: 'dbt',
        model: 'mart_orders',
      });
      expect(dataPath.components.map((component: { candidateDataSources: string[] }) => component.candidateDataSources))
        .toEqual([['orders-mart'], ['orders-mart']]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);

  it('imports structured data sources through the CLI', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-import-data-source-'));
    const specPath = join(tempDir, 'spec.json');
    const outPath = join(tempDir, 'spec.with-data.json');
    const spec = JSON.parse(JSON.stringify(createReadySpec()));
    spec.project.specification.dataSources = [];

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        [
          'tools/phantom-spec-cli.mjs',
          'import-data-source',
          specPath,
          '--type',
          'dbt',
          '--name',
          'Orders mart',
          '--model',
          'mart_orders',
          '--fields',
          'Region,Account,revenue',
          '--components',
          'visual-1,visual-2',
          '--out',
          outPath,
        ],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);
      const nextSpec = JSON.parse(await readFile(outPath, 'utf8'));

      expect(result.imported).toMatchObject({
        id: 'dbt-mart-orders',
        type: 'dbt',
        name: 'Orders mart',
        model: 'mart_orders',
        linkedComponentIds: ['visual-1', 'visual-2'],
        linkedFields: ['Region', 'Account', 'revenue'],
      });
      expect(result.dataPath.requiredNextSteps).toEqual([]);
      expect(nextSpec.project.specification.dataSources).toHaveLength(1);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);
});
