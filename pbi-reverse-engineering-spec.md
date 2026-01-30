# Power BI Visual Rendering: Reverse Engineering Specification

*Engineering Guide for Achieving High-Fidelity Web Rendering of PBIP Visuals*

**Version:** 1.0  
**Status:** Draft  
**Last Updated:** January 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Reverse Engineering Methodology](#reverse-engineering-methodology)
4. [Tooling & Infrastructure](#tooling--infrastructure)
5. [Visual-by-Visual Measurement Guide](#visual-by-visual-measurement-guide)
6. [Implementation Architecture](#implementation-architecture)
7. [Automated Comparison Pipeline](#automated-comparison-pipeline)
8. [Quality Metrics & Acceptance Criteria](#quality-metrics--acceptance-criteria)
9. [Timeline & Resource Requirements](#timeline--resource-requirements)
10. [Appendices](#appendices)

---

## Executive Summary

### Problem Statement

Power BI's native rendering engine is proprietary and unavailable outside Microsoft's infrastructure. To build a web-based mockup tool that previews PBIP visuals with high fidelity, we must reverse engineer Power BI's rendering behavior through systematic measurement and documentation.

### Approach

Rather than attempting to replicate Power BI's rendering code (impossible), we will:

1. Create controlled test cases in Power BI Desktop
2. Export to PBIP format and capture pixel-perfect screenshots
3. Measure all visual properties (margins, padding, colors, fonts, spacing)
4. Document default values not stored in PBIP (implicit defaults)
5. Build renderers that match measured specifications
6. Validate through automated pixel-diff comparison

### Expected Outcomes

| Aspect | Target Fidelity | Confidence |
|--------|-----------------|------------|
| Colors & fills | ~99% | High |
| Positions & dimensions | ~99% | High |
| Bar/line/area shapes | ~95% | High |
| Axis formatting | ~90% | Medium |
| Label positioning & truncation | ~80-85% | Medium |
| Font rendering | ~85% | Medium (browser variance) |
| Hover/interaction states | ~70% | Lower priority |
| **Overall visual fidelity** | **~90%** | Medium-High |

### Key Principle

**Export fidelity remains 100%** because we store data in native PBIP format. The reverse engineering effort only improves *preview* fidelity. Users always get perfect results when opening exports in Power BI Desktop.

---

## Architecture Overview

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MOCKUP TOOL                                  │
│                                                                     │
│  ┌─────────────┐    ┌──────────────────┐    ┌──────────────────┐   │
│  │   User UI   │───▶│  PBIP Data Store │───▶│ Preview Renderer │   │
│  │ (drag/drop) │    │ (source of truth)│    │  (this effort)   │   │
│  └─────────────┘    └──────────────────┘    └──────────────────┘   │
│                              │                        │             │
│                              │                        ▼             │
│                              │               ┌──────────────────┐   │
│                              │               │  Rendered Canvas │   │
│                              │               │   (~90% match)   │   │
│                              │               └──────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│                     ┌──────────────────┐                           │
│                     │   PBIP Export    │                           │
│                     │  (100% fidelity) │                           │
│                     └──────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Renderer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     PREVIEW RENDERER                                │
│                                                                     │
│  ┌─────────────────┐                                               │
│  │  PBIP Visual    │                                               │
│  │  Configuration  │                                               │
│  └────────┬────────┘                                               │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐    │
│  │  Default Value  │    │     Reverse-Engineered Defaults     │    │
│  │    Resolver     │◀───│  (measured from Power BI Desktop)   │    │
│  └────────┬────────┘    └─────────────────────────────────────┘    │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │  Merged Config  │  (explicit PBIP values + implicit defaults)   │
│  └────────┬────────┘                                               │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐    │
│  │ Visual-Specific │    │         Measured Specs              │    │
│  │    Renderer     │◀───│  (padding, spacing, algorithms)     │    │
│  └────────┬────────┘    └─────────────────────────────────────┘    │
│           │                                                         │
│           ▼                                                         │
│  ┌─────────────────┐                                               │
│  │   SVG/Canvas    │                                               │
│  │     Output      │                                               │
│  └─────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Reverse Engineering Methodology

### Phase 1: Test Case Creation

For each visual type, create a systematic test matrix in Power BI Desktop.

#### Test Matrix Template

```
Visual: [Visual Type]
├── T01: Default (no customization)
├── T02: Minimal data (1-2 data points)
├── T03: Large data (50+ data points)
├── T04: Legend variations
│   ├── T04a: Legend hidden
│   ├── T04b: Legend top
│   ├── T04c: Legend bottom
│   ├── T04d: Legend left
│   └── T04e: Legend right
├── T05: Axis variations
│   ├── T05a: X-axis hidden
│   ├── T05b: Y-axis hidden
│   ├── T05c: Both axes hidden
│   ├── T05d: Axis titles on
│   └── T05e: Custom axis font sizes (8, 11, 14, 18, 24)
├── T06: Data label variations
│   ├── T06a: Labels off
│   ├── T06b: Labels on (default position)
│   ├── T06c: Labels inside
│   ├── T06d: Labels outside
│   └── T06e: Labels with custom formatting
├── T07: Color variations
│   ├── T07a: Default palette
│   ├── T07b: Custom single color
│   ├── T07c: Custom palette
│   └── T07d: Conditional formatting
├── T08: Grid line variations
│   ├── T08a: Grid lines off
│   ├── T08b: Grid lines custom color
│   └── T08c: Grid lines custom width
├── T09: Size variations
│   ├── T09a: Small (200x150)
│   ├── T09b: Medium (400x300)
│   ├── T09c: Large (800x600)
│   └── T09d: Wide (600x200)
└── T10: Edge cases
    ├── T10a: Long category labels (truncation)
    ├── T10b: Large numbers (formatting)
    ├── T10c: Negative values
    └── T10d: Zero values
```

### Phase 2: Export & Capture

For each test case:

1. **Save as PBIP** - Extract the JSON configuration
2. **Screenshot at 1:1 scale** - Capture pixel-perfect reference image
3. **Screenshot at 2:1 scale** - Capture high-resolution detail image

#### Screenshot Protocol

```
Power BI Desktop Settings:
- View → Page View → Actual Size (100%)
- Display scaling: 100% (disable Windows scaling if possible)
- Theme: Default theme (no custom themes)

Capture Method:
- Use Windows Snipping Tool or equivalent
- Capture only the visual, not surrounding canvas
- Save as PNG (lossless)
- Naming: {visual_type}_{test_id}_{timestamp}.png
```

### Phase 3: Measurement & Documentation

For each captured visual, measure and document:

#### Measurement Checklist

```yaml
visual_type: barChart
test_id: T01_default

# Overall container
container:
  measured_width: 400
  measured_height: 300
  background_color: "#FFFFFF"
  border: none

# Plot area (where data is rendered)
plot_area:
  offset_top: 8        # From container top to plot area
  offset_right: 8      # From container right to plot area
  offset_bottom: 45    # Includes x-axis height
  offset_left: 55      # Includes y-axis width
  background_color: transparent

# Title (if present)
title:
  font_family: "Segoe UI Semibold"
  font_size: 12
  font_color: "#333333"
  alignment: left
  padding_bottom: 8

# Legend
legend:
  position: right
  width: 80           # When on right/left
  height: auto        # When on top/bottom
  item_spacing: 4
  marker_size: 10
  marker_shape: square
  font_family: "Segoe UI"
  font_size: 11
  font_color: "#666666"
  padding: 8

# X-Axis (Category Axis)
x_axis:
  line_color: "#CCCCCC"
  line_width: 1
  tick_length: 5
  tick_color: "#CCCCCC"
  label_font_family: "Segoe UI"
  label_font_size: 11
  label_font_color: "#666666"
  label_rotation: 0   # degrees
  label_max_width: 80 # before truncation
  title_font_family: "Segoe UI"
  title_font_size: 12
  title_font_color: "#666666"
  title_padding_top: 8

# Y-Axis (Value Axis)
y_axis:
  line_color: "#CCCCCC"
  line_width: 1
  tick_length: 5
  tick_color: "#CCCCCC"
  label_font_family: "Segoe UI"
  label_font_size: 11
  label_font_color: "#666666"
  label_format: auto  # K, M, B suffixes
  grid_line_color: "#E6E6E6"
  grid_line_width: 1
  grid_line_dash: null  # solid

# Data elements (bars)
bars:
  width_ratio: 0.7    # Bar width as ratio of band
  corner_radius: 0
  default_colors:     # Power BI default palette
    - "#01B8AA"
    - "#374649"
    - "#FD625E"
    - "#F2C80F"
    - "#5F6B6D"
    - "#8AD4EB"
  gap_between_groups: 0.3  # Ratio of bar width
  
# Data labels
data_labels:
  font_family: "Segoe UI"
  font_size: 11
  font_color: "#666666"
  position: outside_end  # inside_center, inside_end, outside_end
  padding: 4
```

### Phase 4: Algorithm Documentation

Some behaviors require documenting algorithms, not just static values.

#### Label Truncation Algorithm

```typescript
// Reverse-engineered from observation
function truncateLabel(text: string, maxWidth: number, fontSize: number): string {
  const charWidth = fontSize * 0.6;  // Approximate for Segoe UI
  const ellipsisWidth = charWidth * 3;
  const maxChars = Math.floor((maxWidth - ellipsisWidth) / charWidth);
  
  if (text.length <= maxChars + 3) {
    return text;
  }
  return text.substring(0, maxChars) + '...';
}
```

#### Axis Tick Calculation

```typescript
// Reverse-engineered tick interval logic
function calculateTickInterval(min: number, max: number, targetTicks: number = 5): number {
  const range = max - min;
  const roughInterval = range / targetTicks;
  
  // Power BI uses "nice" intervals: 1, 2, 5, 10, 20, 50, 100, etc.
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));
  const normalized = roughInterval / magnitude;
  
  let niceInterval: number;
  if (normalized <= 1.5) niceInterval = 1;
  else if (normalized <= 3) niceInterval = 2;
  else if (normalized <= 7) niceInterval = 5;
  else niceInterval = 10;
  
  return niceInterval * magnitude;
}
```

#### Number Formatting

```typescript
// Power BI auto-formatting for axis labels
function formatAxisValue(value: number): string {
  const abs = Math.abs(value);
  
  if (abs >= 1e12) return (value / 1e12).toFixed(1) + 'T';
  if (abs >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  
  return value.toLocaleString();
}
```

---

## Tooling & Infrastructure

### Required Software

| Tool | Purpose | Installation |
|------|---------|--------------|
| Power BI Desktop | Create test cases, export PBIP | Microsoft download |
| Node.js 18+ | Build tooling, renderers | nodejs.org |
| pnpm | Package management | `npm install -g pnpm` |
| ImageMagick | Image manipulation | `brew install imagemagick` |
| pixelmatch | Pixel comparison | `pnpm add pixelmatch` |
| sharp | Image processing | `pnpm add sharp` |

### Project Structure

```
pbi-renderer/
├── measurements/
│   ├── bar-chart/
│   │   ├── specs.yaml           # Measured specifications
│   │   ├── defaults.json        # Default values
│   │   ├── screenshots/         # Reference images
│   │   │   ├── T01_default.png
│   │   │   ├── T02_minimal.png
│   │   │   └── ...
│   │   └── pbip/                # Exported PBIP files
│   │       ├── T01_default/
│   │       ├── T02_minimal/
│   │       └── ...
│   ├── line-chart/
│   ├── pie-chart/
│   └── ...
├── src/
│   ├── renderers/
│   │   ├── base-renderer.ts
│   │   ├── bar-chart.ts
│   │   ├── line-chart.ts
│   │   └── ...
│   ├── defaults/
│   │   ├── bar-chart-defaults.ts
│   │   ├── line-chart-defaults.ts
│   │   └── ...
│   ├── utils/
│   │   ├── pbip-parser.ts
│   │   ├── color-utils.ts
│   │   ├── text-measurement.ts
│   │   └── axis-calculator.ts
│   └── index.ts
├── tools/
│   ├── capture-screenshot.ts    # Automated screenshot capture
│   ├── measure-visual.ts        # Measurement helper
│   ├── compare-renders.ts       # Pixel diff comparison
│   └── generate-report.ts       # Fidelity report generator
├── tests/
│   ├── visual-comparison/
│   │   ├── bar-chart.test.ts
│   │   └── ...
│   └── unit/
│       └── ...
└── package.json
```

### Measurement Helper Tool

```typescript
// tools/measure-visual.ts

import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';

interface Measurement {
  pixel: { x: number; y: number };
  color: string;
  description: string;
}

interface VisualMeasurement {
  visualType: string;
  testId: string;
  timestamp: string;
  imagePath: string;
  measurements: Measurement[];
}

async function measureVisual(imagePath: string): Promise<void> {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  
  console.log(`Image: ${imagePath}`);
  console.log(`Dimensions: ${metadata.width} x ${metadata.height}`);
  console.log('');
  console.log('Click coordinates to measure (Ctrl+C to exit):');
  
  // Interactive measurement mode
  // In practice, this would integrate with a GUI tool
  // For now, accept coordinates via command line
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.on('line', (input: string) => {
    const [x, y] = input.split(',').map(Number);
    if (isNaN(x) || isNaN(y)) {
      console.log('Invalid coordinates. Use format: x,y');
      return;
    }
    
    const idx = (y * info.width + x) * info.channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
    
    console.log(`(${x}, ${y}) → ${hex} rgb(${r}, ${g}, ${b})`);
  });
}

// Run measurement tool
const imagePath = process.argv[2];
if (!imagePath) {
  console.error('Usage: ts-node measure-visual.ts <image-path>');
  process.exit(1);
}
measureVisual(imagePath);
```

### Pixel Comparison Tool

```typescript
// tools/compare-renders.ts

import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import * as fs from 'fs';
import * as path from 'path';

interface ComparisonResult {
  testId: string;
  totalPixels: number;
  differentPixels: number;
  matchPercentage: number;
  diffImagePath: string;
}

async function compareRenders(
  referenceDir: string,
  renderedDir: string,
  outputDir: string
): Promise<ComparisonResult[]> {
  const results: ComparisonResult[] = [];
  
  const referenceFiles = fs.readdirSync(referenceDir)
    .filter(f => f.endsWith('.png'));
  
  for (const filename of referenceFiles) {
    const testId = path.basename(filename, '.png');
    const referencePath = path.join(referenceDir, filename);
    const renderedPath = path.join(renderedDir, filename);
    
    if (!fs.existsSync(renderedPath)) {
      console.warn(`Missing rendered image for ${testId}`);
      continue;
    }
    
    const referenceImg = PNG.sync.read(fs.readFileSync(referencePath));
    const renderedImg = PNG.sync.read(fs.readFileSync(renderedPath));
    
    const { width, height } = referenceImg;
    const diff = new PNG({ width, height });
    
    const differentPixels = pixelmatch(
      referenceImg.data,
      renderedImg.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }  // Allow slight color variations
    );
    
    const totalPixels = width * height;
    const matchPercentage = ((totalPixels - differentPixels) / totalPixels) * 100;
    
    const diffImagePath = path.join(outputDir, `diff_${filename}`);
    fs.writeFileSync(diffImagePath, PNG.sync.write(diff));
    
    results.push({
      testId,
      totalPixels,
      differentPixels,
      matchPercentage,
      diffImagePath
    });
    
    console.log(`${testId}: ${matchPercentage.toFixed(2)}% match`);
  }
  
  return results;
}

// Generate summary report
function generateReport(results: ComparisonResult[]): void {
  const avgMatch = results.reduce((sum, r) => sum + r.matchPercentage, 0) / results.length;
  
  console.log('\n========== COMPARISON REPORT ==========');
  console.log(`Total test cases: ${results.length}`);
  console.log(`Average match: ${avgMatch.toFixed(2)}%`);
  console.log('');
  
  const failing = results.filter(r => r.matchPercentage < 90);
  if (failing.length > 0) {
    console.log('Test cases below 90% threshold:');
    for (const r of failing) {
      console.log(`  - ${r.testId}: ${r.matchPercentage.toFixed(2)}%`);
    }
  }
  
  console.log('=========================================');
}

export { compareRenders, generateReport };
```

---

## Visual-by-Visual Measurement Guide

### Priority Order

Implement visuals in this order based on usage frequency:

| Priority | Visual Type | Complexity | Est. Effort |
|----------|-------------|------------|-------------|
| P0 | Bar Chart (clustered) | Medium | 3 days |
| P0 | Line Chart | Medium | 3 days |
| P0 | Card | Low | 1 day |
| P0 | Table | High | 4 days |
| P1 | Pie/Donut Chart | Medium | 2 days |
| P1 | Column Chart | Low (reuse bar) | 1 day |
| P1 | Area Chart | Low (reuse line) | 1 day |
| P1 | Stacked Bar/Column | Medium | 2 days |
| P2 | Matrix | High | 5 days |
| P2 | Scatter Chart | Medium | 2 days |
| P2 | Combo Chart | High | 3 days |
| P2 | KPI | Low | 1 day |
| P3 | Gauge | Medium | 2 days |
| P3 | Treemap | Medium | 2 days |
| P3 | Funnel | Medium | 2 days |
| P3 | Waterfall | Medium | 2 days |
| P3 | Map | High | 5 days |

### Bar Chart Measurement Specification

#### Test Cases

```yaml
test_cases:
  - id: T01_default
    description: Default bar chart with sample data
    data:
      categories: ["A", "B", "C", "D", "E"]
      values: [10, 25, 15, 30, 20]
    customizations: none
    
  - id: T02_legend_positions
    description: Test all legend positions
    data:
      categories: ["A", "B", "C"]
      series: ["Series 1", "Series 2"]
      values: [[10, 20], [15, 25], [20, 30]]
    variants:
      - legend: hidden
      - legend: top
      - legend: bottom
      - legend: left
      - legend: right
      
  - id: T03_axis_customization
    description: Axis styling variations
    variants:
      - x_axis_hidden: true
      - y_axis_hidden: true
      - axis_title: "Custom Title"
      - font_size: [8, 11, 14, 18]
      - grid_lines: off
      - grid_color: "#FF0000"
      
  - id: T04_bar_styling
    description: Bar appearance variations
    variants:
      - single_color: "#FF5733"
      - corner_radius: [0, 2, 4, 8]
      - bar_width: [narrow, default, wide]
      
  - id: T05_data_labels
    description: Data label positioning
    variants:
      - labels: off
      - labels: inside_end
      - labels: inside_center
      - labels: outside_end
      - label_color: "#333333"
      - label_font_size: [9, 11, 14]
      
  - id: T06_edge_cases
    description: Edge case handling
    variants:
      - long_labels: ["Very Long Category Name That Should Truncate"]
      - negative_values: [-10, 20, -15, 30]
      - zero_values: [0, 10, 0, 20, 0]
      - single_bar: [50]
      - many_bars: [array of 20+ values]
```

#### Measurement Template

```yaml
# measurements/bar-chart/specs.yaml

visual_type: barChart
version: "1.0"
measured_date: "2026-01-30"
power_bi_version: "2.xxx.xxx.x"

# Container & Chrome
container:
  padding:
    top: 8
    right: 8
    bottom: 8
    left: 8
  background: "#FFFFFF"
  border: none
  shadow: none

# Title
title:
  default_visible: false  # Hidden unless explicitly set
  font:
    family: "Segoe UI Semibold"
    size: 12
    color: "#333333"
    weight: 600
  alignment: left
  margin_bottom: 8

# Plot Area
plot_area:
  margin:
    top: 10     # Space for potential title
    right: 10   # Space for potential right legend
    bottom: 0   # X-axis sits at bottom
    left: 0     # Y-axis sits at left

# X-Axis (Category)
x_axis:
  height: 40  # Total height including labels and title
  line:
    visible: true
    color: "#CCCCCC"
    width: 1
  ticks:
    visible: true
    length: 5
    color: "#CCCCCC"
    width: 1
  labels:
    font:
      family: "Segoe UI"
      size: 11
      color: "#666666"
      weight: 400
    rotation: 0
    max_width: 80
    truncation: ellipsis
    margin_top: 5
  title:
    font:
      family: "Segoe UI"
      size: 12
      color: "#666666"
      weight: 400
    margin_top: 8
    alignment: center

# Y-Axis (Value)
y_axis:
  width: 50  # Approximate, varies with number length
  line:
    visible: true
    color: "#CCCCCC"
    width: 1
  ticks:
    visible: true
    length: 5
    color: "#CCCCCC"
    width: 1
  labels:
    font:
      family: "Segoe UI"
      size: 11
      color: "#666666"
      weight: 400
    format: auto  # K, M, B suffixes
    margin_right: 5
  title:
    font:
      family: "Segoe UI"
      size: 12
      color: "#666666"
      weight: 400
    rotation: -90
    margin_right: 8
  grid_lines:
    visible: true
    color: "#E6E6E6"
    width: 1
    dash_array: null  # solid

# Legend
legend:
  default_visible: true  # When multiple series
  position: right  # top, bottom, left, right
  dimensions:
    width_when_side: 100   # When left or right
    height_when_top_bottom: 30
  item:
    marker:
      shape: square
      size: 10
    spacing: 8
    font:
      family: "Segoe UI"
      size: 11
      color: "#666666"
  padding: 10
  margin_from_plot: 8

# Bars
bars:
  layout:
    width_ratio: 0.7        # Bar width as fraction of band
    group_padding: 0.2      # Padding between groups
    bar_padding: 0.1        # Padding between bars in group
  appearance:
    corner_radius: 0
    stroke_width: 0
    stroke_color: null
  colors:
    palette:  # Default Power BI palette
      - "#01B8AA"
      - "#374649"
      - "#FD625E"
      - "#F2C80F"
      - "#5F6B6D"
      - "#8AD4EB"
      - "#FE9666"
      - "#A66999"
      - "#3599B8"
      - "#DFBFBF"

# Data Labels
data_labels:
  default_visible: false
  position: outside_end  # inside_base, inside_center, inside_end, outside_end
  font:
    family: "Segoe UI"
    size: 11
    color: "#666666"
    weight: 400
  padding: 4
  format: auto  # Inherits from value axis or custom

# Animations (for reference, may not implement)
animations:
  duration_ms: 300
  easing: ease-out
```

### Line Chart Measurement Specification

```yaml
# measurements/line-chart/specs.yaml

visual_type: lineChart
version: "1.0"

# Inherits container, title, axes from bar chart with these differences:

# Lines
lines:
  stroke_width: 2
  stroke_linecap: round
  stroke_linejoin: round
  curve: linear  # linear, monotone, step

# Markers (data points)
markers:
  default_visible: false
  shape: circle  # circle, square, diamond, triangle
  size: 6
  fill: inherit  # From line color
  stroke: "#FFFFFF"
  stroke_width: 1

# Area (if area chart)
area:
  fill_opacity: 0.3
  
# Line-specific defaults
defaults:
  show_markers_threshold: 20  # Show markers only if <= 20 points
```

### Card Measurement Specification

```yaml
# measurements/card/specs.yaml

visual_type: card
version: "1.0"

container:
  padding: 10
  background: "#FFFFFF"

value:
  font:
    family: "DIN"  # Power BI uses DIN for card numbers
    size: 45
    color: "#333333"
    weight: 400
  alignment: center
  format: auto

label:
  visible: true
  font:
    family: "Segoe UI"
    size: 12
    color: "#666666"
    weight: 400
  position: below  # above or below value
  margin: 5
```

### Table Measurement Specification

```yaml
# measurements/table/specs.yaml

visual_type: table
version: "1.0"

container:
  padding: 0

header:
  background: "#F0F0F0"
  height: 32
  font:
    family: "Segoe UI Semibold"
    size: 11
    color: "#333333"
    weight: 600
  padding:
    horizontal: 8
    vertical: 6
  border:
    bottom:
      width: 1
      color: "#CCCCCC"

rows:
  height: 28
  alternating_background:
    odd: "#FFFFFF"
    even: "#FAFAFA"
  font:
    family: "Segoe UI"
    size: 11
    color: "#333333"
    weight: 400
  padding:
    horizontal: 8
    vertical: 4
  border:
    bottom:
      width: 1
      color: "#E6E6E6"

columns:
  min_width: 50
  max_width: 300
  resize_handle_width: 4
  
totals_row:
  background: "#E8E8E8"
  font:
    weight: 600
```

---

## Implementation Architecture

### Base Renderer Interface

```typescript
// src/renderers/base-renderer.ts

import { PBIPVisual, PBIPQuery } from '../types/pbip';

export interface RenderContext {
  container: HTMLElement;
  width: number;
  height: number;
  data: DataPoint[];
  theme?: ThemeConfig;
}

export interface DataPoint {
  category: string;
  value: number;
  series?: string;
}

export abstract class BaseRenderer {
  protected visual: PBIPVisual;
  protected defaults: VisualDefaults;
  
  constructor(visual: PBIPVisual, defaults: VisualDefaults) {
    this.visual = visual;
    this.defaults = defaults;
  }
  
  /**
   * Merge explicit PBIP configuration with measured defaults
   */
  protected getConfig<T>(path: string, fallback?: T): T {
    const explicit = this.getNestedValue(this.visual.visual.objects, path);
    if (explicit !== undefined) return explicit;
    
    const defaultValue = this.getNestedValue(this.defaults, path);
    if (defaultValue !== undefined) return defaultValue;
    
    if (fallback !== undefined) return fallback;
    
    throw new Error(`No value found for config path: ${path}`);
  }
  
  /**
   * Get color from PBIP format { solid: { color: "#xxx" } }
   */
  protected getColor(path: string, fallback: string): string {
    const colorObj = this.getConfig<any>(path, null);
    if (colorObj?.solid?.color) return colorObj.solid.color;
    return fallback;
  }
  
  /**
   * Calculate plot area dimensions accounting for axes, legend, title
   */
  protected calculatePlotArea(ctx: RenderContext): PlotArea {
    const padding = this.defaults.container.padding;
    const legendConfig = this.getConfig('legend', {});
    const showLegend = legendConfig.show ?? this.defaults.legend.default_visible;
    const legendPosition = legendConfig.position ?? this.defaults.legend.position;
    
    let top = padding.top;
    let right = padding.right;
    let bottom = padding.bottom + this.defaults.x_axis.height;
    let left = padding.left + this.calculateYAxisWidth(ctx.data);
    
    if (showLegend) {
      switch (legendPosition) {
        case 'top':
          top += this.defaults.legend.dimensions.height_when_top_bottom;
          break;
        case 'bottom':
          bottom += this.defaults.legend.dimensions.height_when_top_bottom;
          break;
        case 'left':
          left += this.defaults.legend.dimensions.width_when_side;
          break;
        case 'right':
          right += this.defaults.legend.dimensions.width_when_side;
          break;
      }
    }
    
    return {
      x: left,
      y: top,
      width: ctx.width - left - right,
      height: ctx.height - top - bottom
    };
  }
  
  protected abstract calculateYAxisWidth(data: DataPoint[]): number;
  
  public abstract render(ctx: RenderContext): SVGElement | HTMLCanvasElement;
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

interface PlotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### Bar Chart Renderer

```typescript
// src/renderers/bar-chart.ts

import * as d3 from 'd3';
import { BaseRenderer, RenderContext, DataPoint } from './base-renderer';
import { barChartDefaults } from '../defaults/bar-chart-defaults';

export class BarChartRenderer extends BaseRenderer {
  constructor(visual: PBIPVisual) {
    super(visual, barChartDefaults);
  }
  
  protected calculateYAxisWidth(data: DataPoint[]): number {
    // Calculate based on max value length
    const maxValue = Math.max(...data.map(d => d.value));
    const formatted = this.formatAxisValue(maxValue);
    const charWidth = this.defaults.y_axis.labels.font.size * 0.6;
    return Math.max(
      this.defaults.y_axis.width,
      formatted.length * charWidth + 15
    );
  }
  
  public render(ctx: RenderContext): SVGElement {
    const { container, width, height, data } = ctx;
    const plotArea = this.calculatePlotArea(ctx);
    
    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    
    // Background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', this.defaults.container.background);
    
    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.category))
      .range([0, plotArea.width])
      .padding(1 - this.defaults.bars.layout.width_ratio);
    
    const yMax = Math.max(...data.map(d => d.value));
    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.1])  // 10% headroom
      .range([plotArea.height, 0]);
    
    // Plot area group
    const plot = svg.append('g')
      .attr('transform', `translate(${plotArea.x}, ${plotArea.y})`);
    
    // Grid lines
    if (this.getConfig('y_axis.grid_lines.visible', true)) {
      const gridColor = this.getConfig('y_axis.grid_lines.color', 
        this.defaults.y_axis.grid_lines.color);
      
      plot.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-plotArea.width)
          .tickFormat(() => '')
        )
        .selectAll('line')
        .attr('stroke', gridColor)
        .attr('stroke-width', this.defaults.y_axis.grid_lines.width);
      
      plot.select('.grid .domain').remove();
    }
    
    // Bars
    const barColor = this.getColor('dataColors.fill', 
      this.defaults.bars.colors.palette[0]);
    
    plot.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.category)!)
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => plotArea.height - yScale(d.value))
      .attr('fill', barColor)
      .attr('rx', this.defaults.bars.appearance.corner_radius);
    
    // X-Axis
    this.renderXAxis(svg, xScale, plotArea);
    
    // Y-Axis
    this.renderYAxis(svg, yScale, plotArea);
    
    // Data labels
    if (this.getConfig('dataLabels.show', false)) {
      this.renderDataLabels(plot, data, xScale, yScale);
    }
    
    // Legend
    if (this.shouldShowLegend(data)) {
      this.renderLegend(svg, data, width, height);
    }
    
    return svg.node() as SVGElement;
  }
  
  private renderXAxis(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    scale: d3.ScaleBand<string>,
    plotArea: PlotArea
  ): void {
    const axisConfig = this.defaults.x_axis;
    
    const xAxis = d3.axisBottom(scale)
      .tickSize(axisConfig.ticks.length);
    
    const axisGroup = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${plotArea.x}, ${plotArea.y + plotArea.height})`)
      .call(xAxis);
    
    // Style axis line
    axisGroup.select('.domain')
      .attr('stroke', axisConfig.line.color)
      .attr('stroke-width', axisConfig.line.width);
    
    // Style ticks
    axisGroup.selectAll('.tick line')
      .attr('stroke', axisConfig.ticks.color)
      .attr('stroke-width', axisConfig.ticks.width);
    
    // Style labels
    axisGroup.selectAll('.tick text')
      .attr('font-family', axisConfig.labels.font.family)
      .attr('font-size', axisConfig.labels.font.size)
      .attr('fill', axisConfig.labels.font.color)
      .each(function() {
        // Truncate long labels
        const text = d3.select(this);
        const fullText = text.text();
        if (fullText.length > 12) {
          text.text(fullText.substring(0, 10) + '...');
        }
      });
  }
  
  private renderYAxis(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    scale: d3.ScaleLinear<number, number>,
    plotArea: PlotArea
  ): void {
    const axisConfig = this.defaults.y_axis;
    
    const yAxis = d3.axisLeft(scale)
      .tickSize(axisConfig.ticks.length)
      .tickFormat(d => this.formatAxisValue(d as number));
    
    const axisGroup = svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${plotArea.x}, ${plotArea.y})`)
      .call(yAxis);
    
    // Style axis line
    axisGroup.select('.domain')
      .attr('stroke', axisConfig.line.color)
      .attr('stroke-width', axisConfig.line.width);
    
    // Style ticks
    axisGroup.selectAll('.tick line')
      .attr('stroke', axisConfig.ticks.color)
      .attr('stroke-width', axisConfig.ticks.width);
    
    // Style labels
    axisGroup.selectAll('.tick text')
      .attr('font-family', axisConfig.labels.font.family)
      .attr('font-size', axisConfig.labels.font.size)
      .attr('fill', axisConfig.labels.font.color);
  }
  
  private renderDataLabels(
    plot: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: DataPoint[],
    xScale: d3.ScaleBand<string>,
    yScale: d3.ScaleLinear<number, number>
  ): void {
    const config = this.defaults.data_labels;
    
    plot.selectAll('.data-label')
      .data(data)
      .join('text')
      .attr('class', 'data-label')
      .attr('x', d => xScale(d.category)! + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value) - config.padding)
      .attr('text-anchor', 'middle')
      .attr('font-family', config.font.family)
      .attr('font-size', config.font.size)
      .attr('fill', config.font.color)
      .text(d => this.formatAxisValue(d.value));
  }
  
  private formatAxisValue(value: number): string {
    const abs = Math.abs(value);
    if (abs >= 1e12) return (value / 1e12).toFixed(1) + 'T';
    if (abs >= 1e9) return (value / 1e9).toFixed(1) + 'B';
    if (abs >= 1e6) return (value / 1e6).toFixed(1) + 'M';
    if (abs >= 1e3) return (value / 1e3).toFixed(1) + 'K';
    return value.toLocaleString();
  }
  
  private shouldShowLegend(data: DataPoint[]): boolean {
    const hasMultipleSeries = new Set(data.map(d => d.series)).size > 1;
    const explicitShow = this.getConfig('legend.show', undefined);
    if (explicitShow !== undefined) return explicitShow;
    return hasMultipleSeries;
  }
  
  private renderLegend(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    data: DataPoint[],
    width: number,
    height: number
  ): void {
    // Implementation for legend rendering
    // Position based on config, render markers and labels
  }
}
```

### Defaults Loader

```typescript
// src/defaults/index.ts

