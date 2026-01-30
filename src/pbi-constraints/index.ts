/**
 * Power BI Constraints
 *
 * TypeScript type definitions that ensure only PBI-valid values can be used
 * in component props. This enables compile-time validation of visual configurations.
 *
 * Usage:
 * ```typescript
 * import { PBIBarChartProps, PBIHexColor, PBIFontSize } from './pbi-constraints';
 *
 * // TypeScript will error if invalid values are used:
 * const props: PBIBarChartProps = {
 *   category: { field: 'Category', table: 'Products' },
 *   value: { field: 'Total Revenue', table: 'Sales', isMeasure: true },
 *   title: {
 *     show: true,
 *     fontSize: 13, // Error! 13 is not a valid PBIFontSize
 *   },
 *   dataPoint: {
 *     fill: 'red', // Error! Must be hex format like '#FF0000'
 *   },
 * };
 * ```
 */

// Colors
export type { PBIHexColor } from './colors';
export {
  PBI_THEME_COLORS,
  MOKKUP_BRAND_COLORS,
  PBI_DATA_COLORS,
  MOKKUP_SERIES_COLORS,
  isValidHexColor,
} from './colors';

// Fonts
export type { PBIFontFamily, PBIFontSize } from './fonts';
export {
  PBI_FONT_SIZES,
  PBI_DEFAULT_FONTS,
  PBI_DEFAULT_FONT_SIZES,
  PBI_FONT_FAMILY_STRINGS,
  getPBIFontFamilyString,
  isValidPBIFontSize,
} from './fonts';

// Layout
export type {
  PBILegendPosition,
  PBIAlignment,
  PBIVerticalAlignment,
  PBILabelPosition,
  PBIOrientation,
  PBIGridlineStyle,
  PBILineStyle,
  PBILineChartType,
  PBISlicerMode,
  PBIKPIDirection,
  PBIKPIDistanceLabel,
  PBIDisplayUnits,
  PBIReferenceLabelPosition,
  PBIReferenceLabelLayout,
  PBICalloutLabelPosition,
  PBIMarkerShape,
  PBIShapeType,
  PBIPageDisplayOption,
} from './layout';
export { PBI_PAGE_SIZES } from './layout';

// Literal expression builders
export type { PBILiteralExpr, PBISolidColor } from './literals';
export {
  makeLiteral,
  makeDecimalLiteral,
  makeIntegerLiteral,
  makeSolidColor,
  makeFontSize,
  makeFontFamily,
  makeNullLiteral,
  makeTransparency,
  makePadding,
  makeBorderWidth,
  makeBorderRadius,
  buildProperties,
} from './literals';

// Visual props
export * from './props';
