# Phantom - Product Requirements Document

**Version:** 2.0
**Status:** In Development (Phase 2)
**Last Updated:** January 2026

---

## Executive Summary

Phantom is a web-based "Micro-BI" prototyping tool that enables consultants and analysts to generate interactive dashboard prototypes in seconds. Unlike static design tools (Figma) or heavy engineering solutions (Power BI Desktop), Phantom populates charts with mathematically consistent fake data that supports cross-filtering and drill-down interactions out of the box.

**Core Value Proposition:** *"Looks like Power BI, works like magic."*

**Vision:** Curated Power BI template library with industry scenarios, exportable data models, best practice guidance, and a killer data engine for instant star schema generation.

---

## Architecture Overview

```
 PHANTOM — Micro-BI Prototyping Tool
 "Looks like Power BI, works like magic."

 Select a scenario, get a live dashboard with fake data, cross-filtering,
 and one-click export to a real Power BI project (PBIP).

 ┌─────────────────────────────────────────────────────────────────────────┐
 │                                                                         │
 │   USER PICKS A STARTING POINT                                           │
 │                                                                         │
 │   ┌──────────────┐    ┌──────────────────────────────────────────────┐  │
 │   │  Scenario     │    │  Template Library (8 pre-built dashboards)  │  │
 │   │  Selector     │    │                                             │  │
 │   │               │    │  Sales · Marketing · HR · Logistics         │  │
 │   │  Retail       │    │  Finance · IBCS · Social · Portfolio        │  │
 │   │  SaaS         │    │                                             │  │
 │   │  HR           │    │  Each template = scenario + pre-configured  │  │
 │   │  Logistics    │    │  visuals with layout positions              │  │
 │   │  Portfolio    │    └──────────────┬───────────────────────────────┘  │
 │   │  Social       │                   │                                  │
 │   └──────┬───────┘                   │                                  │
 │          │                            │                                  │
 │          ▼                            ▼                                  │
 │  ┌──────────────────────────────────────────────────────────────────┐   │
 │  │                                                                   │   │
 │  │   DATA ENGINE  (engine/dataGenerator.ts)                          │   │
 │  │                                                                   │   │
 │  │   Faker.js generates mathematically linked relational data:       │   │
 │  │                                                                   │   │
 │  │   ┌────────────────┐     ┌─────────────────┐                     │   │
 │  │   │  Dimensions     │     │  Facts            │                    │   │
 │  │   │                 │     │                   │                    │   │
 │  │   │  Store          │◄────│  Sale             │                    │   │
 │  │   │  Product        │◄────│   ├ revenue       │                    │   │
 │  │   │  Customer       │     │   ├ revenuePL     │  AC/PL/PY         │   │
 │  │   │  Employee       │     │   ├ revenuePY     │  variance         │   │
 │  │   │  Entity (ESG)   │     │   ├ profit        │  fields for       │   │
 │  │   │  ...            │     │   └ quantity      │  IBCS reporting   │   │
 │  │   └────────────────┘     └─────────────────┘                     │   │
 │  │                                                                   │   │
 │  └──────────────────────────────┬───────────────────────────────────┘   │
 │                                  │                                       │
 │                                  ▼                                       │
 │  ┌──────────────────────────────────────────────────────────────────┐   │
 │  │                                                                   │   │
 │  │   ZUSTAND STORE  (store/useStore.ts)                              │   │
 │  │                                                                   │   │
 │  │   Single source of truth for the entire application:              │   │
 │  │                                                                   │   │
 │  │   ┌─────────────┐ ┌──────────────┐ ┌──────────────────────────┐  │   │
 │  │   │  Data        │ │  Filters      │ │  Dashboard Items         │  │   │
 │  │   │              │ │               │ │                          │  │   │
 │  │   │  stores[]    │ │  { column:    │ │  [{ id, type, title,    │  │   │
 │  │   │  products[]  │ │    value }    │ │     layout: {x,y,w,h},  │  │   │
 │  │   │  sales[]     │ │               │ │     props }]            │  │   │
 │  │   │  customers[] │ │  Applied to   │ │                          │  │   │
 │  │   │  employees[] │ │  ALL visuals  │ │  20+ visual types        │  │   │
 │  │   │  shipments[] │ │  via useMemo  │ │  supported               │  │   │
 │  │   │  entities[]  │ │               │ │                          │  │   │
 │  │   └─────────────┘ └──────────────┘ └──────────────────────────┘  │   │
 │  │                                                                   │   │
 │  │   + selectedItemId, scenario, theme                               │   │
 │  │                                                                   │   │
 │  └──────────────────────────────┬───────────────────────────────────┘   │
 │                                  │                                       │
 │                    ┌─────────────┴─────────────┐                        │
 │                    ▼                           ▼                         │
 │  ┌────────────────────────────┐  ┌──────────────────────────────────┐  │
 │  │                             │  │                                   │  │
 │  │   INTERACTIVE UI            │  │   EXPORT PIPELINE                 │  │
 │  │                             │  │   (export/)                       │  │
 │  │                             │  │                                   │  │
 │  │  ┌───────────────────────┐  │  │   Store state is converted to    │  │
 │  │  │ AppShell              │  │  │   a native Power BI project:     │  │
 │  │  │ ┌──────────────────┐  │  │  │                                   │  │
 │  │  │ │ Top Bar           │  │  │  │   ┌─────────────────────────┐    │  │
 │  │  │ │ File|Tmpl|Export  │  │  │  │   │ schemaGenerator.ts      │    │  │
 │  │  │ └──────────────────┘  │  │  │   │                         │    │  │
 │  │  │ ┌────┬──────────┬──┐  │  │  │   │ Defines star schema     │    │  │
 │  │  │ │Nav │  Canvas   │Rt│  │  │  │   │ per scenario: tables,   │    │  │
 │  │  │ │    │          │  │  │  │  │   │ columns, relationships  │    │  │
 │  │  │ │ ┌──┤ 24-col   │  │  │  │  │   └───────────┬─────────────┘    │  │
 │  │  │ │ │  │ grid     │Fld│  │  │  │               │                  │  │
 │  │  │ │ │  │          │ / │  │  │  │   ┌───────────▼─────────────┐    │  │
 │  │  │ │ │  │ Drag &   │Pro│  │  │  │   │ daxGenerator.ts         │    │  │
 │  │  │ │ │  │ resize   │ps │  │  │  │   │                         │    │  │
 │  │  │ │ │  │ visuals  │   │  │  │  │   │ Scans dashboard items   │    │  │
 │  │  │ │ └──┤          │   │  │  │  │   │ → generates DAX for     │    │  │
 │  │  │ │    ├──────────┤   │  │  │  │   │   Sum, Avg, Count,      │    │  │
 │  │  │ │    │Viz Picker│   │  │  │  │   │   Variance, etc.        │    │  │
 │  │  │ │    ├──────────┤   │  │  │  │   └───────────┬─────────────┘    │  │
 │  │  │ │    │FFMA Panel│   │  │  │  │               │                  │  │
 │  │  │ └────┴──────────┴──┘  │  │  │   ┌───────────▼─────────────┐    │  │
 │  │  └───────────────────────┘  │  │   │ layoutConverter.ts       │    │  │
 │  │                             │  │   │                         │    │  │
 │  │  CROSS-FILTERING LOOP:     │  │   │ Grid coords → PBI pixel  │    │  │
 │  │                             │  │   │ positions + visual.json   │    │  │
 │  │  Click chart segment        │  │   │ query bindings            │    │  │
 │  │    │                        │  │   └───────────┬─────────────┘    │  │
 │  │    ▼                        │  │               │                  │  │
 │  │  setFilter(col, val)        │  │               ▼                  │  │
 │  │    │                        │  │   ┌─────────────────────────┐    │  │
 │  │    ▼                        │  │   │  PBIP OUTPUT             │    │  │
 │  │  Zustand store updates      │  │   │                         │    │  │
 │  │    │                        │  │   │  Project.pbip            │    │  │
 │  │    ▼                        │  │   │  ├─ Report/              │    │  │
 │  │  ALL visuals re-render      │  │   │  │  └─ visuals/*.json   │    │  │
 │  │  with filtered data         │  │   │  └─ SemanticModel/      │    │  │
 │  │    │                        │  │   │     ├─ model.tmdl       │    │  │
 │  │    ▼                        │  │   │     └─ tables/*.tmdl    │    │  │
 │  │  Click again = clear        │  │   │                         │    │  │
 │  │                             │  │   │  Opens in PBI Desktop    │    │  │
 │  └────────────────────────────┘  │   └─────────────────────────┘    │  │
 │                                   │                                   │  │
 │                                   └──────────────────────────────────┘  │
 │                                                                         │
 │  TECH STACK                                                             │
 │  React 18 + TypeScript + Vite | Fluent UI v9 | Recharts | Zustand      │
 │  react-grid-layout | Faker.js v10 | TMDL + PBIP native format          │
 │                                                                         │
 │  9 COLOR PALETTES                                                       │
 │  PBI Default · Ocean · Forest · Sunset · Mono · Corporate              │
 │  Zebra (IBCS) · Social · Portfolio                                      │
 │                                                                         │
 │  6 SCENARIOS           20+ VISUAL TYPES         8 TEMPLATES             │
 │  Retail · SaaS         Bar · Column · Line      Sales · Marketing       │
 │  HR · Logistics        Area · Pie · Donut       HR · Logistics          │
 │  Portfolio · Social    Scatter · Funnel          Finance · IBCS          │
 │                        Treemap · Gauge           Social · Portfolio      │
 │                        Waterfall · Table                                 │
 │                        Matrix · Card · Slicer                            │
 │                        + 9 Portfolio visuals                             │
 │                                                                         │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## Objectives

### Primary Goals
1. Enable rapid dashboard prototyping without real data connections
2. Deliver Power BI-like interactivity (cross-filtering, drill-down) instantly
3. Provide pixel-perfect UI fidelity to Power BI Service
4. Export working PBIP projects with star schema and DAX measures
5. Curate industry-specific scenario templates with best practice layouts

### Success Metrics (MVP)
- [x] User can select a business scenario and get immediate fake data
- [x] User can arrange 6+ visual types on a drag-and-drop canvas
- [x] Cross-filtering works between all visuals
- [x] UI is indistinguishable from Power BI Service at first glance
- [x] Export to PBIP with star schema and positioned visuals

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
| Data | Faker.js v10 | Realistic fake data generation |
| Testing | Playwright | E2E and screenshot testing |

### Project Structure
```
src/
├── components/
│   ├── AppShell.tsx            # Main layout shell (top bar, nav, panes)
│   ├── Canvas.tsx              # Grid-based visual canvas with drag-drop
│   ├── VisualContainer.tsx     # Wrapper for all visuals
│   ├── PropertiesPanel.tsx     # Edit panel for selected visuals
│   ├── FieldsPane.tsx          # Right sidebar - data fields
│   ├── VisualizationsPane.tsx  # Bottom panel - visual picker
│   ├── ExportButton.tsx        # Export dropdown (PBIP, JSON)
│   ├── FFMAPanel.tsx           # FFMA reporting language widgets
│   ├── ColorPicker.tsx         # Theme/palette selector
│   ├── BarChart.tsx            # Bar/column charts
│   ├── StackedBarChart.tsx     # Stacked bar
│   ├── ClusteredColumnChart.tsx # Clustered column
│   ├── StackedColumnChart.tsx  # Stacked column
│   ├── LineChart.tsx           # Time-series line
│   ├── AreaChart.tsx           # Area chart
│   ├── PieChart.tsx            # Pie chart
│   ├── DonutChart.tsx          # Donut chart
│   ├── ScatterChart.tsx        # Scatter plot
│   ├── FunnelChart.tsx         # Funnel chart
│   ├── Treemap.tsx             # Treemap
│   ├── GaugeChart.tsx          # Gauge/radial
│   ├── WaterfallChart.tsx      # Waterfall bridge
│   ├── DataTable.tsx           # Data table view
│   ├── Matrix.tsx              # Cross-tabulation matrix
│   ├── KPICard.tsx             # Single-value KPI card
│   ├── MultiRowCard.tsx        # Multi-row card
│   ├── Slicer.tsx              # Dropdown filter control
│   └── portfolio/              # ESG portfolio monitoring visuals
│       ├── PortfolioHeader.tsx
│       ├── PortfolioHeaderBar.tsx
│       ├── PortfolioKPICard.tsx
│       ├── PortfolioKPICards.tsx
│       ├── ControversyBarChart.tsx
│       ├── ControversyDetailTable.tsx
│       ├── ControversyBottomPanel.tsx
│       ├── EntitySourceTable.tsx
│       ├── DateRangePicker.tsx
│       └── JustificationSearch.tsx
├── engine/
│   └── dataGenerator.ts        # Fake data generation (6 scenarios)
├── export/
│   ├── index.ts                # Export entry point
│   ├── schemaGenerator.ts      # Star schema definitions per scenario
│   ├── daxGenerator.ts         # DAX measure extraction from visuals
│   ├── pbitWriter.ts           # PBIP file assembly
│   └── layoutConverter.ts      # Phantom layout → PBI visual positions
├── store/
│   ├── useStore.ts             # Main Zustand store (data, filters, items)
│   ├── useThemeStore.ts        # Color palette/theme state
│   └── templates.ts            # Pre-built dashboard templates (8)
└── types/
    └── index.ts                # TypeScript interfaces
