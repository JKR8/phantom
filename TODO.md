# Phantom Goals

## Vision
Curated Standards for Power BI delivery. Phantom is a standards-driven prototyping tool that enforces repeatable, consultancy-grade dashboard outcomes. Pick a scenario, drop visuals, get an instantly professional result — then export a real PBIP project.

**Core loop:** Drop → Auto-populate → Shape → Refine → Export

## Recently Completed (January 2026)
- [x] Cross-highlighting (setHighlight; 40% opacity dimming; Ctrl+Click multi-select; slicers still filter)
- [x] Realistic data distributions (Pareto, log-normal, exponential decay, seeded PRNG, AR(1) + seasonal patterns)
- [x] Data volume: Retail 2000 sales / 30 stores / 80 products, SaaS 2400 subs / 150 customers, HR 300 employees
- [x] New data fields: discount (Sale), industry (Customer), arr/cac (Subscription), office (Employee)
- [x] 12 color palettes (added Warm Neutral, Industrial, Boardroom) + PBI semantic colors
- [x] Corrected Power BI Default palette (#118DFF primary, 10 colors)
- [x] PBIP export: visual formatting objects, Retail/Finance/Social DAX generators, extended DateTable
- [x] Bug fixes: Canvas isDirty on mount, ScatterChart memo deps, getMetricValue camelCase lookup

---

## PBIP Export (Critical Path)
**Goal:** Export a real PBIP project with a working semantic model and loadable data (point of difference).

- [x] Implement true PBIP output (folder-based project with `.pbip` manifest and `SemanticModel/` TMDL)
- [x] Include data pipeline so PBIP opens with data (embedded sample dataset in TMDL partitions)
- [ ] Validate PBIP opens in latest Power BI Desktop (automated + manual verification)
- [x] Ensure visual field bindings map to `Table[Column]` in PBIP report JSON
- [x] Replace PBIT placeholder references in UI/docs with PBIP language

**PBIP Validation Checklist (handoff-ready):**
- [ ] Open PBIP in Power BI Desktop (latest) for each template
- [ ] Refresh succeeds without errors
- [ ] Visuals render with data (no blank visuals)
- [ ] Cross-filtering works on at least one chart per page
- [ ] Exported layout matches Phantom grid positions

---

## Scenario Library Status (Target: 6–8 high-quality scenarios)
**Goal:** Each scenario has a curated template, valid data model, and verified PBIP export.

| Scenario | Template | Data Model | PBIP Export | Notes |
|---|---|---|---|---|
| Retail | Sales | ✅ | ⏳ | Baseline scenario |
| SaaS | Marketing | ✅ | ⏳ | Uses Customer/Subscription |
| HR | HR Attrition | ✅ | ⏳ | Employee facts |
| Logistics | Supply Chain | ✅ | ⏳ | Shipment facts |
| Social | Social Media Sentiment | ✅ | ⏳ | SocialPost fact |
| Portfolio | Portfolio Monitoring | ✅ | ⏳ | PortfolioEntity + ControversyScore |
| Finance (P&L) | Finance | ✅ | ⏳ | Dedicated Finance scenario + schema |
| IBCS / Zebra | Zebra (IBCS) | ✅ | ⏳ | Finance scenario (IBCS styling) |

Legend: ✅ ready, ⚠️ partial/misaligned, ⏳ pending PBIP verification

---

## Bug Fixes / QA (Add to backlog)
- [x] Fix metric lookup for camelCase fields (e.g. `SentimentScore`, `MarketValue`) so charts/cards don't show 0
- [x] Recompute Scatter chart when dimension/scenario data changes (memo deps)
- [x] Export table projections: include default columns when `props.columns` is undefined
- [x] Export field mapping: handle case-insensitive dimension names (e.g. `region` → `Region`)
- [ ] Resolve Fluent UI `mergeClasses` warnings in console (style composition)

---

## Testing & Validation
- [x] `npm run test:e2e -- --reporter=line` passes (drop/shape/refine + Social slice + PBIP table presence)
- [ ] Add PBIP Desktop verification notes/results per scenario

**Validation Log**
- 2026-01-28: `npm run test:e2e -- --reporter=line` (pass; console warnings from Fluent `mergeClasses` still present)

---

## Epic 1: Standards Pack (v1)
**Goal:** A locked set of opinionated defaults that govern every new visual — the core product, not a nice-to-have

A Standards Pack is what turns Phantom from "a grid with charts" into "curated consultancy delivery."

### 1a. Grid & Spacing Rules
- [x] 24-column snap grid with 40px row height
- [x] Snap-to-grid on drag and resize
- [ ] Enforce minimum gutter between visuals (e.g. 8px)
- [ ] Enforce minimum visual size (e.g. 3x2 grid units)
- [ ] Consistent padding inside visual containers

### 1b. Typography Scale
- [ ] Define title size hierarchy (page title > visual title > axis labels > data labels)
- [ ] Set KPI card prominence rules (large number, small label)
- [ ] Enforce axis label sizing per visual type
- [ ] Consistent font family and weight rules

### 1c. Color & Accessibility
- [x] 12 color palettes (PBI Default, Ocean, Forest, Sunset, Mono, Corporate, Zebra, Social, Portfolio, Warm Neutral, Industrial, Boardroom)
- [x] PBI semantic colors defined (good/neutral/bad/accent/gridlines/canvas/text)
- [x] Canvas background #F2F2F2, primary text #252423, gridlines #F3F2F1
- [x] Real-time palette switching
- [ ] WCAG AA contrast enforcement on all palette/background combinations
- [ ] Colorblind-safe validation for palette selections
- [ ] Consistent semantic colors (positive=green, negative=red, neutral=grey)

### 1d. Visual Defaults
- [ ] Default sorting per visual type (value desc for bar/column, chronological for line)
- [ ] Default data labels on/off per visual type
- [ ] Default number formatting rules (K/M for large values, % for rates, 1dp for averages)
- [ ] Default legend placement per visual type
- [ ] Default "Show Other" bucket when Top N < All

### 1e. Layout Archetypes
- [ ] Define 3 layout archetypes: Executive Summary / Diagnostic / Operational
- [ ] Executive: KPI row → main trend → supporting breakdown
- [ ] Diagnostic: filters → comparison charts → detail table
- [ ] Operational: dense KPIs → multi-chart grid → action list
- [ ] Map each template to its natural archetype

---

## Epic 2: Drop → Auto-populate → Shape → Refine
**Goal:** When a consultant drops a visual, it should instantly look workshop-ready

### 2a. Drop Behavior (must be instant)
- [x] Drag visual type from Visualizations Pane onto canvas
- [x] Snap to valid grid slot
- [x] Auto-populate with scenario data
- [ ] Bind to best available fields using semantic roles (see Epic 3)
- [ ] Render with Standards Pack defaults (sorting, labels, formatting)

### 2b. Quick Shape Strip
A minimal inline control strip that appears on drop — not a modal, not the full Properties Panel.

**Bar/Column Quick Shape:**
- [ ] (Awaiting Test) Bars control: 2 | 5 | 10 | All (Top N by selected measure + optional "Other" bucket)
- [ ] (Awaiting Test) Breakdown dropdown: recommended dimensions from scenario (Category → Product → Store, etc.)
- [ ] (Awaiting Test) Measure dropdown: recommended measures from scenario (Revenue / Profit / Quantity, etc.)
- [ ] (Awaiting Test) Sort toggle: value desc (default) / asc / alpha
- [ ] (Awaiting Test) "Show Other" toggle: on/off when Bars < All

**Card Quick Shape:**
- [ ] (Awaiting Test) Measure dropdown
- [ ] (Awaiting Test) Aggregation: Sum | Avg | Count | Min | Max
- [ ] Format: auto | K | M | % | #,##0

**Line/Area Quick Shape:**
- [ ] Time grain: Day | Week | Month | Quarter | Year
- [ ] Measure dropdown
- [ ] Comparison: None | PL | PY | Both

**Table Quick Shape:**
- [ ] Column picker (multi-select from scenario fields)
- [ ] Row limit: 10 | 25 | 50 | All

### 2c. Refine (Properties Panel — existing, extend)
- [x] Title editing
- [x] Dimension/metric binding
- [ ] Subtitle/description field
- [ ] Axis label density control
- [ ] Data labels on/off toggle
- [ ] Legend placement (top / bottom / right / none)
- [ ] Conditional formatting presets (e.g. red/green for variance)
- [ ] Number format override (K/M/%/#,##0)

---

## Epic 3: Semantic Layer (Field Binding Recipes)
**Goal:** Thin metadata layer so auto-population is consistently good, not random

### 3a. Semantic Roles
Tag every field in every scenario with a role so Phantom knows what to bind where.

- [ ] (Awaiting Test) Define role taxonomy: Time | Entity | Geography | Category | Measure | Identifier
- [ ] (Awaiting Test) Tag Retail fields (Date→Time, Store→Entity, Region→Geography, Category→Category, Revenue→Measure, etc.)
- [ ] (Awaiting Test) Tag SaaS fields (Date→Time, Customer→Entity, Region→Geography, Tier→Category, MRR→Measure, etc.)
- [ ] (Awaiting Test) Tag HR fields (Employee→Entity, Department→Category, Salary→Measure, Rating→Measure, etc.)
- [ ] (Awaiting Test) Tag Logistics fields (Date→Time, Origin→Geography, Carrier→Entity, Cost→Measure, etc.)
- [ ] (Awaiting Test) Tag Portfolio fields (Entity→Entity, Sector→Category, Region→Geography, MarketValue→Measure, etc.)
- [ ] (Awaiting Test) Tag Social fields (same as Retail base)

### 3b. Binding Recipes (per visual type)
Each visual type gets a recipe that picks defaults from available roles.

- [ ] (Awaiting Test) Bar/Column recipe: Category axis → best Category role (fallback Geography → Entity), Value → primary measure, Bars → 5, Sort → value desc
- [ ] (Awaiting Test) Line/Area recipe: X-axis → Time role, Value → primary measure, auto-detect grain
- [ ] (Awaiting Test) Pie/Donut recipe: Slices → best Category role, Value → primary measure, max 6 slices + Other
- [ ] (Awaiting Test) Card recipe: Value → primary measure, Aggregation → Sum
- [ ] (Awaiting Test) Table recipe: Columns → Entity + top 3 measures, Rows → 25
- [ ] (Awaiting Test) Funnel recipe: Stages → Category role, Value → primary measure
- [ ] (Awaiting Test) Scatter recipe: X → primary measure, Y → secondary measure, Size → tertiary measure
- [ ] (Awaiting Test) Treemap recipe: Group → Category role, Size → primary measure
- [ ] (Awaiting Test) Matrix recipe: Rows → Category, Columns → Time, Values → primary measure

### 3c. Recommended Fields Lists
- [ ] Per scenario, define ordered "recommended dimensions" list (best → fallback)
- [ ] Per scenario, define ordered "recommended measures" list (primary → secondary → tertiary)
- [ ] Surface these lists in Quick Shape dropdowns and Fields Pane

---

## Epic 4: Slot-Based Layouts
**Goal:** Standards-driven layout that goes beyond grid snap — visuals land in predefined slots

### 4a. Layout Mode Toggle
- [ ] (Awaiting Test) Add "Standard Layout" / "Free Layout" toggle to canvas toolbar
- [ ] (Awaiting Test) Free Layout = current behavior (grid snap, free placement)
- [ ] (Awaiting Test) Standard Layout = predefined slot regions that visuals snap into

### 4b. Slot Definitions
- [ ] (Awaiting Test) Define slot regions per archetype:
  - **Executive:** Header KPIs (row 0-2) → Main Trend (row 2-8) → Supporting Breakdown (row 8-13)
  - **Diagnostic:** Filter Bar (row 0-2) → Comparison Charts (row 2-8) → Detail Table (row 8-14)
  - **Operational:** Dense KPIs (row 0-3) → Multi-chart Grid (row 3-10) → Action List (row 10-14)
- [ ] (Awaiting Test) Visual highlight on slot regions during drag
- [ ] (Awaiting Test) Auto-size visual to fill the slot it's dropped into
- [ ] Allow slot overflow (visual spans two slots) in Free Layout

### 4c. Benefits
Slots solve: alignment perfection, consistent spacing, "it always looks pro," predictable exports.

---

## Epic 5: Data Engine
**Goal:** Generate DAX-powered sample data instantly in star schema format

### Tasks
- [x] Design star schema template architecture
- [x] Build fact table generator with configurable dimensions
- [x] Create dimension table auto-generation (Date, Product, Customer, etc.)
- [ ] Implement DAX measure library for common calculations
- [x] Build realistic data distribution algorithms (distributions.ts + seasonality.ts)
- [x] Create industry-specific data profiles (6 scenarios)
- [x] Export to Power BI (PBIP) with relationships intact

---

## Epic 6: Scenario Template Library
**Goal:** 5-8 well-curated industry scenario templates with standard data models

### Tasks
- [x] Identify 5-8 target industries/scenarios
- [x] Design standard scenario data model schema
- [x] Build template 1: Retail (Sales)
- [x] Build template 2: SaaS (Marketing)
- [x] Build template 3: HR (Attrition)
- [x] Build template 4: Logistics (Supply Chain)
- [x] Build template 5: Finance (P&L / Waterfall)
- [x] Build templates 6-8: IBCS (Zebra), Social, Portfolio
- [ ] Test PBIP export workflow for all templates (Desktop open + data load)
- [ ] Document template usage
- [ ] Map each template to a layout archetype (Epic 4)

---

## Epic 7: FFMA Reporting Language
**Goal:** Custom reporting language for mockups within FFMA

### Tasks
- [ ] Define FFMA reporting language syntax
- [ ] Build language parser
- [x] Create side folder container structure
- [ ] Implement exportable data model integration
- [ ] Write language documentation
- [ ] Build example mockups

---

## Epic 8: Chart Editing System
**Goal:** Individual chart customization for titles, sections, and values

### Tasks
- [x] Build chart title editing UI
- [ ] Build section editing capability
- [ ] Build value editing/override system
- [ ] Ensure edits persist across data refreshes
- [ ] Handle undo/redo for edits

---

## Next Sprint: "Drop → Shape → Refine" for 6 Core Visuals

**Sprint goal:** A consultant can drop any of the 6 core visuals onto the canvas and get a workshop-ready result with minimal shaping.

### Deliverables
- [ ] (Awaiting Test) Semantic roles for all 6 scenarios (Epic 3a)
- [ ] (Awaiting Test) Binding recipes for Bar, Column, Line, Pie, Card, Table (Epic 3b)
- [ ] (Awaiting Test) Top N / Bars control with "Other" bucket (Epic 2b)
- [ ] (Awaiting Test) Breakdown selector with recommended dims list (Epic 2b + 3c)
- [ ] (Awaiting Test) Measure selector with recommended measures list (Epic 2b + 3c)
- [ ] (Awaiting Test) Quick Shape strip UI for bar/column (Epic 2b)
- [ ] (Awaiting Test) Slot layouts for Executive + Diagnostic archetypes (Epic 4b)
- [ ] Fields Pane → drag to axes (existing TODO from PRD)

### Acceptance Test
In a live workshop, a consultant can:
1. Pick Retail scenario
2. Drag in Bar chart → instantly shows "Top 5 Categories by Revenue"
3. Click Bars: 2 → instantly shows top 2 categories + Other
4. Switch Breakdown from Category → Store → it still looks sane
5. Export to PBIP and open in Desktop with the same structure

---

## Success Metrics
- [ ] Standards Pack enforced on every new visual by default
- [ ] Drop → workshop-ready result with zero configuration
- [ ] Quick Shape strip enables "2 bars vs 5 bars" in one click
- [ ] Semantic roles drive consistent auto-binding across all scenarios
- [ ] Slot layouts produce alignment-perfect dashboards
- [ ] Data engine generates valid star schema in <30 seconds
- [x] 5+ industry templates complete and exportable
- [ ] FFMA reporting language documented and functional
- [x] Widgets auto-populate from scenario data models
- [ ] All chart types individually editable
- [ ] Acceptance test passes: Retail → Bar → Top 5 → reshape → export → opens in Desktop
