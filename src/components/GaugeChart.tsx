import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getMetricValue } from '../utils/chartUtils';

interface GaugeChartProps {
  metric: string;
  target?: number;
  manualData?: Array<{ label: string; value: number }>;
  /** Variant: 'gauge' for arc, 'bullet' for horizontal bar with target */
  variant?: 'gauge' | 'bullet';
  /** Label for the bullet chart row */
  label?: string;
}

/**
 * Bullet Chart Component - horizontal bar with qualitative bands and target marker
 */
const BulletChart: React.FC<{
  value: number;
  target: number;
  metric: string;
  label?: string;
  color: string;
}> = ({ value, target, metric, label, color }) => {
  // Calculate max as 120% of larger of value or target
  const max = Math.max(value, target) * 1.2;

  const percentage = Math.min((value / max) * 100, 100);
  const targetPercentage = Math.min((target / max) * 100, 100);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      padding: '16px',
      gap: '8px',
    }}>
      {/* Label */}
      {label && (
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px',
          fontWeight: 400,
          color: '#64748b',
        }}>
          {label}
        </div>
      )}

      {/* Bullet bar container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        {/* Bar area */}
        <div style={{
          flex: 1,
          height: '40px',
          position: 'relative',
          backgroundColor: '#f1f5f9',
        }}>
          {/* Qualitative bands (background gradients) */}
          <div style={{
            position: 'absolute',
            top: '10%',
            bottom: '10%',
            left: 0,
            right: 0,
            background: 'linear-gradient(to right, #f1f5f9 0%, #f1f5f9 33%, #e2e8f0 33%, #e2e8f0 66%, #cbd5e1 66%, #cbd5e1 100%)',
          }} />

          {/* Performance bar (main value) */}
          <div style={{
            position: 'absolute',
            top: '28%',
            bottom: '28%',
            left: 0,
            width: `${percentage}%`,
            backgroundColor: color,
          }} />

          {/* Target marker line */}
          <div style={{
            position: 'absolute',
            top: '10%',
            bottom: '10%',
            left: `${targetPercentage}%`,
            width: '2px',
            backgroundColor: '#020617',
            transform: 'translateX(-50%)',
          }} />
        </div>

        {/* Value display */}
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '14px',
          fontWeight: 600,
          color: '#020617',
          minWidth: '60px',
          textAlign: 'right',
        }}>
          {formatMetricValue(metric, value, true)}
        </div>
      </div>

      {/* Target label */}
      <div style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '11px',
        fontWeight: 400,
        color: '#64748b',
        textAlign: 'right',
      }}>
        Target: {formatMetricValue(metric, target, true)}
      </div>
    </div>
  );
};

/**
 * Gauge Chart Component - semicircle arc showing value against max
 */
const GaugeArc: React.FC<{
  value: number;
  target: number;
  metric: string;
  color: string;
}> = ({ value, target, metric, color }) => {
  const data = [
    { name: 'Value', value: value },
    { name: 'Remaining', value: Math.max(0, target - value) },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="100%"
          startAngle={180}
          endAngle={0}
          innerRadius={60}
          outerRadius={80}
          dataKey="value"
          paddingAngle={5}
        >
          <Cell fill={color} />
          <Cell fill="#f3f2f1" />
        </Pie>
        {/* Value display */}
        <text x="50%" y="70%" textAnchor="middle" fill={color} fontSize={20} fontWeight="bold">
          {formatMetricValue(metric, value, true)}
        </text>
        {/* Target label */}
        <text x="50%" y="90%" textAnchor="middle" fontSize={12} fill="#605E5C">
          Target: {formatMetricValue(metric, target, true)}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export const GaugeChart: React.FC<GaugeChartProps> = ({
  metric,
  target = 2000000,
  manualData,
  variant = 'gauge',
  label,
}) => {
  const filteredSales = useFilteredSales();
  const { getColor } = useThemeStore();

  const value = useMemo(() => {
    if (manualData && manualData.length > 0) {
      return manualData[0].value;
    }
    return filteredSales.reduce((acc, sale) => acc + getMetricValue(sale, metric), 0);
  }, [manualData, filteredSales, metric]);

  const color = getColor(0);

  // Render bullet chart for bullet variant
  if (variant === 'bullet') {
    return (
      <BulletChart
        value={value}
        target={target}
        metric={metric}
        label={label}
        color={color}
      />
    );
  }

  // Default: render gauge arc
  return (
    <GaugeArc
      value={value}
      target={target}
      metric={metric}
      color={color}
    />
  );
};
