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

`inspect` returns focused JSON for `components`, `drill-actions`, or `data-requirements`, so agents can query the spec before deciding what to generate or validate.

`readiness` returns a machine-readable report with `ready`, `errors`, and `warnings`. It exits non-zero when blockers exist, which lets agents and CI stop before generating misleading implementation output.

`export-react` creates a deterministic Vite/React starter with the Phantom Spec, data contract, drill action definitions, placeholder component cards, and a README that tells engineers what to wire next.

`export-data-contract` creates `data-contract.json` and `DATA_CONTRACT.md` with fields, metrics, dimensions, component data requirements, filters, drill actions, design-source references, and implementation notes. This is the handoff artifact for client APIs, warehouse/dbt models, optional semantic endpoints, and agents that need a stable analytical contract.

`export-powerbi-guide` creates `power-bi-implementation-guide.json` and `POWER_BI_IMPLEMENTATION_GUIDE.md` with Power BI readiness, visual support statuses, field requirements, drill-through notes, blockers, and a build checklist.

`export-handoff-pack` creates a bundled folder with `phantom-spec.json`, `HANDOFF_MANIFEST.json`, `README.md`, `data-contract/`, `power-bi/`, and `react-starter/`. This is the preferred consultant-to-engineering handoff when both React Product Mode and Power BI Mode artifacts should travel together.

The browser export menu also provides `Handoff Pack (.zip)`, a workshop-friendly bundle with the canonical spec, data contract, Power BI guide, React implementation notes, and a machine-readable manifest. Use the CLI `export-handoff-pack` when a runnable React starter folder is required.

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

## Intended API Roadmap

The public TypeScript API should expose:

- `createPhantomSpec`
- `validatePhantomSpec`
- `summarizePhantomSpec`
- `checkReactReadiness`
- `checkPowerBiReadiness`
- `generateReactStarter`
- `generatePowerBiImplementationPack`
- `generateDataContract`

## Agent Workflow

A strong agent workflow should look like:

1. Export or receive a Phantom Spec JSON.
2. Run CLI validation.
3. Inspect missing data requirements and unsupported visuals.
4. Generate an implementation plan.
5. Generate React starter components or Power BI implementation notes.
6. Run build/tests/readiness checks.
7. Report exact blockers and next actions.

This keeps Phantom useful in human workshops while making it controllable by AI agents and build automation.
