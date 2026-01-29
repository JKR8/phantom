import React, { useMemo } from 'react';
import { makeStyles, shorthands } from '@fluentui/react-components';
import { useFilteredSales } from '../store/useStore';

/**
 * KPI Visual - matches Power BI KPI visual appearance from mokkup template
 * Shows: Title (purple), big indicator number, goal comparison with percentage
 */

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'white',
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('4px'),
  },
  indicator: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#252423',
    fontFamily: "'Segoe UI Bold', 'Segoe UI', sans-serif",
    textAlign: 'left',
    lineHeight: '1.2',
  },
  goalRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
  },
  distance: {
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: "'Segoe UI Semibold', 'Segoe UI', sans-serif",
  },
  distancePositive: {
    color: '#93BF35', // Green from mokkup
  },
  distanceNegative: {
    color: '#A4262C', // Red for negative
  },
  goalText: {
    fontSize: '10px',
    color: '#808080', // Gray from mokkup
    fontFamily: "'Segoe UI', sans-serif",
  },
});

interface KPIProps {
  metric?: string;
  operation?: 'sum' | 'avg' | 'count';
  goalText?: string; // e.g., "vs prev" or "10,000"
  goalValue?: number; // Numeric goal for comparison
  manualValue?: number; // Override value
}

export const KPI: React.FC<KPIProps> = ({
  metric,
  operation = 'sum',
  goalText = 'vs prev',
  goalValue,
  manualValue,
}) => {
  const styles = useStyles();
  const filteredData = useFilteredSales();

  const stats = useMemo(() => {
    if (manualValue !== undefined) {
      // Use manual value with optional goal comparison
      const distance = goalValue ? ((manualValue - goalValue) / goalValue) * 100 : 0;
      return { current: manualValue, distance, hasGoal: !!goalValue };
    }

    if (!metric || filteredData.length === 0) return null;

    // Calculate current value
    // @ts-ignore
    const sum = filteredData.reduce((acc, item) => acc + (item[metric] || item[metric.toLowerCase()] || 0), 0);

    let current = sum;
    if (operation === 'avg') {
      current = sum / filteredData.length;
    } else if (operation === 'count') {
      current = filteredData.length;
    }

    // Calculate comparison (previous period approximation)
    // @ts-ignore
    const pySum = filteredData.reduce((acc, item) => acc + ((item[metric] || item[metric.toLowerCase()] || 0) * 0.9), 0);
    let previous = pySum;
    if (operation === 'avg') {
      previous = pySum / filteredData.length;
    } else if (operation === 'count') {
      previous = filteredData.length * 0.9;
    }

    // If numeric goal provided, use that instead
    const compareValue = goalValue ?? previous;
    const distance = compareValue !== 0 ? ((current - compareValue) / compareValue) * 100 : 0;

    return { current, distance, hasGoal: true };
  }, [metric, operation, filteredData, manualValue, goalValue]);

  const formatValue = (val: number) => {
    if (Math.abs(val) >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (Math.abs(val) >= 1000) return `${(val / 1000).toFixed(1)}K`;
    if (Math.abs(val) < 1 && val !== 0) return val.toFixed(2);
    return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={styles.indicator}>--</div>
      </div>
    );
  }

  const isPositive = stats.distance >= 0;

  return (
    <div className={styles.container}>
      <div className={styles.indicator}>{formatValue(stats.current)}</div>
      {stats.hasGoal && (
        <div className={styles.goalRow}>
          <span className={`${styles.distance} ${isPositive ? styles.distancePositive : styles.distanceNegative}`}>
            {isPositive ? '+' : ''}{stats.distance.toFixed(1)}%
          </span>
          <span className={styles.goalText}>{goalText}</span>
        </div>
      )}
    </div>
  );
};
