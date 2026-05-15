# Phantom Client Delivery Strategy

## Goal

Use Phantom to sell and deliver premium custom analytical React apps without trying to become a full BI platform.

The delivery promise is:

```text
Client workshop -> Phantom analytical design/spec -> React BI app implementation -> governed backend/data connection
```

Phantom owns the workshop, design plane, analytical journey, implementation spec, and export handoff. It should plug into BI and data tools when useful, but it should not compete with them on query builders, warehouse governance, permissions engines, or hosted BI operations.

## Position

We should not sell "Metabase replacement" or "Power BI clone."

We should sell:

> We turn messy Power BI, Excel, and reporting estates into polished analytical products that clients can approve, use, and extend.

The best client-facing offer is a packaged service:

1. Audit the current reporting estate.
2. Run a Phantom workshop with stakeholders.
3. Design the target analytical journeys, including filters, drill-throughs, detail pages, and actions.
4. Produce approved mockups and a build-ready spec.
5. Export React implementation assets.
6. Connect the app to the right backend for the client.
7. Keep Power BI or Metabase for commodity/self-service reporting where it is the better fit.

## Recommended Architecture

### Phantom

Phantom is the design-to-implementation layer.

It should produce:

- Approved analytical mockups.
- View/page specs.
- Component specs.
- Drill-through and interaction maps.
- Filter/state models.
- Data requirements.
- Metric and dimension requirements.
- Theme tokens.
- React component scaffold exports.
- Power BI compatibility reports when working in Power BI Mode.

### React App

The React app is the premium client-facing experience.

It should own:

- App shell and navigation.
- Executive dashboards.
- Operational command centers.
- Drill-through views.
- Entity detail pages.
- Polished tables and filters.
- Workflow/action surfaces.
- Responsive layout.
- Client branding.
- Custom UX that BI tools cannot deliver well.

### Backend/Data Layer

The backend should be chosen per client. Phantom should support adapters, not one mandatory backend.

## Backend Options

### Option A: Metabase-Assisted Delivery

Use Metabase when the client needs fast database connectivity, saved analytical questions, internal self-service, and lower engineering overhead.

Best for:

- Internal reporting portals.
- Clients with simple warehouse/database access.
- Teams that want analysts to maintain some questions.
- Fast prototypes that need real data quickly.
- Commodity dashboards that do not justify custom engineering.

Use Metabase for:

- Database connections.
- Saved questions/cards.
- Lightweight models.
- Internal dashboards.
- Simple embedded charts where quality is acceptable.
- Permission handling where it fits the client shape.

Use React for:

- Premium shell.
- Client-facing UX.
- Drill-through journeys.
- Entity pages.
- Custom tables.
- Polished filters.
- Workflow actions.
- Branded executive dashboards.

Phantom should export a mapping from components to Metabase cards/questions where this path is chosen.

### Option B: Cube Or Semantic API Delivery

Use Cube or another semantic/query API when the client needs product-grade analytics, repeatable metric definitions, caching, and multi-tenant patterns.

Best for:

- SaaS-style embedded analytics.
- External customer portals.
- Multi-tenant analytics.
- Governed metric definitions.
- Performance-sensitive dashboards.
- Teams with engineering ownership.

Use the semantic layer for:

- Metric definitions.
- Dimensions.
- Query APIs.
- Caching.
- Multi-tenant filtering.
- Access constraints.

Use Phantom to define:

- Required metrics and dimensions.
- Drill-through payloads.
- Filter contracts.
- Data adapter interfaces.
- React components consuming the semantic API.

This is the strongest long-term architecture for custom analytical products.

### Option C: Custom API Delivery

Use a custom backend when the client already has a mature data stack or product engineering team.

Best for:

- Clients with existing APIs.
- Snowflake/dbt/Postgres-heavy stacks.
- Highly bespoke workflows.
- Operational analytics with writeback or actions.
- Apps that combine analytics with business process.

Use custom APIs for:

- Metric endpoints.
- Entity endpoints.
- Drill-through detail endpoints.
- Export endpoints.
- Authentication and authorization.
- Workflow actions.

Use Phantom as the contract between the workshop and engineering build.

## Delivery Workflow

### 1. Discovery And Report Audit

- Inventory the 15-20 existing reports.
- Identify audience, owner, frequency, and business decision for each report.
- Mark each report as keep, redesign, rebuild, consolidate, or retire.
- Find duplicate pages, unused visuals, manual exports, and missing drill paths.
- Identify reports worth turning into React apps.

