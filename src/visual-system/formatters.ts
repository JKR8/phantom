const currencyKeywords = ['revenue', 'profit', 'cost', 'salary', 'mrr', 'ltv', 'amount', 'price', 'marketvalue', 'arr', 'cac'];
const scoreKeywords = ['score', 'rating', 'sentiment'];

export const isCurrencyLike = (metricName = '') => {
  const key = metricName.toLowerCase();
  return currencyKeywords.some((word) => key.includes(word));
};

export const isScoreLike = (metricName = '') => {
  const key = metricName.toLowerCase();
  return scoreKeywords.some((word) => key.includes(word));
};

export const formatNumber = (value: number, compact = false, decimals = 1) => {
  if (!Number.isFinite(value)) return '0';

  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(decimals)}B`;
    if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(decimals)}M`;
    if (abs >= 1_000) return `${(value / 1_000).toFixed(decimals)}K`;
  }

  return Math.abs(value) < 10 && value % 1 !== 0
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : Math.round(value).toLocaleString();
};

export const formatMetric = (metricName: string | undefined, value: number, compact = false) => {
  if (!Number.isFinite(value)) return '0';
  if (isScoreLike(metricName)) return value.toFixed(2);

  const prefix = isCurrencyLike(metricName) ? '$' : '';
  return `${prefix}${formatNumber(value, compact)}`;
};

export const formatPercent = (value: number, decimals = 1) => {
  if (!Number.isFinite(value)) return '0.0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export const formatDelta = (metricName: string | undefined, value: number, compact = true) => {
  if (!Number.isFinite(value)) return '0';
  const sign = value > 0 ? '+' : '';
  return `${sign}${formatMetric(metricName, value, compact)}`;
};

export const formatDateLabel = (value: string | Date, grain: 'month' | 'quarter' | 'year' = 'month') => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  if (grain === 'year') return `${date.getFullYear()}`;
  if (grain === 'quarter') return `Q${Math.floor(date.getMonth() / 3) + 1}`;
  return date.toLocaleString('en-US', { month: 'short' });
};

export const toDisplayLabel = (value: string | undefined) => {
  if (!value) return '';
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

