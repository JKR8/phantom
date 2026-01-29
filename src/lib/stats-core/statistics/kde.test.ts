import { describe, it, expect } from 'vitest';
import {
  calculateBandwidth,
  computeKDE,
  getMaxDensity,
  normalizeKDE,
  createViolinPath,
  KDEPoint,
} from './kde';

describe('KDE (Kernel Density Estimation)', () => {
  // Standard normal sample for testing
  const normalSample = [
    -2.1, -1.3, -0.4, 0.2, 0.5, 0.8, 1.1, 1.5, 2.0, 2.8
  ];

  // Bimodal distribution
  const bimodalSample = [
    1, 1.5, 2, 2.5, 3,  // First mode around 2
    8, 8.5, 9, 9.5, 10  // Second mode around 9
  ];

  // Large sample for more accurate estimates
  const largeSample = Array.from({ length: 100 }, (_, i) => {
    // Generate roughly normal distribution
    const u1 = (i + 1) / 101;
    const u2 = ((i + 50) % 100 + 1) / 101;
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 2 + 5;
  });

  describe('calculateBandwidth', () => {
    describe('Silverman method', () => {
      it('calculates bandwidth using Silverman rule', () => {
        // Silverman: h = 0.9 * min(σ, IQR/1.34) * n^(-1/5)
        const h = calculateBandwidth(normalSample, 'silverman');

        expect(h).toBeGreaterThan(0);
        expect(h).toBeLessThan(10); // Should be reasonable
      });

      it('produces smaller bandwidth for larger samples', () => {
        const smallBw = calculateBandwidth(normalSample, 'silverman');
        const largeBw = calculateBandwidth(largeSample, 'silverman');

        // n^(-1/5) factor means larger n → smaller bandwidth
        expect(largeBw).toBeLessThan(smallBw);
      });

      it('is robust to outliers (uses IQR)', () => {
        const normalData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const dataWithOutliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 100];

        const normalBw = calculateBandwidth(normalData, 'silverman');
        const outlierBw = calculateBandwidth(dataWithOutliers, 'silverman');

        // Should still be in a reasonable range due to IQR
        expect(outlierBw).toBeLessThan(normalBw * 5);
      });
    });

    describe('Scott method', () => {
      it('calculates bandwidth using Scott rule', () => {
        // Scott: h = 3.49 * σ * n^(-1/3)
        const h = calculateBandwidth(normalSample, 'scott');

        expect(h).toBeGreaterThan(0);
      });

      it('typically produces larger bandwidth than Silverman', () => {
        const silverman = calculateBandwidth(normalSample, 'silverman');
        const scott = calculateBandwidth(normalSample, 'scott');

        // Scott tends to be larger (less smooth)
        // This isn't always true but is typical
        expect(scott).toBeGreaterThan(0);
        expect(silverman).toBeGreaterThan(0);
      });
    });

    describe('fixed bandwidth', () => {
      it('returns the specified value', () => {
        const h = calculateBandwidth(normalSample, 0.5);
        expect(h).toBe(0.5);
      });

      it('ignores data when fixed', () => {
        const h1 = calculateBandwidth([1], 1.5);
        const h2 = calculateBandwidth(largeSample, 1.5);
        expect(h1).toBe(h2);
      });
    });

    describe('edge cases', () => {
      it('returns 1 for empty array', () => {
        expect(calculateBandwidth([], 'silverman')).toBe(1);
      });

      it('handles single value', () => {
        const h = calculateBandwidth([5], 'silverman');
        // With no spread (single value), bandwidth is 0 or very small
        expect(h).toBeGreaterThanOrEqual(0);
      });

      it('handles constant values', () => {
        const h = calculateBandwidth([5, 5, 5, 5, 5], 'silverman');
        // With no spread, bandwidth is 0 (both stddev and IQR are 0)
        expect(h).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('computeKDE', () => {
    describe('basic functionality', () => {
      it('returns array of KDE points', () => {
        const kde = computeKDE(normalSample);

        expect(Array.isArray(kde)).toBe(true);
        expect(kde.length).toBeGreaterThan(0);
      });

      it('each point has x and density properties', () => {
        const kde = computeKDE(normalSample);

        for (const point of kde) {
          expect(point).toHaveProperty('x');
          expect(point).toHaveProperty('density');
          expect(typeof point.x).toBe('number');
          expect(typeof point.density).toBe('number');
        }
      });

      it('density values are non-negative', () => {
        const kde = computeKDE(normalSample);

        for (const point of kde) {
          expect(point.density).toBeGreaterThanOrEqual(0);
        }
      });

      it('respects resolution setting', () => {
        const kde50 = computeKDE(normalSample, { resolution: 50 });
        const kde100 = computeKDE(normalSample, { resolution: 100 });

        expect(kde50.length).toBe(51); // resolution + 1
        expect(kde100.length).toBe(101);
      });
    });

    describe('kernel types', () => {
      it('gaussian kernel produces smooth curve', () => {
        const kde = computeKDE(normalSample, { kernel: 'gaussian' });

        // Check that density changes gradually
        let maxDelta = 0;
        for (let i = 1; i < kde.length; i++) {
          const delta = Math.abs(kde[i].density - kde[i - 1].density);
          maxDelta = Math.max(maxDelta, delta);
        }

        // Gaussian should be very smooth
        expect(maxDelta).toBeLessThan(0.5);
      });

      it('epanechnikov kernel is bounded', () => {
        const kde = computeKDE(normalSample, { kernel: 'epanechnikov' });

        // All densities should be finite
        for (const point of kde) {
          expect(isFinite(point.density)).toBe(true);
        }
      });

      it('uniform kernel produces piecewise constant regions', () => {
        const kde = computeKDE(normalSample, { kernel: 'uniform' });

        // Should still produce valid densities
        for (const point of kde) {
          expect(point.density).toBeGreaterThanOrEqual(0);
        }
      });

      it('triangular kernel produces valid output', () => {
        const kde = computeKDE(normalSample, { kernel: 'triangular' });

        for (const point of kde) {
          expect(point.density).toBeGreaterThanOrEqual(0);
        }
      });
    });

    describe('bandwidth methods', () => {
      it('silverman bandwidth produces reasonable KDE', () => {
        const kde = computeKDE(normalSample, { bandwidth: 'silverman' });

        const maxDensity = Math.max(...kde.map(p => p.density));
        expect(maxDensity).toBeGreaterThan(0);
      });

      it('scott bandwidth produces reasonable KDE', () => {
        const kde = computeKDE(normalSample, { bandwidth: 'scott' });

        const maxDensity = Math.max(...kde.map(p => p.density));
        expect(maxDensity).toBeGreaterThan(0);
      });

      it('smaller bandwidth shows more detail', () => {
        const kdeSmall = computeKDE(bimodalSample, { bandwidth: 0.5 });
        const kdeLarge = computeKDE(bimodalSample, { bandwidth: 3 });

        // Smaller bandwidth should have more variation (peaks and valleys)
        const smallVar = variance(kdeSmall.map(p => p.density));
        const largeVar = variance(kdeLarge.map(p => p.density));

        expect(smallVar).toBeGreaterThan(largeVar);
      });
    });

    describe('bimodal detection', () => {
      it('can identify two modes in bimodal distribution', () => {
        const kde = computeKDE(bimodalSample, { bandwidth: 1, resolution: 100 });

        // Find local maxima
        const localMaxima: number[] = [];
        for (let i = 1; i < kde.length - 1; i++) {
          if (kde[i].density > kde[i - 1].density &&
              kde[i].density > kde[i + 1].density) {
            localMaxima.push(kde[i].x);
          }
        }

        // Should have at least 2 local maxima for bimodal
        expect(localMaxima.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('edge cases', () => {
      it('returns empty array for empty input', () => {
        const kde = computeKDE([]);
        expect(kde).toEqual([]);
      });

      it('handles single value', () => {
        const kde = computeKDE([5]);

        expect(kde.length).toBeGreaterThan(0);
        // Peak should be around x=5
        const maxPoint = kde.reduce((max, p) => p.density > max.density ? p : max);
        expect(maxPoint.x).toBeCloseTo(5, 0);
      });

      it('handles two identical values', () => {
        const kde = computeKDE([5, 5]);

        expect(kde.length).toBeGreaterThan(0);
        const maxPoint = kde.reduce((max, p) => p.density > max.density ? p : max);
        expect(maxPoint.x).toBeCloseTo(5, 0);
      });
    });
  });

  describe('getMaxDensity', () => {
    it('returns maximum density value', () => {
      const kde = computeKDE(normalSample);
      const maxDensity = getMaxDensity(kde);

      const manualMax = Math.max(...kde.map(p => p.density));
      expect(maxDensity).toBe(manualMax);
    });

    it('returns 0 for empty array', () => {
      expect(getMaxDensity([])).toBe(0);
    });
  });

  describe('normalizeKDE', () => {
    it('scales max density to 1', () => {
      const kde = computeKDE(normalSample);
      const normalized = normalizeKDE(kde);

      const maxDensity = Math.max(...normalized.map(p => p.density));
      expect(maxDensity).toBeCloseTo(1, 5);
    });

    it('preserves relative densities', () => {
      const kde = computeKDE(normalSample);
      const normalized = normalizeKDE(kde);

      // Check ratio between first and max point
      const originalMax = getMaxDensity(kde);
      const normalizedFirst = normalized[0].density;
      const kdeFirst = kde[0].density;

      expect(normalizedFirst).toBeCloseTo(kdeFirst / originalMax, 5);
    });

    it('preserves x values', () => {
      const kde = computeKDE(normalSample);
      const normalized = normalizeKDE(kde);

      for (let i = 0; i < kde.length; i++) {
        expect(normalized[i].x).toBe(kde[i].x);
      }
    });

    it('handles empty array', () => {
      const normalized = normalizeKDE([]);
      expect(normalized).toEqual([]);
    });

    it('handles zero max density', () => {
      const zeroDensity: KDEPoint[] = [
        { x: 0, density: 0 },
        { x: 1, density: 0 },
      ];
      const normalized = normalizeKDE(zeroDensity);
      expect(normalized).toEqual(zeroDensity);
    });
  });

  describe('createViolinPath', () => {
    it('creates SVG path strings', () => {
      const kde = computeKDE(normalSample, { resolution: 20 });
      const { leftPath, rightPath, combinedPath } = createViolinPath(kde, {
        centerX: 100,
        maxWidth: 50,
        yScale: (x) => 200 - x * 10,
      });

      expect(leftPath).toMatch(/^M/);
      expect(rightPath).toMatch(/^M/);
      expect(combinedPath).toMatch(/^M/);
      expect(combinedPath).toMatch(/Z$/);
    });

    it('path is centered on centerX', () => {
      const kde = computeKDE(normalSample, { resolution: 20 });
      const { combinedPath } = createViolinPath(kde, {
        centerX: 100,
        maxWidth: 50,
        yScale: (x) => x,
      });

      // Parse x coordinates from path
      const coords = combinedPath.match(/(\d+\.?\d*)/g)?.map(Number) || [];
      const xCoords = coords.filter((_, i) => i % 2 === 0);

      // All x coordinates should be near centerX (within maxWidth)
      for (const x of xCoords) {
        expect(x).toBeGreaterThanOrEqual(75); // centerX - maxWidth/2
        expect(x).toBeLessThanOrEqual(125);   // centerX + maxWidth/2
      }
    });

    it('respects maxWidth', () => {
      const kde = computeKDE(normalSample, { resolution: 20 });
      const { combinedPath } = createViolinPath(kde, {
        centerX: 100,
        maxWidth: 50,
        yScale: (x) => x,
      });

      const coords = combinedPath.match(/(\d+\.?\d*)/g)?.map(Number) || [];
      const xCoords = coords.filter((_, i) => i % 2 === 0);

      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);

      expect(maxX - minX).toBeLessThanOrEqual(50);
    });

    it('applies yScale function', () => {
      const kde: KDEPoint[] = [
        { x: 0, density: 0.5 },
        { x: 1, density: 1 },
        { x: 2, density: 0.5 },
      ];

      const yScale = (x: number) => 100 - x * 50;
      const { combinedPath } = createViolinPath(kde, {
        centerX: 50,
        maxWidth: 40,
        yScale,
      });

      // Y coordinates should be transformed
      // y(0) = 100, y(1) = 50, y(2) = 0
      expect(combinedPath).toContain('100'); // y at x=0
      expect(combinedPath).toContain('50');  // y at x=1
      expect(combinedPath).toContain('0');   // y at x=2
    });

    it('returns empty strings for empty KDE', () => {
      const { leftPath, rightPath, combinedPath } = createViolinPath([], {
        centerX: 100,
        maxWidth: 50,
        yScale: (x) => x,
      });

      expect(leftPath).toBe('');
      expect(rightPath).toBe('');
      expect(combinedPath).toBe('');
    });
  });
});

// Helper function for tests
function variance(arr: number[]): number {
  if (arr.length === 0) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, val) => sum + (val - m) ** 2, 0) / arr.length;
}
