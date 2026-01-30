/**
 * VegaKPICard - Vega-Lite based KPI card component
 *
 * Renders a KPI card using Vega-Lite text marks.
 * Same spec exports to Power BI via Deneb = identical rendering.
 */

import React, { useEffect, useRef, useMemo } from 'react';
import embed, { Result } from 'vega-embed';
import { useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { createKPISpec } from './specGenerators';

interface VegaKPICardProps {
  label: string;
  metric?: string;
  operation?: 'sum' | 'avg' | 'count';
  colorIndex?: number;
  showVariance?: boolean;
}

export const VegaKPICard: React.FC<VegaKPICardProps> = ({
  label,
  metric,
  operation = 'sum',
  colorIndex = 0,
  showVariance = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<Result | null>(null);

  const filteredData = useFilteredSales();
  const { getColor } = useThemeStore();

  // Calculate KPI values
  const stats = useMemo(() => {
    if (!metric || filteredData.length === 0) return null;

    const acSum = filteredData.reduce((acc, item: any) =>
      acc + (item[metric] || item[metric.toLowerCase()] || 0), 0);

    const plKey = `${metric}PL`;
    const pyKey = `${metric}PY`;

    const plSum = filteredData.reduce((acc, item: any) =>
      acc + (item[plKey] || (item[metric] || 0) * 0.95), 0);
    const pySum = filteredData.reduce((acc, item: any) =>
      acc + (item[pyKey] || (item[metric] || 0) * 0.9), 0);

    let ac = acSum;
    let pl = plSum;
    let py = pySum;

    if (operation === 'avg') {
      ac = acSum / filteredData.length;
      pl = plSum / filteredData.length;
      py = pySum / filteredData.length;
    } else if (operation === 'count') {
      ac = filteredData.length;
      pl = filteredData.length;
      py = filteredData.length;
    }

    const varPY = ac - py;
    const varPYPct = py !== 0 ? (varPY / py) * 100 : 0;
    const varPL = ac - pl;
    const varPLPct = pl !== 0 ? (varPL / pl) * 100 : 0;

    return { ac, varPYPct, varPLPct };
  }, [metric, operation, filteredData]);

  // Format value for display
  const formatValue = (val: number): string => {
    if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toFixed(0);
  };

  // Generate Vega-Lite spec
  const spec = useMemo(() => {
    if (!stats) return null;

    return createKPISpec({
      value: formatValue(stats.ac),
      label,
      varPY: showVariance ? stats.varPYPct : undefined,
      varPL: showVariance ? stats.varPLPct : undefined,
      accentColor: getColor(colorIndex),
    });
  }, [stats, label, showVariance, getColor, colorIndex]);

  // Render Vega chart
  useEffect(() => {
    if (!containerRef.current || !spec) return;

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

  if (!stats) {
    return <div style={{ padding: '10px', color: '#666' }}>No Data</div>;
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
      }}
    />
  );
};
