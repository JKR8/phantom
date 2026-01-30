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
  CalendarLtrRegular,
  ArrowTrendingLinesRegular,
  ChartMultipleRegular,
  TargetArrowRegular,
  SlideMultipleRegular,
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

/**
 * ORIGINAL VISUALS - Bottom bar (restored)
 */
const visuals = [
  { id: 'bar', icon: DataBarHorizontalRegular, label: 'Bar', tooltip: 'Bar Chart (pick variant on drop)' },
  { id: 'column', icon: DataHistogramRegular, label: 'Column', tooltip: 'Column Chart (pick variant on drop)' },
  { id: 'line', icon: DataLineRegular, label: 'Line', tooltip: 'Line / Area / Stacked Area (pick variant on drop)' },
  { id: 'combo', icon: ChartMultipleRegular, label: 'Combo', tooltip: 'Combo Chart (Line + Column)' },
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

/**
 * PBI UI KIT 2.0 - All 29 chart types from CSS spec (docs/power-bi-chart-css.md)
 * These are shown in the PBIUiKitPane (left sidebar)
 *
 * Note: Some charts (Bar, Line, Pie, Scatter, Table, Treemap, Waterfall, Combo, Card)
 * are also in the bottom bar for quick access.
 */
export const pbiUiKitVisuals = [
  // === AREA CHARTS (CSS #1-2) ===
  { id: 'area', icon: DataAreaRegular, label: 'Area', tooltip: '1. Area Chart (Layered)' },
  { id: 'stackedArea', icon: DataAreaRegular, label: 'Stk Area', tooltip: '2. Area Chart (Stacked)' },

  // === BAR CHARTS (CSS #3-6) ===
  { id: 'bar', icon: DataBarHorizontalRegular, label: 'Bar', tooltip: '3. Bar Chart' },
  { id: 'groupedBar', icon: DataBarHorizontalRegular, label: 'Grouped', tooltip: '4. Bar Chart (Grouped)' },
  { id: 'lollipop', icon: DataBarHorizontalRegular, label: 'Lollipop', tooltip: '5. Bar Chart (Lollipop)' },
  { id: 'stackedBar', icon: DataBarHorizontalRegular, label: 'Stk Bar', tooltip: '6. Bar Chart (Stacked)' },

  // === COMPARISON CHARTS (CSS #7, 12, 26) ===
  { id: 'barbell', icon: DataBarHorizontalRegular, label: 'Barbell', tooltip: '7. Barbell Chart' },
  { id: 'diverging', icon: DataBarHorizontalRegular, label: 'Diverging', tooltip: '12. Diverging Chart' },
  { id: 'slope', icon: ArrowTrendingLinesRegular, label: 'Slope', tooltip: '26. Slope Chart' },

  // === STATISTICAL (CSS #8, 16) ===
  { id: 'boxplot', icon: DataAreaRegular, label: 'Boxplot', tooltip: '8. Boxplot Chart' },
  { id: 'histogram', icon: DataHistogramRegular, label: 'Histogram', tooltip: '16. Histogram Chart' },

  // === KPI & GAUGE (CSS #9, 10, 15) ===
  { id: 'bullet', icon: TargetArrowRegular, label: 'Bullet', tooltip: '9. Bullet Chart' },
  { id: 'card', icon: NumberSymbolSquareRegular, label: 'Card/KPI', tooltip: '10. Card/KPI' },
  { id: 'gauge', icon: GaugeRegular, label: 'Gauge', tooltip: '15. Gauge Chart' },

  // === COMBINATION (CSS #11) ===
  { id: 'combo', icon: ChartMultipleRegular, label: 'Combo', tooltip: '11. Combination Chart' },

  // === SPECIALIZED (CSS #13, 14, 24) ===
  { id: 'dotStrip', icon: DataScatterRegular, label: 'Dot Strip', tooltip: '13. Dot Strip Chart' },
  { id: 'gantt', icon: CalendarLtrRegular, label: 'Gantt', tooltip: '14. Gantt Chart' },
  { id: 'ribbon', icon: SlideMultipleRegular, label: 'Ribbon', tooltip: '24. Ribbon Chart' },

  // === LINE CHARTS (CSS #17-19) ===
  { id: 'line', icon: DataLineRegular, label: 'Line', tooltip: '17. Line Chart' },
  { id: 'lineForecast', icon: ArrowTrendingLinesRegular, label: 'Forecast', tooltip: '18. Line Chart (Forecast)' },
  { id: 'lineStepped', icon: DataLineRegular, label: 'Stepped', tooltip: '19. Line Chart (Stepped)' },

  // === MAPS (CSS #20-21) ===
  { id: 'mapBubble', icon: GlobeRegular, label: 'Bubble Map', tooltip: '20. Map Chart (Bubble)' },
  { id: 'mapChoropleth', icon: GlobeRegular, label: 'Choropleth', tooltip: '21. Map Chart (Choropleth)' },

  // === PIE CHARTS (CSS #22-23) ===
  { id: 'pie', icon: DataPieRegular, label: 'Pie', tooltip: '22. Pie Chart' },
  { id: 'donut', icon: DataPieRegular, label: 'Donut', tooltip: '23. Pie Chart (Donut)' },

  // === SCATTER (CSS #25) ===
  { id: 'scatter', icon: DataScatterRegular, label: 'Scatter', tooltip: '25. Scatter Plot Chart' },

  // === TABLE (CSS #27) ===
  { id: 'table', icon: TableRegular, label: 'Table', tooltip: '27. Table' },

  // === TREEMAP (CSS #28) ===
  { id: 'treemap', icon: DataTreemapRegular, label: 'Treemap', tooltip: '28. Treemap Chart' },

  // === WATERFALL (CSS #29) ===
  { id: 'waterfall', icon: DataHistogramRegular, label: 'Waterfall', tooltip: '29. Waterfall Chart' },
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

// Helper to render a visual button
const VisualButton: React.FC<{
  visual: { id: string; icon: any; label: string; tooltip: string };
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
        {visuals.map((visual) => (
          <VisualButton key={visual.id} visual={visual} styles={styles} />
        ))}
      </div>
    </div>
  );
};
