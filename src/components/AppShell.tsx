import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Title2,
  Input,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover
} from '@fluentui/react-components';
import {
  HomeRegular,
  AddRegular,
  DatabaseRegular,
  AppsRegular,
  DocumentRegular,
  ShieldRegular,
  GridRegular,
  ResizeImageRegular,
} from '@fluentui/react-icons';
import { FieldsPane } from './FieldsPane';
import { VisualizationsPane } from './VisualizationsPane';
import { PropertiesPanel } from './PropertiesPanel';
import { FFMAPanel } from './FFMAPanel';
import { UserMenu } from './UserMenu';
import { SaveDashboardButton } from './SaveDashboardDialog';
import { ShareButton } from './ShareDialog';
import { ExportButton } from './ExportButton';
import { useStore } from '../store/useStore';
import { Templates } from '../store/templates';

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
    alignItems: 'center',
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
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  ffmaPane: {
    width: '180px',
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
    overflowY: 'auto',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  navButtonActive: {
    backgroundColor: '#D6D6D6',
  },
  topButton: {
    color: 'white',
    ':hover': {
      backgroundColor: '#3b3a39',
      color: 'white',
    }
  },
  titleEditable: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '600' as any,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    ':hover': {
      textDecorationLine: 'underline',
    },
  },
  titleInput: {
    maxWidth: '250px',
  },
});

interface AppShellProps {
  children: React.ReactNode;
  readOnly?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({ children, readOnly }) => {
  const styles = useStyles();
  const loadTemplate = useStore((state) => state.loadTemplate);
  const clearCanvas = useStore((state) => state.clearCanvas);
  const scenario = useStore((state) => state.scenario);
  const setScenario = useStore((state) => state.setScenario);
  const selectedItemId = useStore((state) => state.selectedItemId);
  const layoutMode = useStore((state) => state.layoutMode);
  const setLayoutMode = useStore((state) => state.setLayoutMode);
  const dashboardName = useStore((state) => state.dashboardName);
  const setDashboardMeta = useStore((state) => state.setDashboardMeta);
  const [showFFMA, setShowFFMA] = React.useState(false);
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState(dashboardName);

  const scenarios: Array<'Retail' | 'SaaS' | 'HR' | 'Logistics' | 'Finance' | 'Portfolio' | 'Social'> = ['Retail', 'SaaS', 'HR', 'Logistics', 'Finance', 'Portfolio', 'Social'];

  const handleTitleCommit = () => {
    const trimmed = titleDraft.trim();
    if (trimmed) {
      setDashboardMeta({ name: trimmed });
    }
    setEditingTitle(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          {editingTitle && !readOnly ? (
            <Input
              className={styles.titleInput}
              size="small"
              value={titleDraft}
              onChange={(_, data) => setTitleDraft(data.value)}
              onBlur={handleTitleCommit}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTitleCommit(); }}
              autoFocus
            />
          ) : (
            <Title2
              className={styles.titleEditable}
              style={{ color: 'white', fontSize: '16px' }}
              onClick={() => {
                if (!readOnly) {
                  setTitleDraft(dashboardName);
                  setEditingTitle(true);
                }
              }}
              title={readOnly ? undefined : 'Click to rename'}
            >
              Phantom - {dashboardName}
            </Title2>
          )}
          {!readOnly && (
            <>
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button appearance="subtle" className={styles.topButton} size="small" icon={<DocumentRegular />}>Templates</Button>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    {Templates.map(t => (
                        <MenuItem key={t.name} onClick={() => loadTemplate(t.name)}>{t.name}</MenuItem>
                    ))}
                  </MenuList>
                </MenuPopover>
              </Menu>
              <Menu>
                <MenuTrigger disableButtonEnhancement>
                  <Button appearance="subtle" className={styles.topButton} size="small" icon={<DatabaseRegular />} data-testid="scenario-dropdown">{scenario}</Button>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    {scenarios.map(s => (
                        <MenuItem key={s} onClick={() => setScenario(s)}>{s}</MenuItem>
                    ))}
                  </MenuList>
                </MenuPopover>
              </Menu>
              <Button
                appearance="subtle"
                className={styles.topButton}
                size="small"
                icon={layoutMode === 'Standard' ? <GridRegular /> : <ResizeImageRegular />}
                onClick={() => setLayoutMode(layoutMode === 'Standard' ? 'Free' : 'Standard')}
              >
                {layoutMode} Layout
              </Button>
              <Button appearance="subtle" className={styles.topButton} size="small">File</Button>
              <ExportButton />
            </>
          )}
        </div>
        <div className={styles.topBarRight}>
          {!readOnly && (
            <>
              <SaveDashboardButton />
              <ShareButton />
            </>
          )}
          <UserMenu />
        </div>
      </header>
      <div className={styles.mainContent}>
        {!readOnly && (
          <nav className={styles.leftNav}>
            <Button icon={<HomeRegular />} appearance="subtle" />
            <Button icon={<AddRegular />} appearance="subtle" onClick={clearCanvas} title="New Screen" />
            <Button icon={<DatabaseRegular />} appearance="subtle" />
            <Button icon={<AppsRegular />} appearance="subtle" />
            <Button
              icon={<ShieldRegular />}
              appearance="subtle"
              className={showFFMA ? styles.navButtonActive : undefined}
              onClick={() => setShowFFMA(!showFFMA)}
              title="FFMA Widgets"
            />
          </nav>
        )}
        {showFFMA && !readOnly && (
          <div className={styles.ffmaPane}>
            <FFMAPanel />
          </div>
        )}
        <div className={styles.centerArea}>
          <main className={styles.canvasArea}>
            {children}
          </main>
          {!readOnly && (
            <div className={styles.bottomPane}>
              <VisualizationsPane />
            </div>
          )}
        </div>
        {!readOnly && (
          <div className={styles.rightPane}>
            {selectedItemId ? <PropertiesPanel /> : <FieldsPane />}
          </div>
        )}
      </div>
    </div>
  );
};
