/**
 * Power BI Slicer Props
 *
 * Constrained props interface for slicers that ensures
 * only PBI-valid values can be used.
 */

import type { PBIHexColor } from '../colors';
import type { PBIFontFamily, PBIFontSize } from '../fonts';
import type { PBISlicerMode } from '../layout';
import type { PBIColumnBinding, PBITitleProps } from './bar-chart';

/**
 * Slicer data configuration
 */
export interface PBISlicerDataProps {
  /** Slicer display mode */
  mode: PBISlicerMode;
}

/**
 * Slicer header configuration
 */
export interface PBISlicerHeaderProps {
  /** Show the header */
  show: boolean;
  /** Font family */
  fontFamily?: PBIFontFamily;
  /** Font size */
  fontSize?: PBIFontSize;
  /** Font color */
  fontColor?: PBIHexColor;
  /** Background color */
  backgroundColor?: PBIHexColor;
}

/**
 * Slicer items configuration
 */
export interface PBISlicerItemsProps {
  /** Font family */
  fontFamily?: PBIFontFamily;
  /** Font size */
  fontSize?: PBIFontSize;
  /** Font color */
  fontColor?: PBIHexColor;
  /** Background color */
  backgroundColor?: PBIHexColor;
  /** Text size */
  textSize?: PBIFontSize;
}

/**
 * Slicer selection configuration
 */
export interface PBISlicerSelectionProps {
  /** Enable single select mode */
  strictSingleSelect?: boolean;
  /** Show select all checkbox */
  selectAll?: boolean;
}

/**
 * Constrained props for PBI Slicer (slicer)
 */
export interface PBISlicerProps {
  // Data binding
  /** Field to slice by */
  field: PBIColumnBinding;

  // Visual title
  /** Title configuration */
  title?: PBITitleProps;

  // Slicer configuration
  /** Data configuration (mode) */
  data?: PBISlicerDataProps;
  /** Header configuration */
  header?: PBISlicerHeaderProps;
  /** Items styling */
  items?: PBISlicerItemsProps;
  /** Selection behavior */
  selection?: PBISlicerSelectionProps;
}

/**
 * Default values for slicer props (matches Mokkup dropdown style)
 */
export const DEFAULT_SLICER_PROPS: Partial<PBISlicerProps> = {
  title: {
    show: false,
  },
  data: {
    mode: 'Dropdown',
  },
  header: {
    show: false,
  },
  items: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Segoe UI',
    fontSize: 10,
    fontColor: '#252423',
  },
  selection: {
    strictSingleSelect: true,
  },
};

/**
 * Date slicer specific props
 */
export interface PBIDateSlicerProps extends PBISlicerProps {
  /** Date slicer type */
  dateType?: 'Between' | 'Before' | 'After' | 'Relative' | 'List';
  /** Show date picker button */
  hideDatePickerButton?: boolean;
}

/**
 * Default values for date slicer
 */
export const DEFAULT_DATE_SLICER_PROPS: Partial<PBIDateSlicerProps> = {
  ...DEFAULT_SLICER_PROPS,
  dateType: 'Between',
  hideDatePickerButton: false,
};
