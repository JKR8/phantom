import { describe, expect, it } from 'vitest';
import {
  computeLinearTrend,
  prepareCategoricalData,
  prepareScatterData,
  prepareTimeSeriesData,
} from './dataPrep';

const rows = [
  { id: '1', storeId: 's1', productId: 'p1', date: '2026-01-10', revenue: 100, revenuePL: 90, revenuePY: 80, profit: 30 },
  { id: '2', storeId: 's2', productId: 'p2', date: '2026-02-10', revenue: 220, revenuePL: 200, revenuePY: 190, profit: 75 },
  { id: '3', storeId: 's3', productId: 'p3', date: '2026-03-10', revenue: 50, revenuePL: 55, revenuePY: 40, profit: 12 },
  { id: '4', storeId: 's1', productId: 'p2', date: '2026-03-18', revenue: 80, revenuePL: 70, revenuePY: 65, profit: 24 },
];

const stores = [
  { id: 's1', name: 'Flagship', region: 'North' },
  { id: 's2', name: 'Outlet', region: 'South' },
];

const products = [
  { id: 'p1', name: 'Laptop', category: 'Tech' },
  { id: 'p2', name: 'Desk', category: 'Office' },
];

describe('visual-system dataPrep', () => {
  it('keeps Top N exact unless Other is explicitly enabled', () => {
    const prepared = prepareCategoricalData(rows, {
      dimension: 'Region',
      metric: 'revenue',
      stores,
      products,
      limit: 2,
      showOther: false,
    });

    expect(prepared.rows).toHaveLength(2);
    expect(prepared.rows.map((row) => row.label)).toEqual(['South', 'North']);
  });

  it('adds Other only when requested', () => {
    const prepared = prepareCategoricalData(rows, {
      dimension: 'Region',
      metric: 'revenue',
      stores,
      products,
      limit: 2,
      showOther: true,
    });

    expect(prepared.rows).toHaveLength(3);
    expect(prepared.rows[2]).toMatchObject({ label: 'Other', isOther: true, value: 50 });
  });

  it('supports alpha sorting and missing labels', () => {
    const prepared = prepareCategoricalData(rows, {
      dimension: 'Region',
      metric: 'revenue',
      stores,
      sort: 'alpha',
    });

    expect(prepared.rows.map((row) => row.label)).toEqual(['North', 'South', 'Unknown']);
    expect(prepared.missingCount).toBe(1);
  });

  it('prepares comparison time series rows', () => {
    const prepared = prepareTimeSeriesData(rows, 'revenue', 'month');
    const jan = prepared.find((row) => row.label === 'Jan');

    expect(jan).toMatchObject({ ac: 100, pl: 90, py: 80 });
    expect(prepared).toHaveLength(12);
  });

  it('prepares scatter data and a linear trend', () => {
    const points = prepareScatterData(rows, {
      xMetric: 'revenue',
      yMetric: 'profit',
      dimension: 'Category',
      products,
      stores,
    });
    const trend = computeLinearTrend(points);

    expect(points.map((point) => point.label).sort()).toEqual(['Office', 'Tech', 'Unknown']);
    expect(trend).toHaveLength(2);
  });
});

