# Phantom Business Pack
## Technical Specification Document

**Version:** 1.0  
**Date:** January 2026  
**Status:** Draft for Engineering Review  
**Author:** Product Team  
**Phase:** 3 (follows Gantt Chart)

---

## 1. Executive Summary

### 1.1 Purpose
Build a suite of Power BI custom visuals targeting business analysts, consultants, and finance teams. These visuals fill critical gaps in Power BI's native offering and compete with expensive alternatives like Zebra BI ($$$).

### 1.2 Included Visuals

| Visual | Primary Use Case | Competition |
|--------|------------------|-------------|
| **Mekko Chart** | Market share, portfolio analysis | Almost nothing available |
| **Advanced Waterfall** | P&L bridges, variance analysis | Native (limited), Zebra BI, xViz |
| **Bullet Chart** | KPI performance vs target | Basic AppSource options |

### 1.3 Strategic Context
- Consultants (McKinsey, BCG, Big 4) use these daily
- Finance teams need P&L bridges
- Native Power BI waterfall lacks horizontal, target comparison, conditional formatting
- Mekko charts are virtually unavailable in Power BI
- Bullet charts are a Tufte classic, poorly served

### 1.4 Success Criteria
- Each visual usable in <60 seconds from raw data
- Publication-ready output (consultant quality)
- Passes Microsoft certification
- Free tier competitive with paid alternatives
- Consistent theme system across all Phantom visuals

---

## 2. Mekko Chart

### 2.1 Overview

A Mekko (Marimekko) chart is a two-dimensional stacked bar chart where:
- X-axis: Category width proportional to a measure (e.g., market size)
- Y-axis: Stacked segments showing composition (e.g., market share)

**Variants:**
- **Marimekko**: Both axes are percentage-based (100% width, 100% height)
- **Variable Width Bar**: X proportional to measure, Y is absolute values
- **Mekko (standard)**: X proportional to measure, Y is percentage stacked

### 2.2 Visual Structure

```
100% ┌────────────────┬─────────────────────────┬──────────────┐
     │                │                         │              │
     │    Segment A   │       Segment A         │   Segment A  │
     │      40%       │         35%             │     50%      │
     │                │                         │              │
 50% ├────────────────┼─────────────────────────┼──────────────┤
     │                │                         │              │
     │    Segment B   │       Segment B         │   Segment B  │
     │      35%       │         40%             │     30%      │
     │                │                         │              │
     ├────────────────┼─────────────────────────┼──────────────┤
     │   Segment C    │       Segment C         │   Segment C  │
     │      25%       │         25%             │     20%      │
  0% └────────────────┴─────────────────────────┴──────────────┘
           20%                  50%                   30%
        Category 1          Category 2            Category 3
        ($200M)             ($500M)               ($300M)
```

### 2.3 Data Roles

```json
{
  "dataRoles": [
    {
      "name": "category",
      "displayName": "Category",
      "description": "X-axis categories (columns)",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }]
    },
    {
      "name": "segment",
      "displayName": "Segment",
      "description": "Stacked segments within each category",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }]
    },
    {
      "name": "value",
      "displayName": "Value",
      "description": "Measure for segment height",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "categoryWidth",
      "displayName": "Category Width",
      "description": "Measure determining category (column) width",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "tooltipFields",
      "displayName": "Tooltips",
      "description": "Additional tooltip fields",
      "kind": "Measure"
    }
  ]
}
```

### 2.4 Internal Data Model

```typescript
interface MekkoCategory {
  name: string;
  width: number;                 // absolute value
  widthPercent: number;          // percentage of total
  xStart: number;                // pixel position start
  xEnd: number;                  // pixel position end
  segments: MekkoSegment[];
  total: number;                 // sum of segment values
  selectionId: ISelectionId;
}

interface MekkoSegment {
  name: string;
  value: number;                 // absolute value
  valuePercent: number;          // percentage within category
  yStart: number;                // pixel position start (from bottom)
  yEnd: number;                  // pixel position end
  color: string;
  category: MekkoCategory;
  selectionId: ISelectionId;
}

interface MekkoData {
  categories: MekkoCategory[];
  segments: string[];            // unique segment names (for legend)
  totalWidth: number;            // sum of all category widths
  maxCategoryTotal: number;      // for absolute Y scale
}
```

### 2.5 Configuration Options

