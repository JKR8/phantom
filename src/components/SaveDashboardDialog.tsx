import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Label,
  makeStyles,
} from '@fluentui/react-components';
import { SaveRegular } from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { useAuth } from '../auth/useAuth';
import { saveDashboard } from '../lib/dashboards';
import { isSupabaseConfigured } from '../lib/supabase';

const useStyles = makeStyles({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  topButton: {
    color: 'white',
    ':hover': {
      backgroundColor: '#3b3a39',
      color: 'white',
    },
  },
  savedIndicator: {
    color: '#A4DE6C',
    fontSize: '12px',
    marginLeft: '4px',
  },
});

export const SaveDashboardButton: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const dashboardId = useStore((s) => s.dashboardId);
  const dashboardName = useStore((s) => s.dashboardName);
  const isDirty = useStore((s) => s.isDirty);
  const lastSavedAt = useStore((s) => s.lastSavedAt);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(dashboardName);
  const [saving, setSaving] = useState(false);

  const handleQuickSave = async () => {
    if (!dashboardId) {
      setName(dashboardName);
      setOpen(true);
      return;
    }
    setSaving(true);
    try {
      const snapshot = useStore.getState().getSerializableState();
      await saveDashboard(dashboardId, dashboardName, snapshot);
      useStore.getState().markClean();
      useStore.setState({ lastSavedAt: new Date().toISOString() });
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNew = async () => {
    setSaving(true);
    try {
      const snapshot = useStore.getState().getSerializableState();
      const db = await saveDashboard(null, name, snapshot);
      useStore.getState().setDashboardMeta({
        id: db.id,
        name: db.name,
        isPublic: db.is_public,
        shareId: db.share_id,
      });
      useStore.getState().markClean();
      useStore.setState({ lastSavedAt: db.updated_at });
      setOpen(false);
      navigate(`/editor/${db.id}`, { replace: true });
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user || !isSupabaseConfigured) {
    return (
      <Button
        appearance="subtle"
        className={styles.topButton}
        size="small"
        icon={<SaveRegular />}
        disabled
        title="Sign in to save dashboards"
      >
        Save
      </Button>
    );
  }

  return (
    <>
      <Button
        appearance="subtle"
        className={styles.topButton}
        size="small"
        icon={<SaveRegular />}
        onClick={handleQuickSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save'}
        {lastSavedAt && !isDirty && (
          <span className={styles.savedIndicator}>Saved</span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Save Dashboard</DialogTitle>
            <DialogContent>
              <div className={styles.field}>
                <Label htmlFor="dashboard-name">Dashboard Name</Label>
                <Input
                  id="dashboard-name"
                  value={name}
                  onChange={(_, data) => setName(data.value)}
                  placeholder="Enter a name..."
                  autoFocus
                />
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                disabled={!name.trim() || saving}
                onClick={handleSaveNew}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
