# Microsoft Power BI Custom Visuals Submission Requirements

This document outlines all requirements that visuals must pass before submission to Microsoft AppSource.

**References:**
- [Guidelines for Power BI Visuals](https://learn.microsoft.com/en-us/power-bi/developer/visuals/guidelines-powerbi-visuals)
- [Submission Testing](https://learn.microsoft.com/en-us/power-bi/developer/visuals/submission-testing)

---

## Visuals In Scope

The following visuals are subject to Microsoft submission testing (portfolio visuals excluded):

### Standard Charts (15)
| Visual | Component | Cross-Filter | Tests |
|--------|-----------|--------------|-------|
| Bar Chart | `BarChart.tsx` | Yes | Yes |
| Clustered Column Chart | `ClusteredColumnChart.tsx` | Yes | Yes |
| Stacked Bar Chart | `StackedBarChart.tsx` | Yes | Yes |
| Stacked Column Chart | `StackedColumnChart.tsx` | Yes | Yes |
| Area Chart | `AreaChart.tsx` | Yes | Yes |
| Stacked Area Chart | `StackedAreaChart.tsx` | Yes | Yes |
| Line Chart | `LineChart.tsx` | Yes | Yes |
| Scatter Chart | `ScatterChart.tsx` | Yes | Yes |
| Pie Chart | `PieChart.tsx` | Yes | Yes |
| Donut Chart | `DonutChart.tsx` | Yes | Yes |
| Funnel Chart | `FunnelChart.tsx` | Yes | Yes |
| Treemap | `Treemap.tsx` | Yes | Yes |
| Waterfall Chart | `WaterfallChart.tsx` | Yes | Yes |
| Gauge Chart | `GaugeChart.tsx` | Yes | Yes |
| Combo Chart | `ComboChart.tsx` | Yes | Yes |

### Statistical Charts (4)
| Visual | Component | Cross-Filter | Tests |
|--------|-----------|--------------|-------|
| Boxplot | `BoxplotChart.tsx` | Yes | Yes |
| Histogram | `HistogramChart.tsx` | Yes | Yes |
| Violin | `ViolinChart.tsx` | Yes | Yes |
| Regression Scatter | `RegressionScatterChart.tsx` | Yes | Yes |

### Tabular & Cards (5)
| Visual | Component | Cross-Filter | Tests |
|--------|-----------|--------------|-------|
| Data Table | `DataTable.tsx` | Yes | Yes |
| Matrix | `Matrix.tsx` | Yes | Yes |
| Multi-Row Card | `MultiRowCard.tsx` | N/A | Yes |
| KPI Card | `KPICard.tsx` | N/A | Yes |
| Slicer | `Slicer.tsx` | Yes | Yes |

### Geographic (1)
| Visual | Component | Cross-Filter | Tests |
|--------|-----------|--------------|-------|
| Map Chart | `MapChart.tsx` | Yes | Yes |

**Total: 25 visuals for submission**

---

## 1. General Test Cases

### 1.1 Conversion & Integration Tests
| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| GEN-001 | Convert from standard chart to custom visual without errors | :yellow_circle: | Need explicit conversion tests |
| GEN-002 | Convert back to standard chart without errors | :yellow_circle: | Need explicit conversion tests |

### 1.2 Interactivity Tests
| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| INT-001 | Selections in custom visual reflect in other visuals | :white_check_mark: | Covered in `recipes-highlight.spec.ts` |
| INT-002 | Other visual selections filter custom visual data | :white_check_mark: | Covered in cross-filtering tests |
| INT-003 | Ctrl key multi-select works correctly | :white_check_mark: | Covered in highlight tests |
| INT-004 | Alt key does not cause unexpected behavior | :red_circle: | **No Alt key tests** |
| INT-005 | Shift key does not cause unexpected behavior | :red_circle: | **No Shift key tests** |

### 1.3 Configuration Tests
| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| CFG-001 | Min/max dataViewMapping conditions respected | :yellow_circle: | Implicit in drop tests |
| CFG-002 | Remove fields in different orders - no errors | :red_circle: | **No field removal order tests** |
| CFG-003 | Format pane with all bucket configurations | :yellow_circle: | Partial coverage |
| CFG-004 | No null reference exceptions in format pane | :red_circle: | **No explicit null ref tests** |

### 1.4 Filtering Tests
| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| FLT-001 | Visual-level filter works correctly | :red_circle: | **No visual-level filter tests** |
| FLT-002 | Page-level filter works correctly | :red_circle: | **No page-level filter tests** |
| FLT-003 | Report-level filter works correctly | :red_circle: | **No report-level filter tests** |
| FLT-004 | Slicer filtering shows correct tooltips | :yellow_circle: | Slicer tests exist, tooltip validation needed |
| FLT-005 | Published visual selection shows filtered tooltips | :red_circle: | **No tooltip filter validation** |

### 1.5 Display & Rendering Tests
| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| DSP-001 | View mode: Actual size renders correctly | :red_circle: | **No view mode tests** |
| DSP-002 | View mode: Fit to page renders correctly | :red_circle: | **No view mode tests** |
| DSP-003 | View mode: Fit to width renders correctly | :red_circle: | **No view mode tests** |
| DSP-004 | Mouse coordinates accurate in all view modes | :red_circle: | **No coordinate accuracy tests** |
| DSP-005 | Visual resizing works correctly | :white_check_mark: | ResizeObserver implemented |
| DSP-006 | Minimum report size displays without errors | :red_circle: | **No minimum size tests** |
| DSP-007 | Scroll bars appear correctly when needed | :red_circle: | **No scroll bar tests** |
| DSP-008 | Dashboard pinning displays properly | :red_circle: | **No dashboard pin tests** |
| DSP-009 | Multiple versions on same page work | :white_check_mark: | Covered in drop tests |
| DSP-010 | Multiple versions across pages work | :red_circle: | **No multi-page tests** |
| DSP-011 | Page switching preserves visual state | :white_check_mark: | Covered in persistence tests |

### 1.6 Editing & Viewing Tests
| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| EDV-001 | Reading view functionality works | :red_circle: | **No reading view tests** |
| EDV-002 | Edit view functionality works | :white_check_mark: | Primary test mode |
| EDV-003 | Animation add/change/delete operations | :red_circle: | **No animation tests** |
| EDV-004 | Property pane toggle on/off works | :yellow_circle: | Properties panel exists |
| EDV-005 | Custom text handling in properties | :yellow_circle: | Partial coverage |
| EDV-006 | Bad data handling in properties | :red_circle: | **No bad data in props tests** |

### 1.7 Persistence Tests
| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| PER-001 | Save and reopen preserves all properties | :white_check_mark: | Covered in `persistence.spec.ts` |
| PER-002 | Switch pages and return preserves properties | :white_check_mark: | Covered in persistence tests |

### 1.8 Data Handling Tests
| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| DAT-001 | Numeric values display correctly | :white_check_mark: | Covered |
| DAT-002 | Text/character data displays correctly | :white_check_mark: | Covered |
| DAT-003 | Date and datetime display correctly | :white_check_mark: | Covered |
| DAT-004 | Different format strings work | :yellow_circle: | Partial coverage |
| DAT-005 | Thousands of rows perform acceptably | :yellow_circle: | Need explicit perf tests |
| DAT-006 | Single row displays correctly | :red_circle: | **No single row tests** |
| DAT-007 | Two rows display correctly | :red_circle: | **No two row tests** |
| DAT-008 | Null values handled gracefully | :red_circle: | **No null value tests** |
| DAT-009 | Infinity values handled gracefully | :red_circle: | **No infinity tests** |
| DAT-010 | Negative values handled correctly | :yellow_circle: | Implicit in some tests |
| DAT-011 | Wrong value types handled gracefully | :red_circle: | **No type error tests** |

### 1.9 Formatting Tests
| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| FMT-001 | Tooltip values formatted correctly | :white_check_mark: | Tooltips implemented |
| FMT-002 | Axis labels formatted correctly | :white_check_mark: | Axes implemented |
| FMT-003 | Data labels formatted correctly | :white_check_mark: | Labels implemented |
| FMT-004 | Zero decimal places displays correctly | :red_circle: | **No explicit decimal tests** |
| FMT-005 | Three decimal places displays correctly | :red_circle: | **No explicit decimal tests** |
| FMT-006 | Auto-formatting toggle works | :red_circle: | **No auto-format tests** |

---

## 2. Browser Testing Requirements

### 2.1 Windows Browsers
| Requirement | Browser | Status | Gap |
|-------------|---------|--------|-----|
| BRW-001 | Chrome (current version) | :yellow_circle: | Dev testing only |
| BRW-002 | Chrome (previous version) | :red_circle: | **No version matrix** |
| BRW-003 | Firefox (current version) | :red_circle: | **No Firefox tests** |
| BRW-004 | Firefox (previous version) | :red_circle: | **No Firefox tests** |
| BRW-005 | Edge (current version) | :red_circle: | **No Edge tests** |
| BRW-006 | Edge (previous version) | :red_circle: | **No Edge tests** |

### 2.2 macOS Browsers
| Requirement | Browser | Status | Gap |
|-------------|---------|--------|-----|
| BRW-007 | Chrome (previous version) | :red_circle: | **No macOS tests** |
| BRW-008 | Firefox (previous version) | :red_circle: | **No macOS tests** |
| BRW-009 | Safari (previous version) | :red_circle: | **No Safari tests** |

### 2.3 Mobile Browsers
| Requirement | Browser | Status | Gap |
|-------------|---------|--------|-----|
| BRW-010 | iOS Safari iPad | :red_circle: | **No mobile tests** |
| BRW-011 | iOS Chrome iPad | :red_circle: | **No mobile tests** |
| BRW-012 | Android Chrome | :red_circle: | **No mobile tests** |

---

## 3. Performance Testing Requirements

| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| PRF-001 | Many visual elements - no freezing | :yellow_circle: | useMemo implemented, no explicit tests |
| PRF-002 | Animation speed is smooth | :red_circle: | **No animation perf tests** |
| PRF-003 | Resizing has no lag | :white_check_mark: | ResizeObserver optimized |
| PRF-004 | Filtering is responsive | :yellow_circle: | Cross-filter works, no perf metrics |
| PRF-005 | Selection is responsive | :white_check_mark: | Click handlers optimized |
| PRF-006 | No console errors during operation | :yellow_circle: | Some tests check, not comprehensive |

---

## 4. UI & Branding Requirements

| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| UIB-001 | Context menu enabled (right-click) | :red_circle: | **No context menu implementation** |
| UIB-002 | Logo only in edit mode (if applicable) | :white_check_mark: | N/A - no logo |
| UIB-003 | Logo is grey (#C8C8C8) only | :white_check_mark: | N/A - no logo |
| UIB-004 | No logo in view/reading mode | :white_check_mark: | N/A - no logo |

---

## 5. Accessibility Requirements

| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| A11Y-001 | High contrast mode support | :yellow_circle: | Theme palettes exist, needs HC mode |
| A11Y-002 | Keyboard navigation for selections | :red_circle: | **Mouse-only selection** |
| A11Y-003 | Screen reader support (ARIA labels) | :red_circle: | **No ARIA labels on charts** |
| A11Y-004 | Focus indicators visible | :red_circle: | **No focus indicators** |
| A11Y-005 | Color-blind friendly palettes | :white_check_mark: | Multiple palettes available |

---

## 6. Code Quality & API Requirements

| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| API-001 | Latest powerbi-visuals-api | :yellow_circle: | Using Recharts, not native API |
| API-002 | No unhandled exceptions | :yellow_circle: | Error boundaries needed |
| API-003 | Document supported features | :white_check_mark: | This document |
| API-004 | License key field at top of format pane | :white_check_mark: | N/A - no license |

---

## 7. Desktop Testing Requirements

| Requirement | Description | Status | Gap |
|-------------|-------------|--------|-----|
| DSK-001 | All features work in Power BI Desktop | :red_circle: | **No Desktop integration tests** |
| DSK-002 | Import workflow succeeds | :white_check_mark: | PBIP export tested |
| DSK-003 | Save workflow succeeds | :white_check_mark: | Persistence tested |
| DSK-004 | Publish workflow succeeds | :red_circle: | **No publish tests** |

---

## Gap Analysis Summary

### Critical Gaps (Must Fix)
| Category | Gap | Priority |
|----------|-----|----------|
| Context Menu | No right-click context menu implementation | P0 |
| Accessibility | No keyboard navigation for chart selections | P0 |
| Accessibility | No ARIA labels on SVG charts | P0 |
| Data Handling | No null/infinity/bad data handling tests | P0 |
| Filtering | No visual/page/report level filter tests | P1 |

### High Priority Gaps
| Category | Gap | Priority |
|----------|-----|----------|
| Modifier Keys | No Alt/Shift key behavior tests | P1 |
| View Modes | No reading view / view mode tests | P1 |
| Edge Cases | No single row / two row data tests | P1 |
| Formatting | No decimal precision tests | P1 |
| Browser | No cross-browser test matrix | P1 |

### Medium Priority Gaps
| Category | Gap | Priority |
|----------|-----|----------|
| Performance | No explicit performance benchmarks | P2 |
| Animation | No animation tests | P2 |
| Scroll Bars | No scroll behavior tests | P2 |
| Mobile | No mobile browser tests | P2 |

---

## Recommended Test Additions

### Phase 1: Critical (Pre-Submission Blockers)
```typescript
// e2e/context-menu.spec.ts
- Test right-click context menu appears on all visuals
- Test context menu actions work correctly

// e2e/accessibility.spec.ts
- Test keyboard Tab navigation between chart elements
- Test Enter/Space key selection
- Test ARIA labels present on all chart SVGs
- Test focus indicators visible

// e2e/data-edge-cases.spec.ts
- Test null values in all fields
- Test Infinity values
- Test NaN values
- Test single row datasets
- Test two row datasets
- Test empty datasets
```

### Phase 2: High Priority
```typescript
// e2e/modifier-keys.spec.ts
- Test Alt+Click does not break selection
- Test Shift+Click behavior (range select or no-op)

// e2e/view-modes.spec.ts
- Test reading view renders correctly
- Test all zoom levels (actual, fit page, fit width)

// e2e/filter-levels.spec.ts
- Test visual-level filters
- Test page-level filters
- Test report-level filters

// e2e/formatting.spec.ts
- Test 0 decimal places
- Test 3 decimal places
- Test currency formats
- Test percentage formats
```

### Phase 3: Medium Priority
```typescript
// e2e/performance.spec.ts
- Benchmark render time with 10K rows
- Benchmark cross-filter response time
- Benchmark resize response time

// e2e/browser-matrix.spec.ts
- Configure Playwright for Chrome, Firefox, Edge, Safari
- Run full suite on each browser

// e2e/mobile.spec.ts
- Test touch interactions
- Test responsive layouts on tablet/phone viewports
```

---

## Current Test Coverage

| Category | Tests | Coverage |
|----------|-------|----------|
| Visual Rendering | 25 visuals | 100% |
| Cross-Filtering | All charts | 95% |
| Variant Picker | 5 variant types | 100% |
| Statistical Calcs | 4 libraries | 100% |
| Persistence | Save/Load | 90% |
| Export (PBIP) | Schema + DAX | 85% |
| **Accessibility** | - | **0%** |
| **Context Menu** | - | **0%** |
| **Edge Case Data** | - | **10%** |
| **Browser Matrix** | Chrome only | **17%** |
| **Mobile** | - | **0%** |

---

## Next Steps

1. **Implement context menu** on all visuals (required for submission)
2. **Add ARIA labels** to all chart SVG containers
3. **Add keyboard navigation** for chart element selection
4. **Create edge case test suite** for null/infinity/bad data
5. **Configure multi-browser Playwright** matrix
6. **Add view mode tests** (reading view, zoom levels)
7. **Performance benchmarking** with large datasets
