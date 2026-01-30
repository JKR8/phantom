/**
 * PBIColorPicker - Constrained Color Picker for PBI Data Viz Colors
 *
 * Only allows selection from the standard Power BI data visualization colors.
 * This ensures exported visuals will render correctly in Power BI.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { PBI_DATA_VIZ_COLORS_ARRAY, PBI_DATA_VIZ_COLORS } from '../../tokens/pbi-css-tokens';
import type { PBIHexColor } from '../../pbi-constraints/colors';

export interface PBIColorPickerProps {
  /** Currently selected color */
  value?: PBIHexColor;
  /** Callback when color changes */
  onChange?: (color: PBIHexColor) => void;
  /** Whether to show color index labels */
  showLabels?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

const COLOR_NAMES: Record<string, string> = {
  [PBI_DATA_VIZ_COLORS.category1]: 'Blue',
  [PBI_DATA_VIZ_COLORS.category2]: 'Dark Blue',
  [PBI_DATA_VIZ_COLORS.category3]: 'Orange',
  [PBI_DATA_VIZ_COLORS.category4]: 'Purple',
  [PBI_DATA_VIZ_COLORS.category5]: 'Pink',
  [PBI_DATA_VIZ_COLORS.category6]: 'Violet',
  [PBI_DATA_VIZ_COLORS.category7]: 'Gold',
  [PBI_DATA_VIZ_COLORS.category8]: 'Red',
  [PBI_DATA_VIZ_COLORS.category9]: 'Yellow',
};

/**
 * PBIColorPicker Component
 *
 * A dropdown color picker that only shows PBI-valid data visualization colors.
 */
export const PBIColorPicker: React.FC<PBIColorPickerProps> = ({
  value,
  onChange,
  showLabels = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (color: PBIHexColor) => {
    onChange?.(color);
    setIsOpen(false);
  };

  const selectedColor = value || PBI_DATA_VIZ_COLORS_ARRAY[0];

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <Button
        size="small"
        appearance="outline"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minWidth: '80px',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            backgroundColor: selectedColor,
            borderRadius: '2px',
            border: '1px solid rgba(0,0,0,0.1)',
          }}
        />
        {showLabels && (
          <span style={{ fontSize: '11px' }}>
            {COLOR_NAMES[selectedColor] || selectedColor}
          </span>
        )}
      </Button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            backgroundColor: '#ffffff',
            border: '1px solid #e1dfdd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            padding: '8px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px',
            minWidth: '120px',
          }}
        >
          {PBI_DATA_VIZ_COLORS_ARRAY.map((color, index) => (
            <Tooltip
              key={color}
              content={`${COLOR_NAMES[color]} (${index + 1})`}
              relationship="label"
            >
              <button
                onClick={() => handleSelect(color)}
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: color,
                  border: value === color ? '2px solid #000' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
};

export default PBIColorPicker;
