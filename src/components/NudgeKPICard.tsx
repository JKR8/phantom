import React, { useMemo } from 'react';
import { makeStyles, shorthands } from '@fluentui/react-components';
import { ArrowUpRegular, ArrowDownRegular } from '@fluentui/react-icons';
import { useFilteredSales, useStore } from '../store/useStore';

const useStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    minHeight: '180px',
    backgroundColor: '#FFFFFF',
    ...shorthands.border('1px', 'solid', '#E2E8F0'),
    ...shorthands.borderRadius('8px'),
    boxSizing: 'border-box',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    ...shorthands.overflow('hidden'),
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    ...shorthands.padding('16px'),
    gap: '4px',
    width: '100%',
    boxSizing: 'border-box',
  },
  metricName: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '17px',
    color: '#475569',
    ...shorthands.margin(0),
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: 600,
    lineHeight: '38px',
    color: '#020617',
    ...shorthands.margin(0),
    letterSpacing: '-0.5px',
  },
  referenceSection: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    flexGrow: 1,
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: '#E2E8F0',
    flexShrink: 0,
  },
  labels: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    ...shorthands.padding('16px'),
    gap: '4px',
    width: '100%',
    boxSizing: 'border-box',
  },
  labelRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
  },
  titleAndValue: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
  },
  labelTitle: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '19px',
    color: '#64748B',
  },
  labelValue: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '19px',
    color: '#020617',
  },
  variancePositive: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    ...shorthands.padding('0', '4px'),
    gap: '2px',
    backgroundColor: '#ECFDF5',
    ...shorthands.borderRadius('4px'),
    height: '23px',
  },
  varianceNegative: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    ...shorthands.padding('0', '4px'),
    gap: '2px',
    backgroundColor: '#FFF1F2',
    ...shorthands.borderRadius('4px'),
    height: '23px',
  },
  varianceTextPositive: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '19px',
    color: '#047857',
  },
  varianceTextNegative: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: '19px',
    color: '#BE123C',
  },
  arrowPositive: {
    color: '#047857',
    fontSize: '16px',
  },
  arrowNegative: {
    color: '#BE123C',
    fontSize: '16px',
  },
});

export interface NudgeKPICardProps {
  /** Main metric name/title shown above the value */
  metricName?: string;
  /** Metric field to aggregate */
  metric?: string;
  /** Aggregation operation */
  operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  /** Custom label override */
  label?: string;
  /** Show previous period comparison */
  showPreviousPeriod?: boolean;
  /** Show target comparison */
  showTarget?: boolean;
  /** Target value for comparison */
  targetValue?: number;
  /** Show year-over-year comparison */
  showYoY?: boolean;
}

const formatCurrency = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
};

const formatNumber = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toLocaleString();
};

export const NudgeKPICard: React.FC<NudgeKPICardProps> = ({
  metricName = 'Total Revenue',
  metric = 'revenue',
  operation = 'sum',
  label,
  showPreviousPeriod = true,
  showTarget = true,
  targetValue,
  showYoY = true,
}) => {
  const styles = useStyles();
  const filteredData = useFilteredSales();
  const scenario = useStore((state) => state.scenario);

  // Calculate the main value based on metric and operation
  const { mainValue, previousValue, targetVal, yoyChange } = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { mainValue: 0, previousValue: 0, targetVal: 0, yoyChange: 0 };
    }

    // Get values from data based on metric name
    const getMetricValue = (item: any): number => {
      const key = metric.toLowerCase();
      // Try common variations
      return item[key] ?? item[metric] ?? item.revenue ?? item.amount ?? 0;
    };

    const values = filteredData.map(getMetricValue).filter(v => typeof v === 'number' && !isNaN(v));

    let result = 0;
    switch (operation) {
      case 'sum':
        result = values.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
        result = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        break;
      case 'count':
        result = values.length;
        break;
      case 'min':
        result = values.length > 0 ? Math.min(...values) : 0;
        break;
      case 'max':
        result = values.length > 0 ? Math.max(...values) : 0;
        break;
      default:
        result = values.reduce((a, b) => a + b, 0);
    }

    // Simulate previous period (80-95% of current for demo)
    const prevMultiplier = 0.85 + Math.random() * 0.1;
    const prev = result * prevMultiplier;

    // Simulate target (90-110% of current for demo)
    const target = targetValue ?? result * (0.9 + Math.random() * 0.2);

    // YoY change simulation (-15% to +20%)
    const yoy = (Math.random() * 35 - 15);

    return {
      mainValue: result,
      previousValue: prev,
      targetVal: target,
      yoyChange: yoy,
    };
  }, [filteredData, metric, operation, targetValue]);

  const displayLabel = label || metricName || metric;
  const isCurrencyMetric = ['revenue', 'profit', 'amount', 'cost', 'mrr', 'ltv', 'salary'].includes(metric.toLowerCase());
  const formatValue = isCurrencyMetric ? formatCurrency : formatNumber;

  // Calculate variances
  const previousVariance = previousValue > 0 ? ((mainValue - previousValue) / previousValue) * 100 : 0;
  const targetVariance = targetVal > 0 ? ((mainValue - targetVal) / targetVal) * 100 : 0;

  const referenceLabels = [];

  if (showPreviousPeriod) {
    referenceLabels.push({
      title: 'Previous',
      value: formatValue(previousValue),
      variance: previousVariance,
    });
  }

  if (showTarget) {
    referenceLabels.push({
      title: 'Target',
      value: formatValue(targetVal),
      variance: targetVariance,
    });
  }

  if (showYoY) {
    referenceLabels.push({
      title: 'Year-over-Year',
      value: `${yoyChange >= 0 ? '+' : ''}${yoyChange.toFixed(1)}%`,
      variance: yoyChange,
    });
  }

  const renderVarianceIndicator = (variance: number) => {
    const isPositive = variance >= 0;
    const displayText = `${Math.abs(variance).toFixed(1)}%`;

    return (
      <div className={isPositive ? styles.variancePositive : styles.varianceNegative}>
        {isPositive ? (
          <ArrowUpRegular className={styles.arrowPositive} />
        ) : (
          <ArrowDownRegular className={styles.arrowNegative} />
        )}
        <span className={isPositive ? styles.varianceTextPositive : styles.varianceTextNegative}>
          {displayText}
        </span>
      </div>
    );
  };

  return (
    <div className={styles.card}>
      {/* Top content section */}
      <div className={styles.content}>
        <p className={styles.metricName}>{displayLabel}</p>
        <p className={styles.metricValue}>{formatValue(mainValue)}</p>
      </div>

      {/* Reference labels section */}
      {referenceLabels.length > 0 && (
        <div className={styles.referenceSection}>
          <div className={styles.divider} />
          <div className={styles.labels}>
            {referenceLabels.map((refLabel, index) => (
              <div key={index} className={styles.labelRow}>
                <div className={styles.titleAndValue}>
                  <span className={styles.labelTitle}>{refLabel.title}</span>
                  <span className={styles.labelValue}>{refLabel.value}</span>
                </div>
                {refLabel.variance !== undefined && renderVarianceIndicator(refLabel.variance)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NudgeKPICard;
