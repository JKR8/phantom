import React, { useRef, useEffect, useCallback } from 'react';
import { makeStyles } from '@fluentui/react-components';
import { useStore } from '../store/useStore';

const useStyles = makeStyles({
  viewport: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  transformLayer: {
    transformOrigin: '0 0',
    position: 'absolute',
    top: 0,
    left: 0,
    minWidth: '100%',
    minHeight: '100%',
  },
  pbiMode: {
    // In PBI mode, just pass through with normal overflow
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'auto',
  },
  grabbing: {
    cursor: 'grabbing',
  },
  spaceHeld: {
    cursor: 'grab',
  },
});

interface CanvasViewportProps {
  children: React.ReactNode;
  annotationsLayer?: React.ReactNode;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export const CanvasViewport: React.FC<CanvasViewportProps> = ({ children, annotationsLayer }) => {
  const styles = useStyles();
  const viewportRef = useRef<HTMLDivElement>(null);

  const canvasMode = useStore((state) => state.canvasMode);
  const canvasZoom = useStore((state) => state.canvasZoom);
  const canvasPanX = useStore((state) => state.canvasPanX);
  const canvasPanY = useStore((state) => state.canvasPanY);
  const setCanvasZoom = useStore((state) => state.setCanvasZoom);
  const setCanvasPan = useStore((state) => state.setCanvasPan);
  const resetCanvasView = useStore((state) => state.resetCanvasView);

  const [isPanning, setIsPanning] = React.useState(false);
  const [isSpaceHeld, setIsSpaceHeld] = React.useState(false);
  const lastPanPos = useRef({ x: 0, y: 0 });

  // Handle wheel zoom (Ctrl/Cmd + scroll)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (canvasMode !== 'whiteboard') return;

    // Ctrl/Cmd + scroll = zoom
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, canvasZoom + delta));

      // Zoom toward cursor position
      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        // Calculate cursor position in canvas coordinates before zoom
        const canvasX = (cursorX - canvasPanX) / canvasZoom;
        const canvasY = (cursorY - canvasPanY) / canvasZoom;

        // Calculate new pan to keep cursor at same canvas position
        const newPanX = cursorX - canvasX * newZoom;
        const newPanY = cursorY - canvasY * newZoom;

        setCanvasZoom(newZoom);
        setCanvasPan(newPanX, newPanY);
      } else {
        setCanvasZoom(newZoom);
      }
    }
  }, [canvasMode, canvasZoom, canvasPanX, canvasPanY, setCanvasZoom, setCanvasPan]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (canvasMode !== 'whiteboard') return;

    // Space key for panning
    if (e.code === 'Space' && !e.repeat) {
      e.preventDefault();
      setIsSpaceHeld(true);
    }

    // Zoom shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === '0') {
        e.preventDefault();
        resetCanvasView();
      } else if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        setCanvasZoom(Math.min(MAX_ZOOM, canvasZoom + ZOOM_STEP));
      } else if (e.key === '-') {
        e.preventDefault();
        setCanvasZoom(Math.max(MIN_ZOOM, canvasZoom - ZOOM_STEP));
      }
    }
  }, [canvasMode, canvasZoom, setCanvasZoom, resetCanvasView]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      setIsSpaceHeld(false);
    }
  }, []);

  // Handle mouse events for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (canvasMode !== 'whiteboard') return;

    // Right-click, middle mouse button, or space+click for panning
    if (e.button === 2 || e.button === 1 || (isSpaceHeld && e.button === 0)) {
      e.preventDefault();
      setIsPanning(true);
      lastPanPos.current = { x: e.clientX, y: e.clientY };
    }
  }, [canvasMode, isSpaceHeld]);

  // Prevent context menu on right-click (we use it for panning)
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (canvasMode === 'whiteboard') {
      e.preventDefault();
    }
  }, [canvasMode]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning || canvasMode !== 'whiteboard') return;

    const deltaX = e.clientX - lastPanPos.current.x;
    const deltaY = e.clientY - lastPanPos.current.y;

    setCanvasPan(canvasPanX + deltaX, canvasPanY + deltaY);
    lastPanPos.current = { x: e.clientX, y: e.clientY };
  }, [isPanning, canvasMode, canvasPanX, canvasPanY, setCanvasPan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Attach wheel event listener (needs passive: false to prevent default)
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Attach keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Global mouseup listener for panning
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // In PBI mode, just render children directly (current behavior)
  if (canvasMode === 'pbi') {
    return (
      <div className={styles.pbiMode}>
        {children}
      </div>
    );
  }

  // Whiteboard mode: apply zoom/pan transforms
  const transform = `translate(${canvasPanX}px, ${canvasPanY}px) scale(${canvasZoom})`;

  return (
    <div
      ref={viewportRef}
      className={`${styles.viewport}${isPanning ? ` ${styles.grabbing}` : ''}${isSpaceHeld && !isPanning ? ` ${styles.spaceHeld}` : ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      <div
        className={styles.transformLayer}
        style={{ transform }}
      >
        {children}
        {annotationsLayer}
      </div>
    </div>
  );
};
