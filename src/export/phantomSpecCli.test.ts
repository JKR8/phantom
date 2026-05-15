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

  it('inspects mixed Figma and Phantom-default design handoff for agents', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-mixed-design-handoff-'));
    const specPath = join(tempDir, 'spec.json');
    const spec = createReadySpec();
    spec.project.designSources = [
      {
        id: 'figma-1',
        type: 'figmaFrame',
        name: 'Client frame',
        linkedViewIds: [],
        linkedComponentIds: ['visual-1'],
      },
      {
        id: 'phantom-defaults',
        type: 'phantomDefault',
        name: 'Phantom analytical defaults',
        linkedViewIds: [],
        linkedComponentIds: ['visual-2'],
      },
    ];
    Object.assign(spec.project.specification, { designSources: spec.project.designSources });

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-cli.mjs', 'inspect', specPath, 'design-handoff'],
        { cwd: process.cwd() },
      );
      const handoff = JSON.parse(stdout);

      expect(handoff).toMatchObject({
        subject: 'design-handoff',
        entryPoint: 'figma-led',
        sourceMode: 'mixed',
        missingMappings: [],
      });
      expect(handoff.components).toEqual([
        expect.objectContaining({
          componentId: 'visual-1',
          designSourceIds: ['figma-1'],
          status: 'mapped-to-design-source',
          usesPhantomDefaults: false,
        }),
        expect.objectContaining({
          componentId: 'visual-2',
          designSourceIds: ['phantom-defaults'],
          status: 'phantom-default',
          usesPhantomDefaults: true,
        }),
      ]);
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

  it('switches target mode through the CLI for agent workflows', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-set-mode-'));
    const specPath = join(tempDir, 'spec.json');
    const outPath = join(tempDir, 'spec.powerbi.json');
    const spec = createReadySpec();

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        [
          'tools/phantom-spec-cli.mjs',
          'set-mode',
          specPath,
          '--mode',
          'power-bi',
          '--out',
          outPath,
        ],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);
      const nextSpec = JSON.parse(await readFile(outPath, 'utf8'));

      expect(result).toMatchObject({
        outPath,
        mode: 'powerBi',
        readiness: {
          react: true,
          powerBi: true,
        },
        implementationGate: {
          subject: 'implementation-gate',
          readyForImplementation: true,
          powerBiReady: true,
        },
      });
      expect(nextSpec.mode).toBe('powerBi');
      expect(nextSpec.project.specification.exportMode).toBe('powerBi');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);

  it('updates approval status through the CLI for implementation gates', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-set-approval-'));
    const specPath = join(tempDir, 'spec.json');
    const outPath = join(tempDir, 'spec.approved.json');
    const spec = JSON.parse(JSON.stringify(createReadySpec()));
    spec.project.specification.signOffStatus = 'draft';

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        [
          'tools/phantom-spec-cli.mjs',
          'set-approval',
          specPath,
          '--status',
          'approved',
          '--out',
          outPath,
        ],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);
      const nextSpec = JSON.parse(await readFile(outPath, 'utf8'));

      expect(result).toMatchObject({
        outPath,
        approval: {
          subject: 'approval',
          signOffStatus: 'approved',
          approvedForImplementation: true,
        },
        implementationGate: {
          subject: 'implementation-gate',
          readyForImplementation: true,
          approvedForImplementation: true,
        },
      });
      expect(nextSpec.project.specification.signOffStatus).toBe('approved');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);

  it('updates workshop intent through the CLI for implementation gates', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-set-workshop-intent-'));
    const specPath = join(tempDir, 'spec.json');
    const outPath = join(tempDir, 'spec.intent.json');
    const spec = JSON.parse(JSON.stringify(createReadySpec()));
    delete spec.project.specification.businessQuestions;
    delete spec.project.specification.audience;
    delete spec.project.specification.decisions;
    delete spec.project.specification.acceptanceCriteria;
    delete spec.project.specification.buildNotes;

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        [
          'tools/phantom-spec-cli.mjs',
          'set-workshop-intent',
          specPath,
          '--business-questions',
          'Which regions are growing and why?',
          '--audience',
          'Executive sponsors and regional managers',
          '--decisions',
          'Prioritise regional investment and follow-up actions.',
          '--acceptance-criteria',
          'Stakeholders can trace revenue movement to region and account detail.',
          '--build-notes',
          'Preserve the workshop-approved drill path.',
          '--out',
          outPath,
        ],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);
      const nextSpec = JSON.parse(await readFile(outPath, 'utf8'));

      expect(result).toMatchObject({
        outPath,
        workshopIntent: {
          businessQuestions: 'Which regions are growing and why?',
          audience: 'Executive sponsors and regional managers',
          decisions: 'Prioritise regional investment and follow-up actions.',
          acceptanceCriteria: 'Stakeholders can trace revenue movement to region and account detail.',
          buildNotes: 'Preserve the workshop-approved drill path.',
        },
        completeness: {
          complete: true,
          missing: [],
        },
        implementationGate: {
          subject: 'implementation-gate',
          workshopIntentComplete: true,
        },
      });
      expect(nextSpec.project.specification.businessQuestions).toBe('Which regions are growing and why?');
      expect(nextSpec.project.specification.buildNotes).toBe('Preserve the workshop-approved drill path.');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);

  it('adds views through the CLI for drill-through routes', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-add-view-'));
    const specPath = join(tempDir, 'spec.json');
    const outPath = join(tempDir, 'spec.with-view.json');
    const reactOutDir = join(tempDir, 'react-starter');
    const spec = JSON.parse(JSON.stringify(createReadySpec()));
    spec.views = [spec.views[0]];

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        [
          'tools/phantom-spec-cli.mjs',
          'add-view',
          specPath,
          '--id',
          'detail',
          '--name',
          'Region Detail',
          '--out',
          outPath,
        ],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);
      const nextSpec = JSON.parse(await readFile(outPath, 'utf8'));

      expect(result).toMatchObject({
        outPath,
        view: {
          id: 'detail',
          name: 'Region Detail',
          type: 'dashboard',
          layoutMode: 'Free',
          components: [],
        },
        summary: {
          views: 2,
        },
      });
      expect(nextSpec.views.map((view: { id: string }) => view.id)).toEqual(['main', 'detail']);

      await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-cli.mjs', 'export-react', outPath, reactOutDir],
        { cwd: process.cwd() },
      );
      const routes = await readFile(join(reactOutDir, 'src/routes.ts'), 'utf8');
      expect(routes).toContain('"viewId": "detail"');
      expect(routes).toContain('"path": "/region-detail"');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);

  it('adds components to target views through the CLI', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-add-component-'));
    const specPath = join(tempDir, 'spec.json');
    const outPath = join(tempDir, 'spec.with-component.json');
    const spec = JSON.parse(JSON.stringify(createReadySpec()));
    spec.views[1].components = [];

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        [
          'tools/phantom-spec-cli.mjs',
          'add-component',
          specPath,
          '--view',
          'detail',
          '--id',
          'detail-table',
          '--type',
          'table',
          '--title',
          'Account Detail',
          '--dimensions',
          'Region,Account',
          '--metrics',
          'revenue',
          '--out',
          outPath,
        ],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);
      const nextSpec = JSON.parse(await readFile(outPath, 'utf8'));

      expect(result.component).toMatchObject({
        id: 'detail-table',
        type: 'table',
        title: 'Account Detail',
        dataRequirements: {
          metrics: ['revenue'],
          dimensions: ['Region', 'Account'],
          fields: ['Account', 'Region', 'revenue'],
        },
        exportTargets: {
          react: { status: 'ready' },
          powerBi: { status: 'ready' },
        },
      });
      expect(result.summary.components).toBe(2);
      expect(nextSpec.views[1].components).toEqual([result.component]);
      expect(nextSpec.dataContract.fields).toContain('Account');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);

  it('inspects views with route and inbound drill metadata', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-inspect-views-'));
    const specPath = join(tempDir, 'spec.json');
    const spec = createReadySpec();

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-cli.mjs', 'inspect', specPath, 'views'],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);

      expect(result).toEqual({
        subject: 'views',
        count: 2,
        views: [
          {
            id: 'main',
            name: 'Executive Overview',
            type: 'dashboard',
            layoutMode: 'Free',
            routePath: '/',
            componentIds: ['visual-1'],
            componentCount: 1,
            inboundDrillActions: [],
          },
          {
            id: 'detail',
            name: 'Region Detail',
            type: 'dashboard',
            layoutMode: 'Free',
            routePath: '/region-detail',
            componentIds: ['visual-2'],
            componentCount: 1,
            inboundDrillActions: ['drill-1'],
          },
        ],
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);

  it('adds drill actions through the CLI for analytical journeys', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-add-drill-action-'));
    const specPath = join(tempDir, 'spec.json');
    const outPath = join(tempDir, 'spec.with-drill.json');
    const spec = JSON.parse(JSON.stringify(createReadySpec()));
    spec.interactions.drillActions = [];

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        [
          'tools/phantom-spec-cli.mjs',
          'add-drill-action',
          specPath,
          '--id',
          'drill-region-detail',
          '--source',
          'visual-1',
          '--trigger',
          'click',
          '--target-type',
          'view',
          '--target',
          'detail',
          '--label',
          'Open region detail',
          '--context',
          'Region:Region,Account:Account',
          '--out',
          outPath,
        ],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);
      const nextSpec = JSON.parse(await readFile(outPath, 'utf8'));

      expect(result).toMatchObject({
        outPath,
        drillAction: {
          id: 'drill-region-detail',
          sourceComponentId: 'visual-1',
          trigger: 'click',
          targetType: 'view',
          targetId: 'detail',
          label: 'Open region detail',
          context: [
            { source: 'Region', target: 'Region' },
            { source: 'Account', target: 'Account' },
          ],
          preserveFilters: true,
        },
        readiness: {
          react: true,
          powerBi: true,
        },
      });
      expect(nextSpec.interactions.drillActions).toEqual([result.drillAction]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);

  it('exports Power BI guides with implementation gate context', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'phantom-powerbi-guide-'));
    const specPath = join(tempDir, 'spec.json');
    const outDir = join(tempDir, 'power-bi');
    const spec = createReadySpec();

    try {
      await writeFile(specPath, `${JSON.stringify(spec, null, 2)}\n`);
      const { stdout } = await execFileAsync(
        process.execPath,
        ['tools/phantom-spec-cli.mjs', 'export-powerbi-guide', specPath, outDir],
        { cwd: process.cwd() },
      );
      const result = JSON.parse(stdout);

      expect(result.files).toEqual(['power-bi-implementation-guide.json', 'POWER_BI_IMPLEMENTATION_GUIDE.md']);

      const guide = JSON.parse(await readFile(join(outDir, 'power-bi-implementation-guide.json'), 'utf8'));
      expect(guide.implementationGate).toMatchObject({
        subject: 'implementation-gate',
        readyForImplementation: true,
        powerBiReady: true,
      });

      const markdown = await readFile(join(outDir, 'POWER_BI_IMPLEMENTATION_GUIDE.md'), 'utf8');
      expect(markdown).toContain('## Implementation Gate');
      expect(markdown).toContain('- Ready for implementation: Yes');
      expect(markdown).toContain('- Power BI ready: Yes');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }, 30000);
});
