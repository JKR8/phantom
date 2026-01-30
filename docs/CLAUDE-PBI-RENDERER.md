# Claude Instructions: PBI Renderer Implementation

*Quick reference for implementing Power BI visual renderers*

---

## Your Task

You're implementing a D3-based renderer that visually matches Power BI Desktop output. The goal is **85%+ pixel match** for preview fidelity.

## Core Workflow

```
1. MEASURE  → Capture Power BI screenshots, document all visual properties
2. IMPLEMENT → Build D3 renderer using measured defaults
3. VALIDATE  → Run pixelmatch comparison
4. ITERATE   → Adjust until 85%+ match
```

## File Structure You'll Create

```
src/pbi-renderer/
├── defaults/{visual}.json      ← Measured Power BI defaults
├── renderers/{visual}-renderer.ts  ← D3 rendering class
├── utils/                      ← Shared utilities (already exist)
└── index.ts                    ← Export new renderer

src/components/PBI{Visual}.tsx  ← React wrapper
src/pages/PBIRendererTest.tsx   ← Add test cases here
```

## Step-by-Step Implementation

### 1. Create Defaults JSON

`src/pbi-renderer/defaults/{visual}.json`:

```json
{
  "visualType": "myVisualType",
  "container": {
    "padding": { "top": 8, "right": 8, "bottom": 8, "left": 8 },
    "background": "#FFFFFF"
  },
  "axis": {
    "labels": {
      "font": { "family": "Segoe UI", "size": 11, "color": "#666666" }
    },
    "gridLines": { "color": "#E6E6E6", "width": 1 }
  },
  "colors": {
    "palette": ["#01B8AA", "#374649", "#FD625E", "#F2C80F", "#5F6B6D"]
  }
}
```

### 2. Create Renderer Class

`src/pbi-renderer/renderers/{visual}-renderer.ts`:

```typescript
import * as d3 from 'd3';
import { BaseRenderer, RenderContext, PlotArea } from './base-renderer';
import defaults from '../defaults/{visual}.json';

export class MyVisualRenderer extends BaseRenderer {
  constructor(config = {}) {
    super(config, defaults);
  }

  protected calculatePlotArea(ctx: RenderContext): PlotArea {
    const padding = this.getConfig('container.padding');
    // Calculate usable area
    return {
      x: padding.left + axisWidth,
      y: padding.top,
      width: ctx.width - padding.left - padding.right - axisWidth,
      height: ctx.height - padding.top - padding.bottom - axisHeight
    };
  }

  public render(ctx: RenderContext): SVGElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', String(ctx.width));
    svg.setAttribute('height', String(ctx.height));
    svg.setAttribute('class', 'pbi-visual pbi-my-visual');

    // Render in z-order:
    // 1. Background
    // 2. Grid lines
    // 3. Data elements
    // 4. Axes
    // 5. Labels
    // 6. Legend

    return svg;
  }
}
```

### 3. Create React Wrapper

`src/components/PBI{Visual}.tsx`:

```typescript
import React, { useEffect, useRef } from 'react';
import { MyVisualRenderer } from '../pbi-renderer';

export const PBIMyVisual: React.FC<Props> = ({ data, width, height, ...config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (svgRef.current) svgRef.current.remove();

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

### 4. Add Test Cases

Edit `src/pages/PBIRendererTest.tsx`:

```typescript
const TEST_CASES: Record<string, TestCase> = {
  // Add your test cases
  T0X: {
    name: 'My Visual - Default',
    description: 'Basic rendering test',
    data: [
      { category: 'A', value: 100 },
      { category: 'B', value: 200 }
    ],
    config: {}
  }
};
```

### 5. Export from Index

Edit `src/pbi-renderer/index.ts`:

```typescript
export { MyVisualRenderer } from './renderers/my-visual-renderer';
```

---

## Power BI Default Values (Measured from Real Output)

**Source**: `templates/mokkup_pbi_email.jpg` - Real Power BI Desktop render
**Reference PBIP**: `templates/mokkup/mokkup.Report/`
**Measurements**: `src/pbi-renderer/measurements/bar-chart/specs.yaml`

```yaml
# Fonts (measured from mokkup_pbi_email.jpg)
primary_font: "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif"
label_font_size: 10px      # NOT 11px
title_font_size: 14px
label_color: "#605E5C"     # NOT #666666
title_color: "#342BC2"     # Theme primary (purple)

