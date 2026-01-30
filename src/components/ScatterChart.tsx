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
  /** Variant type: 'default' for scatter plot, 'dotStrip' for horizontal dot strip */
  variant?: 'default' | 'dotStrip';
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  xMetric = 'revenue',
  yMetric = 'profit',
  dimension,
  manualData,
  variant = 'default',
}) => {
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
  }, [manualData, filteredSales, xMetric, yMetric, dimension, stores, products, customers]);

  // Group data by dimension for dot strip
  const dotStripData = useMemo(() => {
    if (variant !== 'dotStrip') return [];

    // Group values by category/dimension
    const grouped: Record<string, number[]> = {};
    filteredSales.forEach((sale) => {
      const key = dimension
        ? getDimensionValue(sale, dimension, { stores, products, customers })
        : 'All';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(getMetricValue(sale, xMetric));
    });

    return Object.entries(grouped).map(([name, values]) => ({
      name,
      values: values.slice(0, 20), // Limit to 20 dots per row
    }));
  }, [variant, filteredSales, dimension, xMetric, stores, products, customers]);

  // ========== DOT STRIP VARIANT ==========
  if (variant === 'dotStrip') {
    const allValues = dotStripData.flatMap(d => d.values);
    const maxVal = Math.max(...allValues, 1);
    const minVal = Math.min(...allValues, 0);
    const range = maxVal - minVal || 1;

    return (
      <div style={{ width: '100%', height: '100%', padding: '16px' }}>
        {dotStripData.map((row) => (
          <div key={row.name} style={{
            display: 'flex',
            alignItems: 'center',
            height: `${100 / dotStripData.length}%`,
            gap: '8px',
          }}>
            {/* Dimension label */}
            <div style={{
              width: '72px',
              fontSize: '12px',
              fontWeight: 400,
              color: '#64748b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {row.name}
            </div>

            {/* Dots container */}
            <div style={{
              flex: 1,
              height: '100%',
              position: 'relative',
            }}>
              {row.values.map((value, dotIndex) => {
                const leftPct = ((value - minVal) / range) * 100;
                return (
                  <div
                    key={dotIndex}
                    style={{
                      position: 'absolute',
                      left: `${leftPct}%`,
                      top: '50%',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: getColor(dotIndex % 6),
                      transform: 'translate(-50%, -50%)',
                    }}
                    title={formatMetricValue(xMetric, value)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* X-axis labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: '80px',
          paddingTop: '8px',
          fontSize: '10px',
          color: '#64748b',
        }}>
          <span>{formatMetricValue(xMetric, minVal, true)}</span>
          <span>{formatMetricValue(xMetric, maxVal, true)}</span>
        </div>
      </div>
    );
  }

  // ========== DEFAULT SCATTER VARIANT ==========
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
