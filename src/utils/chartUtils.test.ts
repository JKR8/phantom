import { describe, it, expect } from 'vitest';
import {
  isCurrencyMetric,
  isScoreMetric,
  formatMetricValue,
  getMetricValue,
  getDimensionValue,
} from './chartUtils';

describe('chartUtils', () => {
  describe('isCurrencyMetric', () => {
    it('returns true for currency-related metrics', () => {
      expect(isCurrencyMetric('revenue')).toBe(true);
      expect(isCurrencyMetric('Revenue')).toBe(true);
      expect(isCurrencyMetric('totalRevenue')).toBe(true);
      expect(isCurrencyMetric('profit')).toBe(true);
      expect(isCurrencyMetric('cost')).toBe(true);
      expect(isCurrencyMetric('salary')).toBe(true);
      expect(isCurrencyMetric('MRR')).toBe(true);
      expect(isCurrencyMetric('LTV')).toBe(true);
      expect(isCurrencyMetric('amount')).toBe(true);
      expect(isCurrencyMetric('price')).toBe(true);
      expect(isCurrencyMetric('marketValue')).toBe(true);
    });

    it('returns false for non-currency metrics', () => {
      expect(isCurrencyMetric('count')).toBe(false);
      expect(isCurrencyMetric('quantity')).toBe(false);
      expect(isCurrencyMetric('score')).toBe(false);
      expect(isCurrencyMetric('rating')).toBe(false);
    });
  });

  describe('isScoreMetric', () => {
    it('returns true for score metrics', () => {
      expect(isScoreMetric('score')).toBe(true);
      expect(isScoreMetric('SentimentScore')).toBe(true);
      expect(isScoreMetric('riskScore')).toBe(true);
    });

    it('returns false for non-score metrics', () => {
      expect(isScoreMetric('revenue')).toBe(false);
      expect(isScoreMetric('count')).toBe(false);
    });
  });

  describe('formatMetricValue', () => {
    it('formats currency with $ prefix', () => {
      expect(formatMetricValue('revenue', 1000)).toBe('$1,000');
      expect(formatMetricValue('profit', 1234567)).toBe('$1,234,567');
    });

    it('formats non-currency without prefix', () => {
      expect(formatMetricValue('count', 1000)).toBe('1,000');
    });

    it('formats scores with 2 decimal places', () => {
      expect(formatMetricValue('score', 3.14159)).toBe('3.14');
      expect(formatMetricValue('sentimentScore', 0.5)).toBe('0.50');
    });

    it('handles compact mode', () => {
      expect(formatMetricValue('revenue', 1500000, true)).toBe('$1.5M');
      expect(formatMetricValue('revenue', 50000, true)).toBe('$50K');
      expect(formatMetricValue('revenue', 500, true)).toBe('$500');
      expect(formatMetricValue('count', 2500, true)).toBe('3K'); // rounds to nearest K
    });

    it('handles non-finite values', () => {
      expect(formatMetricValue('revenue', NaN)).toBe('0');
      expect(formatMetricValue('revenue', Infinity)).toBe('0');
    });
  });

  describe('getMetricValue', () => {
    it('returns direct property match', () => {
      expect(getMetricValue({ revenue: 100 }, 'revenue')).toBe(100);
    });

    it('returns camelCase fallback', () => {
      expect(getMetricValue({ sentimentScore: 0.75 }, 'SentimentScore')).toBe(0.75);
    });

    it('returns lowercase fallback', () => {
      expect(getMetricValue({ revenue: 200 }, 'REVENUE')).toBe(200);
    });

    it('returns 0 for missing metric', () => {
      expect(getMetricValue({ revenue: 100 }, 'profit')).toBe(0);
    });

    it('returns 0 for undefined metric', () => {
      expect(getMetricValue({ revenue: 100 }, undefined)).toBe(0);
    });

    it('returns 0 for null item', () => {
      expect(getMetricValue(null, 'revenue')).toBe(0);
    });
  });

  describe('getDimensionValue', () => {
    const stores = [
      { id: 's1', name: 'Store One', region: 'North' },
      { id: 's2', name: 'Store Two', region: 'South' },
    ];
    const products = [
      { id: 'p1', name: 'Product A', category: 'Electronics' },
      { id: 'p2', name: 'Product B', category: 'Clothing' },
    ];
    const customers = [
      { id: 'c1', name: 'Alice', industry: 'Tech', tier: 'Enterprise' },
      { id: 'c2', name: 'Bob', industry: 'Finance', tier: 'Free' },
    ];

    it('resolves Region from storeId', () => {
      expect(getDimensionValue({ storeId: 's1' }, 'Region', { stores })).toBe('North');
    });

    it('resolves Store name from storeId', () => {
      expect(getDimensionValue({ storeId: 's2' }, 'Store', { stores })).toBe('Store Two');
    });

    it('resolves Category from productId', () => {
      expect(getDimensionValue({ productId: 'p1' }, 'Category', { products })).toBe('Electronics');
    });

    it('resolves Product name from productId', () => {
      expect(getDimensionValue({ productId: 'p2' }, 'Product', { products })).toBe('Product B');
    });

    it('resolves Customer name from customerId', () => {
      expect(getDimensionValue({ customerId: 'c1' }, 'Customer', { customers })).toBe('Alice');
    });

    it('resolves Industry from customerId', () => {
      expect(getDimensionValue({ customerId: 'c2' }, 'Industry', { customers })).toBe('Finance');
    });

    it('resolves Tier from customerId', () => {
      expect(getDimensionValue({ customerId: 'c1' }, 'Tier', { customers })).toBe('Enterprise');
    });

    it('returns direct Office property', () => {
      expect(getDimensionValue({ office: 'NYC' }, 'Office')).toBe('NYC');
    });

    it('returns Unknown for missing lookups', () => {
      expect(getDimensionValue({ storeId: 'invalid' }, 'Region', { stores })).toBe('Unknown');
    });

    it('returns Unknown for empty dimension', () => {
      expect(getDimensionValue({ revenue: 100 }, '')).toBe('Unknown');
    });

    it('falls back to direct/camel/lower property', () => {
      expect(getDimensionValue({ status: 'Active' }, 'status')).toBe('Active');
      expect(getDimensionValue({ Status: 'Pending' }, 'Status')).toBe('Pending');
    });
  });
});
