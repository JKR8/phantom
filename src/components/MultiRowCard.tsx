import React, { useMemo } from 'react';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import { useThemeStore } from '../store/useThemeStore';
import { useFilteredSales, useStore } from '../store/useStore';
import { ScenarioFields, ScenarioType } from '../store/semanticLayer';
import { formatMetricValue, getMetricValue } from '../utils/chartUtils';

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
  fields?: string[];
}

export const MultiRowCard: React.FC<MultiRowCardProps> = ({ fields }) => {
  const styles = useStyles();
  const { getColor } = useThemeStore();
  const filteredSales = useFilteredSales();
  const scenario = useStore((state) => state.scenario) as ScenarioType;

  const stats = useMemo(() => {
    const defaultFields = ScenarioFields[scenario]?.filter((f) => f.role === 'Measure').slice(0, 3).map((f) => f.name) || [];
    const selectedFields = (fields && fields.length > 0 ? fields : defaultFields).filter(Boolean);

    return selectedFields.map((field) => {
      const sum = filteredSales.reduce((acc, sale) => acc + getMetricValue(sale, field), 0);
      return {
        label: field,
        value: formatMetricValue(field, sum, true),
      };
    });
  }, [filteredSales, fields, scenario]);

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
