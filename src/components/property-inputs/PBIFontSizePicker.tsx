/**
 * PBIFontSizePicker - Constrained Font Size Picker
 *
 * Only allows selection from Power BI supported font sizes.
 */

import React from 'react';
import { Select } from '@fluentui/react-components';
import { PBI_FONT_SIZES } from '../../pbi-constraints/fonts';
import type { PBIFontSize } from '../../pbi-constraints/fonts';

export interface PBIFontSizePickerProps {
  /** Currently selected font size */
  value?: PBIFontSize;
  /** Callback when font size changes */
  onChange?: (size: PBIFontSize) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Filter to only show sizes in a range */
  minSize?: number;
  maxSize?: number;
}

/**
 * PBIFontSizePicker Component
 *
 * A dropdown that only shows PBI-valid font sizes (8-72).
 */
export const PBIFontSizePicker: React.FC<PBIFontSizePickerProps> = ({
  value,
  onChange,
  disabled = false,
  minSize = 8,
  maxSize = 72,
}) => {
  const filteredSizes = PBI_FONT_SIZES.filter(
    (size) => size >= minSize && size <= maxSize
  );

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const size = Number(event.target.value) as PBIFontSize;
    onChange?.(size);
  };

  return (
    <Select
      size="small"
      disabled={disabled}
      value={value?.toString() || '12'}
      onChange={handleChange as any}
    >
      {filteredSizes.map((size) => (
        <option key={size} value={size}>
          {size}px
        </option>
      ))}
    </Select>
  );
};

export default PBIFontSizePicker;
