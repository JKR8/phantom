/**
 * Kernel Density Estimation for violin plots
 */

import { standardDeviation, interquartileRange, min, max } from '../utils/math';

export type KernelType = 'gaussian' | 'epanechnikov' | 'uniform' | 'triangular';
export type BandwidthMethod = 'silverman' | 'scott' | number;

export interface KDEPoint {
  x: number;
  density: number;
}

export interface KDESettings {
  kernel?: KernelType;
  bandwidth?: BandwidthMethod;
  resolution?: number; // Number of points to evaluate
}

/**
 * Kernel functions
 */
const kernels: Record<KernelType, (u: number) => number> = {
  gaussian: (u: number) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI),
  epanechnikov: (u: number) => (Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0),
  uniform: (u: number) => (Math.abs(u) <= 1 ? 0.5 : 0),
  triangular: (u: number) => (Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0),
};

/**
 * Calculate bandwidth using automatic methods
 */
export function calculateBandwidth(values: number[], method: BandwidthMethod): number {
  if (typeof method === 'number') {
    return method;
  }

  const n = values.length;
  if (n === 0) return 1;

  const sorted = [...values].sort((a, b) => a - b);
  const stdDev = standardDeviation(sorted);
  const iqr = interquartileRange(sorted);

  switch (method) {
    case 'silverman':
      // Silverman's rule of thumb: h = 0.9 * min(σ, IQR/1.34) * n^(-1/5)
      return 0.9 * Math.min(stdDev, iqr / 1.34) * Math.pow(n, -0.2);

    case 'scott':
      // Scott's rule: h = 3.49 * σ * n^(-1/3)
      return 3.49 * stdDev * Math.pow(n, -1 / 3);

    default:
      return 0.9 * Math.min(stdDev, iqr / 1.34) * Math.pow(n, -0.2);
  }
}

/**
 * Compute Kernel Density Estimation
 */
export function computeKDE(
  values: number[],
  settings: KDESettings = {}
): KDEPoint[] {
  const {
    kernel = 'gaussian',
    bandwidth = 'silverman',
    resolution = 100,
  } = settings;

  if (values.length === 0) {
    return [];
  }

  const n = values.length;
  const h = calculateBandwidth(values, bandwidth);

  // Ensure positive bandwidth
  const actualH = Math.max(h, 0.001);

  const K = kernels[kernel] || kernels.gaussian;

  // Calculate evaluation range (extend beyond data range by 3 bandwidths)
  const minVal = min(values);
  const maxVal = max(values);
  const extent = 3 * actualH;
  const evalMin = minVal - extent;
  const evalMax = maxVal + extent;
  const step = (evalMax - evalMin) / resolution;

  const points: KDEPoint[] = [];

  for (let i = 0; i <= resolution; i++) {
    const x = evalMin + i * step;
    let density = 0;

    for (const xi of values) {
      density += K((x - xi) / actualH);
    }

    density /= n * actualH;
    points.push({ x, density });
  }

  return points;
}

/**
 * Get the maximum density value from KDE points
 */
export function getMaxDensity(kdePoints: KDEPoint[]): number {
  if (kdePoints.length === 0) return 0;
  return Math.max(...kdePoints.map((p) => p.density));
}

/**
 * Normalize KDE points so max density is 1
 */
export function normalizeKDE(kdePoints: KDEPoint[]): KDEPoint[] {
  const maxDensity = getMaxDensity(kdePoints);
  if (maxDensity === 0) return kdePoints;

  return kdePoints.map((p) => ({
    x: p.x,
    density: p.density / maxDensity,
  }));
}

/**
 * Create violin plot path from KDE points
 * Returns path data for both sides of the violin
 */
export function createViolinPath(
  kdePoints: KDEPoint[],
  options: {
    centerX: number;
    maxWidth: number;
    yScale: (x: number) => number;
  }
): { leftPath: string; rightPath: string; combinedPath: string } {
  const { centerX, maxWidth, yScale } = options;

  if (kdePoints.length === 0) {
    return { leftPath: '', rightPath: '', combinedPath: '' };
  }

  const normalizedPoints = normalizeKDE(kdePoints);
  const halfWidth = maxWidth / 2;

  // Build right side path (positive x offset)
  const rightPoints = normalizedPoints.map((p) => ({
    x: centerX + p.density * halfWidth,
    y: yScale(p.x),
  }));

  // Build left side path (negative x offset)
  const leftPoints = normalizedPoints.map((p) => ({
    x: centerX - p.density * halfWidth,
    y: yScale(p.x),
  }));

  const rightPath = rightPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const leftPath = leftPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Combined path for filled violin
  const combinedPath =
    rightPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') +
    ' ' +
    leftPoints
      .reverse()
      .map((p) => `L ${p.x} ${p.y}`)
      .join(' ') +
    ' Z';

  return { leftPath, rightPath, combinedPath };
}
