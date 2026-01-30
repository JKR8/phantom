# Power BI UI Kit 2.0 - Chart CSS Reference

Extracted from Figma: https://www.figma.com/design/wU4MfqXPDhSBmf9G8OvfRo/Power-BI-UI-Kit--2.0-

## Design Tokens

### Colors - Data Visualization Categories
```css
--data-visualization/category-1: #118dff;  /* Blue */
--data-visualization/category-2: #12239e;  /* Dark Blue */
--data-visualization/category-3: #e66c37;  /* Orange */
--data-visualization/category-4: #6b007b;  /* Purple */
--data-visualization/category-5: #e044a7;  /* Pink */
--data-visualization/category-6: #744ec2;  /* Violet */
```

### Colors - Text
```css
--text/primary: #020617;
--text/tertiary: #475569;
--text/quaternary: #64748b;
```

### Colors - Brand (Sequential Legend)
```css
--colors/brand/50: #eff6ff;
--colors/brand/500: #3b82f6;
--colors/neutral/white: #ffffff;
```

### Spacing
```css
--spacing/4: 4px;
--spacing/12: 12px;
--spacing/16: 16px;
```

### Typography
```css
/* 12/Semibold - Chart Titles */
font-family: 'Inter', sans-serif;
font-weight: 600;
font-size: 16px;
line-height: 19px;

/* 10/Semibold - Legend Titles */
font-family: 'Inter', sans-serif;
font-weight: 600;
font-size: 13px;
line-height: 16px;

/* 10/Regular - Legend Values */
font-family: 'Inter', sans-serif;
font-weight: 400;
font-size: 13px;
line-height: 16px;

/* 9/Semibold - Axis Titles */
font-family: 'Inter', sans-serif;
font-weight: 600;
font-size: 12px;
line-height: 14px;

/* 9/Regular - Axis Values */
font-family: 'Inter', sans-serif;
font-weight: 400;
font-size: 12px;
line-height: 14px;
```

---

## Complete Chart Type Reference (29 Charts)

| # | Chart Type | Page Node ID | Component Symbol ID | Component Name |
|---|------------|--------------|---------------------|----------------|
| 1 | Area (Layered) | 7638:27963 | 7546:20221 | Area Chart (Layered) |
| 2 | Area (Stacked) | 7638:27961 | 7551:14847 | Area Chart (Stacked) |
| 3 | Bar | 7638:27954 | 7476:10273 | Bar Chart |
| 4 | Bar (Grouped) | 7638:27956 | 7520:15521 | Bar Chart (Grouped) |
| 5 | Bar (Lollipop) | 7638:27955 | 7520:13509 | Bar Chart (Lollipop) |
| 6 | Bar (Stacked) | 7638:27958 | 7520:14757 | Bar Chart (Stacked) |
| 7 | Barbell | 7647:31826 | 7649:33233 | Barbell Chart |
| 8 | Boxplot | 7656:32457 | 7659:35227 | Boxplot Chart |
| 9 | Bullet | 7673:41793 | 7673:43373 | Bullet Chart |
| 10 | Card/KPI | 29767:38155 | 29767:38229 | Card/KPI |
| 11 | Combination | 7660:30144 | 7660:30734 | Combination Chart |
| 12 | Diverging | 7669:34643 | 7670:32937 | Diverging Chart |
| 13 | Dot Strip | 7646:42558 | 7646:44348 | Dot Strip Chart |
| 14 | Gantt | 7649:30464 | 7647:34069 | Gantt Chart |
| 15 | Gauge | 29759:35018 | 29762:30958 | Gauge Chart |
| 16 | Histogram | 7656:29628 | 7656:29932 | Histogram Chart |
| 17 | Line | 7638:27960 | 7648:32395 | Line Chart |
| 18 | Line (Forecast) | 7638:27964 | 7553:15552 | Line Chart (Forecast) |
| 19 | Line (Stepped) | 7648:29439 | 7626:30997 | Line Chart (Stepped) |
| 20 | Map (Bubble) | 7674:32866 | 7916:24902 | Map Chart (Bubble) |
| 21 | Map (Choropleth) | 7915:24898 | 7674:38205 | Map Chart (Choropleth) |
| 22 | Pie | 7638:27959 | 7638:28422 | Pie Chart |
| 23 | Pie (Donut) | 7638:28892 | 7622:28373 | Pie Chart (Donut) |
| 24 | Ribbon | 29764:31988 | 29764:32568 | Ribbon Chart |
| 25 | Scatter Plot | 7546:13679 | 7537:14128 | Scatter plot Chart |
| 26 | Slope | 7671:39573 | 7672:40381 | Slope Chart |
| 27 | Table | 7638:27957 | 27778:12330 | Table |
| 28 | Treemap | 7666:32334 | 7668:31539 | Treemap Chart |
| 29 | Waterfall | 7669:31951 | 7669:34000 | Waterfall Chart |

---

## Chart Components

### 1. Area Chart (Layered)
**Page Node ID:** 7638:27963
**Component Node ID:** 7546:20221

```css
/* Container */
.area-chart-layered {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Chart Content Area */
.area-chart-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}
```

---

### 2. Area Chart (Stacked)
**Page Node ID:** 7638:27961
**Component Node ID:** 7551:14847

```css
/* Container */
.area-chart-stacked {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.area-chart-stacked-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Areas Container */
.area-chart-areas {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}
```

---

### 3. Heading (Chart)
**Component Node ID:** 7904:23045

