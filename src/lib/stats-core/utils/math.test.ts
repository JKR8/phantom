import { describe, it, expect } from 'vitest';
import {
  mean,
  variance,
  standardDeviation,
  quantile,
  interquartileRange,
  sum,
  min,
  max,
  normalPDF,
  normalCDF,
  probit,
  tCritical,
} from './math';

describe('math utilities', () => {
  describe('mean', () => {
    it('calculates mean of simple array', () => {
      expect(mean([1, 2, 3, 4, 5])).toBe(3);
    });

    it('calculates mean of single value', () => {
      expect(mean([42])).toBe(42);
    });

    it('returns NaN for empty array', () => {
      expect(mean([])).toBeNaN();
    });

    it('handles negative numbers', () => {
      expect(mean([-2, -1, 0, 1, 2])).toBe(0);
    });

    it('handles decimals', () => {
      expect(mean([1.5, 2.5, 3.5])).toBeCloseTo(2.5);
    });
  });

  describe('variance', () => {
    it('calculates population variance (ddof=0)', () => {
      // Variance of [1,2,3,4,5] = ((1-3)^2 + (2-3)^2 + (3-3)^2 + (4-3)^2 + (5-3)^2) / 5 = 10/5 = 2
      expect(variance([1, 2, 3, 4, 5], 0)).toBe(2);
    });

    it('calculates sample variance (ddof=1)', () => {
      // Sample variance of [1,2,3,4,5] = 10/4 = 2.5
      expect(variance([1, 2, 3, 4, 5], 1)).toBe(2.5);
    });

    it('returns NaN for empty array', () => {
      expect(variance([])).toBeNaN();
    });

    it('returns 0 for single value with population variance', () => {
      expect(variance([5], 0)).toBe(0);
    });
  });

  describe('standardDeviation', () => {
    it('calculates population standard deviation', () => {
      expect(standardDeviation([1, 2, 3, 4, 5], 0)).toBeCloseTo(Math.sqrt(2));
    });

    it('calculates sample standard deviation', () => {
      expect(standardDeviation([1, 2, 3, 4, 5], 1)).toBeCloseTo(Math.sqrt(2.5));
    });
  });

  describe('quantile', () => {
    const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    it('calculates median (p=0.5)', () => {
      expect(quantile(sorted, 0.5)).toBe(5.5);
    });

    it('calculates Q1 (p=0.25)', () => {
      expect(quantile(sorted, 0.25)).toBeCloseTo(3.25);
    });

    it('calculates Q3 (p=0.75)', () => {
      expect(quantile(sorted, 0.75)).toBeCloseTo(7.75);
    });

    it('returns min for p=0', () => {
      expect(quantile(sorted, 0)).toBe(1);
    });

    it('returns max for p=1', () => {
      expect(quantile(sorted, 1)).toBe(10);
    });

    it('returns NaN for empty array', () => {
      expect(quantile([], 0.5)).toBeNaN();
    });

    it('handles single value', () => {
      expect(quantile([5], 0.5)).toBe(5);
    });
  });

  describe('interquartileRange', () => {
    it('calculates IQR correctly', () => {
      const sorted = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      // IQR = Q3 - Q1 = 7.75 - 3.25 = 4.5
      expect(interquartileRange(sorted)).toBeCloseTo(4.5);
    });

    it('returns 0 for constant values', () => {
      expect(interquartileRange([5, 5, 5, 5])).toBe(0);
    });
  });

  describe('sum', () => {
    it('sums array', () => {
      expect(sum([1, 2, 3, 4, 5])).toBe(15);
    });

    it('returns 0 for empty array', () => {
      expect(sum([])).toBe(0);
    });
  });

  describe('min', () => {
    it('finds minimum', () => {
      expect(min([3, 1, 4, 1, 5, 9])).toBe(1);
    });

    it('returns NaN for empty array', () => {
      expect(min([])).toBeNaN();
    });

    it('handles negative numbers', () => {
      expect(min([-5, -2, 0, 3])).toBe(-5);
    });
  });

  describe('max', () => {
    it('finds maximum', () => {
      expect(max([3, 1, 4, 1, 5, 9])).toBe(9);
    });

    it('returns NaN for empty array', () => {
      expect(max([])).toBeNaN();
    });
  });

  describe('normalPDF', () => {
    it('returns correct value at x=0', () => {
      // PDF at mean should be 1/sqrt(2*pi) ≈ 0.3989
      expect(normalPDF(0)).toBeCloseTo(0.3989, 3);
    });

    it('is symmetric', () => {
      expect(normalPDF(1)).toBeCloseTo(normalPDF(-1));
    });

    it('decreases away from mean', () => {
      expect(normalPDF(0)).toBeGreaterThan(normalPDF(1));
      expect(normalPDF(1)).toBeGreaterThan(normalPDF(2));
    });
  });

  describe('normalCDF', () => {
    it('returns 0.5 at x=0', () => {
      expect(normalCDF(0)).toBeCloseTo(0.5, 4);
    });

    it('returns ~0.8413 at x=1 (one std dev)', () => {
      expect(normalCDF(1)).toBeCloseTo(0.8413, 3);
    });

    it('returns ~0.9772 at x=2 (two std devs)', () => {
      expect(normalCDF(2)).toBeCloseTo(0.9772, 3);
    });

    it('returns ~0.0228 at x=-2', () => {
      expect(normalCDF(-2)).toBeCloseTo(0.0228, 3);
    });

    it('is bounded between 0 and 1', () => {
      // For extreme values, may round to exactly 0 or 1 due to floating point
      expect(normalCDF(-10)).toBeGreaterThanOrEqual(0);
      expect(normalCDF(-10)).toBeLessThan(0.001);
      expect(normalCDF(10)).toBeGreaterThan(0.999);
      expect(normalCDF(10)).toBeLessThanOrEqual(1);
    });
  });

  describe('probit', () => {
    it('returns 0 at p=0.5', () => {
      expect(probit(0.5)).toBe(0);
    });

    it('returns ~1.645 at p=0.95', () => {
      expect(probit(0.95)).toBeCloseTo(1.645, 2);
    });

    it('returns ~1.96 at p=0.975', () => {
      expect(probit(0.975)).toBeCloseTo(1.96, 2);
    });

    it('returns -Infinity at p=0', () => {
      expect(probit(0)).toBe(-Infinity);
    });

    it('returns Infinity at p=1', () => {
      expect(probit(1)).toBe(Infinity);
    });

    it('is inverse of normalCDF (approximately)', () => {
      expect(normalCDF(probit(0.75))).toBeCloseTo(0.75, 3);
    });
  });

  describe('tCritical', () => {
    it('approximates normal for large df', () => {
      // For df >= 30, should approach normal distribution
      expect(tCritical(100, 0.975)).toBeCloseTo(1.96, 1);
    });

    it('returns larger values for small df', () => {
      // t with small df has heavier tails
      expect(tCritical(5, 0.975)).toBeGreaterThan(tCritical(30, 0.975));
    });

    it('returns ~2.776 for df=4, p=0.975', () => {
      // Known value from t-table
      expect(tCritical(4, 0.975)).toBeCloseTo(2.776, 1);
    });

    it('returns NaN for invalid df', () => {
      expect(tCritical(0, 0.975)).toBeNaN();
      expect(tCritical(-1, 0.975)).toBeNaN();
    });
  });
});
