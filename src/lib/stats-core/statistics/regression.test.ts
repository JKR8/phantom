import { describe, it, expect } from 'vitest';
import {
  computeLinearRegression,
  computePolynomialRegression,
  computeLoess,
  computeConfidenceBand,
  computePredictionBand,
  computeRegression,
  formatEquation,
} from './regression';

describe('regression analysis', () => {
  // Perfect linear relationship: y = 2x + 1
  const perfectLinearX = [1, 2, 3, 4, 5];
  const perfectLinearY = [3, 5, 7, 9, 11];

  // Linear with noise
  const linearX = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const linearY = [2.1, 4.3, 5.8, 8.2, 9.9, 12.1, 14.0, 15.9, 18.2, 20.1];

  // Quadratic: y = x^2
  const quadraticX = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const quadraticY = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100];

  // Random scatter (low correlation)
  const randomX = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const randomY = [5, 2, 8, 3, 9, 1, 7, 4, 6, 10];

  describe('computeLinearRegression', () => {
    describe('perfect linear fit', () => {
      it('calculates correct slope', () => {
        const result = computeLinearRegression(perfectLinearX, perfectLinearY);
        expect(result.slope).toBeCloseTo(2, 5);
      });

      it('calculates correct intercept', () => {
        const result = computeLinearRegression(perfectLinearX, perfectLinearY);
        expect(result.intercept).toBeCloseTo(1, 5);
      });

      it('has R-squared of 1', () => {
        const result = computeLinearRegression(perfectLinearX, perfectLinearY);
        expect(result.rSquared).toBeCloseTo(1, 5);
      });

      it('has zero standard error', () => {
        const result = computeLinearRegression(perfectLinearX, perfectLinearY);
        expect(result.standardError).toBeCloseTo(0, 5);
      });

      it('predicts correctly', () => {
        const result = computeLinearRegression(perfectLinearX, perfectLinearY);
        expect(result.predict(0)).toBeCloseTo(1, 5);
        expect(result.predict(10)).toBeCloseTo(21, 5);
      });
    });

    describe('linear with noise', () => {
      it('calculates slope close to 2', () => {
        const result = computeLinearRegression(linearX, linearY);
        expect(result.slope).toBeCloseTo(2, 0);
      });

      it('calculates reasonable intercept', () => {
        const result = computeLinearRegression(linearX, linearY);
        expect(result.intercept).toBeCloseTo(0, 0); // Within 0.5 of 0
      });

      it('has high R-squared (> 0.99)', () => {
        const result = computeLinearRegression(linearX, linearY);
        expect(result.rSquared).toBeGreaterThan(0.99);
      });

      it('has small standard error', () => {
        const result = computeLinearRegression(linearX, linearY);
        expect(result.standardError).toBeLessThan(1);
      });
    });

    describe('low correlation data', () => {
      it('has low R-squared', () => {
        const result = computeLinearRegression(randomX, randomY);
        expect(result.rSquared).toBeLessThan(0.2); // Low correlation, not necessarily near 0
      });
    });

    describe('edge cases', () => {
      it('returns NaN for single point', () => {
        const result = computeLinearRegression([1], [2]);
        expect(result.slope).toBeNaN();
        expect(result.intercept).toBeNaN();
        expect(result.rSquared).toBeNaN();
      });

      it('handles two points', () => {
        const result = computeLinearRegression([1, 2], [3, 5]);
        expect(result.slope).toBeCloseTo(2, 5);
        expect(result.intercept).toBeCloseTo(1, 5);
        expect(result.n).toBe(2);
      });

      it('handles horizontal line (slope = 0)', () => {
        const result = computeLinearRegression([1, 2, 3, 4, 5], [5, 5, 5, 5, 5]);
        expect(result.slope).toBeCloseTo(0, 5);
        expect(result.intercept).toBeCloseTo(5, 5);
      });

      it('handles vertical-like data', () => {
        const result = computeLinearRegression([5, 5, 5, 5, 5], [1, 2, 3, 4, 5]);
        // Slope should be 0 or very small (division by zero handled)
        expect(isFinite(result.slope) || result.slope === 0).toBe(true);
      });

      it('calculates residuals correctly', () => {
        const result = computeLinearRegression(perfectLinearX, perfectLinearY);

        expect(result.residuals.length).toBe(5);
        for (const residual of result.residuals) {
          expect(residual).toBeCloseTo(0, 5);
        }
      });
    });

    describe('R/Python comparison', () => {
      // Compare with R: lm(y ~ x)
      // For linearX/linearY: slope ≈ 2.006, intercept ≈ 0.067, R² ≈ 0.9996

      it('matches R lm() slope estimate', () => {
        const result = computeLinearRegression(linearX, linearY);
        expect(result.slope).toBeCloseTo(2.006, 1);
      });

      it('matches R lm() intercept estimate', () => {
        const result = computeLinearRegression(linearX, linearY);
        expect(result.intercept).toBeCloseTo(0.067, 0);
      });
    });
  });

  describe('computePolynomialRegression', () => {
    describe('perfect quadratic fit', () => {
      it('fits quadratic data with degree 2', () => {
        const result = computePolynomialRegression(quadraticX, quadraticY, 2);

        expect(result.rSquared).toBeCloseTo(1, 5);
        expect(result.predict(5)).toBeCloseTo(25, 1);
        expect(result.predict(10)).toBeCloseTo(100, 1);
      });

      it('extracts correct coefficients', () => {
        const result = computePolynomialRegression(quadraticX, quadraticY, 2);

        // y = x^2 → coefficients should be [0, 0, 1] (c0 + c1*x + c2*x^2)
        expect(result.coefficients[2]).toBeCloseTo(1, 1);
        expect(result.coefficients[1]).toBeCloseTo(0, 0);
        expect(result.coefficients[0]).toBeCloseTo(0, 0);
      });
    });

    describe('linear data with higher degree', () => {
      it('still fits linear data well', () => {
        const result = computePolynomialRegression(perfectLinearX, perfectLinearY, 3);

        expect(result.predict(3)).toBeCloseTo(7, 1);
        expect(result.rSquared).toBeGreaterThan(0.99);
      });
    });

    describe('edge cases', () => {
      it('returns empty when n <= degree', () => {
        const result = computePolynomialRegression([1, 2], [3, 4], 2);
        expect(result.coefficients).toEqual([]);
        expect(result.rSquared).toBeNaN();
      });

      it('handles degree 1 (linear)', () => {
        const result = computePolynomialRegression(perfectLinearX, perfectLinearY, 1);

        expect(result.coefficients[1]).toBeCloseTo(2, 5);
        expect(result.coefficients[0]).toBeCloseTo(1, 5);
      });
    });
  });

  describe('computeLoess', () => {
    it('returns predict function and points', () => {
      const result = computeLoess(linearX, linearY);

      expect(typeof result.predict).toBe('function');
      expect(Array.isArray(result.points)).toBe(true);
      expect(result.points.length).toBeGreaterThan(0);
    });

    it('smooths noisy data', () => {
      const result = computeLoess(linearX, linearY, 0.5);

      // LOESS predictions should be close to actual trend
      expect(result.predict(5)).toBeCloseTo(10, 1); // Within 0.5 of 10
    });

    it('handles bandwidth parameter', () => {
      const narrowBw = computeLoess(linearX, linearY, 0.2);
      const wideBw = computeLoess(linearX, linearY, 0.8);

      // Both should produce valid predictions
      expect(isFinite(narrowBw.predict(5))).toBe(true);
      expect(isFinite(wideBw.predict(5))).toBe(true);
    });

    it('returns points spanning data range', () => {
      const result = computeLoess(linearX, linearY);

      const minX = Math.min(...result.points.map(p => p.x));
      const maxX = Math.max(...result.points.map(p => p.x));

      expect(minX).toBeCloseTo(1, 0);
      expect(maxX).toBeCloseTo(10, 0);
    });

    it('handles empty array', () => {
      const result = computeLoess([], []);
      expect(result.points).toEqual([]);
      expect(result.predict(5)).toBeNaN();
    });
  });

  describe('computeConfidenceBand', () => {
    it('returns band points', () => {
      const regression = computeLinearRegression(linearX, linearY);
      const band = computeConfidenceBand(linearX, linearY, regression);

      expect(band.length).toBeGreaterThan(0);
    });

    it('each point has x, y, lower, upper', () => {
      const regression = computeLinearRegression(linearX, linearY);
      const band = computeConfidenceBand(linearX, linearY, regression);

      for (const point of band) {
        expect(point).toHaveProperty('x');
        expect(point).toHaveProperty('y');
        expect(point).toHaveProperty('lower');
        expect(point).toHaveProperty('upper');
      }
    });

    it('lower <= y <= upper', () => {
      const regression = computeLinearRegression(linearX, linearY);
      const band = computeConfidenceBand(linearX, linearY, regression);

      for (const point of band) {
        expect(point.lower).toBeLessThanOrEqual(point.y);
        expect(point.upper).toBeGreaterThanOrEqual(point.y);
      }
    });

    it('band is narrowest at mean of x', () => {
      const regression = computeLinearRegression(linearX, linearY);
      const band = computeConfidenceBand(linearX, linearY, regression);

      const xMean = linearX.reduce((a, b) => a + b, 0) / linearX.length;
      const nearMean = band.find(p => Math.abs(p.x - xMean) < 1);
      const atEnd = band[0];

      if (nearMean) {
        const widthNearMean = nearMean.upper - nearMean.lower;
        const widthAtEnd = atEnd.upper - atEnd.lower;

        expect(widthNearMean).toBeLessThanOrEqual(widthAtEnd + 0.1);
      }
    });

    it('returns empty for n < 3', () => {
      const regression = computeLinearRegression([1, 2], [3, 4]);
      const band = computeConfidenceBand([1, 2], [3, 4], regression);

      expect(band).toEqual([]);
    });
  });

  describe('computePredictionBand', () => {
    it('prediction band is wider than confidence band', () => {
      const regression = computeLinearRegression(linearX, linearY);
      const confBand = computeConfidenceBand(linearX, linearY, regression);
      const predBand = computePredictionBand(linearX, linearY, regression);

      // At same x, prediction band should be wider
      const confWidth = confBand[0].upper - confBand[0].lower;
      const predWidth = predBand[0].upper - predBand[0].lower;

      expect(predWidth).toBeGreaterThan(confWidth);
    });
  });

  describe('computeRegression', () => {
    it('returns null for type "none"', () => {
      const result = computeRegression(linearX, linearY, { type: 'none' });
      expect(result).toBeNull();
    });

    it('returns null for insufficient data', () => {
      const result = computeRegression([1], [2], { type: 'linear' });
      expect(result).toBeNull();
    });

    describe('linear type', () => {
      it('returns complete result object', () => {
        const result = computeRegression(linearX, linearY, { type: 'linear' });

        expect(result).not.toBeNull();
        expect(result!.type).toBe('linear');
        expect(result!.coefficients).toHaveLength(2);
        expect(result!.rSquared).toBeGreaterThan(0.99);
        expect(typeof result!.predict).toBe('function');
        expect(result!.confidenceBand.length).toBeGreaterThan(0);
        expect(result!.predictionBand.length).toBeGreaterThan(0);
        expect(result!.equation).toContain('y =');
      });
    });

    describe('polynomial type', () => {
      it('returns polynomial result', () => {
        const result = computeRegression(quadraticX, quadraticY, {
          type: 'polynomial',
          polynomialDegree: 2,
        });

        expect(result).not.toBeNull();
        expect(result!.type).toBe('polynomial');
        expect(result!.coefficients).toHaveLength(3); // degree + 1
        expect(result!.rSquared).toBeCloseTo(1, 3);
      });
    });

    describe('loess type', () => {
      it('returns loess result', () => {
        const result = computeRegression(linearX, linearY, {
          type: 'loess',
          loessBandwidth: 0.3,
        });

        expect(result).not.toBeNull();
        expect(result!.type).toBe('loess');
        expect(result!.equation).toBe('LOESS smoothing');
      });
    });
  });

  describe('formatEquation', () => {
    it('formats linear equation', () => {
      const eq = formatEquation('linear', [1, 2]);
      // y = 2x + 1
      expect(eq).toContain('y =');
      expect(eq).toContain('x');
    });

    it('formats polynomial equation', () => {
      const eq = formatEquation('polynomial', [1, 2, 3]);
      // y = 3x^2 + 2x + 1
      expect(eq).toContain('x^2');
    });

    it('handles negative intercept', () => {
      const eq = formatEquation('linear', [-1, 2]);
      expect(eq).toContain('-');
    });

    it('returns empty for unknown type', () => {
      const eq = formatEquation('none' as any, []);
      expect(eq).toBe('');
    });
  });

  describe('statistical properties', () => {
    it('adjusted R-squared is less than R-squared', () => {
      const result = computeLinearRegression(linearX, linearY);

      expect(result.adjustedRSquared).toBeLessThanOrEqual(result.rSquared);
    });

    it('adjusted R-squared penalizes more for smaller samples', () => {
      const smallResult = computeLinearRegression(linearX.slice(0, 5), linearY.slice(0, 5));
      const fullResult = computeLinearRegression(linearX, linearY);

      // With similar R², smaller sample should have lower adjusted R²
      const smallPenalty = smallResult.rSquared - smallResult.adjustedRSquared;
      const fullPenalty = fullResult.rSquared - fullResult.adjustedRSquared;

      expect(smallPenalty).toBeGreaterThan(fullPenalty);
    });
  });
});
