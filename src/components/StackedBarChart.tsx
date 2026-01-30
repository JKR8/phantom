import React, { useMemo } from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useStore, useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface StackedBarChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
  /** Variant type: 'default' for stacked bar, 'ribbon' for ribbon/sankey-style */
  variant?: 'default' | 'ribbon';
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  dimension,
  metric,
  manualData,
  topN,
  sort = 'desc',
  showOther,
  variant = 'default',
}) => {
  const filteredSales = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const setFilter = useStore((state) => state.setFilter);
  const activeFilters = useStore((state) => state.filters);
  const { getColor, highlightColor } = useThemeStore();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({ name: d.label, value: d.value }));
    }

    const aggregation: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      const key = getDimensionValue(sale, dimension, { stores, products, customers });
      aggregation[key] = (aggregation[key] || 0) + getMetricValue(sale, metric);
    });

    let result = Object.entries(aggregation).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    // Sorting
    if (sort === 'asc') {
      result.sort((a, b) => a.value - b.value);
    } else if (sort === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => b.value - a.value);
    }

    // Top N + Other
    if (topN && topN !== 'All') {
      const n = typeof topN === 'string' ? parseInt(topN) : topN;
      if (!isNaN(n) && result.length > n) {
         const top = result.slice(0, n);
         if (showOther !== false) {
           const other = result.slice(n).reduce((acc, curr) => acc + curr.value, 0);
           top.push({ name: 'Other', value: other });
         }
         result = top;
      }
    }

    return result;
  }, [manualData, filteredSales, dimension, metric, stores, products, topN, sort, showOther]);

  const handleClick = (data: any) => {
    if (data && data.name) {
      const currentFilter = activeFilters[dimension];
      if (currentFilter === data.name) {
        setFilter(dimension, null);
      } else {
        setFilter(dimension, data.name);
      }
    }
  };

  // ========== RIBBON VARIANT ==========
  if (variant === 'ribbon') {
    // Create time-series stacked data for ribbon chart
    // Simulate 3 time periods with the same categories
    const categories = data.slice(0, 5).map(d => d.name);
    const timeColumns = ['Period 1', 'Period 2', 'Period 3'];

    // Calculate column totals and segment positions
    const columnData = timeColumns.map((period, periodIdx) => {
      const segments = categories.map((cat, catIdx) => {
        // Simulate some variation in values across periods
        const baseValue = data.find(d => d.name === cat)?.value || 100;
        const variation = 1 + (Math.sin(periodIdx * 0.5 + catIdx) * 0.3);
        return {
          name: cat,
          value: Math.round(baseValue * variation),
        };
      });

      const total = segments.reduce((sum, s) => sum + s.value, 0);

      // Calculate cumulative positions
      let cumulative = 0;
      const positioned = segments.map((s, idx) => {
        const startPct = (cumulative / total) * 100;
        cumulative += s.value;
        const endPct = (cumulative / total) * 100;
        return {
          ...s,
          startPct,
          endPct,
          colorIdx: idx,
        };
      });

      return {
        period,
        total,
        segments: positioned,
      };
    });

    return (
      <div style={{ width: '100%', height: '100%', padding: '16px' }}>
        <div style={{
          display: 'flex',
          height: 'calc(100% - 30px)',
          gap: '4px',
          position: 'relative',
        }}>
          {columnData.map((col) => (
            <div key={col.period} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}>
              {/* Column total label */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '11px',
                color: '#64748b',
              }}>
                {formatMetricValue(metric, col.total, true)}
              </div>

              {/* Stacked segments */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}>
                {col.segments.map((seg) => (
                  <div
                    key={seg.name}
                    style={{
                      flex: seg.endPct - seg.startPct,
                      backgroundColor: getColor(seg.colorIdx),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '1px',
                      position: 'relative',
                    }}
                    title={`${seg.name}: ${formatMetricValue(metric, seg.value)}`}
                  >
                    {/* Segment label (if space allows) */}
                    {(seg.endPct - seg.startPct) > 15 && (
                      <span style={{
                        fontSize: '10px',
                        color: '#fff',
                        fontWeight: 500,
                      }}>
                        {formatMetricValue(metric, seg.value, true)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* SVG overlay for ribbon connectors */}
          <svg style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}>
            {columnData.slice(0, -1).map((col, colIdx) => {
              const nextCol = columnData[colIdx + 1];
              const colWidth = 100 / columnData.length;
              const x1 = colWidth * (colIdx + 1);
              const x2 = colWidth * (colIdx + 1);

              return col.segments.map((seg, segIdx) => {
                const nextSeg = nextCol.segments[segIdx];
                if (!nextSeg) return null;

                // Create curved path between segments
                const y1Start = seg.startPct;
                const y1End = seg.endPct;
                const y2Start = nextSeg.startPct;
                const y2End = nextSeg.endPct;

                return (
                  <path
                    key={`ribbon-${colIdx}-${segIdx}`}
                    d={`
                      M ${x1}% ${y1Start}%
                      C ${x1 + colWidth * 0.4}% ${y1Start}%, ${x2 + colWidth * 0.6}% ${y2Start}%, ${x2 + colWidth}% ${y2Start}%
                      L ${x2 + colWidth}% ${y2End}%
                      C ${x2 + colWidth * 0.6}% ${y2End}%, ${x1 + colWidth * 0.4}% ${y1End}%, ${x1}% ${y1End}%
                      Z
                    `}
                    fill={getColor(seg.colorIdx)}
                    fillOpacity={0.3}
                  />
                );
              });
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          paddingTop: '8px',
        }}>
          {timeColumns.map((label) => (
            <span key={label} style={{
              fontSize: '12px',
              color: '#64748b',
            }}>
              {label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // ========== DEFAULT STACKED BAR VARIANT ==========
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }} onClick={(e: any) => {
        if (e && e.activePayload) {
          handleClick(e.activePayload[0].payload);
        }
      }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 10 }}
          width={80}
        />
        <Tooltip
          formatter={(value: any) => formatMetricValue(metric, Number(value))}
          contentStyle={{ fontSize: '12px' }}
        />
        {/* stackId is what makes it stacked, though with 1 series it looks like normal bar */}
        <Bar dataKey="value" stackId="a" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={activeFilters[dimension] === entry.name ? highlightColor : getColor(index)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
};
