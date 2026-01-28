# Phantom Research Brief

**For:** Research Team & Staff Engineer
**Date:** 2026-01-28
**Context:** Phantom is a web-based Micro-BI prototyping tool ("Looks like Power BI, works like magic"). It generates interactive dashboards with fake relational data, cross-filtering, and one-click export to Power BI PBIP projects. The core loop is Drop -> Auto-populate -> Shape -> Refine -> Export. The codebase has 7 scenarios, 9 templates, 20+ visual types, Supabase auth/persistence, and a PBIP export pipeline. This brief identifies what research and validation is needed to make the product world-class.

> **Status (January 2026):** Key areas from this brief have been addressed:
> - **Section 2 (Data Realism):** Implemented — `distributions.ts` and `seasonality.ts` with Pareto, log-normal, exponential decay, seasonal patterns. Data volumes increased.
> - **Section 4 (UX Fidelity):** Cross-highlighting with 40% opacity dimming implemented (replacing data removal). Canvas/text/gridline colors corrected.
> - **Known Bugs #1-#2:** Fixed (camelCase metric lookup, ScatterChart memo deps).
> - Palette count: 12 (was 9). Template count: 9 (unchanged).

---

## 1. PBIP Export Validation (Critical Path -- Highest Priority)

The PBIP export is Phantom's core differentiator. No competitor generates a working Power BI project from a browser-based prototype. This feature is implemented but **unvalidated against Power BI Desktop**.

### Research needed

**1a. Open each of the 9 templates' PBIP exports in Power BI Desktop (latest GA build)**
- Does the `.pbip` manifest load without errors?
- Do all visuals render with data (no blank panels)?
- Does data refresh succeed (the embedded M-language partitions)?
- Do cross-filters work on at least one chart pair per page?
- Do DAX measures calculate correctly (Sum, Avg, Count, Variance)?
- Do visual positions match what Phantom showed (grid-to-pixel fidelity)?

Document every failure per template. This is the single most important validation gate.

**1b. TMDL compatibility level**
- Phantom writes `compatibilityLevel: 1600`. Verify this matches the current Power BI Desktop expectation. Check if newer versions require 1605 or higher.
- Check whether TMDL format version 1.1.0 is current or if Desktop expects a newer schema.

**1c. Visual type mapping accuracy**
- Phantom maps its visual types to PBI types (e.g., `bar` -> `clusteredBarChart`, `table` -> `tableEx`, `matrix` -> `pivotTable`). These mappings are in `src/export/layoutConverter.ts`.
- Validate each mapping opens as the correct visual type in Desktop. Some may have changed name or require different `vcObjects` configuration.
- Pay special attention to: `waterfallChart`, `pivotTable` (matrix), `slicer`, `gauge`, and `treemapChart` -- these have historically had format changes between PBI versions.

**1d. Query binding format**
- Phantom generates `dataTransforms` in `visual.json` files that bind visuals to `Table[Column]` references.
- Validate the JSON structure matches what Power BI Desktop produces when you manually create these visuals. The best method: create the same visual in Desktop, save as PBIP, and diff the `visual.json` against Phantom's output.
- Specifically check: `projections`, `queryRef`, `active` states, and `selector` formatting.

**1e. Relationship direction and cardinality**
- Phantom defines one-to-many relationships in the schema (e.g., `Sales.StoreID -> Store.StoreID`). Verify the TMDL `relationship` declarations use the correct `fromColumn` / `toColumn` direction that PBI expects. Getting this backwards breaks all cross-filtering in Desktop.

**1f. M-language partition format**
- Each table embeds data via M-language partitions (JSON.FromValue). Verify:
  - PBI Desktop can evaluate these expressions
  - Row counts are within Desktop limits
  - Date columns parse correctly (ISO format vs locale-specific)
  - Decimal/currency fields don't lose precision

