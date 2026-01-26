import React from 'react';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import { MoreHorizontalRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding('4px', '8px'),
    cursor: 'grab',
    ':active': {
      cursor: 'grabbing',
    }
  },
  title: {
    fontSize: '12px',
    fontWeight: 'semibold',
    color: '#323130',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  }
});

interface VisualContainerProps {
  title: string;
  children: React.ReactNode;
}

export const VisualContainer: React.FC<VisualContainerProps> = ({ title, children }) => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <div className={`${styles.header} visual-header`}>
        <Text className={styles.title}>{title}</Text>
        <MoreHorizontalRegular fontSize={16} style={{ cursor: 'pointer' }} />
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