import barChartDefaults from './bar-chart-defaults.json';
import lineChartDefaults from './line-chart-defaults.json';
import pieChartDefaults from './pie-chart-defaults.json';
import cardDefaults from './card-defaults.json';
import tableDefaults from './table-defaults.json';

const defaults: Record<string, VisualDefaults> = {
  barChart: barChartDefaults,
  clusteredBarChart: barChartDefaults,
  columnChart: barChartDefaults,  // Reuse with orientation flip
  clusteredColumnChart: barChartDefaults,
  lineChart: lineChartDefaults,
  areaChart: lineChartDefaults,  // Reuse with fill
  pieChart: pieChartDefaults,
  donutChart: pieChartDefaults,  // Reuse with inner radius
  card: cardDefaults,
  table: tableDefaults,
};

export function getDefaults(visualType: string): VisualDefaults {
  const defaultConfig = defaults[visualType];
  if (!defaultConfig) {
    console.warn(`No defaults found for visual type: ${visualType}`);
    return defaults.barChart;  // Fallback
  }
  return defaultConfig;
}
```

---

## Automated Comparison Pipeline

### CI Pipeline Configuration

```yaml
# .github/workflows/visual-comparison.yml

name: Visual Comparison

on:
  push:
    paths:
      - 'src/renderers/**'
      - 'src/defaults/**'
  pull_request:
    paths:
      - 'src/renderers/**'
      - 'src/defaults/**'

