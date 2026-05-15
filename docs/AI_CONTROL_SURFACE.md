# Phantom AI Control Surface

## Goal

Phantom must be easy for agents, scripts, and implementation pipelines to control without relying on browser clicks.

The UI is for workshops. The API/CLI/spec layer is for agents and engineering automation.

This is also the clearest distinction from Figma. Figma can own visual design and handoff; Phantom's control surface should own analytics-native structure that agents can reason about: metrics, dimensions, filters, drill-throughs, target constraints, and data contracts.

Agents should be able to operate in either path:

- Figma-led: read Phantom specs that reference Figma frames/tokens/components and generate implementation tasks that combine design references with analytical contracts.
- Phantom-led: use Phantom's default component metadata, layouts, data contracts, and drill actions without any Figma dependency.

## Principles

- Every important UI action should eventually have a machine-readable equivalent.
- Exports must be deterministic, versioned, and diff-friendly.
- Agents should be able to inspect a project, validate readiness, and generate implementation artifacts from the command line.
- The control surface should use boring formats: JSON in, JSON out, stable exit codes, explicit errors.
- Phantom should not require a named BI backend. The contract should point to client APIs, warehouse/dbt models, or optional semantic APIs.

## Core Artifact: Phantom Spec JSON

The first agent-facing artifact is the Phantom Spec JSON.

It captures:

- spec version
- export mode
- scenario
- views
- components
- layout
- data requirements
- filters
- theme
- React export status
- Power BI compatibility status

This is the contract agents should use before generating React code, Power BI build notes, data contracts, QA checks, or client-facing implementation packs.

## Current CLI

The current CLI starts with spec validation and summary:

```bash
npm run phantom:spec -- validate path/to/spec.json
npm run phantom:spec -- summary path/to/spec.json
npm run phantom:spec -- diff before.json after.json
npm run phantom:spec -- readiness path/to/spec.json react
npm run phantom:spec -- readiness path/to/spec.json powerBi
npm run phantom:spec -- export-react path/to/spec.json ./generated-app
npm run phantom:spec -- export-react-build-pack path/to/spec.json ./react-build-pack
npm run phantom:spec -- export-data-contract path/to/spec.json ./handoff
npm run phantom:spec -- export-powerbi-guide path/to/spec.json ./handoff
npm run phantom:spec -- export-handoff-pack path/to/spec.json ./handoff-pack
npm run phantom:spec -- set-mode path/to/spec.json powerBi path/to/spec.powerbi.json
node tools/phantom-spec-cli.mjs set-mode path/to/spec.json --mode react-product --out path/to/spec.react.json
node tools/phantom-spec-cli.mjs set-approval path/to/spec.json --status approved --out path/to/spec.approved.json
node tools/phantom-spec-cli.mjs set-workshop-intent path/to/spec.json --business-questions "Which customers need attention?" --audience "Sales leadership" --decisions "Prioritise account follow-up" --acceptance-criteria "Leaders can identify and drill into priority accounts" --out path/to/spec.with-intent.json
node tools/phantom-spec-cli.mjs add-view path/to/spec.json --id detail --name "Account Detail" --out path/to/spec.with-view.json
node tools/phantom-spec-cli.mjs add-component path/to/spec.with-view.json --view detail --type table --title "Account Detail" --dimensions Region,Account --metrics revenue --out path/to/spec.with-detail-table.json
node tools/phantom-spec-cli.mjs add-drill-action path/to/spec.json --source visual-1 --target-type view --target detail --label "Open detail" --context Region:Region --out path/to/spec.with-drill.json
npm run phantom:spec -- inspect path/to/spec.json views
npm run phantom:spec -- inspect path/to/spec.json components
npm run phantom:spec -- inspect path/to/spec.json drill-actions
npm run phantom:spec -- inspect path/to/spec.json data-requirements
npm run phantom:spec -- inspect path/to/spec.json data-path
npm run phantom:spec -- inspect path/to/spec.json design-sources
npm run phantom:spec -- inspect path/to/spec.json design-mapping
npm run phantom:spec -- inspect path/to/spec.json design-workflow
npm run phantom:spec -- inspect path/to/spec.json approval
npm run phantom:spec -- inspect path/to/spec.json implementation-gate
npm run phantom:spec -- inspect path/to/spec.json workshop-intent
npm run phantom:spec -- inspect path/to/spec.json react-backlog
npm run phantom:spec -- inspect path/to/spec.json powerbi-build-matrix
npm run phantom:spec -- inspect path/to/spec.json handoff-summary
npm run phantom:spec -- import-design-source path/to/spec.json figmaFrame "Client concept" https://www.figma.com/design/... "1:2" "Workshop-approved direction" path/to/spec.with-design.json
node tools/phantom-spec-cli.mjs import-design-source path/to/spec.json --type figmaFrame --name "Client concept" --url https://www.figma.com/design/... --frame-id "1:2" --views main --components kpi-1,chart-1 --out path/to/spec.with-design.json
npm run phantom:spec -- import-data-source path/to/spec.json dbt "Orders mart" mart_orders Region,revenue visual-1 path/to/spec.with-data.json
node tools/phantom-spec-cli.mjs import-data-source path/to/spec.json --type dbt --name "Orders mart" --model mart_orders --fields Region,revenue --components visual-1 --out path/to/spec.with-data.json
```

