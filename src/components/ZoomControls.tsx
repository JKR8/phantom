import React from 'react';
import { makeStyles, shorthands, Button, Tooltip, Text } from '@fluentui/react-components';
import {
  ZoomInRegular,
  ZoomOutRegular,
  ArrowResetRegular,
} from '@fluentui/react-icons';
import { useStore } from '../store/useStore';

const useStyles = makeStyles({
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '260px', // Account for properties panel width
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'white',
    ...shorthands.padding('6px', '8px'),
    ...shorthands.borderRadius('8px'),
    boxShadow: '0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    zIndex: 1000,
  },
  zoomText: {
    minWidth: '48px',
    textAlign: 'center',
    fontWeight: 'semibold',
    fontSize: '12px',
    cursor: 'pointer',
    ...shorthands.padding('4px', '8px'),
    ...shorthands.borderRadius('4px'),
    ':hover': {
      backgroundColor: '#F3F2F1',
    },
  },
  divider: {
    width: '1px',
    height: '20px',
    backgroundColor: '#E0E0E0',
    marginLeft: '4px',
    marginRight: '4px',
  },
  button: {
    minWidth: '28px',
    width: '28px',
    height: '28px',
  },
});

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

// Preset zoom levels for quick selection
const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export const ZoomControls: React.FC = () => {
  const styles = useStyles();

  const canvasMode = useStore((state) => state.canvasMode);
  const canvasZoom = useStore((state) => state.canvasZoom);
  const setCanvasZoom = useStore((state) => state.setCanvasZoom);
  const resetCanvasView = useStore((state) => state.resetCanvasView);

  // Only show in whiteboard mode
  if (canvasMode !== 'whiteboard') {
    return null;
  }

  const handleZoomIn = () => {
    setCanvasZoom(Math.min(MAX_ZOOM, canvasZoom + ZOOM_STEP));
  };

  const handleZoomOut = () => {
    setCanvasZoom(Math.max(MIN_ZOOM, canvasZoom - ZOOM_STEP));
  };

  const handleZoomClick = () => {
    // Cycle through preset zoom levels or reset to 100%
    const currentIndex = ZOOM_PRESETS.findIndex((z) => Math.abs(z - canvasZoom) < 0.05);
    if (currentIndex === -1) {
      // Not at a preset, go to 100%
      setCanvasZoom(1);
    } else {
      // Cycle to next preset
      const nextIndex = (currentIndex + 1) % ZOOM_PRESETS.length;
      setCanvasZoom(ZOOM_PRESETS[nextIndex]);
    }
  };

  const zoomPercent = Math.round(canvasZoom * 100);

  return (
    <div className={styles.container} data-testid="zoom-controls">
      <Tooltip content="Zoom out (Ctrl+-)" relationship="label">
        <Button
          appearance="subtle"
          size="small"
          icon={<ZoomOutRegular />}
          className={styles.button}
          onClick={handleZoomOut}
          disabled={canvasZoom <= MIN_ZOOM}
        />
      </Tooltip>

      <Tooltip content="Click to cycle zoom levels" relationship="label">
        <Text
          className={styles.zoomText}
          onClick={handleZoomClick}
          data-testid="zoom-percentage"
        >
          {zoomPercent}%
        </Text>
      </Tooltip>

      <Tooltip content="Zoom in (Ctrl++)" relationship="label">
        <Button
          appearance="subtle"
          size="small"
          icon={<ZoomInRegular />}
          className={styles.button}
          onClick={handleZoomIn}
          disabled={canvasZoom >= MAX_ZOOM}
        />
      </Tooltip>

      <div className={styles.divider} />

      <Tooltip content="Reset view (Ctrl+0)" relationship="label">
        <Button
          appearance="subtle"
          size="small"
          icon={<ArrowResetRegular />}
          className={styles.button}
          onClick={resetCanvasView}
        />
      </Tooltip>
    </div>
  );
};
