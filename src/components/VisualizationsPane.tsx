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
  SearchRegular,
  CalendarRegular,
  ShieldRegular,
  DocumentHeaderRegular,
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
    fontSize: '10px',
    color: '#605E5C',
    marginTop: '2px',
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
  { id: 'line', icon: DataLineRegular, label: 'Line', tooltip: 'Line / Area (pick variant on drop)' },
  { id: 'scatter', icon: DataScatterRegular, label: 'Scatter', tooltip: 'Scatter Chart' },
  { id: 'pie', icon: DataPieRegular, label: 'Pie', tooltip: 'Pie / Donut (pick variant on drop)' },
  { id: 'funnel', icon: DataFunnelRegular, label: 'Funnel', tooltip: 'Funnel Chart' },
  { id: 'treemap', icon: DataTreemapRegular, label: 'Treemap', tooltip: 'Treemap' },
  { id: 'card', icon: NumberSymbolSquareRegular, label: 'Card', tooltip: 'Card (pick variant on drop)' },
  { id: 'table', icon: TableRegular, label: 'Table', tooltip: 'Table' },
  { id: 'matrix', icon: GridRegular, label: 'Matrix', tooltip: 'Matrix' },
  { id: 'waterfall', icon: DataHistogramRegular, label: 'Waterfall', tooltip: 'Waterfall Chart' },
  { id: 'slicer', icon: TextBulletListSquareRegular, label: 'Slicer', tooltip: 'Slicer' },
];

const portfolioVisuals = [
  { id: 'portfolioHeaderBar', icon: DocumentHeaderRegular, label: 'Header', tooltip: 'Portfolio Header Bar' },
  { id: 'portfolioCard', icon: NumberSymbolSquareRegular, label: 'KPI', tooltip: 'Portfolio KPI Card' },
  { id: 'controversyBar', icon: DataBarHorizontalRegular, label: 'Controv.', tooltip: 'Controversy Bar Chart' },
  { id: 'entityTable', icon: TableRegular, label: 'Entities', tooltip: 'Entity Source Table' },
  { id: 'controversyTable', icon: GridRegular, label: 'Detail', tooltip: 'Controversy Detail Table' },
  { id: 'controversyBottomPanel', icon: ShieldRegular, label: 'Panel', tooltip: 'Controversy Bottom Panel' },
  { id: 'justificationSearch', icon: SearchRegular, label: 'Search', tooltip: 'Justification Search' },
  { id: 'dateRangePicker', icon: CalendarRegular, label: 'Dates', tooltip: 'Date Range Picker' },
];

// Pre-configured FFMA widgets with specific props, titles, and preferred sizes
export interface PrebuiltVisualConfig {
  type: string;
  title: string;
  props: any;
  w: number;
  h: number;
}

