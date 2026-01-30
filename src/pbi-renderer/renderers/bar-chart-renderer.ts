/**
 * Bar Chart Renderer
 *
 * D3-based renderer for horizontal clustered bar charts that matches
 * Power BI Desktop's rendering specifications.
 */

import * as d3 from 'd3';
import { BaseRenderer, RenderContext, DataPoint, PlotArea, BarChartDefaults, VisualConfig } from './base-renderer';
import { formatAxisValue, calculateNiceTicks } from '../utils/axis-calculator';
import { truncateLabelApproximate } from '../utils/text-measurement';
import barChartDefaults from '../defaults/bar-chart.json';

export interface BarChartConfig extends VisualConfig {
  showDataLabels?: boolean;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showGridLines?: boolean;
  categoryAxisTitle?: string;
  valueAxisTitle?: string;
  // New high-fidelity options
  title?: string;
  subTitle?: string;
  dataLabelPosition?: 'outsideEnd' | 'insideEnd' | 'insideBase' | 'insideCenter';
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  showShadow?: boolean;
  showAxisTitles?: boolean;
  showTickMarks?: boolean;
  barStrokeWidth?: number;
  barStrokeColor?: string;
}

export class BarChartRenderer extends BaseRenderer<BarChartDefaults> {
  constructor(config: BarChartConfig = {}) {
    super(config, barChartDefaults as BarChartDefaults);
  }

  /**
   * Calculate the height consumed by title and subtitle.
   */
  private calculateTitleHeight(): number {
    let height = 0;
    const config = this.config as BarChartConfig;

    // Check for title
    const titleText = config.title || this.getConfig<string>('title.text', '');
    const titleVisible = titleText ? true : this.getConfig<boolean>('title.defaultVisible', false);

    if (titleVisible && titleText) {
      const titleFont = this.getConfig<{ size: number }>('title.font');
      const titleMargin = this.getConfig<number>('title.marginBottom', 4);
      height += titleFont.size + titleMargin;
    }

    // Check for subtitle
    const subTitleText = config.subTitle || this.getConfig<string>('subTitle.text', '');
    const subTitleVisible = subTitleText ? true : this.getConfig<boolean>('subTitle.defaultVisible', false);

    if (subTitleVisible && subTitleText) {
      const subTitleFont = this.getConfig<{ size: number }>('subTitle.font');
      const subTitleMargin = this.getConfig<number>('subTitle.marginBottom', 8);
      height += subTitleFont.size + subTitleMargin;
    }

    return height;
  }

  /**
   * Calculate the width needed for axis titles.
   */
  private calculateAxisTitleSpace(): { left: number; bottom: number } {
    const config = this.config as BarChartConfig;
    let left = 0;
    let bottom = 0;

    if (config.showAxisTitles !== false) {
      // Category axis title (left side, rotated)
      if (config.categoryAxisTitle) {
        const font = this.getConfig<{ size: number }>('categoryAxis.title.font');
        const margin = this.getConfig<number>('categoryAxis.title.marginRight', 8);
        left = font.size + margin;
      }

      // Value axis title (bottom)
      if (config.valueAxisTitle) {
        const font = this.getConfig<{ size: number }>('valueAxis.title.font');
        const margin = this.getConfig<number>('valueAxis.title.marginBottom', 8);
        bottom = font.size + margin;
      }
    }

    return { left, bottom };
  }

