import React, { useMemo } from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ComposedChart,
  Scatter,
} from 'recharts';
import { useStore, useFilteredSales, useHighlight, useSetHighlight } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';
import { StableResponsiveContainer } from './StableResponsiveContainer';

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

    let result = Object.keys(aggregation1).map((name) => ({
      name,
      value1: Math.round(aggregation1[name] || 0),
      value2: Math.round(aggregation2[name] || 0),
      divergeValue: Math.round(aggregation1[name] || 0) - Math.round(aggregation2[name] || 0),
    }));

    if (sort === 'asc') {
      result.sort((a, b) => a.value1 - b.value1);
    } else if (sort === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => b.value1 - a.value1);
    }

    const limit = topN && topN !== 'All' ? Number(topN) : 5;
    if (!Number.isNaN(limit) && result.length > limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [filteredSales, dimension, metric, metric2, stores, products, customers, topN, sort]);

  const comparisonMetric = metric2 || metric;

  // ========== LOLLIPOP VARIANT ==========
  if (variant === 'lollipop') {
    return (
      <StableResponsiveContainer>
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
      </StableResponsiveContainer>
    );
  }

  // ========== BARBELL VARIANT ==========
  if (variant === 'barbell') {
    const maxVal = Math.max(...comparisonData.flatMap(d => [d.value1, d.value2]), 1);

    return (
      <div style={{ width: '100%', height: '100%', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', fontSize: '10px', color: '#475569' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getColor(0), display: 'inline-block' }} />
            {metric}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: getColor(1), display: 'inline-block' }} />
            {comparisonMetric}
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
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
                width: '92px',
                fontSize: '11px',
                color: '#334155',
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
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  borderTop: '1px solid #E2E8F0',
                  transform: 'translateY(-50%)',
                }} />
                {/* Connecting line */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: `${minPct}%`,
                  width: `${maxPct - minPct}%`,
                  height: '2px',
                  backgroundColor: '#94A3B8',
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
                  border: '1px solid #FFFFFF',
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
                  border: '1px solid #FFFFFF',
                  transform: 'translate(-50%, -50%)',
                }} />
              </div>
              <div style={{ width: '112px', display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '10px', color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
                <span>{formatMetricValue(metric, val1, true)}</span>
                <span>{formatMetricValue(comparisonMetric, val2, true)}</span>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    );
  }

  // ========== DIVERGING VARIANT ==========
  // Layout: [Left Container (metric1)] [Dimension Label] [Right Container (metric2)]
  // Uses shared scale so bars visually diverge/compare properly
  if (variant === 'diverging') {
    const maxVal = Math.max(
      ...comparisonData.map(d => d.value1),
      ...comparisonData.map(d => d.value2),
      1
    );

    return (
      <div style={{ width: '100%', height: '100%', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 92px 1fr', alignItems: 'center', fontSize: '10px', color: '#475569' }}>
          <span style={{ justifySelf: 'end' }}>{metric}</span>
          <span />
          <span>{comparisonMetric}</span>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
        {comparisonData.map((item) => {
          const pct1 = (item.value1 / maxVal) * 100; // Left bar extends from right edge
          const pct2 = (item.value2 / maxVal) * 100; // Right bar extends from left edge

          return (
            <div key={item.name} style={{
              display: 'flex',
              alignItems: 'center',
              height: `${100 / comparisonData.length}%`,
              gap: '8px',
            }}>
              {/* Left Container - metric1 bar extends from right to left */}
              <div style={{
                flex: 1,
                height: '100%',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '11.84%',
                  bottom: '11.84%',
                  right: 0,
                  width: `${pct1}%`,
                  backgroundColor: getColor(0),
                }} />
              </div>
              {/* Center dimension label */}
              <div style={{
                width: '72px',
                fontSize: '12px',
                lineHeight: '14px',
                color: '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {item.name}
              </div>
              {/* Right Container - metric2 bar extends from left to right */}
              <div style={{
                flex: 1,
                height: '100%',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '11.84%',
                  bottom: '11.84%',
                  left: 0,
                  width: `${pct2}%`,
                  backgroundColor: getColor(1),
                }} />
              </div>
              <div style={{ width: '96px', display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '10px', color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
                <span>{formatMetricValue(metric, item.value1, true)}</span>
                <span>{formatMetricValue(comparisonMetric, item.value2, true)}</span>
              </div>
            </div>
          );
        })}
        </div>
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
    <StableResponsiveContainer>
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
    </StableResponsiveContainer>
  );
};