```css
/* Chart Heading Container */
.chart-heading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16, 16px);
  isolation: isolate;
  align-items: flex-start;
  position: relative;
  width: 100%;
}

/* Heading Content */
.chart-heading-content {
  display: flex;
  gap: var(--spacing-12, 12px);
  align-items: flex-start;
  width: 100%;
}

/* Title and Legend Container */
.chart-title-legend {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4, 4px);
  align-items: flex-start;
}

/* Chart Title */
.chart-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  color: var(--text-primary, #020617);
}
```

---

### 4. Legend

#### Horizontal Qualitative Legend
**Component Node ID:** 29603:39271

```css
/* Legend Container - Horizontal */
.legend-horizontal {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Legend Title */
.legend-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  color: var(--text-tertiary, #475569);
  white-space: nowrap;
}

/* Legend Items Container */
.legend-items {
  display: flex;
  align-items: flex-start;
}

/* Legend Value Item */
.legend-value {
  display: flex;
  gap: 4px;
  height: 20px;
  align-items: center;
  padding: 0 4px;
}

/* Legend Color Dot */
.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 100px;
  flex-shrink: 0;
}

/* Legend Value Text */
.legend-value-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  color: var(--text-tertiary, #475569);
  white-space: nowrap;
}
```

#### Stacked Qualitative Legend
**Component Node ID:** 29603:39292

```css
/* Legend Container - Stacked */
.legend-stacked {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  justify-content: center;
}

/* Legend Items - Stacked */
.legend-items-stacked {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}
```

#### Sequential Legend (Gradient)
**Component Node ID:** 29603:39313

```css
/* Legend Container - Sequential */
.legend-sequential {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 272px;
}

/* Gradient Container */
.legend-gradient-container {
  display: flex;
  flex: 1 0 0;
  gap: 4px;
  align-items: center;
  min-width: 1px;
  min-height: 1px;
}

/* Gradient Bar */
.legend-gradient-bar {
  flex: 1 0 0;
  height: 24px;
  min-width: 1px;
  min-height: 1px;
  background: linear-gradient(to right, var(--colors-brand-50, #eff6ff), var(--colors-brand-500, #3b82f6));
}

/* Gradient Value Text */
.legend-gradient-value {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  color: var(--text-tertiary, #475569);
}
```

---

### 5. Y-Axis
**Component Node ID:** 29630:16621

```css
/* Y-Axis Container */
.y-axis {
  display: flex;
  gap: 3px;
  height: 217px;
  align-items: center;
}

/* Y-Axis Title Container */
.y-axis-title-container {
  display: flex;
  width: 18px;
  height: 100%;
  align-items: center;
  justify-content: center;
}

/* Y-Axis Title (Rotated) */
.y-axis-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-primary, #020617);
  text-align: center;
  transform: rotate(-90deg);
  width: 217px;
  white-space: pre-wrap;
}

/* Y-Axis Values Container */
.y-axis-values {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: flex-end;
  justify-content: space-between;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  text-align: right;
}
```

---

### 6. X-Axis (Time)
**Component Node ID:** 29630:16582

```css
/* X-Axis Container */
.x-axis {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  font-size: 12px;
  line-height: 14px;
  width: 305px;
}

/* X-Axis Values Container */
.x-axis-values {
  display: flex;
  width: 100%;
  align-items: flex-end;
  justify-content: space-between;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
}

/* X-Axis Title */
.x-axis-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-primary, #020617);
  text-align: center;
  width: 100%;
  white-space: pre-wrap;
}
```

---

### 7. Area Shape Component
**Component Node ID:** 7538:13543

```css
/* Area Shape Container */
.area-shape {
  position: relative;
  width: 144px;
  height: 50px;
}

/* Area Line/Fill */
.area-line {
  position: absolute;
  /* Positioning varies by data:
     - Random patterns: inset varies
     - Trending up: starts from bottom
     - Trending down: starts from top
  */
}

/* Area Data Points */
.area-data-point {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 6px;
  transform: translate(-50%, -50%);
}

/* Area Point Label */
.area-point-label {
  position: absolute;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-primary, #020617);
  text-align: center;
  white-space: nowrap;
  transform: translate(-50%, 50%);
  bottom: 13px;
}
```

---

## CSS Variables Summary

```css
:root {
  /* Data Visualization Colors */
  --data-viz-category-1: #118dff;
  --data-viz-category-2: #12239e;
  --data-viz-category-3: #e66c37;
  --data-viz-category-4: #6b007b;
  --data-viz-category-5: #e044a7;
  --data-viz-category-6: #744ec2;

  /* Text Colors */
  --text-primary: #020617;
  --text-tertiary: #475569;
  --text-quaternary: #64748b;

  /* Brand Colors */
  --brand-50: #eff6ff;
  --brand-500: #3b82f6;
  --neutral-white: #ffffff;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-12: 12px;
  --spacing-16: 16px;

  /* Typography */
  --font-family: 'Inter', sans-serif;

  /* Font Sizes */
  --font-size-xs: 12px;
  --font-size-sm: 13px;
  --font-size-md: 16px;

  /* Line Heights */
  --line-height-xs: 14px;
  --line-height-sm: 16px;
  --line-height-md: 19px;

  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-semibold: 600;
}
```

---

## Component Hierarchy

