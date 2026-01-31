import React from 'react';
import { makeStyles, shorthands, Button, Tooltip, Text, Divider } from '@fluentui/react-components';
import {
  NoteAddRegular,
  DismissRegular,
  DeleteRegular,
  InfoRegular,
} from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { STICKY_COLORS } from './StickyNote';

const useStyles = makeStyles({
  container: {
    position: 'fixed',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'white',
    ...shorthands.padding('8px', '16px'),
    ...shorthands.borderRadius('8px'),
    boxShadow: '0 4px 16px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)',
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    zIndex: 1000,
  },
  modeIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#EEF6FF',
    ...shorthands.padding('4px', '10px'),
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', '#CCE4FF'),
  },
  modeText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0078D4',
  },
  divider: {
    height: '24px',
    width: '1px',
    backgroundColor: '#E0E0E0',
  },
  button: {
    minWidth: '36px',
    height: '36px',
  },
  buttonWithLabel: {
    minWidth: 'auto',
    height: '36px',
    gap: '6px',
  },
  hint: {
    fontSize: '11px',
    color: '#605E5C',
    maxWidth: '180px',
    lineHeight: '1.3',
  },
  colorDots: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  colorDot: {
    width: '18px',
    height: '18px',
    ...shorthands.borderRadius('4px'),
    cursor: 'pointer',
    ...shorthands.border('1px', 'solid', 'rgba(0,0,0,0.1)'),
    transitionProperty: 'transform, box-shadow',
    transitionDuration: '0.15s',
    ':hover': {
      transform: 'scale(1.15)',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    },
  },
  selectedColor: {
    boxShadow: '0 0 0 2px #0078D4',
  },
});

export const WhiteboardToolbar: React.FC = () => {
  const styles = useStyles();
  const [selectedColor, setSelectedColor] = React.useState(STICKY_COLORS.yellow);

  const canvasMode = useStore((state) => state.canvasMode);
  const addAnnotation = useStore((state) => state.addAnnotation);
  const selectAnnotation = useStore((state) => state.selectAnnotation);
  const annotations = useStore((state) => state.annotations);
  const setCanvasMode = useStore((state) => state.setCanvasMode);

  // Only show in whiteboard mode
  if (canvasMode !== 'whiteboard') {
    return null;
  }

  const handleAddStickyNote = () => {
    // Add a sticky note in a visible position
    const existingCount = annotations.length;
    const offsetX = (existingCount % 5) * 30;
    const offsetY = Math.floor(existingCount / 5) * 30;

    const newAnnotation = {
      id: `annotation-${Date.now()}`,
      type: 'sticky' as const,
      x: 100 + offsetX,
      y: 100 + offsetY,
      width: 180,
      height: 120,
      content: '',
      color: selectedColor,
    };

    addAnnotation(newAnnotation);
    setTimeout(() => selectAnnotation(newAnnotation.id), 0);
  };

  const handleClearAnnotations = () => {
    if (annotations.length === 0) return;
    if (window.confirm(`Remove all ${annotations.length} sticky notes?`)) {
      annotations.forEach((a) => {
        useStore.getState().removeAnnotation(a.id);
      });
    }
  };

  const handleBackToReport = () => {
    setCanvasMode('pbi');
  };

  return (
    <div className={styles.container} data-testid="whiteboard-toolbar">
      {/* Mode indicator */}
      <div className={styles.modeIndicator}>
        <Text className={styles.modeText}>✏️ Whiteboard Mode</Text>
      </div>

      <div className={styles.divider} />

      {/* Add Sticky Note */}
      <Tooltip content="Add a sticky note (or double-click on canvas)" relationship="label">
        <Button
          appearance="primary"
          size="small"
          icon={<NoteAddRegular />}
          className={styles.buttonWithLabel}
          onClick={handleAddStickyNote}
        >
          Add Note
        </Button>
      </Tooltip>

      {/* Color picker */}
      <div className={styles.colorDots}>
        {Object.entries(STICKY_COLORS).map(([name, color]) => (
          <Tooltip key={name} content={name.charAt(0).toUpperCase() + name.slice(1)} relationship="label">
            <div
              className={`${styles.colorDot}${selectedColor === color ? ` ${styles.selectedColor}` : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              title={name}
            />
          </Tooltip>
        ))}
      </div>

      <div className={styles.divider} />

      {/* Hint */}
      <Tooltip
        content={
          <div style={{ maxWidth: '220px' }}>
            <strong>Tips:</strong><br />
            • Double-click to add notes<br />
            • Drag notes to move<br />
            • Ctrl+Scroll to zoom<br />
            • Right-click + drag to pan
          </div>
        }
        relationship="label"
      >
        <Button
          appearance="subtle"
          size="small"
          icon={<InfoRegular />}
          className={styles.button}
        />
      </Tooltip>

      {/* Clear all */}
      {annotations.length > 0 && (
        <Tooltip content={`Clear all ${annotations.length} notes`} relationship="label">
          <Button
            appearance="subtle"
            size="small"
            icon={<DeleteRegular />}
            className={styles.button}
            onClick={handleClearAnnotations}
          />
        </Tooltip>
      )}

      <div className={styles.divider} />

      {/* Back to report mode */}
      <Tooltip content="Return to Report mode" relationship="label">
        <Button
          appearance="subtle"
          size="small"
          icon={<DismissRegular />}
          className={styles.buttonWithLabel}
          onClick={handleBackToReport}
        >
          Exit
        </Button>
      </Tooltip>
    </div>
  );
};
