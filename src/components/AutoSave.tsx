import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { saveDashboard } from '../lib/dashboards';

export const AutoSave: React.FC = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirty = useStore((s) => s.isDirty);
  const dashboardId = useStore((s) => s.dashboardId);
  const dashboardName = useStore((s) => s.dashboardName);

  useEffect(() => {
    if (!isDirty || !dashboardId) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const snapshot = useStore.getState().getSerializableState();
        await saveDashboard(dashboardId, dashboardName, snapshot);
        useStore.getState().markClean();
        useStore.setState({ lastSavedAt: new Date().toISOString() });
      } catch (err) {
        console.error('Auto-save failed:', err);
        useStore.getState().markDirty();
      }
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, dashboardId, dashboardName]);

  return null;
};