```
Chart Container
├── Heading (Chart)
│   ├── Title
│   └── Legend
│       ├── Title (optional)
│       └── Legend Items
│           └── Value (dot + text)
├── Content
│   ├── Y-Axis
│   │   ├── Title (rotated)
│   │   └── Values
│   └── Chart Area
│       ├── Data Visualization (Area/Line/Bar)
│       └── X-Axis
│           ├── Values
│           └── Title
```

---

### 8. Bar Chart
**Component Node ID:** 7476:10273

```css
/* Container */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.bar-chart-content {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Single Bar Row */
.bar-row {
  display: flex;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: center;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Bar Dimension Label */
.bar-dimension {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Bar Container */
.bar-container {
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
  position: relative;
}

/* Bar Rectangle */
.bar-rectangle {
  position: absolute;
  background: var(--data-viz-category-1, #118dff);
  top: 11.84%;
  bottom: 11.84%;
  left: 0;
  /* right varies based on value */
}

/* Bar Background (optional) */
.bar-background {
  position: absolute;
  background: var(--background-tertiary, #f1f5f9);
  inset: 0;
}

/* Bar Label (right of bar) */
.bar-label-right {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-primary, #020617);
  white-space: nowrap;
}

/* Bar Label (inside bar) */
.bar-label-left {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-white-solid, white);
  white-space: nowrap;
}
```

---

### 9. Bar Chart (Grouped)
**Component Node ID:** 7520:15521

```css
/* Container - Same as Bar Chart */
.bar-chart-grouped {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Grouped Bars Row */
.bar-group-row {
  display: flex;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: flex-start;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Grouped Bars Container */
.bar-group-container {
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
  position: relative;
}

/* Individual Bar in Group (3 bars stacked vertically) */
.bar-group-item {
  position: absolute;
  left: 0;
  right: 0;
}

.bar-group-item:nth-child(1) {
  top: 0;
  bottom: 63.95%;
}

.bar-group-item:nth-child(2) {
  top: 36.05%;
  bottom: 36.05%;
}

.bar-group-item:nth-child(3) {
  top: 63.95%;
  bottom: 0;
}

/* Category Colors for Grouped Bars */
.bar-group-item.category-1 .bar-rectangle {
  background: var(--data-viz-category-1, #118dff);
}

.bar-group-item.category-2 .bar-rectangle {
  background: var(--data-viz-category-2, #12239e);
}

.bar-group-item.category-3 .bar-rectangle {
  background: var(--data-viz-category-3, #e66c37);
}
```

---

### 10. Line Chart
**Component Node ID:** 7648:32395

```css
/* Container */
.line-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.line-chart-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Lines and Axis Container */
.line-chart-lines-axis {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
}

/* Lines Container */
.line-chart-lines {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Individual Line */
.line-path {
  position: absolute;
  inset: 0;
}

/* Line stroke colors */
.line-path.category-1 { stroke: var(--data-viz-category-1, #118dff); }
.line-path.category-2 { stroke: var(--data-viz-category-2, #12239e); }
.line-path.category-3 { stroke: var(--data-viz-category-3, #e66c37); }

/* Data Point Dot */
.line-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
}

/* Data Point Label */
.line-dot-label {
  position: absolute;
  bottom: 13px;
  left: 50%;
  transform: translate(-50%, 50%);
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-primary, #020617);
  text-align: center;
  white-space: nowrap;
}
```

---

### 11. Pie Chart
**Component Node ID:** 7638:28422

```css
/* Container */
.pie-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Pie Container */
.pie-container {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Pie Slices Wrapper */
.pie-slices {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 150px;
  height: 150px;
}
```

---

### 12. Pie Chart (Donut)
**Component Node ID:** 7622:28373

```css
/* Container - Same as Pie Chart */
.donut-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Donut Inner Ring */
.donut-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 104px;
  height: 104px;
  border-radius: 1263px;
}

/* Donut Center Label */
.donut-center-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 103px;
}

/* Donut Value */
.donut-value {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 21px;
  line-height: 26px;
  color: var(--text-primary, #020617);
}

/* Donut Helper Text */
.donut-helper {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
}
```

---

### 13. Scatter Plot Chart
**Component Node ID:** 7537:14128

```css
/* Container */
.scatter-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.scatter-chart-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Dots Container */
.scatter-dots {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
  overflow: clip;
}

/* Individual Dot */
.scatter-dot {
  position: absolute;
  border-radius: 50%;
  background: var(--data-viz-category-1, #118dff);
  transform: translate(-50%, -50%);
}

/* Dot Sizes */
.scatter-dot.size-xs { width: 4px; height: 4px; }
.scatter-dot.size-sm { width: 8px; height: 8px; }
.scatter-dot.size-md { width: 12px; height: 12px; }
.scatter-dot.size-lg { width: 16px; height: 16px; }
```

---

### 14. Gauge Chart
**Component Node ID:** 29762:30958

```css
/* Container */
.gauge-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Gauge Container */
.gauge-container {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Gauge Arc */
.gauge-arc {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 171px;
}

/* Gauge Callout Value */
.gauge-value {
  position: absolute;
  left: 50%;
  top: calc(50% + 43px);
  transform: translate(-50%, -50%);
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 21px;
  line-height: 26px;
  color: var(--text-primary, #020617);
  text-align: center;
  white-space: nowrap;
}

/* Gauge Target Label */
.gauge-target {
  position: absolute;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  color: var(--text-primary, #020617);
  white-space: nowrap;
}

/* Gauge Min/Max Labels */
.gauge-min,
.gauge-max {
  position: absolute;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  color: var(--text-primary, #020617);
  white-space: nowrap;
}
```

