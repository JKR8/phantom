/**
 * VegaLineChart - Vega-Lite based line chart component
 *
 * This component renders using the same Vega-Lite spec that will be
 * exported to Power BI via Deneb, ensuring 100% visual parity.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import embed, { Result } from 'vega-embed';
import { useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { getMetricValue } from '../utils/chartUtils';
import { createLineChartSpec, createMultiLineChartSpec } from './specGenerators';

interface VegaLineChartProps {
  metric: string;
  timeGrain?: 'month' | 'quarter' | 'year';
  comparison?: 'none' | 'pl' | 'py' | 'both';
  showPoints?: boolean;
}

export const VegaLineChart: React.FC<VegaLineChartProps> = ({
  metric,
  timeGrain = 'month',
  comparison = 'none',
  showPoints = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<Result | null>(null);

  const filteredSales = useFilteredSales();
  const { getColor } = useThemeStore();

  // Aggregate data by time grain
  const data = useMemo(() => {
    const aggregation: Record<string, { actual: number; pl: number; py: number }> = {};

    filteredSales.forEach((sale) => {
      const date = new Date(sale.date);
      let key: string;

      switch (timeGrain) {
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'year':
          key = `${date.getFullYear()}`;
          break;
        default: // month
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!aggregation[key]) {
        aggregation[key] = { actual: 0, pl: 0, py: 0 };
      }

      aggregation[key].actual += getMetricValue(sale, metric);

      // Get plan value if exists
      const plMetric = `${metric}PL`;
      if (plMetric in sale) {
        aggregation[key].pl += getMetricValue(sale, plMetric);
      }

      // Get prior year value if exists
      const pyMetric = `${metric}PY`;
      if (pyMetric in sale) {
        aggregation[key].py += getMetricValue(sale, pyMetric);
      }
    });

    // Convert to date format for Vega-Lite
    const sorted = Object.entries(aggregation).sort(([a], [b]) => a.localeCompare(b));

    if (comparison === 'none') {
      return sorted.map(([period, values]) => ({
        date: periodToDate(period, timeGrain),
        value: Math.round(values.actual),
      }));
    }

    // Multi-series data for comparisons
    const multiSeries: Array<{ date: string; value: number; series: string }> = [];

    sorted.forEach(([period, values]) => {
      const date = periodToDate(period, timeGrain);
      multiSeries.push({ date, value: Math.round(values.actual), series: 'Actual' });

      if (comparison === 'pl' || comparison === 'both') {
        multiSeries.push({ date, value: Math.round(values.pl), series: 'Plan' });
      }

      if (comparison === 'py' || comparison === 'both') {
        multiSeries.push({ date, value: Math.round(values.py), series: 'Prior Year' });
      }
    });

    return multiSeries;
  }, [filteredSales, metric, timeGrain, comparison]);

  // Generate Vega-Lite spec
  const spec = useMemo(() => {
    if (comparison === 'none') {
      return createLineChartSpec(data as Array<{ date: string; value: number }>, {
        color: getColor(0),
        showPoints,
      });
    }

    return createMultiLineChartSpec(
      data as Array<{ date: string; value: number; series: string }>,
      {
        colors: [getColor(0), getColor(1), getColor(2)],
      }
    );
  }, [data, getColor, comparison, showPoints]);

  // Render Vega chart
  useEffect(() => {
    if (!containerRef.current) return;

    if (viewRef.current) {
      viewRef.current.finalize();
    }

    embed(containerRef.current, spec, {
      actions: false,
      renderer: 'svg',
      width: containerRef.current.clientWidth - 20,
      height: containerRef.current.clientHeight - 20,
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

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && viewRef.current) {
        viewRef.current.view
          .width(containerRef.current.clientWidth - 20)
          .height(containerRef.current.clientHeight - 20)
          .run();
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
 * Convert period string to ISO date string for Vega-Lite
 */
function periodToDate(period: string, grain: 'month' | 'quarter' | 'year'): string {
  if (grain === 'year') {
    return `${period}-01-01`;
  }

  if (grain === 'quarter') {
    const [year, q] = period.split('-Q');
    const month = (parseInt(q) - 1) * 3 + 1;
    return `${year}-${String(month).padStart(2, '0')}-01`;
  }

  // month
  return `${period}-01`;
}

/**
 * Export the Vega-Lite spec for use in Deneb export
 */
export function getVegaLineChartSpec(
  data: Array<{ date: string; value: number }>,
  options: { color?: string; showPoints?: boolean } = {}
) {
  return createLineChartSpec(data, options);
}
