import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';

interface GaugeChartProps {
  metric: 'revenue' | 'profit';
  target?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ metric, target = 2000000 }) => {
  const filteredSales = useFilteredSales();
  const { getColor } = useThemeStore();

  const value = useMemo(() => {
    return filteredSales.reduce((acc, sale) => acc + (sale[metric] || 0), 0);
  }, [filteredSales, metric]);

  // Gauge logic
  // We want to show the value relative to a target (max).
  // If value > target, it fills up.
  // Data for Pie: [value, target - value] (if value < target)
  
  const data = [
    { name: 'Value', value: value },
    { name: 'Remaining', value: Math.max(0, target - value) },
  ];

  const needle = (
    value: number,
    cx: number,
    cy: number,
    color: string
  ) => {
    // Basic text centered
    return (
       <text x={cx} y={cy - 20} dy={8} textAnchor="middle" fill={color} fontSize={20} fontWeight="bold">
         {`$${(value / 1000).toFixed(0)}k`}
       </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="100%"
          startAngle={180}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          dataKey="value"
          paddingAngle={5}
        >
          <Cell fill={getColor(0)} />
          <Cell fill="#f3f2f1" />
        </Pie>
        {needle(value, 150, 150, getColor(0))}
        <text x="50%" y="90%" textAnchor="middle" fontSize={12} fill="#605E5C">Target: ${(target/1000).toFixed(0)}k</text>
      </PieChart>
    </ResponsiveContainer>
  );
};
