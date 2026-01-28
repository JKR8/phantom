import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, makeStyles } from '@fluentui/react-components';
import { supabase } from '../lib/supabase';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
});

export const AuthCallback: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      if (!supabase) {
        navigate('/editor', { replace: true });
        return;
      }

      // Supabase JS client automatically handles the hash fragment / code exchange
      // from the OAuth redirect. We just need to wait for the session to be set.
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { replace: true });
      } else {
        navigate('/dashboards', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className={styles.container}>
      <Spinner label="Signing in..." />
    </div>
  );
};
