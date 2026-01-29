/**
 * Boxplot statistical computations
 */

import { quantile, mean, standardDeviation } from '../utils/math';

export type WhiskerMethod = 'tukey' | 'minmax' | 'percentile' | 'stddev';

export interface BoxplotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  lowerWhisker: number;
  upperWhisker: number;
  outliers: number[];
  mean: number;
  n: number;
}

export interface BoxplotSettings {
  whiskerMethod?: WhiskerMethod;
  whiskerPercentile?: number; // For percentile method (e.g., 0.05 for 5th/95th)
  whiskerStdDev?: number; // For stddev method (1, 2, or 3)
}

/**
 * Compute boxplot statistics for a set of values
 */
export function computeBoxplotStats(
  values: number[],
  settings: BoxplotSettings = {}
): BoxplotStats {
  const {
    whiskerMethod = 'tukey',
    whiskerPercentile = 0.05,
    whiskerStdDev = 2,
  } = settings;

  if (values.length === 0) {
    return {
      min: NaN,
      q1: NaN,
      median: NaN,
      q3: NaN,
      max: NaN,
      iqr: NaN,
      lowerWhisker: NaN,
      upperWhisker: NaN,
      outliers: [],
      mean: NaN,
      n: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const minVal = sorted[0];
  const maxVal = sorted[n - 1];
  const q1 = quantile(sorted, 0.25);
  const medianVal = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const meanVal = mean(sorted);

  let lowerWhisker: number;
  let upperWhisker: number;
  let outliers: number[];

  switch (whiskerMethod) {
    case 'tukey': {
      // Tukey: Q1 - 1.5*IQR to Q3 + 1.5*IQR
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;

      // Find actual data points at whisker boundaries
      lowerWhisker = sorted.find((v) => v >= lowerBound) ?? minVal;
      upperWhisker = sorted.slice().reverse().find((v) => v <= upperBound) ?? maxVal;

      outliers = sorted.filter((v) => v < lowerWhisker || v > upperWhisker);
      break;
    }

    case 'minmax': {
      // Min/Max: no outliers, whiskers extend to actual min/max
      lowerWhisker = minVal;
      upperWhisker = maxVal;
      outliers = [];
      break;
    }

    case 'percentile': {
      // Percentile: use specified percentile (default 5th/95th)
      lowerWhisker = quantile(sorted, whiskerPercentile);
      upperWhisker = quantile(sorted, 1 - whiskerPercentile);
      outliers = sorted.filter((v) => v < lowerWhisker || v > upperWhisker);
      break;
    }

    case 'stddev': {
      // Standard Deviation: mean +/- n*stddev
      const stdDev = standardDeviation(sorted);
      lowerWhisker = meanVal - whiskerStdDev * stdDev;
      upperWhisker = meanVal + whiskerStdDev * stdDev;

      // Clamp to actual data range
      lowerWhisker = Math.max(minVal, lowerWhisker);
      upperWhisker = Math.min(maxVal, upperWhisker);

      // Find actual data points
      lowerWhisker = sorted.find((v) => v >= lowerWhisker) ?? minVal;
      upperWhisker = sorted.slice().reverse().find((v) => v <= upperWhisker) ?? maxVal;

      outliers = sorted.filter((v) => v < lowerWhisker || v > upperWhisker);
      break;
    }

    default:
      lowerWhisker = minVal;
      upperWhisker = maxVal;
      outliers = [];
  }

  return {
    min: minVal,
    q1,
    median: medianVal,
    q3,
    max: maxVal,
    iqr,
    lowerWhisker,
    upperWhisker,
    outliers,
    mean: meanVal,
    n,
  };
}

/**
 * Compute boxplot stats for multiple groups
 */
export function computeGroupedBoxplotStats(
  groups: Array<{ category: string; values: number[] }>,
  settings: BoxplotSettings = {}
): Array<{ category: string; stats: BoxplotStats; rawValues: number[] }> {
  return groups.map((group) => ({
    category: group.category,
    stats: computeBoxplotStats(group.values, settings),
    rawValues: group.values,
  }));
}