`validate` returns:

```json
{
  "valid": true,
  "errors": []
}
```

`summary` returns a compact JSON payload with scenario, mode, component count, data requirements, and Power BI support counts.

`diff` returns project, mode, component, drill action, and data requirement changes between two Phantom specs. Use it after workshops or AI edits before regenerating implementation artifacts.

`set-mode` writes a new spec with `mode` and `project.specification.exportMode` switched to React Product Mode or Power BI Mode. Use it when an agent needs to compare both delivery paths from the same workshop artifact before running `readiness`, `inspect implementation-gate`, or exports.

`set-approval` writes a new spec with sign-off status set to `draft`, `in-review`, or `approved`. Use it after client or delivery-lead review to clear the approval portion of the implementation gate in a controlled, diffable spec update.

`set-workshop-intent` writes a new spec with updated workshop intent fields: business questions, audience, decisions/actions, acceptance criteria, and optional build notes. Use it to repair `inspect workshop-intent` or `inspect implementation-gate` blockers from meeting notes before generating React or Power BI handoff artifacts.

`add-view` adds or updates a dashboard/detail view in the spec. Use it before `add-drill-action` when a workshop defines a drill-through target page that does not exist yet; React starter exports turn these views into routes.

`add-component` adds or updates a component inside a target view with layout, metrics, dimensions, fields, and React/Power BI export metadata. Use it after `add-view` when an agent needs a concrete table, KPI, or chart on a drill-through target before exporting a React starter or Power BI build guide.

`add-drill-action` adds or updates an analytical journey action with a source component, trigger, target type, target id, context mapping, and preserve-filters flag. Use it to turn a workshop statement like "click this KPI/bar/row to open that detail view" into a spec-level interaction that React exports and Power BI build guides can carry forward.

`inspect` returns focused JSON for `views`, `components`, `drill-actions`, `data-requirements`, `data-path`, `design-sources`, `design-mapping`, `design-workflow`, `design-handoff`, `approval`, `implementation-gate`, `workshop-intent`, `react-backlog`, `powerbi-build-matrix`, or `handoff-summary`, so agents can query the spec before deciding what to generate or validate.

`inspect views` returns each view/page with route path, component IDs, component count, and inbound drill action IDs. Use it after `add-view`, `add-component`, or `add-drill-action` to verify the analytical journey shape before exporting a React starter or Power BI guide.

`inspect design-sources` returns the current design entry point and linked design sources, including any mapped Phantom view IDs or component IDs. Use it to decide whether the project is Figma-led or Phantom-led before generating implementation tasks.