---

### 15. Table
**Component Node ID:** 27778:12330

```css
/* Container */
.table-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  width: 768px;
}

/* Columns Container */
.table-columns {
  display: flex;
  width: 100%;
}

/* Single Column */
.table-column {
  display: flex;
  flex-direction: column;
  isolation: isolate;
}

.table-column:first-child {
  width: 286px;
  flex-shrink: 0;
}

.table-column:not(:first-child) {
  flex: 1 0 0;
  min-width: 1px;
}

/* Header Cell */
.table-header-cell {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 24px;
  padding: 0 var(--spacing-4, 4px);
  border-bottom: 1px solid var(--border-secondary, #e2e8f0);
}

.table-header-cell:first-child {
  align-items: flex-start;
}

.table-header-cell:not(:first-child) {
  align-items: flex-end;
}

/* Header Text */
.table-header-text {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  color: var(--text-tertiary, #475569);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Data Cell */
.table-cell {
  display: flex;
  height: 40px;
  padding: 0 var(--spacing-4, 4px);
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-secondary, #e2e8f0);
  isolation: isolate;
}

/* Cell Text */
.table-cell-text {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 16px;
  color: var(--text-tertiary, #475569);
  flex: 1 0 0;
  min-width: 1px;
}

.table-column:first-child .table-cell-text {
  text-align: left;
}

.table-column:not(:first-child) .table-cell-text {
  text-align: right;
}
```

---

### 16. Treemap Chart
**Component Node ID:** 7668:31539

```css
/* Container */
.treemap-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Treemap Container */
.treemap-container {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Treemap Category Rectangle */
.treemap-category {
  position: absolute;
  /* inset values vary based on data */
}

/* Category Colors */
.treemap-category.category-1 { background: var(--data-viz-category-1, #118dff); }
.treemap-category.category-2 { background: var(--data-viz-category-2, #12239e); }
.treemap-category.category-3 { background: var(--data-viz-category-3, #e66c37); }
.treemap-category.category-4 { background: var(--data-viz-category-4, #6b007b); }
.treemap-category.category-5 { background: var(--data-viz-category-5, #e044a7); }
.treemap-category.category-6 { background: var(--data-viz-category-6, #744ec2); }
.treemap-category.category-7 { background: var(--data-viz-category-7, #d9b300); }
.treemap-category.category-8 { background: var(--data-viz-category-8, #d64550); }
.treemap-category.category-9 { background: var(--data-viz-category-9, #e8c600); }
```

---

### 17. Waterfall Chart
**Component Node ID:** 7669:34000

```css
/* Container */
.waterfall-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.waterfall-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Waterfall Bars Container */
.waterfall-bars {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Single Waterfall Bar */
.waterfall-bar {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: flex-start;
  justify-content: center;
  min-height: 1px;
  min-width: 1px;
}

/* Bar Container */
.waterfall-bar-container {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Bar Rectangle */
.waterfall-bar-rect {
  position: absolute;
  background: var(--data-viz-category-1, #118dff);
  left: 11.36%;
  right: 11.36%;
  /* top and bottom vary based on value */
}

/* Bar Label */
.waterfall-bar-label {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 18px;
  width: 100%;
}
```

---

### 18. Card/KPI
**Component Node ID:** 29767:38229

```css
/* Card Container */
.kpi-card {
  display: flex;
  flex-direction: column;
  width: 328px;
  background: var(--background-primary, white);
  border: 1px solid var(--border-secondary, #e2e8f0);
  border-radius: var(--radius-8, 8px);
  overflow: clip;
}

/* Card Content */
.kpi-card-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4, 4px);
  padding: var(--spacing-16, 16px);
}

/* Card Title */
.kpi-card-title {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: var(--text-tertiary, #475569);
}

/* Card Value */
.kpi-card-value {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 38px;
  color: var(--text-primary, #020617);
}

/* Reference Labels Container */
.kpi-card-labels {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Divider */
.kpi-card-divider {
  height: 1px;
  width: 100%;
  background: var(--border-secondary, #e2e8f0);
}

/* Labels List */
.kpi-card-labels-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--spacing-16, 16px);
}

/* Single Label Row */
.kpi-label {
  display: flex;
  gap: var(--spacing-4, 4px);
  align-items: center;
}

/* Label Title and Value */
.kpi-label-text {
  display: flex;
  gap: var(--spacing-4, 4px);
  align-items: center;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
  white-space: nowrap;
}

.kpi-label-title {
  color: var(--text-quaternary, #64748b);
}

.kpi-label-value {
  color: var(--text-primary, #020617);
}

/* Positive/Negative Indicator */
.kpi-indicator {
  display: flex;
  align-items: center;
  height: 23px;
  padding: 0 4px;
  border-radius: var(--radius-4, 4px);
  position: relative;
}

.kpi-indicator-positive {
  background: var(--background-success, #ecfdf5);
  color: var(--text-success, #047857);
}

.kpi-indicator-negative {
  background: var(--background-danger, #fef2f2);
  color: var(--text-danger, #dc2626);
}

.kpi-indicator-arrow {
  width: 20px;
  height: 20px;
}

.kpi-indicator-value {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 19px;
}
```

---

### 19. Bar Chart (Stacked)
**Component Node ID:** 7520:14757

