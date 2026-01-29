# Phantom Statistical Visual Pack
## Technical Specification Document

**Version:** 1.0  
**Date:** January 2026  
**Status:** Draft for Engineering Review  
**Author:** Product Team  

---

## 1. Executive Summary

### 1.1 Purpose
Build a Power BI custom visual that renders publication-quality statistical charts with built-in statistical computation. The visual eliminates the need for complex DAX measures by computing statistics (quartiles, means, confidence intervals, regression coefficients) internally from raw data.

### 1.2 Strategic Context
- No native statistical visuals in Power BI (boxplot, violin, histogram with density)
- Existing AppSource options are basic, ugly, or expensive
- Data scientists and analysts are underserved
- Differentiation: zero-DAX statistical compute + ggplot2/scipy aesthetic

### 1.3 Success Criteria
- User can create a publication-ready boxplot in <60 seconds
- Visual computes all statistics from raw data (no DAX required)
- Renders identically across Power BI Desktop, Service, and Mobile
- Passes Microsoft certification requirements
- Supports datasets up to 30,000 data points with <2 second render

---

## 2. Scope

### 2.1 In Scope (Phase 1)

| Component | Description |
|-----------|-------------|
| **Boxplot** | Box-and-whisker with quartiles, whiskers, outliers, optional jittered points |
| **Histogram** | Configurable bins, optional density curve overlay, optional rug plot |
| **Violin Plot** | Kernel density estimation, optional embedded boxplot, optional points |
| **Scatter + Regression** | Linear/polynomial regression with confidence interval bands |
| **Theme System** | ggplot2-style themes (grey, minimal, classic, economist, fivethirtyeight) |

### 2.2 Out of Scope (Phase 1)
- QQ plots
- Pair plots / correlation matrices
- Time series decomposition
- Gantt charts (Phase 2)
- Mekko charts (Phase 3)
- Real-time streaming data
- R/Python integration

### 2.3 Constraints
- Must work without external dependencies (no CDN calls for certified visual)
- Must render in sandboxed iframe environment
- 150MB package size limit
- No localStorage/sessionStorage access
- Must support touch interactions for mobile

---

## 3. Technical Architecture

### 3.1 Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Power BI Host                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Phantom Statistical Visual              │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │   Visual    │  │   Theme     │  │  Settings   │  │   │
│  │  │  Renderer   │  │   Engine    │  │   Panel     │  │   │
│  │  │   (D3.js)   │  │             │  │             │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │   │
│  │         │                │                │         │   │
│  │  ┌──────┴────────────────┴────────────────┴──────┐  │   │
│  │  │              Core Engine (TypeScript)          │  │   │
│  │  ├────────────────────────────────────────────────┤  │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │   │
│  │  │  │  Stats   │  │  Data    │  │  Interaction │  │  │   │
│  │  │  │  Library │  │  Manager │  │   Handler    │  │  │   │
│  │  │  └──────────┘  └──────────┘  └──────────────┘  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                 Power BI Visual SDK (pbiviz)                │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Core Dependencies

| Package | Version | Purpose | Bundle Size |
|---------|---------|---------|-------------|
| `d3` | ^7.8.5 | SVG rendering, scales, axes | ~280KB |
| `simple-statistics` | ^7.8.3 | Statistical computations | ~45KB |
| `powerbi-visuals-api` | ^5.8.0 | Power BI integration | SDK |
| `powerbi-visuals-utils-dataviewutils` | ^6.0.0 | DataView parsing | ~15KB |
| `powerbi-visuals-utils-formattingutils` | ^6.0.0 | Formatting helpers | ~20KB |

### 3.3 Project Structure

```
phantom-statistical-visual/
├── src/
│   ├── visual.ts                 # Main visual entry point
│   ├── settings.ts               # Visual settings/capabilities
│   ├── core/
│   │   ├── dataManager.ts        # Power BI data ingestion
│   │   ├── statsEngine.ts        # Statistical computations
│   │   └── interactionHandler.ts # Selection, tooltips, cross-filter
│   ├── charts/
│   │   ├── boxplot.ts
│   │   ├── histogram.ts
│   │   ├── violin.ts
│   │   └── scatterRegression.ts
│   ├── themes/
│   │   ├── themeEngine.ts        # Theme application logic
│   │   ├── grey.ts               # ggplot2 grey theme
│   │   ├── minimal.ts
│   │   ├── classic.ts
│   │   ├── economist.ts
│   │   └── fivethirtyeight.ts
│   └── utils/
│       ├── colorPalettes.ts      # Color scales
│       ├── formatting.ts         # Number/date formatting
│       └── responsive.ts         # Responsive sizing logic
├── style/
│   └── visual.less               # Base styles
├── assets/
│   └── icon.png                  # Visual icon for pane
├── capabilities.json             # Data roles, objects, properties
├── pbiviz.json                   # Visual metadata
├── package.json
├── tsconfig.json
└── webpack.config.js
```

---

## 4. Data Interface

### 4.1 Data Roles (capabilities.json)

```json
{
  "dataRoles": [
    {
      "name": "values",
      "displayName": "Values",
      "description": "Numeric values to analyze",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "category",
      "displayName": "Category",
      "description": "Grouping category (optional)",
      "kind": "Grouping"
    },
    {
      "name": "xAxis",
      "displayName": "X Axis",
      "description": "X axis values (for scatter)",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "colorBy",
      "displayName": "Color By",
      "description": "Field for color encoding",
      "kind": "Grouping"
    },
    {
      "name": "tooltipFields",
      "displayName": "Tooltips",
      "description": "Additional tooltip fields",
      "kind": "Measure"
    }
  ],
  "dataViewMappings": [
    {
      "conditions": [
        {
          "values": { "max": 1 },
          "category": { "max": 1 },
          "xAxis": { "max": 1 },
          "colorBy": { "max": 1 }
        }
      ],
      "categorical": {
        "categories": {
          "for": { "in": "category" },
          "dataReductionAlgorithm": { "top": { "count": 30000 } }
        },
        "values": {
          "select": [
            { "bind": { "to": "values" } },
            { "bind": { "to": "xAxis" } },
            { "bind": { "to": "tooltipFields" } }
          ]
        }
      }
    }
  ]
}
```

### 4.2 Data Flow

```
Power BI DataView
       │
       ▼
┌──────────────────┐
│   DataManager    │
│                  │
│  - Parse categorical data
│  - Extract raw numeric arrays
│  - Handle nulls/NaN
│  - Apply data reduction
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   StatsEngine    │
│                  │
│  - Compute quartiles
│  - Calculate whiskers
│  - Identify outliers
│  - Fit regression
│  - Kernel density estimation
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Chart Renderer  │
│                  │
│  - D3 scales
│  - SVG generation
│  - Theme application
│  - Animation
└──────────────────┘
```

---

## 5. Component Specifications

