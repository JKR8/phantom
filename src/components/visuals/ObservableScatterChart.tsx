import React, { useMemo } from 'react';
import * as Plot from '@observablehq/plot';
import { useFilteredSales, useStore } from '../../store/useStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  PlotSurface,
  basePlotOptions,
  computeLinearTrend,
  createVisualThemeFromPalette,
  formatMetric,
  prepareScatterData,
} from '../../visual-system';

interface ObservableScatterChartProps {
  xMetric: string;
  yMetric: string;
  dimension?: string;
  manualData?: Array<{ label: string; value: number }>;
  showTrend?: boolean;
}

export const ObservableScatterChart: React.FC<ObservableScatterChartProps> = ({
  xMetric = 'revenue',
  yMetric = 'profit',
  dimension,
  manualData,
  showTrend = true,
}) => {
  const filteredRows = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const activePalette = useThemeStore((state) => state.activePalette);
  const theme = useMemo(() => createVisualThemeFromPalette(activePalette.colors), [activePalette.colors]);

  const points = useMemo(() => prepareScatterData(filteredRows, {
    xMetric,
    yMetric,
    dimension,
    manualData,
    stores,
    products,
    customers,
  }), [customers, dimension, filteredRows, manualData, products, stores, xMetric, yMetric]);

  const trend = useMemo(() => computeLinearTrend(points), [points]);
  const xMean = points.length ? points.reduce((sum, point) => sum + point.x, 0) / points.length : 0;
  const yMean = points.length ? points.reduce((sum, point) => sum + point.y, 0) / points.length : 0;

  const options = useMemo<Plot.PlotOptions>(() => ({
    ...basePlotOptions(theme, {
      marginTop: 16,
      marginRight: 20,
      marginBottom: 42,
      marginLeft: 56,
    }),
    x: {
      label: xMetric,
      grid: true,
      nice: true,
      tickFormat: (value: number) => formatMetric(xMetric, value, true),
    },
    y: {
      label: yMetric,
      grid: true,
      nice: true,
      tickFormat: (value: number) => formatMetric(yMetric, value, true),
    },
    marks: [
      Plot.ruleX([xMean], { stroke: theme.colors.grid, strokeDasharray: '3 4' }),
      Plot.ruleY([yMean], { stroke: theme.colors.grid, strokeDasharray: '3 4' }),
      Plot.dot(points, {
        x: 'x',
        y: 'y',
        r: 4.5,
        fill: theme.colors.primary,
        fillOpacity: 0.74,
        stroke: theme.colors.surface,
        strokeWidth: 1,
        title: (point) => `${point.label}\n${formatMetric(xMetric, point.x)}\n${formatMetric(yMetric, point.y)}`,
        ariaLabel: (point) => point.label,
      }),
      showTrend && trend.length === 2 ? Plot.lineY(trend, {
        x: 'x',
        y: 'y',
        stroke: theme.colors.negative,
        strokeWidth: 2,
        strokeOpacity: 0.76,
      }) : null,
    ],
  }), [points, showTrend, theme, trend, xMean, xMetric, yMean, yMetric]);

  return (
    <PlotSurface
      options={options}
      empty={points.length === 0}
      ariaLabel={`${xMetric} by ${yMetric} scatter`}
    />
  );
};
