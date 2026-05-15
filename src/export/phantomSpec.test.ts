import { describe, expect, it } from 'vitest';
import {
  checkPhantomReadiness,
  createPhantomDataContract,
  createPhantomDataContractMarkdown,
  createDesignSourcesMarkdown,
  createPhantomSpec,
  createPowerBiImplementationGuide,
  createPowerBiImplementationGuideMarkdown,
  createReactImplementationBacklog,
  createReactImplementationBacklogMarkdown,
  mergeDesignSourceIntoSpec,
  getComponentDataRequirements,
  getPowerBiExportStatus,
  summarizePhantomSpec,
  validatePhantomSpec,
} from './phantomSpec';
import type { DashboardItem } from '../types';

const item = (overrides: Partial<DashboardItem>): DashboardItem => ({
  id: 'visual-1',
  type: 'bar',
  title: 'Revenue by Region',
  layout: { x: 0, y: 0, w: 12, h: 8 },
  props: { dimension: 'Region', metric: 'revenue' },
  ...overrides,
});

describe('phantomSpec', () => {
  it('extracts metrics and dimensions from visual props', () => {
    expect(getComponentDataRequirements(item({}))).toEqual({
      metrics: ['revenue'],
      dimensions: ['Region'],
      fields: ['Region', 'revenue'],
    });
  });

  it('marks design-only Power BI visuals as unsupported', () => {
    expect(getPowerBiExportStatus('boxplot').status).toBe('unsupported');
  });

  it('marks approximate Power BI visuals separately', () => {
    expect(getPowerBiExportStatus('lollipop').status).toBe('approximate');
  });

  it('creates a versioned build-ready spec', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [
        item({}),
        item({ id: 'visual-2', type: 'boxplot', title: 'Distribution', props: { metric: 'profit' } }),
      ],
      filters: { Region: 'North' },
      layoutMode: 'Free',
      exportMode: 'react',
      themePalette: 'Default',
      drillActions: [
        {
          id: 'drill-1',
          sourceComponentId: 'visual-1',
          trigger: 'click',
          targetType: 'detailPanel',
          targetId: 'region-detail',
          label: 'Open region detail',
          context: [{ source: 'Region', target: 'region' }],
          preserveFilters: true,
        },
      ],
      generatedAt: '2026-05-15T00:00:00.000Z',
      specification: {
        signOffStatus: 'draft',
        audience: 'Executives',
        designEntryPoint: 'figma-led',
        designSources: [{ id: 'figma-1', type: 'figmaFrame', name: 'Executive concept', url: 'https://figma.com/file/example' }],
      },
    });

    expect(spec.specVersion).toBe('0.1.0');
    expect(spec.mode).toBe('react');
    expect(spec.project.scenario).toBe('Retail');
    expect(spec.project.specification.audience).toBe('Executives');
    expect(spec.project.designEntryPoint).toBe('figma-led');
    expect(spec.project.designSources[0].type).toBe('figmaFrame');
    expect(spec.views[0].components).toHaveLength(2);
    expect(spec.dataContract.metrics).toEqual(['profit', 'revenue']);
    expect(spec.dataContract.dimensions).toEqual(['Region']);
    expect(spec.views[0].components[1].exportTargets.powerBi.status).toBe('unsupported');
    expect(spec.interactions.drillActions[0].targetId).toBe('region-detail');
  });

  it('validates and summarizes Phantom specs for API consumers', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [
        item({}),
        item({ id: 'visual-2', type: 'lollipop', title: 'Ranking', props: { dimension: 'Region', metric: 'profit' } }),
      ],
      filters: {},
      layoutMode: 'Free',
      exportMode: 'powerBi',
      themePalette: 'Default',
      generatedAt: '2026-05-15T00:00:00.000Z',
    });

    expect(validatePhantomSpec(spec)).toEqual({ valid: true, errors: [] });
    expect(summarizePhantomSpec(spec)).toEqual({
      specVersion: '0.1.0',
      mode: 'powerBi',
      scenario: 'Retail',
      views: 1,
      components: 2,
      metrics: ['profit', 'revenue'],
      dimensions: ['Region'],
      powerBi: {
        ready: 1,
        approximate: 1,
      },
    });
  });

  it('merges Figma design sources into specs for API consumers', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [item({})],
      filters: {},
      layoutMode: 'Free',
      exportMode: 'react',
      themePalette: 'Default',
      generatedAt: '2026-05-15T00:00:00.000Z',
    });

    const nextSpec = mergeDesignSourceIntoSpec(spec, {
      type: 'figmaFrame',
      name: 'Client workshop frame',
      url: 'https://www.figma.com/design/example',
      frameId: '1:2',
      notes: 'Approved visual direction',
    });

    expect(nextSpec).not.toBe(spec);
    expect(nextSpec.project.designEntryPoint).toBe('figma-led');
    expect(nextSpec.project.specification.designEntryPoint).toBe('figma-led');
    expect(nextSpec.project.designSources).toEqual([
      {
        id: 'figmaFrame-1-2',
        type: 'figmaFrame',
        name: 'Client workshop frame',
        url: 'https://www.figma.com/design/example',
        frameId: '1:2',
        notes: 'Approved visual direction',
      },
    ]);
    expect(nextSpec.project.specification.designSources).toEqual(nextSpec.project.designSources);
    expect(checkPhantomReadiness(nextSpec, 'react').warnings.map((issue) => issue.code)).not.toContain('FIGMA_LED_WITHOUT_SOURCE');
  });

  it('formats design sources for handoff markdown', () => {
    expect(createDesignSourcesMarkdown([
      {
        id: 'figma-1',
        type: 'figmaFrame',
        name: 'Client workshop frame',
        url: 'https://www.figma.com/design/example',
        frameId: '1:2',
        notes: 'Approved visual direction',
      },
    ])).toBe('- Client workshop frame (type: figmaFrame; url: https://www.figma.com/design/example; frame: 1:2; notes: Approved visual direction)');
    expect(createDesignSourcesMarkdown([])).toBe('- None specified');
  });

  it('creates a React implementation backlog from component specs', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [
        item({}),
        item({ id: 'visual-2', type: 'boxplot', title: 'Profit Distribution', props: { metric: 'profit' } }),
      ],
      filters: {},
      layoutMode: 'Free',
      exportMode: 'react',
      themePalette: 'Default',
      generatedAt: '2026-05-15T00:00:00.000Z',
      specification: {
        signOffStatus: 'draft',
        designEntryPoint: 'figma-led',
        designSources: [{ id: 'figma-1', type: 'figmaFrame', name: 'Client frame' }],
      },
    });

    const backlog = createReactImplementationBacklog(spec);
    const markdown = createReactImplementationBacklogMarkdown(backlog);

    expect(backlog).toHaveLength(2);
    expect(backlog[0]).toMatchObject({
      componentId: 'visual-1',
      suggestedComponent: 'BarComponent',
      fields: ['Region', 'revenue'],
      powerBiStatus: 'ready',
    });
    expect(backlog[1].workItems).toContain('React implementation can exceed Power BI constraints; Power BI status is unsupported.');
    expect(markdown).toContain('### Profit Distribution');
    expect(markdown).toContain('- [ ] Apply linked design-source guidance for visual fidelity.');
    expect(markdown).toContain('- Power BI compatibility: unsupported');
  });

  it('replaces design sources by id instead of duplicating them', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [item({})],
      filters: {},
      layoutMode: 'Free',
      exportMode: 'react',
      themePalette: 'Default',
      generatedAt: '2026-05-15T00:00:00.000Z',
      specification: {
        signOffStatus: 'draft',
        designEntryPoint: 'figma-led',
        designSources: [{ id: 'figma-1', type: 'figmaFrame', name: 'Old frame' }],
      },
    });

    const nextSpec = mergeDesignSourceIntoSpec(spec, {
      id: 'figma-1',
      type: 'figmaFrame',
      name: 'Updated frame',
      url: 'https://www.figma.com/design/updated',
    });

    expect(nextSpec.project.designSources).toHaveLength(1);
    expect(nextSpec.project.designSources[0].name).toBe('Updated frame');
    expect(nextSpec.project.designSources[0].url).toBe('https://www.figma.com/design/updated');
  });

  it('reports validation errors for malformed Phantom specs', () => {
    const result = validatePhantomSpec({
      specVersion: '0.1.0',
      mode: 'unknown',
      project: {},
      views: [{ id: 'main', components: [{ id: 'visual-1' }] }],
      dataContract: { metrics: [] },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('mode must be react or powerBi.');
    expect(result.errors).toContain('project.scenario is required.');
    expect(result.errors).toContain('views[0].components[0].type is required.');
    expect(result.errors).toContain('dataContract.dimensions must be an array.');
  });

  it('reports Power BI readiness blockers and warnings', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [
        item({}),
        item({ id: 'visual-2', type: 'boxplot', title: 'Distribution', props: { metric: 'profit' } }),
        item({ id: 'visual-3', type: 'lollipop', title: 'Ranking', props: { dimension: 'Region', metric: 'revenue' } }),
      ],
      filters: {},
      layoutMode: 'Free',
      exportMode: 'powerBi',
      themePalette: 'Default',
      drillActions: [
        {
          id: 'drill-1',
          sourceComponentId: 'missing',
          trigger: 'click',
          targetType: 'detailPanel',
          targetId: 'detail',
          label: 'Broken drill',
          context: [],
          preserveFilters: true,
        },
      ],
    });

    const report = checkPhantomReadiness(spec, 'powerBi');

    expect(report.ready).toBe(false);
    expect(report.errors.map((issue) => issue.code)).toContain('POWER_BI_UNSUPPORTED_VISUAL');
    expect(report.errors.map((issue) => issue.code)).toContain('BROKEN_DRILL_SOURCE');
    expect(report.warnings.map((issue) => issue.code)).toContain('POWER_BI_APPROXIMATE_VISUAL');
    expect(report.warnings.map((issue) => issue.code)).toContain('DRILL_ACTION_WITHOUT_CONTEXT');
  });

  it('creates a data contract from a Phantom spec', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [item({})],
      filters: { Year: 2026 },
      layoutMode: 'Free',
      exportMode: 'react',
      themePalette: 'Default',
      drillActions: [
        {
          id: 'drill-1',
          sourceComponentId: 'visual-1',
          trigger: 'click',
          targetType: 'detailPanel',
          targetId: 'region-detail',
          label: 'Open region detail',
          context: [{ source: 'Region', target: 'region' }],
          preserveFilters: true,
        },
      ],
      generatedAt: '2026-05-15T00:00:00.000Z',
      specification: {
        signOffStatus: 'draft',
        designEntryPoint: 'figma-led',
        designSources: [{ id: 'figma-1', type: 'figmaFrame', name: 'Executive concept' }],
      },
    });

    const contract = createPhantomDataContract(spec, '2026-05-15T01:00:00.000Z');
    const markdown = createPhantomDataContractMarkdown(contract);

    expect(contract.project.designEntryPoint).toBe('figma-led');
    expect(contract.fields).toEqual([
      { name: 'Region', kind: 'dimension', requiredBy: ['visual-1'] },
      { name: 'revenue', kind: 'metric', requiredBy: ['visual-1'] },
    ]);
    expect(contract.components[0].fields).toEqual(['Region', 'revenue']);
    expect(contract.drillActions[0].targetId).toBe('region-detail');
    expect(markdown).toContain('| visual-1 | Revenue by Region | bar | Region, revenue |');
    expect(markdown).toContain('| drill-1 | Open region detail | visual-1 | detailPanel:region-detail | Region->region |');
    expect(markdown).toContain('## Design Sources');
    expect(markdown).toContain('- Executive concept (type: figmaFrame)');
  });

  it('creates a Power BI implementation guide with readiness and visual statuses', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [
        item({}),
        item({ id: 'visual-2', type: 'lollipop', title: 'Ranked variance', props: { dimension: 'Region', metric: 'profit' } }),
        item({ id: 'visual-3', type: 'boxplot', title: 'Profit distribution', props: { metric: 'profit' } }),
      ],
      filters: {},
      layoutMode: 'Free',
      exportMode: 'powerBi',
      themePalette: 'Default',
      drillActions: [
        {
          id: 'drill-1',
          sourceComponentId: 'visual-1',
          trigger: 'click',
          targetType: 'view',
          targetId: 'region-detail',
          label: 'Open region detail',
          context: [{ source: 'Region', target: 'region' }],
          preserveFilters: true,
        },
      ],
      generatedAt: '2026-05-15T00:00:00.000Z',
      specification: {
        signOffStatus: 'draft',
        designEntryPoint: 'figma-led',
        designSources: [{
          id: 'figma-1',
          type: 'figmaFrame',
          name: 'Power BI concept',
          url: 'https://www.figma.com/design/power-bi',
          frameId: '3:4',
        }],
      },
    });

    const guide = createPowerBiImplementationGuide(spec, '2026-05-15T01:00:00.000Z');
    const markdown = createPowerBiImplementationGuideMarkdown(guide);

    expect(guide.readiness.ready).toBe(false);
    expect(guide.summary.readyVisuals).toBe(1);
    expect(guide.summary.approximateVisuals).toBe(1);
    expect(guide.summary.unsupportedVisuals).toBe(1);
    expect(guide.components.map((component) => component.powerBiStatus)).toEqual(['ready', 'approximate', 'unsupported']);
    expect(markdown).toContain('| visual-2 | Ranked variance | lollipop | approximate | Region, profit |');
    expect(markdown).toContain('ERROR POWER_BI_UNSUPPORTED_VISUAL');
    expect(markdown).toContain('| drill-1 | Open region detail | visual-1 | view:region-detail | Region->region | Yes |');
    expect(markdown).toContain('- Power BI concept (type: figmaFrame; url: https://www.figma.com/design/power-bi; frame: 3:4)');
  });
});
