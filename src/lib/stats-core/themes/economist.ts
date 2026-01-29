/**
 * The Economist Theme
 * Light blue-grey background with clean typography
 */

import { PhantomStatTheme } from './types';

export const themeEconomist: PhantomStatTheme = {
  name: 'economist',

  // Canvas - signature light blue-grey
  background: '#D5E4EB',
  plotBackground: '#D5E4EB',

  // Grid - white gridlines
  gridMajorColor: '#FFFFFF',
  gridMajorWidth: 1,
  gridMinorColor: '#FFFFFF',
  gridMinorWidth: 0.5,
  showGridMajor: true,
  showGridMinor: false,

  // Axes - no visible axis lines
  axisLineColor: '#000000',
  axisLineWidth: 0,
  showAxisLines: false,

  // Text - clean sans-serif
  fontFamily: '"ITC Officina Sans", "Segoe UI", Roboto, sans-serif',
  titleFontSize: 14,
  titleFontWeight: 'bold',
  titleColor: '#000000',
  axisTitleFontSize: 11,
  axisTitleColor: '#3B3B3B',
  axisTickFontSize: 10,
  axisTickColor: '#3B3B3B',

  // Legend
  legendBackground: 'transparent',
  legendBorderColor: 'transparent',
  legendFontSize: 10,

  // Color palettes (Economist-style blues and teals)
  colorPalette: ['#01A2D9', '#014D64', '#6794A7', '#7AD2F6', '#00887D', '#76C0C1', '#ADADAD', '#7C260B'],
  sequentialPalette: ['#C6DBEF', '#9ECAE1', '#6BAED6', '#4292C6', '#2171B5', '#084594'],
  divergingPalette: ['#01A2D9', '#6794A7', '#D5E4EB', '#FFFFFF', '#EECED3', '#A76571', '#7C260B'],

  // Element colors
  boxFillColor: '#014D64',
  boxStrokeColor: '#01303F',
  barFillColor: '#014D64',
  pointFillColor: '#014D64',
  lineColor: '#01A2D9',
  highlightColor: '#7C260B',
  medianColor: '#FFFFFF',
  meanColor: '#7C260B',

  // Violin
  violinFillColor: '#6794A7',
  violinStrokeColor: '#014D64',

  // Spacing
  plotMargin: { top: 10, right: 10, bottom: 40, left: 50 },
  titlePadding: 10,
};
