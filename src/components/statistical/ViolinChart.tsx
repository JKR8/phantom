import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useStore, useFilteredSales, useHighlight, useSetHighlight } from '../../store/useStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getDimensionValue, getMetricValue } from '../../utils/chartUtils';
import {
  computeKDE,
  computeBoxplotStats,
  KernelType,
  BandwidthMethod,
  getStatTheme,
  StatThemeName,
} from '../../lib/stats-core';

interface ViolinChartProps {
  dimension: string;
  metric: string;
  kernel?: KernelType;
  bandwidth?: BandwidthMethod;
  showInnerBox?: boolean;
  showQuartiles?: boolean;
  showPoints?: boolean;
  statTheme?: StatThemeName;
}

interface ViolinData {
  category: string;
  values: number[];
  kde: Array<{ x: number; density: number }>;
  stats: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    mean: number;
  };
}

export const ViolinChart: React.FC<ViolinChartProps> = ({
  dimension,
  metric,
  kernel = 'gaussian',
  bandwidth = 'silverman',
  showInnerBox = true,
  showQuartiles = false,
  showPoints = false,
  statTheme = 'grey',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const filteredSales = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const highlight = useHighlight();
  const setHighlight = useSetHighlight();
  const { getColor } = useThemeStore();

  const theme = getStatTheme(statTheme);

  // Group data and compute KDE for each group
  const violinData = useMemo<ViolinData[]>(() => {
    const groups: Record<string, number[]> = {};

    filteredSales.forEach((sale) => {
      const key = getDimensionValue(sale, dimension, { stores, products, customers });
      if (!groups[key]) {
        groups[key] = [];
      }
      const value = getMetricValue(sale, metric);
      if (!isNaN(value) && value !== null) {
        groups[key].push(value);
      }
    });

    return Object.entries(groups)
      .filter(([, values]) => values.length >= 2) // Need at least 2 points for KDE
      .map(([category, values]) => {
        const kde = computeKDE(values, { kernel, bandwidth, resolution: 50 });
        const boxStats = computeBoxplotStats(values);

        return {
          category,
          values,
          kde,
          stats: {
            min: boxStats.min,
            q1: boxStats.q1,
            median: boxStats.median,
            q3: boxStats.q3,
            max: boxStats.max,
            mean: boxStats.mean,
          },
        };
      });
  }, [filteredSales, dimension, metric, kernel, bandwidth, stores, products, customers]);

  // Calculate global y-axis domain
  const yDomain = useMemo(() => {
    if (violinData.length === 0) return [0, 100];

    let min = Infinity;
    let max = -Infinity;

    violinData.forEach(({ kde }) => {
      kde.forEach((point) => {
        min = Math.min(min, point.x);
        max = Math.max(max, point.x);
      });
    });

    const padding = (max - min) * 0.05;
    return [min - padding, max + padding];
  }, [violinData]);

  // Calculate max density for scaling
  const maxDensity = useMemo(() => {
    let max = 0;
    violinData.forEach(({ kde }) => {
      kde.forEach((point) => {
        max = Math.max(max, point.density);
      });
    });
    return max || 1;
  }, [violinData]);

  const handleViolinClick = (category: string, e: React.MouseEvent) => {
    setHighlight(dimension, category, e.ctrlKey || e.metaKey);
  };

  if (violinData.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
        No data available
      </div>
    );
  }

  const { width, height } = size;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  if (!width || !height) {
    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
  }

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const categoryWidth = plotWidth / violinData.length;
  const maxViolinWidth = Math.min(categoryWidth * 0.8, 100);

  // Y scale
  const yScale = (value: number) => {
    return margin.top + plotHeight - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotHeight;
  };

  // Create violin path from KDE points
  const createViolinPath = (kde: Array<{ x: number; density: number }>, centerX: number) => {
    if (kde.length === 0) return '';

    const halfWidth = (maxViolinWidth / 2) * 0.9;

    // Right side
    const rightPoints = kde.map((point) => ({
      x: centerX + (point.density / maxDensity) * halfWidth,
      y: yScale(point.x),
    }));

    // Left side (reversed)
    const leftPoints = kde.map((point) => ({
      x: centerX - (point.density / maxDensity) * halfWidth,
      y: yScale(point.x),
    }));

    // Build path
    let path = `M ${rightPoints[0].x} ${rightPoints[0].y}`;
    rightPoints.slice(1).forEach((p) => {
      path += ` L ${p.x} ${p.y}`;
    });
    leftPoints.reverse().forEach((p) => {
      path += ` L ${p.x} ${p.y}`;
    });
    path += ' Z';

    return path;
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg width={width} height={height}>
        {/* Background */}
        <rect
          x={margin.left}
          y={margin.top}
          width={plotWidth}
          height={plotHeight}
          fill={theme.plotBackground}
        />

        {/* Grid lines */}
        {theme.showGridMajor && (
          <g className="grid">
            {Array.from({ length: 6 }).map((_, i) => {
              const y = margin.top + (plotHeight / 5) * i;
              return (
                <line
                  key={i}
                  x1={margin.left}
                  y1={y}
                  x2={margin.left + plotWidth}
                  y2={y}
                  stroke={theme.gridMajorColor}
                  strokeWidth={theme.gridMajorWidth}
                />
              );
            })}
          </g>
        )}

        {/* Y axis */}
        <g className="y-axis">
          {Array.from({ length: 6 }).map((_, i) => {
            const value = yDomain[0] + ((yDomain[1] - yDomain[0]) / 5) * (5 - i);
            const y = margin.top + (plotHeight / 5) * i;
            return (
              <text
                key={i}
                x={margin.left - 10}
                y={y}
                textAnchor="end"
                alignmentBaseline="middle"
                fontSize={theme.axisTickFontSize}
                fill={theme.axisTickColor}
              >
                {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </text>
            );
          })}
        </g>

        {/* Violins */}
        {violinData.map((data, index) => {
          const centerX = margin.left + categoryWidth * index + categoryWidth / 2;
          const isHighlightActive = highlight && highlight.dimension === dimension;
          const isHighlighted = isHighlightActive && highlight.values.has(data.category);
          const opacity = isHighlightActive ? (isHighlighted ? 1 : 0.3) : 1;
          const fillColor = getColor(index);

          return (
            <g
              key={data.category}
              style={{ cursor: 'pointer', opacity }}
              onClick={(e) => handleViolinClick(data.category, e)}
            >
              {/* Violin shape */}
              <path
                d={createViolinPath(data.kde, centerX)}
                fill={fillColor}
                fillOpacity={0.6}
                stroke={theme.violinStrokeColor}
                strokeWidth={1}
              />

              {/* Inner box */}
              {showInnerBox && (
                <>
                  {/* Box */}
                  <rect
                    x={centerX - 4}
                    y={yScale(data.stats.q3)}
                    width={8}
                    height={yScale(data.stats.q1) - yScale(data.stats.q3)}
                    fill={theme.boxFillColor}
                    stroke={theme.boxStrokeColor}
                    strokeWidth={1}
                  />
                  {/* Whisker line */}
                  <line
                    x1={centerX}
                    y1={yScale(data.stats.min)}
                    x2={centerX}
                    y2={yScale(data.stats.max)}
                    stroke={theme.boxStrokeColor}
                    strokeWidth={1}
                  />
                  {/* Median line */}
                  <line
                    x1={centerX - 4}
                    y1={yScale(data.stats.median)}
                    x2={centerX + 4}
                    y2={yScale(data.stats.median)}
                    stroke={theme.medianColor}
                    strokeWidth={2}
                  />
                </>
              )}

              {/* Quartile lines (alternative to box) */}
              {showQuartiles && !showInnerBox && (
                <>
                  <line
                    x1={centerX - 8}
                    y1={yScale(data.stats.q1)}
                    x2={centerX + 8}
                    y2={yScale(data.stats.q1)}
                    stroke={theme.boxStrokeColor}
                    strokeWidth={1}
                  />
                  <line
                    x1={centerX - 10}
                    y1={yScale(data.stats.median)}
                    x2={centerX + 10}
                    y2={yScale(data.stats.median)}
                    stroke={theme.medianColor}
                    strokeWidth={2}
                  />
                  <line
                    x1={centerX - 8}
                    y1={yScale(data.stats.q3)}
                    x2={centerX + 8}
                    y2={yScale(data.stats.q3)}
                    stroke={theme.boxStrokeColor}
                    strokeWidth={1}
                  />
                </>
              )}

              {/* Jittered points */}
              {showPoints &&
                data.values.map((value, i) => (
                  <circle
                    key={i}
                    cx={centerX + (Math.random() - 0.5) * 10}
                    cy={yScale(value)}
                    r={2}
                    fill={theme.pointFillColor}
                    fillOpacity={0.4}
                  />
                ))}

              {/* Category label */}
              <text
                x={centerX}
                y={height - margin.bottom + 20}
                textAnchor="middle"
                fontSize={theme.axisTickFontSize}
                fill={theme.axisTickColor}
              >
                {data.category}
              </text>
            </g>
          );
        })}

        {/* Y axis line */}
        {theme.showAxisLines && (
          <line
            x1={margin.left}
            y1={margin.top}
            x2={margin.left}
            y2={margin.top + plotHeight}
            stroke={theme.axisLineColor}
            strokeWidth={theme.axisLineWidth}
          />
        )}

        {/* X axis line */}
        {theme.showAxisLines && (
          <line
            x1={margin.left}
            y1={margin.top + plotHeight}
            x2={margin.left + plotWidth}
            y2={margin.top + plotHeight}
            stroke={theme.axisLineColor}
            strokeWidth={theme.axisLineWidth}
          />
        )}
      </svg>
    </div>
  );
};