```

---

## Feature Requirements

### 1. Data Engine ("Phantom Engine")

#### FR-1.1: Scenario Selection
Users select a business scenario from the top bar. Each generates linked relational data:

| Scenario | Dimensions | Measures | Rows |
|----------|------------|----------|------|
| **Retail** | Store, Region, Product, Category | Revenue, Profit, Quantity + PL/PY variants | 1000 sales |
| **SaaS** | Customer, Tier, Region | MRR, Churn, LTV + PL/PY variants | 1000 subscriptions |
| **HR** | Employee, Department, Role | Salary, Rating, Attrition, Tenure | 200 employees |
| **Logistics** | Origin, Destination, Carrier | Cost, Weight, On-Time | 500 shipments |
| **Portfolio** | Entity, Sector, Region, Source | Market Value, Controversy Score, Score Change | Multiple entities |
| **Social** | (Uses Retail schema as base) | Revenue, Profit, Quantity | 1000 sales |

#### FR-1.2: Relational Data Integrity
The engine generates linked tables in star schema format:
- **Dimensions:** Entities with attributes (e.g., Stores with Region/Country)
- **Facts:** Transactions linked via foreign keys (e.g., Sales → StoreID, ProductID)
- **Variance fields:** AC (Actual), PL (Plan), PY (Prior Year) for IBCS reporting

#### FR-1.3: Filter State Management
Global Zustand store accepts filter payloads:
```typescript
{ column: 'Region', value: 'North America' }
```
All visuals subscribe and re-render on filter changes. Toggle behavior: clicking same element again clears the filter.

---

### 2. Canvas & Layout

#### FR-2.1: Grid-Based Canvas
- 24-column responsive grid
- 40px row height
- Elements snap to grid on drag/resize
- Vertical compaction enabled

#### FR-2.2: Visual Containers
Every visual wrapped in a container with:
- Draggable header (title bar)
- Resize handles (corners/edges)
- Selection state (blue border `#0078D4`)
- Delete capability

