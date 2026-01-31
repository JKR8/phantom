import React, { useRef, useCallback } from 'react';
import { makeStyles, shorthands, Button, Tooltip } from '@fluentui/react-components';
import { EyeOffRegular, EyeRegular } from '@fluentui/react-icons';
import { useStore } from '../store/useStore';

const MINIMAP_WIDTH = 160;
const MINIMAP_HEIGHT = 100;
const CANVAS_WIDTH = 1280; // Assumed canvas width in pixels
const CANVAS_HEIGHT = 860; // Assumed canvas height in pixels

const useStyles = makeStyles({
  container: {
    position: 'fixed',
    bottom: '24px',
    left: '68px', // Account for left nav width
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    zIndex: 1000,
  },
  minimap: {
    width: `${MINIMAP_WIDTH}px`,
    height: `${MINIMAP_HEIGHT}px`,
    backgroundColor: '#F3F2F1',
    ...shorthands.borderRadius('4px'),
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  item: {
    position: 'absolute',
    backgroundColor: '#0078D4',
    opacity: 0.4,
    ...shorthands.borderRadius('1px'),
  },
  annotation: {
    position: 'absolute',
    opacity: 0.6,
    ...shorthands.borderRadius('1px'),
  },
  viewport: {
    position: 'absolute',
    ...shorthands.border('2px', 'solid', '#0078D4'),
    backgroundColor: 'rgba(0, 120, 212, 0.1)',
    ...shorthands.borderRadius('2px'),
    pointerEvents: 'none',
  },
  toggleButton: {
    alignSelf: 'flex-start',
  },
  hidden: {
    display: 'none',
  },
});

export const Minimap: React.FC = () => {
  const styles = useStyles();
  const minimapRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(true);

  const canvasMode = useStore((state) => state.canvasMode);
  const canvasZoom = useStore((state) => state.canvasZoom);
  const canvasPanX = useStore((state) => state.canvasPanX);
  const canvasPanY = useStore((state) => state.canvasPanY);
  const setCanvasPan = useStore((state) => state.setCanvasPan);
  const items = useStore((state) => state.items);
  const annotations = useStore((state) => state.annotations);

  // Scale factor from canvas to minimap
  const scaleX = MINIMAP_WIDTH / CANVAS_WIDTH;
  const scaleY = MINIMAP_HEIGHT / CANVAS_HEIGHT;

  // Grid constants (from Canvas.tsx)
  const GRID_COLS = 48;
  const ROW_HEIGHT = 20;
  const MARGIN = 8;
  const PADDING = 12;
  const colWidth = (CANVAS_WIDTH - (2 * PADDING) - (MARGIN * (GRID_COLS - 1))) / GRID_COLS;

  // Calculate viewport rectangle (what's currently visible)
  // Assume viewport is roughly the canvas area size
  const viewportWidth = CANVAS_WIDTH / canvasZoom;
  const viewportHeight = CANVAS_HEIGHT / canvasZoom;
  const viewportLeft = -canvasPanX / canvasZoom;
  const viewportTop = -canvasPanY / canvasZoom;

  const handleMinimapClick = useCallback((e: React.MouseEvent) => {
    if (!minimapRef.current) return;

    const rect = minimapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert click to canvas coordinates
    const canvasX = clickX / scaleX;
    const canvasY = clickY / scaleY;

    // Center the viewport on the clicked point
    const newPanX = -(canvasX - viewportWidth / 2) * canvasZoom;
    const newPanY = -(canvasY - viewportHeight / 2) * canvasZoom;

    setCanvasPan(newPanX, newPanY);
  }, [scaleX, scaleY, canvasZoom, viewportWidth, viewportHeight, setCanvasPan]);

  // Only show in whiteboard mode
  if (canvasMode !== 'whiteboard') {
    return null;
  }

  return (
    <div className={styles.container} data-testid="minimap-container">
      <Tooltip content={isVisible ? 'Hide minimap' : 'Show minimap'} relationship="label">
        <Button
          appearance="subtle"
          size="small"
          icon={isVisible ? <EyeOffRegular /> : <EyeRegular />}
          onClick={() => setIsVisible(!isVisible)}
          className={styles.toggleButton}
        />
      </Tooltip>

      <div
        ref={minimapRef}
        className={`${styles.minimap}${!isVisible ? ` ${styles.hidden}` : ''}`}
        onClick={handleMinimapClick}
        data-testid="minimap"
      >
        {/* Render items as small rectangles */}
        {items.map((item) => {
          const left = ((item.layout.x * (colWidth + MARGIN)) + PADDING) * scaleX;
          const top = ((item.layout.y * (ROW_HEIGHT + MARGIN)) + PADDING) * scaleY;
          const width = ((item.layout.w * colWidth) + ((item.layout.w - 1) * MARGIN)) * scaleX;
          const height = ((item.layout.h * ROW_HEIGHT) + ((item.layout.h - 1) * MARGIN)) * scaleY;

          return (
            <div
              key={item.id}
              className={styles.item}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${Math.max(2, width)}px`,
                height: `${Math.max(2, height)}px`,
              }}
            />
          );
        })}

        {/* Render annotations as colored rectangles */}
        {annotations.map((annotation) => {
          const left = annotation.x * scaleX;
          const top = annotation.y * scaleY;
          const width = annotation.width * scaleX;
          const height = annotation.height * scaleY;

          return (
            <div
              key={annotation.id}
              className={styles.annotation}
              style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${Math.max(2, width)}px`,
                height: `${Math.max(2, height)}px`,
                backgroundColor: annotation.color,
              }}
            />
          );
        })}

        {/* Viewport rectangle */}
        <div
          className={styles.viewport}
          style={{
            left: `${Math.max(0, viewportLeft * scaleX)}px`,
            top: `${Math.max(0, viewportTop * scaleY)}px`,
            width: `${Math.min(MINIMAP_WIDTH, viewportWidth * scaleX)}px`,
            height: `${Math.min(MINIMAP_HEIGHT, viewportHeight * scaleY)}px`,
          }}
        />
      </div>
    </div>
  );
};
