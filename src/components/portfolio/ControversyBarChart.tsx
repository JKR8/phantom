import React, { useMemo } from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import { useStore, useFilteredControversyScores } from '../../store/useStore';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.padding('8px'),
    backgroundColor: 'white',
  },
  legend: {
    display: 'flex',
    gap: '8px',
    marginBottom: '4px',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    ...shorthands.padding('2px', '4px'),
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '9px',
    color: '#605E5C',
    cursor: 'pointer',
    ...shorthands.padding('1px', '4px'),
    ...shorthands.borderRadius('4px'),
    whiteSpace: 'nowrap',
    ':hover': {
      backgroundColor: '#F5F5F5',
    },
  },
  legendItemActive: {
    backgroundColor: '#FFF4E5',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    ...shorthands.borderRadius('50%'),
  },
  chartContainer: {
    flex: 1,
    minHeight: 0,
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: '#A19F9D',
    fontSize: '12px',
  },
});

// Score colors for stacked bars (0-5 scale)
const SCORE_COLORS: Record<number, string> = {
  0: '#E8E8E8',  // Gray - no score
  1: '#F5D79E',  // Light amber
  2: '#EDBE6A',  // Medium light amber
  3: '#E5A645',  // Medium amber
  4: '#D4A548',  // Gold
  5: '#8B6914',  // Dark gold/brown
};

interface ControversyBarChartProps {
  dimension?: 'Group' | 'Region' | 'Sector';
}

export const ControversyBarChart: React.FC<ControversyBarChartProps> = ({ dimension = 'Group' }) => {
  const styles = useStyles();
  const filteredScores = useFilteredControversyScores();
  const portfolioEntities = useStore((state) => state.portfolioEntities);
  const setFilter = useStore((state) => state.setFilter);
  const activeFilters = useStore((state) => state.filters);

  // Create stacked data - aggregate market values (in millions) by score level
  const data = useMemo(() => {
    const aggregation: Record<string, Record<number, number>> = {};

    filteredScores.forEach((score) => {
      let key = '';
      if (dimension === 'Group') {
        key = score.group;
      } else if (dimension === 'Region') {
        key = score.region;
      } else if (dimension === 'Sector') {
        const entity = portfolioEntities.find(e => e.id === score.entityId);
        key = entity?.sector || 'Unknown';
      }

      if (!aggregation[key]) {
        aggregation[key] = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      }

      // Bucket the score into 0-5 (scores are 1-5 range, with some edge cases)
      const scoreValue = Math.min(5, Math.max(0, Math.floor(score.score)));
      // Aggregate market value in millions
      const mvInMillions = score.marketValue / 1000000;
      aggregation[key][scoreValue] = (aggregation[key][scoreValue] || 0) + mvInMillions;
    });

    return Object.entries(aggregation)
      .map(([name, scores]) => ({
        name,
        score0: Math.round(scores[0] || 0),
        score1: Math.round(scores[1] || 0),
        score2: Math.round(scores[2] || 0),
        score3: Math.round(scores[3] || 0),
        score4: Math.round(scores[4] || 0),
        score5: Math.round(scores[5] || 0),
        total: Math.round(Object.values(scores).reduce((a, b) => a + b, 0)),
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredScores, dimension, portfolioEntities]);

  // Calculate max value for domain
  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(d => d.total), 0);
    // Round up to nearest 1000 for nice tick marks
    return Math.ceil(max / 1000) * 1000;
  }, [data]);

  const handleLegendClick = (scoreValue: number) => {
    const currentFilter = activeFilters['Score'];
    const scoreString = String(scoreValue);
    if (currentFilter === scoreString) {
      setFilter('Score', null);
    } else {
      setFilter('Score', scoreString);
    }
  };

  const legendItems = [
    { label: 'Score 0', color: SCORE_COLORS[0], value: 0 },
    { label: 'Score 1', color: SCORE_COLORS[1], value: 1 },
    { label: 'Score 2', color: SCORE_COLORS[2], value: 2 },
    { label: 'Score 3', color: SCORE_COLORS[3], value: 3 },
    { label: 'Score 4', color: SCORE_COLORS[4], value: 4 },
    { label: 'Score 5', color: SCORE_COLORS[5], value: 5 },
  ];

  const activeScoreFilter = activeFilters['Score'];

  if (data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Text>No controversy data available. Switch to Portfolio scenario.</Text>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.legend}>
        {legendItems.map((item) => (
          <div
            key={item.label}
            className={`${styles.legendItem} ${activeScoreFilter === String(item.value) ? styles.legendItemActive : ''}`}
            onClick={() => handleLegendClick(item.value)}
          >
            <div className={styles.legendDot} style={{ backgroundColor: item.color }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 45, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tickFormatter={(value) => `${Math.round(value / 1000)}K`}
              ticks={[0, 1000, 2000]}
              domain={[0, Math.max(2000, maxValue)]}
              tick={{ fontSize: 9, fill: '#605E5C' }}
              axisLine={{ stroke: '#E1DFDD' }}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 9, fill: '#605E5C' }}
              width={95}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: '11px', backgroundColor: 'white', border: '1px solid #E1DFDD' }}
              formatter={(value: any) => `${value}M`}
            />
            {/* Vertical dotted reference lines at 1K and 2K */}
            <ReferenceLine x={1000} stroke="#D0D0D0" strokeDasharray="4 4" />
            <ReferenceLine x={2000} stroke="#D0D0D0" strokeDasharray="4 4" />
            {/* Stacked bars for each score level */}
            <Bar dataKey="score0" stackId="a" fill={SCORE_COLORS[0]} name="Score 0" />
            <Bar dataKey="score1" stackId="a" fill={SCORE_COLORS[1]} name="Score 1" />
            <Bar dataKey="score2" stackId="a" fill={SCORE_COLORS[2]} name="Score 2" />
            <Bar dataKey="score3" stackId="a" fill={SCORE_COLORS[3]} name="Score 3" />
            <Bar dataKey="score4" stackId="a" fill={SCORE_COLORS[4]} name="Score 4" />
            <Bar dataKey="score5" stackId="a" fill={SCORE_COLORS[5]} name="Score 5" radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="total"
                position="right"
                formatter={(value: any) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                  if (value > 0) return `${value}`;
                  return '';
                }}
                style={{ fontSize: 9, fill: '#605E5C' }}
              />
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
