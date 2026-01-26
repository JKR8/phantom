import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Title2
} from '@fluentui/react-components';
import {
  HomeRegular,
  AddRegular,
  DatabaseRegular,
  AppsRegular,
  ShareRegular,
  ArrowDownloadRegular
} from '@fluentui/react-icons';
import { FieldsPane } from './FieldsPane';
import { VisualizationsPane } from './VisualizationsPane';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
  },
  topBar: {
    height: '48px',
    backgroundColor: '#252423',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    ...shorthands.padding(0, '12px'),
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  topBarRight: {
    display: 'flex',
    gap: '8px',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  leftNav: {
    width: '48px',
    backgroundColor: '#F0F0F0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    ...shorthands.padding('12px', 0),
    gap: '20px',
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  centerArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  canvasArea: {
    flex: 1,
    backgroundColor: '#EAEAEA',
    overflowY: 'auto',
    position: 'relative',
    ...shorthands.padding('20px'),
  },
  bottomPane: {
    height: '80px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  rightPane: {
    width: '240px',
    borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
    overflowY: 'auto',
  },
  topButton: {
    color: 'white',
    ':hover': {
      backgroundColor: '#3b3a39',
      color: 'white',
    }
  }
});

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <Title2 style={{ color: 'white', fontSize: '16px' }}>Phantom - Retail Dashboard</Title2>
          <Button appearance="subtle" className={styles.topButton} size="small">File</Button>
          <Button appearance="subtle" className={styles.topButton} size="small">Export</Button>
        </div>
        <div className={styles.topBarRight}>
          <Button icon={<ShareRegular />} appearance="subtle" className={styles.topButton}>Share</Button>
          <Button icon={<ArrowDownloadRegular />} appearance="subtle" className={styles.topButton}>Get Data</Button>
        </div>
      </header>
      <div className={styles.mainContent}>
        <nav className={styles.leftNav}>
          <Button icon={<HomeRegular />} appearance="subtle" />
          <Button icon={<AddRegular />} appearance="subtle" />
          <Button icon={<DatabaseRegular />} appearance="subtle" />
          <Button icon={<AppsRegular />} appearance="subtle" />
        </nav>
        <div className={styles.centerArea}>
          <main className={styles.canvasArea}>
            {children}
          </main>
          <div className={styles.bottomPane}>
            <VisualizationsPane />
          </div>
        </div>
        <div className={styles.rightPane}>
          <FieldsPane />
        </div>
      </div>
    </div>
  );
};
