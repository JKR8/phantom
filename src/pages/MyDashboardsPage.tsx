import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  makeStyles,
  shorthands,
  Title1,
  Text,
  Button,
  Spinner,
} from '@fluentui/react-components';
import { AddRegular } from '@fluentui/react-icons';
import { useAuth } from '../auth/useAuth';
import { listMyDashboards } from '../lib/dashboards';
import { DashboardCard } from '../components/DashboardCard';
import type { DbDashboard } from '../types';

const useStyles = makeStyles({
  container: {
    maxWidth: '1200px',
    ...shorthands.margin('0', 'auto'),
    ...shorthands.padding('32px', '24px'),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  empty: {
    textAlign: 'center' as const,
    ...shorthands.padding('64px', '24px'),
    color: '#605E5C',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
  },
});

export const MyDashboardsPage: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [dashboards, setDashboards] = useState<DbDashboard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    fetchDashboards();
  }, [user, authLoading, navigate]);

  const fetchDashboards = async () => {
    try {
      const data = await listMyDashboards();
      setDashboards(data);
    } catch (err) {
      console.error('Failed to load dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Loading dashboards..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title1>My Dashboards</Title1>
        <Button
          appearance="primary"
          icon={<AddRegular />}
          onClick={() => navigate('/editor')}
        >
          New Dashboard
        </Button>
      </div>

      {dashboards.length === 0 ? (
        <div className={styles.empty}>
          <Text size={400} weight="semibold" block>No dashboards yet</Text>
          <Text block style={{ marginTop: '8px' }}>
            Create a new dashboard in the editor and save it to see it here.
          </Text>
          <Button
            appearance="primary"
            style={{ marginTop: '16px' }}
            onClick={() => navigate('/editor')}
          >
            Open Editor
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {dashboards.map((d) => (
            <DashboardCard
              key={d.id}
              dashboard={d}
              onDeleted={() => fetchDashboards()}
            />
          ))}
        </div>
      )}
    </div>
  );
};
