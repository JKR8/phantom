import React, { useMemo } from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { useStore, useFilteredSales, useHighlight, useSetHighlight } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface PieChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ dimension, metric, manualData, topN, sort = 'desc', showOther }) => {
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const highlight = useHighlight();
  const setHighlight = useSetHighlight();
  const { getColor } = useThemeStore();

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

    // Top N + Other (configurable, defaults to top 5 + Other for backward compat)
    const effectiveTopN = topN !== undefined ? topN : 5;
    if (effectiveTopN && effectiveTopN !== 'All') {
      const n = typeof effectiveTopN === 'string' ? parseInt(effectiveTopN) : effectiveTopN;
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

  const handleClick = (data: any, _index?: number, e?: React.MouseEvent) => {
    if (data && data.name) {
      setHighlight(dimension, data.name, e?.ctrlKey || e?.metaKey);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RePieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
          label
        >
          {data.map((entry, index) => {
            const isHighlightActive = highlight && highlight.dimension === dimension;
            const isHighlighted = isHighlightActive && highlight.values.has(entry.name);
            return (
              <Cell
                key={`cell-${index}`}
                fill={getColor(index)}
                fillOpacity={isHighlightActive ? (isHighlighted ? 1.0 : 0.4) : 1.0}
              />
            );
          })}
        </Pie>
        <Tooltip formatter={(value: any) => formatMetricValue(metric, Number(value))} />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
      </RePieChart>
    </ResponsiveContainer>
  );
};