```typescript
interface MekkoSettings {
  // Chart type
  chartType: 'marimekko' | 'mekko' | 'variableWidth';
  
  // Y-axis
  yAxisType: 'percentage' | 'absolute';
  yAxisMax: number | 'auto';
  showYAxis: boolean;
  yAxisTitle: string;
  
  // X-axis
  showXAxis: boolean;
  showCategoryWidthLabels: boolean;  // "20%" or "$200M" below
  xAxisTitle: string;
  categoryWidthFormat: 'percentage' | 'value';
  categoryWidthNumberFormat: string;
  
  // Bars
  barPadding: number;            // 0-0.5, gap between categories
  barStrokeColor: string;
  barStrokeWidth: number;
  
  // Segments
  segmentPadding: number;        // 0-5, gap between segments
  
  // Labels
  showSegmentLabels: boolean;
  segmentLabelType: 'value' | 'percentage' | 'both' | 'name';
  segmentLabelPosition: 'center' | 'inside-top' | 'inside-bottom';
  segmentLabelMinHeight: number; // hide label if segment too small
  segmentLabelColor: string;
  segmentLabelFontSize: number;
  
  // Category labels
  showCategoryLabels: boolean;
  categoryLabelPosition: 'bottom' | 'top';
  
  // Total labels
  showCategoryTotals: boolean;
  categoryTotalPosition: 'top' | 'bottom';
  
  // Colors
  colorBySegment: boolean;       // true = segment colors, false = category colors
  
  // Legend
  showLegend: boolean;
  legendPosition: 'top' | 'bottom' | 'left' | 'right';
}
```

### 2.6 Rendering Logic

```typescript
class MekkoRenderer {
  render(data: MekkoData, viewport: IViewport, settings: MekkoSettings): void {
    const margin = this.theme.plotMargin;
    const width = viewport.width - margin.left - margin.right;
    const height = viewport.height - margin.top - margin.bottom;
    
    // X scale: proportional to category width
    let xCursor = 0;
    for (const category of data.categories) {
      category.widthPercent = category.width / data.totalWidth;
      const categoryWidth = category.widthPercent * width * (1 - settings.barPadding);
      const padding = category.widthPercent * width * settings.barPadding;
      
      category.xStart = xCursor + padding / 2;
      category.xEnd = category.xStart + categoryWidth;
      xCursor = category.xEnd + padding / 2;
    }
    
    // Y scale
    const yScale = settings.yAxisType === 'percentage'
      ? d3.scaleLinear().domain([0, 100]).range([height, 0])
      : d3.scaleLinear().domain([0, data.maxCategoryTotal]).range([height, 0]);
    
    // Calculate segment positions within each category
    for (const category of data.categories) {
      let yBottom = height;
      const categoryTotal = category.total;
      
      for (const segment of category.segments) {
        segment.valuePercent = (segment.value / categoryTotal) * 100;
        const segmentHeight = settings.yAxisType === 'percentage'
          ? (segment.valuePercent / 100) * height
          : yScale(0) - yScale(segment.value);
        
        segment.yEnd = yBottom;
        segment.yStart = yBottom - segmentHeight;
        yBottom = segment.yStart - settings.segmentPadding;
      }
    }
    
    // Render
    this.renderBars(data, settings);
    this.renderLabels(data, settings);
    this.renderAxes(data, settings, yScale);
    this.renderLegend(data, settings);
  }
  
  private renderBars(data: MekkoData, settings: MekkoSettings): void {
    const categoryGroups = this.ganttGroup.selectAll('.mekko-category')
      .data(data.categories)
      .join('g')
      .attr('class', 'mekko-category');
    
    categoryGroups.selectAll('.mekko-segment')
      .data(d => d.segments)
      .join('rect')
      .attr('class', 'mekko-segment data-point')
      .attr('x', d => d.category.xStart)
      .attr('width', d => d.category.xEnd - d.category.xStart)
      .attr('y', d => d.yStart)
      .attr('height', d => d.yEnd - d.yStart)
      .attr('fill', d => d.color)
      .attr('stroke', settings.barStrokeColor)
      .attr('stroke-width', settings.barStrokeWidth);
  }
}
```

---

## 3. Advanced Waterfall Chart

### 3.1 Overview

An enhanced waterfall chart addressing all limitations of Power BI's native waterfall:
- Horizontal orientation
- Target comparison with variance
- Conditional formatting per bar
- Subtotals at any position
- Connectors (optional)
- Variance annotations

### 3.2 Visual Structure

