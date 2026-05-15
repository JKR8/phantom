# Phantom Consultant Workflow

## Purpose

Phantom is the analytics-native layer between visual design and implementation.

Use Figma when the client already needs brand polish, design-system fidelity, or senior stakeholder design review. Use Phantom to turn that design into an analytical product spec: metrics, dimensions, filters, drill paths, data contracts, target constraints, readiness checks, and implementation handoff.

Use Phantom directly when speed matters and the project can start from strong analytical defaults.

## Two Entry Points

### Figma-Led

Use this path when the client has an existing design system, a UX team, or a polished dashboard concept already in Figma.

1. Create or refine the visual direction in Figma.
2. Import or link the Figma frame, component, screenshot, or design reference in Phantom.
3. Mark the project as `figma-led`.
4. Rebuild the analytical structure in Phantom: views, visuals, tables, filters, KPIs, and narrative elements.
5. Add the analytics behavior Figma cannot model reliably: drill-throughs, cross-filtering, context passing, sort/filter behavior, empty states, and data assumptions.
6. Run readiness checks for React Product Mode or Power BI Mode.
7. Export the handoff pack for engineers or Power BI builders.

Figma remains the pixel/design source. Phantom becomes the analytical and implementation source.

### Phantom-Led

Use this path when a workshop needs speed, the client does not have a mature design system, or the goal is to get to a build-ready reporting spec quickly.

1. Start from Phantom defaults, templates, and visual components.
2. Capture the business questions, audience, decisions, and report actions.
3. Add visuals, filters, KPI cards, tables, drill actions, and detail views.
4. Use React Product Mode for unconstrained analytical product UX.
5. Use Power BI Mode when the final build must stay Power BI-safe.
6. Run readiness checks.
7. Export the handoff pack.

Phantom is both the design surface and the analytical source of truth in this path.

## Shared Analytical Workflow

Every serious Phantom project should converge on the same analytical contract:

- Business questions and audience.
- Views, pages, drill-through pages, entity profiles, and detail panels.
- Components with stable IDs, titles, visual types, field requirements, and export status.
- Metrics, dimensions, filters, slicers, sort rules, Top N rules, date context, and comparison periods.
- Drill actions with source, trigger, target, context mapping, and filter preservation.
- Target mode: React Product Mode, Power BI Mode, or dual-track.
- Readiness blockers and next actions.

The design may start in Figma or Phantom, but the implementation contract should end in Phantom Spec JSON.

## Handoff Modes

### React Product Mode

Choose React Product Mode when the client wants a polished analytical app, custom UX, responsive behavior, product-style navigation, richer drill flows, or visuals that should not be constrained by Power BI.

React handoff should include:

- `phantom-spec.json`
- `handoff-summary.json`
- `data-contract/data-contract.json`
- `data-contract/DATA_CONTRACT.md`
- `react-starter/`
- React implementation backlog
- Route/view definitions
- Typed component prop contracts
- Drill action definitions
- Data adapter stubs
- Design-source references when Figma-led

### Power BI Mode

Choose Power BI Mode when the final deliverable must be built in Power BI and the client needs confidence that the approved mockup can be implemented there.

Power BI handoff should include:

- `phantom-spec.json`
- `handoff-summary.json`
- `power-bi/power-bi-implementation-guide.json`
- `power-bi/POWER_BI_IMPLEMENTATION_GUIDE.md`
- Visual support statuses: ready, approximate, unsupported
- Field well requirements
- Drill-through compatibility notes
- Power BI-safe build checklist

## Agent And CLI Workflow

Agents should treat Phantom files as build contracts, not screenshots.

Preferred first pass:

```bash
npm run phantom:spec -- validate path/to/spec.json
npm run phantom:spec -- inspect path/to/spec.json handoff-summary
npm run phantom:spec -- inspect path/to/spec.json design-workflow
npm run phantom:spec -- inspect path/to/spec.json approval
npm run phantom:spec -- inspect path/to/spec.json implementation-gate
npm run phantom:spec -- inspect path/to/spec.json workshop-intent
npm run phantom:spec -- inspect path/to/spec.json design-sources
npm run phantom:spec -- inspect path/to/spec.json data-requirements
npm run phantom:spec -- inspect path/to/spec.json data-path
```

For Figma-led work:

```bash
npm run phantom:spec -- import-design-source path/to/spec.json figmaFrame "Client concept" https://www.figma.com/design/... "1:2" "Workshop-approved direction" path/to/spec.with-design.json
```

For full implementation handoff:

```bash
npm run phantom:spec -- export-handoff-pack path/to/spec.json ./handoff-pack
```

Agents should read `implementation-gate`, `handoff-summary.json`, or `HANDOFF_MANIFEST.json` before generating code or build notes. These include sign-off status, implementation readiness, the entry point, design mapping coverage, workshop intent, workshop completeness, readiness state, recommended handoff target, counts, and next actions in one small payload.

## Workshop Output

A strong Phantom workshop should leave the team with:

- A client-approved analytical mockup.
- A clear target mode: React Product Mode, Power BI Mode, or dual-track.
- A linked Figma/design source if visual design started outside Phantom.
- A complete data contract for engineering or BI build.
- Explicit drill paths and interaction behavior.
- A readiness report with blockers and warnings.
- A handoff pack that agents, engineers, or Power BI builders can inspect without replaying the workshop.

The practical promise is simple: no important analytical decision should live only in a meeting note, a screenshot, or someone's memory.
