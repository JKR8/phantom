import type * as Plot from '@observablehq/plot';
import type { VisualTheme } from './types';
import { visualTheme } from './visualTheme';

export const basePlotOptions = (
  theme: VisualTheme = visualTheme,
  options: Partial<Plot.PlotOptions> = {}
): Partial<Plot.PlotOptions> => ({
  marginTop: 16,
  marginRight: 18,
  marginBottom: 34,
  marginLeft: 48,
  style: {
    background: 'transparent',
    color: theme.colors.ink,
    fontFamily: theme.fontFamily,
    fontSize: `${theme.typography.axis}px`,
    overflow: 'visible',
  },
  grid: true,
  nice: true,
  x: {
    label: null,
    tickSize: 0,
    tickPadding: 8,
  },
  y: {
    label: null,
    tickSize: 0,
    tickPadding: 8,
    grid: true,
  },
  ...options,
});