### Deliverable
A validation matrix: 9 templates x 6 checks, with pass/fail and error screenshots. This unblocks the entire export story.

---

## 2. Data Quality and Realism

The product generates fake data with Faker.js. For a BI consultant to use Phantom in client workshops, the data must look plausible at a glance. Current data is structurally correct but may not pass "does this look real?" scrutiny.

### Research needed

**2a. Statistical distribution audit**
- Current revenue values use `faker.number.float({ min: 10, max: 500 })` x quantity. This produces uniform distributions. Real retail data follows power-law / Pareto distributions (20% of products = 80% of revenue).
- Research realistic distribution patterns per scenario:
  - Retail: Pareto product revenue, seasonal time trends, regional concentration
  - SaaS: Log-normal MRR distribution, churning tail, tier-based pricing bands
  - HR: Bimodal salary by role seniority, department-size skew, tenure decay curve
  - Finance: Actual/Budget/Forecast with realistic variance bands (AC typically 85-115% of Budget)
  - Social: Power-law engagement (few viral posts, many low-engagement), sentiment skew by platform
- Goal: A consultant can show the dashboard to a client and the numbers "feel" right without anyone doing mental arithmetic.

**2b. Time-series patterns**
- Current data generates random dates within a range. Real business data has:
  - Weekday/weekend patterns (retail: spikes on weekends; SaaS: signups weekdays)
  - Monthly seasonality (retail Q4 spike, SaaS EOQ push)
  - Year-over-year growth trends (not random walk)
- Research what minimal patterns produce convincing line/area charts.

