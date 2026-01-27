import React from 'react';
import { makeStyles, shorthands, Text, Tooltip } from '@fluentui/react-components';
import { ffmaPrebuilt, dragState, PrebuiltVisualConfig } from './VisualizationsPane';

const useStyles = makeStyles({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#F7F9FB',
    borderRight: '1px solid #E1DFDD',
  },
  header: {
    ...shorthands.padding('10px', '12px'),
    fontWeight: '600',
    fontSize: '12px',
    color: '#1B5E91',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #D4DFE9',
    backgroundColor: '#EAF0F6',
    flexShrink: 0,
  },
  section: {
    ...shorthands.padding('4px', '8px', '0'),
    fontSize: '10px',
    fontWeight: '600',
    color: '#605E5C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.4px',
    marginTop: '8px',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    ...shorthands.padding('6px', '8px'),
  },
  item: {
    width: '48px',
    height: '48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4F8',
    ...shorthands.border('1px', 'solid', '#B4C9DE'),
    ...shorthands.borderRadius('4px'),
    cursor: 'grab',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    ':hover': {
      backgroundColor: '#E1EBF5',
      ...shorthands.borderColor('#0078D4'),
      boxShadow: '0 2px 4px rgba(0,120,212,0.15)',
    },
    ':active': {
      cursor: 'grabbing',
    },
  },
  icon: {
    color: '#1B5E91',
  },
  label: {
    fontSize: '8px',
    color: '#605E5C',
    marginTop: '2px',
    textAlign: 'center' as const,
  },
});

const groups: Array<{ title: string; ids: string[] }> = [
  { title: 'Layout', ids: ['ffma-header', 'ffma-date-range'] },
  { title: 'Filters', ids: ['ffma-sector-slicer', 'ffma-score-slicer', 'ffma-direction-slicer', 'ffma-search'] },
  { title: 'KPIs', ids: ['ffma-kpi-unique', 'ffma-kpi-threshold', 'ffma-kpi-negative', 'ffma-kpi-avg', 'ffma-kpi-mv'] },
  { title: 'Charts', ids: ['ffma-bar-group', 'ffma-bar-region', 'ffma-bar-sector'] },
  { title: 'Tables & Panels', ids: ['ffma-entity-table', 'ffma-detail-table', 'ffma-bottom-panel'] },
];

const itemMap = new Map(ffmaPrebuilt.map((item) => [item.id, item]));

export const FFMAPanel: React.FC = () => {
  const styles = useStyles();

  const handleDragStart = (e: React.DragEvent, config: PrebuiltVisualConfig) => {
    dragState.visualType = config.type;
    dragState.prebuiltConfig = config;
    e.dataTransfer.setData('visualType', config.type);
    e.dataTransfer.setData('text/plain', config.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setTimeout(() => {
      dragState.visualType = null;
      dragState.prebuiltConfig = null;
    }, 100);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>FFMA Widgets</div>
      {groups.map((group) => (
        <React.Fragment key={group.title}>
          <div className={styles.section}>{group.title}</div>
          <div className={styles.grid}>
            {group.ids.map((id) => {
              const item = itemMap.get(id);
              if (!item) return null;
              return (
                <Tooltip key={item.id} content={item.tooltip} relationship="label">
                  <div
                    className={styles.item}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.config)}
                    onDragEnd={handleDragEnd}
                    unselectable="on"
                  >
                    <item.icon className={styles.icon} fontSize={24} style={{ pointerEvents: 'none' }} />
                    <Text className={styles.label} style={{ pointerEvents: 'none' }}>{item.label}</Text>
                  </div>
                </Tooltip>
              );
            })}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};
