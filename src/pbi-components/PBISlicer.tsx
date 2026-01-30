/**
 * PBISlicer - Constrained Power BI Slicer Component
 *
 * A React component that renders a dropdown slicer with
 * props constrained to PBI-valid values.
 */

import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  PBISlicerProps,
  DEFAULT_SLICER_PROPS,
} from '../pbi-constraints';
import {
  PBI_TYPOGRAPHY,
  PBI_TEXT_COLORS,
  PBI_BACKGROUND_COLORS,
  PBI_BORDER_COLORS,
} from '../tokens/pbi-css-tokens';

/** Props for the PBISlicer component */
export interface PBISlicerComponentProps extends Omit<PBISlicerProps, 'field'> {
  /** Available options */
  options: string[];
  /** Currently selected value(s) */
  value?: string | string[];
  /** Placeholder text */
  placeholder?: string;
  /** Callback when selection changes */
  onChange?: (value: string | string[] | undefined) => void;
}

/**
 * PBISlicer Component
 *
 * Renders a dropdown slicer matching the Mokkup template styling.
 */
export const PBISlicer: React.FC<PBISlicerComponentProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Merge with defaults
  const mergedProps = useMemo(() => ({
    ...DEFAULT_SLICER_PROPS,
    ...props,
    data: { ...DEFAULT_SLICER_PROPS.data, ...props.data },
    header: { ...DEFAULT_SLICER_PROPS.header, ...props.header },
    items: { ...DEFAULT_SLICER_PROPS.items, ...props.items },
    selection: { ...DEFAULT_SLICER_PROPS.selection, ...props.selection },
  }), [props]);

  const {
    options,
    value,
    placeholder = 'Select...',
    onChange,
    data,
    items,
    selection,
  } = mergedProps;

  const isMultiSelect = !selection?.strictSingleSelect;
  const selectedValues = useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

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

  const handleSelect = (option: string) => {
    if (isMultiSelect) {
      const newValues = selectedValues.includes(option)
        ? selectedValues.filter(v => v !== option)
        : [...selectedValues, option];
      onChange?.(newValues.length > 0 ? newValues : undefined);
    } else {
      onChange?.(option);
      setIsOpen(false);
    }
  };

  const displayText = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} selected`;
  }, [selectedValues, placeholder]);

  // Dropdown mode
  if (data?.mode === 'Dropdown') {
    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          fontFamily: PBI_TYPOGRAPHY.tableCell.fontFamily,
        }}
      >
        {/* Dropdown button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            height: '100%',
            padding: '4px 8px',
            backgroundColor: items?.backgroundColor || PBI_BACKGROUND_COLORS.primary,
            border: `1px solid ${PBI_BORDER_COLORS.secondary}`,
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: items?.fontSize || PBI_TYPOGRAPHY.tableCell.fontSize,
            color: items?.fontColor || PBI_TEXT_COLORS.primary,
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayText}
          </span>
          <span style={{ marginLeft: '4px' }}>▼</span>
        </button>

        {/* Dropdown list */}
        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: items?.backgroundColor || PBI_BACKGROUND_COLORS.primary,
              border: `1px solid ${PBI_BORDER_COLORS.secondary}`,
              borderRadius: '2px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {options.map((option) => (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                style={{
                  padding: '6px 8px',
                  cursor: 'pointer',
                  fontSize: items?.fontSize || PBI_TYPOGRAPHY.tableCell.fontSize,
                  color: items?.fontColor || PBI_TEXT_COLORS.primary,
                  backgroundColor: selectedValues.includes(option)
                    ? PBI_BACKGROUND_COLORS.tertiary
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLDivElement).style.backgroundColor = PBI_BACKGROUND_COLORS.tertiary;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLDivElement).style.backgroundColor =
                    selectedValues.includes(option) ? PBI_BACKGROUND_COLORS.tertiary : 'transparent';
                }}
              >
                {isMultiSelect && (
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    readOnly
                    style={{ margin: 0 }}
                  />
                )}
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // List mode
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: items?.backgroundColor || PBI_BACKGROUND_COLORS.primary,
        border: `1px solid ${PBI_BORDER_COLORS.secondary}`,
        borderRadius: '2px',
        overflowY: 'auto',
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {options.map((option) => (
        <div
          key={option}
          onClick={() => handleSelect(option)}
          style={{
            padding: '6px 8px',
            cursor: 'pointer',
            fontSize: items?.fontSize || PBI_TYPOGRAPHY.tableCell.fontSize,
            color: items?.fontColor || PBI_TEXT_COLORS.primary,
            backgroundColor: selectedValues.includes(option) ? PBI_BACKGROUND_COLORS.tertiary : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {isMultiSelect && (
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              readOnly
              style={{ margin: 0 }}
            />
          )}
          {option}
        </div>
      ))}
    </div>
  );
};

export default PBISlicer;
