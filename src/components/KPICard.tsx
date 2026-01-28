import React, { useMemo } from 'react';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import { useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';

const useStyles = makeStyles({
  outer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'white',
  },
  accentBar: {
    width: '4px',
    flexShrink: 0,
    ...shorthands.borderRadius('2px', 0, 0, '2px'),
  },
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    ...shorthands.padding('8px', '12px'),
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '8px',
  },
  label: {
    fontSize: '11px',
    color: '#605E5C',
    fontWeight: '500',
  },
  value: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#252423',
    marginTop: '2px',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  varianceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
  },
  dot: {
    width: '8px',
    height: '8px',
    ...shorthands.borderRadius('50%'),
    flexShrink: 0,
  },
  dotPositive: {
    backgroundColor: '#107C10',
  },
  dotNegative: {
    backgroundColor: '#A4262C',
  },
  variancePercent: {
    fontWeight: '600',
    minWidth: '45px',
  },
  varianceAbsolute: {
    color: '#605E5C',
    fontSize: '10px',
  },
  positive: {
    color: '#107C10',
  },
  negative: {
    color: '#A4262C',
  }
});

interface KPICardProps {
  value?: string | number;
  label: string;
  metric?: string;
  operation?: 'sum' | 'avg' | 'count'; // Added count
  colorIndex?: number;
  manualData?: Array<{ label: string; value: number }>;
  showVariance?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({ value: explicitValue, label, metric, operation = 'sum', colorIndex, manualData, showVariance = true }) => {
  const styles = useStyles();
  const filteredData = useFilteredSales();
  const { getColor } = useThemeStore();

  const stats = useMemo(() => {
    if (!metric) return null;
    if (filteredData.length === 0) return null;

    // @ts-ignore
    const acSum = filteredData.reduce((acc, item) => acc + (item[metric] || item[metric.toLowerCase()] || 0), 0);
    
    // Attempt to get PL and PY fields
    const plKey = `${metric}PL`;
    const pyKey = `${metric}PY`;
    
    // @ts-ignore
    const plSum = filteredData.reduce((acc, item) => acc + (item[plKey] || (item[metric] || item[metric.toLowerCase()]) * 0.95 || 0), 0);
    // @ts-ignore
    const pySum = filteredData.reduce((acc, item) => acc + (item[pyKey] || (item[metric] || item[metric.toLowerCase()]) * 0.9 || 0), 0);

    let ac = acSum;
    let pl = plSum;
    let py = pySum;

    if (operation === 'avg') {
        ac = acSum / filteredData.length;
        pl = plSum / filteredData.length;
        py = pySum / filteredData.length;
    } else if (operation === 'count') {
        ac = filteredData.length;
        pl = filteredData.length; // No real target for count usually
        py = filteredData.length;
    }

    const varPY = ac - py;
    const varPYPct = py !== 0 ? (varPY / py) * 100 : 0;
    
    const varPL = ac - pl;
    const varPLPct = pl !== 0 ? (varPL / pl) * 100 : 0;

    return { ac, py, pl, varPY, varPYPct, varPL, varPLPct };
  }, [metric, operation, filteredData]);

  const formatValue = (val: number) => {
    if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toFixed(0);
  };

  const manualValue = manualData && manualData.length > 0 ? manualData[0].value : undefined;

  if (!stats && explicitValue === undefined && manualValue === undefined) return <div>No Data</div>;

  const displayValue = manualValue !== undefined ? formatValue(manualValue) : explicitValue !== undefined ? explicitValue : formatValue(stats!.ac);

  const accentColor = colorIndex !== undefined ? getColor(colorIndex) : undefined;

  return (
    <div className={styles.outer}>
      {accentColor && (
        <div className={styles.accentBar} style={{ backgroundColor: accentColor }} />
      )}
      <div className={styles.container}>
        <div className={styles.header}>
          <Text className={styles.label}>{label}</Text>
          <Text className={styles.value}>{displayValue}</Text>
        </div>

        {stats && showVariance && (
          <div className={styles.footer}>
            <div className={styles.varianceRow}>
              <div className={`${styles.dot} ${stats.varPY >= 0 ? styles.dotPositive : styles.dotNegative}`} />
              <span className={`${styles.variancePercent} ${stats.varPY >= 0 ? styles.positive : styles.negative}`}>
                {stats.varPY >= 0 ? '+' : ''}{stats.varPYPct.toFixed(1)}%
              </span>
              <span className={styles.varianceAbsolute}>
                |{stats.varPY >= 0 ? '+' : ''}{formatValue(stats.varPY)} ΔPY
              </span>
            </div>
            <div className={styles.varianceRow}>
              <div className={`${styles.dot} ${stats.varPL >= 0 ? styles.dotPositive : styles.dotNegative}`} />
              <span className={`${styles.variancePercent} ${stats.varPL >= 0 ? styles.positive : styles.negative}`}>
                {stats.varPL >= 0 ? '+' : ''}{stats.varPLPct.toFixed(1)}%
              </span>
              <span className={styles.varianceAbsolute}>
                |{stats.varPL >= 0 ? '+' : ''}{formatValue(stats.varPL)} ΔPL
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
