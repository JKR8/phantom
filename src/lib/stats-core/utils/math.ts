/**
 * Mathematical utility functions for statistical calculations
 */

/**
 * Standard normal distribution PDF
 */
export function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * Standard normal distribution CDF approximation (Abramowitz and Stegun)
 */
export function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Inverse standard normal distribution (probit function)
 * Uses Beasley-Springer-Moro algorithm
 */
export function probit(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0,
    -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0,
    3.754408661907416e0,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

/**
 * t-distribution critical value approximation
 * Uses approximation that works well for df >= 1
 */
export function tCritical(df: number, p: number): number {
  if (df <= 0) return NaN;
  if (df >= 30) {
    // Normal approximation for large df
    return probit(p);
  }

  // Hill's approximation for smaller df
  const x = probit(p);
  const g1 = (x * x * x + x) / 4;
  const g2 = ((5 * x * x * x * x * x + 16 * x * x * x + 3 * x) / 96);
  const g3 = ((3 * x * x * x * x * x * x * x + 19 * x * x * x * x * x + 17 * x * x * x - 15 * x) / 384);
  const g4 = ((79 * Math.pow(x, 9) + 776 * Math.pow(x, 7) + 1482 * Math.pow(x, 5) - 1920 * x * x * x - 945 * x) / 92160);

  return x + g1 / df + g2 / (df * df) + g3 / (df * df * df) + g4 / (df * df * df * df);
}

/**
 * Calculate quantile of a sorted array
 */
export function quantile(sortedArr: number[], p: number): number {
  if (sortedArr.length === 0) return NaN;
  if (p <= 0) return sortedArr[0];
  if (p >= 1) return sortedArr[sortedArr.length - 1];

  const index = (sortedArr.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sortedArr.length) return sortedArr[lower];
  return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
}

/**
 * Calculate mean of an array
 */
export function mean(arr: number[]): number {
  if (arr.length === 0) return NaN;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

/**
 * Calculate variance of an array (population variance)
 */
export function variance(arr: number[], ddof = 0): number {
  if (arr.length <= ddof) return NaN;
  const m = mean(arr);
  const sumSq = arr.reduce((sum, val) => sum + (val - m) * (val - m), 0);
  return sumSq / (arr.length - ddof);
}

/**
 * Calculate standard deviation of an array
 */
export function standardDeviation(arr: number[], ddof = 0): number {
  return Math.sqrt(variance(arr, ddof));
}

/**
 * Calculate interquartile range
 */
export function interquartileRange(sortedArr: number[]): number {
  return quantile(sortedArr, 0.75) - quantile(sortedArr, 0.25);
}

/**
 * Calculate sum of an array
 */
export function sum(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0);
}

/**
 * Calculate min of an array
 */
export function min(arr: number[]): number {
  if (arr.length === 0) return NaN;
  return Math.min(...arr);
}

/**
 * Calculate max of an array
 */
export function max(arr: number[]): number {
  if (arr.length === 0) return NaN;
  return Math.max(...arr);
}
