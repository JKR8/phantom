/**
 * Visuals Pane
 *
 * Shows universal report objects and analytical chart types in one main pane.
 */
import React from 'react';
import { Button, makeStyles, mergeClasses, shorthands, Text, Tooltip } from '@fluentui/react-components';
import { getSupportLabel, isVisualAvailableForMode, pbiUiKitVisuals, dragState, universalVisuals, VisualDefinition } from './VisualizationsPane';
import { useStore } from '../store/useStore';
import type { ExportMode } from '../types';

const useStyles = makeStyles({
  container: {
    height: '100%',
    backgroundColor: '#F3F2F1',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  header: {
    ...shorthands.padding('8px', '12px'),
    borderBottom: '1px solid #E1DFDD',
    fontWeight: '600',
    fontSize: '11px',
    color: '#252423',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  modeSwitch: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px',
    ...shorthands.padding('8px', '12px', '4px'),
  },
  modeButton: {
    minWidth: '0',
    fontSize: '11px',
  },
  modeHelp: {
    ...shorthands.padding('0', '12px', '6px'),
    fontSize: '11px',
    lineHeight: '15px',
    color: '#605E5C',
  },
  content: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px',
    ...shorthands.padding('8px', '12px'),
    flexWrap: 'wrap',
  },
  visualButton: {
    width: '52px',
    height: '52px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.borderRadius('6px'),
    cursor: 'grab',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    ':hover': {
      backgroundColor: '#F0F6FF',
      ...shorthands.borderColor('#0078D4'),
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transform: 'translateY(-1px)',
    },
    ':active': {
      cursor: 'grabbing',
    },
    position: 'relative',
  },
  approximateVisualButton: {
    ...shorthands.borderColor('#D9A300'),
  },
  visualIcon: {
    color: '#0078D4',
  },
  visualLabel: {
    fontSize: '9px',
    color: '#605E5C',
    marginTop: '2px',
    maxWidth: '48px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  },
  supportBadge: {
    position: 'absolute',
    top: '3px',
    right: '3px',
    fontSize: '8px',
    lineHeight: '10px',
    fontWeight: 700,
    color: '#605E5C',
    backgroundColor: '#F8F8F8',
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.borderRadius('3px'),
    ...shorthands.padding('0', '2px'),
  },
  approximateBadge: {
    color: '#6B4E00',
    backgroundColor: '#FFF4CE',
    ...shorthands.borderColor('#F2C94C'),
  },
  sectionHeader: {
    ...shorthands.padding('10px', '12px', '4px'),
    fontSize: '10px',
    fontWeight: '600',
    color: '#605E5C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },
  sectionHeaderWithRule: {
    borderTop: '1px solid #E1DFDD',
    marginTop: '4px',
  },
});

// Helper to safely clear drag state
const clearDragState = () => {
  if (dragState._clearTimeout) {
    clearTimeout(dragState._clearTimeout);
    dragState._clearTimeout = null;
  }
  dragState.visualType = null;
};

// Helper to schedule delayed clear (for onDragEnd)
const scheduleClearDragState = () => {
  if (dragState._clearTimeout) {
    clearTimeout(dragState._clearTimeout);
  }
  dragState._clearTimeout = setTimeout(() => {
    dragState.visualType = null;
    dragState._clearTimeout = null;
  }, 100);
};

export const PBIUiKitPane: React.FC = () => {
  const styles = useStyles();
  const exportMode = useStore((state) => state.exportMode);
  const setExportMode = useStore((state) => state.setExportMode);
  const modeHelp = exportMode === 'react'
    ? 'React Product Mode shows premium app-ready components.'
    : 'Power BI Mode hides design-only visuals and marks approximate exports.';
  const availableUniversalVisuals = universalVisuals.filter((visual) => isVisualAvailableForMode(visual, exportMode));
  const availableChartVisuals = pbiUiKitVisuals.filter((visual) => isVisualAvailableForMode(visual, exportMode));

  const renderModeButton = (mode: ExportMode, label: string) => (
    <Button
      className={styles.modeButton}
      appearance={exportMode === mode ? 'primary' : 'secondary'}
      size="small"
      onClick={() => setExportMode(mode)}
    >
      {label}
    </Button>
  );

  const renderVisualButton = (visual: VisualDefinition) => {
    const badge = getSupportLabel(visual, exportMode);
    const isApproximate = exportMode === 'powerBi' && visual.pbiSupport === 'approximate';
    const tooltip = isApproximate ? `${visual.tooltip}. Approximate Power BI export.` : visual.tooltip;

    return (
      <Tooltip key={visual.id} content={tooltip} relationship="label">
      <div
        className={mergeClasses(styles.visualButton, isApproximate ? styles.approximateVisualButton : undefined)}
        data-testid={`visual-source-${visual.id}`}
        draggable
        onDragStart={(e) => {
          clearDragState();
          dragState.visualType = visual.id;
          e.dataTransfer.setData('visualType', visual.id);
          e.dataTransfer.setData('text/plain', visual.id);
          e.dataTransfer.effectAllowed = 'copy';
        }}
        onDragEnd={() => {
          scheduleClearDragState();
        }}
        unselectable="on"
      >
        <span className={mergeClasses(styles.supportBadge, isApproximate ? styles.approximateBadge : undefined)}>
          {badge}
        </span>
        <visual.icon className={styles.visualIcon} fontSize={24} style={{ pointerEvents: 'none' }} />
        <Text className={styles.visualLabel} style={{ pointerEvents: 'none' }}>{visual.label}</Text>
      </div>
    </Tooltip>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Visuals</div>
      <div className={styles.modeSwitch}>
        {renderModeButton('react', 'React')}
        {renderModeButton('powerBi', 'Power BI')}
      </div>
      <div className={styles.modeHelp}>{modeHelp}</div>
      <div className={styles.sectionHeader}>Build</div>
      <div className={styles.content}>
        {availableUniversalVisuals.map(renderVisualButton)}
      </div>
      <div className={`${styles.sectionHeader} ${styles.sectionHeaderWithRule}`}>Charts</div>
      <div className={styles.content}>
        {availableChartVisuals.map(renderVisualButton)}
      </div>
    </div>
  );
};
