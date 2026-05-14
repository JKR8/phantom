import React, { useMemo } from 'react';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import { useFilteredSales, useHighlight, useSetHighlight, useStore } from '../../store/useStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  createVisualThemeFromPalette,
  getVisualColor,
  prepareCategoricalData,
} from '../../visual-system';

const useStyles = makeStyles({
  root: {
    height: '100%',
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(86px, 34%)',
    gap: '8px',
    ...shorthands.padding('8px', '10px'),
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
    ...shorthands.overflow('hidden'),
  },
  chartWrap: {
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    display: 'block',
  },
  legend: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '6px',
    ...shorthands.overflow('hidden'),
  },
  legendItem: {
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: '8px minmax(0, 1fr)',
    gap: '6px',
    alignItems: 'center',
  },
  swatch: {
    width: '8px',
    height: '8px',
    ...shorthands.borderRadius('999px'),
  },
  legendText: {
    fontSize: '11px',
    color: '#475569',
    lineHeight: '13px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  centerValue: {
    fontSize: '18px',
    fontWeight: 700,
    fill: '#0F172A',
    textAnchor: 'middle',
  },
  centerLabel: {
    fontSize: '9px',
    fontWeight: 600,
    fill: '#64748B',
    textAnchor: 'middle',
    textTransform: 'uppercase',
  },
});

interface ObservableDonutChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
  donut?: boolean;
}

const polar = (cx: number, cy: number, radius: number, angle: number) => ({
  x: cx + radius * Math.cos(angle),
  y: cy + radius * Math.sin(angle),
});

const arcPath = (cx: number, cy: number, outer: number, inner: number, start: number, end: number) => {
  const large = end - start > Math.PI ? 1 : 0;
  const p0 = polar(cx, cy, outer, start);
  const p1 = polar(cx, cy, outer, end);

  if (inner <= 0) {
    return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${outer} ${outer} 0 ${large} 1 ${p1.x} ${p1.y} Z`;
  }

  const p2 = polar(cx, cy, inner, end);
  const p3 = polar(cx, cy, inner, start);
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${p3.x} ${p3.y}`,
    'Z',
  ].join(' ');
};

export const ObservableDonutChart: React.FC<ObservableDonutChartProps> = ({
  dimension,
  metric,
  manualData,
  topN,
  sort = 'desc',
  showOther = true,
  donut = true,
}) => {
  const styles = useStyles();
  const filteredRows = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const highlight = useHighlight();
  const setHighlight = useSetHighlight();
  const activePalette = useThemeStore((state) => state.activePalette);
  const theme = useMemo(() => createVisualThemeFromPalette(activePalette.colors), [activePalette.colors]);

  const prepared = useMemo(() => prepareCategoricalData(filteredRows, {
    dimension,
    metric,
    manualData,
    limit: topN ?? 5,
    sort,
    showOther,
    stores,
    products,
    customers,
  }), [customers, dimension, filteredRows, manualData, metric, products, showOther, sort, stores, topN]);

  const rows = prepared.rows.filter((row) => row.value > 0);
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const isHighlightActive = highlight?.dimension === dimension && highlight.values.size > 0;
  let cursor = -Math.PI / 2;

  if (rows.length === 0 || total <= 0) {
    return <div style={{ padding: 12, color: '#64748B', fontSize: 12 }}>No data available</div>;
  }

  return (
    <div className={styles.root}>
      <div className={styles.chartWrap}>
        <svg className={styles.svg} viewBox="0 0 220 170" role="img" aria-label={`${dimension} share by ${metric}`}>
          {rows.map((row, index) => {
            const angle = (row.value / total) * Math.PI * 2;
            const start = cursor;
            const end = cursor + angle;
            cursor = end;
            const highlighted = !isHighlightActive || highlight?.values.has(row.label);
            return (
              <path
                key={row.key}
                d={arcPath(86, 84, 68, donut ? 42 : 0, start, end)}
                fill={getVisualColor(index, theme)}
                opacity={highlighted ? 0.92 : 0.28}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onClick={(event) => setHighlight(dimension, row.label, event.ctrlKey || event.metaKey)}
              >
                <title>{`${row.label}\n${row.formattedValue}`}</title>
              </path>
            );
          })}
          {donut && (
            <>
              <text x="86" y="80" className={styles.centerValue}>{prepared.rows.length}</text>
              <text x="86" y="96" className={styles.centerLabel}>groups</text>
            </>
          )}
        </svg>
      </div>
      <div className={styles.legend}>
        {rows.slice(0, 6).map((row, index) => (
          <div key={row.key} className={styles.legendItem} title={`${row.label}: ${row.formattedValue}`}>
            <span className={styles.swatch} style={{ backgroundColor: getVisualColor(index, theme) }} />
            <Text className={styles.legendText}>{row.label}</Text>
          </div>
        ))}
      </div>
    </div>
  );
};

