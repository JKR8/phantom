# Phantom Product Goal

## Goal

Build Phantom into the analytical design toolkit that helps consultants, report builders, and product teams turn a stakeholder workshop into a polished reporting experience, a complete implementation specification, and an exportable build starting point.

Phantom should not try to become Power BI, Tableau, or a full BI backend. Its job is to sit between vague business requirements and production implementation:

```text
Client workshop -> analytical mockup -> approved product/report spec -> React or Power BI implementation handoff
```

The product should make it dramatically easier to design superior dashboard and reporting experiences with the right target in mind:

- React Product Mode for premium analytical products and app-native dashboards.
- Power BI Mode for Power BI-safe report mockups, themes, and implementation specs.

## Positioning

Phantom is an analytics-native design plane, not a generic design tool and not a full BI platform.

Phantom should not compete with Figma for generic product design. Figma is the right default for visual design systems, brand polish, and general UI handoff. Phantom only earns its place when the artifact is analytical: metrics, filters, drill-throughs, data contracts, report constraints, and build readiness matter as much as layout.

It should understand the concepts that Figma does not natively model and that BI tools often make hard to design collaboratively:

- Business questions
- Metrics and dimensions
- Filters and slicers
- Drill-through paths
- Cross-filtering and highlight behavior
- Report pages and entity detail views
- Data requirements
- Export constraints
- Build readiness
- Client approval

Phantom may complement Figma over time by exporting analytics specs, tokens, component references, or implementation packs that sit beside a Figma design system. It should not require teams to abandon Figma.

The strongest product promise is:

> Phantom turns client reporting conversations into build-ready analytical products.

## Core Modes

### React Product Mode

React Product Mode is the future-facing mode. It allows high-quality analytical experiences that feel like native software, not embedded BI.

It should support:

- Beautiful React-ready analytical components.
- Polished tables, filters, KPI cards, charts, drill panels, and entity pages.
- Observable/shadcn/Tremor-quality visual defaults.
- Drill-through flows and application-style navigation.
- Responsive layouts.
- Design tokens and themes.
- Mock data and data contracts.
- Exportable React component scaffolds.
- Exportable TypeScript types, component props, route specs, and data adapter stubs.
- Storybook-ready examples over time.

Success means a consultant or product team can leave a workshop with a prototype that is credible enough for client approval and structured enough for engineers to build from immediately.

### Power BI Mode

Power BI Mode is the constrained compatibility mode. It exists for teams that still need to deliver inside Power BI but want a better design and approval process.

It should support:

- Power BI-safe component palette.
- Power BI-like canvas behavior.
- Power BI-compatible visual constraints.
- Theme JSON export.
- PBIP/PBIT export where feasible.
- Power BI implementation notes.
- Warnings when something will not translate.
- Closest Power BI equivalent suggestions.
- A clear export readiness score.

Success means a consultant can mock up a report with a client and avoid fantasy UI that cannot be built in Power BI.

## Product Principles

- Do not become a full BI platform.
- Do not compete head-on with BI platforms on querying, governance, hosting, and permissions.
- Own the space between requirements, design, specification, and implementation.
- Make drill-through and analytical journeys first-class concepts.
- Make every mockup buildable, not just attractive.
- Treat export constraints as product features, not afterthoughts.
- Make React Product Mode excellent without letting Power BI constraints hold it back.
- Keep Power BI Mode useful by being honest, constrained, and implementation-aware.
- Let the visual system be open-source friendly; keep workflow, collaboration, and export orchestration as the product layer.

## Required Capability Areas

### Workshop And Discovery

- Capture business questions, audience, decisions, and actions.
- Import or annotate existing report screenshots.
- Classify reports as keep, redesign, rebuild, consolidate, or retire.
- Capture stakeholder comments and approvals.
- Map pain points, manual workarounds, and missing drill paths.
- Produce workshop summaries, build notes, and data requirements.

### Analytical Journey Design

- Model pages, sections, entity views, detail views, and drill-through views.
- Define breadcrumbs, navigation, side panels, modals, and back behavior.
- Carry filter and entity context through drill paths.
- Design loading, empty, error, no-access, and mobile states.
- Make "why did this happen?" flows explicit.

### Component And Visual System

- Provide first-class analytical components: KPI cards, ranked bars, line/area, scatter/regression, distribution charts, barbell, bullet, slope, waterfall, heatmaps, tables, matrices, maps, slicers, and filters.
- Provide narrative/report components: banners, text, insight callouts, recommendations, assumptions, methodology notes, and action lists.
- Provide metadata on every component: React-ready, PBI-safe, PBI-approximate, design-only, required fields, supported interactions, and export limitations.

### Data And Spec Core

- Define stable specs for projects, views, components, metrics, dimensions, filters, interactions, drill actions, themes, and export targets.
- Support realistic mock data generation.
- Capture grain, source system assumptions, refresh cadence, row identity, entity identity, formatting, sorting, Top N, null handling, and comparison rules.
- Export data requirements for engineers or BI developers.

### Export

- React export should include component scaffolds, props, TypeScript types, mock data, theme tokens, route specs, drill actions, and data adapter stubs.
- Power BI export should include theme JSON, layout/spec notes, visual mappings, unsupported feature reports, field well notes, and PBIP/PBIT output where feasible.
- Consulting export should include a client-facing mockup pack, implementation spec, data requirements, acceptance criteria, and build checklist.

### Quality Checks

- Detect clipped content, overlapping labels, low contrast, unreadable tables, unsupported interactions, missing drill targets, missing units, missing date context, and invalid export mappings.
- Score mockups for React readiness, Power BI readiness, data completeness, and decision clarity.
- Explain what must change to make a design export-safe.

## Open Source Strategy

Open-source the visual credibility layer, not the full workflow product.

Potential packages:

- `@phantom/visuals`
- `@phantom/tokens`
- `@phantom/spec`
- `@phantom/react-adapters`

The open-source layer should include polished analytical React components, design tokens, example dashboards, and a stable spec format.

The proprietary/product layer should include the design plane, workshop flow, collaboration, approval, export orchestration, and project management.

## Success Criteria

Phantom succeeds when:

1. A consultant can run a client workshop and create a credible analytical mockup during the session.
2. The mockup captures business intent, data requirements, and drill-through behavior.
3. The client can approve the reporting experience before build starts.
4. Engineers can start from exported React components and specs instead of vague screenshots.
5. Power BI builders can use Power BI Mode without accidentally designing impossible reports.
6. High-value reports can be rebuilt as product-grade React experiences.
7. Commodity reports can still be planned safely for Power BI.
8. The visual system becomes credible enough to package and share publicly.

## North Star

Phantom should make analytical reporting feel less like report production and more like product design.

The north star is a tool where a team can walk in with a messy set of reporting needs and walk out with:

- A better reporting experience.
- A clearer implementation path.
- A shared client-approved spec.
- A React or Power BI build starting point.

From stakeholder conversation to build-ready analytical product, with nothing important lost in translation.
