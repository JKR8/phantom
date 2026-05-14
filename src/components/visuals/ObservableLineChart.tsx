import React, { useMemo } from 'react';
import * as Plot from '@observablehq/plot';
import { useFilteredSales, useSetHighlight } from '../../store/useStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  PlotSurface,
  basePlotOptions,
  createVisualThemeFromPalette,
  formatMetric,
  prepareTimeSeriesData,
} from '../../visual-system';

interface ObservableLineChartProps {
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  comparison?: 'none' | 'pl' | 'py' | 'both';
  timeGrain?: 'month' | 'quarter' | 'year';
  showForecast?: boolean;
  stepped?: boolean;
  mode?: 'line' | 'area';
}

const getTimeDimension = (grain: 'month' | 'quarter' | 'year') => `_time_${grain}`;

export const ObservableLineChart: React.FC<ObservableLineChartProps> = ({
  metric,
  manualData,
  comparison = 'both',
  timeGrain = 'month',
  showForecast = false,
  stepped = false,
  mode = 'line',
}) => {
  const timeDimension = getTimeDimension(timeGrain);
  const filteredRows = useFilteredSales(timeDimension);
  const setHighlight = useSetHighlight();
  const activePalette = useThemeStore((state) => state.activePalette);
  const theme = useMemo(() => createVisualThemeFromPalette(activePalette.colors), [activePalette.colors]);
  const rows = useMemo(() => prepareTimeSeriesData(filteredRows, metric, timeGrain, manualData), [filteredRows, manualData, metric, timeGrain]);

  const showPL = comparison === 'pl' || comparison === 'both';
  const showPY = comparison === 'py' || comparison === 'both';
  const curve = stepped ? 'step-after' : 'catmull-rom';
  const forecastStart = showForecast ? Math.max(1, Math.floor(rows.length * 0.7)) : rows.length;
  const actualRows = rows.slice(0, Math.min(rows.length, forecastStart + 1));
  const forecastRows = showForecast ? rows.slice(Math.max(0, forecastStart)) : [];
  const max = Math.max(...rows.flatMap((row) => [row.ac, showPL ? row.pl : 0, showPY ? row.py : 0]), 1);

  const options = useMemo<Plot.PlotOptions>(() => ({
    ...basePlotOptions(theme, {
      marginTop: 14,
      marginRight: 18,
      marginBottom: 32,
      marginLeft: 46,
    }),
    x: {
      tickFormat: (value: number) => rows[value]?.label || '',
      ticks: rows.map((row) => row.index),
      label: null,
    },
    y: {
      domain: [0, max * 1.15],
      label: null,
      grid: true,
      tickFormat: (value: number) => formatMetric(metric, value, true),
    },
    marks: [
      Plot.ruleY([0], { stroke: theme.colors.grid }),
      mode === 'area' ? Plot.areaY(rows, {
        x: 'index',
        y: 'ac',
        fill: theme.colors.primary,
        fillOpacity: 0.16,
        curve,
      }) : null,
      showPY ? Plot.lineY(rows, {
        x: 'index',
        y: 'py',
        stroke: theme.colors.subtle,
        strokeWidth: 1.5,
        strokeDasharray: '2 4',
        curve,
      }) : null,
      showPL ? Plot.lineY(rows, {
        x: 'index',
        y: 'pl',
        stroke: '#64748B',
        strokeWidth: 1.5,
        strokeDasharray: '5 5',
        curve,
      }) : null,
      Plot.lineY(actualRows, {
        x: 'index',
        y: 'ac',
        stroke: theme.colors.primary,
        strokeWidth: 2.75,
        curve,
        title: (row) => `${row.label}\n${row.formattedAc}`,
      }),
      forecastRows.length > 1 ? Plot.lineY(forecastRows, {
        x: 'index',
        y: 'ac',
        stroke: theme.colors.primary,
        strokeWidth: 2.75,
        strokeDasharray: '6 5',
        curve,
        title: (row) => `${row.label}\n${row.formattedAc}`,
      }) : null,
      Plot.dot(rows, {
        x: 'index',
        y: 'ac',
        r: 3.2,
        fill: theme.colors.surface,
        stroke: theme.colors.primary,
        strokeWidth: 2,
        title: (row) => `${row.label}\n${row.formattedAc}`,
        ariaLabel: (row) => row.label,
      }),
    ],
  }), [actualRows, curve, forecastRows, max, metric, mode, rows, showPL, showPY, theme]);

  return (
    <PlotSurface
      options={options}
      empty={rows.length === 0}
      ariaLabel={`${metric} trend`}
      onDatumClick={(key) => setHighlight(timeDimension, key, false)}
    />
  );
};