`inspect design-mapping` returns design-source mapping coverage: total sources, mapped/unmapped counts, linked view IDs, linked component IDs, and source IDs without mappings. Use it as a lightweight gate before implementation work when the project is Figma-led.

`inspect design-workflow` returns the current design plane (`figma` or `phantom`), Phantom's role in that workflow, mapping status, required next steps, supported handoff modes, and suggested agent commands. Use it first when deciding whether to pull in Figma references or proceed with Phantom defaults.

`inspect approval` returns sign-off status, whether the spec is approved for implementation, guidance, and required next steps. Use it before generating code or Power BI build notes.

`inspect implementation-gate` returns a single implementation readiness decision that combines approval, design-source mapping, data-path readiness, workshop intent completeness, React readiness, Power BI readiness, blocking reasons, warnings, and required next steps. Use it as the safest first command before any agent starts engineering work.

`inspect workshop-intent` returns the business questions, audience, decisions/actions, acceptance criteria, build notes, and a completeness object with present/missing workshop fields. Use it before generating React or Power BI implementation work so agents preserve the client workshop intent and can pause when the brief is too thin.

`inspect data-path` returns source systems, structured source references, grain, refresh cadence, component-to-source candidates, unmapped components, unmapped fields, and required next steps. Use it before wiring React adapters or Power BI model/table work.

`inspect react-backlog` returns the same machine-readable implementation task list used by React starter and handoff pack exports. Use it when an agent needs to plan React work without generating files.

`inspect powerbi-build-matrix` returns the same readiness summary, visual support statuses, field requirements, drill-through rows, and build checklist used by the Power BI implementation guide. Use it when an agent needs to assess Power BI Mode fit without generating guide files.

`inspect design-handoff` returns component-level design provenance: which components map to Figma frames/components or other design sources, which use Phantom defaults, and which still need explicit design mapping before engineering handoff.

`inspect handoff-summary` returns project metadata including sign-off status, implementation gate, data path, design workflow, design mapping coverage, workshop intent, workshop completeness, React and Power BI readiness, a recommended handoff target, field/component/task counts, Power BI visual support counts, and next actions in one JSON payload. Use it as the first agent check after a workshop.

`import-design-source` adds or updates a Figma frame, Figma component, screenshot, Phantom default, or external reference in a Phantom Spec. Use the npm-friendly positional form `type name url frame-id notes out-spec`; direct `node tools/phantom-spec-cli.mjs ...` usage can also pass named flags such as `--type`, `--name`, `--url`, `--views`, `--components`, and `--out`. It writes a new spec to the positional output path or `--out`, marks non-Phantom sources as `figma-led`, and mirrors the source into `project.specification` so browser exports, CLI exports, readiness checks, and agents see the same design context.

`import-data-source` adds or updates an API, GraphQL endpoint, warehouse table, dbt model, semantic API, file, manual source, or unknown source in a Phantom Spec. Use it to repair `inspect data-path` blockers by linking source IDs to component IDs and required fields before exporting handoff packs.

`readiness` returns a machine-readable report with `ready`, `errors`, and `warnings`. It exits non-zero when blockers exist, which lets agents and CI stop before generating misleading implementation output. It also warns when the spec is not approved, Figma/design-source mappings are unmapped, or mappings reference missing Phantom view IDs or component IDs, so agents can repair handoff links before implementation work starts.

`export-react` creates a deterministic Vite/React starter with the Phantom Spec, data contract, design workflow contract, design handoff contract, route/view definitions, typed component prop contracts, typed data adapter stub, drill action definitions, placeholder component cards, component-level design-source links, design mapping coverage in the README, and a README that tells engineers what to wire next.

`export-react-build-pack` creates a focused React Product implementation folder with `phantom-spec.json`, `phantom-data-contract.json`, `design-handoff.json`, `implementation-gate.json`, `react-implementation-backlog.json`, `REACT_IMPLEMENTATION_BACKLOG.md`, `REACT_IMPLEMENTATION_NOTES.md`, and `REACT_BUILD_MANIFEST.json`. Use it when an agent or engineer needs the workshop-to-React build contract without generating a runnable starter app.

