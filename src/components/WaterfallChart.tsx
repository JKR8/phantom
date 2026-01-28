import React, { useMemo } from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';
import { useStore, useFilteredSales } from '../store/useStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface WaterfallChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({ dimension, metric, manualData }) => {
  const filteredSales = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      // For manual data, render as simple waterfall: start, items, total
      const total = manualData.reduce((sum, d) => sum + d.value, 0);
      const waterfallData: any[] = [];
      let running = 0;
      manualData.forEach((d) => {
        const start = running;
        running += d.value;
        waterfallData.push({
          name: d.label,
          value: [start, running],
          displayValue: d.value,
          fill: d.value >= 0 ? '#107C10' : '#A4262C',
          type: 'variance',
        });
      });
      waterfallData.push({
        name: 'Total',
        value: [0, total],
        displayValue: total,
        fill: '#000000',
        type: 'total',
      });
      return waterfallData;
    }

    if (filteredSales.length === 0) return [];

    const aggregation: Record<string, { ac: number, py: number }> = {};
    let totalAC = 0;
    let totalPY = 0;

    filteredSales.forEach((sale) => {
      const key = getDimensionValue(sale, dimension, { stores, products, customers });

      if (!aggregation[key]) aggregation[key] = { ac: 0, py: 0 };
      
      const acVal = getMetricValue(sale, metric);
      const pyVal = getMetricValue(sale, `${metric}PY`) || acVal * 0.9;
      
      aggregation[key].ac += acVal;
      aggregation[key].py += pyVal;
      totalAC += acVal;
      totalPY += pyVal;
    });

    const waterfallData = [];

    // 1. Start Bar (PY)
    waterfallData.push({
      name: 'PY',
      value: [0, totalPY],
      displayValue: totalPY,
      fill: '#999999', // Grey for PY
      type: 'total'
    });

    // 2. Variance Bars
    let runningTotal = totalPY;
    Object.entries(aggregation).forEach(([name, vals]) => {
        const diff = vals.ac - vals.py;
        const start = runningTotal;
        runningTotal += diff;
        waterfallData.push({
            name: name,
            value: [start, runningTotal],
            displayValue: diff,
            fill: diff >= 0 ? '#107C10' : '#A4262C', // Green / Red
            type: 'variance'
        });
    });

    // 3. End Bar (AC)
    waterfallData.push({
      name: 'AC',
      value: [0, totalAC],
      displayValue: totalAC,
      fill: '#000000', // Black for AC
      type: 'total'
    });

    return waterfallData;
  }, [manualData, filteredSales, dimension, metric, stores, products]);

  const formatValue = (val: number) => formatMetricValue(metric, val, true);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
        <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F2F1" />
            <XAxis 
                dataKey="name" 
                tick={{ fontSize: 9, fill: '#605E5C' }} 
                axisLine={{ stroke: '#F3F2F1' }}
                tickLine={false}
            />
            <YAxis 
                tickFormatter={(value) => formatValue(Number(value))}
                tick={{ fontSize: 9, fill: '#605E5C' }}
                axisLine={false}
                tickLine={false}
            />
            <Tooltip 
                formatter={(val: any) => [formatMetricValue(metric, Number(val[1] - val[0])), 'Change']}
                contentStyle={{ fontSize: '12px', borderRadius: '4px', border: '1px solid #F3F2F1' }}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList 
                dataKey="displayValue" 
                position="top" 
                formatter={(val: any) => formatValue(Number(val))}
                style={{ fontSize: '10px', fontWeight: 'bold', fill: '#252423' }}
            />
            </Bar>
        </ReBarChart>
        </ResponsiveContainer>
    </div>
  );
};
