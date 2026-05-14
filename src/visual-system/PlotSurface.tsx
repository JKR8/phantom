import React, { useEffect, useRef, useState } from 'react';
import * as Plot from '@observablehq/plot';
import { makeStyles, shorthands } from '@fluentui/react-components';
import { visualTheme } from './visualTheme';

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: '100%',
    minWidth: 0,
    minHeight: 0,
    position: 'relative',
    ...shorthands.overflow('hidden'),
  },
  empty: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: visualTheme.colors.muted,
    fontSize: '12px',
    backgroundColor: visualTheme.colors.surface,
  },
  plot: {
    width: '100%',
    height: '100%',
    '& svg': {
      display: 'block',
      width: '100%',
      height: '100%',
    },
    '& figure': {
      margin: 0,
      width: '100%',
      height: '100%',
    },
  },
});

interface PlotSurfaceProps {
  options: Plot.PlotOptions;
  empty?: boolean;
  emptyMessage?: string;
  ariaLabel?: string;
  onDatumClick?: (key: string, event: MouseEvent) => void;
}

const getKeyFromElement = (element: Element | null) => {
  if (!element) return '';
  const labelled = element.closest('[aria-label]');
  const ariaLabel = labelled?.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.split('\n')[0];

  const title = element.querySelector('title')?.textContent ||
    element.closest('g')?.querySelector('title')?.textContent;
  return title ? title.split('\n')[0] : '';
};

export const PlotSurface: React.FC<PlotSurfaceProps> = ({
  options,
  empty,
  emptyMessage = 'No data available',
  ariaLabel = 'Analytical chart',
  onDatumClick,
}) => {
  const styles = useStyles();
  const rootRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!rootRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.contentRect;
      setSize({
        width: Math.max(0, Math.floor(rect.width)),
        height: Math.max(0, Math.floor(rect.height)),
      });
    });
    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = plotRef.current;
    if (!node || empty || size.width < 40 || size.height < 40) return;

    node.replaceChildren();
    const plot = Plot.plot({
      ...options,
      width: size.width,
      height: size.height,
      document,
    });
    plot.setAttribute('role', 'img');
    plot.setAttribute('aria-label', ariaLabel);
    node.appendChild(plot);

    const handleClick = (event: Event) => {
      const key = getKeyFromElement(event.target as Element);
      if (key) onDatumClick?.(key, event as MouseEvent);
    };

    if (onDatumClick) {
      plot.addEventListener('click', handleClick);
      plot.style.cursor = 'pointer';
    }

    return () => {
      plot.removeEventListener('click', handleClick);
      plot.remove();
    };
  }, [ariaLabel, empty, onDatumClick, options, size.height, size.width]);

  return (
    <div ref={rootRef} className={styles.root}>
      {empty ? (
        <div className={styles.empty}>{emptyMessage}</div>
      ) : (
        <div ref={plotRef} className={styles.plot} />
      )}
    </div>
  );
};
