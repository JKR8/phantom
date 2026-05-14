import React, { useMemo } from 'react';
import * as Plot from '@observablehq/plot';
import { useFilteredSales, useHighlight, useSetHighlight, useStore } from '../../store/useStore';
import { useThemeStore } from '../../store/useThemeStore';
import {
  PlotSurface,
  basePlotOptions,
  createVisualThemeFromPalette,
  getVisualColor,
  prepareCategoricalData,
} from '../../visual-system';

interface ObservableBarChartProps {
  dimension: string;
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  topN?: string | number;
  sort?: 'desc' | 'asc' | 'alpha';
  showOther?: boolean;
  horizontal?: boolean;
  variant?: 'default' | 'lollipop';
}

export const ObservableBarChart: React.FC<ObservableBarChartProps> = ({
  dimension,
  metric,
  manualData,
  topN,
  sort = 'desc',
  showOther = false,
  horizontal = true,
  variant = 'default',
}) => {
  const filteredRows = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const highlight = useHighlight();
  const setHighlight = useSetHighlight();
  const activePalette = useThemeStore((state) => state.activePalette);
  const theme = useMemo(() => createVisualThemeFromPalette(activePalette.colors), [activePalette.colors]);

  const prepared = useMemo(() => prepareCategoricalData(filteredRows, {
    dimension,
    metric,
    manualData,
    limit: topN,
    sort,
    showOther,
    stores,
    products,
    customers,
  }), [customers, dimension, filteredRows, manualData, metric, products, showOther, sort, stores, topN]);

  const rows = prepared.rows;
  const highlightedValues = highlight?.dimension === dimension ? highlight.values : null;
  const max = Math.max(prepared.max, 1);

  const getFill = (label: string, index: number) => {
    if (highlightedValues && highlightedValues.size > 0 && !highlightedValues.has(label)) {
      return '#CBD5E1';
    }
    return getVisualColor(index, theme);
  };

  const options = useMemo<Plot.PlotOptions>(() => {
    const common = basePlotOptions(theme, {
      marginTop: 12,
      marginRight: horizontal ? 58 : 18,
      marginBottom: horizontal ? 28 : 46,
      marginLeft: horizontal ? 98 : 36,
    });

    if (horizontal) {
      const marks = variant === 'lollipop'
        ? [
            Plot.ruleX([0], { stroke: theme.colors.grid }),
            Plot.ruleY(rows, {
              y: 'label',
              x1: 0,
              x2: 'value',
              stroke: (_row, index) => getFill(rows[index].label, index),
              strokeWidth: 2,
              title: (row) => `${row.label}\n${row.formattedValue}`,
            }),
            Plot.dot(rows, {
              x: 'value',
              y: 'label',
              r: 5,
              fill: (_row, index) => getFill(rows[index].label, index),
              stroke: theme.colors.surface,
              strokeWidth: 1.5,
              title: (row) => `${row.label}\n${row.formattedValue}`,
            }),
            Plot.text(rows, {
              x: 'value',
              y: 'label',
              text: 'formattedValue',
              dx: 8,
              fill: theme.colors.muted,
              fontSize: 11,
              textAnchor: 'start',
            }),
          ]
        : [
            Plot.ruleX([0], { stroke: theme.colors.grid }),
            Plot.barX(rows, {
              y: 'label',
              x: 'value',
              fill: (_row, index) => getFill(rows[index].label, index),
              fillOpacity: theme.plot.markOpacity,
              rx: 5,
              title: (row) => `${row.label}\n${row.formattedValue}`,
              ariaLabel: (row) => row.label,
            }),
            Plot.text(rows, {
              x: 'value',
              y: 'label',
              text: 'formattedValue',
              dx: 7,
              fill: theme.colors.muted,
              fontSize: 11,
              textAnchor: 'start',
            }),
          ];

      return {
        ...common,
        x: {
          ...(common.x as object),
          domain: [0, max * 1.16],
          grid: true,
          tickFormat: (value: number) => prepared.rows.length > 0 ? '' : String(value),
        },
        y: {
          ...(common.y as object),
          domain: rows.map((row) => row.label),
          padding: 0.28,
          grid: false,
        },
        marks,
      };
    }

    return {
      ...common,
      x: {
        ...(common.x as object),
        domain: rows.map((row) => row.label),
        padding: 0.24,
        tickRotate: rows.length > 5 ? -25 : 0,
      },
      y: {
        ...(common.y as object),
        domain: [0, max * 1.18],
        grid: true,
        tickFormat: () => '',
      },
      marks: [
        Plot.ruleY([0], { stroke: theme.colors.grid }),
        Plot.barY(rows, {
          x: 'label',
          y: 'value',
          fill: (_row, index) => getFill(rows[index].label, index),
          fillOpacity: theme.plot.markOpacity,
          rx: 5,
          title: (row) => `${row.label}\n${row.formattedValue}`,
          ariaLabel: (row) => row.label,
        }),
        Plot.text(rows, {
          x: 'label',
          y: 'value',
          text: 'formattedValue',
          dy: -8,
          fill: theme.colors.muted,
          fontSize: 11,
        }),
      ],
    };
  }, [horizontal, max, prepared.rows.length, rows, theme, variant]);

  return (
    <PlotSurface
      options={options}
      empty={rows.length === 0}
      ariaLabel={`${dimension} by ${metric}`}
      onDatumClick={(key, event) => setHighlight(dimension, key, event.ctrlKey || event.metaKey)}
    />
  );
};
