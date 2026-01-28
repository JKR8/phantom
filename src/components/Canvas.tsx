import React, { useRef } from 'react';
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
import { getRecipeForVisual, generateSmartTitle } from '../store/bindingRecipes';
import { ScenarioType } from '../store/semanticLayer';
import { SlotLayouts } from '../store/slotLayouts';
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
import { QuickShapeStrip } from './QuickShapeStrip';

const GRID_COLS = 24;
const ROW_HEIGHT = 40;

const useStyles = makeStyles({
  canvas: {
    backgroundColor: '#F2F2F2',
    minHeight: '600px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    ...shorthands.margin('0', 'auto'),
    width: '100%',
    position: 'relative',
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
  },
});

interface CanvasProps {
  readOnly?: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ readOnly }) => {
  const styles = useStyles();
  const { width, containerRef, mounted } = useContainerWidth();
  const items = useStore((state) => state.items);
  const scenario = useStore((state) => state.scenario);
  const layoutMode = useStore((state) => state.layoutMode);
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
    let x = typeof item?.x === 'number' ? item.x : 0;
    let y = typeof item?.y === 'number' ? item.y : 0;
    let w = (typeof item?.w === 'number' && item.w >= 2) ? item.w : 8;
    let h = (typeof item?.h === 'number' && item.h >= 2) ? item.h : 4;

    // Standard Layout Snap
    if (layoutMode === 'Standard') {
        const slots = SlotLayouts['Executive']; // Default to Executive for now
        // Simple hit test: find slot that contains the dropped x/y
        // item.x/y are in grid units
        const hitSlot = slots.find(s => 
            x >= s.x && x < s.x + s.w &&
            y >= s.y && y < s.y + s.h
        );
        
        // If not exact hit, find closest center
        if (hitSlot) {
            x = hitSlot.x;
            y = hitSlot.y;
            w = hitSlot.w;
            h = hitSlot.h;
        } else {
             // Fallback: Find closest slot by distance to center
             let minDist = Infinity;
             let closest = slots[0];
             slots.forEach(s => {
                 const dx = (x) - (s.x + s.w/2);
                 const dy = (y) - (s.y + s.h/2);
                 const dist = dx*dx + dy*dy;
                 if (dist < minDist) {
                     minDist = dist;
                     closest = s;
                 }
             });
             x = closest.x;
             y = closest.y;
             w = closest.w;
             h = closest.h;
        }
    }

    const id = `visual-${Date.now()}`;

    // If a pre-built config was dragged, use it directly
    if (dragState.prebuiltConfig) {
      const cfg = dragState.prebuiltConfig;
      // In standard mode, we override dimensions, but keep title/props
      if (layoutMode !== 'Standard') {
          w = cfg.w;
          h = cfg.h;
      }
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

    // Use the binding recipe to get default props based on the scenario
    const recipe = getRecipeForVisual(visualType, scenario as ScenarioType);
    const props = { ...recipe };

    // Smart title generation from recipe
    const title = generateSmartTitle(visualType, recipe, scenario as ScenarioType);

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
      isDraggable: !readOnly,
      isResizable: !readOnly,
      static: !!readOnly,
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

  const isInitialMount = useRef(true);
  const onLayoutChange = (layout: any) => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
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

  const renderSlots = () => {
    if (layoutMode !== 'Standard') return null;
    const slots = SlotLayouts['Executive'];
    
    // Calculate col width (approximate, assuming 12px margin and 24 cols)
    // Actually, simple % based positioning is easier for overlays
    // But we need to match react-grid-layout's pixels
    // Let's rely on CSS grid if possible, or just absolute positioning
    
    // Simplified calculation matching GridLayout logic:
    // width = (colWidth * w) + (margin * (w - 1))
    // x = (colWidth + margin) * x + margin
    // But we don't have colWidth easily without calculation.
    // Let's use the 'width' from useContainerWidth()
    
    const margin = 12;
    const colWidth = (width - (margin * (GRID_COLS + 1))) / GRID_COLS;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            {slots.map(slot => {
                const left = (slot.x * (colWidth + margin)) + margin;
                const top = (slot.y * (ROW_HEIGHT + margin)) + margin;
                const slotWidth = (slot.w * colWidth) + ((slot.w - 1) * margin);
                const slotHeight = (slot.h * ROW_HEIGHT) + ((slot.h - 1) * margin);

                return (
                    <div 
                        key={slot.id}
                        style={{
                            position: 'absolute',
                            left: `${left}px`,
                            top: `${top}px`,
                            width: `${slotWidth}px`,
                            height: `${slotHeight}px`,
                            border: '2px dashed #0078D4',
                            backgroundColor: 'rgba(0, 120, 212, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0078D4',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}
                    >
                        {slot.name}
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div
      className={styles.canvas}
      data-testid="canvas-drop-area"
      ref={containerRef as React.RefObject<HTMLDivElement>}
      onClick={handleCanvasClick}
      onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'copy';
      }}
    >
      {mounted && width > 0 && (
        <>
        {renderSlots()}
        <QuickShapeStrip 
            containerWidth={width} 
            rowHeight={ROW_HEIGHT} 
            cols={GRID_COLS} 
            margin={[12, 12]} 
        />
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
            enabled: !readOnly,
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
        </>
      )}
    </div>
  );
};