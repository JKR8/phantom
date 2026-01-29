/**
 * Histogram binning algorithms
 */

import { standardDeviation, interquartileRange, min, max } from '../utils/math';

export type BinMethod = 'sturges' | 'scott' | 'freedman-diaconis' | 'sqrt' | 'fixed-count' | 'fixed-width';

export interface HistogramBin {
  x0: number;
  x1: number;
  count: number;
  frequency: number;
  density: number;
}

export interface HistogramSettings {
  binMethod?: BinMethod;
  binCount?: number; // For fixed-count method
  binWidth?: number; // For fixed-width method
}

/**
 * Calculate the optimal number of bins using various methods
 */
export function calculateBinCount(values: number[], method: BinMethod, options: { binCount?: number; binWidth?: number } = {}): number {
  const n = values.length;
  if (n === 0) return 1;

  const sorted = [...values].sort((a, b) => a - b);
  const minVal = min(sorted);
  const maxVal = max(sorted);
  const range = maxVal - minVal;

  if (range === 0) return 1;

  let binCount: number;

  switch (method) {
    case 'sturges':
      // Sturges' formula: k = 1 + log2(n)
      binCount = Math.ceil(Math.log2(n) + 1);
      break;

    case 'scott':
      // Scott's rule: h = 3.49 * σ * n^(-1/3)
      const scottH = 3.49 * standardDeviation(sorted) * Math.pow(n, -1 / 3);
      binCount = scottH > 0 ? Math.ceil(range / scottH) : 10;
      break;

    case 'freedman-diaconis':
      // Freedman-Diaconis rule: h = 2 * IQR * n^(-1/3)
      const iqr = interquartileRange(sorted);
      const fdH = 2 * iqr * Math.pow(n, -1 / 3);
      binCount = fdH > 0 ? Math.ceil(range / fdH) : 10;
      break;

    case 'sqrt':
      // Square root choice: k = √n
      binCount = Math.ceil(Math.sqrt(n));
      break;

    case 'fixed-count':
      binCount = options.binCount ?? 10;
      break;

    case 'fixed-width':
      const width = options.binWidth ?? (range / 10);
      binCount = width > 0 ? Math.ceil(range / width) : 10;
      break;

    default:
      binCount = 10;
  }

  // Ensure reasonable bin count (between 1 and 100)
  return Math.max(1, Math.min(binCount, 100));
}

/**
 * Compute histogram bins for a set of values
 */
export function computeHistogramBins(
  values: number[],
  settings: HistogramSettings = {}
): HistogramBin[] {
  const { binMethod = 'sturges', binCount: fixedBinCount, binWidth } = settings;

  if (values.length === 0) {
    return [];
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const minVal = min(sorted);
  const maxVal = max(sorted);
  const range = maxVal - minVal;

  // Handle single value or no range
  if (range === 0) {
    return [{
      x0: minVal - 0.5,
      x1: minVal + 0.5,
      count: n,
      frequency: 1,
      density: n,
    }];
  }

  const numBins = calculateBinCount(values, binMethod, { binCount: fixedBinCount, binWidth });
  const actualBinWidth = range / numBins;

  const bins: HistogramBin[] = [];

  for (let i = 0; i < numBins; i++) {
    const x0 = minVal + i * actualBinWidth;
    const x1 = minVal + (i + 1) * actualBinWidth;

    // Count values in this bin
    // Last bin includes the max value
    const count = sorted.filter((v) =>
      i === numBins - 1
        ? v >= x0 && v <= x1
        : v >= x0 && v < x1
    ).length;

    bins.push({
      x0,
      x1,
      count,
      frequency: count / n,
      density: count / (n * actualBinWidth),
    });
  }

  return bins;
}

/**
 * Compute cumulative distribution from histogram bins
 */
export function computeCumulativeDistribution(bins: HistogramBin[]): Array<{ x: number; cumulative: number }> {
  let cumulative = 0;
  const result: Array<{ x: number; cumulative: number }> = [];

  for (const bin of bins) {
    cumulative += bin.frequency;
    result.push({
      x: bin.x1,
      cumulative,
    });
  }

  return result;
}
