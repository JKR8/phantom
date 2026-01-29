/**
 * Theme type definitions for statistical visuals
 * Based on ggplot2 theme system
 */

export interface PhantomStatTheme {
  name: string;

  // Canvas
  background: string;
  plotBackground: string;

  // Grid
  gridMajorColor: string;
  gridMajorWidth: number;
  gridMinorColor: string;
  gridMinorWidth: number;
  showGridMajor: boolean;
  showGridMinor: boolean;

  // Axes
  axisLineColor: string;
  axisLineWidth: number;
  showAxisLines: boolean;

  // Text
  fontFamily: string;
  titleFontSize: number;
  titleFontWeight: string;
  titleColor: string;
  axisTitleFontSize: number;
  axisTitleColor: string;
  axisTickFontSize: number;
  axisTickColor: string;

  // Legend
  legendBackground: string;
  legendBorderColor: string;
  legendFontSize: number;

  // Color palettes
  colorPalette: string[];
  sequentialPalette: string[];
  divergingPalette: string[];

  // Element-specific colors
  boxFillColor: string;
  boxStrokeColor: string;
  barFillColor: string;
  pointFillColor: string;
  lineColor: string;
  highlightColor: string;
  medianColor: string;
  meanColor: string;

  // Violin-specific
  violinFillColor: string;
  violinStrokeColor: string;

  // Spacing
  plotMargin: { top: number; right: number; bottom: number; left: number };
  titlePadding: number;
}

export type StatThemeName = 'grey' | 'minimal' | 'classic' | 'economist' | 'fivethirtyeight';
