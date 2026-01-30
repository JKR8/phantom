/**
 * PBILineChart - Constrained Power BI Line Chart Component
 *
 * A React component that renders a line chart using Vega-Lite with
 * props constrained to PBI-valid values.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import embed, { Result } from 'vega-embed';
import {
  PBILineChartProps,
  DEFAULT_LINE_CHART_PROPS,
  MOKKUP_BRAND_COLORS,
  PBIHexColor,
} from '../pbi-constraints';

/** Data shape for line chart */
export interface LineChartDataPoint {
  /** Date string (ISO format or parseable date) */
  date: string;
  /** Numeric value */
  value: number;
  /** Optional series name for multi-line charts */
  series?: string;
}

/** Props for the PBILineChart component */
export interface PBILineChartComponentProps extends Omit<PBILineChartProps, 'category' | 'value' | 'series'> {
  /** Chart data */
  data: LineChartDataPoint[];
  /** Line color(s) - single color or array for multi-series */
  colors?: PBIHexColor[];
}

/**
 * PBILineChart Component
 *
 * Renders a line chart using Vega-Lite with PBI-constrained styling.
 */
export const PBILineChart: React.FC<PBILineChartComponentProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<Result | null>(null);

  // Merge with defaults
  const mergedProps = useMemo(() => ({
    ...DEFAULT_LINE_CHART_PROPS,
    ...props,
    title: { ...DEFAULT_LINE_CHART_PROPS.title, ...props.title },
    legend: { ...DEFAULT_LINE_CHART_PROPS.legend, ...props.legend },
    categoryAxis: { ...DEFAULT_LINE_CHART_PROPS.categoryAxis, ...props.categoryAxis },
    valueAxis: { ...DEFAULT_LINE_CHART_PROPS.valueAxis, ...props.valueAxis },
    lineStyles: { ...DEFAULT_LINE_CHART_PROPS.lineStyles, ...props.lineStyles },
    labels: { ...DEFAULT_LINE_CHART_PROPS.labels, ...props.labels },
  }), [props]);

  const { data, colors } = mergedProps;

  // Determine if multi-series
  const isMultiSeries = useMemo(() => {
    return data.some(d => d.series !== undefined);
  }, [data]);

  // Determine colors
  const chartColors = useMemo(() => {
    if (colors && colors.length > 0) {
      return colors;
    }
    if (mergedProps.dataPoint?.fill) {
      return [mergedProps.dataPoint.fill];
    }
    return [MOKKUP_BRAND_COLORS.primary, MOKKUP_BRAND_COLORS.lineAccent, MOKKUP_BRAND_COLORS.success];
  }, [colors, mergedProps.dataPoint?.fill]);

  // Generate Vega-Lite spec
  const spec = useMemo(() => {
    const lineColor = chartColors[0];
    const showMarker = mergedProps.lineStyles?.showMarker !== false;

    // Base layers
    const layers: Record<string, any>[] = [];

    // Line layer
    const lineLayer: Record<string, any> = {
      mark: {
        type: 'line',
        strokeWidth: mergedProps.lineStyles?.strokeWidth || 2,
        interpolate: mergedProps.lineStyles?.lineChartType === 'stepped' ? 'step' :
                     mergedProps.lineStyles?.lineChartType === 'straight' ? 'linear' : 'monotone',
      },
      encoding: {
        x: {
          field: 'date',
          type: 'temporal',
          axis: mergedProps.categoryAxis?.show !== false ? {
            labelFontSize: mergedProps.categoryAxis?.labelFontSize || 10,
            labelColor: mergedProps.categoryAxis?.labelFontColor || '#605E5C',
            title: null,
            format: '%b %Y',
          } : null,
        },
        y: {
          field: 'value',
          type: 'quantitative',
          axis: mergedProps.valueAxis?.show !== false ? {
            grid: mergedProps.valueAxis?.gridlineShow !== false,
            gridColor: mergedProps.valueAxis?.gridlineColor || '#F3F2F1',
            gridDash: [3, 3],
            title: null,
          } : null,
        },
      },
    };

    if (isMultiSeries) {
      lineLayer.encoding.color = {
        field: 'series',
        type: 'nominal',
        scale: { range: chartColors },
        legend: mergedProps.legend?.show ? {
          orient: mergedProps.legend.position?.toLowerCase() || 'bottom',
          labelFontSize: 10,
          labelColor: '#605E5C',
        } : null,
      };
    } else {
      lineLayer.encoding.color = { value: lineColor };
    }

    layers.push(lineLayer);

    // Point layer (markers)
    if (showMarker) {
      const pointLayer: Record<string, any> = {
        mark: {
          type: 'point',
          filled: true,
          size: (mergedProps.lineStyles?.markerSize || 4) * 10,
        },
        encoding: {
          x: { field: 'date', type: 'temporal' },
          y: { field: 'value', type: 'quantitative' },
          tooltip: [
            { field: 'date', type: 'temporal', title: 'Date', format: '%b %d, %Y' },
            { field: 'value', type: 'quantitative', title: 'Value', format: ',.0f' },
          ],
        },
      };

      if (isMultiSeries) {
        pointLayer.encoding.color = {
          field: 'series',
          type: 'nominal',
          scale: { range: chartColors },
        };
        pointLayer.encoding.tooltip.unshift({ field: 'series', type: 'nominal', title: 'Series' });
      } else {
        pointLayer.encoding.color = { value: lineColor };
      }

      layers.push(pointLayer);
    }

    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 'container',
      height: 'container',
      autosize: { type: 'fit', contains: 'padding' },
      data: { values: data },
      layer: layers,
      config: {
        view: { stroke: 'transparent' },
        font: 'Segoe UI, Arial, sans-serif',
      },
    };
  }, [data, isMultiSeries, chartColors, mergedProps]);

  // Render Vega chart
  useEffect(() => {
    if (!containerRef.current) return;

    if (viewRef.current) {
      viewRef.current.finalize();
    }

    embed(containerRef.current, spec as any, {
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

export default PBILineChart;
