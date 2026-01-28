import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner, makeStyles } from '@fluentui/react-components';
import { AppShell } from '../components/AppShell';
import { Canvas } from '../components/Canvas';
import { AutoSave } from '../components/AutoSave';
import { useAuth } from '../auth/useAuth';
import { useStore } from '../store/useStore';
import { loadDashboard } from '../lib/dashboards';
import { isSupabaseConfigured } from '../lib/supabase';

const useStyles = makeStyles({
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
});

export const EditorPage: React.FC = () => {
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const loadFromDb = useStore((s) => s.loadDashboardFromDb);

  useEffect(() => {
    if (!id) {
      // Read directly from the store to avoid stale closures and avoid
      // triggering this effect when dashboardId changes (e.g., during save).
      if (useStore.getState().dashboardId) {
        useStore.getState().resetToNew();
      }
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const db = await loadDashboard(id);
        if (!cancelled) {
          loadFromDb(db);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || 'Dashboard not found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, loadFromDb]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loading}>
        <div style={{ textAlign: 'center' }}>
          <h2>Dashboard not found</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Canvas />
      {user && isSupabaseConfigured && <AutoSave />}
    </AppShell>
  );
};
