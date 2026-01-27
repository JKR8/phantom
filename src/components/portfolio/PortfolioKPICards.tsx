import React from 'react';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import { useStore } from '../../store/useStore';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: '100%',
    width: '100%',
    backgroundColor: '#FFFFFF',
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.padding('4px', '8px'),
    boxSizing: 'border-box',
    ...shorthands.overflow('hidden'),
  },
  kpiItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px',
    ...shorthands.padding('0', '8px'),
  },
  kpiValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#323130',
    lineHeight: '1',
  },
  kpiValueRed: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#C50F1F',
    lineHeight: '1',
  },
  kpiLabel: {
    fontSize: '9px',
    color: '#605E5C',
    textAlign: 'center',
    marginTop: '2px',
    whiteSpace: 'nowrap',
  },
});

export const PortfolioKPICards: React.FC = () => {
  const styles = useStyles();
  const controversyScores = useStore((state) => state.controversyScores);

  // Calculate KPI values
  const uniqueEntities = new Set(controversyScores.map(s => s.entityId)).size;
  const aboveThreshold = controversyScores.filter(s => s.score >= 4).length;
  const negativeChanges = controversyScores.filter(s => s.scoreChange < 0).length;

  return (
    <div className={styles.container}>
      <div className={styles.kpiItem}>
        <Text className={styles.kpiValue}>{uniqueEntities.toLocaleString()}</Text>
        <Text className={styles.kpiLabel}>Unique Entity</Text>
      </div>
      <div className={styles.kpiItem}>
        <Text className={styles.kpiValueRed}>{aboveThreshold}</Text>
        <Text className={styles.kpiLabel}>Above Threshold</Text>
      </div>
      <div className={styles.kpiItem}>
        <Text className={styles.kpiValueRed}>{negativeChanges.toLocaleString()}</Text>
        <Text className={styles.kpiLabel}>Negative Changes</Text>
      </div>
    </div>
  );
};