**Standard Waterfall:**
```
       ┌────┐
       │    │ +$20M
       │    │
  ┌────┤    ├────┐
  │    │    │    │ -$5M
  │    │    │    │
  │    │    ├────┤
  │    │    │    │ +$10M
  │    │    │    │
  │    │    │    ├────┐
  │    │    │    │    │ Total: $125M
  │    │    │    │    │
Start  +Rev -Cost +Other End
$100M
```

**With Target Comparison:**
```
       ┌────┐
       │    │
       │    │
  ┌────┤    ├────┐
  │    │    │    │
  │    │    │    ├────┐
  │    │    │    │    │ Actual: $125M
  │    │    │    │    │
  │    │    │    │    │
  │    │    │    │    ├─ ─ ┬ ─ ─┐ Target: $130M
  │    │    │    │    │    │    │
                           Gap: -$5M (red)
```

**Horizontal Waterfall (P&L Bridge):**
```
Revenue      ████████████████████████████████████████  $500M
- COGS       ████████████████████████░░░░░░░░░░░░░░░  -$200M
─────────────────────────────────────────────────────
Gross Profit ████████████████████████                  $300M (subtotal)
- OpEx       ██████████████████░░░░░░                  -$120M
- D&A        ████████████░░░░░░                        -$30M
─────────────────────────────────────────────────────
EBITDA       ████████████████                          $150M (total)
```

### 3.3 Data Roles

```json
{
  "dataRoles": [
    {
      "name": "category",
      "displayName": "Category",
      "description": "Waterfall categories (bars)",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }]
    },
    {
      "name": "value",
      "displayName": "Value",
      "description": "Bar values (positive/negative)",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "type",
      "displayName": "Bar Type",
      "description": "Start, Increase, Decrease, Subtotal, Total",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }]
    },
    {
      "name": "target",
      "displayName": "Target",
      "description": "Target value for comparison",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "colorBy",
      "displayName": "Color By",
      "description": "Field for conditional bar coloring",
      "kind": "Grouping"
    },
    {
      "name": "tooltipFields",
      "displayName": "Tooltips",
      "description": "Additional tooltip fields",
      "kind": "Measure"
    }
  ]
}
```

### 3.4 Internal Data Model

```typescript
type WaterfallBarType = 'start' | 'increase' | 'decrease' | 'subtotal' | 'total' | 'target' | 'gap';

interface WaterfallBar {
  category: string;
  value: number;
  absoluteValue: number;         // |value|
  type: WaterfallBarType;
  
  // Computed positions
  startValue: number;            // running total before this bar
  endValue: number;              // running total after this bar
  
  // For rendering
  yStart: number;                // pixel position
  yEnd: number;
  color: string;
  
  // Target comparison
  target: number | null;
  variance: number | null;       // value - target
  variancePercent: number | null;
  
  selectionId: ISelectionId;
}

interface WaterfallData {
  bars: WaterfallBar[];
  minValue: number;
  maxValue: number;
  hasTarget: boolean;
}
```

### 3.5 Configuration Options

```typescript
interface WaterfallSettings {
  // Orientation
  orientation: 'vertical' | 'horizontal';
  
  // Bar types auto-detection
  autoDetectTypes: boolean;      // infer start/total from data
  startCategories: string[];     // manual start categories
  totalCategories: string[];     // manual total categories
  subtotalCategories: string[];  // manual subtotal categories
  
  // Colors
  startColor: string;
  increaseColor: string;
  decreaseColor: string;
  subtotalColor: string;
  totalColor: string;
  
  // Conditional formatting
  useConditionalFormatting: boolean;
  conditionalColorField: string;
  
  // Bar styling
  barWidth: number;              // 0.1-1.0
  barCornerRadius: number;
  barStrokeColor: string;
  barStrokeWidth: number;
  
  // Connectors (lines between bars)
  showConnectors: boolean;
  connectorColor: string;
  connectorWidth: number;
  connectorStyle: 'solid' | 'dashed';
  
  // Labels
  showValueLabels: boolean;
  valueLabelPosition: 'inside' | 'outside' | 'auto';
  valueLabelFormat: string;      // number format
  showSignOnLabels: boolean;     // "+$20M" vs "$20M"
  
  // Running total
  showRunningTotal: boolean;
  runningTotalPosition: 'top' | 'connector';
  
  // Target
  showTarget: boolean;
  targetLineColor: string;
  targetLineWidth: number;
  targetLineStyle: 'solid' | 'dashed';
  showTargetLabel: boolean;
  
  // Gap (variance)
  showGapBar: boolean;           // show variance as final bar
  gapPositiveColor: string;      // beat target
  gapNegativeColor: string;      // missed target
  showGapLabel: boolean;
  gapLabelFormat: 'value' | 'percentage' | 'both';
  
  // Breakdown (drill-into bar)
  enableBreakdown: boolean;      // click bar to expand
  
  // Axis
  showAxis: boolean;
  axisPosition: 'left' | 'right' | 'bottom' | 'top';
  axisTitle: string;
  
  // Legend
  showLegend: boolean;
  legendItems: ('increase' | 'decrease' | 'total' | 'subtotal')[];
}
```

