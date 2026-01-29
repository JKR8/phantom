import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { useStore, useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface ComboChartProps {
  dimension: string;
  barMetric: string;
  lineMetric: string;
  manualData?: Array<{ label: string; barValue: number; lineValue: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
}

export const ComboChart: React.FC<ComboChartProps> = ({
  dimension,
  barMetric,
  lineMetric,
  manualData,
  topN,
  sort = 'desc',
  showOther
}) => {
  const filteredSales = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const setFilter = useStore((state) => state.setFilter);
  const activeFilters = useStore((state) => state.filters);
  const { getColor, highlightColor } = useThemeStore();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({
        name: d.label,
        barValue: d.barValue,
        lineValue: d.lineValue
      }));
    }

    const aggregation: Record<string, { barValue: number; lineValue: number }> = {};

    filteredSales.forEach((sale) => {
      const key = getDimensionValue(sale, dimension, { stores, products, customers });
      if (!aggregation[key]) {
        aggregation[key] = { barValue: 0, lineValue: 0 };
      }
      aggregation[key].barValue += getMetricValue(sale, barMetric);
      aggregation[key].lineValue += getMetricValue(sale, lineMetric);
    });

    let result = Object.entries(aggregation).map(([name, values]) => ({
      name,
      barValue: Math.round(values.barValue),
      lineValue: Math.round(values.lineValue)
    }));

    // Sorting
    if (sort === 'asc') {
      result.sort((a, b) => a.barValue - b.barValue);
    } else if (sort === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => b.barValue - a.barValue);
    }

    // Top N + Other
    if (topN && topN !== 'All') {
      const n = typeof topN === 'string' ? parseInt(topN) : topN;
      if (!isNaN(n) && result.length > n) {
        const top = result.slice(0, n);
        if (showOther !== false) {
          const otherBar = result.slice(n).reduce((acc, curr) => acc + curr.barValue, 0);
          const otherLine = result.slice(n).reduce((acc, curr) => acc + curr.lineValue, 0);
          top.push({ name: 'Other', barValue: otherBar, lineValue: otherLine });
        }
        result = top;
      }
    }

    return result;
  }, [manualData, filteredSales, dimension, barMetric, lineMetric, stores, products, customers, topN, sort, showOther]);

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

  // Calculate max values for dual Y-axes scaling
  const maxBarValue = Math.max(...data.map((d) => d.barValue), 0);
  const maxLineValue = Math.max(...data.map((d) => d.lineValue), 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 60, left: 10, bottom: 5 }}
        onClick={(e: any) => {
          if (e && e.activePayload) {
            handleClick(e.activePayload[0].payload);
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F2F1" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: '#605E5C' }}
          axisLine={{ stroke: '#F3F2F1' }}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={(value) => formatMetricValue(barMetric, value, true)}
          tick={{ fontSize: 9, fill: '#605E5C' }}
          axisLine={false}
          tickLine={false}
          domain={[0, maxBarValue * 1.1]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => formatMetricValue(lineMetric, value, true)}
          tick={{ fontSize: 9, fill: '#605E5C' }}
          axisLine={false}
          tickLine={false}
          domain={[0, maxLineValue * 1.1]}
        />
        <Tooltip
          formatter={(value: any, name: any) => [
            formatMetricValue(String(name) === 'barValue' ? barMetric : lineMetric, Number(value)),
            String(name) === 'barValue' ? barMetric : lineMetric
          ]}
          contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #F3F2F1' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '10px' }}
        />
        <Bar
          yAxisId="left"
          dataKey="barValue"
          name="barValue"
          radius={[4, 4, 0, 0]}
          onClick={(data: any) => handleClick(data)}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={activeFilters[dimension] === entry.name ? highlightColor : getColor(0)}
              style={{ cursor: 'pointer' }}
              onClick={() => handleClick(entry)}
            />
          ))}
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="lineValue"
          name="lineValue"
          stroke={getColor(1)}
          strokeWidth={2}
          dot={{ r: 4, fill: getColor(1), stroke: getColor(1) }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
