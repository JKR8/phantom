/**
 * Visuals Pane
 *
 * Shows universal report objects and analytical chart types in one main pane.
 */
import React from 'react';
import { makeStyles, shorthands, Text, Tooltip } from '@fluentui/react-components';
import { pbiUiKitVisuals, dragState, universalVisuals } from './VisualizationsPane';

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
  const renderVisualButton = (visual: { id: string; icon: any; label: string; tooltip: string }) => (
    <Tooltip key={visual.id} content={visual.tooltip} relationship="label">
      <div
        className={styles.visualButton}
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
        <visual.icon className={styles.visualIcon} fontSize={24} style={{ pointerEvents: 'none' }} />
        <Text className={styles.visualLabel} style={{ pointerEvents: 'none' }}>{visual.label}</Text>
      </div>
    </Tooltip>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>Visuals</div>
      <div className={styles.sectionHeader}>Build</div>
      <div className={styles.content}>
        {universalVisuals.map(renderVisualButton)}
      </div>
      <div className={`${styles.sectionHeader} ${styles.sectionHeaderWithRule}`}>Charts</div>
      <div className={styles.content}>
        {pbiUiKitVisuals.map(renderVisualButton)}
      </div>
    </div>
  );
};
