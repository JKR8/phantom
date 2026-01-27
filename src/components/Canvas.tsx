import React from 'react';
// @ts-ignore - @types/react-grid-layout is outdated for v2.2.2
import { GridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { makeStyles, shorthands } from '@fluentui/react-components';
import { useStore } from '../store/useStore';
import { VisualContainer } from './VisualContainer';
import { currentDraggedVisualType } from './VisualizationsPane';
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

const GRID_COLS = 12;
const ROW_HEIGHT = 40;

const useStyles = makeStyles({
  canvas: {
    backgroundColor: '#FFFFFF',
    minHeight: '600px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    ...shorthands.margin('0', 'auto'),
    width: '100%',
    position: 'relative',
    backgroundImage: `
      linear-gradient(to right, #f0f0f0 1px, transparent 1px),
      linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
    `,
    backgroundSize: `calc(100% / ${GRID_COLS}) ${ROW_HEIGHT}px`,
    backgroundPosition: '0 0',
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
  },
});

export const Canvas: React.FC = () => {
  const styles = useStyles();
  const { width, containerRef, mounted } = useContainerWidth();
  const items = useStore((state) => state.items);
  const updateLayout = useStore((state) => state.updateLayout);
  const addItem = useStore((state) => state.addItem);
  const removeItem = useStore((state) => state.removeItem);


  const handleDrop = (_layout: any, item: any, e: any) => {
    // Use the global dragged type since dataTransfer may not be accessible
    const event = e?.nativeEvent || e;
    const visualType = currentDraggedVisualType ||
                       event?.dataTransfer?.getData?.('visualType') ||
                       event?.dataTransfer?.getData?.('text/plain');

    if (!visualType) return;

    // Get position from drop, default to 0,0 if not provided
    const x = typeof item?.x === 'number' ? item.x : 0;
    const y = typeof item?.y === 'number' ? item.y : 0;
    const w = (typeof item?.w === 'number' && item.w >= 2) ? item.w : 4;
    const h = (typeof item?.h === 'number' && item.h >= 2) ? item.h : 4;

    const id = `visual-${Date.now()}`;
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
    }

    addItem({
      id,
      type: visualType as any,
      title,
      layout: { x, y, w, h },
      props,
    });
  };

  const generateLayout = () => {
    return items.map((item) => ({
      i: item.id,
      x: item.layout.x,
      y: item.layout.y,
      w: item.layout.w,
      h: item.layout.h,
      minW: 2,
      minH: 2,
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
      default:
        return <div>Unknown Visual</div>;
    }
  };

  const onLayoutChange = (layout: any) => {
    if (mounted) {
      updateLayout(layout);
    }
  };

  return (
    <div 
      className={styles.canvas} 
      ref={containerRef as React.RefObject<HTMLDivElement>}
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
          resizeConfig={{ enabled: true }}
          dropConfig={{
            enabled: true,
            defaultItem: { w: 4, h: 4 }
          }}
          onLayoutChange={onLayoutChange}
          onDrop={handleDrop}
        >
          {items.map((item) => (
            <div key={item.id}>
              <VisualContainer title={item.title} onRemove={() => removeItem(item.id)}>
                {renderVisual(item)}
              </VisualContainer>
            </div>
          ))}
        </GridLayout>
      )}
    </div>
  );
};