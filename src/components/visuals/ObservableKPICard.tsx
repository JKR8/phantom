import React, { useMemo } from 'react';
import { makeStyles, mergeClasses, shorthands, Text } from '@fluentui/react-components';
import { useFilteredSales } from '../../store/useStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  createVisualThemeFromPalette,
  formatDelta,
  formatMetric,
  formatPercent,
  prepareTimeSeriesData,
} from '../../visual-system';
import { getMetricValue } from '../../utils/chartUtils';

const useStyles = makeStyles({
  outer: {
    height: '100%',
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: '4px 1fr',
    backgroundColor: '#FFFFFF',
    ...shorthands.overflow('hidden'),
  },
  accent: {
    width: '4px',
    background: '#2563EB',
  },
  body: {
    minWidth: 0,
    minHeight: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(28px, 24%)',
    gridTemplateRows: '1fr auto',
    columnGap: '8px',
    rowGap: '3px',
    ...shorthands.padding('8px', '8px', '8px'),
    boxSizing: 'border-box',
  },
  main: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '2px',
  },
  label: {
    color: '#64748B',
    fontSize: '10px',
    fontWeight: 600,
    lineHeight: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    maxWidth: '100%',
    ...shorthands.overflow('hidden'),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  value: {
    color: '#0F172A',
    fontSize: '26px',
    fontWeight: 650,
    lineHeight: '28px',
    letterSpacing: 0,
    maxWidth: '100%',
    ...shorthands.overflow('hidden'),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sparkline: {
    minWidth: 0,
    minHeight: 0,
    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'center',
  },
  sparkSvg: {
    width: '100%',
    height: '42px',
    display: 'block',
    overflow: 'visible',
  },
  footer: {
    gridColumn: '1 / span 2',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    paddingTop: '5px',
    borderTop: '1px solid #E2E8F0',
  },
  delta: {
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: '#64748B',
    fontSize: '10px',
    lineHeight: '12px',
    whiteSpace: 'nowrap',
  },
  deltaValue: {
    fontWeight: 700,
  },
  positive: {
    color: '#059669',
  },
  negative: {
    color: '#DC2626',
  },
});

interface ObservableKPICardProps {
  value?: string | number;
  label: string;
  metric?: string;
  operation?: 'sum' | 'avg' | 'count';
  colorIndex?: number;
  manualData?: Array<{ label: string; value: number }>;
  showVariance?: boolean;
}

export const ObservableKPICard: React.FC<ObservableKPICardProps> = ({
  value: explicitValue,
  label,
  metric,
  operation = 'sum',
  colorIndex = 0,
  manualData,
  showVariance = true,
}) => {
  const styles = useStyles();
  const rows = useFilteredSales();
  const activePalette = useThemeStore((state) => state.activePalette);
  const theme = useMemo(() => createVisualThemeFromPalette(activePalette.colors), [activePalette.colors]);
  const accentColor = theme.colors.categorical[colorIndex % theme.colors.categorical.length] || theme.colors.primary;

  const stats = useMemo(() => {
    if (manualData && manualData.length > 0) {
      const ac = manualData[0].value;
      return { ac, pl: ac * 0.95, py: ac * 0.9, varPL: ac * 0.05, varPY: ac * 0.1, varPLPct: 5, varPYPct: 10 };
    }
    if (!metric || rows.length === 0) return null;

    const acSum = rows.reduce((sum, row) => sum + getMetricValue(row, metric), 0);
    const plSum = rows.reduce((sum, row) => {
      const ac = getMetricValue(row, metric);
      return sum + (getMetricValue(row, `${metric}PL`) || ac * 0.95);
    }, 0);
    const pySum = rows.reduce((sum, row) => {
      const ac = getMetricValue(row, metric);
      return sum + (getMetricValue(row, `${metric}PY`) || ac * 0.9);
    }, 0);

    const denominator = operation === 'avg' ? rows.length : 1;
    const ac = operation === 'count' ? rows.length : acSum / denominator;
    const pl = operation === 'count' ? rows.length : plSum / denominator;
    const py = operation === 'count' ? rows.length : pySum / denominator;
    const varPL = ac - pl;
    const varPY = ac - py;
    return {
      ac,
      pl,
      py,
      varPL,
      varPY,
      varPLPct: pl ? (varPL / pl) * 100 : 0,
      varPYPct: py ? (varPY / py) * 100 : 0,
    };
  }, [manualData, metric, operation, rows]);

  const sparkRows = useMemo(() => metric ? prepareTimeSeriesData(rows, metric).filter((row) => row.ac > 0) : [], [metric, rows]);
  const spark = useMemo(() => {
    if (sparkRows.length < 2) return null;
    const values = sparkRows.map((row) => row.ac);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const points = sparkRows.map((row, index) => {
      const x = (index / Math.max(1, sparkRows.length - 1)) * 100;
      const y = 38 - ((row.ac - min) / range) * 32;
      return [x, y] as const;
    });
    const line = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
    const area = `${line} L 100 42 L 0 42 Z`;
    return { line, area };
  }, [sparkRows]);

  if (!stats && explicitValue === undefined) {
    return <div style={{ padding: 12, color: '#64748B', fontSize: 12 }}>No data available</div>;
  }

  const displayValue = explicitValue !== undefined ? explicitValue : formatMetric(metric, stats?.ac || 0, true);
  const plClass = (stats?.varPL || 0) >= 0 ? styles.positive : styles.negative;
  const pyClass = (stats?.varPY || 0) >= 0 ? styles.positive : styles.negative;

  return (
    <div className={styles.outer}>
      <div className={styles.accent} style={{ backgroundColor: accentColor }} />
      <div className={styles.body}>
        <div className={styles.main}>
          <Text className={styles.label}>{label || metric || 'Metric'}</Text>
          <Text className={styles.value}>{displayValue}</Text>
        </div>
        <div className={styles.sparkline}>
          {spark && (
            <svg className={styles.sparkSvg} viewBox="0 0 100 42" role="img" aria-label={`${label} sparkline`}>
              <path d={spark.area} fill={accentColor} opacity="0.12" />
              <path d={spark.line} fill="none" stroke={accentColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        {stats && showVariance && (
          <div className={styles.footer}>
            <div className={styles.delta} title={`Plan variance ${formatDelta(metric, stats.varPL)}`}>
              <span>Plan</span>
              <span className={mergeClasses(styles.deltaValue, plClass)}>{formatPercent(stats.varPLPct)}</span>
            </div>
            <div className={styles.delta} title={`Prior year variance ${formatDelta(metric, stats.varPY)}`}>
              <span>PY</span>
              <span className={mergeClasses(styles.deltaValue, pyClass)}>{formatPercent(stats.varPYPct)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
