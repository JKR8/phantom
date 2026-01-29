import React from 'react';
import { makeStyles, shorthands, Text, Tooltip } from '@fluentui/react-components';
import {
  DataHistogramRegular,
  DataAreaRegular,
  MathFormulaRegular,
} from '@fluentui/react-icons';
import { dragState } from './VisualizationsPane';

const useStyles = makeStyles({
  container: {
    height: '100%',
    backgroundColor: '#F3F2F1',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  header: {
    ...shorthands.padding('12px'),
    borderBottom: '1px solid #E1DFDD',
    fontWeight: '600',
    fontSize: '11px',
    color: '#252423',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    ...shorthands.padding('12px'),
  },
  visualButton: {
    width: '100%',
    minHeight: '56px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'white',
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.borderRadius('6px'),
    ...shorthands.padding('10px', '12px'),
    cursor: 'grab',
    transitionProperty: 'all',
    transitionDuration: '0.15s',
    ':hover': {
      backgroundColor: '#F0F6FF',
      ...shorthands.borderColor('#0078D4'),
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    ':active': {
      cursor: 'grabbing',
    },
  },
  visualIcon: {
    color: '#0078D4',
    flexShrink: 0,
  },
  visualLabel: {
    fontSize: '12px',
    color: '#323130',
    fontWeight: '500',
  },
  visualDescription: {
    fontSize: '10px',
    color: '#605E5C',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
});

const statisticalVisuals = [
  {
    id: 'boxplot',
    icon: DataAreaRegular,
    label: 'Box Plot',
    description: 'Distribution with quartiles',
    tooltip: 'Box and Whisker Plot - shows median, quartiles, and outliers'
  },
  {
    id: 'histogram',
    icon: DataHistogramRegular,
    label: 'Histogram',
    description: 'Frequency distribution',
    tooltip: 'Histogram with optional density curve overlay'
  },
  {
    id: 'violin',
    icon: DataAreaRegular,
    label: 'Violin Plot',
    description: 'KDE distribution shape',
    tooltip: 'Violin Plot with Kernel Density Estimation'
  },
  {
    id: 'regressionScatter',
    icon: MathFormulaRegular,
    label: 'Regression',
    description: 'Scatter with trend line',
    tooltip: 'Scatter Plot with Linear/Polynomial/LOESS regression'
  },
];

export const StatisticalPane: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.header}>Statistical Visuals</div>
      <div className={styles.content}>
        {statisticalVisuals.map((visual) => (
          <Tooltip key={visual.id} content={visual.tooltip} relationship="description" positioning="after">
            <div
              className={styles.visualButton}
              data-testid={`stat-pane-${visual.id}`}
              draggable
              onDragStart={(e) => {
                dragState.visualType = visual.id;
                dragState.prebuiltConfig = null;
                e.dataTransfer.setData('visualType', visual.id);
                e.dataTransfer.setData('text/plain', visual.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onDragEnd={() => {
                setTimeout(() => { dragState.visualType = null; dragState.prebuiltConfig = null; }, 100);
              }}
              unselectable="on"
            >
              <visual.icon className={styles.visualIcon} fontSize={24} style={{ pointerEvents: 'none' }} />
              <div className={styles.textContainer} style={{ pointerEvents: 'none' }}>
                <Text className={styles.visualLabel}>{visual.label}</Text>
                <Text className={styles.visualDescription}>{visual.description}</Text>
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