jobs:
  compare:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Generate renders
        run: pnpm run render:all
        
      - name: Compare with references
        run: pnpm run compare:all
        
      - name: Check thresholds
        run: |
          RESULT=$(cat comparison-report.json | jq '.averageMatch')
          if (( $(echo "$RESULT < 85" | bc -l) )); then
            echo "Visual fidelity below threshold: $RESULT%"
            exit 1
          fi
          
      - name: Upload diff images
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: output/diffs/
```

### Render All Test Cases

```typescript
// scripts/render-all.ts

import * as fs from 'fs';
import * as path from 'path';
import { JSDOM } from 'jsdom';
import { BarChartRenderer } from '../src/renderers/bar-chart';
import { loadPBIP } from '../src/utils/pbip-parser';

const VISUAL_TYPES = ['bar-chart', 'line-chart', 'pie-chart', 'card', 'table'];
const MEASUREMENTS_DIR = './measurements';
const OUTPUT_DIR = './output/renders';

async function renderAllTestCases(): Promise<void> {
  for (const visualType of VISUAL_TYPES) {
    const pbipDir = path.join(MEASUREMENTS_DIR, visualType, 'pbip');
    const outputDir = path.join(OUTPUT_DIR, visualType);
    
    fs.mkdirSync(outputDir, { recursive: true });
    
    const testCases = fs.readdirSync(pbipDir);
    
    for (const testCase of testCases) {
      const pbipPath = path.join(pbipDir, testCase);
      const pbip = await loadPBIP(pbipPath);
      
      // Create virtual DOM for rendering
      const dom = new JSDOM('<!DOCTYPE html><div id="container"></div>');
      const container = dom.window.document.getElementById('container')!;
      
      // Get renderer for visual type
      const renderer = getRenderer(pbip.visual);
      
      // Render
      const element = renderer.render({
        container,
        width: pbip.visual.position.width,
        height: pbip.visual.position.height,
        data: generatePlaceholderData(visualType)
      });
      
      // Export to PNG
      await exportToPNG(element, path.join(outputDir, `${testCase}.png`));
      
      console.log(`Rendered: ${visualType}/${testCase}`);
    }
  }
}

