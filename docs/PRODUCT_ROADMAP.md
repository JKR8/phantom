# Phantom Product Roadmap

## Objective

Evolve Phantom from a Power BI-focused mockup/export tool into an analytics-native design toolkit for consultants, report builders, and product teams.

The target product has two explicit modes:

- React Product Mode: design premium analytical React apps and export build-ready implementation assets.
- Power BI Mode: design constrained Power BI-safe reports and export realistic Power BI specs/assets.

## Product Spine

The product should be built around five durable primitives:

1. Project: the client/workspace/reporting engagement.
2. View: a page, dashboard, drill-through page, entity view, or detail panel.
3. Component: a chart, table, KPI, filter, control, text element, or layout element.
4. Data contract: metrics, dimensions, filters, grain, entities, and source assumptions.
5. Interaction: drill-through, cross-filter, highlight, navigation, side panel, modal, or action.

Everything else should hang off those primitives.

## Figma Boundary

Figma remains the default tool for generic UI design, brand systems, visual exploration, and broad product handoff. Phantom should not try to replace that.

Phantom should win only where the design object is analytical and build readiness depends on more than pixels:

- metrics and dimensions
- filter state
- drill-through journeys
- data contracts
- export target constraints
- readiness checks
- agent/API/CLI control

Phantom should support two entry points:

- Figma-led: import or link Figma design frames, screenshots, tokens, and component references, then layer on analytical workflow, data contracts, drill-throughs, readiness checks, and engineering handoff.
- Phantom-led: skip Figma and use Phantom's sensible analytical defaults, templates, and component library to produce a build-ready spec quickly.

Future Figma integration should be additive: link Phantom analytical specs to Figma design systems, export token/component references, or generate implementation packs that use the client design system.

## Phase 0: Figma Import And Phantom Defaults

Goal: make the product useful whether a client starts in Figma or directly in Phantom.

Required changes:

- Add a Figma import/link concept to the project model.
- Support imported design references as frames, screenshots, or component/token links.
- Let imported design references attach to Phantom views and components.
- Keep Phantom's own default templates and visual system strong enough for teams that skip Figma.
- Ensure exported specs distinguish visual design references from analytical/data/interaction contracts.

Acceptance criteria:

- A project can record whether it is Figma-led or Phantom-led.
- A Phantom view can reference a Figma frame/screenshot/design source.
- Analytics metadata remains editable in Phantom regardless of where the visual design started.
- React/PBI handoff can include both the design reference and the Phantom analytical spec.

## Phase 1: Mode System And Component Metadata

Goal: make the current UI honest about target output.

Required changes:

- Add explicit mode selection: React Product Mode and Power BI Mode.
- Add component metadata for every visual/control:
  - React-ready
  - PBI-safe
  - PBI-approximate
  - Design-only
  - Required fields
  - Supported interactions
  - Export limitations
- Update the visual kit to filter and badge components based on mode.
- Add warnings when a user designs something that will not export cleanly to Power BI.
- Keep React Product Mode visually unconstrained and premium.

Acceptance criteria:

- Users can switch modes intentionally.
- The component library changes based on mode.
- Unsupported Power BI components are clearly marked or hidden.
- The app never implies a design-only React feature is Power BI export-safe.

## Phase 2: Drill-Through And Analytical Journey Model

Goal: make drill-through a first-class design primitive.

Required changes:

- Add a `drillActions` model to dashboard/project state.
- Allow visuals, table rows, KPI cards, and filters to define click behavior.
- Support target types:
  - Page
  - Detail panel
  - Modal
  - Entity profile
  - External URL
- Support context passing:
  - Entity ID
  - Dimension value
  - Date context
  - Active filters
  - Comparison period
- Add breadcrumb/back behavior for React Product Mode.
- Add Power BI drill-through compatibility notes for Power BI Mode.

Acceptance criteria:

- A user can define "click this KPI/bar/row to open that detail view."
- The design preview can demonstrate the journey.
- The export spec includes source, target, and passed context.
- Power BI Mode warns when the behavior cannot be represented natively.

## Phase 3: Stable Spec JSON

Goal: create the contract between Phantom and implementation.

Required changes:

