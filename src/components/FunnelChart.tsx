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
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface FunnelChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ dimension, metric, manualData, topN, sort = 'desc', showOther }) => {
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const { getColor } = useThemeStore();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({ name: d.label, value: d.value })).sort((a, b) => b.value - a.value);
    }

    const aggregation: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      const key = getDimensionValue(sale, dimension, { stores, products, customers });
      aggregation[key] = (aggregation[key] || 0) + getMetricValue(sale, metric);
    });

    let result = Object.entries(aggregation)
        .map(([name, value]) => ({
            name,
            value: Math.round(value),
        }));

    // Sorting
    if (sort === 'asc') {
      result.sort((a, b) => a.value - b.value);
    } else if (sort === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => b.value - a.value);
    }

    // Top N + Other
    if (topN && topN !== 'All') {
      const n = typeof topN === 'string' ? parseInt(topN) : topN;
      if (!isNaN(n) && result.length > n) {
        const top = result.slice(0, n);
        if (showOther !== false) {
          const other = result.slice(n).reduce((acc, curr) => acc + curr.value, 0);
          top.push({ name: 'Other', value: other });
        }
        result = top;
      }
    }

    return result;
  }, [manualData, filteredSales, dimension, metric, stores, products, topN, sort, showOther]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReFunnelChart>
        <Tooltip formatter={(value: any) => formatMetricValue(metric, Number(value))} />
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
