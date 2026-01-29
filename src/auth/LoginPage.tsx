import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { makeStyles, shorthands, Title1, Text, Button } from '@fluentui/react-components';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#F5F5F5',
  },
  card: {
    width: '400px',
    maxWidth: '90vw',
    backgroundColor: 'white',
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('32px'),
    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  title: {
    display: 'block',
    marginBottom: '8px',
  },
  guestLink: {
    display: 'block',
    textAlign: 'center' as const,
    marginTop: '24px',
    ...shorthands.padding('12px'),
    ...shorthands.borderTop('1px', 'solid', '#E1DFDD'),
  },
  notConfigured: {
    textAlign: 'center' as const,
    ...shorthands.padding('24px'),
  },
});

export const LoginPage: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboards', { replace: true });
    }
  }, [user, navigate]);

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.notConfigured}>
            <Title1 className={styles.title}>Phantom</Title1>
            <Text>Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local</Text>
            <div style={{ marginTop: '16px' }}>
              <Button appearance="primary" onClick={() => navigate('/editor')}>
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Title1 className={styles.title}>Phantom</Title1>
          <Text>Sign in to save and share dashboards</Text>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#0078D4',
                  brandAccent: '#106EBE',
                },
              },
            },
          }}
          providers={[]}
          redirectTo={window.location.origin + '/auth/callback'}
        />
        <div className={styles.guestLink}>
          <Link to="/editor" style={{ color: '#0078D4', textDecoration: 'none' }}>
            Continue as Guest (no saving)
          </Link>
        </div>
      </div>
    </div>
  );
};
