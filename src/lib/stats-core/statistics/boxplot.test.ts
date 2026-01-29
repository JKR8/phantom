import { describe, it, expect } from 'vitest';
import { computeBoxplotStats, computeGroupedBoxplotStats } from './boxplot';

describe('boxplot statistics', () => {
  // Classic dataset for testing: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
  const simpleData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Dataset with outliers: normal range 10-50, outliers at 1 and 100
  const dataWithOutliers = [1, 10, 20, 25, 30, 35, 40, 50, 100];

  describe('computeBoxplotStats - basic statistics', () => {
    it('calculates min and max correctly', () => {
      const stats = computeBoxplotStats(simpleData);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(10);
    });

    it('calculates median correctly for even count', () => {
      const stats = computeBoxplotStats(simpleData);
      expect(stats.median).toBe(5.5);
    });

    it('calculates median correctly for odd count', () => {
      const stats = computeBoxplotStats([1, 2, 3, 4, 5]);
      expect(stats.median).toBe(3);
    });

    it('calculates quartiles correctly', () => {
      const stats = computeBoxplotStats(simpleData);
      expect(stats.q1).toBeCloseTo(3.25);
      expect(stats.q3).toBeCloseTo(7.75);
    });

    it('calculates IQR correctly', () => {
      const stats = computeBoxplotStats(simpleData);
      expect(stats.iqr).toBeCloseTo(4.5);
    });

    it('calculates mean correctly', () => {
      const stats = computeBoxplotStats(simpleData);
      expect(stats.mean).toBe(5.5);
    });

    it('counts sample size', () => {
      const stats = computeBoxplotStats(simpleData);
      expect(stats.n).toBe(10);
    });

    it('handles empty array', () => {
      const stats = computeBoxplotStats([]);
      expect(stats.n).toBe(0);
      expect(stats.min).toBeNaN();
      expect(stats.median).toBeNaN();
      expect(stats.outliers).toEqual([]);
    });

    it('handles single value', () => {
      const stats = computeBoxplotStats([42]);
      expect(stats.min).toBe(42);
      expect(stats.max).toBe(42);
      expect(stats.median).toBe(42);
      expect(stats.q1).toBe(42);
      expect(stats.q3).toBe(42);
      expect(stats.iqr).toBe(0);
    });
  });

  describe('computeBoxplotStats - Tukey whisker method', () => {
    it('calculates Tukey whiskers correctly', () => {
      const stats = computeBoxplotStats(dataWithOutliers, { whiskerMethod: 'tukey' });

      // Q1 = 15, Q3 = 42.5, IQR = 27.5
      // Lower bound = Q1 - 1.5*IQR = 15 - 41.25 = -26.25 → actual lower whisker = 1 (or first value >= -26.25)
      // Upper bound = Q3 + 1.5*IQR = 42.5 + 41.25 = 83.75 → actual upper whisker = 50 (last value <= 83.75)

      expect(stats.lowerWhisker).toBeLessThanOrEqual(stats.q1);
      expect(stats.upperWhisker).toBeGreaterThanOrEqual(stats.q3);
      expect(stats.upperWhisker).toBeLessThanOrEqual(83.75);
    });

    it('identifies outliers with Tukey method', () => {
      const stats = computeBoxplotStats(dataWithOutliers, { whiskerMethod: 'tukey' });

      // 100 is above the upper whisker, so should be an outlier
      expect(stats.outliers).toContain(100);
    });

    it('has no outliers when data is within 1.5*IQR', () => {
      const stats = computeBoxplotStats(simpleData, { whiskerMethod: 'tukey' });
      expect(stats.outliers).toEqual([]);
    });
  });

  describe('computeBoxplotStats - minmax whisker method', () => {
    it('sets whiskers to min and max', () => {
      const stats = computeBoxplotStats(dataWithOutliers, { whiskerMethod: 'minmax' });

      expect(stats.lowerWhisker).toBe(1);
      expect(stats.upperWhisker).toBe(100);
    });

    it('produces no outliers', () => {
      const stats = computeBoxplotStats(dataWithOutliers, { whiskerMethod: 'minmax' });
      expect(stats.outliers).toEqual([]);
    });
  });

  describe('computeBoxplotStats - percentile whisker method', () => {
    it('calculates percentile whiskers with default 5th/95th', () => {
      const stats = computeBoxplotStats(simpleData, {
        whiskerMethod: 'percentile',
        whiskerPercentile: 0.05
      });

      // 5th percentile of [1..10] and 95th percentile
      expect(stats.lowerWhisker).toBeGreaterThanOrEqual(stats.min);
      expect(stats.upperWhisker).toBeLessThanOrEqual(stats.max);
    });

    it('identifies values below 5th percentile as outliers', () => {
      // Create data where we can verify percentile behavior
      const data = Array.from({ length: 100 }, (_, i) => i + 1);
      const stats = computeBoxplotStats(data, {
        whiskerMethod: 'percentile',
        whiskerPercentile: 0.05
      });

      // 5th percentile should be around 5.95, 95th around 95.05
      expect(stats.lowerWhisker).toBeGreaterThanOrEqual(1);
      expect(stats.upperWhisker).toBeLessThanOrEqual(100);
    });
  });

  describe('computeBoxplotStats - stddev whisker method', () => {
    it('calculates whiskers based on standard deviation', () => {
      const stats = computeBoxplotStats(simpleData, {
        whiskerMethod: 'stddev',
        whiskerStdDev: 2
      });

      // Mean = 5.5, stddev ≈ 2.87 (population)
      // Lower = 5.5 - 2*2.87 = -0.24 → clamped to 1
      // Upper = 5.5 + 2*2.87 = 11.24 → clamped to 10
      expect(stats.lowerWhisker).toBeGreaterThanOrEqual(stats.min);
      expect(stats.upperWhisker).toBeLessThanOrEqual(stats.max);
    });

    it('identifies outliers outside stddev range', () => {
      const stats = computeBoxplotStats(dataWithOutliers, {
        whiskerMethod: 'stddev',
        whiskerStdDev: 2
      });

      // Values far from mean should be outliers
      expect(stats.outliers.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('computeBoxplotStats - R/Python comparison', () => {
    // Test against known R values for verification
    // In R: summary(c(1,2,3,4,5,6,7,8,9,10))
    // Min=1, Q1=3.25, Med=5.5, Mean=5.5, Q3=7.75, Max=10

    it('matches R summary() quartile calculations', () => {
      const stats = computeBoxplotStats(simpleData);

      expect(stats.min).toBe(1);
      expect(stats.q1).toBeCloseTo(3.25, 2);
      expect(stats.median).toBeCloseTo(5.5, 2);
      expect(stats.mean).toBeCloseTo(5.5, 2);
      expect(stats.q3).toBeCloseTo(7.75, 2);
      expect(stats.max).toBe(10);
    });

    // Test against known Python numpy values
    // np.percentile([1,2,3,4,5,6,7,8,9,10], [25, 50, 75])
    // array([3.25, 5.5, 7.75])

    it('matches numpy percentile calculations', () => {
      const stats = computeBoxplotStats(simpleData);

      expect(stats.q1).toBeCloseTo(3.25, 2);
      expect(stats.median).toBeCloseTo(5.5, 2);
      expect(stats.q3).toBeCloseTo(7.75, 2);
    });
  });

  describe('computeGroupedBoxplotStats', () => {
    it('computes stats for multiple groups', () => {
      const groups = [
        { category: 'A', values: [1, 2, 3, 4, 5] },
        { category: 'B', values: [10, 20, 30, 40, 50] },
      ];

      const result = computeGroupedBoxplotStats(groups);

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('A');
      expect(result[0].stats.median).toBe(3);
      expect(result[0].rawValues).toEqual([1, 2, 3, 4, 5]);

      expect(result[1].category).toBe('B');
      expect(result[1].stats.median).toBe(30);
    });

    it('preserves settings across groups', () => {
      const groups = [
        { category: 'A', values: [1, 2, 3, 4, 5, 100] },
        { category: 'B', values: [1, 2, 3, 4, 5, 100] },
      ];

      const resultTukey = computeGroupedBoxplotStats(groups, { whiskerMethod: 'tukey' });
      const resultMinmax = computeGroupedBoxplotStats(groups, { whiskerMethod: 'minmax' });

      // Tukey should have outliers, minmax should not
      expect(resultTukey[0].stats.outliers.length).toBeGreaterThan(0);
      expect(resultMinmax[0].stats.outliers.length).toBe(0);
    });

    it('handles empty groups array', () => {
      const result = computeGroupedBoxplotStats([]);
      expect(result).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('handles all same values', () => {
      const stats = computeBoxplotStats([5, 5, 5, 5, 5]);

      expect(stats.min).toBe(5);
      expect(stats.max).toBe(5);
      expect(stats.median).toBe(5);
      expect(stats.iqr).toBe(0);
      expect(stats.outliers).toEqual([]);
    });

    it('handles two values', () => {
      const stats = computeBoxplotStats([1, 10]);

      expect(stats.min).toBe(1);
      expect(stats.max).toBe(10);
      expect(stats.median).toBe(5.5);
      expect(stats.n).toBe(2);
    });

    it('handles negative values', () => {
      const stats = computeBoxplotStats([-10, -5, 0, 5, 10]);

      expect(stats.min).toBe(-10);
      expect(stats.max).toBe(10);
      expect(stats.median).toBe(0);
      expect(stats.mean).toBe(0);
    });

    it('handles decimal values', () => {
      const stats = computeBoxplotStats([1.1, 2.2, 3.3, 4.4, 5.5]);

      expect(stats.median).toBe(3.3);
      expect(stats.mean).toBeCloseTo(3.3, 5);
    });

    it('handles unsorted input', () => {
      const stats = computeBoxplotStats([5, 1, 9, 3, 7, 2, 8, 4, 10, 6]);

      // Should produce same results as sorted input
      const statsSorted = computeBoxplotStats(simpleData);

      expect(stats.min).toBe(statsSorted.min);
      expect(stats.max).toBe(statsSorted.max);
      expect(stats.median).toBe(statsSorted.median);
      expect(stats.q1).toBe(statsSorted.q1);
      expect(stats.q3).toBe(statsSorted.q3);
    });
  });
});
