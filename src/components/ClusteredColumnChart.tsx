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

interface ClusteredColumnChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
}

export const ClusteredColumnChart: React.FC<ClusteredColumnChartProps> = ({ dimension, metric, manualData, topN, sort = 'desc', showOther }) => {
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} onClick={(e: any) => {
        if (e && e.activePayload) {
          handleClick(e.activePayload[0].payload);
        }
      }}>
        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 10 }}
        />
        <YAxis
          tickFormatter={(value) => formatMetricValue(metric, Number(value), true)}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          formatter={(value: any) => formatMetricValue(metric, Number(value))}
          contentStyle={{ fontSize: '12px' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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