  /**
   * Calculate plot area accounting for axes, legend, padding, title, and subtitle.
   */
  protected calculatePlotArea(ctx: RenderContext): PlotArea {
    const padding = this.getConfig<{ top: number; right: number; bottom: number; left: number }>('container.padding');
    const categoryAxisWidth = this.calculateCategoryAxisWidth(ctx.data);
    const valueAxisHeight = this.getConfig<number>('valueAxis.height');
    const titleHeight = this.calculateTitleHeight();
    const axisTitleSpace = this.calculateAxisTitleSpace();

    // Check legend
    const showLegend = this.shouldShowLegend(ctx.data);
    const legendPosition = this.getConfig<string>('legend.position', 'right');

    let left = padding.left + categoryAxisWidth + axisTitleSpace.left;
    let right = padding.right;
    let top = padding.top + titleHeight;
    let bottom = padding.bottom + valueAxisHeight + axisTitleSpace.bottom;

    if (showLegend) {
      const legendWidth = this.getConfig<number>('legend.dimensions.widthWhenSide');
      const legendHeight = this.getConfig<number>('legend.dimensions.heightWhenTopBottom');

      switch (legendPosition) {
        case 'top':
          top += legendHeight;
          break;
        case 'bottom':
          bottom += legendHeight;
          break;
        case 'left':
          left += legendWidth;
          break;
        case 'right':
          right += legendWidth;
          break;
      }
    }

    return {
      x: left,
      y: top,
      width: Math.max(0, ctx.width - left - right),
      height: Math.max(0, ctx.height - top - bottom)
    };
  }

  /**
   * Calculate the width needed for category axis labels.
   */
  private calculateCategoryAxisWidth(data: DataPoint[]): number {
    const maxWidth = this.getConfig<number>('categoryAxis.labels.maxWidth');
    const fontSize = this.getConfig<number>('categoryAxis.labels.font.size');
    const marginRight = this.getConfig<number>('categoryAxis.labels.marginRight');

    // Find longest label
    const longestLabel = data.reduce(
      (longest, d) => (d.category.length > longest.length ? d.category : longest),
      ''
    );

    // Approximate width (will be truncated if too long)
    const charWidth = fontSize * 0.6;
    const labelWidth = Math.min(longestLabel.length * charWidth, maxWidth);

    return labelWidth + marginRight + 5; // Extra padding
  }

  /**
   * Determine if legend should be shown.
   */
  private shouldShowLegend(data: DataPoint[]): boolean {
    const configShow = (this.config as BarChartConfig).showLegend;
    if (configShow !== undefined) return configShow;

    // Show legend only if multiple series
    const series = new Set(data.map(d => d.series).filter(Boolean));
    return series.size > 1;
  }

  /**
   * Render container with background, border, and drop shadow.
   */
  private renderContainer(svg: SVGElement, width: number, height: number): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const config = this.config as BarChartConfig;

    // Get container config
    const bgConfig = this.getConfig<{ color: string; transparency: number }>('visualContainer.background');
    const borderConfig = this.getConfig<{
      visible: boolean;
      color: string;
      width: number;
      radius: number;
    }>('visualContainer.border');
    const shadowConfig = this.getConfig<{
      visible: boolean;
      color: string;
      offsetX: number;
      offsetY: number;
      blur: number;
    }>('visualContainer.dropShadow');

    // Override with explicit config
    const showBorder = config.showBorder ?? borderConfig.visible;
    const showShadow = config.showShadow ?? shadowConfig.visible;

    // Add drop shadow filter if needed
    if (showShadow) {
      const defs = document.createElementNS(svgNS, 'defs');
      const filter = document.createElementNS(svgNS, 'filter');
      filter.setAttribute('id', 'dropShadow');
      filter.setAttribute('x', '-20%');
      filter.setAttribute('y', '-20%');
      filter.setAttribute('width', '140%');
      filter.setAttribute('height', '140%');

      const feDropShadow = document.createElementNS(svgNS, 'feDropShadow');
      feDropShadow.setAttribute('dx', String(shadowConfig.offsetX));
      feDropShadow.setAttribute('dy', String(shadowConfig.offsetY));
      feDropShadow.setAttribute('stdDeviation', String(shadowConfig.blur / 2));
      feDropShadow.setAttribute('flood-color', shadowConfig.color);

      filter.appendChild(feDropShadow);
      defs.appendChild(filter);
      svg.appendChild(defs);
    }

    // Background rect
    const bgRect = document.createElementNS(svgNS, 'rect');
    bgRect.setAttribute('width', String(width));
    bgRect.setAttribute('height', String(height));