#### FR-2.3: Drag-to-Canvas
Users drag visual types from the Visualizations Pane onto the canvas:
- Visual appears at drop coordinates
- Default size is 4x4 grid units
- Auto-populated with scenario data

---

### 3. Visualization Library

#### Full Visual Library (20+ types)

| Visual | Status | Cross-Filter | Notes |
|--------|--------|--------------|-------|
| KPI Card | Done | Receiver | Sum, Avg, Count operations |
| Multi-Row Card | Done | Receiver | Multiple metrics |
| Bar Chart | Done | Source + Receiver | Horizontal bars |
| Clustered Column | Done | Source + Receiver | Vertical grouped |
| Stacked Bar | Done | Source + Receiver | Horizontal stacked |
| Stacked Column | Done | Source + Receiver | Vertical stacked |
| Line Chart | Done | Source + Receiver | Time-series |
| Area Chart | Done | Source + Receiver | Filled time-series |
| Pie Chart | Done | Source + Receiver | Standard pie |
| Donut Chart | Done | Source + Receiver | Ring chart |
| Scatter Chart | Done | Source + Receiver | XY plot |
| Funnel Chart | Done | Source + Receiver | Conversion funnel |
| Treemap | Done | Source + Receiver | Hierarchical area |
| Gauge Chart | Done | Receiver | Radial gauge |
| Waterfall Chart | Done | Source + Receiver | Bridge/variance |
| Data Table | Done | Receiver | Row display |
| Matrix | Done | Receiver | Cross-tabulation |
| Slicer | Done | Source | Dropdown filter |
| Portfolio Visuals | Done | Mixed | 9 specialized ESG components |

