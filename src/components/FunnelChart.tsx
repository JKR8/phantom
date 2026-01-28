import React, { useMemo } from 'react';
import {
  FunnelChart as ReFunnelChart,
  Funnel,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useStore, useFilteredSales, useHighlight, useSetHighlight } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface FunnelChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ dimension, metric, manualData, topN, sort = 'desc', showOther }) => {
  const filteredSales = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const highlight = useHighlight();
  const setHighlight = useSetHighlight();
  const { getColor } = useThemeStore();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({ name: d.label, value: d.value })).sort((a, b) => b.value - a.value);
    }

    const aggregation: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      const key = getDimensionValue(sale, dimension, { stores, products, customers });
      aggregation[key] = (aggregation[key] || 0) + getMetricValue(sale, metric);
    });

    let result = Object.entries(aggregation)
        .map(([name, value]) => ({
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

  const isHighlightActive = highlight && highlight.dimension === dimension;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ReFunnelChart>
            <Tooltip formatter={(value: any) => formatMetricValue(metric, Number(value))} />
            <Funnel
              dataKey="value"
              data={data}
              isAnimationActive
              onClick={(entry: any) => {
                if (entry && entry.name) {
                  setHighlight(dimension, entry.name);
                }
              }}
            >
               {data.map((entry, index) => {
                const isHighlighted = isHighlightActive && highlight.values.has(entry.name);
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColor(index)}
                    fillOpacity={isHighlightActive ? (isHighlighted ? 1.0 : 0.4) : 1.0}
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}
            </Funnel>
          </ReFunnelChart>
        </ResponsiveContainer>
      </div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '6px 12px',
        padding: '4px 8px',
        fontSize: 11,
        color: '#605E5C',
      }}>
        {data.map((entry, index) => (
          <span key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: getColor(index),
              flexShrink: 0,
            }} />
            {entry.name}
          </span>
        ))}
      </div>
    </div>
  );
};