renderAllTestCases();
```

### Comparison Report Generator

```typescript
// scripts/generate-report.ts

import * as fs from 'fs';
import { compareRenders } from '../tools/compare-renders';

interface VisualReport {
  visualType: string;
  testCases: TestCaseResult[];
  averageMatch: number;
  minMatch: number;
  passingCount: number;
  failingCount: number;
}

interface TestCaseResult {
  testId: string;
  matchPercentage: number;
  status: 'pass' | 'fail' | 'warn';
  diffImage?: string;
}

const THRESHOLD_PASS = 90;
const THRESHOLD_WARN = 80;

async function generateFullReport(): Promise<void> {
  const visualTypes = ['bar-chart', 'line-chart', 'pie-chart', 'card', 'table'];
  const reports: VisualReport[] = [];
  
  for (const visualType of visualTypes) {
    const referenceDir = `./measurements/${visualType}/screenshots`;
    const renderedDir = `./output/renders/${visualType}`;
    const diffDir = `./output/diffs/${visualType}`;
    
    fs.mkdirSync(diffDir, { recursive: true });
    
    const results = await compareRenders(referenceDir, renderedDir, diffDir);
    
    const testCases: TestCaseResult[] = results.map(r => ({
      testId: r.testId,
      matchPercentage: r.matchPercentage,
      status: r.matchPercentage >= THRESHOLD_PASS ? 'pass' :
              r.matchPercentage >= THRESHOLD_WARN ? 'warn' : 'fail',
      diffImage: r.matchPercentage < THRESHOLD_PASS ? r.diffImagePath : undefined
    }));
    
    const averageMatch = testCases.reduce((s, t) => s + t.matchPercentage, 0) / testCases.length;
    
    reports.push({
      visualType,
      testCases,
      averageMatch,
      minMatch: Math.min(...testCases.map(t => t.matchPercentage)),
      passingCount: testCases.filter(t => t.status === 'pass').length,
      failingCount: testCases.filter(t => t.status === 'fail').length
    });
  }
  
  // Overall summary
  const overallAverage = reports.reduce((s, r) => s + r.averageMatch, 0) / reports.length;
  
  const summary = {
    generatedAt: new Date().toISOString(),
    overallAverageMatch: overallAverage,
    totalTestCases: reports.reduce((s, r) => s + r.testCases.length, 0),
    totalPassing: reports.reduce((s, r) => s + r.passingCount, 0),
    totalFailing: reports.reduce((s, r) => s + r.failingCount, 0),
    visualReports: reports
  };
  
  // Write JSON report
  fs.writeFileSync(
    './output/comparison-report.json',
    JSON.stringify(summary, null, 2)
  );
  
  // Write markdown report
  const markdown = generateMarkdownReport(summary);
  fs.writeFileSync('./output/comparison-report.md', markdown);
  
  console.log('\n========== COMPARISON SUMMARY ==========');
  console.log(`Overall average match: ${overallAverage.toFixed(2)}%`);
  console.log(`Total test cases: ${summary.totalTestCases}`);
  console.log(`Passing: ${summary.totalPassing}`);
  console.log(`Failing: ${summary.totalFailing}`);
  console.log('=========================================\n');
}

