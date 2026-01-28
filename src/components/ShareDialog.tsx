import React, { useState } from 'react';
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Switch,
  Input,
  Text,
  makeStyles,
} from '@fluentui/react-components';
import { ShareRegular, CopyRegular, CheckmarkRegular } from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { toggleShare } from '../lib/dashboards';

const useStyles = makeStyles({
  topButton: {
    color: 'white',
    ':hover': {
      backgroundColor: '#3b3a39',
      color: 'white',
    },
  },
  urlRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginTop: '12px',
  },
  urlInput: {
    flex: 1,
  },
});

export const ShareButton: React.FC = () => {
  const styles = useStyles();
  const dashboardId = useStore((s) => s.dashboardId);
  const isPublic = useStore((s) => s.isPublic);
  const shareId = useStore((s) => s.shareId);
  const [open, setOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!dashboardId) return null;

  const shareUrl = shareId ? `${window.location.origin}/share/${shareId}` : '';

  const handleToggle = async () => {
    setToggling(true);
    try {
      const result = await toggleShare(dashboardId, !isPublic);
      useStore.getState().setDashboardMeta({
        isPublic: !isPublic,
        shareId: result.share_id,
      });
    } catch (err) {
      console.error('Toggle share failed:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Button
        appearance="subtle"
        className={styles.topButton}
        size="small"
        icon={<ShareRegular />}
        onClick={() => setOpen(true)}
      >
        Share
      </Button>

      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Share Dashboard</DialogTitle>
            <DialogContent>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Switch
                  checked={isPublic}
                  onChange={handleToggle}
                  disabled={toggling}
                  label={isPublic ? 'Public - anyone with the link can view' : 'Private - only you can access'}
                />
              </div>

              {isPublic && shareUrl && (
                <>
                  <Text size={200} block style={{ marginBottom: '4px', color: '#605E5C' }}>
                    Share this link:
                  </Text>
                  <div className={styles.urlRow}>
                    <Input
                      className={styles.urlInput}
                      value={shareUrl}
                      readOnly
                      size="small"
                    />
                    <Button
                      size="small"
                      icon={copied ? <CheckmarkRegular /> : <CopyRegular />}
                      onClick={handleCopy}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setOpen(false)}>
                Done
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