`export-data-contract` creates `data-contract.json` and `DATA_CONTRACT.md` with fields, metrics, dimensions, component data requirements, filters, drill actions, design workflow, design-source references, and implementation notes. This is the handoff artifact for client APIs, warehouse/dbt models, optional semantic endpoints, and agents that need a stable analytical contract.

`export-powerbi-guide` creates `power-bi-implementation-guide.json` and `POWER_BI_IMPLEMENTATION_GUIDE.md` with the implementation gate, design workflow, Power BI readiness, visual support statuses, field requirements, drill-through notes, blockers, and a build checklist.

`export-handoff-pack` creates a bundled folder with `phantom-spec.json`, `handoff-summary.json`, `implementation-gate.json`, `design-handoff.json`, `HANDOFF_MANIFEST.json`, `README.md`, `data-contract/`, `power-bi/`, and `react-starter/`. `implementation-gate.json`, `handoff-summary.json`, and `HANDOFF_MANIFEST.json` include sign-off status, `implementationGate`, `dataPath`, `designWorkflow`, `designHandoff`, `designMapping`, `workshopIntent`, and `workshopCompleteness`, so agents can gate on approval state, data-path readiness, the Figma-led/Phantom-led workflow, component-level Figma/default provenance, unmapped design sources, or missing business questions, audience, decisions/actions, or acceptance criteria before generating implementation work. This is the preferred consultant-to-engineering handoff when both React Product Mode and Power BI Mode artifacts should travel together.

The browser export menu also provides workshop-friendly implementation exports:

- `Handoff Pack (.zip)` bundles the canonical spec, handoff summary, implementation gate, design handoff, data contract, Power BI guide, React implementation notes, and a machine-readable manifest.
- `React Product Build Pack` creates a React-focused zip with `phantom-spec.json`, `phantom-data-contract.json`, `design-handoff.json`, `implementation-gate.json`, `react-implementation-backlog.json`, `REACT_IMPLEMENTATION_BACKLOG.md`, `REACT_IMPLEMENTATION_NOTES.md`, and `REACT_BUILD_MANIFEST.json`. The CLI equivalent is `export-react-build-pack`.
- `Data Contract` creates a zip with `data-contract.json` and `DATA_CONTRACT.md` for API, warehouse/dbt, semantic endpoint, or agent mapping.
- `Power BI Build Guide` creates a zip with `power-bi-implementation-guide.json` and `POWER_BI_IMPLEMENTATION_GUIDE.md` for constrained Power BI Mode delivery.

Use the CLI `export-handoff-pack` when a runnable React starter folder is required.

## Intended CLI Roadmap

Future commands should include:

