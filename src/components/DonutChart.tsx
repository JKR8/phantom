import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { useStore, useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface DonutChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
}

export const DonutChart: React.FC<DonutChartProps> = ({ dimension, metric, manualData, topN, sort = 'desc', showOther }) => {
  const filteredSales = useFilteredSales();
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={activeFilters[dimension] === entry.name ? highlightColor : getColor(index)}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => formatMetricValue(metric, Number(value))} />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
