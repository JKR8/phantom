import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useFilteredSales, useSetHighlight } from '../../store/useStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getMetricValue } from '../../utils/chartUtils';
import {
  computeHistogramBins,
  computeKDE,
  BinMethod,
  getStatTheme,
  StatThemeName,
  mean,
} from '../../lib/stats-core';

interface HistogramChartProps {
  metric: string;
  dimension?: string; // Optional: for filtering
  binMethod?: BinMethod;
  binCount?: number;
  showDensityCurve?: boolean;
  showRugPlot?: boolean;
  showMeanLine?: boolean;
  yAxisType?: 'count' | 'frequency' | 'density';
  statTheme?: StatThemeName;
}

export const HistogramChart: React.FC<HistogramChartProps> = ({
  metric,
  dimension,
  binMethod = 'sturges',
  binCount,
  showDensityCurve = false,
  showRugPlot = false,
  showMeanLine = false,
  yAxisType = 'count',
  statTheme = 'grey',
}) => {
  const filteredSales = useFilteredSales(dimension);
  const setHighlight = useSetHighlight();
  const { getColor } = useThemeStore();

  const theme = getStatTheme(statTheme);

  // Extract values for the metric
  const values = useMemo(() => {
    return filteredSales
      .map((sale) => getMetricValue(sale, metric))
      .filter((v) => !isNaN(v) && v !== null);
  }, [filteredSales, metric]);

  // Compute histogram bins
  const bins = useMemo(() => {
    if (values.length === 0) return [];
    return computeHistogramBins(values, {
      binMethod,
      binCount,
    });
  }, [values, binMethod, binCount]);

  // Compute KDE for density curve
  const kdeCurve = useMemo(() => {
    if (!showDensityCurve || values.length === 0) return [];
    const kde = computeKDE(values, { resolution: 50 });
    return kde.map((point) => ({
      x: point.x,
      density: point.density,
    }));
  }, [values, showDensityCurve]);

  // Calculate mean for reference line
  const meanValue = useMemo(() => {
    if (values.length === 0) return 0;
    return mean(values);
  }, [values]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return bins.map((bin) => {
      let yValue: number;
      switch (yAxisType) {
        case 'frequency':
          yValue = bin.frequency;
          break;
        case 'density':
          yValue = bin.density;
          break;
        default:
          yValue = bin.count;
      }

      // Find KDE value at bin center
      const binCenter = (bin.x0 + bin.x1) / 2;
      const kdePoint = kdeCurve.find((p, i) => {
        if (i === kdeCurve.length - 1) return true;
        return p.x <= binCenter && kdeCurve[i + 1].x > binCenter;
      });

      return {
        x0: bin.x0,
        x1: bin.x1,
        binCenter,
        count: bin.count,
        frequency: bin.frequency,
        density: bin.density,
        yValue,
        kdeDensity: kdePoint?.density || 0,
      };
    });
  }, [bins, yAxisType, kdeCurve]);

  // Scale KDE to match histogram
  const scaledKdeCurve = useMemo(() => {
    if (!showDensityCurve || kdeCurve.length === 0 || chartData.length === 0) return [];

    // Find max values for scaling
    const maxHistY = Math.max(...chartData.map((d) => d.yValue));
    const maxKdeY = Math.max(...kdeCurve.map((d) => d.density));

    if (maxKdeY === 0) return [];

    const scale = maxHistY / maxKdeY;

    return kdeCurve.map((point) => ({
      x: point.x,
      scaledDensity: point.density * scale,
    }));
  }, [showDensityCurve, kdeCurve, chartData]);

  // Handle bar click for cross-filtering (by bin range)
  const handleBarClick = (data: any, _index: number, e: React.MouseEvent) => {
    // For histogram, clicking filters to values within that bin range
    // This is a simplified implementation - you might want to enhance this
    if (data && dimension) {
      // Cross-filter based on the bin's value range
      const binLabel = `${data.x0.toFixed(0)}-${data.x1.toFixed(0)}`;
      setHighlight(dimension, binLabel, e.ctrlKey || e.metaKey);
    }
  };

  if (values.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
        No data available
      </div>
    );
  }

  const yAxisLabel = yAxisType === 'count' ? 'Count' : yAxisType === 'frequency' ? 'Frequency' : 'Density';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 20, right: 30, bottom: showRugPlot ? 50 : 40, left: 60 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={theme.gridMajorColor}
          strokeWidth={theme.gridMajorWidth}
          vertical={false}
        />
        <XAxis
          dataKey="binCenter"
          type="number"
          domain={['dataMin', 'dataMax']}
          tick={{ fontSize: 10, fill: theme.axisTickColor }}
          axisLine={theme.showAxisLines}
          tickFormatter={(value) => value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          label={{
            value: metric,
            position: 'bottom',
            offset: showRugPlot ? 30 : 20,
            style: { fontSize: 11, fill: theme.axisTitleColor },
          }}
        />
        <YAxis
          tick={{ fontSize: 10, fill: theme.axisTickColor }}
          axisLine={theme.showAxisLines}
          label={{
            value: yAxisLabel,
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 11, fill: theme.axisTitleColor },
          }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const data = payload[0].payload;
            return (
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {data.x0.toLocaleString()} - {data.x1.toLocaleString()}
                </div>
                <div>Count: {data.count}</div>
                <div>Frequency: {(data.frequency * 100).toFixed(1)}%</div>
                <div>Density: {data.density.toFixed(4)}</div>
              </div>
            );
          }}
        />

        {/* Histogram bars */}
        <Bar
          dataKey="yValue"
          fill={theme.barFillColor}
          fillOpacity={0.7}
          stroke={theme.boxStrokeColor}
          strokeWidth={1}
          onClick={handleBarClick}
          style={{ cursor: 'pointer' }}
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getColor(0)}
              fillOpacity={0.7}
            />
          ))}
        </Bar>

        {/* Density curve overlay */}
        {showDensityCurve && scaledKdeCurve.length > 0 && (
          <Line
            data={scaledKdeCurve}
            type="monotone"
            dataKey="scaledDensity"
            stroke={theme.lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        )}

        {/* Mean reference line */}
        {showMeanLine && (
          <ReferenceLine
            x={meanValue}
            stroke={theme.meanColor}
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `Mean: ${meanValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}`,
              position: 'top',
              fill: theme.meanColor,
              fontSize: 10,
            }}
          />
        )}

        {/* Rug plot - render as custom SVG elements */}
        {showRugPlot && (
          <g className="rug-plot">
            {/* We'll render this in a custom layer or use scatter */}
          </g>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
