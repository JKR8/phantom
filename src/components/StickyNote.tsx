import React, { useState, useRef, useEffect } from 'react';
import { makeStyles, shorthands, Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { DeleteRegular, ColorRegular } from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { CanvasAnnotation } from '../types';

// Sticky note color presets
export const STICKY_COLORS = {
  yellow: '#FFF9C4',
  pink: '#F8BBD9',
  green: '#C8E6C9',
  blue: '#BBDEFB',
  purple: '#E1BEE7',
  orange: '#FFE0B2',
};

const useStyles = makeStyles({
  sticky: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.borderRadius('4px'),
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    cursor: 'move',
    userSelect: 'none',
    minWidth: '120px',
    minHeight: '80px',
  },
  selected: {
    boxShadow: '0 0 0 2px #0078D4, 0 2px 8px rgba(0,0,0,0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '24px',
    ...shorthands.padding('2px', '4px'),
    opacity: 0,
    transitionProperty: 'opacity',
    transitionDuration: '0.15s',
  },
  headerVisible: {
    opacity: 1,
  },
  content: {
    flex: 1,
    ...shorthands.padding('8px', '12px'),
    fontSize: '14px',
    lineHeight: '1.4',
    backgroundColor: 'transparent',
    ...shorthands.border('none'),
    ...shorthands.outline('none'),
    resize: 'none',
    fontFamily: 'inherit',
  },
  resizeHandle: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '12px',
    height: '12px',
    cursor: 'se-resize',
    opacity: 0.3,
    ':hover': {
      opacity: 0.6,
    },
  },
  colorDot: {
    width: '16px',
    height: '16px',
    ...shorthands.borderRadius('50%'),
    ...shorthands.border('1px', 'solid', 'rgba(0,0,0,0.1)'),
    cursor: 'pointer',
  },
  iconButton: {
    minWidth: '24px',
    width: '24px',
    height: '24px',
    ...shorthands.padding('0'),
  },
});

interface StickyNoteProps {
  annotation: CanvasAnnotation;
  zoom: number;
}

export const StickyNote: React.FC<StickyNoteProps> = ({ annotation, zoom }) => {
  const styles = useStyles();
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startPos = useRef({ x: 0, y: 0, annotationX: 0, annotationY: 0, width: 0, height: 0 });

  const selectedAnnotationId = useStore((state) => state.selectedAnnotationId);
  const selectAnnotation = useStore((state) => state.selectAnnotation);
  const updateAnnotation = useStore((state) => state.updateAnnotation);
  const removeAnnotation = useStore((state) => state.removeAnnotation);

  const isSelected = selectedAnnotationId === annotation.id;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing || isResizing) return;
    if ((e.target as HTMLElement).closest('button, [role="menu"]')) return;

    e.preventDefault();
    e.stopPropagation();

    selectAnnotation(annotation.id);
    setIsDragging(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      annotationX: annotation.x,
      annotationY: annotation.y,
      width: annotation.width,
      height: annotation.height,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const deltaX = (e.clientX - startPos.current.x) / zoom;
      const deltaY = (e.clientY - startPos.current.y) / zoom;

      updateAnnotation(annotation.id, {
        x: startPos.current.annotationX + deltaX,
        y: startPos.current.annotationY + deltaY,
      });
    } else if (isResizing) {
      const deltaX = (e.clientX - startPos.current.x) / zoom;
      const deltaY = (e.clientY - startPos.current.y) / zoom;

      updateAnnotation(annotation.id, {
        width: Math.max(120, startPos.current.width + deltaX),
        height: Math.max(80, startPos.current.height + deltaY),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing]);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      annotationX: annotation.x,
      annotationY: annotation.y,
      width: annotation.width,
      height: annotation.height,
    };
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateAnnotation(annotation.id, { content: e.target.value });
  };

  const handleColorChange = (color: string) => {
    updateAnnotation(annotation.id, { color });
  };

  const handleDelete = () => {
    removeAnnotation(annotation.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectAnnotation(annotation.id);
  };

  return (
    <div
      className={`${styles.sticky}${isSelected ? ` ${styles.selected}` : ''}`}
      style={{
        left: annotation.x,
        top: annotation.y,
        width: annotation.width,
        height: annotation.height,
        backgroundColor: annotation.color || STICKY_COLORS.yellow,
        zIndex: isSelected ? 100 : 10,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid="sticky-note"
    >
      <div className={`${styles.header}${isHovered || isSelected ? ` ${styles.headerVisible}` : ''}`}>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button
              appearance="subtle"
              size="small"
              icon={<ColorRegular />}
              className={styles.iconButton}
              title="Change color"
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {Object.entries(STICKY_COLORS).map(([name, color]) => (
                <MenuItem
                  key={name}
                  onClick={() => handleColorChange(color)}
                  icon={
                    <div
                      className={styles.colorDot}
                      style={{ backgroundColor: color }}
                    />
                  }
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>

        <Button
          appearance="subtle"
          size="small"
          icon={<DeleteRegular />}
          className={styles.iconButton}
          onClick={handleDelete}
          title="Delete note"
        />
      </div>

      <textarea
        ref={textareaRef}
        className={styles.content}
        value={annotation.content}
        onChange={handleContentChange}
        onBlur={handleBlur}
        placeholder="Type a note..."
        readOnly={!isEditing}
        style={{
          cursor: isEditing ? 'text' : 'move',
          fontSize: annotation.fontSize || 14,
        }}
      />

      <div
        className={styles.resizeHandle}
        onMouseDown={handleResizeMouseDown}
        title="Drag to resize"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M11 11L1 11M11 11L11 1M11 11L4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
};
