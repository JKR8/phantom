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
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  timeGrain?: 'month' | 'quarter' | 'year';
}

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

function getTimeBucket(date: Date, grain: 'month' | 'quarter' | 'year'): string {
  if (grain === 'year') return `${date.getFullYear()}`;
  if (grain === 'quarter') return QUARTERS[Math.floor(date.getMonth() / 3)];
  // month: return YYYY-MM for sort stability
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export const AreaChart: React.FC<AreaChartProps> = ({ metric, manualData, timeGrain = 'month' }) => {
  const filteredSales = useFilteredSales();
  const { getColor } = useThemeStore();

  const isCurrencyMetric = (metricName: string) => {
    const key = metricName.toLowerCase();
    return ['revenue', 'profit', 'cost', 'salary', 'mrr', 'ltv', 'amount', 'price'].some(k => key.includes(k));
  };

  const formatValue = (value: number) => {
    if (isCurrencyMetric(metric)) return `$${Number(value).toLocaleString()}`;
    if (metric.toLowerCase().includes('score')) return Number(value).toFixed(2);
    return Number(value).toLocaleString();
  };

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({ date: d.label, value: d.value }));
    }

    const aggregation: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      const date = new Date(sale.date);
      const bucket = getTimeBucket(date, timeGrain);

      // @ts-ignore
      aggregation[bucket] = (aggregation[bucket] || 0) + (sale[metric] || sale[metric.toLowerCase()] || 0);
    });

    return Object.entries(aggregation)
      .map(([date, value]) => ({
        date,
        value: Math.round(value),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [manualData, filteredSales, metric, timeGrain]);

  const formatDate = (dateStr: any) => {
    if (typeof dateStr !== 'string') return '';
    // For quarter/year grain, the bucket is already readable
    if (timeGrain === 'quarter' || timeGrain === 'year') return dateStr;
    // Month grain: YYYY-MM format
    const [year, month] = dateStr.split('-');
    if (!year || !month) return dateStr;
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
          tickFormatter={(value) => formatValue(value)}
          tick={{ fontSize: 10 }}
          width={40}
        />
        <Tooltip
          formatter={(value: any) => [formatValue(Number(value)), metric]}
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
