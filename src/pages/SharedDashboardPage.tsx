import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Button, makeStyles } from '@fluentui/react-components';
import { CopyRegular } from '@fluentui/react-icons';
import { AppShell } from '../components/AppShell';
import { Canvas } from '../components/Canvas';
import { useStore } from '../store/useStore';
import { useAuth } from '../auth/useAuth';
import { loadSharedDashboard, saveDashboard } from '../lib/dashboards';
import { isSupabaseConfigured } from '../lib/supabase';
import type { DbDashboard } from '../types';

const useStyles = makeStyles({
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  banner: {
    height: '40px',
    backgroundColor: '#0078D4',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '14px',
    flexShrink: 0,
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
  },
});

export const SharedDashboardPage: React.FC = () => {
  const styles = useStyles();
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const loadFromDb = useStore((s) => s.loadDashboardFromDb);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DbDashboard | null>(null);
  const [cloning, setCloning] = useState(false);

  useEffect(() => {
    if (!shareId || !isSupabaseConfigured) {
      setError('Shared dashboards require Supabase configuration');
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const db = await loadSharedDashboard(shareId);
        if (!cancelled) {
          setDashboard(db);
          loadFromDb(db);
          // Mark as not dirty since this is read-only
          useStore.setState({ isDirty: false, dashboardId: null });
        }
      } catch (err: any) {
        if (!cancelled) setError('This shared dashboard was not found or is no longer public.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [shareId, loadFromDb]);

  const handleClone = async () => {
    if (!dashboard || !user) return;
    setCloning(true);
    try {
      const snapshot = useStore.getState().getSerializableState();
      const cloned = await saveDashboard(null, `${dashboard.name} (Copy)`, snapshot);
      navigate(`/editor/${cloned.id}`, { replace: true });
    } catch (err) {
      console.error('Clone failed:', err);
    } finally {
      setCloning(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Loading shared dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Not Found</h2>
        <p>{error}</p>
        <Button appearance="primary" onClick={() => navigate('/editor')}>
          Go to Editor
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className={styles.banner}>
        <span>Viewing shared dashboard: {dashboard?.name}</span>
        {user && (
          <Button
            size="small"
            appearance="outline"
            style={{ color: 'white', borderColor: 'white' }}
            icon={<CopyRegular />}
            disabled={cloning}
            onClick={handleClone}
          >
            {cloning ? 'Cloning...' : 'Clone to My Dashboards'}
          </Button>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AppShell readOnly>
          <Canvas readOnly />
        </AppShell>
      </div>
    </div>
  );
};
