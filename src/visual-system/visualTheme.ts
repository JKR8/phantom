import type { VisualTheme } from './types';

export const seabornCategorical = ['#4C78A8', '#F58518', '#54A24B', '#E45756', '#72B7B2', '#B279A2', '#FF9DA6', '#9D755D', '#BAB0AC'];
export const seabornMuted = ['#4878D0', '#EE854A', '#6ACC64', '#D65F5F', '#956CB4', '#8C613C', '#DC7EC0', '#797979', '#D5BB67', '#82C6E2'];

export const visualTheme: VisualTheme = {
  name: 'Phantom Seaborn',
  fontFamily: '"Inter", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
  colors: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    ink: '#0F172A',
    muted: '#475569',
    subtle: '#94A3B8',
    grid: '#E2E8F0',
    border: '#E5E7EB',
    primary: '#2563EB',
    primaryMuted: '#DBEAFE',
    positive: '#059669',
    negative: '#DC2626',
    warning: '#D97706',
    categorical: seabornCategorical,
    mutedCategorical: seabornMuted,
    sequential: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6', '#1D4ED8', '#1E3A8A'],
    diverging: ['#B91C1C', '#F87171', '#F8FAFC', '#60A5FA', '#1D4ED8'],
  },
  typography: {
    axis: 10,
    label: 11,
    value: 13,
    title: 16,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
  },
  plot: {
    gridOpacity: 0.78,
    axisOpacity: 0.6,
    markOpacity: 0.9,
    labelColor: '#475569',
  },
};

export const createVisualThemeFromPalette = (palette?: string[]): VisualTheme => {
  if (!palette || palette.length === 0) return visualTheme;
  return {
    ...visualTheme,
    colors: {
      ...visualTheme.colors,
      categorical: palette,
      mutedCategorical: palette.map((color) => color),
      primary: palette[0] || visualTheme.colors.primary,
      primaryMuted: `${palette[0] || visualTheme.colors.primary}22`,
    },
  };
};

export const getVisualColor = (index: number, theme: VisualTheme = visualTheme) => {
  const colors = theme.colors.categorical.length > 0 ? theme.colors.categorical : seabornCategorical;
  return colors[index % colors.length];
};

