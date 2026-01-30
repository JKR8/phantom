/**
 * Power BI Components
 *
 * Constrained React components that render using Vega-Lite with props
 * guaranteed to be valid for PBIP export.
 *
 * Usage:
 * ```tsx
 * import { PBIBarChart, PBICard, barChartToPBIPObjects } from './pbi-components';
 *
 * // Render in React
 * <PBIBarChart
 *   data={[{ name: 'A', value: 100 }, { name: 'B', value: 200 }]}
 *   horizontal={true}
 *   dataPoint={{ fill: '#342BC2' }}
 * />
 *
 * // Convert to PBIP format for export
 * const pbipObjects = barChartToPBIPObjects({
 *   category: { field: 'Category', table: 'Products' },
 *   value: { field: 'Total Revenue', table: 'Sales', isMeasure: true },
 *   dataPoint: { fill: '#342BC2' },
 * });
 * ```
 */

// Components
export { PBIBarChart, type BarChartDataPoint, type PBIBarChartComponentProps } from './PBIBarChart';
export { PBILineChart, type LineChartDataPoint, type PBILineChartComponentProps } from './PBILineChart';
export { PBICard, type PBICardComponentProps } from './PBICard';
export { PBISlicer, type PBISlicerComponentProps } from './PBISlicer';

// PBIP converters
export {
  barChartToPBIPObjects,
  lineChartToPBIPObjects,
  cardToPBIPObjects,
  cardToVisualContainerObjects,
  slicerToPBIPObjects,
} from './toPBIP';

// Re-export constraints for convenience
export * from '../pbi-constraints';
