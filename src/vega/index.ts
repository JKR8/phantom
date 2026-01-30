/**
 * Vega-Lite Integration Module
 *
 * This module provides Vega-Lite based chart components that render
 * identically in Phantom and Power BI (via Deneb custom visual).
 */

export { VegaBarChart, getVegaBarChartSpec } from './VegaBarChart';
export { VegaLineChart, getVegaLineChartSpec } from './VegaLineChart';
export {
  createBarChartSpec,
  createLineChartSpec,
  createMultiLineChartSpec,
} from './specGenerators';
