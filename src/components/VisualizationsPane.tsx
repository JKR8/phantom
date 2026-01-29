import React from 'react';
import { makeStyles, shorthands, Text, Tooltip } from '@fluentui/react-components';
import {
  DataPieRegular,
  DataLineRegular,
  TableRegular,
  NumberSymbolSquareRegular,
  TextBulletListSquareRegular,
  DataScatterRegular,
  DataFunnelRegular,
  DataTreemapRegular,
  DataBarHorizontalRegular,
  DataHistogramRegular,
  GridRegular,
  DataAreaRegular,
  MathFormulaRegular,
  GlobeRegular,
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
    color: '#252423',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
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
    ...shorthands.padding('4px', '12px'),
    fontSize: '10px',
    fontWeight: '600',
    color: '#605E5C',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    borderTop: '1px solid #E1DFDD',
    marginTop: '4px',
  },
});

const visuals = [
  { id: 'bar', icon: DataBarHorizontalRegular, label: 'Bar', tooltip: 'Bar Chart (pick variant on drop)' },
  { id: 'column', icon: DataHistogramRegular, label: 'Column', tooltip: 'Column Chart (pick variant on drop)' },
  { id: 'line', icon: DataLineRegular, label: 'Line', tooltip: 'Line / Area / Stacked Area (pick variant on drop)' },
  { id: 'combo', icon: DataHistogramRegular, label: 'Combo', tooltip: 'Combo Chart (Line + Column)' },
  { id: 'scatter', icon: DataScatterRegular, label: 'Scatter', tooltip: 'Scatter Chart' },
  { id: 'pie', icon: DataPieRegular, label: 'Pie', tooltip: 'Pie / Donut (pick variant on drop)' },
  { id: 'funnel', icon: DataFunnelRegular, label: 'Funnel', tooltip: 'Funnel Chart' },
  { id: 'treemap', icon: DataTreemapRegular, label: 'Treemap', tooltip: 'Treemap' },
  { id: 'map', icon: GlobeRegular, label: 'Map', tooltip: 'Filled Map' },
  { id: 'card', icon: NumberSymbolSquareRegular, label: 'Card', tooltip: 'Card (pick variant on drop)' },
  { id: 'kpi', icon: NumberSymbolSquareRegular, label: 'KPI', tooltip: 'KPI Visual (Power BI style)' },
  { id: 'table', icon: TableRegular, label: 'Table', tooltip: 'Table' },
  { id: 'matrix', icon: GridRegular, label: 'Matrix', tooltip: 'Matrix' },
  { id: 'waterfall', icon: DataHistogramRegular, label: 'Waterfall', tooltip: 'Waterfall Chart' },
  { id: 'slicer', icon: TextBulletListSquareRegular, label: 'Slicer', tooltip: 'Slicer' },
];

const statisticalVisuals = [
  { id: 'boxplot', icon: DataAreaRegular, label: 'Box', tooltip: 'Box and Whisker Plot' },
  { id: 'histogram', icon: DataHistogramRegular, label: 'Hist.', tooltip: 'Histogram with density curve' },
  { id: 'violin', icon: DataAreaRegular, label: 'Violin', tooltip: 'Violin Plot with KDE' },
  { id: 'regressionScatter', icon: MathFormulaRegular, label: 'Regr.', tooltip: 'Scatter with Regression Line' },
];


// Shared mutable drag state – one object so all modules read/write the same reference
export const dragState = {
  visualType: null as string | null,
  _clearTimeout: null as ReturnType<typeof setTimeout> | null,
};

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

export const VisualizationsPane: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.header}>Visualizations</div>
      <div className={styles.content}>
        {visuals.map((visual) => (
          <Tooltip key={visual.id} content={visual.tooltip} relationship="label">
            <div
              className={styles.visualButton}
              data-testid={`visual-source-${visual.id}`}
              draggable
              onDragStart={(e) => {
                clearDragState(); // Clear any pending timeout
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
        ))}
      </div>
      <div className={styles.sectionHeader}>Statistical</div>
      <div className={styles.content}>
        {statisticalVisuals.map((visual) => (
          <Tooltip key={visual.id} content={visual.tooltip} relationship="label">
            <div
              className={styles.visualButton}
              data-testid={`visual-source-${visual.id}`}
              draggable
              onDragStart={(e) => {
                clearDragState(); // Clear any pending timeout
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
        ))}
      </div>
    </div>
  );
};
