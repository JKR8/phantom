# From Prototype Tool to SI “Accelerator”: Requirements & Roadmap

This document defines what your Power BI drag‑and‑drop designer must add to be credibly positioned inside an SI (e.g., Versent/Infosys) as a **delivery accelerator**—not merely a prototyping tool.

It is written to be actionable for product, design, and engineering.

---

## Executive summary

To reach “accelerator-grade” status, the product must evolve from **individual productivity** (drag/drop + mock data) to a **repeatable delivery system**:

- **Governed standards** (enforced, not advisory)
- **Production-shaped outputs** (PBIP projects ready for Git/CI and continued build)
- **Template library as a product** (catalog + configuration + versioning)
- **Enterprise readiness** (roles, audit, support posture)

Your current strengths (canvas, grid, chart types, scenario data) plus your planned 8 premium templates (star schema + optimized DAX + themes) are an excellent foundation. The gap is mainly: **export quality bar**, **enforceable governance**, **template productization**, and **enterprise operational layer**.

---

## Current state (as provided)

### Today
- Drag-and-drop any Power BI chart type onto a high-res grid canvas
- Auto-fills visuals using backend **scenario data**
- Prototype-first workflow

### Planned
- **8 super high-quality templates**
- Exportable to **PBIP**
- Each template includes:
  - Scenario **star schema** data model
  - **Optimized DAX** for “hard” charts
  - Professional theming with **color options**

---

## Target: What “accelerator” means in an SI

An SI accelerator is something a practice lead can standardize across delivery teams because it:

1. **Reduces cycle time** and rework predictably (time-to-first-usable-dashboard)
2. **Enforces standards** so outputs are consistent across squads/accounts
3. Produces **handover-ready artifacts** that engineers can extend safely
4. Is **supportable** and low-risk in enterprise environments

---

## Accelerator-grade requirements

### 1) PBIP export must be production-shaped (not “best effort”)

**Goal:** A delivery team can export, commit to Git, and continue building without prototype debt.

#### Minimum acceptance criteria
- Exports a **PBIP project** with:
  - Report definition (PBIR) and layout/pages
  - Theme applied (theme JSON)
  - Visuals mapped to fields/measures that exist in the model
- Exports or connects to a **semantic model scaffold**:
  - Clean scenario **star schema** (tables + relationships)
  - Measures in a consistent structure (folders, naming conventions)
- Output is **deterministic**:
  - Same input → same folder/file structure and stable diffs (PR-friendly)
- “First open” works:
  - Opening in Desktop/Service does not result in broken visuals or missing bindings
- Export produces an **export validation report** (see below)

#### Export validation report (must-have)
A machine-readable + human-readable summary that checks:
- Missing fields/measures for visuals
- Invalid relationships or ambiguous paths
- Measures failing evaluation (syntax/semantic)
- Visuals referencing unsupported/unknown formatting props
- Warnings for performance risks (high-cardinality visuals, too many visuals per page, etc.)

**Why it matters:** SIs reject tools that create “prototype debt.” PBIP export is the conversion moment.

---

### 2) Standards must be enforceable (governance engine)

**Goal:** “Power BI CoE in a box”—consistent delivery without requiring senior designers on every project.

#### Minimum standards/governance features
- **Layout system**
  - Defined grid + spacing rules + baseline rhythm
  - Snap-to alignment; consistent margins/gutters
- **Visual defaults**
  - Fonts, titles, labels, axes, borders, padding, legend styles
- **Accessibility**
  - Contrast checks
  - Minimum font sizes
  - Alt-text rules
  - Focus order guidance
- **Naming conventions**
  - Pages, visuals, bookmarks, measures, fields
- **Anti-pattern prevention**
  - Flag “too many visuals”, inconsistent slicers, unreadable legends
  - Warn on expensive patterns (e.g., high-cardinality visuals)
- **Template lock modes (critical)**
  - Lock layout/branding while allowing data mapping changes
  - Guardrails prevent breaking the standard

#### Linting UX expectations
- Clear error vs warning distinction
- “Why this is a problem” explanation
- One-click fix suggestions where possible

**Accelerator test:** A practice lead can say “we use this so every dashboard meets our standards” and be correct.

---

### 3) Template system must be “library + configurator” (not “8 files”)

Your 8 templates are an excellent core, but they must be packaged like a product.

#### Minimum template packaging
Each template ships with:
- Scenario model (star schema)
- Measure pack (optimized DAX for hard charts)
- Page set (overview, detail, drill/diagnostics as appropriate)
- Visual mapping contracts (each visual’s required fields, grain, expected filters)

#### Configuration wizard (export-time)
- Choose color theme (enforce contrast)
- Choose density: compact vs spacious
- Apply client branding: logo + typography set
- Choose metric variants:
  - Currency/units
  - PL/PY, YTD/MTD, etc.