# Colors (Mokkup theme)
first_color: "#342BC2"     # Purple
second_color: "#6F67F1"    # Light purple
third_color: "#44B0AB"     # Teal
positive_color: "#93BF35"  # Green
grid_color: "#E8E8E8"      # Very light gray
background: "#FFFFFF"

# Standard PBI palette (for non-themed)
pbi_default_first: "#01B8AA"

# Spacing
container_padding: 8px (all sides)
axis_label_margin: 8px
bar_width_ratio: 0.6       # NOT 0.7
legend_marker_size: 8px
legend_marker_shape: circle # NOT square

# Visibility
axis_lines: false          # Hidden by default!
grid_lines: true
ticks: false
```

**Key findings from real Power BI output:**
- Axis lines are NOT visible by default
- Grid lines are very subtle (#E8E8E8)
- Labels use #605E5C (darker than expected)
- Legend markers are circles, not squares
- Bars are narrower (60% not 70%)

---

## Utility Functions Available

Import from `src/pbi-renderer`:

```typescript
// Axis calculations
import { calculateNiceTicks, formatAxisValue } from '../pbi-renderer';

// calculateNiceTicks(0, 1000, 5) → { ticks: [0, 200, 400, 600, 800, 1000], ... }
// formatAxisValue(2500000) → "2.5M"

// Text truncation
import { truncateLabelApproximate } from '../pbi-renderer';

// truncateLabelApproximate("Very Long Label", 80, 11) → "Very Lon..."
```

---

## Common D3 Patterns

### Band Scale (Categories)

```typescript
const yScale = d3.scaleBand()
  .domain(data.map(d => d.category))
  .range([0, height])
  .padding(0.3);

const barY = yScale(category);
const barHeight = yScale.bandwidth();
```

### Linear Scale (Values)

```typescript
const xScale = d3.scaleLinear()
  .domain([0, maxValue])
  .range([0, width]);

const barWidth = xScale(value);
```

### SVG Element Creation

```typescript
const svgNS = 'http://www.w3.org/2000/svg';

const rect = document.createElementNS(svgNS, 'rect');
rect.setAttribute('x', String(x));
rect.setAttribute('y', String(y));
rect.setAttribute('width', String(width));
rect.setAttribute('height', String(height));
rect.setAttribute('fill', color);
parent.appendChild(rect);
```

---

## Validation

### Run Tests

```bash
pnpm playwright test e2e/pbi-renderer-poc.spec.ts
```

### Interpret Results

- **85%+ match**: Success
- **80-85%**: Acceptable, minor tweaks needed
- **<80%**: Significant issues, check measurements

### Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Text areas red in diff | Font anti-aliasing | Normal, increase threshold |
| Bars shifted | Wrong scale calculation | Check domain/range |
| Everything offset | Missing padding | Add container.padding |
| Colors wrong | Measuring error | Re-measure with color picker |

---

## Checklist Before Submitting

- [ ] Defaults JSON has all measured values
- [ ] Renderer extends BaseRenderer
- [ ] Render order: background → grid → data → axes → labels
- [ ] React wrapper handles resize
- [ ] Test cases cover: default, edge cases, formatting
- [ ] Exported from index.ts
- [ ] Build passes (`pnpm build`)
- [ ] 85%+ pixel match on test cases

---

## Reference Implementation

See `src/pbi-renderer/renderers/bar-chart-renderer.ts` for a complete example:

- ~500 lines of TypeScript
- Handles all bar chart features
- Well-commented rendering logic
- Passes all test cases

Read the full guide at `docs/PBI-RENDERER-GUIDE.md` for detailed explanations.