### 5.1 Boxplot

#### 5.1.1 Statistical Computations

```typescript
interface BoxplotStats {
  min: number;
  q1: number;           // 25th percentile
  median: number;       // 50th percentile
  q3: number;           // 75th percentile
  max: number;
  iqr: number;          // q3 - q1
  lowerWhisker: number; // max(min, q1 - 1.5*iqr)
  upperWhisker: number; // min(max, q3 + 1.5*iqr)
  outliers: number[];   // points outside whiskers
  mean: number;         // optional display
  n: number;            // sample size
}
```

#### 5.1.2 Whisker Calculation Methods

| Method | Formula | Use Case |
|--------|---------|----------|
| Tukey (default) | Q1/Q3 ± 1.5×IQR | Standard statistical analysis |
| Min/Max | Actual min/max values | Show full range |
| Percentile | 5th/95th or 2nd/98th percentile | Exclude extreme outliers |
| Standard Deviation | Mean ± 1/2/3 SD | Normally distributed data |

#### 5.1.3 Visual Elements

```
          ┌───┐ ← Upper whisker cap (optional)
          │   │
          │   │ ← Upper whisker line
          │   │
      ┌───┴───┴───┐
      │           │ ← Box (Q1 to Q3)
      │     ─     │ ← Median line
      │           │
      └───┬───┬───┘
          │   │ ← Lower whisker line
          │   │
          └───┘ ← Lower whisker cap (optional)
      
      ◦     ◦     ← Outliers (circles)
      
   · · · · · · ·  ← Jittered points (optional)
      
          ◆       ← Mean marker (optional, diamond)
```

#### 5.1.4 Configuration Options

```typescript
interface BoxplotSettings {
  // Box
  boxWidth: number;              // 0.1 - 1.0, default 0.5
  boxFillColor: string;          // default from theme
  boxFillOpacity: number;        // 0-1, default 0.8
  boxStrokeColor: string;
  boxStrokeWidth: number;
  
  // Whiskers
  whiskerMethod: 'tukey' | 'minmax' | 'percentile' | 'stddev';
  whiskerPercentile: number;     // for percentile method
  whiskerStdDev: number;         // for stddev method (1, 2, or 3)
  showWhiskerCaps: boolean;
  whiskerCapWidth: number;       // relative to box width
  
  // Median
  medianLineColor: string;
  medianLineWidth: number;
  
  // Mean
  showMean: boolean;
  meanMarkerShape: 'diamond' | 'circle' | 'cross';
  meanMarkerSize: number;
  meanMarkerColor: string;
  
  // Outliers
  showOutliers: boolean;
  outlierShape: 'circle' | 'square' | 'diamond';
  outlierSize: number;
  outlierColor: string;
  outlierOpacity: number;
  
  // Jittered points
  showJitteredPoints: boolean;
  jitterWidth: number;           // 0-1, spread of jitter
  jitterPointSize: number;
  jitterPointOpacity: number;
  jitterPointColor: string;      // 'auto' uses theme
  
  // Orientation
  orientation: 'vertical' | 'horizontal';
  
  // Notch (confidence interval for median)
  showNotch: boolean;
  notchWidth: number;
}
```

### 5.2 Histogram

#### 5.2.1 Binning Algorithms

| Algorithm | Description | When to Use |
|-----------|-------------|-------------|
| Sturges (default) | k = 1 + log2(n) | Small datasets (<200) |
| Scott | h = 3.49σn^(-1/3) | Normal distributions |
| Freedman-Diaconis | h = 2×IQR×n^(-1/3) | Robust to outliers |
| Square Root | k = √n | Simple, general purpose |
| Fixed Count | User-specified k | Manual control |
| Fixed Width | User-specified h | Domain-specific bins |

#### 5.2.2 Visual Elements

```
      Density curve (optional)
         ╱╲
        ╱  ╲
       ╱    ╲____
    __╱          ╲
   ╱              ╲__
  ╱                  ╲
┌──┬──┬──┬──┬──┬──┬──┬──┐
│  │██│██│██│  │  │  │  │  ← Histogram bars
│  │██│██│██│██│  │  │  │
│  │██│██│██│██│██│  │  │
│  │██│██│██│██│██│██│  │
└──┴──┴──┴──┴──┴──┴──┴──┘
│ │ │ │ │ │ │ │ │ │ │ │ │  ← Rug plot (optional)
```

#### 5.2.3 Configuration Options

```typescript
interface HistogramSettings {
  // Binning
  binMethod: 'sturges' | 'scott' | 'freedman-diaconis' | 'sqrt' | 'fixed-count' | 'fixed-width';
  binCount: number;              // for fixed-count
  binWidth: number;              // for fixed-width
  
  // Bars
  barFillColor: string;
  barFillOpacity: number;
  barStrokeColor: string;
  barStrokeWidth: number;
  barPadding: number;            // 0-0.5, gap between bars
  
  // Density curve
  showDensityCurve: boolean;
  densityCurveColor: string;
  densityCurveWidth: number;
  densityCurveOpacity: number;
  densityKernelBandwidth: number | 'auto';  // Silverman's rule if auto
  
  // Rug plot
  showRugPlot: boolean;
  rugPlotHeight: number;
  rugPlotColor: string;
  rugPlotOpacity: number;
  
  // Y-axis
  yAxisType: 'count' | 'frequency' | 'density';
  
  // Cumulative
  showCumulative: boolean;       // overlay cumulative distribution
  cumulativeLineColor: string;
}
```

### 5.3 Violin Plot

#### 5.3.1 Kernel Density Estimation

```typescript
interface KDEConfig {
  kernel: 'gaussian' | 'epanechnikov' | 'uniform' | 'triangular';
  bandwidth: number | 'silverman' | 'scott';  // auto-selection methods
  resolution: number;            // number of points to evaluate (default 100)
}

// Bandwidth selection formulas
// Silverman: h = 0.9 × min(σ, IQR/1.34) × n^(-1/5)
// Scott: h = 3.49 × σ × n^(-1/3)
```

#### 5.3.2 Visual Elements

```
     ╭─────╮
    ╱       ╲
   ╱         ╲      ← Violin (mirrored KDE)
  │     ┌─┐   │
  │     │ │   │     ← Embedded mini boxplot (optional)
  │     │─│   │
  │     │ │   │
  │     └─┘   │
   ╲         ╱
    ╲       ╱
     ╰─────╯
  · · · · · · ·     ← Strip points (optional)
```

#### 5.3.3 Configuration Options

