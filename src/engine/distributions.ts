/**
 * Statistical distribution utilities for realistic data generation.
 * Uses seeded PRNG via simple mulberry32 for reproducibility.
 */

/** Simple seeded PRNG (mulberry32) */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box-Muller transform: generates a standard normal variate from two uniform variates */
export function boxMuller(rand: () => number): number {
  let u = 0, v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Pareto/Power-law distribution: produces skewed values where top 20% ≈ 80% of total.
 * Returns n values from a Pareto distribution with shape parameter alpha.
 * Lower alpha = more skewed (1.0–1.5 typical for business data).
 */
export function paretoSample(n: number, alpha: number, seed = 42): number[] {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const u = rand();
    return 1.0 / Math.pow(1 - u, 1.0 / alpha);
  });
}

/**
 * Log-normal distribution: for skewed positive values (revenue, salary, AOV).
 * mu and sigma are the mean and std of the underlying normal distribution.
 * E.g., mu=4.5, sigma=0.8 gives median ≈ $90, mean ≈ $120.
 */
export function logNormalSample(n: number, mu: number, sigma: number, seed = 42): number[] {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const z = boxMuller(rand);
    return Math.exp(mu + sigma * z);
  });
}

/**
 * Exponential decay distribution: for churn, tenure attrition.
 * lambda = decay rate (higher = faster decay).
 * Returns values in [0, ∞).
 */
export function exponentialDecaySample(n: number, lambda: number, seed = 42): number[] {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const u = rand();
    return -Math.log(1 - u) / lambda;
  });
}

/**
 * Weighted random selection from items array using provided weights.
 * Weights don't need to sum to 1 — they're normalized internally.
 */
export function weightedChoice<T>(items: T[], weights: number[], rand: () => number): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * AR(1) autocorrelation process for time-series smoothness.
 * phi = autocorrelation coefficient (0.5–0.9 typical).
 * sigma = innovation standard deviation.
 * Returns n values that smoothly transition from one to the next.
 */
export function ar1Process(n: number, phi: number, sigma: number, seed = 42): number[] {
  const rand = mulberry32(seed);
  const result: number[] = [0];
  for (let i = 1; i < n; i++) {
    const innovation = boxMuller(rand) * sigma;
    result.push(phi * result[i - 1] + innovation);
  }
  return result;
}

/**
 * Create a seeded random function for use with weightedChoice and other utilities.
 */
export function createSeededRandom(seed: number): () => number {
  return mulberry32(seed);
}

/**
 * Clamp a value between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalize an array of values to sum to a target total.
 */
export function normalizeToTotal(values: number[], total: number): number[] {
  const sum = values.reduce((a, b) => a + b, 0);
  if (sum === 0) return values.map(() => total / values.length);
  return values.map((v) => (v / sum) * total);
}