    // Calculate background color with transparency
    const bgColor = bgConfig.color || this.getConfig<string>('container.background', '#FFFFFF');
    const transparency = bgConfig.transparency || 0;
    if (transparency > 0) {
      const opacity = 1 - transparency / 100;
      bgRect.setAttribute('fill', bgColor);
      bgRect.setAttribute('fill-opacity', String(opacity));
    } else {
      bgRect.setAttribute('fill', bgColor);
    }

    // Apply border radius
    const borderRadius = config.borderRadius ?? borderConfig.radius;
    if (borderRadius > 0) {
      bgRect.setAttribute('rx', String(borderRadius));
      bgRect.setAttribute('ry', String(borderRadius));
    }

    // Apply drop shadow
    if (showShadow) {
      bgRect.setAttribute('filter', 'url(#dropShadow)');
    }

    svg.appendChild(bgRect);

    // Border (separate rect for crisp edges)
    if (showBorder) {
      const borderRect = document.createElementNS(svgNS, 'rect');
      const bw = config.borderWidth ?? borderConfig.width;
      borderRect.setAttribute('x', String(bw / 2));
      borderRect.setAttribute('y', String(bw / 2));
      borderRect.setAttribute('width', String(width - bw));
      borderRect.setAttribute('height', String(height - bw));
      borderRect.setAttribute('fill', 'none');
      borderRect.setAttribute('stroke', config.borderColor ?? borderConfig.color);
      borderRect.setAttribute('stroke-width', String(bw));

      if (borderRadius > 0) {
        borderRect.setAttribute('rx', String(borderRadius));
        borderRect.setAttribute('ry', String(borderRadius));
      }

      svg.appendChild(borderRect);
    }
  }

  /**
   * Render visual title and subtitle.
   * Returns the y position after title elements.
   */
  private renderTitle(svg: SVGElement, width: number): number {
    const svgNS = 'http://www.w3.org/2000/svg';
    const config = this.config as BarChartConfig;
    const padding = this.getConfig<{ left: number; top: number }>('container.padding');

    let currentY = padding.top;

    // Render title
    const titleText = config.title || this.getConfig<string>('title.text', '');
    const titleVisible = titleText ? true : this.getConfig<boolean>('title.defaultVisible', false);

    if (titleVisible && titleText) {
      const titleFont = this.getConfig<{
        family: string;
        size: number;
        color: string;
        weight: number;
      }>('title.font');
      const titleAlignment = this.getConfig<string>('title.alignment', 'left');
      const titleMargin = this.getConfig<number>('title.marginBottom', 4);

      const text = document.createElementNS(svgNS, 'text');

      // Calculate x position based on alignment
      let x: number;
      let textAnchor: string;
      switch (titleAlignment) {
        case 'center':
          x = width / 2;
          textAnchor = 'middle';
          break;
        case 'right':
          x = width - padding.left;
          textAnchor = 'end';
          break;
        default: // left
          x = padding.left;
          textAnchor = 'start';
      }

      text.setAttribute('x', String(x));
      text.setAttribute('y', String(currentY + titleFont.size));
      text.setAttribute('text-anchor', textAnchor);
      text.setAttribute('font-family', titleFont.family);
      text.setAttribute('font-size', String(titleFont.size));
      text.setAttribute('font-weight', String(titleFont.weight));
      text.setAttribute('fill', titleFont.color);
      text.setAttribute('class', 'visual-title');
      text.textContent = titleText;

      svg.appendChild(text);
      currentY += titleFont.size + titleMargin;
    }

    // Render subtitle
    const subTitleText = config.subTitle || this.getConfig<string>('subTitle.text', '');
    const subTitleVisible = subTitleText ? true : this.getConfig<boolean>('subTitle.defaultVisible', false);

    if (subTitleVisible && subTitleText) {
      const subTitleFont = this.getConfig<{
        family: string;
        size: number;
        color: string;
        weight: number;
      }>('subTitle.font');
      const subTitleMargin = this.getConfig<number>('subTitle.marginBottom', 8);

      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', String(padding.left));
      text.setAttribute('y', String(currentY + subTitleFont.size));
      text.setAttribute('font-family', subTitleFont.family);
      text.setAttribute('font-size', String(subTitleFont.size));
      text.setAttribute('font-weight', String(subTitleFont.weight));
      text.setAttribute('fill', subTitleFont.color);
      text.setAttribute('class', 'visual-subtitle');
      text.textContent = subTitleText;

      svg.appendChild(text);
      currentY += subTitleFont.size + subTitleMargin;
    }

    return currentY;
  }

  /**
   * Main render method - creates SVG with all chart elements.
   */
  public render(ctx: RenderContext): SVGElement {
    const { width, height, data } = ctx;
    const plotArea = this.calculatePlotArea(ctx);

    // Create SVG namespace
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('class', 'pbi-visual pbi-bar-chart');

    // Render container (border, shadow, background)
    this.renderContainer(svg, width, height);

    if (data.length === 0) {
      return svg;
    }

    // Render title and subtitle
    this.renderTitle(svg, width);

    // Create scales - support negative values
    const categories = data.map(d => d.category);
    const values = data.map(d => d.value);
    const minValue = Math.min(0, ...values);
    const maxValue = Math.max(0, ...values);
    const { ticks, min: niceMin, max: niceMax } = calculateNiceTicks(minValue, maxValue);
    const hasNegativeValues = minValue < 0;

    // Y-scale (categories for horizontal bars)
    const yScale = d3.scaleBand()
      .domain(categories)
      .range([0, plotArea.height])
      .padding(1 - this.getConfig<number>('bars.layout.widthRatio'));

    // X-scale (values) - domain includes negative values if present
    const xScale = d3.scaleLinear()
      .domain([niceMin, niceMax])
      .range([0, plotArea.width]);

    // Create plot group
    const plotGroup = document.createElementNS(svgNS, 'g');
    plotGroup.setAttribute('transform', `translate(${plotArea.x}, ${plotArea.y})`);
    svg.appendChild(plotGroup);

    // Render grid lines
    if (this.getConfig<boolean>('valueAxis.gridLines.visible')) {
      this.renderGridLines(plotGroup, xScale, ticks, plotArea);
    }

    // Render zero line if data has both positive and negative values
    if (hasNegativeValues) {
      this.renderZeroLine(plotGroup, xScale, plotArea);
    }

    // Render bars
    this.renderBars(plotGroup, data, xScale, yScale);

    // Render data labels
    const showDataLabels = (this.config as BarChartConfig).showDataLabels ??
      this.getConfig<boolean>('dataLabels.defaultVisible');
    if (showDataLabels) {
      this.renderDataLabels(plotGroup, data, xScale, yScale);
    }

    // Render category axis (Y-axis for horizontal bars)
    this.renderCategoryAxis(svg, yScale, plotArea);

    // Render value axis (X-axis for horizontal bars)
    this.renderValueAxis(svg, xScale, ticks, plotArea);

    // Render legend
    if (this.shouldShowLegend(data)) {
      this.renderLegend(svg, data, width, height, plotArea);
    }

    return svg;
  }

  /**
   * Render vertical grid lines.
   */
  private renderGridLines(
    group: SVGGElement,
    xScale: d3.ScaleLinear<number, number>,
    ticks: number[],
    plotArea: PlotArea
  ): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const gridColor = this.getConfig<string>('valueAxis.gridLines.color');
    const gridWidth = this.getConfig<number>('valueAxis.gridLines.width');

    const gridGroup = document.createElementNS(svgNS, 'g');
    gridGroup.setAttribute('class', 'grid-lines');

    for (const tick of ticks) {
      if (tick === 0) continue; // Skip zero line

      const x = xScale(tick);
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', String(x));
      line.setAttribute('y1', '0');
      line.setAttribute('x2', String(x));
      line.setAttribute('y2', String(plotArea.height));
      line.setAttribute('stroke', gridColor);
      line.setAttribute('stroke-width', String(gridWidth));
      gridGroup.appendChild(line);
    }

    group.appendChild(gridGroup);
  }

  /**
   * Render zero line for charts with negative values.
   */
  private renderZeroLine(
    group: SVGGElement,
    xScale: d3.ScaleLinear<number, number>,
    plotArea: PlotArea
  ): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const zeroX = xScale(0);

    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', String(zeroX));
    line.setAttribute('y1', '0');
    line.setAttribute('x2', String(zeroX));
    line.setAttribute('y2', String(plotArea.height));
    line.setAttribute('stroke', '#666666');
    line.setAttribute('stroke-width', '1');
    line.setAttribute('class', 'zero-line');

    group.appendChild(line);
  }

  /**
   * Render bars with support for stroke/border.
   */
  private renderBars(
    group: SVGGElement,
    data: DataPoint[],
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleBand<string>
  ): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const config = this.config as BarChartConfig;
    const cornerRadius = this.getConfig<number>('bars.appearance.cornerRadius');
    const defaultStrokeWidth = this.getConfig<number>('bars.appearance.strokeWidth', 0);
    const defaultStrokeColor = this.getConfig<string | null>('bars.appearance.strokeColor', null);

    // Override with explicit config
    const strokeWidth = config.barStrokeWidth ?? defaultStrokeWidth;
    const strokeColor = config.barStrokeColor ?? defaultStrokeColor;

    const barsGroup = document.createElementNS(svgNS, 'g');
    barsGroup.setAttribute('class', 'bars');

    // Group data by series
    const seriesSet = new Set(data.map(d => d.series || 'default'));
    const seriesArray = Array.from(seriesSet);

    // Calculate zero position for negative value support
    const zeroX = xScale(0);

    data.forEach((d, i) => {
      const barY = yScale(d.category);
      if (barY === undefined) return;

      const barHeight = yScale.bandwidth();

      // Support negative values
      const barX = d.value >= 0 ? zeroX : xScale(d.value);
      const barWidth = Math.abs(xScale(d.value) - zeroX);

      // Get color based on series or index
      const seriesIndex = seriesArray.indexOf(d.series || 'default');
      const colorIndex = seriesArray.length > 1 ? seriesIndex : i;
      const color = this.getPaletteColor(colorIndex);

      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', String(barX));
      rect.setAttribute('y', String(barY));
      rect.setAttribute('width', String(Math.max(0, barWidth)));
      rect.setAttribute('height', String(barHeight));
      rect.setAttribute('fill', color);
      rect.setAttribute('rx', String(cornerRadius));
      rect.setAttribute('class', 'bar');

      // Add stroke if configured
      if (strokeWidth > 0 && strokeColor) {
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', String(strokeWidth));
      }

      barsGroup.appendChild(rect);
    });

    group.appendChild(barsGroup);
  }

  /**
   * Render data labels with support for different positions.
   */
  private renderDataLabels(
    group: SVGGElement,
    data: DataPoint[],
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleBand<string>
  ): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const config = this.config as BarChartConfig;
    const labelConfig = this.getConfig<{
      font: { family: string; size: number; color: string; weight: number };
      padding: number;
      position: string;
    }>('dataLabels');

    const position = config.dataLabelPosition || labelConfig.position || 'outsideEnd';

    const labelsGroup = document.createElementNS(svgNS, 'g');
    labelsGroup.setAttribute('class', 'data-labels');

    // Group data by series for color lookup
    const seriesSet = new Set(data.map(d => d.series || 'default'));
    const seriesArray = Array.from(seriesSet);

    data.forEach((d, i) => {
      const barY = yScale(d.category);
      if (barY === undefined) return;

      const barHeight = yScale.bandwidth();
      const barWidth = Math.max(0, xScale(d.value));
      const zeroX = xScale(0);

      // Get bar color for contrast calculation
      const seriesIndex = seriesArray.indexOf(d.series || 'default');
      const colorIndex = seriesArray.length > 1 ? seriesIndex : i;
      const barColor = this.getPaletteColor(colorIndex);

      // Calculate position based on position setting
      let x: number;
      let textAnchor: string;
      let fill: string;

      switch (position) {
        case 'insideEnd':
          // At right edge of bar, inside
          x = barWidth - labelConfig.padding;
          textAnchor = 'end';
          fill = this.getContrastColor(barColor);
          break;
        case 'insideBase':
          // At left edge of bar, inside
          x = zeroX + labelConfig.padding;
          textAnchor = 'start';
          fill = this.getContrastColor(barColor);
          break;
        case 'insideCenter':
          // Centered within bar
          x = barWidth / 2;
          textAnchor = 'middle';
          fill = this.getContrastColor(barColor);
          break;
        default: // outsideEnd
          // Outside right edge of bar
          x = barWidth + labelConfig.padding;
          textAnchor = 'start';
          fill = labelConfig.font.color;
      }

      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', String(x));
      text.setAttribute('y', String(barY + barHeight / 2));
      text.setAttribute('dy', '0.35em'); // Vertical center
      text.setAttribute('text-anchor', textAnchor);
      text.setAttribute('font-family', labelConfig.font.family);
      text.setAttribute('font-size', String(labelConfig.font.size));
      text.setAttribute('fill', fill);
      text.setAttribute('font-weight', String(labelConfig.font.weight));
      text.textContent = formatAxisValue(d.value);

      labelsGroup.appendChild(text);
    });

    group.appendChild(labelsGroup);
  }

  /**
   * Render category axis (Y-axis for horizontal bars).
   */
  private renderCategoryAxis(
    svg: SVGElement,
    yScale: d3.ScaleBand<string>,
    plotArea: PlotArea
  ): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const config = this.config as BarChartConfig;
    const labelConfig = this.getConfig<{
      font: { family: string; size: number; color: string; weight: number };
      maxWidth: number;
      marginRight: number;
    }>('categoryAxis.labels');
    const lineConfig = this.getConfig<{ visible: boolean; color: string; width: number }>('categoryAxis.line');
    const tickConfig = this.getConfig<{
      visible: boolean;
      length: number;
      color: string;
      width: number;
    }>('categoryAxis.ticks');

    const axisGroup = document.createElementNS(svgNS, 'g');
    axisGroup.setAttribute('class', 'category-axis');
    axisGroup.setAttribute('transform', `translate(${plotArea.x}, ${plotArea.y})`);

    // Axis line
    if (lineConfig.visible) {
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', '0');
      line.setAttribute('x2', '0');
      line.setAttribute('y2', String(plotArea.height));
      line.setAttribute('stroke', lineConfig.color);
      line.setAttribute('stroke-width', String(lineConfig.width));
      axisGroup.appendChild(line);
    }

    // Category labels and tick marks
    const categories = yScale.domain();
    const showTicks = config.showTickMarks ?? tickConfig.visible;

    categories.forEach(category => {
      const y = yScale(category);
      if (y === undefined) return;

      const centerY = y + yScale.bandwidth() / 2;

      // Tick mark
      if (showTicks) {
        const tick = document.createElementNS(svgNS, 'line');
        tick.setAttribute('x1', '0');
        tick.setAttribute('y1', String(centerY));
        tick.setAttribute('x2', String(-tickConfig.length));
        tick.setAttribute('y2', String(centerY));
        tick.setAttribute('stroke', tickConfig.color);
        tick.setAttribute('stroke-width', String(tickConfig.width));
        axisGroup.appendChild(tick);
      }

      // Label
      const text = document.createElementNS(svgNS, 'text');
      const labelX = showTicks ? -tickConfig.length - labelConfig.marginRight : -labelConfig.marginRight;
      text.setAttribute('x', String(labelX));
      text.setAttribute('y', String(centerY));
      text.setAttribute('dy', '0.35em');
      text.setAttribute('text-anchor', 'end');
      text.setAttribute('font-family', labelConfig.font.family);
      text.setAttribute('font-size', String(labelConfig.font.size));
      text.setAttribute('fill', labelConfig.font.color);
      text.setAttribute('font-weight', String(labelConfig.font.weight));

      // Truncate if too long
      const truncatedText = truncateLabelApproximate(category, labelConfig.maxWidth, labelConfig.font.size);
      text.textContent = truncatedText;

      axisGroup.appendChild(text);
    });

    svg.appendChild(axisGroup);

    // Render category axis title if provided
    if (config.categoryAxisTitle && config.showAxisTitles !== false) {
      this.renderCategoryAxisTitle(svg, plotArea);
    }
  }

  /**
   * Render category axis title (rotated -90° for horizontal bars).
   */
  private renderCategoryAxisTitle(svg: SVGElement, plotArea: PlotArea): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const config = this.config as BarChartConfig;
    const titleFont = this.getConfig<{
      family: string;
      size: number;
      color: string;
      weight: number;
    }>('categoryAxis.title.font');
    const padding = this.getConfig<{ left: number }>('container.padding');

    const text = document.createElementNS(svgNS, 'text');
    // Position at left side, vertically centered
    const x = padding.left;
    const y = plotArea.y + plotArea.height / 2;

    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', titleFont.family);
    text.setAttribute('font-size', String(titleFont.size));
    text.setAttribute('fill', titleFont.color);
    text.setAttribute('font-weight', String(titleFont.weight));
    text.setAttribute('transform', `rotate(-90, ${x}, ${y})`);
    text.setAttribute('class', 'axis-title category-axis-title');
    text.textContent = config.categoryAxisTitle || '';

    svg.appendChild(text);
  }

  /**
   * Render value axis (X-axis for horizontal bars).
   */
  private renderValueAxis(
    svg: SVGElement,
    xScale: d3.ScaleLinear<number, number>,
    ticks: number[],
    plotArea: PlotArea
  ): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const config = this.config as BarChartConfig;
    const labelConfig = this.getConfig<{
      font: { family: string; size: number; color: string; weight: number };
      marginTop: number;
    }>('valueAxis.labels');
    const lineConfig = this.getConfig<{ visible: boolean; color: string; width: number }>('valueAxis.line');
    const tickConfig = this.getConfig<{
      visible: boolean;
      length: number;
      color: string;
      width: number;
    }>('valueAxis.ticks');

    const axisGroup = document.createElementNS(svgNS, 'g');
    axisGroup.setAttribute('class', 'value-axis');
    axisGroup.setAttribute('transform', `translate(${plotArea.x}, ${plotArea.y + plotArea.height})`);

    // Axis line
    if (lineConfig.visible) {
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', '0');
      line.setAttribute('x2', String(plotArea.width));
      line.setAttribute('y2', '0');
      line.setAttribute('stroke', lineConfig.color);
      line.setAttribute('stroke-width', String(lineConfig.width));
      axisGroup.appendChild(line);
    }

    // Tick marks and labels
    const showTicks = config.showTickMarks ?? tickConfig.visible;

    ticks.forEach(tick => {
      const x = xScale(tick);

      // Tick mark
      if (showTicks) {
        const tickLine = document.createElementNS(svgNS, 'line');
        tickLine.setAttribute('x1', String(x));
        tickLine.setAttribute('y1', '0');
        tickLine.setAttribute('x2', String(x));
        tickLine.setAttribute('y2', String(tickConfig.length));
        tickLine.setAttribute('stroke', tickConfig.color);
        tickLine.setAttribute('stroke-width', String(tickConfig.width));
        axisGroup.appendChild(tickLine);
      }

      // Label
      const labelY = showTicks
        ? tickConfig.length + labelConfig.marginTop + labelConfig.font.size
        : labelConfig.marginTop + labelConfig.font.size;

      const text = document.createElementNS(svgNS, 'text');
      text.setAttribute('x', String(x));
      text.setAttribute('y', String(labelY));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-family', labelConfig.font.family);
      text.setAttribute('font-size', String(labelConfig.font.size));
      text.setAttribute('fill', labelConfig.font.color);
      text.setAttribute('font-weight', String(labelConfig.font.weight));
      text.textContent = formatAxisValue(tick);

      axisGroup.appendChild(text);
    });

    svg.appendChild(axisGroup);

    // Render value axis title if provided
    if (config.valueAxisTitle && config.showAxisTitles !== false) {
      this.renderValueAxisTitle(svg, plotArea);
    }
  }

  /**
   * Render value axis title (below the axis).
   */
  private renderValueAxisTitle(svg: SVGElement, plotArea: PlotArea): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const config = this.config as BarChartConfig;
    const titleFont = this.getConfig<{
      family: string;
      size: number;
      color: string;
      weight: number;
    }>('valueAxis.title.font');
    const valueAxisHeight = this.getConfig<number>('valueAxis.height');
    const padding = this.getConfig<{ bottom: number }>('container.padding');

    const text = document.createElementNS(svgNS, 'text');
    // Position horizontally centered below the value axis
    const x = plotArea.x + plotArea.width / 2;
    const y = plotArea.y + plotArea.height + valueAxisHeight + padding.bottom - 4;

    text.setAttribute('x', String(x));
    text.setAttribute('y', String(y));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('font-family', titleFont.family);
    text.setAttribute('font-size', String(titleFont.size));
    text.setAttribute('fill', titleFont.color);
    text.setAttribute('font-weight', String(titleFont.weight));
    text.setAttribute('class', 'axis-title value-axis-title');
    text.textContent = config.valueAxisTitle || '';

    svg.appendChild(text);
  }

  /**
   * Render legend.
   */
  private renderLegend(
    svg: SVGElement,
    data: DataPoint[],
    _width: number,
    height: number,
    plotArea: PlotArea
  ): void {
    const svgNS = 'http://www.w3.org/2000/svg';
    const legendConfig = this.getConfig<{
      position: string;
      dimensions: { widthWhenSide: number; heightWhenTopBottom: number };
      item: {
        marker: { shape: string; size: number };
        spacing: number;
        font: { family: string; size: number; color: string };
      };
      padding: number;
      marginFromPlot: number;
    }>('legend');

    // Get unique series
    const seriesSet = new Set(data.map(d => d.series).filter(Boolean));
    const seriesArray = Array.from(seriesSet) as string[];

    if (seriesArray.length === 0) return;

    const legendGroup = document.createElementNS(svgNS, 'g');
    legendGroup.setAttribute('class', 'legend');

    // Position legend
    let legendX = 0;
    let legendY = 0;

    switch (legendConfig.position) {
      case 'right':
        legendX = plotArea.x + plotArea.width + legendConfig.marginFromPlot;
        legendY = plotArea.y;
        break;
      case 'left':
        legendX = legendConfig.padding;
        legendY = plotArea.y;
        break;
      case 'top':
        legendX = plotArea.x;
        legendY = legendConfig.padding;
        break;
      case 'bottom':
        legendX = plotArea.x;
        legendY = height - legendConfig.dimensions.heightWhenTopBottom + legendConfig.padding;
        break;
    }

    legendGroup.setAttribute('transform', `translate(${legendX}, ${legendY})`);

    // Render legend items
    const markerShape = legendConfig.item.marker.shape || 'circle';
    const markerSize = legendConfig.item.marker.size;

    seriesArray.forEach((series, i) => {
      const itemY = i * (markerSize + legendConfig.item.spacing);

      // Marker - support circle or square
      let marker: SVGElement;
      if (markerShape === 'circle') {
        marker = document.createElementNS(svgNS, 'circle');
        marker.setAttribute('cx', String(markerSize / 2));
        marker.setAttribute('cy', String(itemY + markerSize / 2));
        marker.setAttribute('r', String(markerSize / 2));
      } else {
        marker = document.createElementNS(svgNS, 'rect');
        marker.setAttribute('x', '0');
        marker.setAttribute('y', String(itemY));
        marker.setAttribute('width', String(markerSize));
        marker.setAttribute('height', String(markerSize));
      }
      marker.setAttribute('fill', this.getPaletteColor(i));
      legendGroup.appendChild(marker);

      // Label
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', String(markerSize + 5));
      label.setAttribute('y', String(itemY + markerSize / 2));
      label.setAttribute('dy', '0.35em');
      label.setAttribute('font-family', legendConfig.item.font.family);
      label.setAttribute('font-size', String(legendConfig.item.font.size));
      label.setAttribute('fill', legendConfig.item.font.color);
      label.textContent = series;
      legendGroup.appendChild(label);
    });

    svg.appendChild(legendGroup);
  }
}

/**
 * Factory function to create a bar chart renderer.
 */
export function createBarChartRenderer(config?: BarChartConfig): BarChartRenderer {
  return new BarChartRenderer(config);
}
