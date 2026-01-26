import React, { useMemo } from 'react';
import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';

interface AreaChartProps {
  metric: 'revenue' | 'profit';
}

export const AreaChart: React.FC<AreaChartProps> = ({ metric }) => {
  const filteredSales = useFilteredSales();
  const { getColor } = useThemeStore();

  const data = useMemo(() => {
    const aggregation: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      // Parse ISO date and format as YYYY-MM
      const date = new Date(sale.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      aggregation[monthKey] = (aggregation[monthKey] || 0) + sale[metric];
    });

    return Object.entries(aggregation)
      .map(([date, value]) => ({
        date,
        value: Math.round(value),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales, metric]);

  const formatDate = (dateStr: any) => {
    if (typeof dateStr !== 'string') return '';
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReAreaChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          tick={{ fontSize: 10 }}
        />
        <YAxis 
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10 }}
          width={40}
        />
        <Tooltip 
          formatter={(value: any) => [`$${Number(value).toLocaleString()}`, metric === 'revenue' ? 'Revenue' : 'Profit']}
          labelFormatter={formatDate}
          contentStyle={{ fontSize: '12px' }}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={getColor(0)} 
          fill={getColor(0)} 
          fillOpacity={0.3}
        />
      </ReAreaChart>
    </ResponsiveContainer>
  );
};
