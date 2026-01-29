/**
 * FiveThirtyEight Theme
 * Light grey background with bold colors
 */

import { PhantomStatTheme } from './types';

export const themeFiveThirtyEight: PhantomStatTheme = {
  name: 'fivethirtyeight',

  // Canvas - light grey
  background: '#F0F0F0',
  plotBackground: '#F0F0F0',

  // Grid - slightly darker grey
  gridMajorColor: '#CBCBCB',
  gridMajorWidth: 1,
  gridMinorColor: '#DEDEDE',
  gridMinorWidth: 0.5,
  showGridMajor: true,
  showGridMinor: false,

  // Axes - no visible axis lines (FiveThirtyEight style)
  axisLineColor: '#000000',
  axisLineWidth: 0,
  showAxisLines: false,

  // Text - Helvetica-based clean typography
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  titleFontSize: 16,
  titleFontWeight: 'bold',
  titleColor: '#3C3C3C',
  axisTitleFontSize: 12,
  axisTitleColor: '#3C3C3C',
  axisTickFontSize: 11,
  axisTickColor: '#3C3C3C',

  // Legend
  legendBackground: 'transparent',
  legendBorderColor: 'transparent',
  legendFontSize: 11,

  // Color palettes (FiveThirtyEight signature colors)
  colorPalette: ['#FF2700', '#008FD5', '#77AB43', '#636464', '#C5C5C5', '#FF6F00', '#00A86B', '#9467BD'],
  sequentialPalette: ['#DEEBF7', '#C6DBEF', '#9ECAE1', '#6BAED6', '#4292C6', '#2171B5', '#08519C'],
  divergingPalette: ['#FF2700', '#FF6F00', '#FFAA00', '#F0F0F0', '#77AB43', '#3D7A33', '#1E5631'],

  // Element colors
  boxFillColor: '#008FD5',
  boxStrokeColor: '#006BA6',
  barFillColor: '#008FD5',
  pointFillColor: '#008FD5',
  lineColor: '#008FD5',
  highlightColor: '#FF2700',
  medianColor: '#FFFFFF',
  meanColor: '#FF2700',

  // Violin
  violinFillColor: '#008FD5',
  violinStrokeColor: '#006BA6',

  // Spacing
  plotMargin: { top: 15, right: 15, bottom: 45, left: 55 },
  titlePadding: 15,
};
