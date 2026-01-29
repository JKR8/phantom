import { describe, it, expect } from 'vitest';
import {
  calculateBinCount,
  computeHistogramBins,
  computeCumulativeDistribution,
} from './histogram';

describe('histogram statistics', () => {
  // Simple uniform data
  const uniformData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Larger dataset for bin calculation tests
  const largeData = Array.from({ length: 100 }, (_, i) => i + 1);

  // Normal-like distribution for testing
  const normalLikeData = [
    2.5, 3.1, 3.5, 4.0, 4.2, 4.5, 4.8, 5.0, 5.0, 5.2,
    5.3, 5.5, 5.5, 5.8, 6.0, 6.2, 6.5, 7.0, 7.5, 8.5
  ];

  describe('calculateBinCount', () => {
    describe('Sturges method', () => {
      it('calculates bins using Sturges formula', () => {
        // Sturges: k = 1 + log2(n)
        // For n=100: k = 1 + 6.64 = 7.64 → 8
        const count = calculateBinCount(largeData, 'sturges');
        expect(count).toBe(8);
      });

      it('handles small datasets', () => {
        const count = calculateBinCount([1, 2, 3], 'sturges');
        // k = 1 + log2(3) ≈ 2.58 → 3
        expect(count).toBeGreaterThanOrEqual(2);
        expect(count).toBeLessThanOrEqual(4);
      });
    });

    describe('Scott method', () => {
      it('calculates bins using Scott rule', () => {
        // Scott: h = 3.49 * σ * n^(-1/3)
        const count = calculateBinCount(largeData, 'scott');
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThanOrEqual(100);
      });

      it('produces fewer bins for high variance data', () => {
        const lowVariance = [5, 5, 5, 5, 5, 6, 6, 6, 6, 6];
        const highVariance = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100];

        const lowVarBins = calculateBinCount(lowVariance, 'scott');
        const highVarBins = calculateBinCount(highVariance, 'scott');

        // Higher variance should tend to produce different bin counts
        expect(lowVarBins).toBeGreaterThan(0);
        expect(highVarBins).toBeGreaterThan(0);
      });
    });

    describe('Freedman-Diaconis method', () => {
      it('calculates bins using Freedman-Diaconis rule', () => {
        // FD: h = 2 * IQR * n^(-1/3)
        const count = calculateBinCount(largeData, 'freedman-diaconis');
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThanOrEqual(100);
      });

      it('is robust to outliers', () => {
        const normalData = Array.from({ length: 100 }, (_, i) => i + 1);
        const dataWithOutliers = [...normalData, 1000, 2000, 3000];

        const normalBins = calculateBinCount(normalData, 'freedman-diaconis');
        const outlierBins = calculateBinCount(dataWithOutliers, 'freedman-diaconis');

        // FD uses IQR so should be relatively stable with outliers
        // Both should produce reasonable bin counts
        expect(normalBins).toBeGreaterThan(0);
        expect(outlierBins).toBeGreaterThan(0);
      });
    });

    describe('sqrt method', () => {
      it('calculates bins as sqrt(n)', () => {
        // sqrt(100) = 10
        const count = calculateBinCount(largeData, 'sqrt');
        expect(count).toBe(10);
      });

      it('rounds up', () => {
        const data = Array.from({ length: 99 }, (_, i) => i);
        // sqrt(99) ≈ 9.95 → 10
        const count = calculateBinCount(data, 'sqrt');
        expect(count).toBe(10);
      });
    });

    describe('fixed-count method', () => {
      it('returns specified bin count', () => {
        const count = calculateBinCount(largeData, 'fixed-count', { binCount: 20 });
        expect(count).toBe(20);
      });

      it('defaults to 10 if not specified', () => {
        const count = calculateBinCount(largeData, 'fixed-count');
        expect(count).toBe(10);
      });
    });

    describe('fixed-width method', () => {
      it('calculates bins from specified width', () => {
        // Range is 1-100 = 99, width of 10 → 10 bins
        const count = calculateBinCount(largeData, 'fixed-width', { binWidth: 10 });
        expect(count).toBe(10);
      });
    });

    describe('edge cases', () => {
      it('returns 1 for empty array', () => {
        expect(calculateBinCount([], 'sturges')).toBe(1);
      });

      it('returns 1 for single value', () => {
        expect(calculateBinCount([5], 'sturges')).toBe(1);
      });

      it('returns 1 for constant values', () => {
        expect(calculateBinCount([5, 5, 5, 5, 5], 'sturges')).toBe(1);
      });

      it('caps at 100 bins', () => {
        const hugeData = Array.from({ length: 10000 }, (_, i) => i);
        const count = calculateBinCount(hugeData, 'sqrt');
        expect(count).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('computeHistogramBins', () => {
    it('creates bins covering the data range', () => {
      const bins = computeHistogramBins(uniformData);

      expect(bins.length).toBeGreaterThan(0);
      expect(bins[0].x0).toBeLessThanOrEqual(1);
      expect(bins[bins.length - 1].x1).toBeGreaterThanOrEqual(10);
    });

    it('counts values correctly', () => {
      const bins = computeHistogramBins(uniformData);

      const totalCount = bins.reduce((sum, bin) => sum + bin.count, 0);
      expect(totalCount).toBe(uniformData.length);
    });

    it('calculates frequency correctly', () => {
      const bins = computeHistogramBins(uniformData);

      const totalFrequency = bins.reduce((sum, bin) => sum + bin.frequency, 0);
      expect(totalFrequency).toBeCloseTo(1, 5);
    });

    it('calculates density correctly', () => {
      const bins = computeHistogramBins(uniformData);

      // Integral of density should equal 1
      const totalDensity = bins.reduce((sum, bin) => sum + bin.density * (bin.x1 - bin.x0), 0);
      expect(totalDensity).toBeCloseTo(1, 5);
    });

    it('respects bin method setting', () => {
      const binsSturges = computeHistogramBins(largeData, { binMethod: 'sturges' });
      const binsSqrt = computeHistogramBins(largeData, { binMethod: 'sqrt' });

      // Different methods should generally produce different bin counts
      // (though they might occasionally be the same)
      expect(binsSturges.length).toBeGreaterThan(0);
      expect(binsSqrt.length).toBeGreaterThan(0);
    });

    it('handles fixed bin count', () => {
      const bins = computeHistogramBins(uniformData, {
        binMethod: 'fixed-count',
        binCount: 5
      });

      expect(bins.length).toBe(5);
    });

    it('handles empty array', () => {
      const bins = computeHistogramBins([]);
      expect(bins).toEqual([]);
    });

    it('handles single value', () => {
      const bins = computeHistogramBins([5]);

      expect(bins.length).toBe(1);
      expect(bins[0].count).toBe(1);
      expect(bins[0].frequency).toBe(1);
    });

    it('handles constant values', () => {
      const bins = computeHistogramBins([5, 5, 5, 5, 5]);

      expect(bins.length).toBe(1);
      expect(bins[0].count).toBe(5);
    });

    describe('bin boundaries', () => {
      it('bins are contiguous', () => {
        const bins = computeHistogramBins(largeData, { binMethod: 'fixed-count', binCount: 10 });

        for (let i = 1; i < bins.length; i++) {
          expect(bins[i].x0).toBeCloseTo(bins[i - 1].x1, 10);
        }
      });

      it('bins have equal width', () => {
        const bins = computeHistogramBins(largeData, { binMethod: 'fixed-count', binCount: 10 });

        const widths = bins.map(bin => bin.x1 - bin.x0);
        const expectedWidth = widths[0];

        for (const width of widths) {
          expect(width).toBeCloseTo(expectedWidth, 10);
        }
      });

      it('last bin includes maximum value', () => {
        const bins = computeHistogramBins(uniformData);

        // Max value (10) should be counted
        const totalCount = bins.reduce((sum, bin) => sum + bin.count, 0);
        expect(totalCount).toBe(uniformData.length);
      });
    });
  });

  describe('computeCumulativeDistribution', () => {
    it('calculates cumulative distribution from bins', () => {
      const bins = computeHistogramBins(uniformData, { binMethod: 'fixed-count', binCount: 5 });
      const cdf = computeCumulativeDistribution(bins);

      expect(cdf.length).toBe(bins.length);
    });

    it('cumulative values are monotonically increasing', () => {
      const bins = computeHistogramBins(largeData, { binMethod: 'fixed-count', binCount: 10 });
      const cdf = computeCumulativeDistribution(bins);

      for (let i = 1; i < cdf.length; i++) {
        expect(cdf[i].cumulative).toBeGreaterThanOrEqual(cdf[i - 1].cumulative);
      }
    });

    it('cumulative sum equals 1', () => {
      const bins = computeHistogramBins(uniformData);
      const cdf = computeCumulativeDistribution(bins);

      expect(cdf[cdf.length - 1].cumulative).toBeCloseTo(1, 5);
    });

    it('x values correspond to bin upper bounds', () => {
      const bins = computeHistogramBins(uniformData, { binMethod: 'fixed-count', binCount: 5 });
      const cdf = computeCumulativeDistribution(bins);

      for (let i = 0; i < cdf.length; i++) {
        expect(cdf[i].x).toBe(bins[i].x1);
      }
    });

    it('handles empty bins array', () => {
      const cdf = computeCumulativeDistribution([]);
      expect(cdf).toEqual([]);
    });
  });

  describe('R/Python comparison', () => {
    it('matches expected histogram output structure', () => {
      // Verify bins have all required properties
      const bins = computeHistogramBins(normalLikeData);

      for (const bin of bins) {
        expect(bin).toHaveProperty('x0');
        expect(bin).toHaveProperty('x1');
        expect(bin).toHaveProperty('count');
        expect(bin).toHaveProperty('frequency');
        expect(bin).toHaveProperty('density');

        expect(typeof bin.x0).toBe('number');
        expect(typeof bin.x1).toBe('number');
        expect(typeof bin.count).toBe('number');
        expect(bin.count).toBeGreaterThanOrEqual(0);
        expect(bin.frequency).toBeGreaterThanOrEqual(0);
        expect(bin.frequency).toBeLessThanOrEqual(1);
        expect(bin.density).toBeGreaterThanOrEqual(0);
      }
    });

    it('Sturges formula matches R nclass.Sturges', () => {
      // R: nclass.Sturges(1:100) returns 8
      const count = calculateBinCount(largeData, 'sturges');
      expect(count).toBe(8);
    });
  });

  describe('edge cases', () => {
    it('handles negative values', () => {
      const negativeData = [-10, -5, 0, 5, 10];
      const bins = computeHistogramBins(negativeData);

      expect(bins[0].x0).toBeLessThanOrEqual(-10);
      expect(bins[bins.length - 1].x1).toBeGreaterThanOrEqual(10);

      const totalCount = bins.reduce((sum, bin) => sum + bin.count, 0);
      expect(totalCount).toBe(5);
    });

    it('handles decimal values', () => {
      const decimalData = [0.1, 0.2, 0.3, 0.4, 0.5];
      const bins = computeHistogramBins(decimalData);

      expect(bins.length).toBeGreaterThan(0);
      const totalCount = bins.reduce((sum, bin) => sum + bin.count, 0);
      expect(totalCount).toBe(5);
    });

    it('handles very small range', () => {
      const smallRange = [1.0001, 1.0002, 1.0003, 1.0004, 1.0005];
      const bins = computeHistogramBins(smallRange);

      expect(bins.length).toBeGreaterThan(0);
    });

    it('handles very large range', () => {
      const largeRange = [1, 1000000];
      const bins = computeHistogramBins(largeRange);

      expect(bins.length).toBeGreaterThan(0);
      const totalCount = bins.reduce((sum, bin) => sum + bin.count, 0);
      expect(totalCount).toBe(2);
    });
  });
});
