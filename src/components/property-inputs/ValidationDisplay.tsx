/**
 * ValidationDisplay - Shows validation errors and warnings for visual props
 *
 * Displays inline feedback for invalid or potentially problematic prop values.
 */

import React from 'react';
import { Text } from '@fluentui/react-components';
import { WarningRegular, ErrorCircleRegular, InfoRegular } from '@fluentui/react-icons';
import type { ValidationResult, ValidationError, ValidationWarning } from '../../types';

export interface ValidationDisplayProps {
  /** Validation result to display */
  validation?: ValidationResult;
  /** Only show errors/warnings for specific field */
  field?: string;
  /** Compact mode - single line */
  compact?: boolean;
}

/**
 * Get icon for error type
 */
function getErrorIcon(code: ValidationError['code']) {
  switch (code) {
    case 'INVALID_VALUE':
    case 'TYPE_MISMATCH':
      return <ErrorCircleRegular style={{ color: '#d13438', fontSize: '14px' }} />;
    case 'MISSING_REQUIRED':
      return <ErrorCircleRegular style={{ color: '#d13438', fontSize: '14px' }} />;
    case 'FIELD_NOT_FOUND':
      return <WarningRegular style={{ color: '#d83b01', fontSize: '14px' }} />;
    default:
      return <ErrorCircleRegular style={{ color: '#d13438', fontSize: '14px' }} />;
  }
}

/**
 * Get icon for warning type
 */
function getWarningIcon(code: ValidationWarning['code']) {
  switch (code) {
    case 'ORPHANED_FIELD':
      return <WarningRegular style={{ color: '#d83b01', fontSize: '14px' }} />;
    case 'APPROXIMATION':
      return <InfoRegular style={{ color: '#0078d4', fontSize: '14px' }} />;
    case 'UNSUPPORTED_EXPORT':
      return <WarningRegular style={{ color: '#d83b01', fontSize: '14px' }} />;
    case 'DEPRECATED':
      return <InfoRegular style={{ color: '#605e5c', fontSize: '14px' }} />;
    default:
      return <WarningRegular style={{ color: '#d83b01', fontSize: '14px' }} />;
  }
}

/**
 * ValidationDisplay Component
 *
 * Shows validation errors and warnings with appropriate styling.
 */
export const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  validation,
  field,
  compact = false,
}) => {
  if (!validation) return null;

  // Filter by field if specified
  const errors = field
    ? validation.errors.filter((e) => e.field === field || e.field.startsWith(`${field}.`))
    : validation.errors;
  const warnings = field
    ? validation.warnings.filter((w) => w.field === field || w.field.startsWith(`${field}.`))
    : validation.warnings;

  if (errors.length === 0 && warnings.length === 0) return null;

  if (compact) {
    // Compact mode - just show count and first message
    const firstError = errors[0];
    const firstWarning = warnings[0];
    const item = firstError || firstWarning;
    if (!item) return null;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          color: firstError ? '#d13438' : '#d83b01',
          marginTop: '2px',
        }}
      >
        {firstError ? getErrorIcon(firstError.code) : getWarningIcon(firstWarning!.code)}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.message}
        </span>
      </div>
    );
  }

  // Full display mode
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
      {/* Errors */}
      {errors.map((error, index) => (
        <div
          key={`error-${index}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            padding: '4px 8px',
            backgroundColor: '#fef2f2',
            borderRadius: '4px',
            border: '1px solid #fecaca',
          }}
        >
          {getErrorIcon(error.code)}
          <div style={{ flex: 1 }}>
            <Text size={200} weight="semibold" style={{ color: '#d13438' }}>
              {error.field}
            </Text>
            <Text size={200} style={{ color: '#7f1d1d', display: 'block' }}>
              {error.message}
            </Text>
          </div>
        </div>
      ))}

      {/* Warnings */}
      {warnings.map((warning, index) => (
        <div
          key={`warning-${index}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            padding: '4px 8px',
            backgroundColor: warning.code === 'APPROXIMATION' ? '#eff6ff' : '#fffbeb',
            borderRadius: '4px',
            border: `1px solid ${warning.code === 'APPROXIMATION' ? '#bfdbfe' : '#fde68a'}`,
          }}
        >
          {getWarningIcon(warning.code)}
          <div style={{ flex: 1 }}>
            <Text size={200} weight="semibold" style={{ color: warning.code === 'APPROXIMATION' ? '#1e40af' : '#92400e' }}>
              {warning.field}
            </Text>
            <Text size={200} style={{ color: warning.code === 'APPROXIMATION' ? '#1e3a8a' : '#78350f', display: 'block' }}>
              {warning.message}
            </Text>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Inline validation indicator (small icon next to field)
 */
export const ValidationIndicator: React.FC<{
  validation?: ValidationResult;
  field: string;
}> = ({ validation, field }) => {
  if (!validation) return null;

  const hasError = validation.errors.some((e) => e.field === field);
  const hasWarning = validation.warnings.some((w) => w.field === field);

  if (!hasError && !hasWarning) return null;

  const error = validation.errors.find((e) => e.field === field);
  const warning = validation.warnings.find((w) => w.field === field);

  return (
    <span title={error?.message || warning?.message} style={{ marginLeft: '4px' }}>
      {hasError ? (
        <ErrorCircleRegular style={{ color: '#d13438', fontSize: '12px' }} />
      ) : (
        <WarningRegular style={{ color: '#d83b01', fontSize: '12px' }} />
      )}
    </span>
  );
};

export default ValidationDisplay;
