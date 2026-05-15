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
  MenuPopover,
  Switch,
  Tooltip,
  mergeClasses,
} from '@fluentui/react-components';
import {
  HomeRegular,
  AddRegular,
  DatabaseRegular,
  DocumentRegular,
  GridRegular,
  ResizeImageRegular,
  DesignIdeasRegular,
  ClipboardTextEditRegular,
  WhiteboardRegular,
  PanelRightContractRegular,
  PanelRightExpandRegular,
  ChartMultipleRegular,
} from '@fluentui/react-icons';
import { FieldsPane } from './FieldsPane';
import { PropertiesPanel } from './PropertiesPanel';
import { SpecificationPanel } from './SpecificationPanel';
import { DataModelPanel } from './DataModelPanel';
import { DataModelPane } from './DataModelPane';
import { PBIUiKitPane } from './PBIUiKitPane';
import { UserMenu } from './UserMenu';
import { SaveDashboardButton } from './SaveDashboardDialog';
import { ShareButton } from './ShareDialog';
import { ExportButton } from './ExportButton';
import { CanvasViewport } from './CanvasViewport';
import { AnnotationsLayer } from './AnnotationsLayer';
import { ZoomControls } from './ZoomControls';
import { Minimap } from './Minimap';
import { WhiteboardToolbar } from './WhiteboardToolbar';
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
  canvasAreaWhiteboard: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    overflowY: 'auto',
    position: 'relative',
    ...shorthands.padding('20px'),
  },
  rightPane: {
    width: '240px',
    borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
    overflow: 'hidden',
    height: '100%',
    boxSizing: 'border-box' as const,
    backgroundColor: '#FAFAF9',
    display: 'flex',
    flexDirection: 'column',
    transitionProperty: 'width',
    transitionDuration: '0.16s',
    transitionTimingFunction: 'ease',
  },
  rightPaneCollapsed: {
    width: '40px',
  },
  rightPaneHeader: {
    minHeight: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...shorthands.padding('4px'),
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    flexShrink: 0,
  },
  rightPaneHeaderCollapsed: {
    justifyContent: 'center',
  },
  rightPaneToggle: {
    width: '28px',
    height: '28px',
    minWidth: '28px',
  },
  rightPaneContent: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  rightPaneRailLabel: {
    writingMode: 'vertical-rl' as const,
    transform: 'rotate(180deg)',
    color: '#605E5C',
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    alignSelf: 'center',
    marginTop: '12px',
  },
  ffmaPane: {
    width: '240px',
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
  const exportMode = useStore((state) => state.exportMode);
  const setExportMode = useStore((state) => state.setExportMode);
  const useVegaRendering = useStore((state) => state.useVegaRendering);
  const setUseVegaRendering = useStore((state) => state.setUseVegaRendering);
  const canvasMode = useStore((state) => state.canvasMode);
  const setCanvasMode = useStore((state) => state.setCanvasMode);
  const canvasZoom = useStore((state) => state.canvasZoom);
  const canvasPanX = useStore((state) => state.canvasPanX);
  const canvasPanY = useStore((state) => state.canvasPanY);
  const dashboardName = useStore((state) => state.dashboardName);
  const setDashboardMeta = useStore((state) => state.setDashboardMeta);
  const [showDataModelPane, setShowDataModelPane] = React.useState(false);
  const [showDataModelFull, setShowDataModelFull] = React.useState(false);
  const [showPBIUiKit, setShowPBIUiKit] = React.useState(false);
  const [showSpec, setShowSpec] = React.useState(false);
  const [isRightPaneCollapsed, setIsRightPaneCollapsed] = React.useState(false);
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
              <Tooltip content="Toggle legacy Recharts/Vega fallback rendering" relationship="description">
                <Switch
                  checked={useVegaRendering}
                  onChange={(_, data) => setUseVegaRendering(data.checked)}
                  label={useVegaRendering ? "Legacy" : "Plot"}
                  style={{ color: 'white', marginRight: '8px' }}
                />
              </Tooltip>
              <Tooltip content="Open the upgraded visual gallery" relationship="description">
                <Button
                  appearance="subtle"
                  className={styles.topButton}
                  size="small"
                  icon={<ChartMultipleRegular />}
                  onClick={() => navigate('/visual-lab')}
                >
                  Visual Lab
                </Button>
              </Tooltip>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px', paddingLeft: '8px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                <Tooltip content="React Product Mode: unconstrained analytical app handoff" relationship="description">
                  <Button
                    appearance={exportMode === 'react' ? 'primary' : 'subtle'}
                    size="small"
                    onClick={() => setExportMode('react')}
                    style={{
                      color: exportMode === 'react' ? 'white' : 'rgba(255,255,255,0.7)',
                      minWidth: '112px',
                    }}
                  >
                    React Product
                  </Button>
                </Tooltip>
                <Tooltip content="Power BI Mode: constrain visuals and specs to realistic Power BI implementation" relationship="description">
                  <Button
                    appearance={exportMode === 'powerBi' ? 'primary' : 'subtle'}
                    size="small"
                    onClick={() => setExportMode('powerBi')}
                    style={{
                      color: exportMode === 'powerBi' ? 'white' : 'rgba(255,255,255,0.7)',
                      minWidth: '82px',
                    }}
                  >
                    Power BI
                  </Button>
                </Tooltip>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '8px', paddingLeft: '8px', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                <Tooltip content="Toggle between PBI mode (fixed canvas) and Whiteboard mode (zoom, pan, annotations)" relationship="description">
                  <Button
                    appearance={canvasMode === 'pbi' ? 'primary' : 'subtle'}
                    size="small"
                    onClick={() => setCanvasMode('pbi')}
                    style={{
                      color: canvasMode === 'pbi' ? 'white' : 'rgba(255,255,255,0.7)',
                      minWidth: '60px',
                    }}
                  >
                    Report
                  </Button>
                </Tooltip>
                <Tooltip content="Whiteboard mode: zoom, pan, and add sticky notes" relationship="description">
                  <Button
                    appearance={canvasMode === 'whiteboard' ? 'primary' : 'subtle'}
                    size="small"
                    icon={<WhiteboardRegular />}
                    onClick={() => setCanvasMode('whiteboard')}
                    style={{
                      color: canvasMode === 'whiteboard' ? 'white' : 'rgba(255,255,255,0.7)',
                      minWidth: '100px',
                    }}
                  >
                    Whiteboard
                  </Button>
                </Tooltip>
              </div>
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
              style={(showDataModelPane || showDataModelFull) ? navBtnActiveStyle : navBtnStyle}
              onClick={() => {
                setShowDataModelPane(!showDataModelPane);
                setShowDataModelFull(false);
                               setShowPBIUiKit(false);
              }}
              onDoubleClick={() => {
                setShowDataModelFull(!showDataModelFull);
                setShowDataModelPane(false);
              }}
              title="Data Model (double-click for schema view)"
            />
            <Button
              icon={<DesignIdeasRegular />}
              appearance="subtle"
              style={showPBIUiKit ? navBtnActiveStyle : navBtnStyle}
              onClick={() => { setShowPBIUiKit(!showPBIUiKit); setShowDataModelPane(false); setShowSpec(false); }}
              title="Visuals"
            />
            <Button
              icon={<ClipboardTextEditRegular />}
              appearance="subtle"
              style={showSpec ? navBtnActiveStyle : navBtnStyle}
              onClick={() => { setShowSpec(!showSpec); setShowPBIUiKit(false); setShowDataModelPane(false); }}
              title="Dashboard Specification"
            />
          </nav>
        )}
        {showDataModelPane && !readOnly && !showDataModelFull && (
          <div className={styles.ffmaPane}>
            <DataModelPane />
          </div>
        )}
        {showPBIUiKit && !readOnly && !showDataModelFull && !showDataModelPane && (
          <div className={styles.ffmaPane}>
            <PBIUiKitPane />
          </div>
        )}
        {showSpec && !readOnly && !showDataModelFull && !showDataModelPane && (
          <div className={styles.ffmaPane}>
            <SpecificationPanel />
          </div>
        )}
        {showDataModelFull && !readOnly ? (
          /* Full-screen data model view */
          <div className={styles.dataModelView}>
            <DataModelPanel />
          </div>
        ) : (
          /* Normal canvas view */
          <>
            <div className={styles.centerArea}>
              <main className={canvasMode === 'whiteboard' ? styles.canvasAreaWhiteboard : styles.canvasArea}>
                <CanvasViewport
                  annotationsLayer={
                    <AnnotationsLayer
                      zoom={canvasZoom}
                      panX={canvasPanX}
                      panY={canvasPanY}
                    />
                  }
                >
                  {children}
                </CanvasViewport>
              </main>
            </div>
            {!readOnly && (
              <div className={mergeClasses(styles.rightPane, isRightPaneCollapsed ? styles.rightPaneCollapsed : undefined)}>
                <div className={mergeClasses(styles.rightPaneHeader, isRightPaneCollapsed ? styles.rightPaneHeaderCollapsed : undefined)}>
                  <Tooltip content={isRightPaneCollapsed ? 'Show theme and fields pane' : 'Hide theme and fields pane'} relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      className={styles.rightPaneToggle}
                      icon={isRightPaneCollapsed ? <PanelRightExpandRegular /> : <PanelRightContractRegular />}
                      aria-label={isRightPaneCollapsed ? 'Show right pane' : 'Hide right pane'}
                      data-testid="right-pane-toggle"
                      onClick={() => setIsRightPaneCollapsed((value) => !value)}
                    />
                  </Tooltip>
                </div>
                {isRightPaneCollapsed ? (
                  <div className={styles.rightPaneRailLabel}>Theme</div>
                ) : (
                  <div className={styles.rightPaneContent} key={selectedItemId || 'fields'}>
                    {selectedItemId ? <PropertiesPanel /> : <FieldsPane />}
                  </div>
                )}
              </div>
            )}
            {/* Whiteboard mode controls */}
            {!readOnly && canvasMode === 'whiteboard' && (
              <>
                <WhiteboardToolbar />
                <ZoomControls />
                <Minimap />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
