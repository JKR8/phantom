/**
 * Power BI Color Constraints
 *
 * PBI uses hexadecimal color values. This type ensures only valid hex colors
 * can be passed to PBI component props.
 */

/** Hex color type - ensures format starts with # */
export type PBIHexColor = `#${string}`;

/** Standard Power BI theme colors from CY23SU08 */
export const PBI_THEME_COLORS = {
  // Primary data colors
  dataColor1: '#118DFF' as PBIHexColor,
  dataColor2: '#12239E' as PBIHexColor,
  dataColor3: '#E66C37' as PBIHexColor,
  dataColor4: '#6B007B' as PBIHexColor,
  dataColor5: '#E044A7' as PBIHexColor,
  dataColor6: '#744EC2' as PBIHexColor,
  dataColor7: '#D9B300' as PBIHexColor,
  dataColor8: '#D64550' as PBIHexColor,
  dataColor9: '#197278' as PBIHexColor,
  dataColor10: '#1AAB40' as PBIHexColor,

  // Semantic colors
  foreground: '#252423' as PBIHexColor,
  foregroundSecondary: '#605E5C' as PBIHexColor,
  foregroundTertiary: '#B3B0AD' as PBIHexColor,
  background: '#FFFFFF' as PBIHexColor,
  backgroundLight: '#F3F2F1' as PBIHexColor,
  backgroundNeutral: '#C8C6C4' as PBIHexColor,

  // Status colors
  good: '#1AAB40' as PBIHexColor,
  neutral: '#D9B300' as PBIHexColor,
  bad: '#D64554' as PBIHexColor,

  // Gradient colors
  maximum: '#118DFF' as PBIHexColor,
  center: '#D9B300' as PBIHexColor,
  minimum: '#DEEFFF' as PBIHexColor,
} as const;

/** Mokkup brand colors */
export const MOKKUP_BRAND_COLORS = {
  primary: '#342BC2' as PBIHexColor,
  secondary: '#6F67F1' as PBIHexColor,
  tertiary: '#9993FF' as PBIHexColor,
  quaternary: '#417ED9' as PBIHexColor,
  quinary: '#2565C3' as PBIHexColor,
  lineAccent: '#44B0AB' as PBIHexColor,
  success: '#93BF35' as PBIHexColor,
  textPrimary: '#252423' as PBIHexColor,
  textSecondary: '#808080' as PBIHexColor,
  title: '#342BC2' as PBIHexColor,
  background: '#FFFFFF' as PBIHexColor,
} as const;

/** Full data color palette from CY23SU08 theme */
export const PBI_DATA_COLORS: PBIHexColor[] = [
  '#118DFF', '#12239E', '#E66C37', '#6B007B', '#E044A7',
  '#744EC2', '#D9B300', '#D64550', '#197278', '#1AAB40',
  '#15C6F4', '#4092FF', '#FFA058', '#BE5DC9', '#F472D0',
  '#B5A1FF', '#C4A200', '#FF8080', '#00DBBC', '#5BD667',
];

/** Mokkup series colors for multi-series charts */
export const MOKKUP_SERIES_COLORS: PBIHexColor[] = [
  '#342BC2', '#6F67F1', '#9993FF', '#417ED9', '#2565C3',
];

/**
 * Validate a string is a valid hex color
 */
export function isValidHexColor(color: string): color is PBIHexColor {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}