```css
/* Container - Same as Bar Chart */
.bar-chart-stacked {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Stacked Bar Row */
.stacked-bar-row {
  display: flex;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: center;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Stacked Bar Container */
.stacked-bar-container {
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
  position: relative;
}

/* Stacked Segments */
.stacked-bar-segment {
  position: absolute;
  top: 11.84%;
  bottom: 11.84%;
}

/* Segment Colors - positioned left to right */
.stacked-bar-segment.category-1 {
  background: var(--data-viz-category-1, #118dff);
  left: 0;
  /* right varies: ~51.2% of remaining */
}

.stacked-bar-segment.category-2 {
  background: var(--data-viz-category-2, #12239e);
  /* positioned after category-1 */
}

.stacked-bar-segment.category-3 {
  background: var(--data-viz-category-3, #e66c37);
  /* positioned after category-2 */
}

/* Segment Label (white text inside) */
.stacked-bar-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-white-solid, white);
  text-align: center;
  white-space: nowrap;
}
```

---

### 20. Bar Chart (Lollipop)
**Component Node ID:** 7520:13509

```css
/* Container - Same as Bar Chart */
.bar-chart-lollipop {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Lollipop Bar Row */
.lollipop-row {
  display: flex;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: center;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Lollipop Container */
.lollipop-container {
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
  position: relative;
}

/* Lollipop Line + Circle */
.lollipop-bar {
  position: absolute;
  top: 50%;
  bottom: 50%;
  left: 0;
  /* right varies based on value */
  display: flex;
  align-items: center;
}

/* Lollipop has a thin line with circle at end */
.lollipop-line {
  height: 2px;
  background: var(--data-viz-category-1, #118dff);
  flex: 1;
}

.lollipop-circle {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--data-viz-category-1, #118dff);
  flex-shrink: 0;
}
```

---

### 21. Combination Chart
**Component Node ID:** 7660:30734

```css
/* Container */
.combination-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.combination-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Bars and Line Container */
.combination-bars-line {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
}

/* Vertical Bar (Column) */
.combination-bar {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: flex-start;
  justify-content: center;
  min-height: 1px;
  min-width: 1px;
}

/* Bar Container */
.combination-bar-container {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Bar Rectangle */
.combination-bar-rect {
  position: absolute;
  background: var(--data-viz-category-1, #118dff);
  left: 11.36%;
  right: 11.36%;
  bottom: 0;
  /* top varies based on value */
}

/* Optional Background */
.combination-bar-bg {
  position: absolute;
  background: var(--background-tertiary, #f1f5f9);
  left: 11.36%;
  right: 11.36%;
  top: 0;
  bottom: 0;
}

/* Bar Label */
.combination-bar-label {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 18px;
  width: 100%;
}

/* Line Overlay */
.combination-line {
  position: absolute;
  top: 0;
  left: 10px;
  width: 144px;
  height: 54px;
}

/* Dual Axis (right side) */
.combination-dual-axis {
  display: flex;
  gap: 3px;
  height: 100%;
  align-items: center;
}

.combination-dual-axis-values {
  display: flex;
  flex-direction: column;
  height: 100%;
  align-items: flex-start;
  justify-content: space-between;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  text-align: right;
}

.combination-dual-axis-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-primary, #020617);
  text-align: center;
  transform: rotate(-90deg);
  width: 217px;
}
```

---

### 22. Histogram Chart
**Component Node ID:** 7656:29932

```css
/* Container */
.histogram-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.histogram-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Bars Container */
.histogram-bars {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Histogram Bar (no gap between bars) */
.histogram-bar {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  gap: 0;
  align-items: flex-start;
  justify-content: center;
  min-height: 1px;
  min-width: 1px;
}

/* Bar Container */
.histogram-bar-container {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Bar Rectangle - full width, no gap */
.histogram-bar-rect {
  position: absolute;
  background: var(--data-viz-category-1, #118dff);
  left: 0;
  right: 2.27%;  /* slight gap on right only */
  bottom: 0;
  /* top varies based on value */
}

/* Reference Line */
.histogram-reference-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.5px;
  background: var(--text-quaternary, #64748b);
}
```

---

## Extended Color Palette

The Figma design includes additional category colors beyond the initial 6:

```css
:root {
  /* Extended Data Visualization Colors */
  --data-viz-category-7: #d9b300;   /* Gold */
  --data-viz-category-8: #d64550;   /* Red */
  --data-viz-category-9: #e8c600;   /* Yellow */

  /* Background Colors */
  --background-primary: #ffffff;
  --background-tertiary: #f1f5f9;
  --background-success: #ecfdf5;
  --background-danger: #fef2f2;

  /* Border Colors */
  --border-secondary: #e2e8f0;

  /* Success/Danger Text */
  --text-success: #047857;
  --text-danger: #dc2626;
  --text-white-solid: #ffffff;

  /* Radius */
  --radius-4: 4px;
  --radius-8: 8px;
}
```

---

## Notes

1. **Inter Font**: All text uses the Inter font family with Regular (400) and Semi Bold (600) weights.

2. **Responsive Design**: Charts use flex layouts with `flex: 1 0 0` for responsive scaling.

3. **Isolation**: Chart containers use `isolation: isolate` for proper stacking context.

4. **Color Consistency**: The 6+ category colors are consistent across all chart types for data visualization.

5. **Axis Rotation**: Y-axis titles are rotated -90 degrees using CSS transform.

6. **Standard Chart Container**: Most charts share the same container structure:
   - 300px height, 500px width
   - 16px padding
   - 12px gap between heading and content
   - Isolation context for proper stacking

