import React from 'react';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import { DiamondRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FFFFFF',
    ...shorthands.padding('0', '16px'),
    height: '100%',
    width: '100%',
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
  },
  icon: {
    color: '#D4A548',
    fontSize: '20px',
  },
  title: {
    color: '#1A1A2E',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.3px',
  },
});

export const PortfolioHeader: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.header}>
      <DiamondRegular className={styles.icon} />
      <Text className={styles.title}>Portfolio Monitoring</Text>
    </div>
  );
};
