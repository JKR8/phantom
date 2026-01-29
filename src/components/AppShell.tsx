import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  DocumentRegular,
  GridRegular,
  ResizeImageRegular,
  MathFormulaRegular,
} from '@fluentui/react-icons';
import { FieldsPane } from './FieldsPane';
import { VisualizationsPane } from './VisualizationsPane';
import { PropertiesPanel } from './PropertiesPanel';
import { DataModelPanel } from './DataModelPanel';
import { StatisticalPane } from './StatisticalPane';
import { UserMenu } from './UserMenu';
import { SaveDashboardButton } from './SaveDashboardDialog';
import { ShareButton } from './ShareDialog';
import { ExportButton } from './ExportButton';
import { useStore } from '../store/useStore';
import { Templates } from '../store/templates';
import { useAuth } from '../auth/useAuth';

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
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    zIndex: 10,
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
    gap: '4px',
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  navButton: {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    ...shorthands.borderRadius('6px'),
    ':hover': {
      backgroundColor: '#E8E6E3',
    },
  },
  navButtonActiveStyle: {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    ...shorthands.borderRadius('6px'),
    backgroundColor: '#D6D6D6',
    position: 'relative' as const,
    '::before': {
      content: '""',
      position: 'absolute' as const,
      left: 0,
      top: '6px',
      bottom: '6px',
      width: '3px',
      backgroundColor: '#0078D4',
      ...shorthands.borderRadius('0', '2px', '2px', '0'),
    },
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
    height: '110px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
    backgroundColor: '#F3F2F1',
  },
  rightPane: {
    width: '240px',
    borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
    overflow: 'hidden',
    height: '100%',
    boxSizing: 'border-box' as const,
    backgroundColor: '#FAFAF9',
  },
  ffmaPane: {
    width: '180px',
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
    overflowY: 'auto',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  dataModelView: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#FAFAF9',
    ...shorthands.padding('20px'),
  },
  navButtonActiveLegacy: {
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

const navBtnStyle: React.CSSProperties = {
  width: 36, height: 36, minWidth: 36, borderRadius: 6,
};
const navBtnActiveStyle: React.CSSProperties = {
  ...navBtnStyle,
  backgroundColor: '#D6D6D6',
  borderLeft: '3px solid #0078D4',
};

export const AppShell: React.FC<AppShellProps> = ({ children, readOnly }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const loadTemplate = useStore((state) => state.loadTemplate);
  const clearCanvas = useStore((state) => state.clearCanvas);
  const selectedItemId = useStore((state) => state.selectedItemId);
  const layoutMode = useStore((state) => state.layoutMode);
  const setLayoutMode = useStore((state) => state.setLayoutMode);
  const selectedArchetype = useStore((state) => state.selectedArchetype);
  const setArchetype = useStore((state) => state.setArchetype);
  const dashboardName = useStore((state) => state.dashboardName);
  const setDashboardMeta = useStore((state) => state.setDashboardMeta);
  const [showDataModel, setShowDataModel] = React.useState(false);
  const [showStatistical, setShowStatistical] = React.useState(false);
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleDraft, setTitleDraft] = React.useState(dashboardName);

  const handleHomeClick = () => {
    navigate(user ? '/dashboards' : '/login');
  };

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
                  <Button
                    appearance="subtle"
                    className={styles.topButton}
                    size="small"
                    icon={layoutMode === 'Standard' ? <GridRegular /> : <ResizeImageRegular />}
                  >
                    {layoutMode === 'Standard' ? `${selectedArchetype} Layout` : 'Free Layout'}
                  </Button>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem
                      icon={<ResizeImageRegular />}
                      onClick={() => setLayoutMode('Free')}
                    >
                      Free Layout {layoutMode === 'Free' && '✓'}
                    </MenuItem>
                    <MenuItem
                      icon={<GridRegular />}
                      onClick={() => { setLayoutMode('Standard'); setArchetype('Executive'); }}
                    >
                      Executive {layoutMode === 'Standard' && selectedArchetype === 'Executive' && '✓'}
                    </MenuItem>
                    <MenuItem
                      icon={<GridRegular />}
                      onClick={() => { setLayoutMode('Standard'); setArchetype('Diagnostic'); }}
                    >
                      Diagnostic {layoutMode === 'Standard' && selectedArchetype === 'Diagnostic' && '✓'}
                    </MenuItem>
                    <MenuItem
                      icon={<GridRegular />}
                      onClick={() => { setLayoutMode('Standard'); setArchetype('Operational'); }}
                    >
                      Operational {layoutMode === 'Standard' && selectedArchetype === 'Operational' && '✓'}
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
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
            <Button icon={<HomeRegular />} appearance="subtle" style={navBtnStyle} onClick={handleHomeClick} title="My Dashboards" />
            <Button icon={<AddRegular />} appearance="subtle" style={navBtnStyle} onClick={clearCanvas} title="New Screen" />
            <Button
              icon={<DatabaseRegular />}
              appearance="subtle"
              style={showDataModel ? navBtnActiveStyle : navBtnStyle}
              onClick={() => setShowDataModel(!showDataModel)}
              title="Data Model"
            />
            <Button
              icon={<MathFormulaRegular />}
              appearance="subtle"
              style={showStatistical ? navBtnActiveStyle : navBtnStyle}
              onClick={() => setShowStatistical(!showStatistical)}
              title="Statistical Visuals"
            />
          </nav>
        )}
        {showStatistical && !readOnly && !showDataModel && (
          <div className={styles.ffmaPane}>
            <StatisticalPane />
          </div>
        )}
        {showDataModel && !readOnly ? (
          /* Full-screen data model view */
          <div className={styles.dataModelView}>
            <DataModelPanel />
          </div>
        ) : (
          /* Normal canvas view */
          <>
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
                <div key={selectedItemId || 'fields'} className="panel-transition">
                  {selectedItemId ? <PropertiesPanel /> : <FieldsPane />}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
