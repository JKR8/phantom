/**
 * PBICard - Constrained Power BI Card Visual Component
 *
 * A React component that renders a KPI card with variance indicators,
 * matching the new cardVisual format (GA November 2025).
 */

import React, { useMemo } from 'react';
import {
  PBICardProps,
  DEFAULT_CARD_PROPS,
  MOKKUP_BRAND_COLORS,
  PBIHexColor,
} from '../pbi-constraints';
import {
  PBI_TYPOGRAPHY,
  PBI_TEXT_COLORS,
  PBI_BACKGROUND_COLORS,
  PBI_BORDER_COLORS,
} from '../tokens/pbi-css-tokens';

/** Props for the PBICard component */
export interface PBICardComponentProps extends Omit<PBICardProps, 'value' | 'referenceValues'> {
  /** Main value to display */
  value: number | string;
  /** Label/title for the value */
  label: string;
  /** Prior year variance percentage */
  variancePY?: number;
  /** Plan variance percentage */
  variancePL?: number;
  /** Format function for the main value */
  formatValue?: (value: number | string) => string;
}

/**
 * Default number formatter (K, M, B)
 */
function formatNumber(value: number | string): string {
  if (typeof value === 'string') return value;

  const absValue = Math.abs(value);
  if (absValue >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  }
  if (absValue >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }
  if (absValue >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

/**
 * Format variance percentage
 */
function formatVariance(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Get color for variance value
 */
function getVarianceColor(value: number, positive: PBIHexColor, negative: PBIHexColor): string {
  return value >= 0 ? positive : negative;
}

/**
 * PBICard Component
 *
 * Renders a KPI card with the Mokkup template styling.
 */
export const PBICard: React.FC<PBICardComponentProps> = (props) => {
  // Merge with defaults
  const mergedProps = useMemo(() => ({
    ...DEFAULT_CARD_PROPS,
    ...props,
    calloutValue: { ...DEFAULT_CARD_PROPS.calloutValue, ...props.calloutValue },
    calloutLabel: { ...DEFAULT_CARD_PROPS.calloutLabel, ...props.calloutLabel },
    referenceLabelsLayout: { ...DEFAULT_CARD_PROPS.referenceLabelsLayout, ...props.referenceLabelsLayout },
    divider: { ...DEFAULT_CARD_PROPS.divider, ...props.divider },
    cardBackground: { ...DEFAULT_CARD_PROPS.cardBackground, ...props.cardBackground },
    padding: { ...DEFAULT_CARD_PROPS.padding, ...props.padding },
  }), [props]);

  const {
    value,
    label,
    variancePY,
    variancePL,
    formatValue = formatNumber,
    accentColor = MOKKUP_BRAND_COLORS.primary,
    calloutValue,
    calloutLabel,
    divider,
    padding,
  } = mergedProps;

  const formattedValue = formatValue(value);
  const hasVariances = variancePY !== undefined || variancePL !== undefined;

  const positiveColor = PBI_TEXT_COLORS.success;
  const negativeColor = PBI_TEXT_COLORS.danger;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: mergedProps.cardBackground?.color || PBI_BACKGROUND_COLORS.primary,
        borderLeft: `4px solid ${accentColor}`,
        borderRadius: '2px',
        display: 'flex',
        flexDirection: 'column',
        padding: `${padding?.top || 6}px ${padding?.right || 10}px ${padding?.bottom || 6}px ${padding?.left || 10}px`,
        boxSizing: 'border-box',
        fontFamily: PBI_TYPOGRAPHY.kpiValue.fontFamily,
      }}
    >
      {/* Callout area */}
      <div
        style={{
          flex: hasVariances ? '0 0 60%' : '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: calloutValue?.horizontalAlignment === 'left' ? 'flex-start' :
                      calloutValue?.horizontalAlignment === 'right' ? 'flex-end' : 'center',
        }}
      >
        {/* Label */}
        {calloutLabel?.show !== false && (
          <div
            style={{
              fontSize: calloutLabel?.fontSize || PBI_TYPOGRAPHY.kpiLabel.fontSize,
              color: calloutLabel?.fontColor || PBI_TEXT_COLORS.tertiary,
              marginBottom: '4px',
            }}
          >
            {label}
          </div>
        )}

        {/* Main value */}
        <div
          style={{
            fontSize: calloutValue?.fontSize || PBI_TYPOGRAPHY.kpiValue.fontSize,
            fontWeight: PBI_TYPOGRAPHY.kpiValue.fontWeight,
            color: calloutValue?.fontColor || PBI_TEXT_COLORS.primary,
          }}
        >
          {formattedValue}
        </div>
      </div>

      {/* Reference labels (variances) */}
      {hasVariances && (
        <>
          {/* Divider */}
          {divider?.show !== false && (
            <div
              style={{
                height: divider?.width || 1,
                backgroundColor: divider?.color || PBI_BORDER_COLORS.secondary,
                margin: '8px 0',
              }}
            />
          )}

          {/* Variance indicators */}
          <div
            style={{
              display: 'flex',
              flexDirection: mergedProps.referenceLabelsLayout?.layout === 'horizontal' ? 'row' : 'column',
              gap: `${mergedProps.referenceLabelsLayout?.spacing || 4}px`,
            }}
          >
            {variancePY !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    fontSize: 11,
                    color: PBI_TEXT_COLORS.tertiary,
                  }}
                >
                  vs PY:
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: getVarianceColor(variancePY, positiveColor, negativeColor),
                  }}
                >
                  {formatVariance(variancePY)}
                </span>
              </div>
            )}

            {variancePL !== undefined && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  style={{
                    fontSize: 11,
                    color: PBI_TEXT_COLORS.tertiary,
                  }}
                >
                  vs PL:
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: getVarianceColor(variancePL, positiveColor, negativeColor),
                  }}
                >
                  {formatVariance(variancePL)}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PBICard;