### 3.6 Waterfall Calculation

```typescript
class WaterfallEngine {
  calculatePositions(bars: WaterfallBar[]): void {
    let runningTotal = 0;
    
    for (const bar of bars) {
      switch (bar.type) {
        case 'start':
          bar.startValue = 0;
          bar.endValue = bar.value;
          runningTotal = bar.value;
          break;
          
        case 'increase':
        case 'decrease':
          bar.startValue = runningTotal;
          bar.endValue = runningTotal + bar.value;
          runningTotal = bar.endValue;
          break;
          
        case 'subtotal':
        case 'total':
          bar.startValue = 0;
          bar.endValue = runningTotal;
          bar.value = runningTotal;  // override with calculated
          break;
          
        case 'target':
          bar.startValue = 0;
          bar.endValue = bar.target!;
          break;
          
        case 'gap':
          const lastTotal = bars.find(b => b.type === 'total')?.endValue ?? runningTotal;
          const target = bars.find(b => b.target != null)?.target ?? 0;
          bar.value = lastTotal - target;
          bar.startValue = Math.min(lastTotal, target);
          bar.endValue = Math.max(lastTotal, target);
          break;
      }
      
      // Calculate variance if target exists
      if (bar.target != null && bar.type !== 'target' && bar.type !== 'gap') {
        bar.variance = bar.endValue - bar.target;
        bar.variancePercent = bar.target !== 0 ? (bar.variance / bar.target) * 100 : null;
      }
    }
  }
  
  autoDetectTypes(bars: WaterfallBar[]): void {
    // First bar is typically 'start'
    if (bars.length > 0 && bars[0].type === undefined) {
      bars[0].type = 'start';
    }
    
    // Last bar is typically 'total'
    if (bars.length > 1) {
      const lastBar = bars[bars.length - 1];
      if (lastBar.type === undefined) {
        lastBar.type = 'total';
      }
    }
    
    // Middle bars: positive = increase, negative = decrease
    for (let i = 1; i < bars.length - 1; i++) {
      if (bars[i].type === undefined) {
        bars[i].type = bars[i].value >= 0 ? 'increase' : 'decrease';
      }
    }
  }
}
```

---

## 4. Bullet Chart

### 4.1 Overview

A bullet chart (Stephen Few / Edward Tufte design) shows:
- A primary measure (bar)
- A comparative measure (target line)
- Qualitative ranges (background bands: poor, satisfactory, good)

Ideal for KPI dashboards showing actual vs target with context.

### 4.2 Visual Structure

```
Revenue                    ████████████████████│        
                          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                          Poor     Satisfactory    Good
                                               ↑ Target

Profit Margin              ██████████│                    
                          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                                    ↑ Target

Customer Satisfaction      ██████████████████████████│    
                          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
                                                      ↑ Target
```

**Vertical variant:**
```
     ┬ Target
     │
   ┌─┼─┐
   │ │ │  ← Actual (bar)
   │ │ │
   │ │ │
   └─┴─┘
   Good    ← Qualitative ranges
   ░░░░
   Satis.
   ░░░░
   Poor
```

### 4.3 Data Roles

```json
{
  "dataRoles": [
    {
      "name": "category",
      "displayName": "Category",
      "description": "KPI names (rows)",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }]
    },
    {
      "name": "actual",
      "displayName": "Actual Value",
      "description": "Primary measure (bar)",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "target",
      "displayName": "Target",
      "description": "Comparative measure (target line)",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "minimum",
      "displayName": "Minimum",
      "description": "Scale minimum (optional)",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "maximum",
      "displayName": "Maximum",
      "description": "Scale maximum (optional)",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "poor",
      "displayName": "Poor Threshold",
      "description": "Upper bound of 'poor' range",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "satisfactory",
      "displayName": "Satisfactory Threshold",
      "description": "Upper bound of 'satisfactory' range",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "good",
      "displayName": "Good Threshold",
      "description": "Upper bound of 'good' range (often = max)",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "tooltipFields",
      "displayName": "Tooltips",
      "description": "Additional tooltip fields",
      "kind": "Measure"
    }
  ]
}
```