```typescript
interface ViolinSettings {
  // KDE
  kernel: 'gaussian' | 'epanechnikov' | 'uniform' | 'triangular';
  bandwidth: number | 'silverman' | 'scott';
  resolution: number;
  
  // Violin shape
  violinWidth: number;           // max width relative to category spacing
  violinFillColor: string;
  violinFillOpacity: number;
  violinStrokeColor: string;
  violinStrokeWidth: number;
  violinSide: 'both' | 'left' | 'right';  // split violins
  
  // Inner elements
  innerType: 'box' | 'quartiles' | 'stick' | 'point' | 'none';
  
  // Box (when innerType = 'box')
  innerBoxWidth: number;
  innerBoxColor: string;
  
  // Quartile lines (when innerType = 'quartiles')
  quartileLineWidth: number;
  quartileLineColor: string;
  medianLineWidth: number;
  medianLineColor: string;
  
  // Points overlay
  showPoints: boolean;
  pointPosition: 'center' | 'jitter' | 'strip';
  pointSize: number;
  pointOpacity: number;
  pointColor: string;
  
  // Orientation
  orientation: 'vertical' | 'horizontal';
}
```

### 5.4 Scatter + Regression

#### 5.4.1 Regression Methods

| Method | Formula | Use Case |
|--------|---------|----------|
| Linear | y = mx + b | Linear relationships |
| Polynomial | y = Σ(aᵢxⁱ) | Curved relationships |
| LOESS | Local weighted regression | Non-parametric smoothing |
| None | No regression line | Just scatter |

#### 5.4.2 Statistical Output

```typescript
interface RegressionStats {
  // Coefficients
  slope: number;                 // for linear
  intercept: number;
  coefficients: number[];        // for polynomial [a0, a1, a2, ...]
  
  // Fit quality
  rSquared: number;              // coefficient of determination
  adjustedRSquared: number;
  standardError: number;
  
  // Confidence intervals
  confidenceLevel: number;       // 0.95 default
  predictionBand: {x: number, lower: number, upper: number}[];
  confidenceBand: {x: number, lower: number, upper: number}[];
  
  // Diagnostics
  residuals: number[];
  n: number;
  degreesOfFreedom: number;
}
```

#### 5.4.3 Visual Elements

```
    ·                    
         · ·    ╱        ← Prediction band (lighter)
      ·    · ╱ ·         
    ·   · ╱· ·           ← Confidence band (darker)
      · ╱ · ·   ·        
     ·╱ ·    ·           ← Regression line
    ╱·    ·              
   ╱   ·                 
  · ·                    ← Data points
```

#### 5.4.4 Configuration Options

```typescript
interface ScatterRegressionSettings {
  // Points
  pointSize: number;
  pointOpacity: number;
  pointShape: 'circle' | 'square' | 'diamond' | 'triangle' | 'cross';
  pointFillColor: string;
  pointStrokeColor: string;
  pointStrokeWidth: number;
  
  // Regression
  regressionType: 'none' | 'linear' | 'polynomial' | 'loess';
  polynomialDegree: number;      // 2-6 for polynomial
  loessBandwidth: number;        // 0.1-1.0 for loess
  
  // Regression line
  regressionLineColor: string;
  regressionLineWidth: number;
  regressionLineStyle: 'solid' | 'dashed' | 'dotted';
  
  // Confidence interval
  showConfidenceInterval: boolean;
  confidenceLevel: number;       // 0.90, 0.95, 0.99
  confidenceIntervalColor: string;
  confidenceIntervalOpacity: number;
  
  // Prediction interval
  showPredictionInterval: boolean;
  predictionIntervalColor: string;
  predictionIntervalOpacity: number;
  
  // Equation display
  showEquation: boolean;
  showRSquared: boolean;
  equationPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  equationFontSize: number;
  
  // Reference lines
  showXMeanLine: boolean;
  showYMeanLine: boolean;
  referenceLineStyle: 'solid' | 'dashed' | 'dotted';
  referenceLineColor: string;
}
```

---

## 6. Theme System

### 6.1 Theme Interface

```typescript
interface PhantomTheme {
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
  
  // Colors (categorical palette)
  colorPalette: string[];
  
  // Colors (sequential palette)
  sequentialPalette: string[];
  
  // Colors (diverging palette)
  divergingPalette: string[];
  
  // Specific element colors
  boxFillColor: string;
  barFillColor: string;
  pointFillColor: string;
  lineColor: string;
  highlightColor: string;
  
  // Spacing
  plotMargin: { top: number; right: number; bottom: number; left: number };
  titlePadding: number;
}
```

### 6.2 Built-in Themes

#### 6.2.1 theme_grey (ggplot2 default)

```typescript
const themeGrey: PhantomTheme = {
  name: 'grey',
  
  background: '#FFFFFF',
  plotBackground: '#EBEBEB',
  
  gridMajorColor: '#FFFFFF',
  gridMajorWidth: 1,
  gridMinorColor: '#FFFFFF',
  gridMinorWidth: 0.5,
  showGridMajor: true,
  showGridMinor: false,
  
  axisLineColor: '#000000',
  axisLineWidth: 0,
  showAxisLines: false,
  
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  titleFontSize: 14,
  titleFontWeight: 'bold',
  titleColor: '#000000',
  axisTitleFontSize: 11,
  axisTitleColor: '#000000',
  axisTickFontSize: 10,
  axisTickColor: '#4D4D4D',
  
  colorPalette: ['#F8766D', '#00BA38', '#619CFF', '#F564E3', '#00BFC4', '#B79F00'],
  sequentialPalette: ['#132B43', '#1D4F6E', '#2A759A', '#3C9DC5', '#56C5ED', '#7FDBFF'],
  divergingPalette: ['#67001F', '#B2182B', '#D6604D', '#F4A582', '#FDDBC7', '#F7F7F7', '#D1E5F0', '#92C5DE', '#4393C3', '#2166AC', '#053061'],
  
  boxFillColor: '#595959',
  barFillColor: '#595959',
  pointFillColor: '#000000',
  lineColor: '#3366FF',
  highlightColor: '#F8766D',
  
  plotMargin: { top: 10, right: 10, bottom: 30, left: 40 },
  titlePadding: 10
};
```

#### 6.2.2 theme_minimal

```typescript
const themeMinimal: PhantomTheme = {
  name: 'minimal',
  
  background: '#FFFFFF',
  plotBackground: '#FFFFFF',
  
  gridMajorColor: '#D9D9D9',
  gridMajorWidth: 0.5,
  gridMinorColor: '#F0F0F0',
  gridMinorWidth: 0.25,
  showGridMajor: true,
  showGridMinor: false,
  
  axisLineColor: '#000000',
  axisLineWidth: 0,
  showAxisLines: false,
  
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  // ... rest similar to grey but with white background
};
```

#### 6.2.3 theme_classic (base R style)

```typescript
const themeClassic: PhantomTheme = {
  name: 'classic',
  
  background: '#FFFFFF',
  plotBackground: '#FFFFFF',
  
  gridMajorColor: '#000000',
  gridMajorWidth: 0,
  showGridMajor: false,
  showGridMinor: false,
  
  axisLineColor: '#000000',
  axisLineWidth: 1,
  showAxisLines: true,
  
  fontFamily: '"Times New Roman", Times, serif',
  // ...
};
```

