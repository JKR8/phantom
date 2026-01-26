import React from 'react';
import { makeStyles, shorthands, Text, Tooltip } from '@fluentui/react-components';
import {
  DataBarVerticalRegular,
  DataPieRegular,
  DataLineRegular,
  TableRegular,
  NumberSymbolSquareRegular,
  TextBulletListSquareRegular,
  DataAreaRegular,
  DataScatterRegular,
  DataFunnelRegular,
  DataTreemapRegular,
  DataBarHorizontalRegular,
  DataHistogramRegular,
  DataUsageRegular,
  GridRegular,
  TextDescriptionRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    height: '100%',
    backgroundColor: '#F3F2F1',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    ...shorthands.padding('8px', '12px'),
    borderBottom: '1px solid #E1DFDD',
    fontWeight: '600',
    fontSize: '12px',
    color: '#323130',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    ...shorthands.padding('8px', '12px'),
    flexWrap: 'wrap',
  },
  visualButton: {
    width: '48px',
    height: '48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.borderRadius('4px'),
    cursor: 'grab',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    ':hover': {
      backgroundColor: '#F5F5F5',
      ...shorthands.borderColor('#0078D4'),
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  },
});

const visuals = [
  { id: 'stackedBar', icon: DataBarHorizontalRegular, label: 'Stack Bar', tooltip: 'Stacked Bar Chart' },
  { id: 'stackedColumn', icon: DataBarVerticalRegular, label: 'Stack Col', tooltip: 'Stacked Column Chart' },
  { id: 'bar', icon: DataBarHorizontalRegular, label: 'Clust Bar', tooltip: 'Clustered Bar Chart' },
  { id: 'column', icon: DataHistogramRegular, label: 'Clust Col', tooltip: 'Clustered Column Chart' },
  { id: 'line', icon: DataLineRegular, label: 'Line', tooltip: 'Line Chart' },
  { id: 'area', icon: DataAreaRegular, label: 'Area', tooltip: 'Area Chart' },
  { id: 'scatter', icon: DataScatterRegular, label: 'Scatter', tooltip: 'Scatter Chart' },
  { id: 'pie', icon: DataPieRegular, label: 'Pie', tooltip: 'Pie Chart' },
  { id: 'donut', icon: DataPieRegular, label: 'Donut', tooltip: 'Donut Chart' },
  { id: 'funnel', icon: DataFunnelRegular, label: 'Funnel', tooltip: 'Funnel Chart' },
  { id: 'treemap', icon: DataTreemapRegular, label: 'Treemap', tooltip: 'Treemap' },
  { id: 'card', icon: NumberSymbolSquareRegular, label: 'Card', tooltip: 'KPI Card' },
  { id: 'multiRowCard', icon: TextDescriptionRegular, label: 'MultiRow', tooltip: 'Multi-row Card' },
  { id: 'gauge', icon: DataUsageRegular, label: 'Gauge', tooltip: 'Gauge' },
  { id: 'table', icon: TableRegular, label: 'Table', tooltip: 'Table' },
  { id: 'matrix', icon: GridRegular, label: 'Matrix', tooltip: 'Matrix' },
  { id: 'waterfall', icon: DataHistogramRegular, label: 'Waterfall', tooltip: 'Waterfall Chart' },
  { id: 'slicer', icon: TextBulletListSquareRegular, label: 'Slicer', tooltip: 'Slicer' },
];

export const VisualizationsPane: React.FC = () => {
  const styles = useStyles();

  const handleDragStart = (e: React.DragEvent, visualId: string) => {
    e.dataTransfer.setData('visualType', visualId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Visualizations</div>
      <div className={styles.content}>
        {visuals.map((visual) => (
          <Tooltip key={visual.id} content={visual.tooltip} relationship="label">
            <div
              className={styles.visualButton}
              draggable
              onDragStart={(e) => handleDragStart(e, visual.id)}
            >
              <visual.icon className={styles.visualIcon} fontSize={24} />
              <Text className={styles.visualLabel}>{visual.label}</Text>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
