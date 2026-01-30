/**
 * Power BI Layout Constraints
 *
 * Defines valid position, alignment, and layout values that Power BI supports.
 * These are extracted from visual.json files in PBIP exports.
 */

/**
 * Legend position options in Power BI charts
 */
export type PBILegendPosition =
  | 'Top'
  | 'Bottom'
  | 'Left'
  | 'Right'
  | 'TopCenter'
  | 'BottomCenter'
  | 'LeftCenter'
  | 'RightCenter';

/**
 * Horizontal text alignment
 */
export type PBIAlignment = 'left' | 'center' | 'right';

/**
 * Vertical text alignment
 */
export type PBIVerticalAlignment = 'top' | 'middle' | 'bottom';

/**
 * Data label position options for bar/column charts
 */
export type PBILabelPosition =
  | 'Auto'
  | 'InsideEnd'
  | 'OutsideEnd'
  | 'InsideCenter'
  | 'InsideBase';

/**
 * Chart orientation
 */
export type PBIOrientation = 'horizontal' | 'vertical';

/**
 * Gridline style options
 */
export type PBIGridlineStyle = 'solid' | 'dashed' | 'dotted';

/**
 * Line style options
 */
export type PBILineStyle = 'solid' | 'dashed' | 'dotted';

/**
 * Line chart interpolation (line type)
 */
export type PBILineChartType = 'smooth' | 'straight' | 'stepped';

/**
 * Slicer display modes
 */
export type PBISlicerMode = 'Dropdown' | 'List' | 'Tile';

/**
 * KPI direction indicator
 */
export type PBIKPIDirection = 'High is good' | 'Low is good' | 'Negative';

/**
 * Distance label format in KPI
 */
export type PBIKPIDistanceLabel = 'Percent' | 'Value' | 'Both' | 'None';

/**
 * Display units for values
 */
export type PBIDisplayUnits =
  | 0    // Auto
  | 1    // None (show full number)
  | 1000 // Thousands (K)
  | 1000000 // Millions (M)
  | 1000000000 // Billions (B)
  | 1000000000000; // Trillions (T)

/**
 * Reference label position (for new cardVisual)
 */
export type PBIReferenceLabelPosition = 'above' | 'below';

/**
 * Reference labels layout direction
 */
export type PBIReferenceLabelLayout = 'horizontal' | 'vertical';

/**
 * Callout label position (for new cardVisual)
 */
export type PBICalloutLabelPosition = 'aboveValue' | 'belowValue';

/**
 * Marker shape for scatter/line charts
 */
export type PBIMarkerShape = 'circle' | 'square' | 'diamond' | 'triangle' | 'cross' | 'x';

/**
 * Shape type for shape visuals
 */
export type PBIShapeType = 'rectangle' | 'oval' | 'line' | 'triangle' | 'pentagon' | 'hexagon' | 'arrow' | 'speechBubble';

/**
 * Valid page display options
 */
export type PBIPageDisplayOption = 'FitToPage' | 'FitToWidth' | 'ActualSize';

/**
 * Common page dimensions (width x height)
 */
export const PBI_PAGE_SIZES = {
  /** 16:9 aspect ratio - most common */
  widescreen: { width: 1280, height: 720 },
  /** 4:3 aspect ratio */
  standard: { width: 1280, height: 960 },
  /** Portrait letter size */
  letter: { width: 816, height: 1056 },
  /** Custom tooltip page */
  tooltip: { width: 320, height: 240 },
} as const;