**2c. Dimension cardinality**
- 10 stores and 20 products may be too few for convincing bar charts (Top 5 out of 20 isn't very "top"). Research what minimum cardinalities per dimension make cross-filtering and Top-N feel realistic:
  - How many stores/products/categories does a typical retail dashboard show?
  - How many customers/tiers in a SaaS report?
  - What's the right number of finance accounts for a P&L?

**2d. Variance field realism (AC/PL/PY)**
- The Finance and IBCS templates use Actual vs Plan vs Prior Year. Currently these are generated with random variance bands. Research:
  - What does realistic budget variance look like? (e.g., Revenue AC = Budget +/- 5-15%, Cost = Budget +/- 3-8%)
  - How should PY relate to AC? (growth rate assumption: 5-15% YoY for healthy businesses)
  - What makes a waterfall bridge chart look convincing?

### Deliverable
A "Data Realism Spec" per scenario with recommended distribution parameters, seasonality patterns, and cardinality targets.

---

## 3. Competitive Landscape

### Research needed

**3a. Direct competitors**
Research and document the capabilities, pricing, and positioning of:
- **Figma/FigJam** with BI component libraries (how far can you get with static mockups?)
- **Power BI Paginated Reports Builder** (does Microsoft have any prototyping mode?)
- **Luzmo** (formerly Cumul.io) -- embedded analytics builder
- **Preset.io** (Superset-based cloud BI)
- **Evidence.dev** (code-first BI)
- **Count.co** (notebook + BI hybrid)
- **Sigma Computing** (spreadsheet-style BI)
- **Deepnote / Hex** (notebook-based analysis)

For each: Can they generate fake data? Do they export to Power BI? Do they support cross-filtering? How fast is time-to-first-dashboard?

**3b. Indirect competitors**
- **ChatGPT / Claude artifacts** -- users are generating dashboard mockups via AI. How does Phantom compete with "paste my schema, generate a dashboard"?
- **Copilot in Power BI** -- Microsoft's own AI assistant. Does it reduce the need for external prototyping?
- **PowerPoint + screenshots** -- the current "competitor" for most consultants. What makes Phantom 10x better?

**3c. Positioning gap analysis**
- What do BI consultants currently charge for dashboard design? ($2K-$20K per engagement)
- What's the workflow today? (Typically: client brief -> PowerPoint wireframe -> build in Desktop -> iterate)
- Where does Phantom insert itself? (Replace the wireframe step AND give a head start on the build step)
- What would make a consultant pay for this? (Time savings, client wow-factor, exportable starting point)

### Deliverable
A competitive matrix and positioning document. Identifies which features are table-stakes vs genuine differentiators.

---

## 4. UX and Design Fidelity

### Research needed

**4a. Power BI Service pixel-fidelity audit**
- Open Power BI Service (app.powerbi.com) side-by-side with Phantom. Document every visual difference:
  - Font family, weight, size for titles, axes, data labels, tooltips
  - Selection state styling (border width, color, shadow)
  - Visual container chrome (header height, padding, corner radius)
  - Canvas background color, grid lines
  - Slicer styling (dropdown vs chiclet vs range)
  - Top bar layout and icon treatment
- Goal: a non-expert shouldn't be able to tell Phantom from PBI Service in a screenshot.

**4b. Interaction fidelity audit**
- How does PBI Service handle cross-filtering visually? (dimming non-selected, highlight selected)
- How does PBI Service show filter state? (filter icons, visual header indicators)
- How does PBI Service handle tooltip flyovers?
- Phantom currently uses click-to-filter with full opacity changes. PBI uses a more nuanced "highlight" approach where non-filtered data dims but remains visible. Research the exact visual treatment.

**4c. Visual type rendering comparison**
For each of the 18 standard visual types, compare Phantom (Recharts) vs PBI Service:
- Axis formatting (tick marks, label rotation, date formatting)
- Legend position and formatting
- Data label placement
- Color application (single color vs gradient vs category colors)
- Empty state handling
- Error state handling
- Document the top 5 most noticeable differences that would break the "looks like Power BI" promise.

**4d. Responsive and viewport behavior**
- PBI Service has specific breakpoints for mobile, tablet, desktop. Phantom assumes 1280px minimum.
- Research: What viewport range do BI consultants typically use for workshops? (Projector resolution, Teams screen-share resolution, external monitor)
- Is 1280px the right baseline, or should it be 1920px?

### Deliverable
A visual diff document (annotated screenshots) with specific CSS/component fixes ranked by impact.

---

## 5. Standards Pack Research (Epic 1 in TODO.md)

The product vision positions "curated standards" as the core differentiation. Currently, standards are implicit. Research what makes them explicit and enforceable.

### Research needed

**5a. IBCS (International Business Communication Standards)**
- Phantom already has a Zebra/IBCS template. Research the full IBCS specification:
  - SAY: Message hierarchy (title, subtitle, annotation)
  - STRUCTURE: Layout patterns (comparison, structure, evolution)
  - SIMPLIFY: Declutter rules (remove gridlines, minimize axes)
  - CHECK: Validation rules
- Which IBCS rules can Phantom enforce automatically? Which require user judgment?
- What would an "IBCS compliance score" look like?

**5b. Power BI best practices (Microsoft's own guidelines)**
- Microsoft publishes dashboard design guidance. Research:
  - Recommended visual density per page (Microsoft says 5-8 visuals)
  - Information hierarchy (KPIs at top, detail at bottom)
  - Color usage limits (Microsoft says max 3-5 colors per page)
  - Accessibility requirements (alt text, reading order)
- Which of these can Phantom enforce?

**5c. Consultancy dashboard standards**
- Interview or research what major consultancies (McKinsey, Deloitte, PwC, Accenture) use as their internal BI standards:
  - McKinsey uses a specific chart formatting style (minimal, high-contrast)
  - Big 4 firms have brand-specific color palettes
  - What layout patterns recur across enterprise dashboards?
- Can Phantom offer "McKinsey style" / "Big 4 style" / "IBCS style" as Standards Pack presets?

**5d. Number formatting standards**
- Research locale-aware formatting:
  - US: $1,234.56 / 1,234 / 12.3%
  - EU: 1.234,56 EUR / 1.234 / 12,3%
  - When do you show K/M/B abbreviations vs full numbers?
  - What precision is appropriate for different metric types?
- Current formatting is hardcoded. What abstraction would make it configurable?

### Deliverable
A "Standards Pack v1 Spec" defining defaults for grid, typography, color, sorting, formatting, and layout archetype per template.

---

## 6. Architecture and Performance

### Research needed

**6a. Bundle size optimization**
- Faker.js is ~100KB gzipped and is imported at startup for every user, but only needed when generating data.
- Research: Can data generation be lazy-loaded or moved to a Web Worker?
- Can Recharts be tree-shaken so only used chart types are bundled?
- What's the current Lighthouse score? What would get it to 90+?

**6b. Large canvas performance**
- The Social template has 16 visuals. Portfolio has 9+ specialized visuals.
- At what visual count does the UI become sluggish? (50? 100?)
- Research: Would `react-window` or `react-virtualized` help for off-screen visuals?
- Would `React.memo` wrapping on visual components reduce re-renders during cross-filtering?
- Profile the cross-filter path: click bar segment -> store update -> how many components re-render?

**6c. Data table virtualization**
- DataTable component renders all rows up to `maxRows`. With 100+ rows and 10+ columns, this is expensive DOM.
- Research: Integrate `@tanstack/react-virtual` or Fluent UI's `DataGrid` for virtualized scrolling.
- What's the threshold where non-virtualized tables cause visible jank?

**6d. Export performance**
- PBIP export generates a ZIP in-memory via JSZip. For large dashboards with embedded data, this could be slow.
- Profile: How long does export take for each template? At what data size does it become noticeable?
- Research: Can export be moved to a Web Worker to avoid blocking the UI?

**6e. State management scale**
- Zustand is lightweight but the store holds ALL scenario data (all stores, products, sales, etc.) in memory simultaneously.
- Research: With 10,000 fact rows and 7 dimensions, what's the memory footprint?
- Would lazy data generation (generate only when scenario is selected) reduce initial memory?
- Is there a point where `immer` middleware or structural sharing would help?

### Deliverable
A performance profile report with measurements and optimization recommendations, prioritized by user impact.

---

## 7. Security and Production Readiness

### Research needed

**7a. Supabase RLS policies**
- Phantom uses Supabase for persistence but the RLS (Row Level Security) policies are assumed, not documented.
- Research: What SQL policies need to exist on the `dashboards` table?
  - `SELECT`: user can read own dashboards OR dashboards where `is_public = true`
  - `INSERT`: user can only insert rows with their own `user_id`
  - `UPDATE/DELETE`: user can only modify own dashboards
- Are these policies currently deployed? If not, write the migration SQL.

**7b. Share link security**
- Share links use `nanoid()` for the share_id. Research:
  - Is 21-character nanoid sufficient entropy for public share links?
  - Should share links expire? (Currently permanent)
  - Should there be a rate limit on share link creation?
  - Should shared dashboards include a "Report abuse" mechanism?

**7c. Content Security Policy**
- Phantom is a client-side SPA. Research what CSP headers are appropriate:
  - `script-src`: Only self (no eval, no inline)
  - `connect-src`: Only self + Supabase URL
  - `img-src`: Only self (no external images currently)
  - `style-src`: Self + unsafe-inline (Fluent UI uses CSS-in-JS)

**7d. Authentication hardening**
- Current auth is email/password via Supabase with Azure OAuth option.
- Research:
  - Should there be MFA support? (Supabase supports TOTP)
  - Session timeout policy? (Currently: Supabase default, which is 1 hour access token + refresh)
  - Account lockout after failed attempts? (Supabase GoTrue handles this)
  - GDPR: What user data does Phantom store? What would a "delete my account" flow look like?

**7e. Rate limiting and abuse prevention**
- PBIP export generates large ZIPs. Without rate limiting, an attacker could exhaust server-side resources.
- Supabase Edge Functions could rate-limit API calls. Research the appropriate limits.
- Dashboard save/update: What's a reasonable rate? (Once per 5 seconds, matching the auto-save interval)

### Deliverable
A security checklist with specific Supabase SQL migrations, CSP header config, and auth hardening steps.

---

## 8. Accessibility

### Research needed

**8a. Screen reader compatibility**
- Test Phantom with NVDA (Windows) and VoiceOver (macOS).
- Document: Can a screen reader user navigate to each visual? Read the visual title? Understand the data?
- Recharts generates SVG elements. Research: Do Recharts charts have appropriate ARIA labels? If not, what wrapper is needed?
- react-grid-layout: Is the drag-drop canvas keyboard-accessible? Can visuals be moved/resized without a mouse?

**8b. Keyboard navigation**
- Map the full keyboard navigation path through the app:
  - Tab order: Top bar -> Left nav -> Canvas visuals -> Bottom pane -> Right pane
  - Arrow keys within canvas: Move between visuals?
  - Escape: Deselect visual?
  - Enter: Select/edit visual?
  - Delete: Remove selected visual?
- What Power BI Service keyboard shortcuts should Phantom mirror?

**8c. Color contrast validation**
- For each of the 12 palettes, validate every color against white (#FFFFFF) and canvas grey (#EAEAEA) backgrounds:
  - WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  - Chart fills need at least 3:1 against background
  - Axis labels need 4.5:1 against chart background
- Flag any palette colors that fail and suggest replacements.

**8d. High contrast mode**
- Windows has a built-in High Contrast mode. Test Phantom with it enabled.
- Fluent UI v9 has built-in high contrast support. Verify it applies to all Phantom components.

### Deliverable
An accessibility audit report with WCAG AA compliance status per component, with fix priorities.

---

## 9. Feature Gap: Fields Pane (Drag to Axes)

The PRD and TODO both list "Fields Pane -> drag to chart axes" as a key Phase 2 gap. This is the feature that would make Phantom feel like a real BI tool rather than a template browser.

### Research needed

**9a. Power BI's field well UX**
- How does PBI Desktop's "Build a visual" pane work?
  - Fields list on the right
  - Drag a field to Axis / Legend / Values / Tooltips wells
  - Auto-detect field type (dimension vs measure) and place accordingly
  - Reorder within wells
- Document the exact interaction pattern with screenshots.

**9b. What Phantom already has**
- `FieldsPane.tsx` exists as a component but is a placeholder.
- `semanticLayer.ts` defines field roles (Time, Entity, Geography, Category, Measure, Identifier).
- `bindingRecipes.ts` maps visual type + scenario to default bindings.
- The infrastructure exists; the question is the UI interaction design.

**9c. Scoping decision**
- Full field-well parity is expensive. What's the minimal version that adds value?
  - Option A: Just dimension/measure dropdowns in the Properties Panel (already exists)
  - Option B: Draggable fields from a list, but only to pre-defined wells (simplified)
  - Option C: Full PBI-style field wells with auto-detection and reorder (complex)
- Research: Which option has the best effort-to-value ratio?

### Deliverable
A design spec with wireframes for the Fields Pane interaction, scoped to a single sprint.

---

## 10. Feature Gap: FFMA Reporting Language

The FFMA panel exists (`FFMAPanel.tsx`) with a container and pre-built widgets, but the actual reporting language parser is unbuilt. The TODO.md (Epic 7) lists this as a full epic.

### Research needed

**10a. What is FFMA?**
- Define the FFMA reporting language syntax and semantics. The PRD mentions it but doesn't define it.
- Is this an internal/proprietary language? Or based on an existing standard?
- What are the core use cases? (e.g., "show top 5 products by revenue as a bar chart" in a declarative syntax)

**10b. Parser architecture**
- If a custom language is needed: research parser-generator options (PEG.js, nearley.js, tree-sitter-wasm).
- If it's more like a structured config: could it be YAML/JSON with a schema?
- What's the simplest version that demonstrates the concept?

**10c. Relationship to AI**
- Could FFMA be replaced or augmented by natural language? ("Show me a bar chart of revenue by category")
- Research: What would an LLM-powered visual creation flow look like? (User types intent -> Phantom creates the visual)
- This could be a much stronger differentiator than a custom DSL.

### Deliverable
A decision document: Build FFMA parser vs. pivot to LLM-powered visual creation. Include effort estimates and user value comparison.

---

## 11. Go-to-Market Research

### Research needed

**11a. Pricing model**
- What would BI consultants pay for this tool?
- Comparable SaaS tools: Figma ($12-75/user/mo), Power BI Pro ($10/user/mo), Sigma ($500+/mo)
- Possible models: Free tier (guest mode, no save) + Pro ($20-50/mo for persistence, sharing, export)
- Is the free/guest mode sufficient for initial traction?

**11b. Distribution channels**
- Microsoft AppSource / Power BI marketplace listing
- Direct outreach to BI consultancy firms
- Content marketing (YouTube tutorials, LinkedIn posts showing before/after)
- Integration with Power BI Community forums
- VS Code extension or Power BI Desktop add-in?

**11c. User onboarding**
- What's the ideal first-run experience?
- Current: User lands on `/editor` with a Retail dashboard pre-loaded. Is this enough?
- Should there be a guided tour? Interactive tutorial? Video walkthrough?
- What's the "aha moment" that converts a visitor to a regular user?

### Deliverable
A GTM one-pager with pricing, channels, and onboarding recommendations.

---

## Priority Ranking

| # | Research Area | Urgency | Impact | Effort |
|---|---|---|---|---|
| 1 | PBIP Export Validation | Blocking | Highest -- core differentiator | 2-3 days |
| 2 | Power BI Visual Fidelity | High | High -- "looks like PBI" promise | 3-5 days |
| 3 | Data Realism | High | High -- workshop credibility | 2-3 days |
| 4 | Competitive Landscape | Medium | High -- positioning and pricing | 1-2 days |
| 5 | Standards Pack Spec | Medium | High -- product vision | 2-3 days |
| 6 | Security & Production | Medium | Medium -- required for launch | 1-2 days |
| 7 | Accessibility Audit | Medium | Medium -- compliance | 2-3 days |
| 8 | Performance Profiling | Low | Medium -- scale concern | 1 day |
| 9 | Fields Pane Design | Low | Medium -- Phase 2 gap | 1 day |
| 10 | FFMA / AI Decision | Low | Medium-High -- strategic | 1 day |
| 11 | GTM Research | Low | High -- but premature until above resolved | 1-2 days |

---

## Known Bugs to Fix (from codebase review)

These don't need research, just engineering time:

1. **camelCase metric lookup** -- Charts show 0 when field names like `SentimentScore` or `MarketValue` don't match the lowercase lookup in `chartUtils.ts`. The field mapping is case-sensitive but data uses camelCase while some lookups use lowercase.

2. **Scatter chart memo deps** -- Scatter chart doesn't recompute when dimension/scenario data changes because `useMemo` deps are incomplete.

3. **Fluent UI `mergeClasses` console warnings** -- Style composition issue producing noise in the console. Cosmetic but unprofessional.

4. **`react-grid-layout` fires `onLayoutChange` on mount** -- This sets `isDirty: true` immediately, which means a fresh dashboard already shows as "unsaved" even though nothing changed. The `onLayoutChange` handler should skip the initial mount event.

5. **ExportButton has unused `DialogTrigger` import** -- TypeScript error (TS6133).

6. **Multiple pre-existing TS errors in `export/` files** -- Unused variables and type mismatches in `daxGenerator.ts`, `layoutConverter.ts`, `schemaGenerator.ts`. These should be cleaned up before any export-related changes.
