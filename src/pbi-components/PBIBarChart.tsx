/**
 * PBIBarChart - Constrained Power BI Bar Chart Component
 *
 * A React component that renders a bar chart using Vega-Lite with
 * props constrained to PBI-valid values. This ensures the visual
 * will export correctly to PBIP format.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import embed, { Result } from 'vega-embed';
import {
  PBIBarChartProps,
  DEFAULT_BAR_CHART_PROPS,
  MOKKUP_BRAND_COLORS,
  PBIHexColor,
} from '../pbi-constraints';
import { PBI_TYPOGRAPHY, PBI_TEXT_COLORS, PBI_BORDER_COLORS } from '../tokens/pbi-css-tokens';

/** Data shape for bar chart */
export interface BarChartDataPoint {
  /** Category name (x-axis for column, y-axis for bar) */
  name: string;
  /** Numeric value */
  value: number;
}

/** Props for the PBIBarChart component */
export interface PBIBarChartComponentProps extends Omit<PBIBarChartProps, 'category' | 'value'> {
  /** Chart data */
  data: BarChartDataPoint[];
  /** Override colors (one per data point, or single color for all) */
  colors?: PBIHexColor[];
}

/**
 * PBIBarChart Component
 *
 * Renders a bar or column chart using Vega-Lite with PBI-constrained styling.
 */
export const PBIBarChart: React.FC<PBIBarChartComponentProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<Result | null>(null);

  // Merge with defaults
  const mergedProps = useMemo(() => ({
    ...DEFAULT_BAR_CHART_PROPS,
    ...props,
    title: { ...DEFAULT_BAR_CHART_PROPS.title, ...props.title },
    legend: { ...DEFAULT_BAR_CHART_PROPS.legend, ...props.legend },
    categoryAxis: { ...DEFAULT_BAR_CHART_PROPS.categoryAxis, ...props.categoryAxis },
    valueAxis: { ...DEFAULT_BAR_CHART_PROPS.valueAxis, ...props.valueAxis },
    labels: { ...DEFAULT_BAR_CHART_PROPS.labels, ...props.labels },
  }), [props]);

  const { data, colors, horizontal = true } = mergedProps;

  // Sort data by value descending
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value);
  }, [data]);

  // Determine colors
  const chartColors = useMemo(() => {
    if (colors && colors.length > 0) {
      return colors;
    }
    if (mergedProps.dataPoint?.fill) {
      return [mergedProps.dataPoint.fill];
    }
    return [MOKKUP_BRAND_COLORS.primary];
  }, [colors, mergedProps.dataPoint?.fill]);

  // Generate Vega-Lite spec
  const spec = useMemo(() => {
    const categoryNames = sortedData.map(d => d.name);
    const useMultipleColors = chartColors.length > 1;

    const baseSpec: Record<string, any> = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: 'container',
      autosize: { type: 'fit', contains: 'padding' },
      data: { values: sortedData },
      mark: {
        type: 'bar',
        ...(horizontal ? { cornerRadiusEnd: 4 } : { cornerRadiusTopLeft: 4, cornerRadiusTopRight: 4 }),
      },
      config: {
        view: { stroke: 'transparent' },
        font: PBI_TYPOGRAPHY.dimensionLabel.fontFamily.replace(/'/g, ''),
      },
    };

    if (horizontal) {
      // Horizontal bar chart
      baseSpec.encoding = {
        y: {
          field: 'name',
          type: 'nominal',
          sort: null,
          axis: mergedProps.categoryAxis?.show !== false ? {
            labelFontSize: mergedProps.categoryAxis?.labelFontSize || PBI_TYPOGRAPHY.dimensionLabel.fontSize,
            labelColor: mergedProps.categoryAxis?.labelFontColor || PBI_TEXT_COLORS.quaternary,
            title: null,
            labelLimit: 80,
          } : null,
        },
        x: {
          field: 'value',
          type: 'quantitative',
          axis: mergedProps.valueAxis?.show !== false ? {
            grid: mergedProps.valueAxis?.gridlineShow !== false,
            gridColor: mergedProps.valueAxis?.gridlineColor || PBI_BORDER_COLORS.secondary,
            gridDash: [3, 3],
            title: null,
            labels: false,
            ticks: false,
            domain: false,
          } : null,
        },
        ...(useMultipleColors ? {
          color: {
            field: 'name',
            type: 'nominal',
            scale: {
              domain: categoryNames,
              range: chartColors.slice(0, categoryNames.length),
            },
            legend: null,
          },
        } : {
          color: { value: chartColors[0] },
        }),
        tooltip: [
          { field: 'name', type: 'nominal', title: 'Category' },
          { field: 'value', type: 'quantitative', title: 'Value', format: ',.0f' },
        ],
      };
    } else {
      // Vertical column chart
      baseSpec.encoding = {
        x: {
          field: 'name',
          type: 'nominal',
          axis: mergedProps.categoryAxis?.show !== false ? {
            labelFontSize: mergedProps.categoryAxis?.labelFontSize || PBI_TYPOGRAPHY.dimensionLabel.fontSize,
            labelColor: mergedProps.categoryAxis?.labelFontColor || PBI_TEXT_COLORS.quaternary,
            title: null,
            labelAngle: 0,
          } : null,
        },
        y: {
          field: 'value',
          type: 'quantitative',
          axis: mergedProps.valueAxis?.show !== false ? {
            grid: mergedProps.valueAxis?.gridlineShow !== false,
            gridColor: mergedProps.valueAxis?.gridlineColor || PBI_BORDER_COLORS.secondary,
            gridDash: [3, 3],
            title: null,
          } : null,
        },
        ...(useMultipleColors ? {
          color: {
            field: 'name',
            type: 'nominal',
            scale: {
              domain: data.map(d => d.name),
              range: chartColors.slice(0, data.length),
            },
            legend: null,
          },
        } : {
          color: { value: chartColors[0] },
        }),
        tooltip: [
          { field: 'name', type: 'nominal', title: 'Category' },
          { field: 'value', type: 'quantitative', title: 'Value', format: ',.0f' },
        ],
      };
    }

    return baseSpec;
  }, [sortedData, horizontal, chartColors, mergedProps, data]);

  // Render Vega chart
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous view
    if (viewRef.current) {
      viewRef.current.finalize();
    }

    embed(containerRef.current, spec, {
      actions: false,
      renderer: 'svg',
    }).then((result) => {
      viewRef.current = result;
    }).catch(console.error);

    return () => {
      if (viewRef.current) {
        viewRef.current.finalize();
        viewRef.current = null;
      }
    };
  }, [spec]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (viewRef.current) {
        viewRef.current.view.resize().run();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
};

export default PBIBarChart;
