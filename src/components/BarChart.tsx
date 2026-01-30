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
  ComposedChart,
  Scatter,
} from 'recharts';
import { useStore, useFilteredSales, useHighlight, useSetHighlight } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface BarChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
  /** Variant type for different bar chart styles */
  variant?: 'default' | 'grouped' | 'lollipop' | 'barbell' | 'diverging' | 'gantt';
  /** Secondary metric for comparison variants (barbell, diverging) */
  metric2?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  dimension,
  metric,
  manualData,
  topN,
  sort = 'desc',
  showOther,
  variant = 'default',
  metric2,
}) => {
  const filteredSales = useFilteredSales(dimension); // Exclude own dimension from cross-filter
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const highlight = useHighlight();
  const setHighlight = useSetHighlight();
  const { getColor } = useThemeStore();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({ name: d.label, value: d.value }));
    }

    const aggregation: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      const key = getDimensionValue(sale, dimension, { stores, products, customers });
      aggregation[key] = (aggregation[key] || 0) + getMetricValue(sale, metric);
    });

    let result = Object.entries(aggregation).map(([name, value]) => ({
      name,
      value: Math.round(value),
    }));

    // Sorting
    if (sort === 'asc') {
      result.sort((a, b) => a.value - b.value);
    } else if (sort === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // desc default
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

  const handleBarClick = (data: any, _index: number, e: React.MouseEvent) => {
    if (data && data.name) {
      setHighlight(dimension, data.name, e?.ctrlKey || e?.metaKey);
    }
  };

  // Get comparison data for barbell/diverging variants
  const comparisonData = useMemo((): Array<{ name: string; value1: number; value2: number; divergeValue: number }> => {
    const aggregation1: Record<string, number> = {};
    const aggregation2: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      const key = getDimensionValue(sale, dimension, { stores, products, customers });
      aggregation1[key] = (aggregation1[key] || 0) + getMetricValue(sale, metric);
      aggregation2[key] = (aggregation2[key] || 0) + getMetricValue(sale, metric2 || metric);
    });

    return Object.keys(aggregation1).map((name) => ({
      name,
      value1: Math.round(aggregation1[name] || 0),
      value2: Math.round(aggregation2[name] || 0),
      divergeValue: Math.round(aggregation1[name] || 0) - Math.round(aggregation2[name] || 0),
    })).slice(0, topN && topN !== 'All' ? Number(topN) : undefined);
  }, [filteredSales, dimension, metric, metric2, stores, products, customers, topN]);

  // ========== LOLLIPOP VARIANT ==========
  if (variant === 'lollipop') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F2F1" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 10, fill: '#605E5C' }}
            width={80}
          />
          <Tooltip
            formatter={(value: any) => formatMetricValue(metric, Number(value))}
            contentStyle={{ fontSize: '12px' }}
          />
          {/* Thin line */}
          <Bar dataKey="value" barSize={2} fill={getColor(0)} radius={0} />
          {/* Circle at end */}
          <Scatter
            dataKey="value"
            fill={getColor(0)}
            shape={(props: any) => {
              const { cx, cy } = props;
              return <circle cx={cx} cy={cy} r={6} fill={getColor(0)} />;
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // ========== BARBELL VARIANT ==========
  if (variant === 'barbell') {
    const maxVal = Math.max(...comparisonData.flatMap(d => [d.value1, d.value2]), 1);

    return (
      <div style={{ width: '100%', height: '100%', padding: '8px 16px' }}>
        {comparisonData.map((item) => {
          const val1 = item.value1;
          const val2 = item.value2;
          const minPct = (Math.min(val1, val2) / maxVal) * 100;
          const maxPct = (Math.max(val1, val2) / maxVal) * 100;

          return (
            <div key={item.name} style={{
              display: 'flex',
              alignItems: 'center',
              height: `${100 / comparisonData.length}%`,
              gap: '8px',
            }}>
              <div style={{
                width: '72px',
                fontSize: '12px',
                color: '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.name}
              </div>
              <div style={{
                flex: 1,
                height: '20px',
                position: 'relative',
              }}>
                {/* Connecting line */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${minPct}%`,
                  width: `${maxPct - minPct}%`,
                  height: '2px',
                  backgroundColor: getColor(0),
                  transform: 'translateY(-50%)',
                }} />
                {/* Start dot */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${(val1 / maxVal) * 100}%`,
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getColor(0),
                  transform: 'translate(-50%, -50%)',
                }} />
                {/* End dot */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${(val2 / maxVal) * 100}%`,
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: getColor(1),
                  transform: 'translate(-50%, -50%)',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ========== DIVERGING VARIANT ==========
  if (variant === 'diverging') {
    const maxAbs = Math.max(...comparisonData.map(d => Math.abs(d.divergeValue)), 1);

    return (
      <div style={{ width: '100%', height: '100%', padding: '8px 16px' }}>
        {comparisonData.map((item) => {
          const divergeVal = item.divergeValue;
          const pct = (divergeVal / maxAbs) * 50; // 50% max on each side

          return (
            <div key={item.name} style={{
              display: 'flex',
              alignItems: 'center',
              height: `${100 / comparisonData.length}%`,
              gap: '8px',
            }}>
              <div style={{
                width: '72px',
                fontSize: '12px',
                color: '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.name}
              </div>
              <div style={{
                flex: 1,
                height: '24px',
                position: 'relative',
              }}>
                {/* Center line */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: '50%',
                  width: '1px',
                  backgroundColor: '#e2e8f0',
                }} />
                {/* Bar extending from center */}
                <div style={{
                  position: 'absolute',
                  top: '15%',
                  bottom: '15%',
                  left: divergeVal >= 0 ? '50%' : `${50 + pct}%`,
                  width: `${Math.abs(pct)}%`,
                  backgroundColor: divergeVal >= 0 ? getColor(0) : getColor(1),
                }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ========== GANTT VARIANT ==========
  if (variant === 'gantt') {
    // For gantt, we'd need date fields. For now, show a simplified timeline view
    return (
      <div style={{ width: '100%', height: '100%', padding: '8px 16px' }}>
        {data.map((item, index) => {
          // Simulate task positioning based on index
          const startPct = (index * 10) % 60;
          const widthPct = 20 + (item.value % 30);

          return (
            <div key={item.name} style={{
              display: 'flex',
              alignItems: 'center',
              height: `${100 / data.length}%`,
              gap: '8px',
              borderBottom: index < data.length - 1 ? '1px solid #e2e8f0' : 'none',
            }}>
              <div style={{
                width: '72px',
                fontSize: '12px',
                color: '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.name}
              </div>
              <div style={{
                flex: 1,
                height: '100%',
                position: 'relative',
                padding: '4px 0',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '18%',
                  bottom: '18%',
                  left: `${startPct}%`,
                  width: `${widthPct}%`,
                  backgroundColor: getColor(index % 6),
                  borderRadius: '2px',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ========== DEFAULT / GROUPED VARIANT ==========
  // Grouped would need multiple data series - for now, show as clustered bars
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F3F2F1" />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 10, fill: '#605E5C' }}
          width={80}
        />
        <Tooltip
          formatter={(value: any) => formatMetricValue(metric, Number(value))}
          contentStyle={{ fontSize: '12px' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
          {data.map((entry, index) => {
            const isHighlightActive = highlight && highlight.dimension === dimension;
            const isHighlighted = isHighlightActive && highlight.values.has(entry.name);
            return (
              <Cell
                key={`cell-${index}`}
                fill={variant === 'grouped' ? getColor(0) : getColor(index)}
                fillOpacity={isHighlightActive ? (isHighlighted ? 1.0 : 0.4) : 1.0}
                style={{ cursor: 'pointer' }}
              />
            );
          })}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
};
