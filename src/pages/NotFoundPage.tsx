import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Title1, Text, makeStyles, shorthands } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    ...shorthands.padding('24px'),
  },
});

export const NotFoundPage: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <Title1>404 - Page Not Found</Title1>
      <Text>The page you're looking for doesn't exist.</Text>
      <Button appearance="primary" onClick={() => navigate('/editor')}>
        Go to Editor
      </Button>
    </div>
  );
};
