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
npm run phantom:spec -- export-data-contract path/to/spec.json ./handoff
npm run phantom:spec -- export-powerbi-guide path/to/spec.json ./handoff
npm run phantom:spec -- export-handoff-pack path/to/spec.json ./handoff-pack
npm run phantom:spec -- inspect path/to/spec.json components
npm run phantom:spec -- inspect path/to/spec.json drill-actions
npm run phantom:spec -- inspect path/to/spec.json data-requirements
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

`inspect` returns focused JSON for `components`, `drill-actions`, `data-requirements`, `design-sources`, `design-mapping`, `design-workflow`, `approval`, `implementation-gate`, `workshop-intent`, `react-backlog`, `powerbi-build-matrix`, or `handoff-summary`, so agents can query the spec before deciding what to generate or validate.

`inspect design-sources` returns the current design entry point and linked design sources, including any mapped Phantom view IDs or component IDs. Use it to decide whether the project is Figma-led or Phantom-led before generating implementation tasks.

`inspect design-mapping` returns design-source mapping coverage: total sources, mapped/unmapped counts, linked view IDs, linked component IDs, and source IDs without mappings. Use it as a lightweight gate before implementation work when the project is Figma-led.

`inspect design-workflow` returns the current design plane (`figma` or `phantom`), Phantom's role in that workflow, mapping status, required next steps, supported handoff modes, and suggested agent commands. Use it first when deciding whether to pull in Figma references or proceed with Phantom defaults.

`inspect approval` returns sign-off status, whether the spec is approved for implementation, guidance, and required next steps. Use it before generating code or Power BI build notes.

`inspect implementation-gate` returns a single implementation readiness decision that combines approval, design-source mapping, workshop intent completeness, React readiness, Power BI readiness, blocking reasons, warnings, and required next steps. Use it as the safest first command before any agent starts engineering work.

`inspect workshop-intent` returns the business questions, audience, decisions/actions, acceptance criteria, build notes, and a completeness object with present/missing workshop fields. Use it before generating React or Power BI implementation work so agents preserve the client workshop intent and can pause when the brief is too thin.

`inspect react-backlog` returns the same machine-readable implementation task list used by React starter and handoff pack exports. Use it when an agent needs to plan React work without generating files.

`inspect powerbi-build-matrix` returns the same readiness summary, visual support statuses, field requirements, drill-through rows, and build checklist used by the Power BI implementation guide. Use it when an agent needs to assess Power BI Mode fit without generating guide files.

`inspect handoff-summary` returns project metadata including sign-off status, design workflow, design mapping coverage, workshop intent, workshop completeness, React and Power BI readiness, a recommended handoff target, field/component/task counts, Power BI visual support counts, and next actions in one JSON payload. Use it as the first agent check after a workshop.

`import-design-source` adds or updates a Figma frame, Figma component, screenshot, Phantom default, or external reference in a Phantom Spec. Use the npm-friendly positional form `type name url frame-id notes out-spec`; direct `node tools/phantom-spec-cli.mjs ...` usage can also pass named flags such as `--type`, `--name`, `--url`, `--views`, `--components`, and `--out`. It writes a new spec to the positional output path or `--out`, marks non-Phantom sources as `figma-led`, and mirrors the source into `project.specification` so browser exports, CLI exports, readiness checks, and agents see the same design context.

`readiness` returns a machine-readable report with `ready`, `errors`, and `warnings`. It exits non-zero when blockers exist, which lets agents and CI stop before generating misleading implementation output. It also warns when the spec is not approved, Figma/design-source mappings are unmapped, or mappings reference missing Phantom view IDs or component IDs, so agents can repair handoff links before implementation work starts.

`export-react` creates a deterministic Vite/React starter with the Phantom Spec, data contract, design workflow contract, typed data adapter stub, drill action definitions, placeholder component cards, component-level design-source links, design mapping coverage in the README, and a README that tells engineers what to wire next.

`export-data-contract` creates `data-contract.json` and `DATA_CONTRACT.md` with fields, metrics, dimensions, component data requirements, filters, drill actions, design workflow, design-source references, and implementation notes. This is the handoff artifact for client APIs, warehouse/dbt models, optional semantic endpoints, and agents that need a stable analytical contract.

`export-powerbi-guide` creates `power-bi-implementation-guide.json` and `POWER_BI_IMPLEMENTATION_GUIDE.md` with the design workflow, Power BI readiness, visual support statuses, field requirements, drill-through notes, blockers, and a build checklist.

`export-handoff-pack` creates a bundled folder with `phantom-spec.json`, `handoff-summary.json`, `HANDOFF_MANIFEST.json`, `README.md`, `data-contract/`, `power-bi/`, and `react-starter/`. `handoff-summary.json` and `HANDOFF_MANIFEST.json` both include sign-off status, `implementationGate`, `designWorkflow`, `designMapping`, `workshopIntent`, and `workshopCompleteness`, so agents can gate on approval state, the Figma-led/Phantom-led workflow, unmapped design sources, or missing business questions, audience, decisions/actions, or acceptance criteria before generating implementation work. This is the preferred consultant-to-engineering handoff when both React Product Mode and Power BI Mode artifacts should travel together.

The browser export menu also provides `Handoff Pack (.zip)`, a workshop-friendly bundle with the canonical spec, handoff summary, data contract, Power BI guide, React implementation notes, and a machine-readable manifest. Use the CLI `export-handoff-pack` when a runnable React starter folder is required.

## Intended CLI Roadmap

Future commands should include:

- `phantom spec validate <file>`
- `phantom spec summary <file>`
- `phantom spec diff <before> <after>` implemented as `npm run phantom:spec -- diff <before> <after>`
- `phantom spec readiness <file> react|powerBi`
- `phantom export pbi-report <file> --out <dir>`
- `phantom export powerbi-guide <file> --out <dir>`
- `phantom export handoff-pack <file> --out <dir>`
- `phantom export data-contract <file> --out <dir>`
- `phantom export react <file> --out <dir>`
- `phantom inspect components <file>` implemented as `npm run phantom:spec -- inspect <file> components`
- `phantom inspect drill-actions <file>` implemented as `npm run phantom:spec -- inspect <file> drill-actions`
- `phantom inspect data-requirements <file>` implemented as `npm run phantom:spec -- inspect <file> data-requirements`
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

## Intended API Roadmap

The public TypeScript API should expose:

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
- `createPowerBiImplementationGuide`
- `createPhantomHandoffSummary`
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
