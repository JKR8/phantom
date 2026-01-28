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
  },
  containerSelected: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    ...shorthands.border('2px', 'solid', '#0078D4'),
    ...shorthands.borderRadius('2px'),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shorthands.padding('4px', '8px'),
    cursor: 'grab',
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
