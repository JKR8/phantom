import React, { useMemo } from 'react';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import { useFilteredControversyScores, useFilteredPortfolioEntities } from '../../store/useStore';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    ...shorthands.padding('4px', '8px'),
    backgroundColor: 'white',
    boxSizing: 'border-box',
    ...shorthands.overflow('hidden'),
  },
  value: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#252423',
    lineHeight: 1.1,
  },
  valueRed: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#C50F1F',
    lineHeight: 1.1,
  },
  label: {
    fontSize: '9px',
    color: '#605E5C',
    fontWeight: '500',
    marginTop: '2px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  subValue: {
    fontSize: '10px',
    color: '#D4A548',
    fontWeight: '600',
    marginTop: '2px',
  },
});

interface PortfolioKPICardProps {
  metric: 'entityCount' | 'avgScore' | 'totalMV' | 'scoreChanges' | 'uniqueEntity' | 'aboveThreshold' | 'negativeChanges';
  label?: string;
}

export const PortfolioKPICard: React.FC<PortfolioKPICardProps> = ({ metric, label }) => {
  const styles = useStyles();
  const filteredScores = useFilteredControversyScores();
  const filteredEntities = useFilteredPortfolioEntities();

  const { value, displayLabel, subValue, isWarning } = useMemo(() => {
    switch (metric) {
      case 'entityCount':
      case 'uniqueEntity': {
        const uniqueEntities = new Set(filteredScores.map(s => s.entityId));
        return {
          value: uniqueEntities.size.toLocaleString(),
          displayLabel: label || 'Unique Entity',
          subValue: null,
          isWarning: false,
        };
      }
      case 'aboveThreshold': {
        const count = filteredScores.filter(s => s.score >= 4).length;
        return {
          value: count.toLocaleString(),
          displayLabel: label || 'Above Threshold',
          subValue: null,
          isWarning: true,
        };
      }
      case 'negativeChanges': {
        const count = filteredScores.filter(s => s.scoreChange < 0).length;
        return {
          value: count.toLocaleString(),
          displayLabel: label || 'Negative Changes',
          subValue: null,
          isWarning: true,
        };
      }
      case 'avgScore': {
        if (filteredScores.length === 0) {
          return { value: '0', displayLabel: label || 'Avg Score', subValue: null, isWarning: false };
        }
        const avg = filteredScores.reduce((acc, s) => acc + s.score, 0) / filteredScores.length;
        return {
          value: avg.toFixed(1),
          displayLabel: label || 'Avg Score',
          subValue: null,
          isWarning: avg >= 4,
        };
      }
      case 'totalMV': {
        const total = filteredEntities.reduce((acc, e) => acc + e.marketValue, 0);
        let formatted: string;
        if (total >= 1000000000000) {
          formatted = `${(total / 1000000000000).toFixed(1)}T`;
        } else if (total >= 1000000000) {
          formatted = `${(total / 1000000000).toFixed(1)}B`;
        } else if (total >= 1000000) {
          formatted = `${(total / 1000000).toFixed(0)}M`;
        } else {
          formatted = total.toLocaleString();
        }
        return {
          value: formatted,
          displayLabel: label || 'MV (USD)',
          subValue: null,
          isWarning: false,
        };
      }
      case 'scoreChanges': {
        const increases = filteredScores.filter(s => s.scoreChange > 0).length;
        const decreases = filteredScores.filter(s => s.scoreChange < 0).length;
        return {
          value: filteredScores.length.toString(),
          displayLabel: label || 'Score Changes',
          subValue: `+${increases} / -${decreases}`,
          isWarning: false,
        };
      }
      default:
        return { value: '-', displayLabel: label || 'Unknown', subValue: null, isWarning: false };
    }
  }, [metric, label, filteredScores, filteredEntities]);

  return (
    <div className={styles.container}>
      <Text className={isWarning ? styles.valueRed : styles.value}>{value}</Text>
      <Text className={styles.label}>{displayLabel}</Text>
      {subValue && <Text className={styles.subValue}>{subValue}</Text>}
    </div>
  );
};
