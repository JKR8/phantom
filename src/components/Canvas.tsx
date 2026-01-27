import React from 'react';
// @ts-ignore - @types/react-grid-layout is outdated for v2.2.2
import { GridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { makeStyles, shorthands } from '@fluentui/react-components';
import { useStore } from '../store/useStore';
import { VisualContainer } from './VisualContainer';
import { dragState } from './VisualizationsPane';
import { BarChart } from './BarChart';
import { DonutChart } from './DonutChart';
import { KPICard } from './KPICard';
import { DataTable } from './DataTable';
import { Slicer } from './Slicer';
import { LineChart } from './LineChart';
import { StackedBarChart } from './StackedBarChart';
import { StackedColumnChart } from './StackedColumnChart';
import { ClusteredColumnChart } from './ClusteredColumnChart';
import { AreaChart } from './AreaChart';
import { ScatterChart } from './ScatterChart';
import { PieChart } from './PieChart';
import { FunnelChart } from './FunnelChart';
import { Treemap } from './Treemap';
import { GaugeChart } from './GaugeChart';
import { MultiRowCard } from './MultiRowCard';
import { Matrix } from './Matrix';
import { WaterfallChart } from './WaterfallChart';
// Portfolio-specific components
import {
  ControversyBarChart,
  EntitySourceTable,
  ControversyDetailTable,
  PortfolioKPICard,
  PortfolioHeader,
  DateRangePicker,
  PortfolioHeaderBar,
  ControversyBottomPanel,
  JustificationSearch,
  PortfolioKPICards,
} from './portfolio';

const GRID_COLS = 24;
const ROW_HEIGHT = 40;

const useStyles = makeStyles({
  canvas: {
    backgroundColor: '#E8E8E8',
    minHeight: '600px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    ...shorthands.margin('0', 'auto'),
    width: '100%',
    position: 'relative',
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
  },
});

export const Canvas: React.FC = () => {
  const styles = useStyles();
  const { width, containerRef, mounted } = useContainerWidth();
  const items = useStore((state) => state.items);
  const scenario = useStore((state) => state.scenario);
  const updateLayout = useStore((state) => state.updateLayout);
  const addItem = useStore((state) => state.addItem);
  const removeItem = useStore((state) => state.removeItem);
  const selectedItemId = useStore((state) => state.selectedItemId);
  const selectItem = useStore((state) => state.selectItem);


  const handleDrop = (_layout: any, item: any, e: any) => {
    // Use the global dragged type since dataTransfer may not be accessible
    const event = e?.nativeEvent || e;
    const visualType = dragState.visualType ||
                       event?.dataTransfer?.getData?.('visualType') ||
                       event?.dataTransfer?.getData?.('text/plain');

    if (!visualType) return;

    // Get position from drop, default to 0,0 if not provided
    const x = typeof item?.x === 'number' ? item.x : 0;
    const y = typeof item?.y === 'number' ? item.y : 0;

    const id = `visual-${Date.now()}`;

    // If a pre-built config was dragged, use it directly
    if (dragState.prebuiltConfig) {
      const cfg = dragState.prebuiltConfig;
      const w = cfg.w;
      const h = cfg.h;
      setTimeout(() => {
        addItem({
          id,
          type: cfg.type as any,
          title: cfg.title,
          layout: { x, y, w, h },
          props: { ...cfg.props },
        });
      }, 0);
      return;
    }

    const w = (typeof item?.w === 'number' && item.w >= 2) ? item.w : 8;
    const h = (typeof item?.h === 'number' && item.h >= 2) ? item.h : 4;

    let props: any = {};
    let title = 'New Visual';

    switch (visualType) {
      case 'bar':
        props = { dimension: 'Region', metric: 'revenue' };
        title = 'Clustered Bar Chart';
        break;
      case 'column':
        props = { dimension: 'Region', metric: 'revenue' };
        title = 'Clustered Column Chart';
        break;
      case 'stackedBar':
        props = { dimension: 'Region', metric: 'revenue' };
        title = 'Stacked Bar Chart';
        break;
      case 'stackedColumn':
        props = { dimension: 'Region', metric: 'revenue' };
        title = 'Stacked Column Chart';
        break;
      case 'line':
        props = { metric: 'revenue' };
        title = 'Line Chart';
        break;
      case 'area':
        props = { metric: 'revenue' };
        title = 'Area Chart';
        break;
      case 'scatter':
        props = { xMetric: 'revenue', yMetric: 'profit' };
        title = 'Scatter Chart';
        break;
      case 'pie':
        props = { dimension: 'Category', metric: 'revenue' };
        title = 'Pie Chart';
        break;
      case 'donut':
        props = { dimension: 'Category', metric: 'revenue' };
        title = 'Donut Chart';
        break;
      case 'funnel':
        props = { dimension: 'Region', metric: 'revenue' };
        title = 'Funnel Chart';
        break;
      case 'treemap':
        props = { dimension: 'Category', metric: 'revenue' };
        title = 'Treemap';
        break;
      case 'card':
        props = { metric: 'revenue', operation: 'sum', label: 'KPI' };
        title = 'KPI';
        break;
      case 'multiRowCard':
        props = {};
        title = 'Multi-row Card';
        break;
      case 'gauge':
        props = { metric: 'revenue', target: 2000000 };
        title = 'Gauge';
        break;
      case 'table':
        props = { maxRows: 100 };
        title = 'Data Table';
        break;
      case 'matrix':
        props = {};
        title = 'Matrix';
        break;
      case 'waterfall':
        props = { dimension: 'Region', metric: 'revenue' };
        title = 'Waterfall Chart';
        break;
      case 'slicer':
        props = { dimension: 'Store' };
        title = 'Slicer';
        break;
      // Portfolio / FFMA visuals
      case 'controversyBar':
        props = {};
        title = 'Controversy Bar Chart';
        break;
      case 'entityTable':
        props = {};
        title = 'Entity Source Table';
        break;
      case 'controversyTable':
        props = {};
        title = 'Controversy Detail Table';
        break;
      case 'portfolioCard':
        props = { metric: 'uniqueEntity', label: 'Unique Entity' };
        title = 'Portfolio KPI';
        break;
      case 'portfolioHeaderBar':
        props = {};
        title = 'Portfolio Header';
        break;
      case 'controversyBottomPanel':
        props = {};
        title = 'Controversy Panel';
        break;
      case 'justificationSearch':
        props = {};
        title = 'Justification Search';
        break;
      case 'dateRangePicker':
        props = {};
        title = 'Date Range';
        break;
    }

    // Use setTimeout to let the grid finish its internal state update
    // before adding the new item to prevent the red placeholder issue
    setTimeout(() => {
      addItem({
        id,
        type: visualType as any,
        title,
        layout: { x, y, w, h },
        props,
      });
    }, 0);
  };

  const generateLayout = () => {
    return items.map((item) => ({
      i: item.id,
      x: item.layout.x,
      y: item.layout.y,
      w: item.layout.w,
      h: item.layout.h,
      minW: 1,
      minH: 2,
      isDraggable: true,
      isResizable: true,
      static: false,
    }));
  };

  const renderVisual = (item: any) => {
    switch (item.type) {
      case 'bar':
        return <BarChart {...item.props} />;
      case 'column':
        return <ClusteredColumnChart {...item.props} />;
      case 'stackedBar':
        return <StackedBarChart {...item.props} />;
      case 'stackedColumn':
        return <StackedColumnChart {...item.props} />;
      case 'line':
        return <LineChart {...item.props} />;
      case 'area':
        return <AreaChart {...item.props} />;
      case 'scatter':
        return <ScatterChart {...item.props} />;
      case 'pie':
        return <PieChart {...item.props} />;
      case 'donut':
        return <DonutChart {...item.props} />;
      case 'funnel':
        return <FunnelChart {...item.props} />;
      case 'treemap':
        return <Treemap {...item.props} />;
      case 'gauge':
        return <GaugeChart {...item.props} />;
      case 'card':
        return <KPICard {...item.props} />;
      case 'multiRowCard':
        return <MultiRowCard {...item.props} />;
      case 'table':
        return <DataTable {...item.props} />;
      case 'matrix':
        return <Matrix {...item.props} />;
      case 'waterfall':
        return <WaterfallChart {...item.props} />;
      case 'slicer':
        return <Slicer {...item.props} />;
      case 'controversyBar':
        return <ControversyBarChart {...item.props} />;
      case 'entityTable':
        return <EntitySourceTable {...item.props} />;
      case 'controversyTable':
        return <ControversyDetailTable {...item.props} />;
      case 'portfolioCard':
        return <PortfolioKPICard {...item.props} />;
      case 'portfolioHeader':
        return <PortfolioHeader />;
      case 'dateRangePicker':
        return <DateRangePicker {...item.props} />;
      case 'portfolioHeaderBar':
        return <PortfolioHeaderBar />;
      case 'controversyBottomPanel':
        return <ControversyBottomPanel />;
      case 'justificationSearch':
        return <JustificationSearch />;
      case 'portfolioKPICards':
        return <PortfolioKPICards />;
      default:
        return <div>Unknown Visual</div>;
    }
  };

  const onLayoutChange = (layout: any) => {
    if (mounted) {
      updateLayout(layout);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas background
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('layout')) {
      selectItem(null);
    }
  };

  return (
    <div
      className={styles.canvas}
      ref={containerRef as React.RefObject<HTMLDivElement>}
      onClick={handleCanvasClick}
      onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'copy';
      }}
    >
      {mounted && width > 0 && (
        <GridLayout
          className="layout"
          layout={generateLayout()}
          width={width}
          gridConfig={{
            cols: GRID_COLS,
            rowHeight: ROW_HEIGHT,
            margin: [12, 12],
            containerPadding: [12, 12]
          }}
          dragConfig={{ handle: '.visual-header' }}
          resizeConfig={{
            enabled: true,
            handles: ['se', 'sw', 'ne', 'nw', 'e', 'w', 'n', 's']
          }}
          dropConfig={{
            enabled: true,
            defaultItem: { w: 8, h: 4 }
          }}
          onLayoutChange={onLayoutChange}
          onDrop={handleDrop}
        >
          {items.map((item) => {
            // Hide menu for slicers and search controls in Portfolio scenario
            const hideMenu = scenario === 'Portfolio' && (item.type === 'slicer' || item.type === 'justificationSearch');
            return (
              <div key={item.id}>
                {item.type === 'portfolioHeader' || item.type === 'portfolioHeaderBar' || item.type === 'controversyBottomPanel' || item.type === 'portfolioKPICards' ? (
                  // These components render without visual container wrapper
                  renderVisual(item)
                ) : (
                  <VisualContainer
                    title={item.title}
                    onRemove={() => removeItem(item.id)}
                    hideMenu={hideMenu}
                    isSelected={selectedItemId === item.id}
                    onSelect={() => selectItem(item.id)}
                    itemId={item.id}
                  >
                    {renderVisual(item)}
                  </VisualContainer>
                )}
              </div>
            );
          })}
        </GridLayout>
      )}
    </div>
  );
};