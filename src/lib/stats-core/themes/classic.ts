/**
 * Classic Theme
 * Traditional R/base graphics style with axis lines and no grid
 */

import { PhantomStatTheme } from './types';

export const themeClassic: PhantomStatTheme = {
  name: 'classic',

  // Canvas
  background: '#FFFFFF',
  plotBackground: '#FFFFFF',

  // Grid - no gridlines
  gridMajorColor: '#000000',
  gridMajorWidth: 0,
  gridMinorColor: '#000000',
  gridMinorWidth: 0,
  showGridMajor: false,
  showGridMinor: false,

  // Axes - visible black axis lines
  axisLineColor: '#000000',
  axisLineWidth: 1,
  showAxisLines: true,

  // Text - Times/serif font for academic style
  fontFamily: '"Times New Roman", Times, Georgia, serif',
  titleFontSize: 14,
  titleFontWeight: 'bold',
  titleColor: '#000000',
  axisTitleFontSize: 12,
  axisTitleColor: '#000000',
  axisTickFontSize: 10,
  axisTickColor: '#000000',

  // Legend
  legendBackground: '#FFFFFF',
  legendBorderColor: '#000000',
  legendFontSize: 10,

  // Color palettes (classic R colors)
  colorPalette: ['#000000', '#DF536B', '#61D04F', '#2297E6', '#28E2E5', '#CD0BBC', '#F5C710', '#9E9E9E'],
  sequentialPalette: ['#FFF7FB', '#ECE2F0', '#D0D1E6', '#A6BDDB', '#67A9CF', '#1C9099'],
  divergingPalette: ['#8E0152', '#C51B7D', '#DE77AE', '#F1B6DA', '#FDE0EF', '#F7F7F7', '#E6F5D0', '#B8E186', '#7FBC41', '#4D9221', '#276419'],

  // Element colors
  boxFillColor: '#FFFFFF',
  boxStrokeColor: '#000000',
  barFillColor: '#CCCCCC',
  pointFillColor: '#000000',
  lineColor: '#000000',
  highlightColor: '#DF536B',
  medianColor: '#000000',
  meanColor: '#DF536B',

  // Violin
  violinFillColor: '#CCCCCC',
  violinStrokeColor: '#000000',

  // Spacing
  plotMargin: { top: 10, right: 10, bottom: 40, left: 50 },
  titlePadding: 10,
};
