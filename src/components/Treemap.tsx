import React, { useMemo } from 'react';
import {
  Treemap as ReTreemap,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useStore, useFilteredSales, useHighlight, useSetHighlight } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

interface TreemapProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
}

const CustomContent = (props: any) => {
    const { depth, x, y, width, height, index, colors, name, highlightSet, highlightActive } = props;
    const opacity = highlightActive ? (highlightSet?.has(name) ? 1.0 : 0.4) : 1.0;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: colors[index % colors.length],
            fillOpacity: opacity,
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
            cursor: 'pointer',
          }}
        />
        {
          width > 50 && height > 30 ? (
            <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={12} style={{ opacity }}>
              {name}
            </text>
          ) : null
        }
      </g>
    );
  };

export const Treemap: React.FC<TreemapProps> = ({ dimension, metric, manualData, topN, sort = 'desc', showOther }) => {
  const filteredSales = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const highlight = useHighlight();
  const setHighlight = useSetHighlight();
  const { getColor } = useThemeStore();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({ name: d.label, value: d.value })).sort((a, b) => b.value - a.value);
    }

    const aggregation: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      const key = getDimensionValue(sale, dimension, { stores, products, customers });
      aggregation[key] = (aggregation[key] || 0) + getMetricValue(sale, metric);
    });

    let result = Object.entries(aggregation)
        .map(([name, value]) => ({
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
  }, [manualData, filteredSales, dimension, metric, stores, products, topN, sort, showOther]);

  // Create an array of colors
  const colors = [0,1,2,3,4,5].map(i => getColor(i));
  const isHighlightActive = highlight && highlight.dimension === dimension;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReTreemap
        data={data}
        dataKey="value"
        stroke="#fff"
        fill="#8884d8"
        content={<CustomContent colors={colors} highlightSet={highlight?.values} highlightActive={isHighlightActive} />}
        onClick={(node: any) => {
          if (node && node.name) {
            setHighlight(dimension, node.name);
          }
        }}
      >
        <Tooltip formatter={(value: any) => formatMetricValue(metric, Number(value))} />
      </ReTreemap>
    </ResponsiveContainer>
  );
};
