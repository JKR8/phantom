/**
 * PBIBarChart - React wrapper for Power BI-style bar chart
 *
 * This component renders a high-fidelity bar chart that matches
 * Power BI Desktop's rendering specifications using the PBI Renderer.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { BarChartRenderer, DataPoint, BarChartConfig } from '../pbi-renderer';

export interface PBIBarChartProps {
  /** Data to display in the chart */
  data: Array<{ category: string; value: number; series?: string }>;
  /** Chart width (defaults to container width) */
  width?: number;
  /** Chart height (defaults to container height) */
  height?: number;
  /** Show data labels on bars */
  showDataLabels?: boolean;
  /** Show legend (auto-detected if multiple series) */
  showLegend?: boolean;
  /** Legend position */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  /** Show grid lines */
  showGridLines?: boolean;
  /** Custom color palette */
  colors?: string[];
  /** Additional CSS class */
  className?: string;
  /** Visual title */
  title?: string;
  /** Visual subtitle */
  subTitle?: string;
  /** Data label position */
  dataLabelPosition?: 'outsideEnd' | 'insideEnd' | 'insideBase' | 'insideCenter';
  /** Show border around container */
  showBorder?: boolean;
  /** Border color */
  borderColor?: string;
  /** Border width */
  borderWidth?: number;
  /** Border radius */
  borderRadius?: number;
  /** Show drop shadow */
  showShadow?: boolean;
  /** Category axis title */
  categoryAxisTitle?: string;
  /** Value axis title */
  valueAxisTitle?: string;
  /** Show axis titles */
  showAxisTitles?: boolean;
  /** Show tick marks on axes */
  showTickMarks?: boolean;
  /** Bar stroke/border width */
  barStrokeWidth?: number;
  /** Bar stroke/border color */
  barStrokeColor?: string;
}

export const PBIBarChart: React.FC<PBIBarChartProps> = ({
  data,
  width,
  height,
  showDataLabels = false,
  showLegend,
  legendPosition = 'right',
  showGridLines = true,
  colors,
  className,
  title,
  subTitle,
  dataLabelPosition,
  showBorder,
  borderColor,
  borderWidth,
  borderRadius,
  showShadow,
  categoryAxisTitle,
  valueAxisTitle,
  showAxisTitles,
  showTickMarks,
  barStrokeWidth,
  barStrokeColor
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGElement | null>(null);

  // Convert data format
  const chartData: DataPoint[] = useMemo(() => {
    return data.map(d => ({
      category: d.category,
      value: d.value,
      series: d.series
    }));
  }, [data]);

  // Build config
  const config: BarChartConfig = useMemo(() => {
    const cfg: BarChartConfig = {
      showDataLabels,
      showLegend,
      legendPosition,
      showGridLines,
      title,
      subTitle,
      dataLabelPosition,
      showBorder,
      borderColor,
      borderWidth,
      borderRadius,
      showShadow,
      categoryAxisTitle,
      valueAxisTitle,
      showAxisTitles,
      showTickMarks,
      barStrokeWidth,
      barStrokeColor
    };

    if (colors && colors.length > 0) {
      cfg.objects = {
        bars: {
          colors: {
            palette: colors
          }
        }
      };
    }

    return cfg;
  }, [
    showDataLabels, showLegend, legendPosition, showGridLines, colors,
    title, subTitle, dataLabelPosition, showBorder, borderColor, borderWidth,
    borderRadius, showShadow, categoryAxisTitle, valueAxisTitle, showAxisTitles,
    showTickMarks, barStrokeWidth, barStrokeColor
  ]);

  // Render chart
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const chartWidth = width ?? container.clientWidth;
    const chartHeight = height ?? container.clientHeight;

    // Clear previous content
    if (svgRef.current) {
      svgRef.current.remove();
      svgRef.current = null;
    }

    // Skip if no dimensions
    if (chartWidth <= 0 || chartHeight <= 0) return;

    // Create renderer and render
    const renderer = new BarChartRenderer(config);
    const svg = renderer.render({
      container,
      width: chartWidth,
      height: chartHeight,
      data: chartData
    });

    container.appendChild(svg);
    svgRef.current = svg;

    return () => {
      if (svgRef.current) {
        svgRef.current.remove();
        svgRef.current = null;
      }
    };
  }, [chartData, config, width, height]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current || width !== undefined || height !== undefined) return;

    const container = containerRef.current;
    let animationFrame: number;

    const resizeObserver = new ResizeObserver(() => {
      // Debounce re-renders
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const chartWidth = container.clientWidth;
        const chartHeight = container.clientHeight;

        if (chartWidth <= 0 || chartHeight <= 0) return;

        // Clear and re-render
        if (svgRef.current) {
          svgRef.current.remove();
          svgRef.current = null;
        }

        const renderer = new BarChartRenderer(config);
        const svg = renderer.render({
          container,
          width: chartWidth,
          height: chartHeight,
          data: chartData
        });

        container.appendChild(svg);
        svgRef.current = svg;
      });
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [chartData, config, width, height]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
        minHeight: 100
      }}
    />
  );
};

export default PBIBarChart;
