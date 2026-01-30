# Power BI Renderer Implementation Guide

*A guide for Claude instances implementing high-fidelity Power BI visual renderers*

---

## Table of Contents

1. [Core Concept](#core-concept)
2. [Architecture Overview](#architecture-overview)
3. [Implementation Workflow](#implementation-workflow)
4. [Creating a New Renderer](#creating-a-new-renderer)
5. [Measuring Power BI Defaults](#measuring-power-bi-defaults)
6. [D3 Rendering Patterns](#d3-rendering-patterns)
7. [Validation with Pixel Comparison](#validation-with-pixel-comparison)
8. [Common Pitfalls](#common-pitfalls)
9. [Reference: Bar Chart Implementation](#reference-bar-chart-implementation)

---

## Core Concept

### The Problem

Power BI's rendering engine is proprietary. When users design dashboards in Phantom (our web tool), they need to see an accurate preview of how visuals will look in Power BI Desktop. We can't use Power BI's code, so we must reverse-engineer the visual appearance.

### The Solution

**Measure → Implement → Validate → Iterate**

1. **Measure**: Capture screenshots from Power BI Desktop and measure every visual property (colors, fonts, spacing, etc.)
2. **Implement**: Build D3-based renderers that match these measurements
3. **Validate**: Use pixel comparison (pixelmatch) to quantify accuracy
4. **Iterate**: Adjust renderer parameters until achieving 85%+ match

### Why This Works

- Power BI's visual styling is **deterministic** - same data + same config = same pixels
- We only need to match the **static appearance**, not behavior
- Small differences (anti-aliasing, sub-pixel rendering) are acceptable
- Users get **100% fidelity on export** since we write native PBIP format

### Success Criteria

| Level | Pixel Match | Meaning |
|-------|-------------|---------|
| Minimum | 85% | Usable preview |
| Target | 90% | Good fidelity |
| Excellent | 95%+ | Near-identical |

---

## Architecture Overview

```
src/pbi-renderer/
├── defaults/                    # Measured Power BI default values
│   └── bar-chart.json          # JSON config for each visual type
├── renderers/                   # D3-based rendering classes
│   ├── base-renderer.ts        # Abstract base class
│   └── bar-chart-renderer.ts   # Visual-specific implementation
├── utils/                       # Shared utilities
│   ├── axis-calculator.ts      # Tick intervals, number formatting
│   └── text-measurement.ts     # Label truncation
├── measurements/                # Reference data from Power BI
│   └── bar-chart/
│       ├── screenshots/        # Reference PNGs from Power BI Desktop
│       └── specs.yaml          # Documented measurements
└── index.ts                     # Module exports
```

### Key Design Principles

1. **Defaults-driven**: All styling comes from measured JSON defaults
2. **Config override**: User settings override defaults (same as Power BI)
3. **Pure SVG output**: Renderers output SVG elements, React wraps them
4. **Testable**: Each renderer can be validated independently

---

## Implementation Workflow

### Phase 1: Setup (Do Once)

```bash
# Required dependencies
pnpm add d3
pnpm add -D @types/d3 pixelmatch pngjs @types/pngjs
```

### Phase 2: For Each Visual Type

```
1. Create test cases (5-10 variations)
2. Capture Power BI screenshots at 400×300px
3. Measure all visual properties
4. Create defaults JSON
5. Implement renderer class
6. Create React wrapper component
7. Add to test harness
8. Run pixel comparison
9. Iterate until 85%+ match
```

---

## Creating a New Renderer

### Step 1: Define Defaults JSON

Create `src/pbi-renderer/defaults/{visual-type}.json`:

```json
{
  "visualType": "clusteredBarChart",
  "version": "1.0",

  "container": {
    "padding": { "top": 8, "right": 8, "bottom": 8, "left": 8 },
    "background": "#FFFFFF"
  },

  "categoryAxis": {
    "labels": {
      "font": {
        "family": "Segoe UI, wf_segoe-ui_normal, sans-serif",
        "size": 11,
        "color": "#666666",
        "weight": 400
      }
    }
  },

  "bars": {
    "colors": {
      "palette": ["#01B8AA", "#374649", "#FD625E", "#F2C80F", "#5F6B6D"]
    }
  }
}
```

**Key insight**: Power BI has hundreds of settings, but most use defaults. Focus on measuring the defaults first, then handle overrides.

### Step 2: Create Renderer Class

Create `src/pbi-renderer/renderers/{visual-type}-renderer.ts`:

```typescript
import * as d3 from 'd3';
import { BaseRenderer, RenderContext, DataPoint, PlotArea } from './base-renderer';
import defaults from '../defaults/{visual-type}.json';

export class MyVisualRenderer extends BaseRenderer {
  constructor(config = {}) {
    super(config, defaults);
  }

  protected calculatePlotArea(ctx: RenderContext): PlotArea {
    // Calculate usable area after axes, legend, padding
    const padding = this.getConfig('container.padding');
    // ... calculate dimensions
    return { x, y, width, height };
  }

  public render(ctx: RenderContext): SVGElement {
    const { width, height, data } = ctx;
    const plotArea = this.calculatePlotArea(ctx);

    // Create SVG
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute('class', 'pbi-visual pbi-my-visual');

    // Render components...
    this.renderBackground(svg);
    this.renderGridLines(svg, plotArea);
    this.renderDataElements(svg, data, plotArea);
    this.renderAxes(svg, plotArea);

    return svg;
  }
}
```

### Step 3: Create React Wrapper

Create `src/components/PBI{VisualType}.tsx`:

```typescript
import React, { useEffect, useRef } from 'react';
import { MyVisualRenderer } from '../pbi-renderer';

export const PBIMyVisual: React.FC<Props> = ({ data, width, height, ...config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous
    if (svgRef.current) svgRef.current.remove();

    // Render
    const renderer = new MyVisualRenderer(config);
    const svg = renderer.render({
      container: containerRef.current,
      width: width ?? containerRef.current.clientWidth,
      height: height ?? containerRef.current.clientHeight,
      data
    });

    containerRef.current.appendChild(svg);
    svgRef.current = svg;
  }, [data, config, width, height]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
```

### Step 4: Add to Test Harness

Edit `src/pages/PBIRendererTest.tsx` to add test cases:

```typescript
const TEST_CASES: Record<string, TestCase> = {
  // ... existing cases

  T06: {
    name: 'My New Visual - Default',
    description: 'Testing basic rendering',
    data: [...],
    config: { ... }
  }
};
```

### Step 5: Export from Index

Edit `src/pbi-renderer/index.ts`:

```typescript
export { MyVisualRenderer } from './renderers/my-visual-renderer';
```

---

## Measuring Power BI Defaults

### Why Screenshots Are Needed

PBIP files only store **explicit overrides** - properties the user changed. They do NOT store:
- Default font colors, sizes
- Default grid/axis colors
- Default padding, margins
- Default bar width ratios

Power BI applies internal defaults for unspecified properties. We must measure these from actual rendered output.

### Data Sources

**1. PBIP Files (available in repo)**
```
templates/mokkup/mokkup.Report/definition/pages/.../visuals/*/visual.json
```
Useful for:
- Visual type names (`clusteredBarChart`, `lineChart`, etc.)
- Object/property structure (`categoryAxis`, `valueAxis`, `labels`, etc.)
- Property value formats

**2. Theme Files (available in repo)**
```
templates/mokkup/mokkup.Report/StaticResources/RegisteredResources/Mokkup_theme.json
```
Useful for:
- Custom color palettes (dataColors array)
- Conditional formatting colors (good/neutral/bad)

**3. Existing Screenshots (available in repo)**
```
templates/mokkup.jpg  ← Real Power BI dashboard
```
Useful for:
- Measuring actual rendered colors, fonts, spacing
- Understanding visual proportions

**4. Controlled Test Screenshots (need to capture)**
For pixel-perfect comparison, capture isolated visuals at exact dimensions.

### Measurement Approaches

**Quick Approach: Use Existing Screenshots**

Open `templates/mokkup.jpg` in an image editor and measure:
- Pick colors with eyedropper
- Measure font sizes (compare to known reference)
- Measure spacing in pixels

This gives approximate values without needing Power BI Desktop.

**Precise Approach: Capture Test Visuals**

1. **Power BI Desktop Settings**:
   - Windows display scaling: 100%
   - View → Page View → Actual Size
   - Default theme (no custom themes)

2. **Visual Setup**:
   - Create visual with sample data
   - Set exact size: 400×300 pixels
   - Don't change any formatting settings (use defaults)

3. **Screenshot**:
   - Windows Snipping Tool → Rectangular
   - Capture only the visual (no canvas)
   - Save as PNG (lossless)

### Extracting Info from PBIP Visual Files

Real PBIP visual definitions are in `templates/mokkup/mokkup.Report/definition/pages/.../visuals/*/visual.json`

Example clustered bar chart structure:
```json
{
  "visual": {
    "visualType": "clusteredBarChart",
    "objects": {
      "categoryAxis": [{
        "properties": {
          "show": { "expr": { "Literal": { "Value": "true" }}},
          "innerPadding": { "expr": { "Literal": { "Value": "62.5L" }}}
        }
      }],
      "valueAxis": [{
        "properties": {
          "show": { "expr": { "Literal": { "Value": "false" }}},
          "gridlineShow": { "expr": { "Literal": { "Value": "true" }}}
        }
      }],
      "labels": [{
        "properties": {
          "show": { "expr": { "Literal": { "Value": "true" }}},
          "fontSize": { "expr": { "Literal": { "Value": "8D" }}}
        }
      }],
      "dataPoint": [{
        "properties": {
          "fill": { "solid": { "color": { "expr": { "Literal": { "Value": "'#342BC2'" }}}}}
        }
      }]
    }
  }
}
```

**Value format patterns:**
- `"true"` / `"false"` - Boolean
- `"8D"` - Number (D suffix = decimal)
- `"62.5L"` - Number (L suffix = long/integer)
- `"'#342BC2'"` - String (single quotes inside)
- `"'InsideEnd'"` - Enum value

**Key insight**: Only explicitly set properties appear in the file. Missing properties use Power BI's internal defaults.

### What to Measure

Use image editing software (Photoshop, GIMP, Figma) to measure:

| Property | How to Measure |
|----------|----------------|
| **Padding** | Distance from visual edge to content |
| **Font size** | Compare to known reference or use ruler |
| **Font color** | Color picker (note: may have anti-aliasing) |
| **Bar width ratio** | Bar width ÷ available band width |
| **Grid line color** | Color picker on grid line |
| **Axis line thickness** | Zoom in, count pixels |

### Power BI's Implicit Defaults

These are NOT stored in PBIP files but Power BI uses them:

```yaml
# Common Power BI defaults (measured)
fonts:
  primary: "Segoe UI"
  size_labels: 11px
  size_title: 12px
  color_labels: "#666666"
  color_title: "#333333"

colors:
  palette_first: "#01B8AA"  # Teal
  grid_lines: "#E6E6E6"
  axis_lines: "#CCCCCC"
  background: "#FFFFFF"

spacing:
  container_padding: 8px
  axis_label_margin: 5px
  legend_marker_size: 10px

bars:
  width_ratio: 0.7  # 70% of available space
  corner_radius: 0  # Sharp corners by default
```

---

## D3 Rendering Patterns

### Pattern 1: Pure SVG (No D3 Selection)

For maximum control and testability, create SVG elements directly:

```typescript
const svgNS = 'http://www.w3.org/2000/svg';

// Create element
const rect = document.createElementNS(svgNS, 'rect');
rect.setAttribute('x', '10');
rect.setAttribute('y', '20');
rect.setAttribute('width', '100');
rect.setAttribute('height', '50');
rect.setAttribute('fill', '#01B8AA');

// Add to parent
svg.appendChild(rect);
```

### Pattern 2: D3 Scales

Use D3 for scale calculations but not DOM manipulation:

```typescript
import * as d3 from 'd3';

// Band scale for categories
const yScale = d3.scaleBand()
  .domain(data.map(d => d.category))
  .range([0, plotArea.height])
  .padding(0.3);

// Linear scale for values
const xScale = d3.scaleLinear()
  .domain([0, maxValue])
  .range([0, plotArea.width]);

// Use scales for positioning
const barY = yScale(category);
const barWidth = xScale(value);
```

### Pattern 3: Nice Axis Ticks

Power BI uses "nice" intervals (1, 2, 5, 10, 20, 50, etc.):

```typescript
function calculateNiceTicks(min: number, max: number, targetCount = 5) {
  const range = max - min;
  const roughInterval = range / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));
  const normalized = roughInterval / magnitude;

  let niceInterval;
  if (normalized <= 1.5) niceInterval = 1;
  else if (normalized <= 3) niceInterval = 2;
  else if (normalized <= 7) niceInterval = 5;
  else niceInterval = 10;

  return niceInterval * magnitude;
}
```

### Pattern 4: Number Formatting

Power BI auto-formats large numbers:

```typescript
function formatAxisValue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (abs >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toLocaleString();
}
```

### Pattern 5: Text Truncation

Power BI truncates long labels with ellipsis:

```typescript
function truncateLabel(text: string, maxWidth: number, fontSize: number): string {
  const charWidth = fontSize * 0.6; // Approximate for Segoe UI
  const maxChars = Math.floor((maxWidth - charWidth * 3) / charWidth); // Reserve space for "..."

  if (text.length <= maxChars + 3) return text;
  return text.substring(0, maxChars) + '...';
}
```

---

## Validation with Pixel Comparison

### Test Structure

```typescript
// e2e/pbi-renderer-poc.spec.ts
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

test('T01: Default bar chart matches reference', async ({ page }) => {
  // 1. Navigate to test harness
  await page.goto('/pbi-renderer-test?case=T01&mode=comparison');

  // 2. Wait for render
  await page.waitForSelector('.pbi-bar-chart');

  // 3. Screenshot
  const rendered = await page.screenshot({ clip: { x: 0, y: 0, width: 400, height: 300 } });

  // 4. Load reference
  const reference = PNG.sync.read(fs.readFileSync('path/to/T01_reference.png'));

  // 5. Compare
  const diff = new PNG({ width: 400, height: 300 });
  const diffPixels = pixelmatch(reference.data, rendered, diff.data, 400, 300, { threshold: 0.1 });

  // 6. Assert
  const matchPercent = (1 - diffPixels / (400 * 300)) * 100;
  expect(matchPercent).toBeGreaterThan(85);
});
```

### Understanding Diff Images

When pixelmatch detects differences, it outputs a diff image:
- **Black**: Pixels match
- **Red/Magenta**: Pixels differ

Common diff patterns and what they mean:

| Pattern | Cause | Solution |
|---------|-------|----------|
| Red outline around text | Font anti-aliasing | Increase threshold to 0.1-0.15 |
| Red bars shifted | Wrong positioning | Check scale calculations |
| Entire area red | Wrong dimensions | Verify width/height |
| Grid lines red | Wrong color/position | Measure grid color exactly |

### Running Tests

```bash
# Run all PBI renderer tests
pnpm playwright test e2e/pbi-renderer-poc.spec.ts

# Run with visible browser
pnpm playwright test e2e/pbi-renderer-poc.spec.ts --headed

# Generate comparison report
npx tsx tools/compare-renders.ts
```

---

## Common Pitfalls

### 1. Font Rendering Differences

**Problem**: Browser renders fonts differently than Windows GDI.

**Solution**:
- Use `threshold: 0.1` in pixelmatch
- Accept 5-10% variance from fonts
- Use web-safe Segoe UI fallbacks

### 2. Sub-pixel Positioning

**Problem**: D3 may calculate positions like `10.333333px`.

**Solution**:
```typescript
// Round to nearest pixel
const x = Math.round(xScale(value));
```

### 3. Wrong Axis Direction

**Problem**: SVG Y-axis goes top-to-bottom, opposite of charts.

**Solution**:
```typescript
// Flip Y scale
const yScale = d3.scaleLinear()
  .domain([0, maxValue])
  .range([plotArea.height, 0]); // Note: reversed
```

### 4. Missing Padding

**Problem**: Content touches edges.

**Solution**: Always account for container padding:
```typescript
const plotArea = {
  x: padding.left + axisWidth,
  y: padding.top,
  width: totalWidth - padding.left - padding.right - axisWidth,
  height: totalHeight - padding.top - padding.bottom - axisHeight
};
```

### 5. Color Format Mismatch

**Problem**: Power BI uses uppercase hex, browser uses lowercase.

**Solution**: Normalize colors:
```typescript
const color = measuredColor.toUpperCase(); // #01B8AA not #01b8aa
```

### 6. Grid Lines Rendering Order

**Problem**: Grid lines appear on top of bars.

**Solution**: Render in correct z-order:
1. Background
2. Grid lines
3. Data elements (bars/lines)
4. Axes
5. Labels
6. Legend

---

## Reference: Bar Chart Implementation

### File: `src/pbi-renderer/defaults/bar-chart.json`

Key measurements for horizontal clustered bar chart:

```json
{
  "container": {
    "padding": { "top": 8, "right": 8, "bottom": 8, "left": 8 }
  },
  "categoryAxis": {
    "width": 80,
    "labels": {
      "font": { "family": "Segoe UI", "size": 11, "color": "#666666" },
      "maxWidth": 80
    }
  },
  "valueAxis": {
    "height": 30,
    "gridLines": { "color": "#E6E6E6", "width": 1 }
  },
  "bars": {
    "layout": { "widthRatio": 0.7 },
    "colors": { "palette": ["#01B8AA", "#374649", "#FD625E", ...] }
  }
}
```

### Rendering Order

1. `renderBackground()` - White fill
2. `renderGridLines()` - Vertical lines at tick positions
3. `renderBars()` - Horizontal rectangles
4. `renderDataLabels()` - If enabled
5. `renderCategoryAxis()` - Y-axis with labels
6. `renderValueAxis()` - X-axis with formatted numbers
7. `renderLegend()` - If multiple series

### Test Cases

| ID | Purpose | Key Test |
|----|---------|----------|
| T01 | Default | Basic rendering works |
| T02 | Legend | Multi-series colors correct |
| T03 | Labels | Data labels positioned correctly |
| T04 | Truncation | Long text truncates with "..." |
| T05 | Formatting | Large numbers show K/M/B |

---

## Extending to Other Visual Types

### Adaptation Checklist

When implementing a new visual type:

- [ ] Identify Power BI visual type name (e.g., `lineChart`, `pieChart`)
- [ ] Create 5+ test cases covering edge cases
- [ ] Capture reference screenshots
- [ ] Measure all default values
- [ ] Create defaults JSON
- [ ] Implement renderer class extending BaseRenderer
- [ ] Handle visual-specific features (legend, tooltips, etc.)
- [ ] Create React wrapper
- [ ] Add to test harness
- [ ] Achieve 85%+ pixel match

### Visual Type Priority

| Priority | Visual | Complexity | Notes |
|----------|--------|------------|-------|
| P0 | Bar/Column | Medium | Reuse with orientation flip |
| P0 | Line | Medium | Add point markers |
| P0 | Card | Low | Text positioning |
| P1 | Pie/Donut | Medium | Arc calculations |
| P1 | Table | High | Cell layout, scrolling |
| P2 | Scatter | Medium | Point rendering |
| P2 | Map | High | Geography library needed |

---

## Summary

The PBI renderer approach works because:

1. **Measurement-first**: We measure real Power BI output, not guess
2. **Validation-driven**: Pixel comparison gives objective metrics
3. **Iterative**: Start rough, refine until accurate
4. **Maintainable**: Defaults in JSON, logic in TypeScript

When implementing a new visual:
1. Always capture reference screenshots first
2. Measure before coding
3. Test frequently with pixel comparison
4. Accept that 100% match is impossible (fonts differ)
5. Focus on the 85-90% that matters for preview fidelity

The exported PBIP files always have 100% fidelity because they use Power BI's native format. The renderer is only for preview—good enough is good enough.