- `phantom spec validate <file>`
- `phantom spec summary <file>`
- `phantom spec diff <before> <after>` implemented as `npm run phantom:spec -- diff <before> <after>`
- `phantom spec set-mode <file> react|powerBi --out <file>` implemented as `npm run phantom:spec -- set-mode <file> react|powerBi <out>`
- `phantom spec set-approval <file> draft|in-review|approved --out <file>` implemented as `npm run phantom:spec -- set-approval <file> approved <out>`
- `phantom spec set-workshop-intent <file> --business-questions <text> --audience <text> --decisions <text> --acceptance-criteria <text> --out <file>` implemented as `npm run phantom:spec -- set-workshop-intent <file> ...`
- `phantom spec readiness <file> react|powerBi`
- `phantom spec add-view <file> --id <view-id> --name <name> --out <file>` implemented as `npm run phantom:spec -- add-view <file> ...`
- `phantom spec add-component <file> --view <view-id> --type <type> --title <title> --dimensions <fields> --metrics <fields> --out <file>` implemented as `npm run phantom:spec -- add-component <file> ...`
- `phantom spec add-drill-action <file> --source <component-id> --target-type view --target <view-id> --context <source:target> --out <file>` implemented as `npm run phantom:spec -- add-drill-action <file> ...`
- `phantom export pbi-report <file> --out <dir>`
- `phantom export react-build-pack <file> --out <dir>` implemented as `npm run phantom:spec -- export-react-build-pack <file> <dir>`
- `phantom export powerbi-guide <file> --out <dir>`
- `phantom export handoff-pack <file> --out <dir>`
- `phantom export data-contract <file> --out <dir>`
- `phantom export react <file> --out <dir>`
- `phantom inspect views <file>` implemented as `npm run phantom:spec -- inspect <file> views`
- `phantom inspect components <file>` implemented as `npm run phantom:spec -- inspect <file> components`
- `phantom inspect drill-actions <file>` implemented as `npm run phantom:spec -- inspect <file> drill-actions`
- `phantom inspect data-requirements <file>` implemented as `npm run phantom:spec -- inspect <file> data-requirements`
- `phantom inspect data-path <file>` implemented as `npm run phantom:spec -- inspect <file> data-path`
- `phantom inspect design-sources <file>` implemented as `npm run phantom:spec -- inspect <file> design-sources`
- `phantom inspect design-mapping <file>` implemented as `npm run phantom:spec -- inspect <file> design-mapping`
- `phantom inspect design-workflow <file>` implemented as `npm run phantom:spec -- inspect <file> design-workflow`
- `phantom inspect approval <file>` implemented as `npm run phantom:spec -- inspect <file> approval`
- `phantom inspect implementation-gate <file>` implemented as `npm run phantom:spec -- inspect <file> implementation-gate`
- `phantom inspect workshop-intent <file>` implemented as `npm run phantom:spec -- inspect <file> workshop-intent`
- `phantom inspect react-backlog <file>` implemented as `npm run phantom:spec -- inspect <file> react-backlog`
- `phantom inspect powerbi-build-matrix <file>` implemented as `npm run phantom:spec -- inspect <file> powerbi-build-matrix`
- `phantom inspect handoff-summary <file>` implemented as `npm run phantom:spec -- inspect <file> handoff-summary`
- `phantom import design-source <file> --type figmaFrame --name <name> --url <url> --out <file>` implemented as `npm run phantom:spec -- import-design-source <file> ...`
- `phantom import data-source <file> --type dbt --name <name> --model <model> --fields <fields> --components <ids> --out <file>` implemented as `npm run phantom:spec -- import-data-source <file> ...`

## Current TypeScript API

The public TypeScript API exports the core spec, readiness, design workflow, and handoff artifact creators from `src/export`:

- `createPhantomSpec`
- `validatePhantomSpec`
- `summarizePhantomSpec`
- `checkPhantomReadiness`
- `mergeDesignSourceIntoSpec`
- `createPhantomDesignWorkflow`
- `createPhantomDesignMappingSummary`
- `createPhantomWorkshopIntent`
- `createPhantomWorkshopIntentCompleteness`
- `createPhantomDataContract`
- `createReactImplementationBacklog`
- `createReactProductBuildPack`
- `createPowerBiImplementationGuide`
- `createPhantomHandoffSummary`

## Intended API Roadmap

Future public API work should add filesystem-oriented generators that mirror the CLI without requiring callers to shell out:

- `generateReactStarter`
- `generatePowerBiImplementationPack`
- `generateDataContract`

## Agent Workflow

A strong agent workflow should look like:

1. Export or receive a Phantom Spec JSON.
2. Run CLI validation.
3. Inspect design workflow, design mapping, and workshop intent completeness.
4. Inspect missing data requirements and unsupported visuals.
5. Generate an implementation plan.
6. Generate React starter components or Power BI implementation notes.
7. Run build/tests/readiness checks.
8. Report exact blockers and next actions.

This keeps Phantom useful in human workshops while making it controllable by AI agents and build automation.