- Define a versioned Phantom spec format with:
  - project
  - mode
  - views
  - components
  - layout
  - theme
  - metrics
  - dimensions
  - filters
  - drillActions
  - dataSources
  - exportTargets
- Add import/export for the spec.
- Add validation and useful errors.
- Keep the format stable, readable, and diff-friendly.

Acceptance criteria:

- A Phantom project can be exported as JSON.
- The JSON can be re-imported without losing key design intent.
- The JSON is sufficient for a React engineer to understand layout, data needs, and interactions.

## Phase 4: React Product Export

Goal: turn approved mockups into a real implementation head start.

Required changes:

- Export React component scaffolds.
- Export TypeScript component prop types.
- Export route/view definitions.
- Export theme tokens.
- Export mock data.
- Export data adapter stubs.
- Export filter and drill-through contracts.
- Add a README/build checklist to generated output.

Acceptance criteria:

- A generated React export can install and run as a starter app or component pack.
- Engineers can replace mock adapters with real APIs without rewriting the design.
- Drill-through routes and filters are represented in code.
- Export output is deterministic and diff-friendly.

## Phase 5: Data Contract Mapping

Goal: let Phantom plug into real client stacks through a simple explicit data contract without becoming the backend.

Required changes:

- Add data mapping concepts for:
  - Client REST/GraphQL endpoints
  - Warehouse/dbt models
  - Optional semantic APIs
- Let components declare their required data contract.
- Export implementation notes for the agreed client data path.
- Keep third-party backend integrations optional and out of the core product identity.

Acceptance criteria:

- A component can be mapped to a custom endpoint, warehouse/dbt model, or optional semantic API query.
- The export spec clearly tells engineers what data each component needs.
- Phantom remains backend-agnostic.
- Agents and engineering pipelines can export a standalone data contract from the Phantom spec without using the browser UI.

## Phase 6: Power BI Mode Hardening

Goal: make Power BI Mode genuinely useful for consultants delivering Power BI work.

Required changes:

- Maintain a strict PBI-safe visual/control set.
- Add export readiness scoring.
- Add unsupported feature reports.
- Improve theme JSON export.
- Keep PBIP/PBIT export where feasible.
- Add field well and formatting notes.
- Add Power BI implementation checklist output.

Acceptance criteria:

- A consultant can tell what is safe, approximate, or impossible before handoff.
- The export pack gives a Power BI developer enough information to build without guessing.
- Power BI Mode stays constrained even as React Product Mode grows.

## Phase 7: Workshop And Approval Flow

Goal: make Phantom useful in front of clients, not only after the meeting.

Required changes:

- Add workshop notes per project/view/component.
- Add business question capture.
- Add audience and decision capture.
- Add comments and approval status.
- Add report inventory classification:
  - keep
  - redesign
  - rebuild
  - consolidate
  - retire
- Add client-facing presentation/review mode.

Acceptance criteria:

- A consultant can run a workshop from inside Phantom.
- The resulting project captures why the dashboard exists, not only how it looks.
- The client can approve the intended reporting experience before build starts.

## Phase 8: Open-Source Visual Pack

Goal: create trust and adoption by open-sourcing the visual credibility layer.

Candidate packages:

- `@phantom/visuals`
- `@phantom/tokens`
- `@phantom/spec`
- `@phantom/react-adapters`

Required changes:

- Extract reusable visual components.
- Document component props and data contracts.
- Add example dashboards.
- Add visual regression or screenshot examples.
- Keep the hosted/design-plane product separate from the open-source packages.

Acceptance criteria:

- Developers can use Phantom visuals without the full Phantom app.
- The visual pack demonstrates quality comparable to modern analytical product UIs.
- The open-source layer attracts trust without giving away the workflow product.

## Near-Term Build Order

The first implementation sequence should be:

1. Add mode metadata and badges to the visual kit.
2. Define the first `PhantomSpec` TypeScript types.
3. Add drill action types to state.
4. Export a project spec JSON.
5. Add React Product Mode export scaffold.
6. Add Power BI compatibility report.
7. Add workshop notes and business question capture.

This order creates the core spine before adding more visuals or backend integrations.