7. **Typography Scale**:
   - Chart titles: 16px/19px Semi Bold
   - Legend titles: 13px/16px Semi Bold
   - Legend values: 13px/16px Regular
   - Axis titles: 12px/14px Semi Bold
   - Axis values: 12px/14px Regular
   - KPI values: 32px/38px Semi Bold
   - Donut center values: 21px/26px Semi Bold

---

### 23. Barbell Chart
**Component Node ID:** 7649:33233

```css
/* Container */
.barbell-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.barbell-content {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Barbell Row */
.barbell-row {
  display: flex;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: center;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Dimension Label */
.barbell-dimension {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Barbell Container */
.barbell-container {
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
  position: relative;
}

/* Barbell Line + Dots */
.barbell-line {
  position: absolute;
  height: 2px;
  top: 50%;
  transform: translateY(-50%);
  /* left and right vary based on data */
}

/* Barbell Connecting Line */
.barbell-connector {
  position: absolute;
  height: 0;
  left: 0;
  right: 0;
  top: 50%;
  border-top: 1.5px solid var(--data-viz-category-1, #118dff);
}

/* Barbell Dot (Start/End) */
.barbell-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.barbell-dot.start {
  left: 0;
  background: var(--data-viz-category-1, #118dff);
}

.barbell-dot.end {
  left: 100%;
  background: var(--data-viz-category-2, #12239e);
}
```

---

### 24. Boxplot Chart
**Component Node ID:** 7659:35227

```css
/* Container */
.boxplot-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.boxplot-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Bars Container */
.boxplot-bars {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Single Box */
.boxplot-box {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: flex-start;
  justify-content: center;
  min-height: 1px;
  min-width: 1px;
}

/* Box Container */
.boxplot-box-container {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* IQR (Interquartile Range Box) */
.boxplot-iqr {
  position: absolute;
  left: 20%;
  right: 20%;
  background: var(--data-viz-category-1, #118dff);
  /* top and bottom vary based on Q1/Q3 values */
}

/* Whisker */
.boxplot-whisker {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  border-left: 0.5px solid var(--data-viz-category-1, #118dff);
}

/* Whisker Cap */
.boxplot-whisker-cap {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 10px;
  height: 0;
  border-top: 0.5px solid var(--data-viz-category-1, #118dff);
}

/* Median Line */
.boxplot-median {
  position: absolute;
  left: 20%;
  right: 20%;
  height: 0;
  border-top: 0.5px solid var(--neutral-white, #ffffff);
}

/* Outlier Dot */
.boxplot-outlier {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--data-viz-category-1, #118dff);
  left: 50%;
  transform: translateX(-50%);
}

/* Box Label */
.boxplot-label {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 18px;
  width: 100%;
}
```

---

### 25. Bullet Chart
**Component Node ID:** 7673:43373

```css
/* Container */
.bullet-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.bullet-content {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Bullet Row */
.bullet-row {
  display: flex;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: center;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Dimension Label */
.bullet-dimension {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Bullet Container */
.bullet-container {
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
  position: relative;
}

/* Qualitative Range Band (Background) */
.bullet-band {
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 0;
  right: 0;
  background: linear-gradient(to right,
    var(--background-tertiary, #f1f5f9) 0%,
    var(--background-tertiary, #f1f5f9) 100%);
  opacity: 0.6;
}

/* Performance Bar */
.bullet-bar {
  position: absolute;
  top: 28%;
  bottom: 28%;
  left: 0;
  background: var(--data-viz-category-1, #118dff);
  /* right varies based on value */
}

/* Target/Reference Line */
.bullet-target {
  position: absolute;
  top: 10%;
  bottom: 10%;
  width: 0.5px;
  background: var(--text-primary, #020617);
  /* left position varies based on target value */
}
```

---

### 26. Diverging Chart
**Component Node ID:** 7670:32937

```css
/* Container */
.diverging-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.diverging-content {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Diverging Row */
.diverging-row {
  display: flex;
  flex: 1 0 0;
  align-items: center;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Dimension Label */
.diverging-dimension {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Left/Right Container (each side of center) */
.diverging-side {
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
  position: relative;
}

/* Bar Container */
.diverging-bar-container {
  position: absolute;
  top: 11.84%;
  bottom: 11.84%;
  left: 0;
  right: 0;
}

/* Left Bar (extends from center to left) */
.diverging-bar-left {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;  /* Anchored to center */
  background: var(--data-viz-category-1, #118dff);
  /* left varies based on negative value */
}

/* Right Bar (extends from center to right) */
.diverging-bar-right {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;  /* Anchored to center */
  background: var(--data-viz-category-2, #12239e);
  /* right varies based on positive value */
}

/* Center Line (optional) */
.diverging-center-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: var(--border-secondary, #e2e8f0);
}
```

---

### 27. Dot Strip Chart
**Component Node ID:** 7646:44348

```css
/* Container */
.dot-strip-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.dot-strip-content {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Strip Row */
.dot-strip-row {
  display: flex;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: center;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Dimension Label */
.dot-strip-dimension {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Strip Container */
.dot-strip-container {
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
  position: relative;
}

/* Individual Dot */
.dot-strip-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--data-viz-category-1, #118dff);
  top: 50%;
  transform: translate(-50%, -50%);
  /* left position varies based on value */
}

/* Dot Category Colors */
.dot-strip-dot.category-1 { background: var(--data-viz-category-1, #118dff); }
.dot-strip-dot.category-2 { background: var(--data-viz-category-2, #12239e); }
.dot-strip-dot.category-3 { background: var(--data-viz-category-3, #e66c37); }
```

