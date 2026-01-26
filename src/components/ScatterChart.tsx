import React, { useMemo } from 'react';
import {
  ScatterChart as ReScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';

interface ScatterChartProps {
  xMetric: 'revenue' | 'profit' | 'quantity';
  yMetric: 'revenue' | 'profit' | 'quantity';
}

export const ScatterChart: React.FC<ScatterChartProps> = ({ xMetric = 'revenue', yMetric = 'profit' }) => {
  const filteredSales = useFilteredSales();
  const { getColor } = useThemeStore();

  const data = useMemo(() => {
    // For scatter, we'll aggregate by Store to give meaningful points
    // Otherwise 10k points is too much and just transactions
    const aggregation: Record<string, { x: number; y: number; name: string }> = {};

    filteredSales.forEach((sale) => {
      // Assuming we have store context available in sales, but let's check
      // We have storeId.
      const key = sale.storeId;
      if (!aggregation[key]) {
        aggregation[key] = { x: 0, y: 0, name: key }; // We don't have store name easily here without lookup, just use ID or we need to access store store
      }
      aggregation[key].x += sale[xMetric];
      aggregation[key].y += sale[yMetric];
    });

    return Object.values(aggregation);
  }, [filteredSales, xMetric, yMetric]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReScatterChart
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid />
        <XAxis 
          type="number" 
          dataKey="x" 
          name={xMetric} 
          unit={xMetric === 'quantity' ? '' : '$'} 
          tick={{ fontSize: 10 }}
        />
        <YAxis 
          type="number" 
          dataKey="y" 
          name={yMetric} 
          unit={yMetric === 'quantity' ? '' : '$'} 
          tick={{ fontSize: 10 }}
        />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name="Stores" data={data} fill={getColor(0)}>
            {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getColor(index % 6)} />
            ))}
        </Scatter>
      </ReScatterChart>
    </ResponsiveContainer>
  );
};