#### FR-3.1: Chart Theming
- 9 built-in color palettes:
  1. Power BI Default
  2. Ocean
  3. Forest
  4. Sunset
  5. Monochrome
  6. Corporate
  7. Zebra (IBCS)
  8. Social
  9. Portfolio
- Real-time palette switching via dropdown
- Consistent colors across all visuals
- 8 colors per palette

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

#### FR-4.2: Visual Selection & Properties
- Click visual → blue border selection state
- Properties Panel opens in right pane showing:
  - Title editing
  - Dimension/metric binding
  - Visual-specific properties

---

### 5. Export System

#### FR-5.1: PBIP Export (Power BI Project)
Exports a complete Power BI Project folder structure:

```
PhantomRetail.pbip                    # Project manifest
PhantomRetail.Report/
  definition.pbir                     # Report binding
  definition/
    report.json                       # Report settings, theme
    pages/
      page1/
        page.json                     # Page config
        visuals/
          chart1/visual.json          # Each visual with position + query bindings
          card1/visual.json
          ...
  StaticResources/
    SharedResources/
      BaseThemes/CY25SU12.json        # Power BI base theme
PhantomRetail.SemanticModel/
  definition.pbism                    # Model binding
  definition/
    model.tmdl                        # Tabular model (tables, relationships)
    database.tmdl                     # Database config
    tables/
      Store.tmdl                      # Dimension table definitions
      Product.tmdl
      Sale.tmdl                       # Fact table with DAX measures
    cultures/
      en-US.tmdl                      # Locale config
  diagramLayout.json                  # Model diagram positions
```

