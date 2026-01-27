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
  manualData?: Array<{ label: string; value: number }>;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({ xMetric = 'revenue', yMetric = 'profit', manualData }) => {
  const filteredSales = useFilteredSales();
  const { getColor } = useThemeStore();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d, i) => ({ x: d.value, y: d.value, name: d.label || `Point ${i}` }));
    }

    // For scatter, we'll aggregate by Store to give meaningful points
    // Otherwise 10k points is too much and just transactions
    const aggregation: Record<string, { x: number; y: number; name: string }> = {};

    filteredSales.forEach((sale) => {
      const key = sale.storeId;
      if (!aggregation[key]) {
        aggregation[key] = { x: 0, y: 0, name: key };
      }
      aggregation[key].x += sale[xMetric];
      aggregation[key].y += sale[yMetric];
    });

    return Object.values(aggregation);
  }, [manualData, filteredSales, xMetric, yMetric]);

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
