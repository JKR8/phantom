import React, { useMemo } from 'react';
import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useStore, useFilteredSales, useHighlight, useSetHighlight } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface StackedAreaChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  timeGrain?: 'month' | 'quarter' | 'year';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

function getTimeBucket(date: Date, grain: 'month' | 'quarter' | 'year'): string {
  if (grain === 'year') return `${date.getFullYear()}`;
  if (grain === 'quarter') return QUARTERS[Math.floor(date.getMonth() / 3)];
  return MONTHS[date.getMonth()];
}

function getTimeBuckets(grain: 'month' | 'quarter' | 'year'): string[] {
  if (grain === 'year') return [];
  if (grain === 'quarter') return [...QUARTERS];
  return [...MONTHS];
}

export const StackedAreaChart: React.FC<StackedAreaChartProps> = ({
  dimension,
  metric,
  manualData,
  timeGrain = 'month'
}) => {
  const timeDimension = `_time_${timeGrain}`;
  const filteredSales = useFilteredSales(timeDimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const { getColor } = useThemeStore();
  useHighlight();
  const setHighlight = useSetHighlight();

  const { data, categories } = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return {
        data: manualData.map((d) => ({ timeBucket: d.label, [d.label]: d.value })),
        categories: manualData.map((d) => d.label)
      };
    }

    const buckets = getTimeBuckets(timeGrain);
    const aggregation: Record<string, Record<string, number>> = {};
    const categorySet = new Set<string>();

    filteredSales.forEach((sale) => {
      const date = new Date(sale.date);
      const bucket = getTimeBucket(date, timeGrain);
      const category = getDimensionValue(sale, dimension, { stores, products, customers });

      if (!aggregation[bucket]) {
        aggregation[bucket] = {};
      }
      aggregation[bucket][category] = (aggregation[bucket][category] || 0) + getMetricValue(sale, metric);
      categorySet.add(category);

      if (buckets.length === 0 && !buckets.includes(bucket)) {
        buckets.push(bucket);
      }
    });

    const orderedBuckets = buckets.length > 0 ? buckets : Object.keys(aggregation).sort();
    const allCategories = Array.from(categorySet).sort();

    const chartData = orderedBuckets.map((bucket) => {
      const entry: Record<string, any> = { timeBucket: bucket };
      allCategories.forEach((cat) => {
        entry[cat] = Math.round(aggregation[bucket]?.[cat] || 0);
      });
      return entry;
    });

    return { data: chartData, categories: allCategories };
  }, [manualData, filteredSales, dimension, metric, stores, products, customers, timeGrain]);

  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const name = data.activePayload[0].payload.timeBucket;
      setHighlight(timeDimension, name, false);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReAreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F2F1" />
        <XAxis
          dataKey="timeBucket"
          tick={{ fontSize: 10, fill: '#605E5C' }}
          axisLine={{ stroke: '#F3F2F1' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatMetricValue(metric, value, true)}
          tick={{ fontSize: 10, fill: '#605E5C' }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip
          formatter={(value: any, name: any) => [
            formatMetricValue(metric, Number(value)),
            String(name)
          ]}
          contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #F3F2F1' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '10px' }}
          iconSize={10}
        />
        {categories.map((category, index) => (
          <Area
            key={category}
            type="monotone"
            dataKey={category}
            stackId="1"
            stroke={getColor(index)}
            fill={getColor(index)}
            fillOpacity={0.6}
          />
        ))}
      </ReAreaChart>
    </ResponsiveContainer>
  );
};
