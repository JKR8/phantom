import React, { useMemo } from 'react';
import {
  Treemap as ReTreemap,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useStore, useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';

interface TreemapProps {
  dimension: 'Region' | 'Category';
  metric: 'revenue' | 'profit';
  manualData?: Array<{ label: string; value: number }>;
}

const CustomContent = (props: any) => {
    const { depth, x, y, width, height, index, colors, name } = props;
  
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: colors[index % colors.length],
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {
          width > 50 && height > 30 ? (
            <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={12}>
              {name}
            </text>
          ) : null
        }
      </g>
    );
  };

export const Treemap: React.FC<TreemapProps> = ({ dimension, metric, manualData }) => {
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const { getColor } = useThemeStore();

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({ name: d.label, value: d.value })).sort((a, b) => b.value - a.value);
    }

    const aggregation: Record<string, number> = {};

    filteredSales.forEach((sale) => {
      let key = '';
      if (dimension === 'Region') {
        key = stores.find(s => s.id === sale.storeId)?.region || 'Unknown';
      } else if (dimension === 'Category') {
        key = products.find(p => p.id === sale.productId)?.category || 'Unknown';
      }

      aggregation[key] = (aggregation[key] || 0) + sale[metric];
    });

    return Object.entries(aggregation)
        .map(([name, value]) => ({
            name,
            value: Math.round(value),
        }))
        .sort((a, b) => b.value - a.value);
  }, [manualData, filteredSales, dimension, metric, stores, products]);
  
  // Create an array of colors
  const colors = [0,1,2,3,4,5].map(i => getColor(i));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReTreemap
        data={data}
        dataKey="value"
        stroke="#fff"
        fill="#8884d8"
        content={<CustomContent colors={colors} />}
      >
        <Tooltip formatter={(value: any) => `$${Number(value).toLocaleString()}`} />
      </ReTreemap>
    </ResponsiveContainer>
  );
};
