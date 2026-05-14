import React, { useMemo } from 'react';
import * as Plot from '@observablehq/plot';
import {
  Button,
  Text,
  Title1,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import {
  PlotSurface,
  basePlotOptions,
  formatMetric,
  visualTheme,
} from '../visual-system';

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontFamily: visualTheme.fontFamily,
  },
  topBar: {
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding('0', '24px'),
    borderBottom: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    ...shorthands.padding('24px'),
    maxWidth: '1320px',
    margin: '0 auto',
  },
  subtitle: {
    color: '#475569',
    fontSize: '14px',
  },
  grid: {
    maxWidth: '1320px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
    gap: '16px',
    ...shorthands.padding('0', '24px', '28px'),
  },
  metricBand: {
    gridColumn: 'span 12',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    '@media (max-width: 720px)': {
      gridTemplateColumns: '1fr',
    },
  },
  metric: {
    backgroundColor: '#FFFFFF',
    ...shorthands.border('1px', 'solid', '#E2E8F0'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('14px'),
    minHeight: '92px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metricValue: {
    color: '#0F172A',
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: '32px',
  },
  metricDelta: {
    color: '#059669',
    fontSize: '12px',
    fontWeight: 700,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    ...shorthands.border('1px', 'solid', '#E2E8F0'),
    ...shorthands.borderRadius('8px'),
    boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    ...shorthands.overflow('hidden'),
  },
  wide: {
    gridColumn: 'span 7',
    '@media (max-width: 720px)': {
      gridColumn: 'span 12',
    },
  },
  medium: {
    gridColumn: 'span 5',
    '@media (max-width: 720px)': {
      gridColumn: 'span 12',
    },
  },
  half: {
    gridColumn: 'span 6',
    '@media (max-width: 720px)': {
      gridColumn: 'span 12',
    },
  },
  panelHeader: {
    ...shorthands.padding('14px', '16px', '8px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  panelTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#0F172A',
  },
  panelNote: {
    fontSize: '12px',
    color: '#64748B',
  },
  chart: {
    flex: 1,
    minHeight: 0,
    ...shorthands.padding('0', '10px', '10px'),
  },
});

const rankingRows = [
  { label: 'Enterprise', value: 1620000 },
  { label: 'Professional', value: 1240000 },
  { label: 'Starter', value: 690000 },
  { label: 'Retail Direct', value: 530000 },
  { label: 'Partner', value: 430000 },
  { label: 'Digital', value: 285000 },
];

const trendRows = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((label, index) => ({
  label,
  index,
  actual: 720 + index * 48 + Math.sin(index * 1.4) * 92,
  plan: 700 + index * 42,
}));

const scatterRows = Array.from({ length: 56 }, (_, index) => {
  const x = 40 + index * 4.8 + Math.sin(index * 0.8) * 22;
  return {
    label: `Account ${index + 1}`,
    revenue: x * 12000,
    margin: 18 + x * 0.15 + Math.cos(index * 0.65) * 7,
  };
});

const distributionRows = Array.from({ length: 160 }, (_, index) => ({
  value: 55 + Math.sin(index * 0.31) * 17 + Math.cos(index * 0.11) * 11 + (index % 9),
}));

