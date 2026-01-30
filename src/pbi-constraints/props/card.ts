/**
 * Power BI Card Visual Props
 *
 * Constrained props interface for the new cardVisual (GA November 2025)
 * that supports reference labels for variance indicators.
 */

import type { PBIHexColor } from '../colors';
import type { PBIFontFamily, PBIFontSize } from '../fonts';
import type {
  PBIAlignment,
  PBIDisplayUnits,
  PBIReferenceLabelPosition,
  PBIReferenceLabelLayout,
  PBICalloutLabelPosition,
} from '../layout';
import type { PBIMeasureBinding } from './bar-chart';

/**
 * Callout value configuration (main KPI number)
 */
export interface PBICalloutValueProps {
  /** Font family */
  fontFamily?: PBIFontFamily;
  /** Font size in points */
  fontSize?: PBIFontSize;
  /** Font color */
  fontColor?: PBIHexColor;
  /** Horizontal alignment */
  horizontalAlignment?: PBIAlignment;
  /** Display units (Auto, None, K, M, B, T) */
  labelDisplayUnits?: PBIDisplayUnits;
}

/**
 * Callout label configuration (title above/below value)
 */
export interface PBICalloutLabelProps {
  /** Show the label */
  show: boolean;
  /** Font family */
  fontFamily?: PBIFontFamily;
  /** Font size */
  fontSize?: PBIFontSize;
  /** Font color */
  fontColor?: PBIHexColor;
  /** Position relative to value */
  position?: PBICalloutLabelPosition;
}

/**
 * Reference label configuration (variance indicators)
 */
export interface PBIReferenceLabelProps {
  /** Font family for value */
  valueFontFamily?: PBIFontFamily;
  /** Font size for value */
  valueFontSize?: PBIFontSize;
  /** Font family for title */
  titleFontFamily?: PBIFontFamily;
  /** Font size for title */
  titleFontSize?: PBIFontSize;
  /** Title font color */
  titleFontColor?: PBIHexColor;
  /** Show title */
  showTitle?: boolean;
  /** Show detail (absolute value) */
  showDetail?: boolean;
}

/**
 * Reference labels layout configuration
 */
export interface PBIReferenceLabelsLayoutProps {
  /** Position relative to callout */
  position?: PBIReferenceLabelPosition;
  /** Layout direction */
  layout?: PBIReferenceLabelLayout;
  /** Spacing between labels */
  spacing?: number;
}

/**
 * Divider configuration
 */
export interface PBIDividerProps {
  /** Show divider */
  show: boolean;
  /** Divider color */
  color?: PBIHexColor;
  /** Divider width */
  width?: number;
}

/**
 * Card background configuration
 */
export interface PBICardBackgroundProps {
  /** Show background */
  show: boolean;
  /** Background color */
  color?: PBIHexColor;
}

/**
 * Padding configuration
 */
export interface PBIPaddingProps {
  /** Top padding */
  top?: number;
  /** Bottom padding */
  bottom?: number;
  /** Left padding */
  left?: number;
  /** Right padding */
  right?: number;
}

/**
 * Constrained props for PBI Card Visual (cardVisual)
 */
export interface PBICardProps {
  // Data binding
  /** Primary value measure */
  value: PBIMeasureBinding;
  /** Reference label measures (for variance display) */
  referenceValues?: PBIMeasureBinding[];

  // Callout area
  /** Callout area size (percentage of card height) */
  calloutAreaSize?: number;
  /** Callout value styling */
  calloutValue?: PBICalloutValueProps;
  /** Callout label styling */
  calloutLabel?: PBICalloutLabelProps;

  // Reference labels
  /** Reference labels layout */
  referenceLabelsLayout?: PBIReferenceLabelsLayoutProps;
  /** Reference label value styling */
  referenceLabelValue?: PBIReferenceLabelProps;

  // Divider
  /** Divider between callout and reference labels */
  divider?: PBIDividerProps;

  // Background
  /** Card background */
  cardBackground?: PBICardBackgroundProps;

  // Padding
  /** Card padding */
  padding?: PBIPaddingProps;

  // Accent bar (via visual container border)
  /** Accent bar color (displayed as left border) */
  accentColor?: PBIHexColor;
}

/**
 * Default values for card props (matches Mokkup template)
 */
export const DEFAULT_CARD_PROPS: Partial<PBICardProps> = {
  calloutAreaSize: 60,
  calloutValue: {
    fontFamily: 'Segoe UI Bold',
    fontSize: 28,
    fontColor: '#252423',
    horizontalAlignment: 'center',
    labelDisplayUnits: 1, // Auto
  },
  calloutLabel: {
    show: true,
    fontFamily: 'Segoe UI',
    fontSize: 12,
    fontColor: '#808080',
    position: 'aboveValue',
  },
  referenceLabelsLayout: {
    position: 'below',
    layout: 'vertical',
    spacing: 4,
  },
  divider: {
    show: true,
    color: '#F0F0F0',
    width: 1,
  },
  cardBackground: {
    show: true,
    color: '#FFFFFF',
  },
  padding: {
    top: 6,
    bottom: 6,
    left: 10,
    right: 10,
  },
  accentColor: '#342BC2',
};
