/**
 * Stats Core Library
 *
 * Pure TypeScript statistical algorithms and themes for statistical visualizations.
 * Used by both Phantom React components and Power BI custom visual.
 */

// Statistics
export { computeBoxplotStats, computeGroupedBoxplotStats } from './statistics/boxplot';
export type { BoxplotStats, BoxplotSettings, WhiskerMethod } from './statistics/boxplot';

export { computeHistogramBins, calculateBinCount, computeCumulativeDistribution } from './statistics/histogram';
export type { HistogramBin, HistogramSettings, BinMethod } from './statistics/histogram';

export { computeKDE, calculateBandwidth, getMaxDensity, normalizeKDE, createViolinPath } from './statistics/kde';
export type { KDEPoint, KDESettings, KernelType, BandwidthMethod } from './statistics/kde';

export {
  computeLinearRegression,
  computePolynomialRegression,
  computeLoess,
  computeConfidenceBand,
  computePredictionBand,
  computeRegression,
  formatEquation,
} from './statistics/regression';
export type {
  LinearRegressionResult,
  RegressionResult,
  RegressionSettings,
  RegressionType,
  BandPoint,
} from './statistics/regression';

// Themes
export type { PhantomStatTheme, StatThemeName } from './themes/types';
export { themeGrey } from './themes/grey';
export { themeMinimal } from './themes/minimal';
export { themeClassic } from './themes/classic';
export { themeEconomist } from './themes/economist';
export { themeFiveThirtyEight } from './themes/fivethirtyeight';

// Theme collection
import { themeGrey } from './themes/grey';
import { themeMinimal } from './themes/minimal';
import { themeClassic } from './themes/classic';
import { themeEconomist } from './themes/economist';
import { themeFiveThirtyEight } from './themes/fivethirtyeight';
import { PhantomStatTheme, StatThemeName } from './themes/types';

export const STAT_THEMES: Record<StatThemeName, PhantomStatTheme> = {
  grey: themeGrey,
  minimal: themeMinimal,
  classic: themeClassic,
  economist: themeEconomist,
  fivethirtyeight: themeFiveThirtyEight,
};

export const getStatTheme = (name: StatThemeName): PhantomStatTheme => {
  return STAT_THEMES[name] || themeGrey;
};

// Math utilities
export {
  normalPDF,
  normalCDF,
  probit,
  tCritical,
  quantile,
  mean,
  variance,
  standardDeviation,
  interquartileRange,
  sum,
  min,
  max,
} from './utils/math';