const buildHistogram = (rows: Array<{ value: number }>, binCount = 18) => {
  const values = rows.map((row) => row.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / binCount;
  return Array.from({ length: binCount }, (_, index) => {
    const x0 = min + index * width;
    const x1 = index === binCount - 1 ? max : x0 + width;
    return {
      x0,
      x1,
      mid: (x0 + x1) / 2,
      count: values.filter((value) => value >= x0 && value <= x1).length,
    };
  });
};

const Panel: React.FC<{
  title: string;
  note: string;
  className: string;
  children: React.ReactNode;
}> = ({ title, note, className, children }) => {
  const styles = useStyles();
  return (
    <section className={`${styles.panel} ${className}`}>
      <div className={styles.panelHeader}>
        <Text className={styles.panelTitle}>{title}</Text>
        <Text className={styles.panelNote}>{note}</Text>
      </div>
      <div className={styles.chart}>{children}</div>
    </section>
  );
};

export const VisualLabPage: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const histogramRows = useMemo(() => buildHistogram(distributionRows), []);

  const rankingOptions = useMemo<Plot.PlotOptions>(() => ({
    ...basePlotOptions(visualTheme, { marginLeft: 108, marginRight: 72, marginBottom: 28 }),
    x: { grid: true, label: null, tickFormat: () => '' },
    y: { domain: rankingRows.map((row) => row.label), label: null, grid: false, padding: 0.28 },
    marks: [
      Plot.barX(rankingRows, {
        y: 'label',
        x: 'value',
        rx: 5,
        fill: (_row, index) => visualTheme.colors.categorical[index % visualTheme.colors.categorical.length],
        title: (row) => `${row.label}\n${formatMetric('revenue', row.value)}`,
      }),
      Plot.text(rankingRows, {
        y: 'label',
        x: 'value',
        text: (row) => formatMetric('revenue', row.value, true),
        dx: 8,
        fill: visualTheme.colors.muted,
        fontSize: 11,
      }),
    ],
  }), []);

  const trendOptions = useMemo<Plot.PlotOptions>(() => ({
    ...basePlotOptions(visualTheme, { marginLeft: 50, marginRight: 20, marginBottom: 32 }),
    x: { ticks: trendRows.map((row) => row.index), tickFormat: (value: number) => trendRows[value]?.label || '', label: null },
    y: { grid: true, label: null, tickFormat: (value: number) => `$${Math.round(value)}K` },
    marks: [
      Plot.areaY(trendRows, { x: 'index', y: 'actual', fill: visualTheme.colors.primary, fillOpacity: 0.14, curve: 'catmull-rom' }),
      Plot.lineY(trendRows, { x: 'index', y: 'plan', stroke: visualTheme.colors.subtle, strokeDasharray: '4 4', strokeWidth: 1.5, curve: 'catmull-rom' }),
      Plot.lineY(trendRows, { x: 'index', y: 'actual', stroke: visualTheme.colors.primary, strokeWidth: 2.75, curve: 'catmull-rom' }),
      Plot.dot(trendRows, { x: 'index', y: 'actual', r: 3, fill: '#FFFFFF', stroke: visualTheme.colors.primary, strokeWidth: 2, title: (row) => `${row.label}\n$${Math.round(row.actual)}K` }),
    ],
  }), []);

  const scatterOptions = useMemo<Plot.PlotOptions>(() => ({
    ...basePlotOptions(visualTheme, { marginLeft: 56, marginBottom: 42 }),
    x: { label: 'Revenue', grid: true, tickFormat: (value: number) => formatMetric('revenue', value, true) },
    y: { label: 'Margin %', grid: true },
    marks: [
      Plot.dot(scatterRows, {
        x: 'revenue',
        y: 'margin',
        r: 4.2,
        fill: visualTheme.colors.primary,
        fillOpacity: 0.72,
        stroke: '#FFFFFF',
        title: (row) => `${row.label}\n${formatMetric('revenue', row.revenue)}\n${row.margin.toFixed(1)}%`,
      }),
      Plot.linearRegressionY(scatterRows, { x: 'revenue', y: 'margin', stroke: visualTheme.colors.negative, strokeWidth: 2 }),
    ],
  }), []);

  const histogramOptions = useMemo<Plot.PlotOptions>(() => ({
    ...basePlotOptions(visualTheme, { marginLeft: 42, marginBottom: 36 }),
    x: { label: 'Cycle time', grid: false },
    y: { label: null, grid: true },
    marks: [
      Plot.rectY(histogramRows, {
        x1: 'x0',
        x2: 'x1',
        y: 'count',
        inset: 1,
        rx: 3,
        fill: visualTheme.colors.categorical[4],
        fillOpacity: 0.82,
        title: (row) => `${row.count} observations`,
      }),
      Plot.ruleY([0], { stroke: visualTheme.colors.grid }),
    ],
  }), [histogramRows]);

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Button appearance="subtle" icon={<ArrowLeftRegular />} onClick={() => navigate('/editor')}>
          Editor
        </Button>
        <Text weight="semibold">Phantom Visual Lab</Text>
      </div>
      <header className={styles.header}>
        <Title1>Seaborn + Observable Quality Pass</Title1>
        <Text className={styles.subtitle}>
          A working gallery for the new chart grammar: layered marks, quiet axes, direct labels, distributions, and statistical context.
        </Text>
      </header>
      <main className={styles.grid}>
        <section className={styles.metricBand}>
          {[
            ['Revenue', '$4.8M', '+12.4%'],
            ['Margin', '31.8%', '+3.1 pts'],
            ['Cycle Time', '62.4h', '-8.7%'],
            ['Expansion', '$842K', '+18.9%'],
          ].map(([label, value, delta]) => (
            <div key={label} className={styles.metric}>
              <Text className={styles.metricLabel}>{label}</Text>
              <Text className={styles.metricValue}>{value}</Text>
              <Text className={styles.metricDelta}>{delta}</Text>
            </div>
          ))}
        </section>
        <Panel title="Revenue Ranking" note="Sorted bars with direct labels and compact value formatting." className={styles.wide}>
          <PlotSurface options={rankingOptions} ariaLabel="Revenue ranking example" />
        </Panel>
        <Panel title="Performance Trend" note="Actual, plan, and confidence-style area layers without dashboard clutter." className={styles.medium}>
          <PlotSurface options={trendOptions} ariaLabel="Performance trend example" />
        </Panel>
        <Panel title="Margin Model" note="Scatter density with regression context and readable axes." className={styles.half}>
          <PlotSurface options={scatterOptions} ariaLabel="Scatter regression example" />
        </Panel>
        <Panel title="Cycle Time Distribution" note="Distribution-first view for operational spread, not just aggregates." className={styles.half}>
          <PlotSurface options={histogramOptions} ariaLabel="Histogram example" />
        </Panel>
      </main>
    </div>
  );
};
