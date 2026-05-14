import { formatDateLabel, formatMetric } from './formatters';
import type { PreparedVisualData, PreparedVisualDatum, VisualSort } from './types';
import { getDimensionValue, getMetricValue } from '../utils/chartUtils';
import type { Customer, Product, Store } from '../types';

interface DimensionContext {
  stores?: Array<Pick<Store, 'id' | 'name' | 'region'>>;
  products?: Array<Pick<Product, 'id' | 'name' | 'category'>>;
  customers?: Array<Pick<Customer, 'id' | 'name' | 'industry'> & { tier?: string; region?: string }>;
}

interface CategoricalPrepOptions extends DimensionContext {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  sort?: VisualSort;
  limit?: number | string;
  showOther?: boolean;
}

const parseLimit = (limit?: number | string) => {
  if (limit === undefined || limit === null || limit === 'All') return undefined;
  const parsed = typeof limit === 'number' ? limit : Number.parseInt(limit, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const sortPreparedRows = (rows: PreparedVisualDatum[], sort: VisualSort = 'desc') => {
  if (sort === 'asc') return [...rows].sort((a, b) => a.value - b.value);
  if (sort === 'alpha') return [...rows].sort((a, b) => a.label.localeCompare(b.label));
  if (sort === 'none') return [...rows];
  return [...rows].sort((a, b) => b.value - a.value);
};

export const prepareCategoricalData = (
  rows: any[],
  options: CategoricalPrepOptions
): PreparedVisualData => {
  const {
    dimension,
    metric,
    manualData,
    sort = 'desc',
    limit,
    showOther = false,
    stores,
    products,
    customers,
  } = options;

  const sourceRows = manualData && manualData.length > 0
    ? manualData.map((row) => ({
        key: row.label || 'Unknown',
        label: row.label || 'Unknown',
        value: Number(row.value) || 0,
      }))
    : Object.entries(rows.reduce<Record<string, number>>((acc, row) => {
        const label = getDimensionValue(row, dimension, { stores, products, customers }) || 'Unknown';
        acc[label] = (acc[label] || 0) + getMetricValue(row, metric);
        return acc;
      }, {})).map(([label, value]) => ({
        key: label,
        label,
        value: Math.round(value),
      }));

  const missingCount = sourceRows.filter((row) => !row.label || row.label === 'Unknown').length;
  let prepared = sortPreparedRows(sourceRows.map((row) => ({
    ...row,
    formattedValue: formatMetric(metric, row.value, true),
    isMissing: !row.label || row.label === 'Unknown',
  })), sort);

  const numericLimit = parseLimit(limit);
  if (numericLimit && prepared.length > numericLimit) {
    const top = prepared.slice(0, numericLimit);
    if (showOther) {
      const otherValue = prepared.slice(numericLimit).reduce((sum, row) => sum + row.value, 0);
      top.push({
        key: 'Other',
        label: 'Other',
        value: otherValue,
        formattedValue: formatMetric(metric, otherValue, true),
        isOther: true,
      });
    }
    prepared = top;
  }

  const values = prepared.map((row) => row.value);
  return {
    rows: prepared,
    total: values.reduce((sum, value) => sum + value, 0),
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0,
    missingCount,
    meta: {
      dimension,
      metric,
      limit: numericLimit || 'All',
      sort,
      showOther,
    },
  };
};

export interface TimeSeriesPoint {
  key: string;
  label: string;
  index: number;
  ac: number;
  pl: number;
  py: number;
  variance: number;
  variancePct: number;
  formattedAc: string;
}

const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4'];

export const prepareTimeSeriesData = (
  rows: any[],
  metric: string,
  timeGrain: 'month' | 'quarter' | 'year' = 'month',
  manualData?: Array<{ label: string; value: number }>
): TimeSeriesPoint[] => {
  if (manualData && manualData.length > 0) {
    return manualData.map((row, index) => ({
      key: row.label,
      label: row.label,
      index,
      ac: row.value,
      pl: row.value * 0.95,
      py: row.value * 0.9,
      variance: row.value * 0.05,
      variancePct: 5,
      formattedAc: formatMetric(metric, row.value, true),
    }));
  }

  const bucketData = new Map<string, { ac: number; pl: number; py: number }>();
  const order = timeGrain === 'month' ? monthOrder : timeGrain === 'quarter' ? quarterOrder : [];

  order.forEach((label) => bucketData.set(label, { ac: 0, pl: 0, py: 0 }));

  rows.forEach((row) => {
    const label = formatDateLabel(row.date, timeGrain);
    const ac = getMetricValue(row, metric);
    const pl = getMetricValue(row, `${metric}PL`) || ac * 0.95;
    const py = getMetricValue(row, `${metric}PY`) || ac * 0.9;
    const current = bucketData.get(label) || { ac: 0, pl: 0, py: 0 };
    current.ac += ac;
    current.pl += pl;
    current.py += py;
    bucketData.set(label, current);
  });

  const labels = order.length > 0 ? order : Array.from(bucketData.keys()).sort();
  return labels.map((label, index) => {
    const values = bucketData.get(label) || { ac: 0, pl: 0, py: 0 };
    const variance = values.ac - values.pl;
    return {
      key: label,
      label,
      index,
      ac: Math.round(values.ac),
      pl: Math.round(values.pl),
      py: Math.round(values.py),
      variance: Math.round(variance),
      variancePct: values.pl ? (variance / values.pl) * 100 : 0,
      formattedAc: formatMetric(metric, values.ac, true),
    };
  });
};

export interface ScatterPoint {
  key: string;
  label: string;
  x: number;
  y: number;
}

export const prepareScatterData = (
  rows: any[],
  options: DimensionContext & {
    xMetric: string;
    yMetric: string;
    dimension?: string;
    manualData?: Array<{ label: string; value: number }>;
  }
): ScatterPoint[] => {
  const { xMetric, yMetric, dimension, manualData, stores, products, customers } = options;

  if (manualData && manualData.length > 0) {
    return manualData.map((row, index) => ({
      key: row.label || `Point ${index + 1}`,
      label: row.label || `Point ${index + 1}`,
      x: row.value,
      y: row.value,
    }));
  }

  const grouped = new Map<string, ScatterPoint>();
  rows.forEach((row, index) => {
    const label = dimension
      ? getDimensionValue(row, dimension, { stores, products, customers })
      : row.id || `Point ${index + 1}`;
    const current = grouped.get(label) || { key: label, label, x: 0, y: 0 };
    current.x += getMetricValue(row, xMetric);
    current.y += getMetricValue(row, yMetric);
    grouped.set(label, current);
  });

  return Array.from(grouped.values()).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
};

export const computeLinearTrend = (points: ScatterPoint[]) => {
  if (points.length < 2) return [];
  const n = points.length;
  const sumX = points.reduce((sum, point) => sum + point.x, 0);
  const sumY = points.reduce((sum, point) => sum + point.y, 0);
  const sumXY = points.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = points.reduce((sum, point) => sum + point.x * point.x, 0);
  const denominator = n * sumXX - sumX * sumX;
  if (!denominator) return [];

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const xs = points.map((point) => point.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];
};

