# Phantom - Product Requirements Document

**Version:** 1.1
**Status:** In Development
**Last Updated:** January 2025

---

## Executive Summary

Phantom is a web-based "Micro-BI" prototyping tool that enables consultants and analysts to generate interactive dashboard prototypes in seconds. Unlike static design tools (Figma) or heavy engineering solutions (Power BI Desktop), Phantom populates charts with mathematically consistent fake data that supports cross-filtering and drill-down interactions out of the box.

**Core Value Proposition:** *"Looks like Power BI, works like magic."*

---

## Objectives

### Primary Goals
1. Enable rapid dashboard prototyping without real data connections
2. Deliver Power BI-like interactivity (cross-filtering, drill-down) instantly
3. Provide pixel-perfect UI fidelity to Power BI Service

### Success Metrics (MVP)
- [ ] User can select a business scenario and get immediate fake data
- [ ] User can arrange 6+ visual types on a drag-and-drop canvas
- [ ] Cross-filtering works between all visuals
- [ ] UI is indistinguishable from Power BI Service at first glance

---

## User Personas

### Primary: The BI Consultant
- **Goal:** Sell dashboard concepts to clients in workshops
- **Needs:** Speed, clickability, ability to handle "what if?" questions
- **Pain Point:** Can't show interactive prototypes without building real dashboards

### Secondary: The Analyst
- **Goal:** Wireframe layouts before committing to DAX/ETL work
- **Needs:** Quick iteration, layout experimentation
- **Pain Point:** Too much upfront investment to test dashboard ideas

---

## Technical Architecture

### Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | React 18 + Vite | Fast development, HMR |
| Language | TypeScript | Type safety |
| UI System | Fluent UI v9 | Microsoft design fidelity |
| State | Zustand | Lightweight, cross-filtering logic |
| Charts | Recharts | Flexible, customizable visualizations |
| Layout | react-grid-layout v2 | Drag-and-drop canvas |
| Data | Faker.js v8+ | Realistic fake data generation |

### Project Structure
```
src/
├── components/
│   ├── AppShell.tsx        # Main layout shell
│   ├── Canvas.tsx          # Grid-based visual canvas
│   ├── VisualContainer.tsx # Wrapper for all visuals
│   ├── BarChart.tsx        # Clustered bar chart
│   ├── DonutChart.tsx      # Donut/pie chart
│   ├── KPICard.tsx         # Single-value KPI card
│   ├── DataTable.tsx       # Matrix/table view
│   ├── LineChart.tsx       # Time-series chart (TODO)
│   ├── Slicer.tsx          # Dropdown filter (TODO)
│   ├── FieldsPane.tsx      # Right sidebar - data fields
│   ├── VisualizationsPane.tsx # Bottom panel - visual picker
│   └── ColorPicker.tsx     # Theme/palette selector
├── engine/
│   └── dataGenerator.ts    # Fake data generation
├── store/
│   ├── useStore.ts         # Main data & filter state
│   └── useThemeStore.ts    # Color palette state
└── types/
    └── index.ts            # TypeScript interfaces
```

---

## Feature Requirements

### 1. Data Engine ("Phantom Engine")

#### FR-1.1: Scenario Selection
Users select a business scenario on initialization:

| Scenario | Dimensions | Measures |
|----------|------------|----------|
| **Retail** | Store, Region, Product, Category | Sales, Profit, Quantity |
| **SaaS** | Customer, Tier, Region | MRR, Churn, LTV |

#### FR-1.2: Relational Data Integrity
The engine generates linked tables:
- **Dimensions:** Entities with attributes (e.g., Stores with Region/Country)
- **Facts:** Transactions linked via foreign keys (e.g., Sales → StoreID, ProductID)

#### FR-1.3: Filter State Management
Global store accepts filter payloads:
```typescript
{ column: 'Region', value: 'North America' }
```
All visuals subscribe and re-render on filter changes.

---

### 2. Canvas & Layout

#### FR-2.1: Grid-Based Canvas
- 12-column responsive grid
- Visible grid lines for alignment
- 40px row height
- Elements snap to grid on drag/resize

#### FR-2.2: Visual Containers
Every visual wrapped in a container with:
- Draggable header (title bar)
- Resize handles (corners/edges)
- Visual header icons (Focus, More Options) — cosmetic MVP

#### FR-2.3: Responsive Breakpoints
| Breakpoint | Columns | Min Width |
|------------|---------|-----------|
| lg | 12 | 1200px |
| md | 12 | 900px |
| sm | 6 | 600px |

---

### 3. Visualization Library

#### MVP Visuals ("Big 6")

| Visual | Status | Cross-Filter | Drill-Down |
|--------|--------|--------------|------------|
| KPI Card | ✅ Done | Receiver | — |
| Bar Chart | ✅ Done | Source + Receiver | TODO |
| Donut Chart | ✅ Done | Source + Receiver | TODO |
| Data Table | ✅ Done | Receiver | — |
| Line Chart | 🔲 TODO | Source + Receiver | Year→Quarter→Month |
| Slicer | 🔲 TODO | Source | — |

#### FR-3.1: Chart Theming
- 6 built-in color palettes (Power BI Default, Ocean, Forest, Sunset, Monochrome, Corporate)
- Real-time palette switching via dropdown
- Consistent colors across all visuals

---

### 4. Interactivity

#### FR-4.1: Cross-Filtering
```
User clicks "Electronics" on Donut Chart
  → Global filter: { Category: "Electronics" }
  → Bar Chart filters to Electronics only
  → KPI Cards recalculate sums
  → Table shows only Electronics rows
```

**Toggle behavior:** Clicking same element again clears the filter.

