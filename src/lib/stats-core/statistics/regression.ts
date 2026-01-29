/**
 * Regression analysis for scatter plots
 */

import { mean, sum, tCritical } from '../utils/math';

export type RegressionType = 'none' | 'linear' | 'polynomial' | 'loess';

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  adjustedRSquared: number;
  standardError: number;
  residuals: number[];
  n: number;
  predict: (x: number) => number;
}

export interface BandPoint {
  x: number;
  y: number;
  lower: number;
  upper: number;
}

export interface RegressionResult {
  type: RegressionType;
  coefficients: number[];
  rSquared: number;
  adjustedRSquared: number;
  standardError: number;
  predict: (x: number) => number;
  confidenceBand: BandPoint[];
  predictionBand: BandPoint[];
  equation: string;
  n: number;
}

export interface RegressionSettings {
  type?: RegressionType;
  polynomialDegree?: number;
  loessBandwidth?: number;
  confidenceLevel?: number;
}

/**
 * Compute linear regression
 */
export function computeLinearRegression(
  xValues: number[],
  yValues: number[],
  _confidenceLevel = 0.95
): LinearRegressionResult {
  const n = xValues.length;
  if (n < 2) {
    return {
      slope: NaN,
      intercept: NaN,
      rSquared: NaN,
      adjustedRSquared: NaN,
      standardError: NaN,
      residuals: [],
      n,
      predict: () => NaN,
    };
  }

  const xMean = mean(xValues);
  const yMean = mean(yValues);

  // Calculate slope and intercept
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
    denominator += (xValues[i] - xMean) ** 2;
  }

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;

  const predict = (x: number) => slope * x + intercept;

  // Calculate residuals and R-squared
  const predictions = xValues.map(predict);
  const residuals = yValues.map((y, i) => y - predictions[i]);

  const ssTot = sum(yValues.map((y) => (y - yMean) ** 2));
  const ssRes = sum(residuals.map((r) => r ** 2));

  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;
  const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1)) / (n - 2);

  const standardError = Math.sqrt(ssRes / (n - 2));

  return {
    slope,
    intercept,
    rSquared,
    adjustedRSquared,
    standardError,
    residuals,
    n,
    predict,
  };
}

/**
 * Compute polynomial regression using least squares
 */
export function computePolynomialRegression(
  xValues: number[],
  yValues: number[],
  degree: number
): {
  coefficients: number[];
  predict: (x: number) => number;
  rSquared: number;
} {
  const n = xValues.length;
  if (n <= degree) {
    return {
      coefficients: [],
      predict: () => NaN,
      rSquared: NaN,
    };
  }

  // Build Vandermonde matrix
  const vandermonde: number[][] = [];
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j <= degree; j++) {
      row.push(xValues[i] ** j);
    }
    vandermonde.push(row);
  }

  // Solve using normal equations: (X'X)^-1 X'y
  const XT = transpose(vandermonde);
  const XTX = matrixMultiply(XT, vandermonde);
  const XTy = matrixVectorMultiply(XT, yValues);

  // Simple Gaussian elimination for small matrices
  const coefficients = solveLinearSystem(XTX, XTy);

  const predict = (x: number) => {
    let y = 0;
    for (let i = 0; i < coefficients.length; i++) {
      y += coefficients[i] * x ** i;
    }
    return y;
  };

  // Calculate R-squared
  const predictions = xValues.map(predict);
  const yMean = mean(yValues);
  const ssTot = sum(yValues.map((y) => (y - yMean) ** 2));
  const ssRes = sum(yValues.map((y, i) => (y - predictions[i]) ** 2));
  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  return { coefficients, predict, rSquared };
}

/**
 * Compute LOESS (locally estimated scatterplot smoothing)
 */