---

### 28. Gantt Chart
**Component Node ID:** 7647:34069

```css
/* Container */
.gantt-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.gantt-content {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Gantt Row */
.gantt-row {
  display: flex;
  flex: 1 0 0;
  gap: var(--spacing-4, 4px);
  align-items: center;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Task Label */
.gantt-task-label {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Gantt Bar Container */
.gantt-bar-container {
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
  position: relative;
}

/* Gantt Task Bar */
.gantt-task-bar {
  position: absolute;
  top: 18%;
  bottom: 18%;
  border-radius: 2px;
  /* left and right vary based on start/end dates */
}

/* Task Bar Colors */
.gantt-task-bar.category-1 { background: var(--data-viz-category-1, #118dff); }
.gantt-task-bar.category-2 { background: var(--data-viz-category-2, #12239e); }
.gantt-task-bar.category-3 { background: var(--data-viz-category-3, #e66c37); }

/* Multi-segment Task Support */
.gantt-task-bar.segment-1 {
  /* First segment positioning */
}

.gantt-task-bar.segment-2 {
  /* Second segment positioning */
}

/* Divider Line (between rows) */
.gantt-divider {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0.5px;
  background: var(--border-secondary, #e2e8f0);
}
```

---

### 29. Line Chart (Forecast)
**Component Node ID:** 7553:15552

```css
/* Container */
.line-chart-forecast {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.line-chart-forecast-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Lines and Axis Container */
.line-chart-forecast-lines-axis {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
}

/* Lines Container */
.line-chart-forecast-lines {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Actual Line Path */
.line-chart-forecast-actual {
  position: absolute;
  stroke: var(--data-viz-category-1, #118dff);
  stroke-width: 1.5px;
  fill: none;
}

/* Forecast Line Path (Dashed) */
.line-chart-forecast-prediction {
  position: absolute;
  stroke: var(--data-viz-category-1, #118dff);
  stroke-width: 1.5px;
  stroke-dasharray: 4 2;
  fill: none;
}

/* Forecast Confidence Band */
.line-chart-forecast-band {
  position: absolute;
  fill: var(--data-viz-category-1, #118dff);
  opacity: 0.2;
}

/* Data Point */
.line-chart-forecast-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--data-viz-category-1, #118dff);
  transform: translate(-50%, -50%);
}
```

---

### 30. Line Chart (Stepped)
**Component Node ID:** 7626:30997

```css
/* Container */
.line-chart-stepped {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.line-chart-stepped-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Lines and Axis Container */
.line-chart-stepped-lines-axis {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
}

/* Lines Container */
.line-chart-stepped-lines {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Stepped Line Path */
.line-chart-stepped-path {
  position: absolute;
  inset: 0;
  stroke-width: 1.5px;
  fill: none;
}

/* Line Colors */
.line-chart-stepped-path.category-1 { stroke: var(--data-viz-category-1, #118dff); }
.line-chart-stepped-path.category-2 { stroke: var(--data-viz-category-2, #12239e); }
.line-chart-stepped-path.category-3 { stroke: var(--data-viz-category-3, #e66c37); }

/* Data Point */
.line-chart-stepped-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

/* Stepped line uses step-after interpolation */
/* SVG path example: M0,y1 H x1 V y2 H x2 V y3 ... */
```

---

### 31. Map Chart (Bubble)
**Component Node ID:** 7916:24902

```css
/* Container */
.map-chart-bubble {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Map Container */
.map-container {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Map Borders (Country/Region Outlines) */
.map-borders {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  stroke: var(--border-secondary, #e2e8f0);
  fill: none;
}

/* Map Fill (Base) */
.map-fill {
  fill: var(--background-tertiary, #f1f5f9);
}

/* Bubble Dot */
.map-bubble {
  position: absolute;
  border-radius: 50%;
  background: var(--data-viz-category-1, #118dff);
  opacity: 0.7;
  transform: translate(-50%, -50%);
  /* size varies based on value */
}

/* Bubble Sizes */
.map-bubble.size-xs { width: 4px; height: 4px; }
.map-bubble.size-sm { width: 8px; height: 8px; }
.map-bubble.size-md { width: 12px; height: 12px; }
.map-bubble.size-lg { width: 16px; height: 16px; }
.map-bubble.size-xl { width: 24px; height: 24px; }
```

---

### 32. Map Chart (Choropleth)
**Component Node ID:** 7674:38205

```css
/* Container */
.map-chart-choropleth {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Map Container */
.map-choropleth-container {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Map Region Fill */
.map-region {
  stroke: var(--border-secondary, #e2e8f0);
  stroke-width: 0.5px;
}

/* Sequential Color Scale (Low to High) */
.map-region.value-0 { fill: var(--brand-50, #eff6ff); }
.map-region.value-1 { fill: #dbeafe; }
.map-region.value-2 { fill: #bfdbfe; }
.map-region.value-3 { fill: #93c5fd; }
.map-region.value-4 { fill: #60a5fa; }
.map-region.value-5 { fill: var(--brand-500, #3b82f6); }

/* Map Borders */
.map-choropleth-borders {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  stroke: var(--border-secondary, #e2e8f0);
  fill: none;
}
```

---

### 33. Ribbon Chart
**Component Node ID:** 29764:32568

