/**
 * Minimal Theme
 * Clean white background with subtle gridlines
 */

import { PhantomStatTheme } from './types';

export const themeMinimal: PhantomStatTheme = {
  name: 'minimal',

  // Canvas
  background: '#FFFFFF',
  plotBackground: '#FFFFFF',

  // Grid - subtle grey lines
  gridMajorColor: '#D9D9D9',
  gridMajorWidth: 0.5,
  gridMinorColor: '#F0F0F0',
  gridMinorWidth: 0.25,
  showGridMajor: true,
  showGridMinor: false,

  // Axes - no visible axis lines
  axisLineColor: '#000000',
  axisLineWidth: 0,
  showAxisLines: false,

  // Text
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  titleFontSize: 14,
  titleFontWeight: '500',
  titleColor: '#333333',
  axisTitleFontSize: 11,
  axisTitleColor: '#666666',
  axisTickFontSize: 10,
  axisTickColor: '#999999',

  // Legend
  legendBackground: 'transparent',
  legendBorderColor: 'transparent',
  legendFontSize: 10,

  // Color palettes
  colorPalette: ['#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7'],
  sequentialPalette: ['#C6DBEF', '#9ECAE1', '#6BAED6', '#4292C6', '#2171B5', '#084594'],
  divergingPalette: ['#D73027', '#F46D43', '#FDAE61', '#FEE090', '#E0F3F8', '#ABD9E9', '#74ADD1', '#4575B4'],

  // Element colors
  boxFillColor: '#4E79A7',
  boxStrokeColor: '#365678',
  barFillColor: '#4E79A7',
  pointFillColor: '#4E79A7',
  lineColor: '#4E79A7',
  highlightColor: '#E15759',
  medianColor: '#FFFFFF',
  meanColor: '#E15759',

  // Violin
  violinFillColor: '#4E79A7',
  violinStrokeColor: '#365678',

  // Spacing
  plotMargin: { top: 10, right: 10, bottom: 40, left: 50 },
  titlePadding: 10,
};
