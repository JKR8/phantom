import React, { useCallback } from 'react';
import { makeStyles } from '@fluentui/react-components';
import { useStore } from '../store/useStore';
import { StickyNote, STICKY_COLORS } from './StickyNote';

const useStyles = makeStyles({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // Allow clicks to pass through to canvas
  },
  stickyWrapper: {
    pointerEvents: 'auto', // Enable interactions on sticky notes
  },
});

interface AnnotationsLayerProps {
  zoom: number;
  panX: number;
  panY: number;
}

export const AnnotationsLayer: React.FC<AnnotationsLayerProps> = ({ zoom, panX, panY }) => {
  const styles = useStyles();

  const canvasMode = useStore((state) => state.canvasMode);
  const annotations = useStore((state) => state.annotations);
  const addAnnotation = useStore((state) => state.addAnnotation);
  const selectAnnotation = useStore((state) => state.selectAnnotation);

  // Handle double-click to add a new sticky note
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    // Only create new sticky if clicking on the layer background (not on existing sticky)
    if ((e.target as HTMLElement).closest('[data-testid="sticky-note"]')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    // Calculate position in canvas coordinates
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - panX) / zoom;
    const y = (e.clientY - rect.top - panY) / zoom;

    const newAnnotation = {
      id: `annotation-${Date.now()}`,
      type: 'sticky' as const,
      x: x - 75, // Center the sticky under cursor
      y: y - 40,
      width: 150,
      height: 100,
      content: '',
      color: STICKY_COLORS.yellow,
    };

    addAnnotation(newAnnotation);
    // Select the new annotation
    setTimeout(() => selectAnnotation(newAnnotation.id), 0);
  }, [zoom, panX, panY, addAnnotation, selectAnnotation]);

  // Handle click on empty area to deselect
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking on the layer background
    if (!(e.target as HTMLElement).closest('[data-testid="sticky-note"]')) {
      selectAnnotation(null);
    }
  }, [selectAnnotation]);

  // Only render in whiteboard mode
  if (canvasMode !== 'whiteboard') {
    return null;
  }

  return (
    <div
      className={styles.layer}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      style={{ pointerEvents: 'auto' }} // Enable double-click on layer
      data-testid="annotations-layer"
    >
      {annotations.map((annotation) => (
        <div key={annotation.id} className={styles.stickyWrapper}>
          <StickyNote annotation={annotation} zoom={zoom} />
        </div>
      ))}
    </div>
  );
};