### 4.4 Internal Data Model

```typescript
interface BulletItem {
  category: string;
  
  // Measures
  actual: number;
  target: number;
  
  // Scale
  minimum: number;
  maximum: number;
  
  // Qualitative ranges
  ranges: QualitativeRange[];
  
  // Computed
  actualPercent: number;         // position as % of scale
  targetPercent: number;
  variance: number;              // actual - target
  variancePercent: number;
  status: 'poor' | 'satisfactory' | 'good' | 'excellent';
  
  selectionId: ISelectionId;
}

interface QualitativeRange {
  name: string;
  start: number;
  end: number;
  color: string;
}

interface BulletData {
  items: BulletItem[];
  globalMinimum: number;         // for consistent scale
  globalMaximum: number;
}
```

### 4.5 Configuration Options

```typescript
interface BulletSettings {
  // Orientation
  orientation: 'horizontal' | 'vertical';
  
  // Scale
  scaleType: 'individual' | 'shared';  // each bullet own scale vs shared
  showScale: boolean;
  scalePosition: 'bottom' | 'top' | 'left' | 'right';
  
  // Actual bar
  barHeight: number;             // relative to row height (0.3-0.8)
  barColor: string;
  barColorByStatus: boolean;     // color based on poor/sat/good
  
  // Target marker
  targetMarkerType: 'line' | 'diamond' | 'triangle';
  targetMarkerSize: number;
  targetMarkerColor: string;
  targetMarkerWidth: number;
  
  // Qualitative ranges
  showRanges: boolean;
  rangeCount: 3 | 5;             // 3 = poor/sat/good, 5 = adds very poor/excellent
  rangeColors: {
    poor: string;
    satisfactory: string;
    good: string;
    veryPoor?: string;
    excellent?: string;
  };
  rangeOpacity: number;
  
  // Auto-calculate ranges if not provided
  autoRanges: boolean;
  autoRangeMethod: 'thirds' | 'quartiles' | 'percentOfTarget';
  
  // Labels
  showCategoryLabels: boolean;
  categoryLabelWidth: number;
  showActualLabel: boolean;
  actualLabelPosition: 'inside' | 'right' | 'above';
  showTargetLabel: boolean;
  showVarianceLabel: boolean;
  varianceFormat: 'value' | 'percentage' | 'both';
  
  // Status indicator
  showStatusIndicator: boolean;
  statusIndicatorType: 'icon' | 'color' | 'both';
  statusIcons: {
    poor: string;                // emoji or icon class
    satisfactory: string;
    good: string;
  };
  
  // Spacing
  itemSpacing: number;           // gap between bullets
  
  // Comparison line (e.g., previous period)
  showComparison: boolean;
  comparisonField: string;
  comparisonMarkerType: 'line' | 'dot';
  comparisonColor: string;
}
```

### 4.6 Rendering Logic