- Optional: select “persona mode” (Ops vs Finance emphasis)

#### Template metadata (catalog)
- Intended personas (e.g., Ops Manager, CFO)
- “Works best for…” + prerequisites
- Complexity rating and performance notes
- Preview screenshots and short narrative (“what this template answers”)

**Accelerator test:** A consultant can pick a template, configure in minutes, and reuse across multiple clients.

---

### 4) Enterprise readiness (the blockers that stop rollouts)

Even internal use gets blocked if these aren’t handled.

#### Minimum enterprise features
- Designer workflow requires **no client production data**
  - Scenario/mock data only by default
- Clear data handling model:
  - If connecting to client data is ever supported, it must be explicit, controlled, and auditable
- Authentication:
  - SSO (or credible roadmap) + tenant controls
- Roles:
  - Template author (practice)
  - Project designer (delivery)
  - Viewer/reviewer (stakeholder)
- Auditability:
  - Template version used
  - Export events
  - Who changed what and when
- Versioning:
  - Templates have versions and changelogs
  - Exports include template version metadata
- Supportability:
  - Release notes
  - Rollback strategy
  - Known-issues list

**Accelerator test:** A practice lead is comfortable standardizing on it across client programs.

---

## What you already have vs what’s still needed

### You already have
- Drag/drop canvas + high-res grid
- Broad Power BI visual catalog
- Scenario backend for auto-population
- Plan for 8 premium templates (model + DAX + themes)

### Still needed for accelerator status
1. **PBIP export quality bar** (deterministic, production-shaped, low rework)
2. **Governance enforcement** (lock modes + standards engine + linting)
3. **Template productization** (catalog, configurator, metadata, versions)
4. **Enterprise operational layer** (roles, audit, support posture)

---

## Roadmap to “accelerator position” (minimum viable path)

### Phase 1 — PBIP export engineers trust (the wedge)
**Deliver**
- Deterministic PBIP project exporter
- Scenario model + measures export in clean structure
- Export validation report

**Definition of done**
- A delivery engineer can open exported PBIP, run it, and commit with clean diffs.

---

### Phase 2 — Standards engine + template locks (the CoE angle)
**Deliver**
- Layout rules + visual defaults
- Template lock modes
- Standards linting panel (errors/warnings + fix suggestions)

**Definition of done**
- Practice can enforce “this is how we build dashboards.”

---

### Phase 3 — Template library productization (8 templates become a catalogue)
**Deliver**
- Catalog browsing + metadata + previews
- Configuration wizard (theme/density/logo/metric variants)
- Template versioning + changelog

**Definition of done**
- Consultants can choose + configure without needing custom design per project.

---

### Phase 4 — SI rollout kit (tool → accelerator)
**Deliver**
- Internal playbook (“how we use this on client work”)
- Enablement pack (training, quickstart, examples)
- Governance model:
  - Who owns templates
  - How updates roll out
  - How exceptions are handled

**Definition of done**
- A practice lead can announce it as a standard accelerator.

---

## Recommended “accelerator claim” (once Phases 1–2 are done)

> “We can stand up a production-shaped Power BI report (PBIP repo-ready) in days, not weeks, using a governed template library and optimized measures—delivering consistent design and predictable handover.”

---

## High-leverage UX design focus areas

Your UX designer will have maximum impact on:

1. **Template selection flow**
   - browse, compare, preview, understand “fit”
2. **Configuration wizard**
   - brand/density/metric options without overwhelming users
3. **Governance feedback UX**
   - linting clarity (“what/why/how to fix”)
4. **Stakeholder review mode**
   - shareable preview, comment pins, approval checkpoints

---

## Suggested artifacts for engineering (optional next step)

If you want to operationalize this for a team, generate:
- PBIP export file/folder spec
- Template metadata schema (JSON)
- Governance rule registry (YAML) + severity model
- Export validation report schema (JSON)
- “Lock modes” permissions matrix (role → allowed actions)

---

## Appendix: Accelerator readiness checklist

### PBIP export
- [ ] Deterministic export structure + stable diffs
- [ ] All visuals bound to model fields/measures
- [ ] Theme applied and validated
- [ ] Export validation report generated
- [ ] “First open” produces a functioning report

### Standards/governance
- [ ] Layout rules + snap behavior
- [ ] Default visual styling
- [ ] Accessibility checks
- [ ] Naming conventions enforced
- [ ] Template lock modes implemented
- [ ] Lint panel with fix guidance

### Templates
- [ ] 8 templates packaged with model + DAX
- [ ] Catalog with previews + metadata
- [ ] Configurator wizard
- [ ] Versioning + changelogs

### Enterprise
- [ ] No client data required for design
- [ ] Roles and permissions
- [ ] Audit log + export metadata
- [ ] Support posture (release notes, rollback)
