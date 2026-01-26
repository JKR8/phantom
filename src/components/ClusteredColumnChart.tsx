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

interface ClusteredColumnChartProps {
  dimension: 'Region' | 'Category';
  metric: 'revenue' | 'profit';
}

export const ClusteredColumnChart: React.FC<ClusteredColumnChartProps> = ({ dimension, metric }) => {
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const setFilter = useStore((state) => state.setFilter);
  const activeFilters = useStore((state) => state.filters);
  const { getColor, highlightColor } = useThemeStore();

  const data = useMemo(() => {
    const aggregation: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      let key = '';
      if (dimension === 'Region') {
        key = stores.find(s => s.id === sale.storeId)?.region || 'Unknown';
      } else if (dimension === 'Category') {
        key = products.find(p => p.id === sale.productId)?.category || 'Unknown';
      }

      aggregation[key] = (aggregation[key] || 0) + sale[metric];
    });

    return Object.entries(aggregation).map(([name, value]) => ({
      name,
      value: Math.round(value),
    })).sort((a, b) => b.value - a.value);
  }, [filteredSales, dimension, metric, stores, products]);

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
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10 }}
        />
        <Tooltip
          formatter={(value: any) => `$${Number(value).toLocaleString()}`}
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