#### 6.2.4 theme_economist

```typescript
const themeEconomist: PhantomTheme = {
  name: 'economist',
  
  background: '#D5E4EB',
  plotBackground: '#D5E4EB',
  
  gridMajorColor: '#FFFFFF',
  gridMajorWidth: 1,
  showGridMajor: true,
  showGridMinor: false,
  
  axisLineColor: '#000000',
  axisLineWidth: 0,
  showAxisLines: false,
  
  fontFamily: '"ITC Officina Sans", "Segoe UI", sans-serif',
  titleColor: '#000000',
  
  colorPalette: ['#01A2D9', '#014D64', '#6794A7', '#7AD2F6', '#00887D', '#76C0C1'],
  // ...
};
```

#### 6.2.5 theme_fivethirtyeight

```typescript
const themeFiveThirtyEight: PhantomTheme = {
  name: 'fivethirtyeight',
  
  background: '#F0F0F0',
  plotBackground: '#F0F0F0',
  
  gridMajorColor: '#CBCBCB',
  gridMajorWidth: 1,
  showGridMajor: true,
  showGridMinor: false,
  
  axisLineColor: '#000000',
  axisLineWidth: 0,
  showAxisLines: false,
  
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  titleFontSize: 16,
  titleFontWeight: 'bold',
  
  colorPalette: ['#FF2700', '#008FD5', '#77AB43', '#636464', '#C5C5C5'],
  // ...
};
```

### 6.3 Theme Application

```typescript
class ThemeEngine {
  private currentTheme: PhantomTheme;
  
  applyToSVG(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>): void {
    // Background
    svg.style('background-color', this.currentTheme.background);
    
    // Plot area background
    svg.select('.plot-area')
       .style('fill', this.currentTheme.plotBackground);
    
    // Grid lines
    svg.selectAll('.grid-line-major')
       .style('stroke', this.currentTheme.gridMajorColor)
       .style('stroke-width', this.currentTheme.gridMajorWidth);
    
    // Axes
    svg.selectAll('.axis line, .axis path')
       .style('stroke', this.currentTheme.showAxisLines ? this.currentTheme.axisLineColor : 'none')
       .style('stroke-width', this.currentTheme.axisLineWidth);
    
    // Text
    svg.selectAll('.axis-label, .tick text')
       .style('font-family', this.currentTheme.fontFamily)
       .style('font-size', `${this.currentTheme.axisTickFontSize}px`)
       .style('fill', this.currentTheme.axisTickColor);
    
    // Title
    svg.select('.chart-title')
       .style('font-family', this.currentTheme.fontFamily)
       .style('font-size', `${this.currentTheme.titleFontSize}px`)
       .style('font-weight', this.currentTheme.titleFontWeight)
       .style('fill', this.currentTheme.titleColor);
  }
  
  getColor(index: number): string {
    return this.currentTheme.colorPalette[index % this.currentTheme.colorPalette.length];
  }
}
```

---

## 7. Power BI Integration

### 7.1 Visual Lifecycle

```typescript
class Visual implements IVisual {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private dataManager: DataManager;
  private statsEngine: StatsEngine;
  private chartRenderer: ChartRenderer;
  private themeEngine: ThemeEngine;
  private interactionHandler: InteractionHandler;
  private settings: VisualSettings;
  
  constructor(options: VisualConstructorOptions) {
    // Create SVG container
    this.svg = d3.select(options.element)
      .append('svg')
      .classed('phantom-statistical-visual', true);
    
    // Initialize components
    this.dataManager = new DataManager();
    this.statsEngine = new StatsEngine();
    this.themeEngine = new ThemeEngine();
    this.interactionHandler = new InteractionHandler(options.host);
    
    // Initialize chart renderer based on default chart type
    this.chartRenderer = new BoxplotRenderer(this.svg, this.themeEngine);
  }
  
  update(options: VisualUpdateOptions): void {
    // 1. Parse settings
    this.settings = VisualSettings.parse<VisualSettings>(options.dataViews[0]);
    
    // 2. Update theme
    this.themeEngine.setTheme(this.settings.theme.name);
    
    // 3. Parse data
    const rawData = this.dataManager.parse(options.dataViews[0]);
    
    if (!rawData || rawData.values.length === 0) {
      this.showEmptyState();
      return;
    }
    
    // 4. Compute statistics
    const stats = this.statsEngine.compute(rawData, this.settings);
    
    // 5. Update dimensions
    const viewport = options.viewport;
    this.svg
      .attr('width', viewport.width)
      .attr('height', viewport.height);
    
    // 6. Render chart
    this.chartRenderer.render(stats, viewport, this.settings);
    
    // 7. Apply theme
    this.themeEngine.applyToSVG(this.svg);
    
    // 8. Setup interactions
    this.interactionHandler.bindEvents(this.svg, rawData);
  }
  
  destroy(): void {
    this.svg.remove();
  }
}
```

### 7.2 Selection & Cross-Filtering

```typescript
class InteractionHandler {
  private host: IVisualHost;
  private selectionManager: ISelectionManager;
  
  constructor(host: IVisualHost) {
    this.host = host;
    this.selectionManager = host.createSelectionManager();
  }
  
  bindEvents(svg: d3.Selection<any, unknown, null, undefined>, data: ParsedData): void {
    // Click selection
    svg.selectAll('.data-point')
      .on('click', (event: MouseEvent, d: DataPoint) => {
        const selectionId = d.selectionId;
        
        if (event.ctrlKey || event.metaKey) {
          // Multi-select
          this.selectionManager.select(selectionId, true);
        } else {
          // Single select
          this.selectionManager.select(selectionId);
        }
        
        this.updateSelectionStyles(svg);
      });
    
    // Context menu
    svg.selectAll('.data-point')
      .on('contextmenu', (event: MouseEvent, d: DataPoint) => {
        event.preventDefault();
        this.selectionManager.showContextMenu(d.selectionId, {
          x: event.clientX,
          y: event.clientY
        });
      });
    
    // Clear selection on background click
    svg.on('click', (event: MouseEvent) => {
      if (event.target === svg.node()) {
        this.selectionManager.clear();
        this.updateSelectionStyles(svg);
      }
    });
  }
  
  // Tooltips
  showTooltip(event: MouseEvent, d: DataPoint): void {
    const tooltipData: VisualTooltipDataItem[] = [
      { displayName: 'Value', value: d.value.toString() },
      { displayName: 'Category', value: d.category }
    ];
    
    this.host.tooltipService.show({
      dataItems: tooltipData,
      identities: [d.selectionId],
      coordinates: [event.clientX, event.clientY],
      isTouchEvent: false
    });
  }
}
```