#### FR-4.2: Drill-Down (Phase 2)
Line chart supports hierarchy navigation:
- Year → Quarter → Month
- Toggle drill mode via button
- Breadcrumb shows current level

---

### 5. UI Specifications

#### Shell Colors (Power BI Fidelity)
| Element | Color |
|---------|-------|
| Top Bar | `#252423` |
| Left Nav | `#F0F0F0` |
| Canvas Background | `#EAEAEA` |
| Visual Background | `#FFFFFF` |
| Borders | `#E1DFDD` |

#### Layout Regions
```
┌─────────────────────────────────────────────────────┐
│  Top Bar (#252423) - File, Export, Share            │
├────┬────────────────────────────────────────┬───────┤
│ L  │                                        │ Right │
│ e  │         Canvas (#EAEAEA)               │ Pane  │
│ f  │    ┌─────────┐  ┌─────────┐           │       │
│ t  │    │ Visual  │  │ Visual  │           │Fields │
│    │    └─────────┘  └─────────┘           │Theme  │
│ N  │                                        │       │
│ a  ├────────────────────────────────────────┤       │
│ v  │  Bottom Pane - Visualization Picker    │       │
└────┴────────────────────────────────────────┴───────┘
```

---

## Development Phases

### Phase 1: "Proof of Magic" ✅ ~85% Complete
**Goal:** Hard-coded dashboard with real interactivity

| Deliverable | Status |
|-------------|--------|
| Relational Data Generator (Retail) | ✅ |
| Zustand Store with filtering | ✅ |
| Bar Chart with click-to-filter | ✅ |
| Donut Chart with click-to-filter | ✅ |
| KPI Cards (filtered) | ✅ |
| Data Table (filtered) | ✅ |
| Theme/Color Picker | ✅ |
| Slicer Component | 🔲 |
| Line Chart | 🔲 |

### Phase 2: "The Builder"
**Goal:** User-created layouts

| Deliverable | Status |
|-------------|--------|
| react-grid-layout integration | ✅ |
| Visualizations Pane (drag to canvas) | 🔲 |
| Fields Pane (drag to chart axes) | 🔲 |
| Add/remove visuals dynamically | 🔲 |

#### User Stories & Interaction Rules

**Story 2.1: Add Visual to Canvas**
- **User Action:** Drags a visual icon (e.g., Bar Chart) from the "Visualizations" pane onto the canvas grid.
- **System Behavior:**
  - Visual appears at the drop coordinates.
  - Default size is 4x4 grid units.
  - If dropped on top of another visual, it finds the nearest empty space or pushes others down (vertical compaction).
  - Visual is populated with default placeholder data (e.g., "Region" and "Sales") until configured.

**Story 2.2: Move & Resize Visuals**
- **User Action:** Drags the visual header to move; drags the bottom-right corner to resize.
- **System Behavior:**
  - Movement is constrained to the 12-column grid.
  - Resizing snaps to 40px row height intervals.
  - Visuals cannot be resized smaller than 2x2 units.
  - "Shadow" placeholder shows the final position during drag.

**Story 2.3: Remove Visual**
- **User Action:** Clicks the "More Options" (...) icon in the visual header and selects "Delete".
- **System Behavior:**
  - Visual is immediately removed from the canvas.
  - Store is updated; layout compacts vertically if "vertical compact" mode is enabled (optional for MVP).

**Story 2.4: Configure Visual via Drag-and-Drop**
- **User Action:** Drags a field (e.g., "Region") from the "Fields" pane and drops it onto a specific dropzone on the visual (e.g., "X-Axis" or "Legend").
- **System Behavior:**
  - Dropzone highlights when a compatible field is hovered over it.
  - On drop, the visual re-queries the data engine with the new dimension/measure.
  - Chart title updates to reflect the new field (e.g., "Sales by Region").

**Story 2.5: Visual Selection & Focus**
- **User Action:** Clicks on a visual's container (border or header).
- **System Behavior:**
  - Visual acquires a "Selected" state (blue border: `#0078D4`).
  - The "Fields" pane updates to show the configuration slots for *that specific* visual (e.g., selected Bar Chart shows "X-Axis", "Y-Axis", "Legend" slots).
  - Deselects any previously selected visual.


### Phase 3: "The Polish"
**Goal:** Production-ready UI and sharing

| Deliverable | Status |
|-------------|--------|
| Fluent UI styling overhaul | 🔲 |
| Visual header icons (Focus, More) | 🔲 |
| Share button (read-only URL) | 🔲 |
| Export to image/PDF | 🔲 |

---

## Technical Constraints

### Performance
- Cap data generation at **10,000 rows** to prevent browser memory issues
- Use `useMemo` for all aggregation computations
- Virtualize table rows if >100 displayed

### Browser Support
- Chrome 90+, Edge 90+, Firefox 90+, Safari 14+
- No IE11 support

### Accessibility
- Keyboard navigation for all interactive elements
- ARIA labels on charts
- Color contrast compliance (WCAG AA)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Recharts doesn't match PBI exactly | Medium | Custom CSS for tooltips, axes, fonts |
| Large datasets crash browser | High | Row limits, pagination, virtualization |
| Complex drill-down logic | Medium | Start with single-level, expand iteratively |

---

## Appendix

### Key Dependencies
- `@fluentui/react-components`: ^9.x
- `@fluentui/react-icons`: ^2.x
- `react-grid-layout`: ^2.x
- `recharts`: ^3.x
- `zustand`: ^5.x
- `@faker-js/faker`: ^10.x

### Reference Links
- [Fluent UI React v9 Docs](https://react.fluentui.dev/)
- [Recharts Documentation](https://recharts.org/)
- [react-grid-layout Guide](https://github.com/react-grid-layout/react-grid-layout)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
