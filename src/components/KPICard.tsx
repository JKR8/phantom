import React, { useMemo } from 'react';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import { useThemeStore } from '../store/useThemeStore';
import { useFilteredSales } from '../store/useStore';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    ...shorthands.padding('10px'),
  },
  value: {
    fontSize: '32px',
    fontWeight: 'bold',
  },
  label: {
    fontSize: '14px',
    color: '#605E5C',
  }
});

interface KPICardProps {
  value?: string | number;
  label: string;
  metric?: 'revenue' | 'profit' | 'quantity';
  operation?: 'sum' | 'avg';
  colorIndex?: number;
}

export const KPICard: React.FC<KPICardProps> = ({ value: explicitValue, label, metric, operation = 'sum', colorIndex = 0 }) => {
  const styles = useStyles();
  const { getColor } = useThemeStore();
  const filteredSales = useFilteredSales();

  const computedValue = useMemo(() => {
    if (explicitValue !== undefined) return explicitValue;
    if (!metric) return 0;

    if (filteredSales.length === 0) return '$0';

    const sum = filteredSales.reduce((acc, sale) => acc + (sale[metric] || 0), 0);
    const result = operation === 'avg' ? sum / filteredSales.length : sum;

    // Formatting
    if (result >= 1000) {
      return `$${(result / 1000).toFixed(1)}K`;
    }
    return `$${result.toFixed(0)}`;
  }, [explicitValue, metric, operation, filteredSales]);

  return (
    <div className={styles.container}>
      <Text className={styles.value} style={{ color: getColor(colorIndex) }}>{computedValue}</Text>
      <Text className={styles.label}>{label}</Text>
    </div>
  );
};
