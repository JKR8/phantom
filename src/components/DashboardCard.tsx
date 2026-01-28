import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  Text,
  Button,
  Badge,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import {
  OpenRegular,
  ShareRegular,
  DeleteRegular,
} from '@fluentui/react-icons';
import type { DbDashboard } from '../types';
import { deleteDashboard, toggleShare } from '../lib/dashboards';

const useStyles = makeStyles({
  card: {
    cursor: 'pointer',
    ...shorthands.padding('16px'),
    ':hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
    color: '#605E5C',
    fontSize: '12px',
  },
  actions: {
    display: 'flex',
    gap: '4px',
    marginTop: '12px',
  },
});

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface DashboardCardProps {
  dashboard: DbDashboard;
  onDeleted: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ dashboard, onDeleted }) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDashboard(dashboard.id);
      setConfirmDelete(false);
      onDeleted();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className={styles.card}>
        <CardHeader
          header={<Text weight="semibold" size={400}>{dashboard.name}</Text>}
          description={
            <div className={styles.meta}>
              <Badge appearance="outline" size="small">{dashboard.scenario}</Badge>
              <span>Edited {timeAgo(dashboard.updated_at)}</span>
              {dashboard.is_public && (
                <Badge appearance="tint" color="brand" size="small">Public</Badge>
              )}
            </div>
          }
        />
        <div className={styles.actions}>
          <Button
            size="small"
            icon={<OpenRegular />}
            onClick={() => navigate(`/editor/${dashboard.id}`)}
          >
            Open
          </Button>
          <Button
            size="small"
            icon={<ShareRegular />}
            appearance="subtle"
            onClick={async (e) => {
              e.stopPropagation();
              if (!dashboard.is_public) {
                const result = await toggleShare(dashboard.id, true);
                const url = `${window.location.origin}/share/${result.share_id}`;
                await navigator.clipboard.writeText(url);
              } else {
                const url = `${window.location.origin}/share/${dashboard.share_id}`;
                await navigator.clipboard.writeText(url);
              }
            }}
          >
            {dashboard.is_public ? 'Copy Link' : 'Share'}
          </Button>
          <Button
            size="small"
            icon={<DeleteRegular />}
            appearance="subtle"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDelete(true);
            }}
          >
            Delete
          </Button>
        </div>
      </Card>

      <Dialog open={confirmDelete} onOpenChange={(_, data) => setConfirmDelete(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete Dashboard</DialogTitle>
            <DialogContent>
              Are you sure you want to delete "{dashboard.name}"? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                style={{ backgroundColor: '#D13438' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