function generateMarkdownReport(summary: any): string {
  let md = `# Visual Comparison Report\n\n`;
  md += `Generated: ${summary.generatedAt}\n\n`;
  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Overall Match | ${summary.overallAverageMatch.toFixed(2)}% |\n`;
  md += `| Test Cases | ${summary.totalTestCases} |\n`;
  md += `| Passing | ${summary.totalPassing} |\n`;
  md += `| Failing | ${summary.totalFailing} |\n\n`;
  
  for (const report of summary.visualReports) {
    md += `## ${report.visualType}\n\n`;
    md += `Average: ${report.averageMatch.toFixed(2)}%\n\n`;
    md += `| Test Case | Match | Status |\n|-----------|-------|--------|\n`;
    
    for (const tc of report.testCases) {
      const emoji = tc.status === 'pass' ? '✅' : tc.status === 'warn' ? '⚠️' : '❌';
      md += `| ${tc.testId} | ${tc.matchPercentage.toFixed(2)}% | ${emoji} |\n`;
    }
    md += '\n';
  }
  
  return md;
}

generateFullReport();
```

---

## Quality Metrics & Acceptance Criteria

### Fidelity Thresholds

| Visual Type | Minimum | Target | Stretch |
|-------------|---------|--------|---------|
| Bar Chart | 85% | 90% | 95% |
| Line Chart | 85% | 90% | 95% |
| Pie Chart | 85% | 90% | 95% |
| Card | 90% | 95% | 98% |
| Table | 80% | 85% | 90% |
| Matrix | 75% | 80% | 85% |
| Scatter | 85% | 90% | 95% |
| **Overall** | **85%** | **90%** | **93%** |

### Acceptance Criteria

1. **P0 Visuals (Bar, Line, Card, Table)**
   - All test cases pass at 85%+ match
   - Average match ≥ 90%
   - No visual artifacts (clipping, overflow, missing elements)
   
2. **P1 Visuals (Pie, Area, Stacked)**
   - All test cases pass at 80%+ match
   - Average match ≥ 85%
   
3. **P2/P3 Visuals**
   - All test cases pass at 75%+ match
   - Average match ≥ 80%

### Known Acceptable Differences

These differences are acceptable and should not count against fidelity score:

| Difference | Reason |
|------------|--------|
| Font anti-aliasing | Browser vs. Windows rendering |
| Sub-pixel positioning | Rounding differences |
| Gradient rendering | Implementation variance |
| Shadow blur | Browser differences |
| Text baseline alignment | Font metric differences |

---

## Timeline & Resource Requirements

### Phase Breakdown

| Phase | Duration | Resources | Deliverables |
|-------|----------|-----------|--------------|
| **Setup & Tooling** | 1 week | 1 engineer | Measurement tools, comparison pipeline, CI setup |
| **P0 Measurement** | 2 weeks | 1 engineer | Bar, Line, Card, Table specs & screenshots |
| **P0 Implementation** | 3 weeks | 1 engineer | Renderers for P0 visuals |
| **P0 Validation** | 1 week | 1 engineer + QA | Achieve 90% average match |
| **P1 Measurement** | 1 week | 1 engineer | Pie, Area, Stacked specs |
| **P1 Implementation** | 2 weeks | 1 engineer | Renderers for P1 visuals |
| **P2/P3 Visuals** | 3 weeks | 1 engineer | Remaining visuals |
| **Polish & Edge Cases** | 1 week | 1 engineer | Bug fixes, edge case handling |
| **Total** | **14 weeks** | **1-2 engineers** | Production-ready preview renderer |

### Resource Requirements

**Personnel:**
- 1 Senior Frontend Engineer (full-time)
- 1 QA Engineer (part-time, validation phases)
- Access to designer for visual review (ad-hoc)

**Software:**
- Power BI Desktop (latest version)
- Node.js 20+
- Screen capture tooling
- CI/CD pipeline (GitHub Actions)

**Hardware:**
- Development machine with 100% display scaling capability
- Consistent display for measurements

---

## Appendices

### Appendix A: PBIP Visual Type Mapping

| Power BI Visual | visualType in PBIP |
|-----------------|-------------------|
| Clustered bar chart | `clusteredBarChart` |
| Clustered column chart | `clusteredColumnChart` |
| Stacked bar chart | `stackedBarChart` |
| Stacked column chart | `stackedColumnChart` |
| 100% stacked bar | `hundredPercentStackedBarChart` |
| 100% stacked column | `hundredPercentStackedColumnChart` |
| Line chart | `lineChart` |
| Area chart | `areaChart` |
| Stacked area chart | `stackedAreaChart` |
| Line and stacked column | `lineStackedColumnComboChart` |
| Line and clustered column | `lineClusteredColumnComboChart` |
| Pie chart | `pieChart` |
| Donut chart | `donutChart` |
| Treemap | `treemap` |
| Funnel | `funnel` |
| Gauge | `gauge` |
| Card | `card` |
| Multi-row card | `multiRowCard` |
| KPI | `kpi` |
| Table | `tableEx` |
| Matrix | `pivotTable` |
| Scatter chart | `scatterChart` |
| Waterfall | `waterfallChart` |
| Map | `map` |
| Filled map | `filledMap` |
| Shape map | `shapeMap` |
| Slicer | `slicer` |

### Appendix B: Power BI Default Color Palette

```typescript
const PBI_DEFAULT_PALETTE = [
  "#01B8AA",  // Teal
  "#374649",  // Dark gray
  "#FD625E",  // Coral red
  "#F2C80F",  // Yellow
  "#5F6B6D",  // Gray
  "#8AD4EB",  // Light blue
  "#FE9666",  // Orange
  "#A66999",  // Purple
  "#3599B8",  // Blue
  "#DFBFBF",  // Light pink
  "#4AC5BB",  // Light teal
  "#5F6B6D",  // Gray (repeated)
  "#FB8281",  // Light coral
  "#F4D25A",  // Light yellow
  "#7F898A",  // Medium gray
  "#A4DDEE",  // Lighter blue
  "#FDAB89",  // Light orange
  "#B687AC",  // Light purple
  "#28738A",  // Dark blue
  "#A78F8F",  // Mauve
];
```

### Appendix C: Font Stack

```css
/* Power BI primary font stack */
.pbi-visual {
  font-family: "Segoe UI", "Segoe UI Web (West European)", 
               "Segoe UI", -apple-system, BlinkMacSystemFont, 
               Roboto, "Helvetica Neue", sans-serif;
}