```css
/* Container */
.ribbon-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.ribbon-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Ribbons Container */
.ribbon-ribbons-container {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
}

/* Ribbons SVG Container */
.ribbon-ribbons {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Dimension Column (Stacked Bar) */
.ribbon-dimension-column {
  position: absolute;
  /* left, right, top, bottom vary based on column position */
}

/* Segment within Column */
.ribbon-segment {
  position: absolute;
  left: 0;
  right: 0;
  /* top and bottom vary based on segment value */
}

/* Segment Colors */
.ribbon-segment.category-1 { background: var(--data-viz-category-1, #118dff); }
.ribbon-segment.category-2 { background: var(--data-viz-category-2, #12239e); }
.ribbon-segment.category-3 { background: var(--data-viz-category-3, #e66c37); }
.ribbon-segment.category-4 { background: var(--data-viz-category-4, #6b007b); }
.ribbon-segment.category-5 { background: var(--data-viz-category-5, #e044a7); }

/* Ribbon Connector (SVG Path between columns) */
.ribbon-connector {
  fill-opacity: 0.3;
}

.ribbon-connector.category-1 { fill: var(--data-viz-category-1, #118dff); }
.ribbon-connector.category-2 { fill: var(--data-viz-category-2, #12239e); }
.ribbon-connector.category-3 { fill: var(--data-viz-category-3, #e66c37); }
.ribbon-connector.category-4 { fill: var(--data-viz-category-4, #6b007b); }
.ribbon-connector.category-5 { fill: var(--data-viz-category-5, #e044a7); }

/* Data Label (inside segment) */
.ribbon-data-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  color: var(--text-white-solid, white);
  text-align: center;
  white-space: nowrap;
}

/* Total Label (above column) */
.ribbon-total-label {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -17px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 11px;
  line-height: 13px;
  color: var(--text-quaternary, #64748b);
}

/* Dimension Labels (X-Axis) */
.ribbon-dimensions {
  display: flex;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  text-align: center;
  height: 22px;
  align-items: center;
  width: 100%;
}

.ribbon-dimension-label {
  flex: 1 0 0;
  min-width: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

### 34. Slope Chart
**Component Node ID:** 7672:40381

```css
/* Container */
.slope-chart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12, 12px);
  height: 300px;
  width: 500px;
  padding: var(--spacing-16, 16px);
  isolation: isolate;
  position: relative;
}

/* Content Area */
.slope-content {
  display: flex;
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  width: 100%;
}

/* Slopes Container */
.slope-slopes-container {
  display: flex;
  flex-direction: column;
  flex: 1 0 0;
  height: 100%;
  min-height: 1px;
  min-width: 1px;
  align-items: center;
}

/* Slopes Area */
.slope-slopes {
  flex: 1 0 0;
  min-height: 1px;
  min-width: 1px;
  position: relative;
  width: 100%;
}

/* Individual Slope Line */
.slope-line {
  position: absolute;
  left: 25%;
  right: 25%;
  /* top and bottom vary based on start/end values */
}

/* Slope Line Path */
.slope-line-path {
  stroke-width: 1.5px;
  fill: none;
}

/* Slope Line Colors */
.slope-line-path.category-1 { stroke: var(--data-viz-category-1, #118dff); }
.slope-line-path.category-2 { stroke: var(--data-viz-category-2, #12239e); }
.slope-line-path.category-3 { stroke: var(--data-viz-category-3, #e66c37); }
.slope-line-path.category-4 { stroke: var(--data-viz-category-4, #6b007b); }
.slope-line-path.category-5 { stroke: var(--data-viz-category-5, #e044a7); }

/* Start/End Dot */
.slope-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.slope-dot.start {
  left: 25%;
}

.slope-dot.end {
  left: 75%;
}

/* Dimension Labels */
.slope-dimensions {
  display: flex;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--text-quaternary, #64748b);
  text-align: center;
  height: 22px;
  align-items: center;
  width: 100%;
}

.slope-dimension-label {
  flex: 1 0 0;
  min-width: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  height: 18px;
}
```

---

## Complete Chart Type Summary

All 29 chart types from the Power BI UI Kit 2.0 have been documented:

| # | Chart Type | Section |
|---|------------|---------|
| 1 | Area (Layered) | Section 1 |
| 2 | Area (Stacked) | Section 2 |
| 3 | Bar | Section 8 |
| 4 | Bar (Grouped) | Section 9 |
| 5 | Bar (Lollipop) | Section 20 |
| 6 | Bar (Stacked) | Section 19 |
| 7 | Barbell | Section 23 |
| 8 | Boxplot | Section 24 |
| 9 | Bullet | Section 25 |
| 10 | Card/KPI | Section 18 |
| 11 | Combination | Section 21 |
| 12 | Diverging | Section 26 |
| 13 | Dot Strip | Section 27 |
| 14 | Gantt | Section 28 |
| 15 | Gauge | Section 14 |
| 16 | Histogram | Section 22 |
| 17 | Line | Section 10 |
| 18 | Line (Forecast) | Section 29 |
| 19 | Line (Stepped) | Section 30 |
| 20 | Map (Bubble) | Section 31 |
| 21 | Map (Choropleth) | Section 32 |
| 22 | Pie | Section 11 |
| 23 | Pie (Donut) | Section 12 |
| 24 | Ribbon | Section 33 |
| 25 | Scatter Plot | Section 13 |
| 26 | Slope | Section 34 |
| 27 | Table | Section 15 |
| 28 | Treemap | Section 16 |
| 29 | Waterfall | Section 17 |
