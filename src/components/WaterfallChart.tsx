import React, { useMemo, useState, useCallback } from 'react';
import { useStore, useFilteredSales } from '../store/useStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface WaterfallChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
}

interface WaterfallDataPoint {
  name: string;
  start: number;
  end: number;
  value: number;
  fill: string;
  type: 'total' | 'variance';
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ dimension, metric, manualData }) => {
  const [size, setSize] = useState({ width: 300, height: 200 });
  const filteredSales = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // Immediate measurement
      const updateSize = () => {
        const rect = node.getBoundingClientRect();
        if (rect.width > 50 && rect.height > 50) {
          setSize({ width: rect.width, height: rect.height });
        }
      };

      updateSize();

      // Also observe for changes
      const observer = new ResizeObserver(() => {
        requestAnimationFrame(updateSize);
      });
      observer.observe(node);

      // Retry after a short delay in case initial size was 0
      setTimeout(updateSize, 100);
    }
  }, []);

  const data = useMemo((): WaterfallDataPoint[] => {
    if (manualData && manualData.length > 0) {
      const total = manualData.reduce((sum, d) => sum + d.value, 0);
      const waterfallData: WaterfallDataPoint[] = [];
      let running = 0;

      manualData.forEach((d) => {
        const start = running;
        const end = running + d.value;
        waterfallData.push({
          name: d.label,
          start: Math.min(start, end),
          end: Math.max(start, end),
          value: d.value,
          fill: d.value >= 0 ? '#107C10' : '#A4262C',
          type: 'variance',
        });
        running += d.value;
      });

      waterfallData.push({
        name: 'Total',
        start: 0,
        end: Math.abs(total),
        value: total,
        fill: total >= 0 ? '#000000' : '#A4262C',
        type: 'total',
      });

      return waterfallData;
    }

    if (filteredSales.length === 0) return [];

    const aggregation: Record<string, { ac: number, py: number }> = {};
    let totalAC = 0;
    let totalPY = 0;

    filteredSales.forEach((sale) => {
      const key = getDimensionValue(sale, dimension, { stores, products, customers });
      if (!aggregation[key]) aggregation[key] = { ac: 0, py: 0 };

      const acVal = getMetricValue(sale, metric);
      const pyVal = getMetricValue(sale, `${metric}PY`) || acVal * 0.9;

      aggregation[key].ac += acVal;
      aggregation[key].py += pyVal;
      totalAC += acVal;
      totalPY += pyVal;
    });

    const waterfallData: WaterfallDataPoint[] = [];

    // PY bar
    waterfallData.push({
      name: 'PY',
      start: 0,
      end: totalPY,
      value: totalPY,
      fill: '#999999',
      type: 'total'
    });

    // Variance bars
    let runningTotal = totalPY;
    Object.entries(aggregation).forEach(([name, vals]) => {
      const diff = vals.ac - vals.py;
      const start = runningTotal;
      const end = runningTotal + diff;

      waterfallData.push({
        name,
        start: Math.min(start, end),
        end: Math.max(start, end),
        value: diff,
        fill: diff >= 0 ? '#107C10' : '#A4262C',
        type: 'variance'
      });

      runningTotal += diff;
    });

    // AC bar
    waterfallData.push({
      name: 'AC',
      start: 0,
      end: totalAC,
      value: totalAC,
      fill: '#000000',
      type: 'total'
    });

    return waterfallData;
  }, [manualData, filteredSales, dimension, metric, stores, products, customers]);

  const formatValue = (val: number) => formatMetricValue(metric, val, true);

  // Chart dimensions with minimums and compact margins for small containers
  const margin = { top: 18, right: 10, left: 35, bottom: 20 };
  const effectiveWidth = Math.max(150, size.width);
  const effectiveHeight = Math.max(100, size.height);
  const chartWidth = Math.max(60, effectiveWidth - margin.left - margin.right);
  const chartHeight = Math.max(40, effectiveHeight - margin.top - margin.bottom);

  // Y-axis scale
  const yMax = useMemo(() => {
    if (data.length === 0) return 100;
    return Math.max(...data.map(d => Math.max(d.start, d.end))) * 1.15;
  }, [data]);

  const yMin = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.min(0, ...data.map(d => Math.min(d.start, d.end)));
  }, [data]);

  const yScale = useCallback((val: number) => {
    const range = yMax - yMin;
    if (range === 0 || chartHeight === 0) return 0;
    return chartHeight - ((val - yMin) / range) * chartHeight;
  }, [yMax, yMin, chartHeight]);

  // Bar dimensions
  const barCount = data.length || 1;
  const totalBarSpace = chartWidth;
  const barWidth = Math.max(20, (totalBarSpace / barCount) * 0.6);
  const barGap = (totalBarSpace - barWidth * barCount) / (barCount + 1);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const tickCount = 5;
    const range = yMax - yMin;
    const step = range / tickCount;
    return Array.from({ length: tickCount + 1 }, (_, i) => yMin + i * step);
  }, [yMin, yMax]);

  if (data.length === 0) {
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
          No data
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minWidth: '200px', minHeight: '150px', backgroundColor: 'white' }}>
      <svg width={effectiveWidth} height={effectiveHeight} className="waterfall-chart" data-testid="waterfall-svg">
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <line
              key={`grid-${i}`}
              x1={0}
              y1={yScale(tick)}
              x2={chartWidth}
              y2={yScale(tick)}
              stroke="#F3F2F1"
              strokeDasharray="3 3"
            />
          ))}

          {/* Y-axis labels */}
          {yTicks.map((tick, i) => (
            <text
              key={`ytick-${i}`}
              x={-8}
              y={yScale(tick)}
              textAnchor="end"
              alignmentBaseline="middle"
              fontSize={9}
              fill="#605E5C"
            >
              {formatValue(tick)}
            </text>
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const x = barGap + i * (barWidth + barGap);
            const yTop = yScale(d.end);
            const yBottom = yScale(d.start);
            const height = Math.abs(yBottom - yTop);
            const y = Math.min(yTop, yBottom);

            return (
              <g key={`bar-${i}`} className="waterfall-bar">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(1, height)}
                  fill={d.fill}
                  rx={2}
                  ry={2}
                  className="waterfall-rect"
                />
                {/* Value label */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight="bold"
                  fill="#252423"
                >
                  {formatValue(d.value)}
                </text>
                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 15}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#605E5C"
                >
                  {d.name}
                </text>
              </g>
            );
          })}

          {/* X-axis line */}
          <line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="#F3F2F1"
          />
        </g>
      </svg>
    </div>
  );
};