```typescript
class BulletRenderer {
  render(data: BulletData, viewport: IViewport, settings: BulletSettings): void {
    const isHorizontal = settings.orientation === 'horizontal';
    const labelWidth = settings.showCategoryLabels ? settings.categoryLabelWidth : 0;
    const chartWidth = viewport.width - labelWidth;
    const itemHeight = (viewport.height / data.items.length) - settings.itemSpacing;
    
    const bulletGroups = this.svg.selectAll('.bullet-item')
      .data(data.items)
      .join('g')
      .attr('class', 'bullet-item')
      .attr('transform', (d, i) => 
        `translate(${labelWidth}, ${i * (itemHeight + settings.itemSpacing)})`
      );
    
    // Category labels
    if (settings.showCategoryLabels) {
      bulletGroups.append('text')
        .attr('class', 'category-label')
        .attr('x', -10)
        .attr('y', itemHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .text(d => d.category);
    }
    
    // Qualitative ranges (background bands)
    if (settings.showRanges) {
      bulletGroups.each(function(d) {
        const g = d3.select(this);
        const scale = d3.scaleLinear()
          .domain([d.minimum, d.maximum])
          .range([0, chartWidth]);
        
        g.selectAll('.range-band')
          .data(d.ranges)
          .join('rect')
          .attr('class', 'range-band')
          .attr('x', r => scale(r.start))
          .attr('width', r => scale(r.end) - scale(r.start))
          .attr('y', 0)
          .attr('height', itemHeight)
          .attr('fill', r => r.color)
          .attr('fill-opacity', settings.rangeOpacity);
      });
    }
    
    // Actual bar
    bulletGroups.append('rect')
      .attr('class', 'actual-bar data-point')
      .attr('x', 0)
      .attr('width', d => {
        const scale = d3.scaleLinear()
          .domain([d.minimum, d.maximum])
          .range([0, chartWidth]);
        return scale(d.actual);
      })
      .attr('y', itemHeight * (1 - settings.barHeight) / 2)
      .attr('height', itemHeight * settings.barHeight)
      .attr('fill', d => settings.barColorByStatus 
        ? settings.rangeColors[d.status] 
        : settings.barColor);
    
    // Target marker
    bulletGroups.append('line')
      .attr('class', 'target-marker')
      .attr('x1', d => {
        const scale = d3.scaleLinear()
          .domain([d.minimum, d.maximum])
          .range([0, chartWidth]);
        return scale(d.target);
      })
      .attr('x2', d => {
        const scale = d3.scaleLinear()
          .domain([d.minimum, d.maximum])
          .range([0, chartWidth]);
        return scale(d.target);
      })
      .attr('y1', itemHeight * 0.1)
      .attr('y2', itemHeight * 0.9)
      .attr('stroke', settings.targetMarkerColor)
      .attr('stroke-width', settings.targetMarkerWidth);
    
    // Value labels
    if (settings.showActualLabel) {
      bulletGroups.append('text')
        .attr('class', 'actual-label')
        .attr('x', d => {
          const scale = d3.scaleLinear()
            .domain([d.minimum, d.maximum])
            .range([0, chartWidth]);
          return scale(d.actual) + 5;
        })
        .attr('y', itemHeight / 2)
        .attr('dominant-baseline', 'middle')
        .text(d => this.formatValue(d.actual));
    }
  }
}
```

---

## 5. Shared Components

### 5.1 Theme System

All Business Pack visuals share the theme system with Statistical Pack and Gantt Chart. See Statistical Pack spec for theme interface.

### 5.2 Tooltip Component

```typescript
interface EnhancedTooltip {
  title: string;
  items: TooltipItem[];
  footer?: string;
}

interface TooltipItem {
  label: string;
  value: string;
  color?: string;                // color swatch
  variance?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
}

// Example tooltip for Mekko segment:
// ┌─────────────────────────┐
// │ North America           │  ← title
// ├─────────────────────────┤
// │ ■ Market Share    35%   │  ← items
// │   Revenue        $500M  │
// │   vs Target     +$20M ▲ │  ← variance
// ├─────────────────────────┤
// │ 50% of total market     │  ← footer
// └─────────────────────────┘
```

### 5.3 Legend Component

Shared legend component supporting:
- Horizontal / vertical layout
- Interactive (click to filter)
- Overflow handling (scroll / wrap)
- Color swatches

### 5.4 Axis Component

Shared axis component with:
- Smart tick selection
- Rotated labels for long text
- Grid lines
- Axis titles

---

## 6. Settings Panel Structure

### 6.1 Mekko Settings

```json
{
  "objects": {
    "chartType": {
      "displayName": "Chart Type",
      "properties": {
        "type": {
          "displayName": "Type",
          "type": {
            "enumeration": [
              { "value": "marimekko", "displayName": "Marimekko (100% x 100%)" },
              { "value": "mekko", "displayName": "Mekko (Width proportional)" },
              { "value": "variableWidth", "displayName": "Variable Width Bar" }
            ]
          }
        }
      }
    },
    "segments": {
      "displayName": "Segments",
      "properties": {
        "showLabels": { "type": { "bool": true } },
        "labelType": {
          "type": {
            "enumeration": [
              { "value": "value", "displayName": "Value" },
              { "value": "percentage", "displayName": "Percentage" },
              { "value": "both", "displayName": "Both" },
              { "value": "name", "displayName": "Segment Name" }
            ]
          }
        }
      }
    },
    "categories": {
      "displayName": "Categories",
      "properties": {
        "showWidthLabels": { "type": { "bool": true } },
        "widthLabelFormat": {
          "type": {
            "enumeration": [
              { "value": "percentage", "displayName": "Percentage" },
              { "value": "value", "displayName": "Value" }
            ]
          }
        }
      }
    }
  }
}
```