export function computeLoess(
  xValues: number[],
  yValues: number[],
  bandwidth = 0.3
): { predict: (x: number) => number; points: Array<{ x: number; y: number }> } {
  const n = xValues.length;
  if (n === 0) {
    return {
      predict: () => NaN,
      points: [],
    };
  }

  const k = Math.max(3, Math.floor(bandwidth * n)); // Number of neighbors

  const tricube = (d: number) => {
    if (d >= 1) return 0;
    return (1 - d ** 3) ** 3;
  };

  const loessPredict = (x: number): number => {
    // Calculate distances and find k nearest neighbors
    const distances = xValues.map((xi, i) => ({
      index: i,
      distance: Math.abs(x - xi),
    }));
    distances.sort((a, b) => a.distance - b.distance);

    const neighbors = distances.slice(0, k);
    const maxDist = neighbors[neighbors.length - 1].distance || 1;

    // Weighted least squares regression
    let sumW = 0;
    let sumWX = 0;
    let sumWY = 0;
    let sumWX2 = 0;
    let sumWXY = 0;

    for (const neighbor of neighbors) {
      const xi = xValues[neighbor.index];
      const yi = yValues[neighbor.index];
      const w = tricube(neighbor.distance / maxDist);

      sumW += w;
      sumWX += w * xi;
      sumWY += w * yi;
      sumWX2 += w * xi * xi;
      sumWXY += w * xi * yi;
    }

    const denom = sumW * sumWX2 - sumWX * sumWX;
    if (Math.abs(denom) < 1e-10) {
      return sumW > 0 ? sumWY / sumW : NaN;
    }

    const slope = (sumW * sumWXY - sumWX * sumWY) / denom;
    const intercept = (sumWY - slope * sumWX) / sumW;

    return slope * x + intercept;
  };

  // Generate smooth curve points
  const sortedX = [...xValues].sort((a, b) => a - b);
  const xMin = sortedX[0];
  const xMax = sortedX[sortedX.length - 1];
  const step = (xMax - xMin) / 50;

  const points: Array<{ x: number; y: number }> = [];
  for (let x = xMin; x <= xMax; x += step) {
    points.push({ x, y: loessPredict(x) });
  }

  return { predict: loessPredict, points };
}

/**
 * Compute confidence band for linear regression
 */
export function computeConfidenceBand(
  xValues: number[],
  _yValues: number[],
  regression: LinearRegressionResult,
  confidenceLevel = 0.95,
  numPoints = 50
): BandPoint[] {
  const n = regression.n;
  if (n < 3) return [];

  const xMean = mean(xValues);
  const sxx = sum(xValues.map((x) => (x - xMean) ** 2));
  const se = regression.standardError;

  const t = tCritical(n - 2, 1 - (1 - confidenceLevel) / 2);

  const sortedX = [...xValues].sort((a, b) => a - b);
  const xMin = sortedX[0];
  const xMax = sortedX[sortedX.length - 1];
  const step = (xMax - xMin) / numPoints;

  const band: BandPoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const x = xMin + i * step;
    const y = regression.predict(x);

    // Standard error of the mean response
    const margin = t * se * Math.sqrt(1 / n + (x - xMean) ** 2 / sxx);

    band.push({
      x,
      y,
      lower: y - margin,
      upper: y + margin,
    });
  }

  return band;
}

/**
 * Compute prediction band for linear regression
 */
export function computePredictionBand(
  xValues: number[],
  _yValues: number[],
  regression: LinearRegressionResult,
  confidenceLevel = 0.95,
  numPoints = 50
): BandPoint[] {
  const n = regression.n;
  if (n < 3) return [];

  const xMean = mean(xValues);
  const sxx = sum(xValues.map((x) => (x - xMean) ** 2));
  const se = regression.standardError;

  const t = tCritical(n - 2, 1 - (1 - confidenceLevel) / 2);

  const sortedX = [...xValues].sort((a, b) => a - b);
  const xMin = sortedX[0];
  const xMax = sortedX[sortedX.length - 1];
  const step = (xMax - xMin) / numPoints;

  const band: BandPoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const x = xMin + i * step;
    const y = regression.predict(x);

    // Standard error of individual prediction
    const margin = t * se * Math.sqrt(1 + 1 / n + (x - xMean) ** 2 / sxx);

    band.push({
      x,
      y,
      lower: y - margin,
      upper: y + margin,
    });
  }

  return band;
}

/**
 * Format regression equation as string
 */
