/**
 * VegaBarChart - Vega-Lite based bar chart component
 *
 * This component renders using the same Vega-Lite spec that will be
 * exported to Power BI via Deneb, ensuring 100% visual parity.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import embed, { Result } from 'vega-embed';
import { useStore, useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { getDimensionValue, getMetricValue } from '../utils/chartUtils';
import { createBarChartSpec } from './specGenerators';

interface VegaBarChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
  horizontal?: boolean;
}

export const VegaBarChart: React.FC<VegaBarChartProps> = ({
  dimension,
  metric,
  manualData,
  topN,
  sort = 'desc',
  showOther,
  horizontal = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<Result | null>(null);

  const filteredSales = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const { getColor } = useThemeStore();

  // Aggregate data (same logic as BarChart.tsx)
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
  }, [manualData, filteredSales, dimension, metric, stores, products, customers, topN, sort, showOther]);

  // Generate colors array (one per data point)
  const colors = useMemo(() => {
    return data.map((_, i) => getColor(i));
  }, [data, getColor]);

  // Generate Vega-Lite spec
  const spec = useMemo(() => {
    return createBarChartSpec(data, { horizontal, colors });
  }, [data, horizontal, colors]);

  // Render Vega chart
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous view
    if (viewRef.current) {
      viewRef.current.finalize();
    }

    embed(containerRef.current, spec, {
      actions: false,
      renderer: 'svg',
    }).then((result) => {
      viewRef.current = result;
    }).catch(console.error);

    return () => {
      if (viewRef.current) {
        viewRef.current.finalize();
        viewRef.current = null;
      }
    };
  }, [spec]);

  // Handle resize - with container sizing, just trigger resize on view
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (viewRef.current) {
        viewRef.current.view.resize().run();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
};

/**
 * Export the Vega-Lite spec for use in Deneb export
 */
export function getVegaBarChartSpec(
  data: Array<{ name: string; value: number }>,
  options: { color?: string; horizontal?: boolean } = {}
) {
  return createBarChartSpec(data, options);
}