### 6.2 Waterfall Settings

```json
{
  "objects": {
    "orientation": {
      "displayName": "Layout",
      "properties": {
        "direction": {
          "type": {
            "enumeration": [
              { "value": "vertical", "displayName": "Vertical" },
              { "value": "horizontal", "displayName": "Horizontal" }
            ]
          }
        }
      }
    },
    "barColors": {
      "displayName": "Bar Colors",
      "properties": {
        "startColor": { "type": { "fill": { "solid": { "color": true } } } },
        "increaseColor": { "type": { "fill": { "solid": { "color": true } } } },
        "decreaseColor": { "type": { "fill": { "solid": { "color": true } } } },
        "totalColor": { "type": { "fill": { "solid": { "color": true } } } },
        "subtotalColor": { "type": { "fill": { "solid": { "color": true } } } }
      }
    },
    "connectors": {
      "displayName": "Connectors",
      "properties": {
        "show": { "type": { "bool": true } },
        "color": { "type": { "fill": { "solid": { "color": true } } } },
        "style": {
          "type": {
            "enumeration": [
              { "value": "solid", "displayName": "Solid" },
              { "value": "dashed", "displayName": "Dashed" }
            ]
          }
        }
      }
    },
    "target": {
      "displayName": "Target Comparison",
      "properties": {
        "show": { "type": { "bool": true } },
        "lineColor": { "type": { "fill": { "solid": { "color": true } } } },
        "showGapBar": { "type": { "bool": true } },
        "gapPositiveColor": { "type": { "fill": { "solid": { "color": true } } } },
        "gapNegativeColor": { "type": { "fill": { "solid": { "color": true } } } }
      }
    }
  }
}
```

### 6.3 Bullet Settings

```json
{
  "objects": {
    "layout": {
      "displayName": "Layout",
      "properties": {
        "orientation": {
          "type": {
            "enumeration": [
              { "value": "horizontal", "displayName": "Horizontal" },
              { "value": "vertical", "displayName": "Vertical" }
            ]
          }
        },
        "scaleType": {
          "type": {
            "enumeration": [
              { "value": "individual", "displayName": "Individual Scale" },
              { "value": "shared", "displayName": "Shared Scale" }
            ]
          }
        }
      }
    },
    "ranges": {
      "displayName": "Qualitative Ranges",
      "properties": {
        "show": { "type": { "bool": true } },
        "autoCalculate": { "type": { "bool": true } },
        "poorColor": { "type": { "fill": { "solid": { "color": true } } } },
        "satisfactoryColor": { "type": { "fill": { "solid": { "color": true } } } },
        "goodColor": { "type": { "fill": { "solid": { "color": true } } } },
        "opacity": { "type": { "numeric": true } }
      }
    },
    "actual": {
      "displayName": "Actual Bar",
      "properties": {
        "color": { "type": { "fill": { "solid": { "color": true } } } },
        "colorByStatus": { "type": { "bool": true } },
        "height": { "type": { "numeric": true } }
      }
    },
    "target": {
      "displayName": "Target Marker",
      "properties": {
        "markerType": {
          "type": {
            "enumeration": [
              { "value": "line", "displayName": "Line" },
              { "value": "diamond", "displayName": "Diamond" },
              { "value": "triangle", "displayName": "Triangle" }
            ]
          }
        },
        "color": { "type": { "fill": { "solid": { "color": true } } } },
        "width": { "type": { "numeric": true } }
      }
    },
    "labels": {
      "displayName": "Labels",
      "properties": {
        "showCategory": { "type": { "bool": true } },
        "showActual": { "type": { "bool": true } },
        "showTarget": { "type": { "bool": true } },
        "showVariance": { "type": { "bool": true } },
        "varianceFormat": {
          "type": {
            "enumeration": [
              { "value": "value", "displayName": "Value" },
              { "value": "percentage", "displayName": "Percentage" },
              { "value": "both", "displayName": "Both" }
            ]
          }
        }
      }
    }
  }
}
```

---

## 7. Testing Requirements

### 7.1 Mekko Tests

