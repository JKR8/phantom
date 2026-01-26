import React, { useMemo } from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { useStore, useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';

interface PieChartProps {
  dimension: 'Region' | 'Category';
  metric: 'revenue' | 'profit';
}

export const PieChart: React.FC<PieChartProps> = ({ dimension, metric }) => {
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
    }));
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
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={activeFilters[dimension] === entry.name ? highlightColor : getColor(index)}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
      </RePieChart>
    </ResponsiveContainer>
  );
};
