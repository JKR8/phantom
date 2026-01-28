import React from 'react';
import {
  makeStyles,
  shorthands,
  Text,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  Button
} from '@fluentui/react-components';
import { MoreHorizontalRegular, DeleteRegular, EditRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    ...shorthands.borderRadius('8px'),
    boxShadow: '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
    ':hover': {
      boxShadow: '0 2px 6px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
    },
  },
  containerSelected: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    ...shorthands.borderRadius('8px'),
    boxShadow: '0 0 0 1px rgba(0,120,212,0.3), 0 2px 6px rgba(0,0,0,0.10)',
    transitionProperty: 'box-shadow, border-color',
    transitionDuration: '0.2s',
    transitionTimingFunction: 'ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding('4px', '8px'),
    cursor: 'grab',
    borderBottom: '1px solid #F0F0F0',
    ':active': {
      cursor: 'grabbing',
    }
  },
  title: {
    fontSize: '12px',
    fontWeight: 'semibold',
    color: '#252423',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  }
});

interface VisualContainerProps {
  title: string;
  children: React.ReactNode;
  onRemove?: () => void;
  hideMenu?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  itemId?: string;
}

export const VisualContainer: React.FC<VisualContainerProps> = ({ title, children, onRemove, hideMenu, isSelected, onSelect, itemId }) => {
  const styles = useStyles();

  const handleClick = (e: React.MouseEvent) => {
    // Don't select when clicking on the menu area
    if ((e.target as HTMLElement).closest('[data-menu-area]')) return;
    e.stopPropagation();
    onSelect?.();
  };

  return (
    <div 
      className={isSelected ? styles.containerSelected : styles.container} 
      onClick={handleClick}
      data-testid={`visual-container-${itemId}`}
    >
      <div className={`${styles.header} visual-header`}>
        <Text className={styles.title}>{title}</Text>
        {!hideMenu && (
          <div
            data-menu-area
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button appearance="transparent" icon={<MoreHorizontalRegular />} size="small" />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem icon={<EditRegular />} onClick={() => onSelect?.()}>Edit</MenuItem>
                  <MenuItem icon={<DeleteRegular />} onClick={onRemove}>Delete</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        )}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
