import React, { useEffect, useRef } from 'react';
import { makeStyles, shorthands, Text } from '@fluentui/react-components';
import {
  DataBarHorizontalRegular,
  DataBarVerticalRegular,
  DataHistogramRegular,
  DataLineRegular,
  DataAreaRegular,
  DataPieRegular,
  NumberSymbolSquareRegular,
  TextDescriptionRegular,
  DataUsageRegular,
} from '@fluentui/react-icons';

export interface VariantOption {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

export const VARIANT_MAP: Record<string, VariantOption[]> = {
  bar: [
    { id: 'bar', label: 'Clustered Bar', icon: DataBarHorizontalRegular },
    { id: 'stackedBar', label: 'Stacked Bar', icon: DataBarHorizontalRegular },
  ],
  column: [
    { id: 'column', label: 'Clustered Column', icon: DataHistogramRegular },
    { id: 'stackedColumn', label: 'Stacked Column', icon: DataBarVerticalRegular },
  ],
  line: [
    { id: 'line', label: 'Line', icon: DataLineRegular },
    { id: 'area', label: 'Area', icon: DataAreaRegular },
    { id: 'stackedArea', label: 'Stacked Area', icon: DataAreaRegular },
  ],
  pie: [
    { id: 'pie', label: 'Pie', icon: DataPieRegular },
    { id: 'donut', label: 'Donut', icon: DataPieRegular },
  ],
  card: [
    { id: 'card', label: 'KPI Card', icon: NumberSymbolSquareRegular },
    { id: 'multiRowCard', label: 'Multi-Row Card', icon: TextDescriptionRegular },
    { id: 'gauge', label: 'Gauge', icon: DataUsageRegular },
  ],
};

/** Set of parent types that trigger the variant picker */
export const VARIANT_PARENT_TYPES = new Set(Object.keys(VARIANT_MAP));

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
  },
  popover: {
    position: 'fixed',
    backgroundColor: 'white',
    ...shorthands.borderRadius('8px'),
    boxShadow: '0 8px 32px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.padding('6px'),
    zIndex: 2001,
    minWidth: '160px',
    animationName: {
      from: { opacity: 0, transform: 'translateY(4px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animationDuration: '150ms',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    ...shorthands.padding('8px', '12px'),
    ...shorthands.borderRadius('6px'),
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '0.1s',
    ':hover': {
      backgroundColor: '#F0F6FF',
    },
  },
  optionIcon: {
    color: '#0078D4',
    flexShrink: 0,
  },
  optionLabel: {
    fontSize: '13px',
    color: '#252423',
  },
});

interface VariantPickerProps {
  parentType: string;
  pixelX: number;
  pixelY: number;
  onSelect: (variantId: string) => void;
  onCancel: () => void;
}

export const VariantPicker: React.FC<VariantPickerProps> = ({ parentType, pixelX, pixelY, onSelect, onCancel }) => {
  const styles = useStyles();
  const popoverRef = useRef<HTMLDivElement>(null);

  const variants = VARIANT_MAP[parentType] || [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  if (variants.length === 0) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onCancel} />
      <div
        className={styles.popover}
        ref={popoverRef}
        data-testid="variant-picker"
        style={{ left: pixelX, top: pixelY }}
      >
        {variants.map((variant) => (
          <div
            key={variant.id}
            className={styles.option}
            data-testid={`variant-option-${variant.id}`}
            onClick={() => onSelect(variant.id)}
          >
            <variant.icon className={styles.optionIcon} fontSize={20} />
            <Text className={styles.optionLabel}>{variant.label}</Text>
          </div>
        ))}
      </div>
    </>
  );
};
