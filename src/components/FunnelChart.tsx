import React, { useMemo } from 'react';
import {
  FunnelChart as ReFunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useStore, useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';

interface FunnelChartProps {
  dimension: 'Region' | 'Category';
  metric: 'revenue' | 'profit';
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ dimension, metric }) => {
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const { getColor } = useThemeStore();

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

    return Object.entries(aggregation)
        .map(([name, value]) => ({
            name,
            value: Math.round(value),
        }))
        .sort((a, b) => b.value - a.value);
  }, [filteredSales, dimension, metric, stores, products]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReFunnelChart>
        <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
        <Funnel
          dataKey="value"
          data={data}
          isAnimationActive
        >
          <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
           {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={getColor(index)} />
          ))}
        </Funnel>
      </ReFunnelChart>
    </ResponsiveContainer>
  );
};
