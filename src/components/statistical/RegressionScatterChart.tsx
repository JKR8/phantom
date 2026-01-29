import React, { useMemo } from 'react';
import {
  ComposedChart,
  Scatter,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useStore, useFilteredSales, useHighlight, useSetHighlight } from '../../store/useStore';
import { useThemeStore } from '../../store/useThemeStore';
import { getDimensionValue, getMetricValue, formatMetricValue } from '../../utils/chartUtils';
import {
  computeRegression,
  RegressionType,
  getStatTheme,
  StatThemeName,
  mean,
} from '../../lib/stats-core';

interface RegressionScatterChartProps {
  xMetric: string;
  yMetric: string;
  dimension?: string;
  regressionType?: RegressionType;
  polynomialDegree?: number;
  loessBandwidth?: number;
  showConfidenceInterval?: boolean;
  showPredictionInterval?: boolean;
  confidenceLevel?: number;
  showEquation?: boolean;
  showRSquared?: boolean;
  showMeanLines?: boolean;
  statTheme?: StatThemeName;
}

interface ScatterPoint {
  x: number;
  y: number;
  name: string;
  id: string;
}

export const RegressionScatterChart: React.FC<RegressionScatterChartProps> = ({
  xMetric = 'revenue',
  yMetric = 'profit',
  dimension,
  regressionType = 'linear',
  polynomialDegree = 2,
  loessBandwidth = 0.3,
  showConfidenceInterval = false,
  showPredictionInterval = false,
  confidenceLevel = 0.95,
  showEquation = true,
  showRSquared = true,
  showMeanLines = false,
  statTheme = 'grey',
}) => {
  const filteredSales = useFilteredSales(dimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const highlight = useHighlight();
  const setHighlight = useSetHighlight();
  const { getColor } = useThemeStore();

  const theme = getStatTheme(statTheme);

  // Aggregate data by dimension (or use raw points)
  const scatterPoints = useMemo<ScatterPoint[]>(() => {
    if (dimension) {
      // Aggregate by dimension
      const aggregation: Record<string, { x: number; y: number; name: string }> = {};

      filteredSales.forEach((sale) => {
        const key = getDimensionValue(sale, dimension, { stores, products, customers });
        if (!aggregation[key]) {
          aggregation[key] = { x: 0, y: 0, name: key };
        }
        aggregation[key].x += getMetricValue(sale, xMetric);
        aggregation[key].y += getMetricValue(sale, yMetric);
      });

      return Object.entries(aggregation)
        .filter(([_, v]) => !isNaN(v.x) && !isNaN(v.y))
        .map(([key, v]) => ({ ...v, id: key }));
    } else {
      // Use individual data points
      return filteredSales
        .map((sale, index) => ({
          x: getMetricValue(sale, xMetric),
          y: getMetricValue(sale, yMetric),
          name: sale.id || `Point ${index}`,
          id: sale.id || `point-${index}`,
        }))
        .filter((p) => !isNaN(p.x) && !isNaN(p.y));
    }
  }, [filteredSales, dimension, xMetric, yMetric, stores, products, customers]);

  // Extract x and y arrays for regression
  const xValues = useMemo(() => scatterPoints.map((p) => p.x), [scatterPoints]);
  const yValues = useMemo(() => scatterPoints.map((p) => p.y), [scatterPoints]);

  // Compute regression
  const regression = useMemo(() => {
    if (xValues.length < 2 || regressionType === 'none') return null;

    return computeRegression(xValues, yValues, {
      type: regressionType,
      polynomialDegree,
      loessBandwidth,
      confidenceLevel,
    });
  }, [xValues, yValues, regressionType, polynomialDegree, loessBandwidth, confidenceLevel]);

  // Generate regression line points
  const regressionLine = useMemo(() => {
    if (!regression) return [];

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const step = (xMax - xMin) / 50;

    const points = [];
    for (let x = xMin; x <= xMax; x += step) {
      points.push({
        x,
        y: regression.predict(x),
      });
    }

    return points;
  }, [regression, xValues]);

  // Calculate means for reference lines
  const xMean = useMemo(() => mean(xValues), [xValues]);
  const yMean = useMemo(() => mean(yValues), [yValues]);

  // Prepare confidence band data
  const confidenceBandData = useMemo(() => {
    if (!regression || !showConfidenceInterval) return [];
    return regression.confidenceBand.map((p) => ({
      x: p.x,
      lower: p.lower,
      upper: p.upper,
    }));
  }, [regression, showConfidenceInterval]);

  // Prepare prediction band data
  const predictionBandData = useMemo(() => {
    if (!regression || !showPredictionInterval) return [];
    return regression.predictionBand.map((p) => ({
      x: p.x,
      lower: p.lower,
      upper: p.upper,
    }));
  }, [regression, showPredictionInterval]);

  const handlePointClick = (data: any, e: React.MouseEvent) => {
    if (data && data.name && dimension) {
      setHighlight(dimension, data.name, e.ctrlKey || e.metaKey);
    }
  };

  if (scatterPoints.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        margin={{ top: 20, right: 30, bottom: 40, left: 60 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={theme.gridMajorColor}
          strokeWidth={theme.gridMajorWidth}
        />
        <XAxis
          dataKey="x"
          type="number"
          domain={['dataMin', 'dataMax']}
          tick={{ fontSize: 10, fill: theme.axisTickColor }}
          axisLine={theme.showAxisLines}
          tickFormatter={(value) => formatMetricValue(xMetric, value, true)}
          label={{
            value: xMetric,
            position: 'bottom',
            offset: 20,
            style: { fontSize: 11, fill: theme.axisTitleColor },
          }}
        />
        <YAxis
          dataKey="y"
          type="number"
          domain={['dataMin', 'dataMax']}
          tick={{ fontSize: 10, fill: theme.axisTickColor }}
          axisLine={theme.showAxisLines}
          tickFormatter={(value) => formatMetricValue(yMetric, value, true)}
          label={{
            value: yMetric,
            angle: -90,
            position: 'insideLeft',
            style: { fontSize: 11, fill: theme.axisTitleColor },
          }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const data = payload[0].payload;
            return (
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.name}</div>
                <div>{xMetric}: {formatMetricValue(xMetric, data.x)}</div>
                <div>{yMetric}: {formatMetricValue(yMetric, data.y)}</div>
              </div>
            );
          }}
        />

        {/* Prediction band (wider, lighter) */}
        {showPredictionInterval && predictionBandData.length > 0 && (
          <Area
            data={predictionBandData}
            dataKey="upper"
            type="monotone"
            stroke="none"
            fill={theme.lineColor}
            fillOpacity={0.1}
            isAnimationActive={false}
          />
        )}

        {/* Confidence band (narrower, darker) */}
        {showConfidenceInterval && confidenceBandData.length > 0 && (
          <Area
            data={confidenceBandData}
            dataKey="upper"
            type="monotone"
            stroke="none"
            fill={theme.lineColor}
            fillOpacity={0.2}
            isAnimationActive={false}
          />
        )}

        {/* Mean reference lines */}
        {showMeanLines && (
          <>
            <ReferenceLine
              x={xMean}
              stroke={theme.highlightColor}
              strokeDasharray="5 5"
              strokeWidth={1}
            />
            <ReferenceLine
              y={yMean}
              stroke={theme.highlightColor}
              strokeDasharray="5 5"
              strokeWidth={1}
            />
          </>
        )}

        {/* Regression line */}
        {regression && regressionLine.length > 0 && (
          <Line
            data={regressionLine}
            type="monotone"
            dataKey="y"
            stroke={theme.lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        )}

        {/* Scatter points */}
        <Scatter
          data={scatterPoints}
          fill={theme.pointFillColor}
          onClick={(data, _, e) => handlePointClick(data, e as any)}
          style={{ cursor: 'pointer' }}
        >
          {scatterPoints.map((point, index) => {
            const isHighlightActive = highlight && highlight.dimension === dimension;
            const isHighlighted = isHighlightActive && highlight.values.has(point.name);
            const opacity = isHighlightActive ? (isHighlighted ? 1 : 0.3) : 0.7;

            return (
              <Cell
                key={point.id}
                fill={getColor(index % 6)}
                fillOpacity={opacity}
              />
            );
          })}
        </Scatter>

        {/* Equation and R² annotation */}
        {regression && (showEquation || showRSquared) && (
          <g>
            <text
              x="95%"
              y={30}
              textAnchor="end"
              fontSize={11}
              fill={theme.axisTitleColor}
              fontFamily={theme.fontFamily}
            >
              {showEquation && regression.equation}
            </text>
            {showRSquared && !isNaN(regression.rSquared) && (
              <text
                x="95%"
                y={46}
                textAnchor="end"
                fontSize={11}
                fill={theme.axisTitleColor}
                fontFamily={theme.fontFamily}
              >
                R² = {regression.rSquared.toFixed(4)}
              </text>
            )}
          </g>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
};
