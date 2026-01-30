/**
 * Power BI Font Constraints
 *
 * Defines valid font families and sizes that work in Power BI visuals.
 * These values are extracted from the CY23SU08.json theme and real PBIP exports.
 */

/**
 * Valid Power BI font families
 * These are the fonts available in Power BI's visual formatting pane
 */
export type PBIFontFamily =
  | 'Segoe UI'
  | 'Segoe UI Semibold'
  | 'Segoe UI Bold'
  | 'Segoe UI Light'
  | 'DIN'
  | 'Arial'
  | 'Arial Black'
  | 'Calibri'
  | 'Calibri Light'
  | 'Cambria'
  | 'Candara'
  | 'Comic Sans MS'
  | 'Consolas'
  | 'Constantia'
  | 'Corbel'
  | 'Courier New'
  | 'Georgia'
  | 'Impact'
  | 'Lucida Console'
  | 'Lucida Sans Unicode'
  | 'Palatino Linotype'
  | 'Tahoma'
  | 'Times New Roman'
  | 'Trebuchet MS'
  | 'Verdana';

/**
 * Valid font sizes in Power BI (in points)
 * These match the dropdown options in PBI's formatting pane
 */
export type PBIFontSize =
  | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 18 | 20 | 22 | 24 | 28 | 32 | 36 | 45;

/** All valid font sizes as an array for validation */
export const PBI_FONT_SIZES: PBIFontSize[] = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 45];

/** Default font families for different visual elements */
export const PBI_DEFAULT_FONTS = {
  /** Standard body text */
  label: 'Segoe UI' as PBIFontFamily,
  /** Titles and headers */
  title: 'Segoe UI Semibold' as PBIFontFamily,
  /** Large callout values (cards, KPIs) */
  callout: 'DIN' as PBIFontFamily,
  /** Headers in tables/matrices */
  header: 'Segoe UI Semibold' as PBIFontFamily,
} as const;

/** Default font sizes for different visual elements */
export const PBI_DEFAULT_FONT_SIZES = {
  /** Axis labels, data labels */
  label: 10 as PBIFontSize,
  /** Visual titles */
  title: 12 as PBIFontSize,
  /** Large callout values */
  callout: 45 as PBIFontSize,
  /** Table headers */
  header: 12 as PBIFontSize,
} as const;

/**
 * Font family strings as they appear in PBIP JSON
 * These include fallback fonts in the format PBI expects
 */
export const PBI_FONT_FAMILY_STRINGS = {
  'Segoe UI': "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif",
  'Segoe UI Semibold': "'Segoe UI Semibold', wf_segoe-ui_semibold, helvetica, arial, sans-serif",
  'Segoe UI Bold': "'Segoe UI Bold', wf_segoe-ui_bold, helvetica, arial, sans-serif",
  'Segoe UI Light': "'Segoe UI Light', wf_segoe-ui_light, helvetica, arial, sans-serif",
  DIN: 'DIN',
  Arial: 'Arial, sans-serif',
} as const;

/**
 * Get the PBIP-formatted font family string
 */
export function getPBIFontFamilyString(font: PBIFontFamily): string {
  return PBI_FONT_FAMILY_STRINGS[font as keyof typeof PBI_FONT_FAMILY_STRINGS] || font;
}

/**
 * Validate a font size is valid for PBI
 */
export function isValidPBIFontSize(size: number): size is PBIFontSize {
  return PBI_FONT_SIZES.includes(size as PBIFontSize);
}