### 2. Phantom Workshop

- Load current screenshots or report summaries.
- Capture business questions and actions.
- Define the target audience and decision journey.
- Sketch the ideal analytical flow.
- Define KPIs, dimensions, filters, and drill-through paths.
- Agree which views are summary, diagnostic, detail, and action-oriented.

### 3. Mockup And Spec

- Build the target experience in Phantom.
- Choose React Product Mode or Power BI Mode per deliverable.
- Add realistic mock data.
- Define filter behavior.
- Define interactions and drill-through routes.
- Add loading, empty, error, and no-access states.
- Add data requirements and source assumptions.
- Run export readiness checks.

### 4. Client Approval

- Present the interactive mockup.
- Walk the client through the decision journey.
- Validate drill-through behavior.
- Confirm metrics and grain.
- Confirm data ownership.
- Capture comments and sign-off.

### 5. Implementation Export

For React Product Mode, export:

- React component scaffold.
- TypeScript component props.
- Route/view spec.
- Drill action spec.
- Filter/state spec.
- Theme tokens.
- Mock data.
- Data adapter stubs.
- Build checklist.

For Power BI Mode, export:

- Theme JSON.
- Layout/spec notes.
- PBI-safe visual mapping.
- Unsupported feature report.
- Field well requirements.
- Drill-through implementation notes.
- PBIP/PBIT where feasible.

### 6. Build And Connect

- Implement the React app shell.
- Wire components to Metabase, Cube, or custom APIs.
- Replace mock data with real data adapters.
- Validate filters and drill-throughs.
- Run responsive and accessibility QA.
- Confirm client acceptance criteria.

### 7. Support And Expansion

- Keep commodity reports in Power BI/Metabase where appropriate.
- Add new React analytical modules for high-value workflows.
- Convert successful Phantom patterns into reusable templates.
- Feed common components back into the open-source Phantom visual pack.

## Decision Rules

Use React Product Mode when:

- The report is client-facing.
- UX and branding matter.
- Drill-through is central to the workflow.
- The report behaves more like software than a static dashboard.
- The audience needs guided decisions, not ad hoc exploration.
- Power BI feels limiting or too expensive/awkward to embed.

Use Power BI Mode when:

- The client is committed to Power BI.
- Analysts need to maintain the report.
- The report needs standard BI distribution, subscriptions, or service features.
- The value is in faster mockup/approval, not custom app UX.
- Export realism matters more than design freedom.

Use Metabase when:

- Fast database-backed reporting is more important than bespoke UX.
- The client wants self-service internal analytics.
- Analysts should maintain questions/dashboards.
- Embedded charts are acceptable for part of the experience.

Use Cube/semantic APIs when:

- The app is productized or customer-facing.
- Metrics need to be governed and reused.
- Performance and caching matter.
- Multi-tenant filtering matters.
- React should fully own the presentation layer.

Use custom APIs when:

- Analytics are tied to operational workflows.
- The client already has API/data platform maturity.
- There are writeback, action, or integration requirements.
- The UX cannot be satisfied by embedded BI.

## Phantom Product Implications

To support this delivery model, Phantom needs:

- A mode system: React Product Mode and Power BI Mode.
- Component metadata: React-ready, PBI-safe, PBI-approximate, design-only.
- A first-class drill-through model.
- A filter/state model.
- A view/page/entity model.
- A stable spec JSON.
- React export scaffolding.
- Backend adapter mapping for Metabase, Cube, and custom APIs.
- Power BI compatibility warnings and export reports.
- Workshop notes, comments, approvals, and implementation checklists.
- Quality checks for design, export, and data completeness.

## What We Should Avoid

- Building a full visual query builder too early.
- Building our own permissions/governance platform.
- Competing with Metabase on self-service BI.
- Competing with Power BI on enterprise BI administration.
- Making React Product Mode weaker to preserve Power BI compatibility.
- Exporting mockups without data contracts.
- Treating drill-through as a chart setting instead of an analytical journey.

## Service Packaging

Potential service offers:

- Reporting estate audit.
- Power BI redesign workshop.
- Power BI-to-React executive dashboard rebuild.
- Client-facing analytics portal.
- Operational command center.
- Embedded SaaS analytics module.
- Phantom prototype and implementation spec only.
- Phantom prototype plus full React build.

The first wedge should be:

> We redesign your most important reports into product-grade analytical experiences and give your team a build-ready React or Power BI implementation path.