export function formatEquation(type: RegressionType, coefficients: number[]): string {
  if (type === 'linear' && coefficients.length === 2) {
    const [intercept, slope] = coefficients;
    const slopeStr = slope >= 0 ? `${slope.toFixed(4)}` : `${slope.toFixed(4)}`;
    const interceptStr = intercept >= 0 ? `+ ${intercept.toFixed(4)}` : `- ${Math.abs(intercept).toFixed(4)}`;
    return `y = ${slopeStr}x ${interceptStr}`;
  }

  if (type === 'polynomial') {
    let eq = 'y = ';
    for (let i = coefficients.length - 1; i >= 0; i--) {
      const coef = coefficients[i];
      if (i === 0) {
        eq += coef >= 0 ? `+ ${coef.toFixed(4)}` : `- ${Math.abs(coef).toFixed(4)}`;
      } else if (i === 1) {
        eq += `${coef.toFixed(4)}x `;
      } else {
        eq += `${coef.toFixed(4)}x^${i} `;
      }
    }
    return eq.trim();
  }

  return '';
}

/**
 * Compute full regression result
 */
export function computeRegression(
  xValues: number[],
  yValues: number[],
  settings: RegressionSettings = {}
): RegressionResult | null {
  const {
    type = 'linear',
    polynomialDegree = 2,
    loessBandwidth = 0.3,
    confidenceLevel = 0.95,
  } = settings;

  if (type === 'none' || xValues.length < 2) {
    return null;
  }

  if (type === 'linear') {
    const lr = computeLinearRegression(xValues, yValues, confidenceLevel);
    const confidenceBand = computeConfidenceBand(xValues, yValues, lr, confidenceLevel);
    const predictionBand = computePredictionBand(xValues, yValues, lr, confidenceLevel);

    return {
      type: 'linear',
      coefficients: [lr.intercept, lr.slope],
      rSquared: lr.rSquared,
      adjustedRSquared: lr.adjustedRSquared,
      standardError: lr.standardError,
      predict: lr.predict,
      confidenceBand,
      predictionBand,
      equation: formatEquation('linear', [lr.intercept, lr.slope]),
      n: lr.n,
    };
  }

  if (type === 'polynomial') {
    const poly = computePolynomialRegression(xValues, yValues, polynomialDegree);

    return {
      type: 'polynomial',
      coefficients: poly.coefficients,
      rSquared: poly.rSquared,
      adjustedRSquared: NaN,
      standardError: NaN,
      predict: poly.predict,
      confidenceBand: [],
      predictionBand: [],
      equation: formatEquation('polynomial', poly.coefficients),
      n: xValues.length,
    };
  }

  if (type === 'loess') {
    const loess = computeLoess(xValues, yValues, loessBandwidth);

    return {
      type: 'loess',
      coefficients: [],
      rSquared: NaN,
      adjustedRSquared: NaN,
      standardError: NaN,
      predict: loess.predict,
      confidenceBand: [],
      predictionBand: [],
      equation: 'LOESS smoothing',
      n: xValues.length,
    };
  }

  return null;
}

// Matrix helper functions
function transpose(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;
  const result: number[][] = [];

  for (let j = 0; j < cols; j++) {
    const row: number[] = [];
    for (let i = 0; i < rows; i++) {
      row.push(matrix[i][j]);
    }
    result.push(row);
  }

  return result;
}

function matrixMultiply(a: number[][], b: number[][]): number[][] {
  const rowsA = a.length;
  const colsA = a[0]?.length || 0;
  const colsB = b[0]?.length || 0;
  const result: number[][] = [];

  for (let i = 0; i < rowsA; i++) {
    const row: number[] = [];
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += a[i][k] * b[k][j];
      }
      row.push(sum);
    }
    result.push(row);
  }

  return result;
}

function matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
  return matrix.map((row) => row.reduce((sum, val, i) => sum + val * vector[i], 0));
}

function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const augmented = A.map((row, i) => [...row, b[i]]);

  // Gaussian elimination with partial pivoting
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
        maxRow = row;
      }
    }

    // Swap rows
    [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

    // Check for singular matrix
    if (Math.abs(augmented[col][col]) < 1e-10) {
      continue;
    }

    // Eliminate column
    for (let row = col + 1; row < n; row++) {
      const factor = augmented[row][col] / augmented[col][col];
      for (let j = col; j <= n; j++) {
        augmented[row][j] -= factor * augmented[col][j];
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = augmented[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= augmented[i][j] * x[j];
    }
    x[i] = Math.abs(augmented[i][i]) > 1e-10 ? sum / augmented[i][i] : 0;
  }

  return x;
}
