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
import { useStore, useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface ScatterChartProps {
  xMetric: string;
  yMetric: string;
  dimension?: string;
  manualData?: Array<{ label: string; value: number }>;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({ xMetric = 'revenue', yMetric = 'profit', dimension, manualData }) => {
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const { getColor } = useThemeStore();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d, i) => ({ x: d.value, y: d.value, name: d.label || `Point ${i}` }));
    }

    // For scatter, aggregate by dimension (fallback to id) to keep the point count manageable.
    const aggregation: Record<string, { x: number; y: number; name: string }> = {};

    filteredSales.forEach((sale) => {
      const key = dimension
        ? getDimensionValue(sale, dimension, { stores, products, customers })
        : sale.id || 'Unknown';
      if (!aggregation[key]) {
        aggregation[key] = { x: 0, y: 0, name: key };
      }
      aggregation[key].x += getMetricValue(sale, xMetric);
      aggregation[key].y += getMetricValue(sale, yMetric);
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
          tickFormatter={(value) => formatMetricValue(xMetric, Number(value), true)}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yMetric}
          tickFormatter={(value) => formatMetricValue(yMetric, Number(value), true)}
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
