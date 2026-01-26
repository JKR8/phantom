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
import { MoreHorizontalRegular, DeleteRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
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
    color: '#323130',
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
}

export const VisualContainer: React.FC<VisualContainerProps> = ({ title, children, onRemove }) => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <div className={`${styles.header} visual-header`}>
        <Text className={styles.title}>{title}</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button appearance="transparent" icon={<MoreHorizontalRegular />} size="small" />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem icon={<DeleteRegular />} onClick={onRemove}>Delete</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
