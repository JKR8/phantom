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
  stores?: Array<Pick<Store, 'id' | 'name' | 'region'>>;
  products?: Array<Pick<Product, 'id' | 'name' | 'category'>>;
  customers?: Array<Pick<Customer, 'id' | 'name' | 'industry'> & { tier?: string; region?: string }>;
}

export const getDimensionValue = (item: any, dimension: string, context: DimensionContext = {}) => {
  const { stores = [], products = [], customers = [] } = context;

  if (!dimension) return 'Unknown';
  const dimKey = dimension.toLowerCase();

  if (dimKey === 'region' && item?.storeId) {
    return stores.find((s) => s.id === item.storeId)?.region || 'Unknown';
  }

  if ((dimKey === 'store' || dimKey === 'store_name') && item?.storeId) {
    return stores.find((s) => s.id === item.storeId)?.name || 'Unknown';
  }

  if (dimKey === 'category' && item?.productId) {
    return products.find((p) => p.id === item.productId)?.category || 'Unknown';
  }

  if ((dimKey === 'product' || dimKey === 'product_name') && item?.productId) {
    return products.find((p) => p.id === item.productId)?.name || 'Unknown';
  }

  if ((dimKey === 'customer' || dimKey === 'name') && item?.customerId) {
    return customers.find((c) => c.id === item.customerId)?.name || 'Unknown';
  }

  if (dimKey === 'industry' && item?.customerId) {
    return customers.find((c) => c.id === item.customerId)?.industry || 'Unknown';
  }

  if (dimKey === 'tier' && item?.customerId) {
    return (customers.find((c) => c.id === item.customerId) as any)?.tier || 'Unknown';
  }

  if (dimKey === 'office' && item?.office) {
    return item.office;
  }

  // Try direct property, then camelCase, then lowercase
  const camelKey = dimension[0].toLowerCase() + dimension.slice(1);
  return item?.[dimension] ?? item?.[camelKey] ?? item?.[dimKey] ?? 'Unknown';
};