### 7.3 Settings Panel (capabilities.json objects)

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
              { "value": "boxplot", "displayName": "Box Plot" },
              { "value": "histogram", "displayName": "Histogram" },
              { "value": "violin", "displayName": "Violin Plot" },
              { "value": "scatter", "displayName": "Scatter + Regression" }
            ]
          }
        }
      }
    },
    "theme": {
      "displayName": "Theme",
      "properties": {
        "name": {
          "displayName": "Style",
          "type": {
            "enumeration": [
              { "value": "grey", "displayName": "ggplot2 Grey" },
              { "value": "minimal", "displayName": "Minimal" },
              { "value": "classic", "displayName": "Classic" },
              { "value": "economist", "displayName": "The Economist" },
              { "value": "fivethirtyeight", "displayName": "FiveThirtyEight" }
            ]
          }
        }
      }
    },
    "boxplot": {
      "displayName": "Box Plot",
      "properties": {
        "whiskerMethod": {
          "displayName": "Whisker Method",
          "type": {
            "enumeration": [
              { "value": "tukey", "displayName": "Tukey (1.5×IQR)" },
              { "value": "minmax", "displayName": "Min/Max" },
              { "value": "percentile", "displayName": "Percentile" },
              { "value": "stddev", "displayName": "Standard Deviation" }
            ]
          }
        },
        "showMean": {
          "displayName": "Show Mean",
          "type": { "bool": true }
        },
        "showOutliers": {
          "displayName": "Show Outliers",
          "type": { "bool": true }
        },
        "showJitteredPoints": {
          "displayName": "Show All Points",
          "type": { "bool": true }
        },
        "orientation": {
          "displayName": "Orientation",
          "type": {
            "enumeration": [
              { "value": "vertical", "displayName": "Vertical" },
              { "value": "horizontal", "displayName": "Horizontal" }
            ]
          }
        },
        "boxWidth": {
          "displayName": "Box Width",
          "type": { "numeric": true }
        }
      }
    },
    "histogram": {
      "displayName": "Histogram",
      "properties": {
        "binMethod": {
          "displayName": "Bin Method",
          "type": {
            "enumeration": [
              { "value": "sturges", "displayName": "Sturges" },
              { "value": "scott", "displayName": "Scott" },
              { "value": "freedman-diaconis", "displayName": "Freedman-Diaconis" },
              { "value": "sqrt", "displayName": "Square Root" },
              { "value": "fixed-count", "displayName": "Fixed Count" }
            ]
          }
        },
        "binCount": {
          "displayName": "Number of Bins",
          "type": { "numeric": true }
        },
        "showDensityCurve": {
          "displayName": "Show Density Curve",
          "type": { "bool": true }
        },
        "showRugPlot": {
          "displayName": "Show Rug Plot",
          "type": { "bool": true }
        }
      }
    },
    "violin": {
      "displayName": "Violin Plot",
      "properties": {
        "kernel": {
          "displayName": "Kernel",
          "type": {
            "enumeration": [
              { "value": "gaussian", "displayName": "Gaussian" },
              { "value": "epanechnikov", "displayName": "Epanechnikov" }
            ]
          }
        },
        "bandwidth": {
          "displayName": "Bandwidth",
          "type": {
            "enumeration": [
              { "value": "silverman", "displayName": "Silverman (Auto)" },
              { "value": "scott", "displayName": "Scott (Auto)" }
            ]
          }
        },
        "innerType": {
          "displayName": "Inner Display",
          "type": {
            "enumeration": [
              { "value": "box", "displayName": "Box Plot" },
              { "value": "quartiles", "displayName": "Quartile Lines" },
              { "value": "stick", "displayName": "Stick" },
              { "value": "point", "displayName": "Point" },
              { "value": "none", "displayName": "None" }
            ]
          }
        },
        "showPoints": {
          "displayName": "Show Points",
          "type": { "bool": true }
        }
      }
    },
    "scatter": {
      "displayName": "Scatter Plot",
      "properties": {
        "regressionType": {
          "displayName": "Regression",
          "type": {
            "enumeration": [
              { "value": "none", "displayName": "None" },
              { "value": "linear", "displayName": "Linear" },
              { "value": "polynomial", "displayName": "Polynomial" },
              { "value": "loess", "displayName": "LOESS" }
            ]
          }
        },
        "polynomialDegree": {
          "displayName": "Polynomial Degree",
          "type": { "numeric": true }
        },
        "showConfidenceInterval": {
          "displayName": "Show Confidence Interval",
          "type": { "bool": true }
        },
        "confidenceLevel": {
          "displayName": "Confidence Level",
          "type": {
            "enumeration": [
              { "value": "0.90", "displayName": "90%" },
              { "value": "0.95", "displayName": "95%" },
              { "value": "0.99", "displayName": "99%" }
            ]
          }
        },
        "showEquation": {
          "displayName": "Show Equation",
          "type": { "bool": true }
        },
        "showRSquared": {
          "displayName": "Show R²",
          "type": { "bool": true }
        }
      }
    }
  }
}
```

---

## 8. Statistical Engine

### 8.1 Core Functions

```typescript
// src/core/statsEngine.ts

import * as ss from 'simple-statistics';

class StatsEngine {
  
  // ============ BOXPLOT STATISTICS ============
  
  computeBoxplotStats(values: number[], method: WhiskerMethod = 'tukey'): BoxplotStats {
    const sorted = values.slice().sort((a, b) => a - b);
    const n = sorted.length;
    
    const q1 = ss.quantile(sorted, 0.25);
    const median = ss.median(sorted);
    const q3 = ss.quantile(sorted, 0.75);
    const iqr = q3 - q1;
    const mean = ss.mean(sorted);
    const min = sorted[0];
    const max = sorted[n - 1];
    
    let lowerWhisker: number;
    let upperWhisker: number;
    let outliers: number[];
    
    switch (method) {
      case 'tukey':
        lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
        upperWhisker = Math.min(max, q3 + 1.5 * iqr);
        // Find actual data points at whisker boundaries
        lowerWhisker = sorted.find(v => v >= lowerWhisker) ?? lowerWhisker;
        upperWhisker = sorted.slice().reverse().find(v => v <= upperWhisker) ?? upperWhisker;
        outliers = sorted.filter(v => v < lowerWhisker || v > upperWhisker);
        break;
        
      case 'minmax':
        lowerWhisker = min;
        upperWhisker = max;
        outliers = [];
        break;
        
      case 'percentile':
        lowerWhisker = ss.quantile(sorted, 0.05);
        upperWhisker = ss.quantile(sorted, 0.95);
        outliers = sorted.filter(v => v < lowerWhisker || v > upperWhisker);
        break;
        
      case 'stddev':
        const stdDev = ss.standardDeviation(sorted);
        lowerWhisker = mean - 2 * stdDev;
        upperWhisker = mean + 2 * stdDev;
        outliers = sorted.filter(v => v < lowerWhisker || v > upperWhisker);
        break;
    }
    
    return {
      min, q1, median, q3, max, iqr, mean, n,
      lowerWhisker, upperWhisker, outliers
    };
  }
  
