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
  GlobeRegular,
  GaugeRegular,
  ArrowTrendingLinesRegular,
  ChartMultipleRegular,
  TargetArrowRegular,
  SlideMultipleRegular,
  TextTRegular,
  RectangleLandscapeRegular,
} from '@fluentui/react-icons';
import type { ExportMode } from '../types';

export type PBISupport = 'safe' | 'approximate' | 'design-only';

export interface VisualDefinition {
  id: string;
  icon: any;
  label: string;
  tooltip: string;
  pbiSupport: PBISupport;
  reactReady: boolean;
}

export const getSupportLabel = (visual: VisualDefinition, exportMode: ExportMode) => {
  if (exportMode === 'react') return visual.reactReady ? 'React' : 'Design';
  if (visual.pbiSupport === 'safe') return 'PBI';
  if (visual.pbiSupport === 'approximate') return 'PBI~';
  return 'Design';
};

export const isVisualAvailableForMode = (visual: VisualDefinition, exportMode: ExportMode) =>
  exportMode === 'react' ? visual.reactReady : visual.pbiSupport !== 'design-only';

const useStyles = makeStyles({
  container: {
    height: '100%',
    backgroundColor: '#F3F2F1',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    ...shorthands.padding('8px', '12px', '4px'),
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
    ...shorthands.padding('8px', '12px', '10px'),
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

/**
 * Universal report-building controls used by the main Visuals pane.
 */
export const universalVisuals = [
  { id: 'table', icon: TableRegular, label: 'Table', tooltip: 'Sortable data table', pbiSupport: 'safe', reactReady: true },
  { id: 'matrix', icon: GridRegular, label: 'Matrix', tooltip: 'Matrix / pivot table', pbiSupport: 'safe', reactReady: true },
  { id: 'slicer', icon: TextBulletListSquareRegular, label: 'Filter', tooltip: 'Slicer / filter dropdown', pbiSupport: 'safe', reactReady: true },
  { id: 'textBox', icon: TextTRegular, label: 'Text', tooltip: 'Text box for headers, descriptions, and notes', pbiSupport: 'safe', reactReady: true },
  { id: 'banner', icon: RectangleLandscapeRegular, label: 'Title', tooltip: 'Banner / title box for report headers', pbiSupport: 'safe', reactReady: true },
] satisfies VisualDefinition[];

/**
 * Visuals pane - analytical chart types first.
 *
 * Universal objects such as tables, matrixes, slicers, text boxes, and banners
 * are rendered in the same main Visuals pane.
 */
const rawPbiUiKitVisuals = [
  // === SEABORN / OBSERVABLE CORE ===
  { id: 'bar', icon: DataBarHorizontalRegular, label: 'Ranked Bar', tooltip: 'Ranked bar chart with polished Plot defaults' },
  { id: 'column', icon: DataHistogramRegular, label: 'Column', tooltip: 'Column chart with compact labels' },
  { id: 'line', icon: DataLineRegular, label: 'Line', tooltip: 'Line chart with reference and comparison layers' },
  { id: 'area', icon: DataAreaRegular, label: 'Area', tooltip: 'Area chart with restrained analytical styling' },
  { id: 'scatter', icon: DataScatterRegular, label: 'Scatter', tooltip: 'Scatter plot with trend and reference lines' },
  { id: 'histogram', icon: DataHistogramRegular, label: 'Histogram', tooltip: 'Distribution histogram' },
  { id: 'boxplot', icon: DataHistogramRegular, label: 'Boxplot', tooltip: 'Distribution boxplot' },
  { id: 'violin', icon: DataHistogramRegular, label: 'Violin', tooltip: 'Distribution violin chart' },
  { id: 'regressionScatter', icon: DataScatterRegular, label: 'Regression', tooltip: 'Regression scatter plot' },
  { id: 'lollipop', icon: DataBarHorizontalRegular, label: 'Lollipop', tooltip: 'Lollipop ranking chart' },

  // === AREA CHARTS (CSS #1-2) ===
  { id: 'stackedArea', icon: DataAreaRegular, label: 'Stk Area', tooltip: '2. Area Chart (Stacked)' },

  // === BAR CHARTS (CSS #3-6) ===
  { id: 'groupedBar', icon: DataBarHorizontalRegular, label: 'Grouped', tooltip: '4. Bar Chart (Grouped)' },
  { id: 'stackedBar', icon: DataBarHorizontalRegular, label: 'Stk Bar', tooltip: '6. Bar Chart (Stacked)' },
  { id: 'stackedColumn', icon: DataHistogramRegular, label: 'Stk Col', tooltip: 'Stacked Column Chart' },

  // === COMPARISON CHARTS (CSS #7, 12, 26) ===
  { id: 'barbell', icon: DataBarHorizontalRegular, label: 'Barbell', tooltip: '7. Barbell Chart' },
  { id: 'diverging', icon: DataBarHorizontalRegular, label: 'Diverging', tooltip: '12. Diverging Chart' },
  { id: 'slope', icon: ArrowTrendingLinesRegular, label: 'Slope', tooltip: '26. Slope Chart' },

  // === KPI & GAUGE (CSS #9, 10, 15) ===
  { id: 'bullet', icon: TargetArrowRegular, label: 'Bullet', tooltip: '9. Bullet Chart' },
  { id: 'card', icon: NumberSymbolSquareRegular, label: 'Card/KPI', tooltip: '10. Card/KPI' },
  { id: 'kpi', icon: NumberSymbolSquareRegular, label: 'KPI', tooltip: 'KPI Visual' },
  { id: 'gauge', icon: GaugeRegular, label: 'Gauge', tooltip: '15. Gauge Chart' },

  // === COMBINATION (CSS #11) ===
  { id: 'combo', icon: ChartMultipleRegular, label: 'Combo', tooltip: '11. Combination Chart' },

  // === SPECIALIZED (CSS #24) ===
  { id: 'ribbon', icon: SlideMultipleRegular, label: 'Ribbon', tooltip: '24. Ribbon Chart' },

  // === LINE CHARTS (CSS #17-19) ===
  { id: 'lineForecast', icon: ArrowTrendingLinesRegular, label: 'Forecast', tooltip: '18. Line Chart (Forecast)' },
  { id: 'lineStepped', icon: DataLineRegular, label: 'Stepped', tooltip: '19. Line Chart (Stepped)' },

  // === MAPS (CSS #20-21) ===
  { id: 'map', icon: GlobeRegular, label: 'Map', tooltip: 'Map Chart' },
  { id: 'mapBubble', icon: GlobeRegular, label: 'Bubble Map', tooltip: '20. Map Chart (Bubble)' },
  { id: 'mapChoropleth', icon: GlobeRegular, label: 'Choropleth', tooltip: '21. Map Chart (Choropleth)' },

  // === PIE CHARTS (CSS #22-23) ===
  { id: 'pie', icon: DataPieRegular, label: 'Pie', tooltip: '22. Pie Chart' },
  { id: 'donut', icon: DataPieRegular, label: 'Donut', tooltip: '23. Pie Chart (Donut)' },

  // === FUNNEL ===
  { id: 'funnel', icon: DataFunnelRegular, label: 'Funnel', tooltip: 'Funnel Chart' },

  // === TREEMAP (CSS #28) ===
  { id: 'treemap', icon: DataTreemapRegular, label: 'Treemap', tooltip: '28. Treemap Chart' },

  // === WATERFALL (CSS #29) ===
  { id: 'waterfall', icon: DataHistogramRegular, label: 'Waterfall', tooltip: '29. Waterfall Chart' },
];

const PBI_DESIGN_ONLY_VISUALS = new Set(['histogram', 'boxplot', 'violin', 'regressionScatter', 'barbell', 'slope']);
const PBI_APPROXIMATE_VISUALS = new Set(['lollipop', 'diverging', 'bullet', 'lineForecast']);

export const pbiUiKitVisuals: VisualDefinition[] = rawPbiUiKitVisuals.map((visual) => ({
  ...visual,
  reactReady: true,
  pbiSupport: PBI_DESIGN_ONLY_VISUALS.has(visual.id)
    ? 'design-only'
    : PBI_APPROXIMATE_VISUALS.has(visual.id)
      ? 'approximate'
      : 'safe',
}));


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

// Helper to render a visual button
const VisualButton: React.FC<{
  visual: VisualDefinition;
  styles: any;
}> = ({ visual, styles }) => (
  <Tooltip content={visual.tooltip} relationship="label">
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

export const VisualizationsPane: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.header}>Visualizations</div>
      <div className={styles.content}>
        {universalVisuals.map((visual) => (
          <VisualButton key={visual.id} visual={visual} styles={styles} />
        ))}
      </div>
    </div>
  );
};
