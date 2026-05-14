import { describe, it, expect } from 'vitest';
import {
  boxMuller,
  paretoSample,
  logNormalSample,
  exponentialDecaySample,
  weightedChoice,
  ar1Process,
  createSeededRandom,
  clamp,
  normalizeToTotal,
} from './distributions';

describe('distributions', () => {
  describe('clamp', () => {
    it('returns min when value is below', () => {
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it('returns max when value is above', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('handles edge cases at boundaries', () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });

  describe('normalizeToTotal', () => {
    it('scales values to target sum', () => {
      const result = normalizeToTotal([2, 3, 5], 100);
      expect(result[0]).toBeCloseTo(20);
      expect(result[1]).toBeCloseTo(30);
      expect(result[2]).toBeCloseTo(50);
      expect(result.reduce((a, b) => a + b)).toBeCloseTo(100);
    });

    it('handles zero sum by distributing evenly', () => {
      const result = normalizeToTotal([0, 0, 0], 90);
      expect(result).toEqual([30, 30, 30]);
    });

    it('handles single value', () => {
      const result = normalizeToTotal([5], 100);
      expect(result).toEqual([100]);
    });
  });

  describe('createSeededRandom', () => {
    it('is reproducible with same seed', () => {
      const r1 = createSeededRandom(42);
      const r2 = createSeededRandom(42);
      const seq1 = Array.from({ length: 10 }, () => r1());
      const seq2 = Array.from({ length: 10 }, () => r2());
      expect(seq1).toEqual(seq2);
    });

    it('produces values in [0, 1)', () => {
      const rand = createSeededRandom(42);
      const samples = Array.from({ length: 100 }, () => rand());
      expect(samples.every((v) => v >= 0 && v < 1)).toBe(true);
    });

    it('produces different sequences with different seeds', () => {
      const r1 = createSeededRandom(42);
      const r2 = createSeededRandom(43);
      expect(r1()).not.toBe(r2());
    });
  });

  describe('boxMuller', () => {
    it('produces standard normal variates', () => {
      const rand = createSeededRandom(42);
      const samples = Array.from({ length: 5000 }, () => boxMuller(rand));

      const mean = samples.reduce((a, b) => a + b) / samples.length;
      const variance = samples.reduce((a, v) => a + (v - mean) ** 2, 0) / samples.length;

      // Mean should be close to 0
      expect(Math.abs(mean)).toBeLessThan(0.1);
      // Variance should be close to 1
      expect(variance).toBeGreaterThan(0.8);
      expect(variance).toBeLessThan(1.2);
    });

    it('~95% within 2 standard deviations', () => {
      const rand = createSeededRandom(42);
      const samples = Array.from({ length: 5000 }, () => boxMuller(rand));
      const within2Sigma = samples.filter((v) => Math.abs(v) < 2).length / samples.length;
      expect(within2Sigma).toBeGreaterThan(0.9);
      expect(within2Sigma).toBeLessThan(0.99);
    });
  });

  describe('paretoSample', () => {
    it('produces positive values', () => {
      const samples = paretoSample(100, 1.1, 42);
      expect(samples.every((v) => v > 0)).toBe(true);
    });

    it('is reproducible with same seed', () => {
      const s1 = paretoSample(10, 1.1, 42);
      const s2 = paretoSample(10, 1.1, 42);
      expect(s1).toEqual(s2);
    });

    it('top 20% holds majority of total (Pareto principle)', () => {
      const samples = paretoSample(100, 1.1, 42);
      samples.sort((a, b) => b - a);
      const total = samples.reduce((a, b) => a + b, 0);
      const top20Sum = samples.slice(0, 20).reduce((a, b) => a + b, 0);
      expect(top20Sum / total).toBeGreaterThan(0.5);
    });
  });

  describe('logNormalSample', () => {
    it('produces all positive values', () => {
      const samples = logNormalSample(1000, 4.5, 0.8, 42);
      expect(samples.every((v) => v > 0)).toBe(true);
    });

    it('is right-skewed (mean > median)', () => {
      const samples = logNormalSample(1000, 4.5, 0.8, 42);
      const mean = samples.reduce((a, b) => a + b) / samples.length;
      const sorted = [...samples].sort((a, b) => a - b);
      const median = sorted[500];
      expect(mean).toBeGreaterThan(median);
    });

    it('median approximates e^mu', () => {
      const samples = logNormalSample(1000, 4.5, 0.8, 42);
      const sorted = [...samples].sort((a, b) => a - b);
      const median = sorted[500];
      const expectedMedian = Math.exp(4.5); // ~90
      // Within 50% of expected (log-normal variance is high)
      expect(median).toBeGreaterThan(expectedMedian * 0.5);
      expect(median).toBeLessThan(expectedMedian * 2);
    });
  });

  describe('exponentialDecaySample', () => {
    it('produces non-negative values', () => {
      const samples = exponentialDecaySample(1000, 0.5, 42);
      expect(samples.every((v) => v >= 0)).toBe(true);
    });

    it('~50% below theoretical median ln(2)/lambda', () => {
      const lambda = 0.5;
      const theoreticalMedian = Math.log(2) / lambda; // ~1.39
      const samples = exponentialDecaySample(1000, lambda, 42);
      const belowMedian = samples.filter((v) => v < theoreticalMedian).length;
      expect(belowMedian / samples.length).toBeGreaterThan(0.35);
      expect(belowMedian / samples.length).toBeLessThan(0.65);
    });
  });

  describe('weightedChoice', () => {
    it('respects weights distribution', () => {
      const rand = createSeededRandom(42);
      const items = ['A', 'B', 'C'];
      const weights = [80, 15, 5];
      const counts: Record<string, number> = { A: 0, B: 0, C: 0 };

      for (let i = 0; i < 1000; i++) {
        counts[weightedChoice(items, weights, rand)]++;
      }

      expect(counts.A).toBeGreaterThan(counts.B);
      expect(counts.B).toBeGreaterThan(counts.C);
      expect(counts.A).toBeGreaterThan(600); // ~80%
    });

    it('handles single item', () => {
      const rand = createSeededRandom(42);
      expect(weightedChoice(['only'], [1], rand)).toBe('only');
    });
  });

  describe('ar1Process', () => {
    it('starts at zero', () => {
      const series = ar1Process(100, 0.8, 0.5, 42);
      expect(series[0]).toBe(0);
    });

    it('produces correct length', () => {
      const series = ar1Process(200, 0.8, 0.5, 42);
      expect(series.length).toBe(200);
    });

    it('shows positive autocorrelation (consecutive values move together)', () => {
      const series = ar1Process(200, 0.8, 0.5, 42);
      let crossProduct = 0;
      for (let i = 1; i < series.length; i++) {
        crossProduct += series[i] * series[i - 1];
      }
      const avgCross = crossProduct / (series.length - 1);
      expect(avgCross).toBeGreaterThan(0);
    });
  });
});