| Test | Expected Result |
|------|-----------------|
| Single category | Renders full-width bar |
| Many categories (20+) | Readable, narrow columns |
| Zero-width category | Handled gracefully (hidden or minimum) |
| Negative values | Warning shown, absolute values used |
| All same width | Equal columns (degrades to stacked bar) |

### 7.2 Waterfall Tests

| Test | Expected Result |
|------|-----------------|
| All positive values | Stair-step up |
| All negative values | Stair-step down |
| Mixed values | Correct running total |
| Subtotals | Reset to baseline at subtotal |
| Target comparison | Gap bar shows variance |
| Horizontal | Labels readable, bars extend correctly |

### 7.3 Bullet Tests

| Test | Expected Result |
|------|-----------------|
| Actual > Target | Actual bar exceeds target line |
| Actual < Target | Actual bar before target line |
| Shared scale | All bullets use same scale |
| No ranges provided | Auto-calculated ranges |
| Extreme values | Scale adjusts appropriately |

---

## 8. Deliverables & Milestones

### 8.1 Phase 3a: Mekko Chart (2 weeks)

- [ ] Project scaffolding
- [ ] DataManager for width + segment data
- [ ] Variable-width rendering logic
- [ ] Segment labels
- [ ] Settings panel
- [ ] Tooltips and selection

### 8.2 Phase 3b: Advanced Waterfall (2.5 weeks)

- [ ] Waterfall calculation engine
- [ ] Vertical rendering
- [ ] Horizontal rendering
- [ ] Connectors
- [ ] Target comparison
- [ ] Gap bar
- [ ] Settings panel

### 8.3 Phase 3c: Bullet Chart (1.5 weeks)

- [ ] Bullet data model
- [ ] Qualitative ranges
- [ ] Actual bar + target marker
- [ ] Auto-range calculation
- [ ] Labels and variance
- [ ] Settings panel

### 8.4 Phase 3d: Shared Components & Polish (1 week)

- [ ] Shared tooltip component
- [ ] Shared legend component
- [ ] Theme integration
- [ ] Performance optimization

### 8.5 Phase 3e: Testing (1 week)

- [ ] Unit tests
- [ ] Visual regression tests
- [ ] Accessibility audit
- [ ] Certification submission

**Total estimated time: 8 weeks**

---

## 9. Appendix

### 9.1 Reference Implementations

**Mekko:**
- David Bacci's Deneb Mekko: https://github.com/PBI-David/Deneb-Showcase
- Vega-Lite Marimekko: https://vega.github.io/vega-lite/examples/

**Waterfall:**
- Native Power BI waterfall docs: https://learn.microsoft.com/en-us/power-bi/visuals/power-bi-visualization-waterfall-charts
- Zebra BI waterfall: https://zebrabi.com/

**Bullet:**
- Stephen Few's bullet graph spec: https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf
- D3 bullet example: https://observablehq.com/@d3/bullet-chart

### 9.2 Sample Data

**Mekko (Market Share):**
```csv
Region,Segment,Revenue,MarketSize
North America,Product A,150,400
North America,Product B,120,400
North America,Product C,130,400
Europe,Product A,80,250
Europe,Product B,100,250
Europe,Product C,70,250
Asia,Product A,200,600
Asia,Product B,180,600
Asia,Product C,220,600
```

**Waterfall (P&L):**
```csv
Category,Value,Type
Revenue,500,start
COGS,-200,decrease
Gross Profit,,subtotal
OpEx,-120,decrease
D&A,-30,decrease
EBITDA,,total
```

**Bullet (KPIs):**
```csv
KPI,Actual,Target,Minimum,Maximum,Poor,Satisfactory,Good
Revenue,275,250,0,300,150,200,250
Profit Margin,22,25,0,35,10,18,25
Customer Sat,4.2,4.0,1,5,2.5,3.5,4.0
NPS,45,50,0,100,20,40,60
```

---

## 10. Business Pack Summary

| Visual | Est. Time | Complexity | Priority |
|--------|-----------|------------|----------|
| Mekko | 2 weeks | Medium | High |
| Waterfall | 2.5 weeks | Medium-High | High |
| Bullet | 1.5 weeks | Low-Medium | Medium |
| Shared + Polish | 1 week | Low | Required |
| Testing | 1 week | Medium | Required |
| **Total** | **8 weeks** | | |

Combined with Phase 1 (Statistical: 11 weeks) and Phase 2 (Gantt: 9.5 weeks):

**Full Phantom Visual Suite: ~28.5 weeks (~7 months)**

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Product | Initial draft |
