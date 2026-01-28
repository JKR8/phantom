import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { useFilteredSales } from '../store/useStore';

interface LineChartProps {
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  comparison?: 'none' | 'pl' | 'py' | 'both';
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
  if (grain === 'year') return []; // dynamic
  if (grain === 'quarter') return [...QUARTERS];
  return [...MONTHS];
}

export const LineChart: React.FC<LineChartProps> = ({ metric, manualData, comparison = 'both', timeGrain = 'month' }) => {
  const filteredSales = useFilteredSales();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({
        name: d.label,
        ac: d.value,
        pl: 0,
        py: 0,
        variance: d.value,
        variancePct: '0.0',
      }));
    }

    const buckets = getTimeBuckets(timeGrain);
    const bucketData: Record<string, { ac: number; pl: number; py: number }> = {};

    // Initialize known buckets
    if (buckets.length > 0) {
      buckets.forEach(b => {
        bucketData[b] = { ac: 0, pl: 0, py: 0 };
      });
    }

    filteredSales.forEach((sale) => {
      const date = new Date(sale.date);
      const bucket = getTimeBucket(date, timeGrain);

      if (!bucketData[bucket]) {
        bucketData[bucket] = { ac: 0, pl: 0, py: 0 };
        if (buckets.length === 0) buckets.push(bucket);
      }

      // @ts-ignore
      const acVal = sale[metric] || sale[metric.toLowerCase()] || 0;
      // @ts-ignore
      const plVal = sale[`${metric}PL`] || acVal * 0.95;
      // @ts-ignore
      const pyVal = sale[`${metric}PY`] || acVal * 0.9;

      bucketData[bucket].ac += acVal;
      bucketData[bucket].pl += plVal;
      bucketData[bucket].py += pyVal;
    });

    // For dynamic year buckets, sort them
    const orderedBuckets = buckets.length > 0 ? buckets : Object.keys(bucketData).sort();

    return orderedBuckets.map(bucket => {
      const d = bucketData[bucket] || { ac: 0, pl: 0, py: 0 };
      const ac = d.ac;
      const pl = d.pl;
      const variance = ac - pl;
      const variancePct = pl !== 0 ? ((ac - pl) / pl) * 100 : 0;

      return {
        name: bucket,
        ac: Math.round(ac),
        pl: Math.round(pl),
        py: Math.round(d.py),
        variance: Math.round(variance),
        variancePct: variancePct.toFixed(1),
      };
    });
  }, [manualData, filteredSales, metric, timeGrain]);

  const isCurrencyMetric = (metricName: string) => {
    const key = metricName.toLowerCase();
    return ['revenue', 'profit', 'cost', 'salary', 'mrr', 'ltv', 'amount', 'price'].some(k => key.includes(k));
  };

  const formatValue = (value: number) => {
    if (metric.toLowerCase().includes('score')) return value.toFixed(2);
    if (isCurrencyMetric(metric)) {
      if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value.toString()}`;
    }
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const showPL = comparison === 'pl' || comparison === 'both';
  const showPY = comparison === 'py' || comparison === 'both';
  const showVariance = comparison !== 'none';

  // Find max value for scaling
  const maxVal = useMemo(() => {
    const values = data.flatMap(d => {
      const v = [d.ac];
      if (showPL) v.push(d.pl);
      if (showPY) v.push(d.py);
      return v;
    });
    return Math.max(...values);
  }, [data, showPL, showPY]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edebe9" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: '#605E5C' }}
          axisLine={{ stroke: '#edebe9' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatValue(value)}
          tick={{ fontSize: 9, fill: '#605E5C' }}
          axisLine={false}
          tickLine={false}
          domain={[0, maxVal * 1.2]}
        />
        <Tooltip
          formatter={(value: any, name: any) => [
            formatValue(Number(value)),
            name === 'ac' ? 'Actual' : name === 'pl' ? 'Plan' : name === 'py' ? 'Prior Year' : 'Variance'
          ]}
          contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #edebe9' }}
        />
        <ReferenceLine y={0} stroke="#323130" />
        {/* PL line (dashed grey) */}
        {showPL && (
          <Line
            type="monotone"
            dataKey="pl"
            stroke="#999999"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            name="pl"
          />
        )}
        {/* PY line (dotted blue-grey) */}
        {showPY && (
          <Line
            type="monotone"
            dataKey="py"
            stroke="#6B7280"
            strokeWidth={1}
            strokeDasharray="2 2"
            dot={false}
            name="py"
          />
        )}
        {/* AC line (solid black) */}
        <Line
          type="monotone"
          dataKey="ac"
          stroke="#323130"
          strokeWidth={2}
          dot={{ r: 3, fill: '#323130', stroke: '#323130' }}
          name="ac"
        />
        {/* Variance bars (pins) */}
        {showVariance && (
          <Bar dataKey="variance" barSize={3} name="variance">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.variance >= 0 ? '#107C10' : '#A4262C'}
              />
            ))}
          </Bar>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