Key capabilities:
- Star schema with dimension/fact tables and relationships
- TMDL format semantic model (native Power BI developer format)
- Positioned visuals with query bindings to semantic model
- DAX measures auto-generated from dashboard visual configurations
- Opens directly in Power BI Desktop

#### FR-5.2: JSON Export
Downloads dashboard configuration as JSON for backup/sharing.

#### FR-5.3: PNG Export
Screenshot export (planned).

---

### 6. Template System

Pre-built dashboard templates for quick-start:

| Template | Scenario | Visuals | Key Features |
|----------|----------|---------|--------------|
| Sales | Retail | 7 | Slicer, KPI cards, Bar, Pie, Line |
| Marketing | SaaS | 7 | MRR, LTV, Churn, Funnel |
| HR Attrition | HR | 7 | Department filter, ratings pie |
| Logistics Supply Chain | Logistics | 7 | Carrier breakdown, On-Time %, Matrix |
| Finance | Retail | 7 | P&L Matrix, Waterfall bridges, Multi-row card |
| IBCS (Zebra) | Retail | 7 | AC/PL/PY variance, IBCS standard colors |
| Social Media Sentiment | Social | 7 | Sentiment analysis |
| Portfolio | Portfolio | 9+ | ESG controversy scores, entity tracking |

