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

interface StackedBarChartProps {
  dimension: 'Region' | 'Category';
  metric: 'revenue' | 'profit';
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({ dimension, metric }) => {
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
          formatter={(value: any) => `$${Number(value).toLocaleString()}`}
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
