import { describe, expect, it } from 'vitest';
import {
  checkPhantomReadiness,
  createPhantomDataContract,
  createPhantomDataContractMarkdown,
  createPhantomSpec,
  createPowerBiImplementationGuide,
  createPowerBiImplementationGuideMarkdown,
  getComponentDataRequirements,
  getPowerBiExportStatus,
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
  });
});
