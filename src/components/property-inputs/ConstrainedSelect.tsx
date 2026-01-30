/**
 * ConstrainedSelect - Generic Constrained Select Component
 *
 * A select component that enforces type-safe options with labels and descriptions.
 */

import React from 'react';
import { Select } from '@fluentui/react-components';

export interface ConstrainedOption<T extends string> {
  /** The value (must be a valid string literal type) */
  value: T;
  /** Display label */
  label: string;
  /** Optional description/tooltip */
  description?: string;
}

export interface ConstrainedSelectProps<T extends string> {
  /** Available options */
  options: ConstrainedOption<T>[];
  /** Currently selected value */
  value?: T;
  /** Callback when value changes */
  onChange?: (value: T) => void;
  /** Placeholder text when no value selected */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
}

/**
 * ConstrainedSelect Component
 *
 * A type-safe select component for constrained value sets.
 */
export function ConstrainedSelect<T extends string>({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  size = 'small',
}: ConstrainedSelectProps<T>): React.ReactElement {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(event.target.value as T);
  };

  return (
    <Select
      size={size}
      disabled={disabled}
      value={value || ''}
      onChange={handleChange as any}
    >
      {!value && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}

/**
 * Pre-defined options for common PBI constraints
 */

export const SLICER_MODE_OPTIONS: ConstrainedOption<'Dropdown' | 'List' | 'Tile'>[] = [
  { value: 'Dropdown', label: 'Dropdown', description: 'Compact dropdown selector' },
  { value: 'List', label: 'List', description: 'Scrollable list of items' },
  { value: 'Tile', label: 'Tile', description: 'Button-style tiles' },
];

export const SORT_OPTIONS: ConstrainedOption<'asc' | 'desc' | 'alpha'>[] = [
  { value: 'desc', label: 'Descending', description: 'Highest to lowest' },
  { value: 'asc', label: 'Ascending', description: 'Lowest to highest' },
  { value: 'alpha', label: 'Alphabetical', description: 'A to Z' },
];

export const OPERATION_OPTIONS: ConstrainedOption<'sum' | 'avg' | 'count' | 'min' | 'max'>[] = [
  { value: 'sum', label: 'Sum', description: 'Total of all values' },
  { value: 'avg', label: 'Average', description: 'Mean of all values' },
  { value: 'count', label: 'Count', description: 'Number of items' },
  { value: 'min', label: 'Min', description: 'Minimum value' },
  { value: 'max', label: 'Max', description: 'Maximum value' },
];

export const COMPARISON_OPTIONS: ConstrainedOption<'none' | 'pl' | 'py' | 'both'>[] = [
  { value: 'none', label: 'None', description: 'No comparison lines' },
  { value: 'pl', label: 'Plan', description: 'Compare to plan values' },
  { value: 'py', label: 'Prior Year', description: 'Compare to prior year' },
  { value: 'both', label: 'Both', description: 'Show plan and prior year' },
];

export const TIME_GRAIN_OPTIONS: ConstrainedOption<'month' | 'quarter' | 'year'>[] = [
  { value: 'month', label: 'Month', description: 'Monthly aggregation' },
  { value: 'quarter', label: 'Quarter', description: 'Quarterly aggregation' },
  { value: 'year', label: 'Year', description: 'Yearly aggregation' },
];

export const LEGEND_POSITION_OPTIONS: ConstrainedOption<'Top' | 'Bottom' | 'Left' | 'Right' | 'TopCenter' | 'BottomCenter'>[] = [
  { value: 'Top', label: 'Top', description: 'Legend at top' },
  { value: 'Bottom', label: 'Bottom', description: 'Legend at bottom' },
  { value: 'Left', label: 'Left', description: 'Legend on left' },
  { value: 'Right', label: 'Right', description: 'Legend on right' },
  { value: 'TopCenter', label: 'Top Center', description: 'Legend at top center' },
  { value: 'BottomCenter', label: 'Bottom Center', description: 'Legend at bottom center' },
];

export default ConstrainedSelect;
