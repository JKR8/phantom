import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  makeStyles,
} from '@fluentui/react-components';
import {
  PersonRegular,
  SignOutRegular,
  GridRegular,
} from '@fluentui/react-icons';
import { useAuth } from '../auth/useAuth';

const useStyles = makeStyles({
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0078D4',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600' as any,
    cursor: 'pointer',
    border: 'none',
  },
  topButton: {
    color: 'white',
    ':hover': {
      backgroundColor: '#3b3a39',
      color: 'white',
    },
  },
});

export const UserMenu: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <Button
        appearance="subtle"
        className={styles.topButton}
        size="small"
        icon={<PersonRegular />}
        onClick={() => navigate('/login')}
      >
        Sign In
      </Button>
    );
  }

  const initials = (user.email || 'U')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <button className={styles.avatar} title={user.email || 'Account'}>
          {initials}
        </button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem
            icon={<GridRegular />}
            onClick={() => navigate('/dashboards')}
          >
            My Dashboards
          </MenuItem>
          <MenuItem
            icon={<SignOutRegular />}
            onClick={async () => {
              await signOut();
              navigate('/editor');
            }}
          >
            Sign Out
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
