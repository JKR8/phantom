/**
 * ggplot2 Grey Theme (default)
 * Classic grey background with white gridlines
 */

import { PhantomStatTheme } from './types';

export const themeGrey: PhantomStatTheme = {
  name: 'grey',

  // Canvas
  background: '#FFFFFF',
  plotBackground: '#EBEBEB',

  // Grid - white lines on grey background
  gridMajorColor: '#FFFFFF',
  gridMajorWidth: 1,
  gridMinorColor: '#FFFFFF',
  gridMinorWidth: 0.5,
  showGridMajor: true,
  showGridMinor: false,

  // Axes - no visible axis lines (ggplot2 style)
  axisLineColor: '#000000',
  axisLineWidth: 0,
  showAxisLines: false,

  // Text
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  titleFontSize: 14,
  titleFontWeight: 'bold',
  titleColor: '#000000',
  axisTitleFontSize: 11,
  axisTitleColor: '#000000',
  axisTickFontSize: 10,
  axisTickColor: '#4D4D4D',

  // Legend
  legendBackground: '#FFFFFF',
  legendBorderColor: 'transparent',
  legendFontSize: 10,

  // Color palettes (ggplot2 default hue_pal)
  colorPalette: ['#F8766D', '#00BA38', '#619CFF', '#F564E3', '#00BFC4', '#B79F00', '#E76BF3', '#00B0F6'],
  sequentialPalette: ['#132B43', '#1D4F6E', '#2A759A', '#3C9DC5', '#56C5ED', '#7FDBFF'],
  divergingPalette: ['#67001F', '#B2182B', '#D6604D', '#F4A582', '#FDDBC7', '#F7F7F7', '#D1E5F0', '#92C5DE', '#4393C3', '#2166AC', '#053061'],

  // Element colors
  boxFillColor: '#595959',
  boxStrokeColor: '#2B2B2B',
  barFillColor: '#595959',
  pointFillColor: '#000000',
  lineColor: '#3366FF',
  highlightColor: '#F8766D',
  medianColor: '#FFFFFF',
  meanColor: '#F8766D',

  // Violin
  violinFillColor: '#595959',
  violinStrokeColor: '#2B2B2B',

  // Spacing
  plotMargin: { top: 10, right: 10, bottom: 40, left: 50 },
  titlePadding: 10,
};