---

### 7. UI Specifications

#### Shell Colors (Power BI Fidelity)
| Element | Color |
|---------|-------|
| Top Bar | `#252423` |
| Left Nav | `#F0F0F0` |
| Canvas Background | `#EAEAEA` |
| Visual Background | `#FFFFFF` |
| Borders | `#E1DFDD` |
| Selection | `#0078D4` |

#### Layout Regions
```
┌─────────────────────────────────────────────────────────┐
│  Top Bar (#252423) - File, Templates, Export, Share      │
├────┬──────────────────────────────────────────┬─────────┤
│ L  │                                          │ Right   │
│ e  │         Canvas (#EAEAEA)                 │ Pane    │
│ f  │    ┌─────────┐  ┌─────────┐             │         │
│ t  │    │ Visual  │  │ Visual  │             │Fields / │
│    │    └─────────┘  └─────────┘             │Props    │
│ N  │                                          │         │
│ a  ├──────────────────────────────────────────┤         │
│ v  │  Bottom Pane - Visualization Picker      │         │
├────┴──────────────────────────────────────────┤         │
│  FFMA Panel (toggle)                          │         │
└───────────────────────────────────────────────┴─────────┘
```

---

### 8. FFMA Panel
Side panel for FFMA reporting language widgets. Toggleable from left nav. Container structure exists; full language parser is future work.

---

## Development Phases

### Phase 1: "Proof of Magic" — Complete
**Goal:** Interactive dashboard with real cross-filtering and data generation

| Deliverable | Status |
|-------------|--------|
| Relational Data Generator (6 scenarios) | Done |
| Zustand Store with filtering | Done |
| 20+ chart types with cross-filtering | Done |
| KPI Cards (filtered, Sum/Avg/Count) | Done |
| Data Table (filtered) | Done |
| Theme/Color Picker (9 palettes) | Done |
| Slicer Component | Done |
| Line Chart | Done |
| Grid Layout (drag, resize, snap) | Done |
| Visual selection + Properties Panel | Done |

### Phase 2: "The Builder" — In Progress
**Goal:** User-created layouts and export

| Deliverable | Status |
|-------------|--------|
| react-grid-layout integration | Done |
| Visualizations Pane (drag to canvas) | Done |
| Add/remove visuals dynamically | Done |
| Visual selection & focus | Done |
| PBIP export with star schema | Done |
| JSON export | Done |
| 8 pre-built templates | Done |
| Properties Panel (title, dimension, metric) | Done |
| FFMA side panel | Done |
| Portfolio monitoring module | Done |
| Fields Pane (drag to chart axes) | TODO |
| Configure visual via field drag-drop | TODO |

### Phase 3: "The Polish"
**Goal:** Production-ready UI, sharing, and best practices

| Deliverable | Status |
|-------------|--------|
| Visual header icons (Focus, More) | TODO |
| Share button (read-only URL) | TODO |
| Export to image/PNG | TODO |
| Best practice guidance system | TODO |
| Chart editing (undo/redo) | TODO |
| FFMA reporting language parser | TODO |

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
| PBIP format changes across PBI versions | Medium | Pin to CY25SU12 schema version, test with latest Desktop |

---

## Appendix

### Key Dependencies
- `@fluentui/react-components`: ^9.x
- `@fluentui/react-icons`: ^2.x
- `react-grid-layout`: ^2.x
- `recharts`: ^3.x
- `zustand`: ^5.x
- `@faker-js/faker`: ^10.x
- `playwright`: ^1.x

### Reference Links
- [Fluent UI React v9 Docs](https://react.fluentui.dev/)
- [Recharts Documentation](https://recharts.org/)
- [react-grid-layout Guide](https://github.com/react-grid-layout/react-grid-layout)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
