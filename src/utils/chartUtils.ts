import type { Customer, Product, Store } from '../types';

const currencyKeywords = ['revenue', 'profit', 'cost', 'salary', 'mrr', 'ltv', 'amount', 'price', 'marketvalue'];

export const isCurrencyMetric = (metricName: string) => {
  const key = metricName.toLowerCase();
  return currencyKeywords.some((k) => key.includes(k));
};

export const isScoreMetric = (metricName: string) => metricName.toLowerCase().includes('score');

export const formatMetricValue = (metricName: string, value: number, compact = false) => {
  if (!Number.isFinite(value)) return '0';
  if (isScoreMetric(metricName)) return value.toFixed(2);

  if (compact) {
    const abs = Math.abs(value);
    const prefix = isCurrencyMetric(metricName) ? '$' : '';
    if (abs >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${prefix}${(value / 1_000).toFixed(0)}K`;
    return `${prefix}${Math.round(value)}`;
  }

  const formatted = Number(value).toLocaleString();
  return isCurrencyMetric(metricName) ? `$${formatted}` : formatted;
};

export const getMetricValue = (item: any, metric?: string) => {
  if (!metric) return 0;
  const direct = item?.[metric];
  if (typeof direct === 'number') return direct;
  // camelCase fallback: e.g. "SentimentScore" → "sentimentScore"
  const camel = item?.[metric[0].toLowerCase() + metric.slice(1)];
  if (typeof camel === 'number') return camel;
  const lower = item?.[metric.toLowerCase()];
  return typeof lower === 'number' ? lower : 0;
};

interface DimensionContext {
  stores?: Store[];
  products?: Product[];
  customers?: Customer[];
}

export const getDimensionValue = (item: any, dimension: string, context: DimensionContext = {}) => {
  const { stores = [], products = [], customers = [] } = context;

  if (!dimension) return 'Unknown';

  if (dimension === 'Region' && item?.storeId) {
    return stores.find((s) => s.id === item.storeId)?.region || 'Unknown';
  }

  if (dimension === 'Store' && item?.storeId) {
    return stores.find((s) => s.id === item.storeId)?.name || 'Unknown';
  }

  if (dimension === 'Category' && item?.productId) {
    return products.find((p) => p.id === item.productId)?.category || 'Unknown';
  }

  if (dimension === 'Product' && item?.productId) {
    return products.find((p) => p.id === item.productId)?.name || 'Unknown';
  }

  if (dimension === 'Customer' && item?.customerId) {
    return customers.find((c) => c.id === item.customerId)?.name || 'Unknown';
  }

  if (dimension === 'Industry' && item?.customerId) {
    return customers.find((c) => c.id === item.customerId)?.industry || 'Unknown';
  }

  if (dimension === 'Office' && item?.office) {
    return item.office;
  }

  // Try direct property, then camelCase, then lowercase
  const dimKey = dimension.toLowerCase();
  const camelKey = dimension[0].toLowerCase() + dimension.slice(1);
  return item?.[dimension] ?? item?.[camelKey] ?? item?.[dimKey] ?? 'Unknown';
};
