import React, { useRef, useState } from 'react';
// @ts-ignore - @types/react-grid-layout is outdated for v2.2.2
import { GridLayout, useContainerWidth, getCompactor } from 'react-grid-layout';

// Use the built-in getCompactor with null to disable compaction
const noCompactor = getCompactor(null);
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
// Statistical components
import { BoxplotChart, HistogramChart, ViolinChart, RegressionScatterChart } from './statistical';
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
import { VariantPicker, VARIANT_PARENT_TYPES } from './VariantPicker';

const GRID_COLS = 48;  // Balanced grid for good visual spacing
const ROW_HEIGHT = 20;
const GRID_MARGIN: [number, number] = [8, 8];  // Gap between visuals (Power BI style)
const GRID_PADDING: [number, number] = [12, 12];  // Canvas edge padding

const useStyles = makeStyles({
  canvas: {
    backgroundColor: '#F3F2F1',  // Power BI canvas color
    // Decorative dot grid pattern (28px spacing matches grid)
    backgroundImage: 'radial-gradient(circle, #D2D0CE 1px, transparent 1px)',
    backgroundSize: '28px 28px',
    backgroundPosition: '14px 14px',
    minHeight: '860px',  // Matches layout presets (30 rows)
    boxShadow: '0 2px 12px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
    ...shorthands.margin('0', 'auto'),
    width: '100%',
    position: 'relative',
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
  },
  canvasDragOver: {
    ...shorthands.border('2px', 'dashed', '#0078D4'),
    backgroundColor: 'rgba(0,120,212,0.03)',
  },
  emptyState: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    color: '#A19F9D',
    pointerEvents: 'none',
    fontSize: '14px',
  },
  emptyIcon: {
    fontSize: '32px',
    color: '#C8C6C4',
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
  const selectedArchetype = useStore((state) => state.selectedArchetype);
  const updateLayout = useStore((state) => state.updateLayout);
  const addItem = useStore((state) => state.addItem);
  const removeItem = useStore((state) => state.removeItem);
  const selectedItemId = useStore((state) => state.selectedItemId);
  const selectItem = useStore((state) => state.selectItem);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{
    parentType: string;
    x: number;
    y: number;
    w: number;
    h: number;
    pixelX: number;
    pixelY: number;
    prebuiltConfig?: any;
  } | null>(null);
  const dropHandledRef = useRef(false); // Guard against double-handling drops

  const finalizeDrop = (visualType: string, gridX: number, gridY: number, w: number, h: number, prebuiltConfig?: any) => {
    const id = `visual-${Date.now()}`;
    console.log('[finalizeDrop] Adding item:', { visualType, gridX, gridY, w, h });

    if (prebuiltConfig) {
      addItem({
        id,
        type: prebuiltConfig.type as any,
        title: prebuiltConfig.title,
        layout: { x: gridX, y: gridY, w, h },
        props: { ...prebuiltConfig.props },
      });
      return;
    }

    const recipe = getRecipeForVisual(visualType, scenario as ScenarioType);
    const props = { ...recipe };
    const title = generateSmartTitle(visualType, recipe, scenario as ScenarioType);

    addItem({
      id,
      type: visualType as any,
      title,
      layout: { x: gridX, y: gridY, w, h },
      props,
    });
  };

  // Helper function to find the best slot for a drop position
  const findSlotForPosition = (dropX: number, dropY: number) => {
    const slots = SlotLayouts[selectedArchetype];

    console.log('[findSlotForPosition] Input:', { dropX, dropY, archetype: selectedArchetype });

    // First check if we dropped directly inside a slot
    const hitSlot = slots.find(s =>
      dropX >= s.x && dropX < s.x + s.w &&
      dropY >= s.y && dropY < s.y + s.h
    );

    if (hitSlot) {
      console.log('[findSlotForPosition] Hit slot:', hitSlot.name, 'at y=', hitSlot.y);
      return hitSlot;
    }

    // Find closest slot by distance to slot center
    let minDist = Infinity;
    let closest = slots[0];
    slots.forEach(s => {
      const slotCenterX = s.x + s.w / 2;
      const slotCenterY = s.y + s.h / 2;
      const dx = dropX - slotCenterX;
      const dy = dropY - slotCenterY;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        closest = s;
      }
    });
    console.log('[findSlotForPosition] Closest slot:', closest.name);
    return closest;
  };

  const handleDrop = (_layout: any, item: any, e: any) => {
    console.log('[handleDrop] Called with item:', item);

    // Guard against double handling (both handleDrop and handleCanvasDrop firing)
    if (dropHandledRef.current) {
      console.log('[handleDrop] Skipping - already handled');
      dropHandledRef.current = false;
      return;
    }

    // Use the global dragged type since dataTransfer may not be accessible
    const event = e?.nativeEvent || e;
    const visualType = dragState.visualType ||
                       event?.dataTransfer?.getData?.('visualType') ||
                       event?.dataTransfer?.getData?.('text/plain');

    if (!visualType) return;

    dropHandledRef.current = true;
    setTimeout(() => { dropHandledRef.current = false; }, 100); // Reset after short delay

    // Get position from drop, default to 0,0 if not provided
    let x = typeof item?.x === 'number' ? item.x : 0;
    let y = typeof item?.y === 'number' ? item.y : 0;
    console.log('[handleDrop] Grid position from RGL:', { x, y });
    let w = (typeof item?.w === 'number' && item.w >= 2) ? item.w : 8;
    let h = (typeof item?.h === 'number' && item.h >= 2) ? item.h : 4;

    // Standard Layout Snap - snap to slot position and size
    if (layoutMode === 'Standard') {
      const slot = findSlotForPosition(x, y);
      x = slot.x;
      y = slot.y;
      w = slot.w;
      h = slot.h;
    }

    // If a pre-built config was dragged, use it directly (no variant picker)
    if (dragState.prebuiltConfig) {
      const cfg = dragState.prebuiltConfig;
      if (layoutMode !== 'Standard') {
        w = cfg.w;
        h = cfg.h;
      }
      finalizeDrop(cfg.type, x, y, w, h, cfg);
      return;
    }

    // Variant parent types: show picker instead of direct drop
    if (VARIANT_PARENT_TYPES.has(visualType)) {
      // Calculate pixel position for the popover
      const nativeEvent = e?.nativeEvent || e;
      const pixelX = nativeEvent?.clientX ?? 300;
      const pixelY = nativeEvent?.clientY ?? 300;
      setPendingDrop({ parentType: visualType, x, y, w, h, pixelX, pixelY });
      return;
    }

    // Non-variant types: drop directly
    finalizeDrop(visualType, x, y, w, h);
  };

  const generateLayout = () => {
    const layout = items.map((item) => ({
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
    if (layout.some(l => l.y > 0)) {
      console.log('[generateLayout] Layout with y>0:', JSON.stringify(layout.map(l => ({ i: l.i, x: l.x, y: l.y }))));
    }
    return layout;
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
      // Statistical visuals
      case 'boxplot':
        return <BoxplotChart {...item.props} />;
      case 'histogram':
        return <HistogramChart {...item.props} />;
      case 'violin':
        return <ViolinChart {...item.props} />;
      case 'regressionScatter':
        return <RegressionScatterChart {...item.props} />;
      // Portfolio-specific visuals
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
    const y0Items = layout.filter((l: any) => l.y === 0);
    const yPositiveItems = layout.filter((l: any) => l.y > 0);
    console.log('[onLayoutChange] y=0 items:', y0Items.length, 'y>0 items:', yPositiveItems.length);
    if (yPositiveItems.length > 0) {
      console.log('[onLayoutChange] y>0 items:', JSON.stringify(yPositiveItems.map((l: any) => ({ i: l.i, y: l.y }))));
    }
    if (mounted) {
      updateLayout(layout);
    }
  };

  // Fallback drop handler for canvas drops.
  // GridLayout's onDrop handles drops on existing items; this handles drops on empty space.
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('[handleCanvasDrop] Called');

    // Guard against double handling (both handleDrop and handleCanvasDrop firing)
    if (dropHandledRef.current) {
      console.log('[handleCanvasDrop] Skipping - already handled');
      dropHandledRef.current = false;
      return;
    }

    const visualType = dragState.visualType ||
                       e.dataTransfer?.getData?.('visualType') ||
                       e.dataTransfer?.getData?.('text/plain');
    if (!visualType) return;

    dropHandledRef.current = true;
    setTimeout(() => { dropHandledRef.current = false; }, 100); // Reset after short delay

    // Calculate grid position from mouse coordinates
    const rect = (containerRef as React.RefObject<HTMLDivElement>).current?.getBoundingClientRect();
    const margin = GRID_MARGIN[0];
    const padding = GRID_PADDING[0];
    const colWidth = (width - (2 * padding) - (margin * (GRID_COLS - 1))) / GRID_COLS;

    let gridX = 0;
    let gridY = 0;

    if (rect && width > 0) {
      const relX = e.clientX - rect.left - padding;
      const relY = e.clientY - rect.top - GRID_PADDING[1];
      gridX = Math.max(0, Math.floor(relX / (colWidth + margin)));
      gridY = Math.max(0, Math.floor(relY / (ROW_HEIGHT + GRID_MARGIN[1])));
      console.log('[handleCanvasDrop] Calculated grid:', { relX, relY, gridX, gridY, colWidth });
      // Clamp to grid bounds (only for Free mode; Standard mode snaps to slots)
      if (layoutMode !== 'Standard') {
        gridX = Math.min(gridX, GRID_COLS - 16);
      } else {
        gridX = Math.min(gridX, GRID_COLS - 1);
      }
    }

    let finalW = 16;
    let finalH = 8;

    // Standard Layout Snap - snap to nearest slot
    if (layoutMode === 'Standard') {
      try {
        const slot = findSlotForPosition(gridX, gridY);
        console.log('[handleCanvasDrop] Slot found:', slot);
        gridX = slot.x;
        gridY = slot.y;
        finalW = slot.w;
        finalH = slot.h;
        console.log('[handleCanvasDrop] After snap:', { gridX, gridY, finalW, finalH });
      } catch (err) {
        console.error('[handleCanvasDrop] Error during snap:', err);
      }
    }

    if (dragState.prebuiltConfig) {
      const cfg = dragState.prebuiltConfig;
      const w = layoutMode === 'Standard' ? finalW : cfg.w;
      const h = layoutMode === 'Standard' ? finalH : cfg.h;
      finalizeDrop(cfg.type, gridX, gridY, w, h, cfg);
      return;
    }

    // Variant parent types: show picker
    if (VARIANT_PARENT_TYPES.has(visualType)) {
      const pixelX = e.clientX;
      const pixelY = e.clientY;
      setPendingDrop({ parentType: visualType, x: gridX, y: gridY, w: finalW, h: finalH, pixelX, pixelY });
      return;
    }

    finalizeDrop(visualType, gridX, gridY, finalW, finalH);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas background
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('layout')) {
      selectItem(null);
    }
  };

  const renderSlots = () => {
    if (layoutMode !== 'Standard') return null;
    const slots = SlotLayouts[selectedArchetype];
    
    // Calculate col width (approximate, assuming 12px margin and 24 cols)
    // Actually, simple % based positioning is easier for overlays
    // But we need to match react-grid-layout's pixels
    // Let's rely on CSS grid if possible, or just absolute positioning
    
    // Simplified calculation matching GridLayout logic:
    // width = (colWidth * w) + (margin * (w - 1))
    // x = (colWidth + margin) * x + margin
    // But we don't have colWidth easily without calculation.
    // Let's use the 'width' from useContainerWidth()
    
    const margin = GRID_MARGIN[0];
    const padding = GRID_PADDING[0];
    const colWidth = (width - (2 * padding) - (margin * (GRID_COLS - 1))) / GRID_COLS;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
            {slots.map(slot => {
                const left = (slot.x * (colWidth + margin)) + padding;
                const top = (slot.y * (ROW_HEIGHT + GRID_MARGIN[1])) + GRID_PADDING[1];
                const slotWidth = (slot.w * colWidth) + ((slot.w - 1) * margin);
                const slotHeight = (slot.h * ROW_HEIGHT) + ((slot.h - 1) * GRID_MARGIN[1]);

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
      className={`${styles.canvas}${isDragOver ? ` ${styles.canvasDragOver}` : ''}`}
      data-testid="canvas-drop-area"
      ref={containerRef as React.RefObject<HTMLDivElement>}
      onClick={handleCanvasClick}
      onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
      }}
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={(e) => {
          // Only set false if leaving the canvas itself (not a child)
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
          }
      }}
      onDrop={(e) => { setIsDragOver(false); handleCanvasDrop(e); }}
    >
      {items.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>+</span>
          <span>Drop visuals here</span>
        </div>
      )}
      {mounted && width > 0 && (
        <>
        {renderSlots()}
        <QuickShapeStrip
            containerWidth={width}
            rowHeight={ROW_HEIGHT}
            cols={GRID_COLS}
            margin={GRID_MARGIN}
        />
        <GridLayout
          className="layout"
          width={width}
          compactor={noCompactor}
          gridConfig={{
            cols: GRID_COLS,
            rowHeight: ROW_HEIGHT,
            margin: GRID_MARGIN,
            containerPadding: GRID_PADDING
          }}
          dragConfig={{ handle: '.visual-header' }}
          resizeConfig={{
            enabled: true,
            handles: ['se', 'sw', 'ne', 'nw', 'e', 'w', 'n', 's']
          }}
          dropConfig={{
            enabled: false  // Disable RGL's drop handling - we use native drops
          }}
          onLayoutChange={onLayoutChange}
        >
          {items.map((item) => {
            // Hide menu for slicers and search controls in Portfolio scenario
            const hideMenu = scenario === 'Portfolio' && (item.type === 'slicer' || item.type === 'justificationSearch');
            if (item.layout.y > 0) {
              console.log('[render] Item with y>0:', item.id, 'y=', item.layout.y);
            }
            return (
              <div key={item.id} data-grid={{ x: item.layout.x, y: item.layout.y, w: item.layout.w, h: item.layout.h }}>
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
      {pendingDrop && (
        <VariantPicker
          parentType={pendingDrop.parentType}
          pixelX={pendingDrop.pixelX}
          pixelY={pendingDrop.pixelY}
          onSelect={(variantId) => {
            finalizeDrop(variantId, pendingDrop.x, pendingDrop.y, pendingDrop.w, pendingDrop.h);
            setPendingDrop(null);
          }}
          onCancel={() => setPendingDrop(null)}
        />
      )}
    </div>
  );
};