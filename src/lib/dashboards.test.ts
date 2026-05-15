import { describe, expect, it } from 'vitest';
import { createDashboardPersistenceRow } from './dashboards';
import type { DashboardSnapshot } from '../types';

describe('dashboard persistence', () => {
  it('persists workshop handoff state in the specification blob', () => {
    const snapshot: DashboardSnapshot = {
      scenario: 'Retail',
      items: [{
        id: 'visual-1',
        type: 'bar',
        title: 'Revenue by Region',
        layout: { x: 0, y: 0, w: 12, h: 8 },
        props: { dimension: 'Region', metric: 'revenue' },
      }],
      drillActions: [{
        id: 'drill-1',
        sourceComponentId: 'visual-1',
        trigger: 'click',
        targetType: 'view',
        targetId: 'detail',
        label: 'Open detail',
        context: [{ source: 'Region', target: 'Region' }],
        preserveFilters: true,
      }],
      filters: { Region: 'North' },
      layoutMode: 'Free',
      exportMode: 'powerBi',
      themePalette: 'Default',
      specification: {
        signOffStatus: 'approved',
        designEntryPoint: 'figma-led',
        designSources: [{
          id: 'figma-1',
          type: 'figmaFrame',
          name: 'Client concept',
          linkedComponentIds: ['visual-1'],
        }],
        dataSources: [{
          id: 'orders-mart',
          type: 'dbt',
          name: 'Orders mart',
          linkedComponentIds: ['visual-1'],
          linkedFields: ['Region', 'revenue'],
        }],
      },
      annotations: [{
        id: 'note-1',
        type: 'sticky',
        x: 100,
        y: 120,
        width: 180,
        height: 100,
        content: 'Confirm KPI definition',
        color: '#fff4ce',
      }],
    };

    const row = createDashboardPersistenceRow('Client workshop', snapshot);

    expect(row).toMatchObject({
      name: 'Client workshop',
      scenario: 'Retail',
      layout_mode: 'Free',
      theme_palette: 'Default',
      filters: { Region: 'North' },
      specification: {
        signOffStatus: 'approved',
        designEntryPoint: 'figma-led',
        exportMode: 'powerBi',
      },
    });
    expect(row.specification.drillActions).toEqual(snapshot.drillActions);
    expect(row.specification.annotations).toEqual(snapshot.annotations);
    expect(row.specification.designSources?.[0].id).toBe('figma-1');
    expect(row.specification.dataSources?.[0].id).toBe('orders-mart');
  });
});
