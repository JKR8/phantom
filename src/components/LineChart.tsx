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
  metric: 'revenue' | 'profit';
  manualData?: Array<{ label: string; value: number }>;
}

export const LineChart: React.FC<LineChartProps> = ({ metric, manualData }) => {
  const filteredSales = useFilteredSales();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({
        name: d.label,
        ac: d.value,
        pl: 0,
        variance: d.value,
        variancePct: '0.0',
      }));
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: Record<string, { ac: number; pl: number }> = {};

    // Initialize all months
    months.forEach(m => {
      monthlyData[m] = { ac: 0, pl: 0 };
    });

    filteredSales.forEach((sale) => {
      const date = new Date(sale.date);
      const month = months[date.getMonth()];

      const acVal = sale[metric] || 0;
      const plVal = sale[`${metric}PL`] || acVal * 0.95;

      monthlyData[month].ac += acVal;
      monthlyData[month].pl += plVal;
    });

    return months.map(month => {
      const ac = monthlyData[month].ac;
      const pl = monthlyData[month].pl;
      const variance = ac - pl;
      const variancePct = pl !== 0 ? ((ac - pl) / pl) * 100 : 0;

      return {
        name: month,
        ac: Math.round(ac),
        pl: Math.round(pl),
        variance: Math.round(variance),
        variancePct: variancePct.toFixed(1),
      };
    });
  }, [manualData, filteredSales, metric]);

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  // Find max value for scaling
  const maxVal = useMemo(() => {
    return Math.max(...data.map(d => Math.max(d.ac, d.pl)));
  }, [data]);

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
            `$${Number(value).toLocaleString()}`,
            name === 'ac' ? 'Actual' : name === 'pl' ? 'Plan' : 'Variance'
          ]}
          contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #edebe9' }}
        />
        <ReferenceLine y={0} stroke="#323130" />
        {/* PL line (dashed grey) */}
        <Line
          type="monotone"
          dataKey="pl"
          stroke="#999999"
          strokeWidth={1}
          strokeDasharray="4 4"
          dot={false}
          name="pl"
        />
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
        <Bar dataKey="variance" barSize={3} name="variance">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.variance >= 0 ? '#107C10' : '#A4262C'}
            />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
};
