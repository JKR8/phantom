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

interface WaterfallChartProps {
  dimension: 'Region' | 'Category';
  metric: 'revenue' | 'profit';
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ dimension, metric }) => {
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);

  const data = useMemo(() => {
    const aggregation: Record<string, number> = {};
    let total = 0;

    filteredSales.forEach((sale) => {
      let key = '';
      if (dimension === 'Region') {
        key = stores.find(s => s.id === sale.storeId)?.region || 'Unknown';
      } else if (dimension === 'Category') {
        key = products.find(p => p.id === sale.productId)?.category || 'Unknown';
      }

      aggregation[key] = (aggregation[key] || 0) + sale[metric];
      total += sale[metric];
    });

    const items = Object.entries(aggregation)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    // Calculate start/end values for waterfall bars
    // Normally Waterfall: Total -> Decrease/Increase -> End.
    // Or Component Breakdown: Item 1, Item 2, Item 3 ... -> Total
    // Let's do Breakdown -> Total
    let currentY = 0;
    const waterfallData = items.map((item) => {
      const prevY = currentY;
      currentY += item.value;
      return {
        name: item.name,
        value: [prevY, currentY], // Recharts range bar
        displayValue: item.value,
        fill: '#0078D4' // Positive contribution
      };
    });

    // Add Total column
    waterfallData.push({
      name: 'Total',
      value: [0, total],
      displayValue: total,
      fill: '#252423' // Total color
    });

    return waterfallData;
  }, [filteredSales, dimension, metric, stores, products]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis 
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10 }}
        />
        <Tooltip 
          formatter={(_value: any, _name: any, props: any) => [`$${Number(props.payload.displayValue).toLocaleString()}`, metric]}
          contentStyle={{ fontSize: '12px' }}
        />
        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
};