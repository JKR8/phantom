import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useStore, useFilteredSales, useHighlight, useSetHighlight } from '../../store/useStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getDimensionValue, getMetricValue } from '../../utils/chartUtils';
import {
  computeBoxplotStats,
  BoxplotStats,
  WhiskerMethod,
  getStatTheme,
  StatThemeName,
} from '../../lib/stats-core';

interface BoxplotChartProps {
  dimension: string;
  metric: string;
  whiskerMethod?: WhiskerMethod;
  showOutliers?: boolean;
  showMean?: boolean;
  showJitteredPoints?: boolean;
  statTheme?: StatThemeName;
}

interface BoxplotData {
  category: string;
  stats: BoxplotStats;
  rawValues: number[];
}

export const BoxplotChart: React.FC<BoxplotChartProps> = ({
  dimension,
  metric,
  whiskerMethod = 'tukey',
  showOutliers = true,
  showMean = false,
  showJitteredPoints = false,
  statTheme = 'grey',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      setSize({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
    };

    // Initial size
    updateSize();

    // Use ResizeObserver to detect container size changes (from grid layout resize)
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const filteredSales = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const highlight = useHighlight();
  const setHighlight = useSetHighlight();
  const { getColor } = useThemeStore();

  const theme = getStatTheme(statTheme);

  // Group data by dimension and compute boxplot stats
  const boxplotData = useMemo<BoxplotData[]>(() => {
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
      .filter(([, values]) => values.length > 0)
      .map(([category, values]) => ({
        category,
        stats: computeBoxplotStats(values, { whiskerMethod }),
        rawValues: values,
      }));
  }, [filteredSales, dimension, metric, whiskerMethod, stores, products, customers]);

  // Calculate y-axis domain from all stats
  const yDomain = useMemo(() => {
    if (boxplotData.length === 0) return [0, 100];

    let min = Infinity;
    let max = -Infinity;

    boxplotData.forEach(({ stats, rawValues }) => {
      if (showOutliers && stats.outliers.length > 0) {
        min = Math.min(min, ...stats.outliers);
        max = Math.max(max, ...stats.outliers);
      }
      min = Math.min(min, stats.lowerWhisker);
      max = Math.max(max, stats.upperWhisker);

      if (showJitteredPoints) {
        min = Math.min(min, ...rawValues);
        max = Math.max(max, ...rawValues);
      }
    });

    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [boxplotData, showOutliers, showJitteredPoints]);

  const handleBoxClick = (category: string, e: React.MouseEvent) => {
    setHighlight(dimension, category, e.ctrlKey || e.metaKey);
  };

  if (boxplotData.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
        No data available
      </div>
    );
  }

  const { width, height } = size;
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };

  if (!width || !height) {
    return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
  }

  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const categoryWidth = plotWidth / boxplotData.length;
  const boxWidth = Math.min(categoryWidth * 0.6, 60);

  // Y scale
  const yScale = (value: number) => {
    return margin.top + plotHeight - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotHeight;
  };

  // Y axis tick values
  const yRange = yDomain[1] - yDomain[0];
  const tickCount = 6;
  const yTicks = Array.from({ length: tickCount }, (_, i) => yDomain[0] + (yRange * i) / (tickCount - 1));

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
            {yTicks.map((tick, i) => {
              const y = yScale(tick);
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

        {/* Y axis labels */}
        <g className="y-axis">
          {yTicks.map((tick, i) => {
            const y = yScale(tick);
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
                {tick.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </text>
            );
          })}
        </g>

        {/* Boxplots */}
        {boxplotData.map((data, index) => {
          const centerX = margin.left + categoryWidth * index + categoryWidth / 2;
          const isHighlightActive = highlight && highlight.dimension === dimension;
          const isHighlighted = isHighlightActive && highlight.values.has(data.category);
          const opacity = isHighlightActive ? (isHighlighted ? 1 : 0.3) : 1;
          const fillColor = getColor(index);
          const stats = data.stats;

          if (isNaN(stats.median)) return null;

          const boxLeft = centerX - boxWidth / 2;
          const whiskerCapWidth = boxWidth * 0.4;

          const q1Y = yScale(stats.q1);
          const q3Y = yScale(stats.q3);
          const medianY = yScale(stats.median);
          const lowerWhiskerY = yScale(stats.lowerWhisker);
          const upperWhiskerY = yScale(stats.upperWhisker);
          const meanY = yScale(stats.mean);

          return (
            <g
              key={data.category}
              style={{ cursor: 'pointer', opacity }}
              onClick={(e) => handleBoxClick(data.category, e)}
            >
              {/* Whisker line (vertical) */}
              <line
                x1={centerX}
                y1={lowerWhiskerY}
                x2={centerX}
                y2={upperWhiskerY}
                stroke={theme.boxStrokeColor}
                strokeWidth={1}
              />

              {/* Lower whisker cap */}
              <line
                x1={centerX - whiskerCapWidth / 2}
                y1={lowerWhiskerY}
                x2={centerX + whiskerCapWidth / 2}
                y2={lowerWhiskerY}
                stroke={theme.boxStrokeColor}
                strokeWidth={1}
              />

              {/* Upper whisker cap */}
              <line
                x1={centerX - whiskerCapWidth / 2}
                y1={upperWhiskerY}
                x2={centerX + whiskerCapWidth / 2}
                y2={upperWhiskerY}
                stroke={theme.boxStrokeColor}
                strokeWidth={1}
              />

              {/* Box (Q1 to Q3) */}
              <rect
                x={boxLeft}
                y={q3Y}
                width={boxWidth}
                height={q1Y - q3Y}
                fill={fillColor}
                fillOpacity={0.7}
                stroke={theme.boxStrokeColor}
                strokeWidth={1}
              />

              {/* Median line */}
              <line
                x1={boxLeft}
                y1={medianY}
                x2={boxLeft + boxWidth}
                y2={medianY}
                stroke={theme.medianColor}
                strokeWidth={2}
              />

              {/* Mean marker (diamond) */}
              {showMean && (
                <polygon
                  points={`${centerX},${meanY - 5} ${centerX + 5},${meanY} ${centerX},${meanY + 5} ${centerX - 5},${meanY}`}
                  fill={theme.meanColor}
                  stroke={theme.boxStrokeColor}
                  strokeWidth={1}
                />
              )}

              {/* Outliers */}
              {showOutliers &&
                stats.outliers.map((outlier, i) => (
                  <circle
                    key={`outlier-${i}`}
                    cx={centerX}
                    cy={yScale(outlier)}
                    r={4}
                    fill={fillColor}
                    fillOpacity={0.7}
                    stroke={theme.boxStrokeColor}
                    strokeWidth={1}
                  />
                ))}

              {/* Jittered points */}
              {showJitteredPoints &&
                data.rawValues.map((value, i) => (
                  <circle
                    key={`point-${i}`}
                    cx={centerX + (Math.random() - 0.5) * boxWidth * 0.8}
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