export const ffmaPrebuilt: Array<{
  id: string;
  icon: any;
  label: string;
  tooltip: string;
  config: PrebuiltVisualConfig;
}> = [
  {
    id: 'ffma-header', icon: DocumentHeaderRegular, label: 'Header', tooltip: 'FFMA Header Bar (fund selector, date range, controls)',
    config: { type: 'portfolioHeaderBar', title: 'Portfolio Header', props: {}, w: 24, h: 4 },
  },
  {
    id: 'ffma-sector-slicer', icon: TextBulletListSquareRegular, label: 'Sector', tooltip: 'Sector Slicer',
    config: { type: 'slicer', title: 'Sector', props: { dimension: 'Sector' }, w: 3, h: 4 },
  },
  {
    id: 'ffma-score-slicer', icon: TextBulletListSquareRegular, label: 'Score', tooltip: 'Score Slicer',
    config: { type: 'slicer', title: 'Score', props: { dimension: 'Score' }, w: 3, h: 4 },
  },
  {
    id: 'ffma-direction-slicer', icon: TextBulletListSquareRegular, label: 'Direction', tooltip: 'Change Direction Slicer',
    config: { type: 'slicer', title: 'Direction', props: { dimension: 'ChangeDirection' }, w: 3, h: 4 },
  },
  {
    id: 'ffma-search', icon: SearchRegular, label: 'Search', tooltip: 'Justification Search',
    config: { type: 'justificationSearch', title: 'Justification', props: {}, w: 3, h: 4 },
  },
  {
    id: 'ffma-kpi-unique', icon: NumberSymbolSquareRegular, label: 'Unique', tooltip: 'KPI: Unique Entity count',
    config: { type: 'portfolioCard', title: 'Unique Entity', props: { metric: 'uniqueEntity', label: 'Unique Entity' }, w: 3, h: 4 },
  },
  {
    id: 'ffma-kpi-threshold', icon: NumberSymbolSquareRegular, label: 'Thresh.', tooltip: 'KPI: Above Threshold (score >= 4)',
    config: { type: 'portfolioCard', title: 'Above Threshold', props: { metric: 'aboveThreshold', label: 'Above Threshold' }, w: 3, h: 4 },
  },
  {
    id: 'ffma-kpi-negative', icon: NumberSymbolSquareRegular, label: 'Neg Chg', tooltip: 'KPI: Negative Changes count',
    config: { type: 'portfolioCard', title: 'Negative Changes', props: { metric: 'negativeChanges', label: 'Negative Changes' }, w: 3, h: 4 },
  },
  {
    id: 'ffma-kpi-avg', icon: NumberSymbolSquareRegular, label: 'Avg Scr', tooltip: 'KPI: Average Controversy Score',
    config: { type: 'portfolioCard', title: 'Avg Score', props: { metric: 'avgScore', label: 'Avg Score' }, w: 3, h: 4 },
  },
  {
    id: 'ffma-kpi-mv', icon: NumberSymbolSquareRegular, label: 'Total MV', tooltip: 'KPI: Total Market Value',
    config: { type: 'portfolioCard', title: 'Total MV', props: { metric: 'totalMV', label: 'Total MV' }, w: 3, h: 4 },
  },
  {
    id: 'ffma-bar-group', icon: DataBarHorizontalRegular, label: 'By Group', tooltip: 'Controversy Bar Chart by Group',
    config: { type: 'controversyBar', title: 'Controversy Score Change', props: { dimension: 'Group' }, w: 10, h: 12 },
  },
  {
    id: 'ffma-bar-region', icon: DataBarHorizontalRegular, label: 'By Region', tooltip: 'Controversy Bar Chart by Region',
    config: { type: 'controversyBar', title: 'Controversy by Region', props: { dimension: 'Region' }, w: 10, h: 12 },
  },
  {
    id: 'ffma-bar-sector', icon: DataBarHorizontalRegular, label: 'By Sector', tooltip: 'Controversy Bar Chart by Sector',
    config: { type: 'controversyBar', title: 'Controversy by Sector', props: { dimension: 'Sector' }, w: 10, h: 12 },
  },
  {
    id: 'ffma-entity-table', icon: TableRegular, label: 'Entities', tooltip: 'Entity Source Table (10 rows)',
    config: { type: 'entityTable', title: 'Entity Name', props: { maxRows: 10 }, w: 14, h: 12 },
  },
  {
    id: 'ffma-detail-table', icon: GridRegular, label: 'Detail', tooltip: 'Controversy Detail Table (50 rows)',
    config: { type: 'controversyTable', title: 'Controversy Detail', props: { maxRows: 50 }, w: 24, h: 16 },
  },
  {
    id: 'ffma-bottom-panel', icon: ShieldRegular, label: 'Panel', tooltip: 'Controversy Bottom Panel (tabbed: Controversy/GSS/Weapons/NGO)',
    config: { type: 'controversyBottomPanel', title: 'Controversy Panel', props: {}, w: 24, h: 16 },
  },
  {
    id: 'ffma-date-range', icon: CalendarRegular, label: 'Dates', tooltip: 'Date Range Picker',
    config: { type: 'dateRangePicker', title: 'Event Date', props: {}, w: 4, h: 4 },
  },
];

// Shared mutable drag state – one object so all modules read/write the same reference
export const dragState = {
  visualType: null as string | null,
  prebuiltConfig: null as PrebuiltVisualConfig | null,
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
              <Text className={styles.visualLabel} style={{ pointerEvents: 'none' }}>{visual.label}</Text>
            </div>
          </Tooltip>
        ))}
      </div>
      <div className={styles.sectionHeader}>Portfolio / FFMA</div>
      <div className={styles.content}>
        {portfolioVisuals.map((visual) => (
          <Tooltip key={visual.id} content={visual.tooltip} relationship="label">
            <div
              className={styles.visualButton}
              data-testid={`visual-source-${visual.id}`}
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
              <Text className={styles.visualLabel} style={{ pointerEvents: 'none' }}>{visual.label}</Text>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
