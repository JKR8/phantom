/**
 * PBI Renderer Module
 *
 * High-fidelity Power BI visual renderers for web preview.
 * These renderers match Power BI Desktop's measured specifications
 * for accurate preview of PBIP visuals.
 */

// Renderers
export { BarChartRenderer, createBarChartRenderer } from './renderers/bar-chart-renderer';
export type { BarChartConfig } from './renderers/bar-chart-renderer';

// Base types
export { BaseRenderer } from './renderers/base-renderer';
export type {
  DataPoint,
  RenderContext,
  PlotArea,
  VisualConfig,
  BarChartDefaults
} from './renderers/base-renderer';

// Utilities
export {
  calculateNiceTicks,
  formatAxisValue,
  calculateYAxisWidth,
  calculateXAxisHeight
} from './utils/axis-calculator';

export {
  measureTextWidth,
  truncateLabel,
  approximateTextWidth,
  truncateLabelApproximate,
  clearTextWidthCache
} from './utils/text-measurement';

// Defaults
export { default as barChartDefaults } from './defaults/bar-chart.json';
