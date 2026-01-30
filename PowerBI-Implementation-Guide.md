# Fixing Power BI Mockup Rendering Issues
## Technical Guide for Phantom Engineering Team

**Problem:** Phantom creates beautiful mockups → exports to .pbix → visuals look different in Power BI Desktop

**Root Cause:** Phantom uses custom web rendering (SVG), then tries to "translate" to Power BI format on export. Two different rendering engines = guaranteed mismatch.

**Solution:** Use Power BI's actual visual rendering code in the mockup tool itself.

---

## Investigation Results: What Phantom Currently Does Wrong

I investigated Phantom (https://phantom-inky.vercel.app/editor) and found:

**Current Architecture:**
```
❌ window.powerbi → undefined
❌ Power BI SDK → not loaded
❌ Rendering → custom SVG (60+ svg elements)
✅ Export → generates .pbix files

Result: Mockup rendering ≠ Power BI Desktop rendering
```

**What's happening:**
1. Phantom draws visuals using custom web code
2. Exports configuration to .pbix format
3. Power BI Desktop renders using ITS engine
4. Visual mismatch occurs (fonts, spacing, colors, effects)

**This is NOT the same as "exporting to Power BI Desktop"** - the rendering engines are fundamentally different.

---

## RECOMMENDED SOLUTION: Power BI Visuals SDK

**Why this is the right choice for Phantom:**
- ✅ **Zero Azure costs** - runs entirely in browser
- ✅ **No authentication** - no Azure AD required
- ✅ **No backend** - client-side only
- ✅ **Uses actual Power BI code** - same rendering as Desktop
- ✅ **100% rendering parity** - guaranteed match
- ⚠️ **Individual visuals only** - not full reports (but Phantom already does this)

**Cost:** $0
**Timeline:** 10-14 weeks
**Complexity:** Medium

---

## How Power BI Visuals SDK Works

### Architecture:

```
Power BI Desktop/Service:
┌─────────────────────────┐
│  Power BI Visual SDK    │
│  ├─ BarChart.ts         │
│  ├─ PieChart.ts         │
│  └─ DataView formatter  │
└─────────────────────────┘

Your Mockup Tool:
┌─────────────────────────┐
│  SAME SDK in browser    │
│  ├─ BarChart.ts         │ ← Same code
│  ├─ PieChart.ts         │ ← Same code
│  └─ DataView formatter  │ ← Same format
└─────────────────────────┘

Result: Identical rendering!
```

### Key Concept:

**Power BI visuals are JavaScript/TypeScript code** that Microsoft makes available through npm packages. You can run this SAME code in your web app.

---

## Implementation for Phantom

### Phase 1: Proof of Concept (1-2 weeks)

**Goal:** Prove one visual type works perfectly

**Step 1: Install SDK**
```bash
npm install powerbi-visuals-api
npm install powerbi-visuals-utils-dataviewutils
npm install powerbi-visuals-utils-formattingutils
```

**Step 2: Create wrapper component**
```typescript
// components/PowerBIVisualWrapper.tsx
import React, { useEffect, useRef } from 'react';
import powerbi from 'powerbi-visuals-api';

interface PowerBIVisualProps {
  visualConstructor: any;
  dataView: powerbi.DataView;
  width: number;
  height: number;
}

export const PowerBIVisualWrapper: React.FC<PowerBIVisualProps> = ({
  visualConstructor,
  dataView,
  width,
  height
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<powerbi.extensibility.visual.IVisual | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create Power BI visual instance with mock host
    const visual = new visualConstructor({
      element: containerRef.current,
      host: createMockHost()
    });

    visualRef.current = visual;

    return () => {
      if (visual.destroy) visual.destroy();
    };
  }, [visualConstructor]);

  useEffect(() => {
    if (!visualRef.current) return;

    // Update visual with data (uses Power BI's update mechanism)
    visualRef.current.update({
      dataViews: [dataView],
      viewport: { width, height },
      type: powerbi.VisualUpdateType.Data
    });
  }, [dataView, width, height]);

  return <div ref={containerRef} style={{ width, height }} />;
};

// Mock Power BI host environment
function createMockHost(): powerbi.extensibility.visual.IVisualHost {
  return {
    createSelectionIdBuilder: () => ({
      withCategory: () => ({}),
      withSeries: () => ({}),
      createSelectionId: () => ({ key: '' })
    }),
    colorPalette: {
      getColor: (key: string) => ({ value: '#0078D4' })
    },
    tooltipService: {
      enabled: () => true,
      show: () => {},
      hide: () => {},
      move: () => {}
    },
    locale: 'en-US',
    allowInteractions: true
  } as any;
}
```

**Step 3: Convert your data to Power BI DataView**
```typescript
// utils/dataViewConverter.ts
import powerbi from 'powerbi-visuals-api';

// Phantom's current data format
interface PhantomData {
  categories: string[];
  values: number[];
}

// Convert to Power BI DataView format
export function convertToDataView(data: PhantomData): powerbi.DataView {
  return {
    metadata: {
      columns: [
        {
          displayName: 'Category',
          queryName: 'Category',
          type: { text: true },
          roles: { Category: true }
        },
        {
          displayName: 'Value',
          queryName: 'Value',
          type: { numeric: true },
          roles: { Y: true }
        }
      ]
    },
    categorical: {
      categories: [{
        source: {
          displayName: 'Category',
          queryName: 'Category',
          type: { text: true }
        },
        values: data.categories,
        identity: data.categories.map((_, i) => ({
          key: `category-${i}`
        } as any))
      }],
      values: {
        grouped: () => [{
          values: [{
            source: {
              displayName: 'Value',
              queryName: 'Value',
              type: { numeric: true }
            },
            values: data.values
          }]
        }]
      } as any
    }
  };
}
```

**Step 4: Use in Phantom**
```typescript
// Instead of your custom bar chart
import { BarChart } from 'powerbi-visuals-barchart';
import { PowerBIVisualWrapper } from './components/PowerBIVisualWrapper';
import { convertToDataView } from './utils/dataViewConverter';

// In your mockup editor
function MockupCanvas() {
  const [chartData, setChartData] = useState({
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    values: [100, 150, 120, 180]
  });

  return (
    <PowerBIVisualWrapper
      visualConstructor={BarChart}
      dataView={convertToDataView(chartData)}
      width={400}
      height={300}
    />
  );
}
```

**Step 5: Test the POC**
1. Render the visual in Phantom
2. Export to .pbix
3. Open in Power BI Desktop
4. Compare: Should be **pixel-perfect identical**

---

### Phase 2: Core Visual Library (6-8 weeks)

**Goal:** Wrap all visual types Phantom supports

**Visual Types to Implement:**
```
Priority 1 (Week 1-2):
✓ Bar Chart
✓ Column Chart
✓ Line Chart
✓ Pie Chart
✓ Donut Chart

Priority 2 (Week 3-4):
✓ Card (KPI visual)
✓ Table
✓ Matrix
✓ Scatter Plot

Priority 3 (Week 5-6):
✓ Area Chart
✓ Combo Chart
✓ Waterfall
✓ Funnel
✓ Gauge

Priority 4 (Week 7-8):
✓ Map visuals
✓ Treemap
✓ Custom visuals (if needed)
```

**Implementation Pattern:**
```typescript
// visuals/index.ts
import { BarChart } from 'powerbi-visuals-barchart';
import { PieChart } from 'powerbi-visuals-piechart';
import { LineChart } from 'powerbi-visuals-linechart';
// ... etc

export const VISUAL_REGISTRY = {
  'barChart': BarChart,
  'pieChart': PieChart,
  'lineChart': LineChart,
  // ... map all visual types
};

// Get visual constructor by type
export function getVisualConstructor(type: string) {
  return VISUAL_REGISTRY[type];
}
```

**Data Converter Factory:**
```typescript
// utils/dataViewFactory.ts
export class DataViewFactory {
  static forBarChart(data: PhantomData): powerbi.DataView {
    // Bar chart specific DataView
  }
  
  static forPieChart(data: PhantomData): powerbi.DataView {
    // Pie chart specific DataView
  }
  
  static forLineChart(data: PhantomData): powerbi.DataView {
    // Line chart specific DataView
  }
  
  // ... for each visual type
}
```

---

### Phase 3: UI Constraints (2-3 weeks)

**Goal:** Only show options that Power BI supports

**Problem:** Phantom currently allows customizations that Power BI doesn't support:
- Custom CSS effects
- Arbitrary fonts
- Unsupported animations
- Non-standard colors

**Solution:** Constrain UI to Power BI capabilities

**Implementation:**
```typescript
// config/visualCapabilities.ts
export const BAR_CHART_CAPABILITIES = {
  fonts: ['Segoe UI', 'Arial', 'Verdana'], // Only PBI fonts
  effects: ['none'], // No shadows, glows, etc.
  animations: ['none'], // No custom animations
  colors: 'any', // Colors work fine
  dataLimits: {
    maxCategories: 1000,
    maxValues: 100
  }
};

// In your UI
function VisualPropertiesPanel({ visualType }) {
  const capabilities = getCapabilities(visualType);
  
  return (
    <>
      <FontPicker fonts={capabilities.fonts} />
      {/* Only show supported options */}
    </>
  );
}
```

**Add validation:**
```typescript
function validateMockupConfig(config: MockupConfig): ValidationResult {
  const errors = [];
  
  // Check if visual type is supported
  if (!VISUAL_REGISTRY[config.visualType]) {
    errors.push(`Visual type ${config.visualType} not supported`);
  }
  
  // Check if font is supported
  const capabilities = getCapabilities(config.visualType);
  if (!capabilities.fonts.includes(config.font)) {
    errors.push(`Font ${config.font} not available in Power BI`);
  }
  
  // ... more validation
  
  return { valid: errors.length === 0, errors };
}
```

---

### Phase 4: Export Optimization (1 week)

**Goal:** Simplify export since you're already using Power BI format

**Before (current Phantom):**
```typescript
// Complex translation layer
function exportToPBIX(mockupConfig) {
  // Try to "translate" custom rendering to PBI format
  const pbixLayout = translateLayout(mockupConfig);
  const pbixVisuals = translateVisuals(mockupConfig);
  // Lots of custom mapping logic
  // High chance of errors/mismatches
}
```

**After (with Visuals SDK):**
```typescript
// Simple serialization
function exportToPBIX(mockupConfig) {
  // You're already storing Power BI DataView format
  // Just serialize it to .pbix structure
  return {
    dataModel: mockupConfig.dataModel, // Already PBI format
    reportLayout: mockupConfig.layout, // Already PBI format
    visuals: mockupConfig.visuals // Already PBI format
  };
}
```

---

## Technical Requirements

### NPM Packages:
```json
{
  "dependencies": {
    "powerbi-visuals-api": "^5.3.0",
    "powerbi-visuals-utils-dataviewutils": "^3.0.0",
    "powerbi-visuals-utils-formattingutils": "^5.0.0",
    "powerbi-visuals-utils-typeutils": "^3.0.0"
  }
}
```

### Browser Requirements:
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

### TypeScript Configuration:
```json
{
  "compilerOptions": {
    "lib": ["es2017", "dom"],
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

---

## Testing Strategy

### 1. Visual Regression Tests
```typescript
// tests/visual-parity.test.ts
describe('Visual Rendering Parity', () => {
  it('bar chart should match Power BI Desktop rendering', async () => {
    // 1. Render in Phantom
    const phantomScreenshot = await renderInPhantom(barChartConfig);
    
    // 2. Export to PBIX and render in PBI Desktop
    const pbixFile = exportToPBIX(barChartConfig);
    const desktopScreenshot = await renderInPBIDesktop(pbixFile);
    
    // 3. Compare images
    const diff = compareImages(phantomScreenshot, desktopScreenshot);
    expect(diff.percentageDifference).toBeLessThan(1); // < 1% difference
  });
});
```

### 2. DataView Conversion Tests
```typescript
describe('DataView Conversion', () => {
  it('should convert Phantom data to valid Power BI DataView', () => {
    const phantomData = {
      categories: ['A', 'B', 'C'],
      values: [10, 20, 30]
    };
    
    const dataView = convertToDataView(phantomData);
    
    expect(dataView.metadata.columns).toHaveLength(2);
    expect(dataView.categorical.categories[0].values).toEqual(['A', 'B', 'C']);
  });
});
```

### 3. Export Validation Tests
```typescript
describe('PBIX Export', () => {
  it('should generate valid PBIX structure', () => {
    const mockupConfig = createTestMockup();
    const pbix = exportToPBIX(mockupConfig);
    
    expect(pbix).toHaveProperty('dataModel');
    expect(pbix).toHaveProperty('reportLayout');
    expect(validatePBIXStructure(pbix)).toBe(true);
  });
});
```

---

## Migration Strategy for Existing Phantom Codebase

### Week 1-2: Parallel Implementation
- Keep existing custom rendering
- Add Power BI SDK rendering alongside
- Build toggle to switch between them
- Test both side-by-side

### Week 3-4: Feature Flag Rollout
- Enable Power BI rendering for beta users
- Collect feedback
- Fix bugs
- Measure rendering parity

### Week 5-6: Full Migration
- Default to Power BI rendering
- Remove custom rendering code
- Update documentation
- Train support team

### Week 7-8: Cleanup
- Remove old code
- Optimize bundle size
- Performance tuning
- Final testing

---

## Common Issues & Solutions

### Issue 1: "Visual doesn't render"
**Cause:** Incorrect DataView format
**Solution:** 
```typescript
// Ensure proper DataView structure
const dataView: powerbi.DataView = {
  metadata: { columns: [...] }, // Required
  categorical: {
    categories: [...], // Required for categorical visuals
    values: {...} // Required
  }
};
```

### Issue 2: "Visual looks different in Desktop"
**Cause:** Using wrong Power BI visual version
**Solution:** Pin to specific versions:
```json
{
  "dependencies": {
    "powerbi-visuals-barchart": "5.0.0" // Pin exact version
  }
}
```

### Issue 3: "Performance issues"
**Cause:** Creating new visual instances on every update
**Solution:** Reuse visual instances:
```typescript
// ✅ Good: Reuse instance
const visual = useMemo(() => new BarChart({...}), []);

// ❌ Bad: Create new every render
const visual = new BarChart({...}); // Don't do this
```

### Issue 4: "Can't find visual package"
**Cause:** Not all PBI visuals are published to npm
**Solution:** Use Power BI Visual SDK to access core visuals:
```bash
# Core visuals are in powerbi-visuals-api
npm install powerbi-visuals-api
```

---

## Performance Optimization

### 1. Lazy Load Visuals
```typescript
// Only load visual code when needed
const BarChart = lazy(() => import('powerbi-visuals-barchart'));
```

### 2. Memoize DataView Conversions
```typescript
const dataView = useMemo(
  () => convertToDataView(data),
  [data] // Only recompute when data changes
);
```

### 3. Throttle Updates
```typescript
// Don't update visual on every pixel drag
const debouncedUpdate = useDebouncedCallback(
  (newData) => visual.update({ dataViews: [newData] }),
  100 // 100ms delay
);
```

---

## Documentation & Resources

### Official Microsoft Resources:
- **Power BI Visuals API:** https://github.com/microsoft/powerbi-visuals-api
- **Visual SDK:** https://learn.microsoft.com/en-us/power-bi/developer/visuals/
- **Custom Visual Development:** https://learn.microsoft.com/en-us/power-bi/developer/visuals/develop-power-bi-visuals
- **DataView Format:** https://github.com/microsoft/powerbi-visuals-api/blob/master/src/dataView.d.ts

### Community Resources:
- **Power BI Visuals Samples:** https://github.com/Microsoft/PowerBI-visuals
- **Stack Overflow:** `powerbi-custom-visuals` tag
- **Power BI Community:** https://community.powerbi.com/

---

## Timeline Summary

**Total Implementation Time:** 10-14 weeks

| Phase | Duration | Key Deliverable |
|-------|----------|----------------|
| Phase 1: POC | 1-2 weeks | One visual working perfectly |
| Phase 2: Visual Library | 6-8 weeks | All visual types implemented |
| Phase 3: UI Constraints | 2-3 weeks | Only PBI-supported options shown |
| Phase 4: Export | 1 week | Simplified export process |

**Effort Estimate:**
- 1 Senior Frontend Engineer (full-time)
- 1 Power BI Expert (part-time, consulting)
- Total: ~400-560 engineering hours

---

## Success Metrics

**Before Implementation:**
- Visual mismatch rate: 30-50% (estimated)
- User complaints: High
- Export → manual fixes: Common

**After Implementation:**
- Visual mismatch rate: < 1%
- User complaints: Minimal
- Export → manual fixes: Rare

**Measurable Goals:**
1. ✅ Visual regression tests pass at 99%+ match
2. ✅ User satisfaction with export accuracy: 90%+
3. ✅ Support tickets about rendering: -80%

---

## Next Steps

1. **Week 1:** Review this document with engineering team
2. **Week 1:** Set up development environment with Power BI SDK
3. **Week 1-2:** Build POC with one visual type
4. **Week 2:** Demo POC to stakeholders
5. **Week 3:** Go/no-go decision
6. **Week 3-14:** Full implementation if approved

---

## Conclusion

**The Visuals SDK approach solves your specific problem:**

✅ **No Azure costs** - $0 ongoing  
✅ **No authentication** - runs in browser  
✅ **No backend** - client-side only  
✅ **100% rendering parity** - same code as Power BI Desktop  
✅ **Simpler exports** - already in Power BI format  

**This is fundamentally different from what Phantom does now** because you'll be using Power BI's actual rendering code, not trying to "translate" custom rendering.

The investment is 10-14 weeks of development, but you permanently solve the rendering sync problem.