  // ============ HISTOGRAM STATISTICS ============
  
  computeHistogramBins(values: number[], method: BinMethod, fixedCount?: number): HistogramBin[] {
    const n = values.length;
    const min = ss.min(values);
    const max = ss.max(values);
    const range = max - min;
    
    let binCount: number;
    
    switch (method) {
      case 'sturges':
        binCount = Math.ceil(Math.log2(n) + 1);
        break;
      case 'scott':
        const scottH = 3.49 * ss.standardDeviation(values) * Math.pow(n, -1/3);
        binCount = Math.ceil(range / scottH);
        break;
      case 'freedman-diaconis':
        const iqr = ss.interquartileRange(values);
        const fdH = 2 * iqr * Math.pow(n, -1/3);
        binCount = Math.ceil(range / fdH);
        break;
      case 'sqrt':
        binCount = Math.ceil(Math.sqrt(n));
        break;
      case 'fixed-count':
        binCount = fixedCount ?? 10;
        break;
    }
    
    // Ensure reasonable bin count
    binCount = Math.max(1, Math.min(binCount, 100));
    
    const binWidth = range / binCount;
    const bins: HistogramBin[] = [];
    
    for (let i = 0; i < binCount; i++) {
      const x0 = min + i * binWidth;
      const x1 = min + (i + 1) * binWidth;
      const count = values.filter(v => v >= x0 && (i === binCount - 1 ? v <= x1 : v < x1)).length;
      
      bins.push({
        x0, x1,
        count,
        frequency: count / n,
        density: count / (n * binWidth)
      });
    }
    
    return bins;
  }
  
  // ============ KERNEL DENSITY ESTIMATION ============
  
  computeKDE(
    values: number[],
    kernel: KernelType = 'gaussian',
    bandwidth: number | 'silverman' | 'scott' = 'silverman',
    resolution: number = 100
  ): KDEPoint[] {
    const n = values.length;
    const stdDev = ss.standardDeviation(values);
    const iqr = ss.interquartileRange(values);
    
    // Bandwidth selection
    let h: number;
    if (typeof bandwidth === 'number') {
      h = bandwidth;
    } else if (bandwidth === 'silverman') {
      h = 0.9 * Math.min(stdDev, iqr / 1.34) * Math.pow(n, -0.2);
    } else { // scott
      h = 3.49 * stdDev * Math.pow(n, -1/3);
    }
    
    // Kernel function
    const K = this.getKernelFunction(kernel);
    
    // Evaluation points
    const min = ss.min(values) - 3 * h;
    const max = ss.max(values) + 3 * h;
    const step = (max - min) / resolution;
    
    const points: KDEPoint[] = [];
    
    for (let i = 0; i <= resolution; i++) {
      const x = min + i * step;
      let density = 0;
      
      for (const xi of values) {
        density += K((x - xi) / h);
      }
      
      density /= (n * h);
      points.push({ x, density });
    }
    
    return points;
  }
  
  private getKernelFunction(kernel: KernelType): (u: number) => number {
    switch (kernel) {
      case 'gaussian':
        return (u) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
      case 'epanechnikov':
        return (u) => Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0;
      case 'uniform':
        return (u) => Math.abs(u) <= 1 ? 0.5 : 0;
      case 'triangular':
        return (u) => Math.abs(u) <= 1 ? 1 - Math.abs(u) : 0;
    }
  }
  
  // ============ REGRESSION ============
  
  computeLinearRegression(xValues: number[], yValues: number[]): LinearRegressionResult {
    const n = xValues.length;
    const lr = ss.linearRegression(xValues.map((x, i) => [x, yValues[i]]));
    const line = ss.linearRegressionLine(lr);
    
    // Predictions and residuals
    const predictions = xValues.map(x => line(x));
    const residuals = yValues.map((y, i) => y - predictions[i]);
    
    // R-squared
    const yMean = ss.mean(yValues);
    const ssTot = ss.sum(yValues.map(y => Math.pow(y - yMean, 2)));
    const ssRes = ss.sum(residuals.map(r => r * r));
    const rSquared = 1 - (ssRes / ssTot);
    const adjustedRSquared = 1 - ((1 - rSquared) * (n - 1) / (n - 2));
    
    // Standard error
    const standardError = Math.sqrt(ssRes / (n - 2));
    
    // Confidence intervals
    const xMean = ss.mean(xValues);
    const sxx = ss.sum(xValues.map(x => Math.pow(x - xMean, 2)));
    
    const confidenceBand = this.computeConfidenceBand(
      xValues, yValues, line, standardError, sxx, xMean, n, 0.95
    );
    
    const predictionBand = this.computePredictionBand(
      xValues, yValues, line, standardError, sxx, xMean, n, 0.95
    );
    
    return {
      slope: lr.m,
      intercept: lr.b,
      rSquared,
      adjustedRSquared,
      standardError,
      residuals,
      confidenceBand,
      predictionBand,
      n,
      predict: line
    };
  }
  
  private computeConfidenceBand(
    xValues: number[],
    yValues: number[],
    line: (x: number) => number,
    se: number,
    sxx: number,
    xMean: number,
    n: number,
    confidenceLevel: number
  ): BandPoint[] {
    const tValue = this.tCritical(n - 2, 1 - (1 - confidenceLevel) / 2);
    const xMin = ss.min(xValues);
    const xMax = ss.max(xValues);
    const step = (xMax - xMin) / 50;
    
    const band: BandPoint[] = [];
    
    for (let x = xMin; x <= xMax; x += step) {
      const yHat = line(x);
      const margin = tValue * se * Math.sqrt(1/n + Math.pow(x - xMean, 2) / sxx);
      band.push({
        x,
        y: yHat,
        lower: yHat - margin,
        upper: yHat + margin
      });
    }
    
    return band;
  }
  
  private computePredictionBand(
    xValues: number[],
    yValues: number[],
    line: (x: number) => number,
    se: number,
    sxx: number,
    xMean: number,
    n: number,
    confidenceLevel: number
  ): BandPoint[] {
    const tValue = this.tCritical(n - 2, 1 - (1 - confidenceLevel) / 2);
    const xMin = ss.min(xValues);
    const xMax = ss.max(xValues);
    const step = (xMax - xMin) / 50;
    
    const band: BandPoint[] = [];
    
    for (let x = xMin; x <= xMax; x += step) {
      const yHat = line(x);
      const margin = tValue * se * Math.sqrt(1 + 1/n + Math.pow(x - xMean, 2) / sxx);
      band.push({
        x,
        y: yHat,
        lower: yHat - margin,
        upper: yHat + margin
      });
    }
    
    return band;
  }
  
