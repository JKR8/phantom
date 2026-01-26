import React, { useMemo } from 'react';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import { useThemeStore } from '../store/useThemeStore';
import { useFilteredSales } from '../store/useStore';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('12px'),
    gap: '12px',
    overflowY: 'auto'
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    borderBottom: '1px solid #f3f2f1',
    paddingBottom: '8px'
  },
  value: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  label: {
    fontSize: '12px',
    color: '#605E5C',
  }
});

interface MultiRowCardProps {
}

export const MultiRowCard: React.FC<MultiRowCardProps> = () => {
  const styles = useStyles();
  const { getColor } = useThemeStore();
  const filteredSales = useFilteredSales();

  const stats = useMemo(() => {
    const sumRevenue = filteredSales.reduce((acc, sale) => acc + sale.revenue, 0);
    const sumProfit = filteredSales.reduce((acc, sale) => acc + sale.profit, 0);
    const sumQty = filteredSales.reduce((acc, sale) => acc + sale.quantity, 0);

    return [
      { label: 'Total Sales', value: `$${(sumRevenue / 1000).toFixed(1)}K` },
      { label: 'Total Profit', value: `$${(sumProfit / 1000).toFixed(1)}K` },
      { label: 'Total Qty', value: sumQty.toLocaleString() },
    ];
  }, [filteredSales]);

  return (
    <div className={styles.container}>
      {stats.map((stat, i) => (
        <div key={stat.label} className={styles.row}>
            <Text className={styles.label}>{stat.label}</Text>
            <Text className={styles.value} style={{ color: getColor(i) }}>{stat.value}</Text>
        </div>
      ))}
    </div>
  );
};