/* Card numbers use DIN */
.pbi-card-value {
  font-family: "DIN", "Segoe UI", sans-serif;
}
```

### Appendix D: Measurement Worksheet Template

```markdown
# Visual Measurement Worksheet

**Visual Type:** ________________
**Test Case ID:** ________________
**Date:** ________________
**Measurer:** ________________

## Screenshot Info
- Power BI Desktop Version: ________________
- Display Scale: 100%
- Screenshot Resolution: ________________ x ________________

## Container
- [ ] Total width: ________ px
- [ ] Total height: ________ px
- [ ] Background color: #________________
- [ ] Border: ________________

## Padding (container edge to content)
- [ ] Top: ________ px
- [ ] Right: ________ px
- [ ] Bottom: ________ px
- [ ] Left: ________ px

## X-Axis
- [ ] Total height: ________ px
- [ ] Line color: #________________
- [ ] Label font size: ________ px
- [ ] Label color: #________________
- [ ] Tick length: ________ px

## Y-Axis
- [ ] Total width: ________ px
- [ ] Line color: #________________
- [ ] Label font size: ________ px
- [ ] Label color: #________________
- [ ] Grid line color: #________________

## Data Elements
- [ ] First color: #________________
- [ ] Element spacing: ________ px
- [ ] Corner radius: ________ px

## Notes
________________
________________
________________
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-30 | Engineering | Initial specification |

---

*End of Document*
