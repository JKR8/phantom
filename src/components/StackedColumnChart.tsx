import React, { useMemo } from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  LabelList
} from 'recharts';
import { useFilteredSales } from '../store/useStore';
import { formatMetricValue, getMetricValue } from '../utils/chartUtils';

interface StackedColumnChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
}

export const StackedColumnChart: React.FC<StackedColumnChartProps> = ({ dimension: _dimension, metric, manualData }) => {
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

    // For IBCS style, show monthly comparison of AC vs PL
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: Record<string, { ac: number; pl: number }> = {};

    // Initialize all months
    months.forEach(m => {
      monthlyData[m] = { ac: 0, pl: 0 };
    });

    filteredSales.forEach((sale) => {
      const date = new Date(sale.date);
      const month = months[date.getMonth()];

      const acVal = getMetricValue(sale, metric);
      const plVal = getMetricValue(sale, `${metric}PL`) || acVal * 0.95;

      if (monthlyData[month]) {
        monthlyData[month].ac += acVal;
        monthlyData[month].pl += plVal;
      }
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

  const formatValue = (value: number) => formatMetricValue(metric, value, true);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 5 }} barGap={0} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F2F1" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: '#605E5C' }}
          axisLine={{ stroke: '#F3F2F1' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatValue(value)}
          tick={{ fontSize: 9, fill: '#605E5C' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: any, name: any) => [
            formatMetricValue(metric, Number(value)),
            name === 'ac' ? 'Actual' : 'Plan'
          ]}
          contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #F3F2F1' }}
        />
        <Legend
          formatter={(value) => value === 'ac' ? 'AC' : 'PL'}
          wrapperStyle={{ fontSize: '10px' }}
        />
        <ReferenceLine y={0} stroke="#252423" />
        <Bar dataKey="pl" fill="#999999" name="pl" radius={[2, 2, 0, 0]} />
        <Bar dataKey="ac" fill="#252423" name="ac" radius={[2, 2, 0, 0]}>
          <LabelList
            dataKey="variancePct"
            position="top"
            formatter={(val: any) => {
              const num = parseFloat(String(val));
              return num >= 0 ? `+${val}%` : `${val}%`;
            }}
            style={{
              fontSize: '8px',
              fontWeight: 'bold',
              fill: '#252423',
            }}
          />
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
};
