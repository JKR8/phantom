import React from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { makeStyles, shorthands } from '@fluentui/react-components';
import { useStore } from '../store/useStore';
import { VisualContainer } from './VisualContainer';
import { BarChart } from './BarChart';
import { DonutChart } from './DonutChart';
import { KPICard } from './KPICard';
import { DataTable } from './DataTable';
import { Slicer } from './Slicer';
import { LineChart } from './LineChart';

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

  const handleDrop = (_layout: any, layoutItem: any, _event: any) => {
    const visualType = _event.dataTransfer.getData('visualType');
    if (!visualType) return;

    const id = `visual-${Date.now()}`;
    let props: any = {};
    let title = 'New Visual';

    switch (visualType) {
      case 'bar':
        props = { dimension: 'Region', metric: 'revenue' };
        title = 'New Bar Chart';
        break;
      case 'line':
        props = { metric: 'revenue' };
        title = 'New Line Chart';
        break;
      case 'pie':
        props = { dimension: 'Category', metric: 'revenue' };
        title = 'New Donut Chart';
        break;
      case 'card':
        props = { metric: 'revenue', operation: 'sum', label: 'Revenue' };
        title = 'New KPI';
        break;
      case 'table':
        props = { maxRows: 100 };
        title = 'Data Table';
        break;
      case 'slicer':
        props = { dimension: 'Store' };
        title = 'Slicer';
        break;
    }

    addItem({
      id,
      type: visualType,
      title,
      layout: { x: layoutItem.x, y: layoutItem.y, w: 4, h: 4 },
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
      case 'pie':
        return <DonutChart {...item.props} />;
      case 'card':
        return <KPICard {...item.props} />;
      case 'table':
        return <DataTable {...item.props} />;
      case 'slicer':
        return <Slicer {...item.props} />;
      case 'line':
        return <LineChart {...item.props} />;
      default:
        return <div>Unknown Visual</div>;
    }
  };

  const onLayoutChange = (layout: any) => {
    // We only update if mounted to avoid initial thrashing
    if (mounted) {
      updateLayout(layout);
    }
  };

  return (
    <div className={styles.canvas} ref={containerRef as React.RefObject<HTMLDivElement>}>
      {mounted && (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: generateLayout(), md: generateLayout(), sm: generateLayout() }}
          breakpoints={{ lg: 1200, md: 900, sm: 600 }}
          cols={{ lg: GRID_COLS, md: GRID_COLS, sm: 6 }}
          rowHeight={ROW_HEIGHT}
          width={width}
          margin={[12, 12]}
          containerPadding={[12, 12]}
          dragConfig={{ handle: '.visual-header' }}
          resizeConfig={{ enabled: true }}
          onLayoutChange={onLayoutChange}
          // @ts-ignore
          isDroppable={true}
          onDrop={handleDrop}
        >
          {items.map((item) => (
            <div key={item.id}>
              <VisualContainer title={item.title}>
                {renderVisual(item)}
              </VisualContainer>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  );
};