  // t-distribution critical value (approximation)
  private tCritical(df: number, p: number): number {
    // Using approximation for t-distribution quantile
    // For production, consider a lookup table or more precise algorithm
    if (df >= 30) {
      return ss.probit(p); // Normal approximation for large df
    }
    // Simplified approximation
    const a = 1 / (df - 0.5);
    const b = 48 / (a * a);
    const c = ((20700 * a / b - 98) * a - 16) * a + 96.36;
    const d = ((94.5 / (b + c) - 3) / b + 1) * Math.sqrt(a * Math.PI / 2) * df;
    const x = d * ss.probit(p);
    const y = Math.pow(x, 2) / df;
    return x * (1 + (((((0.0025 * y + 0.01) * y + 0.25) * y + 11) * y + 3) / df - 1) / 4);
  }
}
```

---

## 9. Rendering

### 9.1 Boxplot Renderer

```typescript
// src/charts/boxplot.ts

import * as d3 from 'd3';

class BoxplotRenderer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private themeEngine: ThemeEngine;
  
  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, themeEngine: ThemeEngine) {
    this.svg = svg;
    this.themeEngine = themeEngine;
  }
  
  render(
    data: { category: string; stats: BoxplotStats; rawValues: number[] }[],
    viewport: IViewport,
    settings: BoxplotSettings
  ): void {
    const theme = this.themeEngine.getCurrentTheme();
    const margin = theme.plotMargin;
    const width = viewport.width - margin.left - margin.right;
    const height = viewport.height - margin.top - margin.bottom;
    
    // Clear previous
    this.svg.selectAll('*').remove();
    
    // Create plot group
    const g = this.svg
      .append('g')
      .attr('class', 'plot-area')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Background
    g.append('rect')
      .attr('class', 'plot-background')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', theme.plotBackground);
    
    // Scales
    const isVertical = settings.orientation === 'vertical';
    
    const categoryScale = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range(isVertical ? [0, width] : [0, height])
      .padding(0.2);
    
    const allValues = data.flatMap(d => [
      d.stats.lowerWhisker,
      d.stats.upperWhisker,
      ...d.stats.outliers
    ]);
    const valueExtent = d3.extent(allValues) as [number, number];
    const valuePadding = (valueExtent[1] - valueExtent[0]) * 0.05;
    
    const valueScale = d3.scaleLinear()
      .domain([valueExtent[0] - valuePadding, valueExtent[1] + valuePadding])
      .range(isVertical ? [height, 0] : [0, width])
      .nice();
    
    // Grid lines
    if (theme.showGridMajor) {
      const gridLines = g.append('g').attr('class', 'grid');
      
      if (isVertical) {
        gridLines.selectAll('.grid-line-major')
          .data(valueScale.ticks())
          .join('line')
          .attr('class', 'grid-line-major')
          .attr('x1', 0)
          .attr('x2', width)
          .attr('y1', d => valueScale(d))
          .attr('y2', d => valueScale(d))
          .attr('stroke', theme.gridMajorColor)
          .attr('stroke-width', theme.gridMajorWidth);
      } else {
        gridLines.selectAll('.grid-line-major')
          .data(valueScale.ticks())
          .join('line')
          .attr('class', 'grid-line-major')
          .attr('y1', 0)
          .attr('y2', height)
          .attr('x1', d => valueScale(d))
          .attr('x2', d => valueScale(d))
          .attr('stroke', theme.gridMajorColor)
          .attr('stroke-width', theme.gridMajorWidth);
      }
    }
    
    // Axes
    const categoryAxis = isVertical ? d3.axisBottom(categoryScale) : d3.axisLeft(categoryScale);
    const valueAxis = isVertical ? d3.axisLeft(valueScale) : d3.axisBottom(valueScale);
    
    g.append('g')
      .attr('class', 'axis category-axis')
      .attr('transform', isVertical ? `translate(0,${height})` : '')
      .call(categoryAxis);
    
    g.append('g')
      .attr('class', 'axis value-axis')
      .attr('transform', isVertical ? '' : `translate(0,${height})`)
      .call(valueAxis);
    
    // Boxplots
    const boxWidth = categoryScale.bandwidth() * settings.boxWidth;
    
    const boxGroups = g.selectAll('.box-group')
      .data(data)
      .join('g')
      .attr('class', 'box-group')
      .attr('transform', d => {
        const pos = categoryScale(d.category)! + categoryScale.bandwidth() / 2;
        return isVertical 
          ? `translate(${pos},0)` 
          : `translate(0,${pos})`;
      });
    
    // Whiskers
    boxGroups.each(function(d) {
      const group = d3.select(this);
      const stats = d.stats;
      
      // Vertical line (whisker to whisker)
      if (isVertical) {
        group.append('line')
          .attr('class', 'whisker-line')
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', valueScale(stats.lowerWhisker))
          .attr('y2', valueScale(stats.upperWhisker))
          .attr('stroke', settings.boxStrokeColor || theme.axisLineColor)
          .attr('stroke-width', 1);
        
        // Whisker caps
        if (settings.showWhiskerCaps) {
          const capWidth = boxWidth * settings.whiskerCapWidth;
          
          group.append('line')
            .attr('class', 'whisker-cap-lower')
            .attr('x1', -capWidth / 2)
            .attr('x2', capWidth / 2)
            .attr('y1', valueScale(stats.lowerWhisker))
            .attr('y2', valueScale(stats.lowerWhisker))
            .attr('stroke', settings.boxStrokeColor || theme.axisLineColor)
            .attr('stroke-width', 1);
          
          group.append('line')
            .attr('class', 'whisker-cap-upper')
            .attr('x1', -capWidth / 2)
            .attr('x2', capWidth / 2)
            .attr('y1', valueScale(stats.upperWhisker))
            .attr('y2', valueScale(stats.upperWhisker))
            .attr('stroke', settings.boxStrokeColor || theme.axisLineColor)
            .attr('stroke-width', 1);
        }
      }
      // Similar logic for horizontal orientation...
    });
    
    // Boxes (Q1 to Q3)
    boxGroups.append('rect')
      .attr('class', 'box')
      .attr('x', -boxWidth / 2)
      .attr('width', boxWidth)
      .attr('y', d => isVertical ? valueScale(d.stats.q3) : 0)
      .attr('height', d => isVertical 
        ? valueScale(d.stats.q1) - valueScale(d.stats.q3)
        : boxWidth)
      .attr('fill', settings.boxFillColor || theme.boxFillColor)
      .attr('fill-opacity', settings.boxFillOpacity)
      .attr('stroke', settings.boxStrokeColor || theme.axisLineColor)
      .attr('stroke-width', settings.boxStrokeWidth);
    
    // Median line
    boxGroups.append('line')
      .attr('class', 'median-line')
      .attr('x1', -boxWidth / 2)
      .attr('x2', boxWidth / 2)
      .attr('y1', d => valueScale(d.stats.median))
      .attr('y2', d => valueScale(d.stats.median))
      .attr('stroke', settings.medianLineColor || theme.highlightColor)
      .attr('stroke-width', settings.medianLineWidth);
    
    // Mean marker
    if (settings.showMean) {
      boxGroups.append('path')
        .attr('class', 'mean-marker')
        .attr('d', d3.symbol().type(d3.symbolDiamond).size(settings.meanMarkerSize * 10))
        .attr('transform', d => `translate(0,${valueScale(d.stats.mean)})`)
        .attr('fill', settings.meanMarkerColor || theme.highlightColor);
    }
    
    // Outliers
    if (settings.showOutliers) {
      boxGroups.each(function(d) {
        const group = d3.select(this);
        
        group.selectAll('.outlier')
          .data(d.stats.outliers)
          .join('circle')
          .attr('class', 'outlier data-point')
          .attr('cx', 0)
          .attr('cy', v => valueScale(v))
          .attr('r', settings.outlierSize)
          .attr('fill', settings.outlierColor || theme.pointFillColor)
          .attr('fill-opacity', settings.outlierOpacity);
      });
    }
    
    // Jittered points
    if (settings.showJitteredPoints) {
      boxGroups.each(function(d) {
        const group = d3.select(this);
        const jitterScale = d3.scaleLinear()
          .domain([0, 1])
          .range([-boxWidth * settings.jitterWidth / 2, boxWidth * settings.jitterWidth / 2]);
        
        group.selectAll('.jitter-point')
          .data(d.rawValues)
          .join('circle')
          .attr('class', 'jitter-point data-point')
          .attr('cx', () => jitterScale(Math.random()))
          .attr('cy', v => valueScale(v))
          .attr('r', settings.jitterPointSize)
          .attr('fill', settings.jitterPointColor || theme.pointFillColor)
          .attr('fill-opacity', settings.jitterPointOpacity);
      });
    }
  }
}
```

---

## 10. Testing Requirements

### 10.1 Unit Tests

| Component | Test Cases |
|-----------|------------|
| StatsEngine.computeBoxplotStats | Correct quartiles, whiskers, outlier detection for various distributions |
| StatsEngine.computeHistogramBins | Bin count algorithms match expected values |
| StatsEngine.computeKDE | Density integrates to ~1, bandwidth selection |
| StatsEngine.computeLinearRegression | Known datasets (Anscombe's quartet) |
| ThemeEngine | All themes apply correct styles |
| DataManager | Null handling, large dataset truncation |

### 10.2 Visual Tests

| Test | Expected Result |
|------|-----------------|
| Empty data | "No data" message displayed |
| Single value | Renders without error (degenerate boxplot) |
| 30,000 points | Renders in <2 seconds |
| All outliers | Whiskers collapse, all points shown as outliers |
| Negative values | Correct axis orientation |
| Mixed categories | Each category gets correct color |

### 10.3 Power BI Integration Tests

| Test | Expected Result |
|------|-----------------|
| Cross-filter | Clicking point filters other visuals |
| Selection persistence | Selections maintained on report navigation |
| Tooltip | Shows correct values on hover |
| Resize | Visual scales responsively |
| Theme change | Visual reflects Power BI report theme |
| Mobile render | Touch interactions work |

### 10.4 Certification Tests

| Requirement | Implementation |
|-------------|----------------|
| No external network calls | All dependencies bundled |
| No localStorage | State managed in memory |
| No cookies | None used |
| Data privacy | No data sent externally |
| Accessibility | ARIA labels on interactive elements |

---

## 11. Deliverables & Milestones

### 11.1 Phase 1: Core Infrastructure (2 weeks)

- [ ] Project scaffolding (pbiviz init, TypeScript config)
- [ ] DataManager implementation
- [ ] StatsEngine - boxplot statistics
- [ ] ThemeEngine - grey theme
- [ ] Basic boxplot renderer
- [ ] Power BI integration (update lifecycle)

### 11.2 Phase 2: Boxplot Complete (2 weeks)

- [ ] All whisker methods
- [ ] Outlier rendering
- [ ] Jittered points
- [ ] Mean marker
- [ ] Horizontal orientation
- [ ] Settings panel
- [ ] Tooltips and selection

### 11.3 Phase 3: Histogram (1.5 weeks)

- [ ] All binning algorithms
- [ ] Density curve overlay
- [ ] Rug plot
- [ ] Settings panel

### 11.4 Phase 4: Violin Plot (1.5 weeks)

- [ ] KDE implementation
- [ ] Violin rendering
- [ ] Inner elements (box, quartiles)
- [ ] Points overlay
- [ ] Settings panel

### 11.5 Phase 5: Scatter + Regression (2 weeks)

- [ ] Scatter rendering
- [ ] Linear regression
- [ ] Polynomial regression
- [ ] LOESS smoothing
- [ ] Confidence/prediction bands
- [ ] Equation display
- [ ] Settings panel

### 11.6 Phase 6: Polish & Themes (1 week)

- [ ] All 5 themes implemented
- [ ] Responsive sizing refinement
- [ ] Animation/transitions
- [ ] Accessibility audit
- [ ] Performance optimization

### 11.7 Phase 7: Testing & Certification (1 week)

- [ ] Unit test suite
- [ ] Visual regression tests
- [ ] Power BI certification submission
- [ ] Documentation

**Total estimated time: 11 weeks**

---

## 12. Appendix

### 12.1 Reference Implementations

- D3 Graph Gallery ggplot2 theme: https://d3-graph-gallery.com/graph/custom_theme.html
- simple-statistics API: https://simplestatistics.org/docs/
- Power BI Visuals SDK: https://github.com/microsoft/PowerBI-visuals
- Vega-Lite boxplot: https://vega.github.io/vega-lite/examples/boxplot_minmax_2D_vertical.html

### 12.2 Color Palettes

```typescript
// ColorBrewer qualitative palettes
const Set1 = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf'];
const Set2 = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'];
const Pastel1 = ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec'];

// ggplot2 default (hue_pal)
const ggplotDefault = ['#F8766D', '#00BA38', '#619CFF'];

// Viridis (sequential)
const viridis = ['#440154', '#482878', '#3e4a89', '#31688e', '#26828e', '#1f9e89', '#35b779', '#6ece58', '#b5de2b', '#fde725'];
```

### 12.3 Glossary

| Term | Definition |
|------|------------|
| IQR | Interquartile Range (Q3 - Q1) |
| KDE | Kernel Density Estimation |
| LOESS | Locally Estimated Scatterplot Smoothing |
| Whisker | Lines extending from box to show data range |
| Outlier | Data point beyond whisker boundaries |
| Confidence Interval | Range likely to contain true regression line |
| Prediction Interval | Range likely to contain new observations |

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Product | Initial draft |

