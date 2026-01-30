import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { useFilteredSales, useHighlight, useSetHighlight } from '../store/useStore';

interface LineChartProps {
  metric: string;
  manualData?: Array<{ label: string; value: number }>;
  comparison?: 'none' | 'pl' | 'py' | 'both';
  timeGrain?: 'month' | 'quarter' | 'year';
  /** Variant type for different line chart styles */
  variant?: 'default' | 'slope';
  /** Show forecast line (dashed) after actual data */
  showForecast?: boolean;
  /** Use stepped line interpolation instead of smooth */
  stepped?: boolean;
}

// Time dimension key for cross-filtering
const getTimeDimension = (grain: 'month' | 'quarter' | 'year') => `_time_${grain}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

function getTimeBucket(date: Date, grain: 'month' | 'quarter' | 'year'): string {
  if (grain === 'year') return `${date.getFullYear()}`;
  if (grain === 'quarter') return QUARTERS[Math.floor(date.getMonth() / 3)];
  return MONTHS[date.getMonth()];
}

function getTimeBuckets(grain: 'month' | 'quarter' | 'year'): string[] {
  if (grain === 'year') return []; // dynamic
  if (grain === 'quarter') return [...QUARTERS];
  return [...MONTHS];
}

export const LineChart: React.FC<LineChartProps> = ({
  metric,
  manualData,
  comparison = 'both',
  timeGrain = 'month',
  variant = 'default',
  showForecast = false,
  stepped = false,
}) => {
  const timeDimension = getTimeDimension(timeGrain);
  const filteredSales = useFilteredSales(timeDimension);
  useHighlight(); // Subscribe to highlight changes for re-render
  const setHighlight = useSetHighlight();

  const handleClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const name = data.activePayload[0].payload.name;
      setHighlight(timeDimension, name, false);
    }
  };

  const data = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData.map((d) => ({
        name: d.label,
        ac: d.value,
        pl: 0,
        py: 0,
        variance: d.value,
        variancePct: '0.0',
      }));
    }

    const buckets = getTimeBuckets(timeGrain);
    const bucketData: Record<string, { ac: number; pl: number; py: number }> = {};

    // Initialize known buckets
    if (buckets.length > 0) {
      buckets.forEach(b => {
        bucketData[b] = { ac: 0, pl: 0, py: 0 };
      });
    }

    filteredSales.forEach((sale) => {
      const date = new Date(sale.date);
      const bucket = getTimeBucket(date, timeGrain);

      if (!bucketData[bucket]) {
        bucketData[bucket] = { ac: 0, pl: 0, py: 0 };
        if (buckets.length === 0) buckets.push(bucket);
      }

      // @ts-ignore
      const acVal = sale[metric] || sale[metric.toLowerCase()] || 0;
      // @ts-ignore
      const plVal = sale[`${metric}PL`] || acVal * 0.95;
      // @ts-ignore
      const pyVal = sale[`${metric}PY`] || acVal * 0.9;

      bucketData[bucket].ac += acVal;
      bucketData[bucket].pl += plVal;
      bucketData[bucket].py += pyVal;
    });

    // For dynamic year buckets, sort them
    const orderedBuckets = buckets.length > 0 ? buckets : Object.keys(bucketData).sort();

    return orderedBuckets.map(bucket => {
      const d = bucketData[bucket] || { ac: 0, pl: 0, py: 0 };
      const ac = d.ac;
      const pl = d.pl;
      const variance = ac - pl;
      const variancePct = pl !== 0 ? ((ac - pl) / pl) * 100 : 0;

      return {
        name: bucket,
        ac: Math.round(ac),
        pl: Math.round(pl),
        py: Math.round(d.py),
        variance: Math.round(variance),
        variancePct: variancePct.toFixed(1),
      };
    });
  }, [manualData, filteredSales, metric, timeGrain]);

  const isCurrencyMetric = (metricName: string) => {
    const key = metricName.toLowerCase();
    return ['revenue', 'profit', 'cost', 'salary', 'mrr', 'ltv', 'amount', 'price'].some(k => key.includes(k));
  };

  const formatValue = (value: number) => {
    if (metric.toLowerCase().includes('score')) return value.toFixed(2);
    if (isCurrencyMetric(metric)) {
      if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value.toString()}`;
    }
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const showPL = comparison === 'pl' || comparison === 'both';
  const showPY = comparison === 'py' || comparison === 'both';
  const showVariance = comparison !== 'none';

  // Line interpolation type
  const lineType = stepped ? 'stepAfter' : 'monotone';

  // Find max value for scaling
  const maxVal = useMemo(() => {
    const values = data.flatMap(d => {
      const v = [d.ac];
      if (showPL) v.push(d.pl);
      if (showPY) v.push(d.py);
      return v;
    });
    return Math.max(...values);
  }, [data, showPL, showPY]);

  // Split data for forecast variant
  const forecastSplitIndex = showForecast ? Math.floor(data.length * 0.7) : data.length;
  const actualData = data.slice(0, forecastSplitIndex + 1);
  const forecastData = showForecast ? data.slice(forecastSplitIndex) : [];

  // ========== SLOPE VARIANT ==========
  if (variant === 'slope') {
    // Slope chart: shows start and end values connected by lines
    const slopeData = data.length >= 2
      ? [data[0], data[data.length - 1]]
      : data;

    return (
      <div style={{ width: '100%', height: '100%', padding: '16px' }}>
        <div style={{
          display: 'flex',
          height: '100%',
          position: 'relative',
        }}>
          {/* Left column - Start values */}
          <div style={{
            width: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'flex-end',
            paddingRight: '8px',
          }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{slopeData[0]?.name}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#020617' }}>
              {formatValue(slopeData[0]?.ac || 0)}
            </div>
          </div>

          {/* SVG lines */}
          <svg style={{ flex: 1, height: '100%' }}>
            {/* AC line */}
            <line
              x1="0"
              y1="30%"
              x2="100%"
              y2={`${30 + ((slopeData[1]?.ac || 0) > (slopeData[0]?.ac || 0) ? -20 : 20)}%`}
              stroke="#252423"
              strokeWidth="2"
            />
            <circle cx="0" cy="30%" r="4" fill="#252423" />
            <circle cx="100%" cy={`${30 + ((slopeData[1]?.ac || 0) > (slopeData[0]?.ac || 0) ? -20 : 20)}%`} r="4" fill="#252423" />

            {/* PL line if shown */}
            {showPL && (
              <>
                <line
                  x1="0"
                  y1="50%"
                  x2="100%"
                  y2={`${50 + ((slopeData[1]?.pl || 0) > (slopeData[0]?.pl || 0) ? -15 : 15)}%`}
                  stroke="#999999"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <circle cx="0" cy="50%" r="3" fill="#999999" />
                <circle cx="100%" cy={`${50 + ((slopeData[1]?.pl || 0) > (slopeData[0]?.pl || 0) ? -15 : 15)}%`} r="3" fill="#999999" />
              </>
            )}
          </svg>

          {/* Right column - End values */}
          <div style={{
            width: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
            paddingLeft: '8px',
          }}>
            <div style={{ fontSize: '10px', color: '#64748b' }}>{slopeData[1]?.name}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#020617' }}>
              {formatValue(slopeData[1]?.ac || 0)}
            </div>
          </div>
        </div>

        {/* X-axis labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 80px',
          fontSize: '12px',
          color: '#64748b',
        }}>
          <span>{slopeData[0]?.name}</span>
          <span>{slopeData[1]?.name}</span>
        </div>
      </div>
    );
  }

  // ========== DEFAULT / FORECAST / STEPPED VARIANT ==========
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F2F1" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 9, fill: '#605E5C' }}
          axisLine={{ stroke: '#F3F2F1' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(value) => formatValue(value)}
          tick={{ fontSize: 9, fill: '#605E5C' }}
          axisLine={false}
          tickLine={false}
          domain={[0, maxVal * 1.2]}
        />
        <Tooltip
          formatter={(value: any, name: any) => [
            formatValue(Number(value)),
            name === 'ac' ? 'Actual' : name === 'pl' ? 'Plan' : name === 'py' ? 'Prior Year' : name === 'forecast' ? 'Forecast' : 'Variance'
          ]}
          contentStyle={{ fontSize: '11px', borderRadius: '4px', border: '1px solid #F3F2F1' }}
        />
        <ReferenceLine y={0} stroke="#252423" />
        {/* PL line (dashed grey) */}
        {showPL && (
          <Line
            type={lineType}
            dataKey="pl"
            stroke="#999999"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            name="pl"
          />
        )}
        {/* PY line (dotted blue-grey) */}
        {showPY && (
          <Line
            type={lineType}
            dataKey="py"
            stroke="#6B7280"
            strokeWidth={1}
            strokeDasharray="2 2"
            dot={false}
            name="py"
          />
        )}
        {/* AC line (solid) - show up to forecast split point if forecast mode */}
        <Line
          type={lineType}
          dataKey="ac"
          stroke="#252423"
          strokeWidth={2}
          dot={{ r: 3, fill: '#252423', stroke: '#252423' }}
          name="ac"
          data={showForecast ? actualData : data}
        />
        {/* Forecast line (dashed, same color) */}
        {showForecast && forecastData.length > 0 && (
          <Line
            type={lineType}
            dataKey="ac"
            stroke="#118dff"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 3, fill: '#118dff', stroke: '#118dff' }}
            name="forecast"
            data={forecastData}
          />
        )}
        {/* Variance bars (pins) */}
        {showVariance && !showForecast && (
          <Bar dataKey="variance" barSize={3} name="variance">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.variance >= 0 ? '#107C10' : '#A4262C'}
              />
            ))}
          </Bar>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
