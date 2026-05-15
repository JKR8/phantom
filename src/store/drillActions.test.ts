import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from './useStore';

describe('drill actions', () => {
  beforeEach(() => {
    useStore.getState().resetToNew();
  });

  it('adds, updates, and removes drill actions', () => {
    useStore.getState().addDrillAction({
      id: 'drill-1',
      sourceComponentId: 'rd-chart1',
      trigger: 'click',
      targetType: 'detailPanel',
      targetId: 'region-detail',
      label: 'Open region detail',
      context: [{ source: 'Region', target: 'region' }],
      preserveFilters: true,
    });

    expect(useStore.getState().drillActions).toHaveLength(1);
    useStore.getState().updateDrillAction('drill-1', { label: 'Open detail' });
    expect(useStore.getState().drillActions[0].label).toBe('Open detail');

    useStore.getState().removeDrillAction('drill-1');
    expect(useStore.getState().drillActions).toEqual([]);
  });

  it('removes drill actions when their source visual is removed', () => {
    useStore.getState().addDrillAction({
      id: 'drill-1',
      sourceComponentId: 'rd-chart1',
      trigger: 'click',
      targetType: 'detailPanel',
      targetId: 'region-detail',
      label: 'Open region detail',
      context: [{ source: 'Region', target: 'region' }],
      preserveFilters: true,
    });

    useStore.getState().removeItem('rd-chart1');

    expect(useStore.getState().drillActions).toEqual([]);
  });

  it('includes drill actions in the serializable state', () => {
    useStore.getState().addDrillAction({
      id: 'drill-1',
      sourceComponentId: 'rd-chart1',
      trigger: 'click',
      targetType: 'detailPanel',
      targetId: 'region-detail',
      label: 'Open region detail',
      context: [{ source: 'Region', target: 'region' }],
      preserveFilters: true,
    });

    expect(useStore.getState().getSerializableState().drillActions).toHaveLength(1);
  });
});
