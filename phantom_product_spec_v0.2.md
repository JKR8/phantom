---
phantom_spec_version: 0.2
schema_id: phantom.spec.v0.2
id: phantom
name: Phantom
version: 0.2.0
status: draft
type: workshop_native_analytics_spec_tool
context: greenfield
app_platform: web_app
export_targets:
  - react_app
  - power_bi_build_notes
  - approval_pack
primary_workflow: stakeholder_workshop
owners: []

roles:
  - id: facilitator
    label: Workshop facilitator
    description: Runs the stakeholder session and edits the spec live.
  - id: stakeholder
    label: Business stakeholder
    description: Reacts to the rendered mockup, answers prompts, comments on intent.
  - id: approver
    label: Approver
    description: Signs off on a specific spec version.
  - id: analytics_owner
    label: Analytics owner
    description: Owns metric definitions, grain, source bindings, and acceptance rules.
  - id: data_engineer
    label: Data engineer
    description: Reviews source fields, data contract gaps, and upstream feasibility.
  - id: dashboard_builder
    label: Dashboard builder
    description: Implements the approved spec in React, Power BI, or a downstream BI tool.
  - id: agent
    label: AI or coding agent
    description: Reads and mutates structured spec blocks through controlled operations.

approval:
  state: pending
  current_version: 0.2.0-draft
  required_approvals:
    - approver
    - analytics_owner
  history:
    - version: 0.2.0-draft
      date: 2026-05-15
      approver: null
      state: pending
      notes: Initial executable draft.

readiness:
  score: 0.67
  threshold: 0.85
  gates:
    require_current_version_approval: true
    require_no_unowned_data_gaps: true
    require_all_drill_targets_defined: true
  formula:
    required_fields_completeness_weight: 0.40
    metric_completeness_weight: 0.25
    interaction_completeness_weight: 0.20
    target_render_compatibility_weight: 0.15
  blocking_issues:
    - id: missing_export_validation
      owner_role: dashboard_builder
      severity: medium
      description: Validate that the React export artifact can be generated from this spec.
    - id: missing_pilot_workflow
      owner_role: facilitator
      severity: high
      description: Run one paid or unpaid consultancy-style pilot and capture timing vs current workflow.

oss_strategy:
  phase_1_open_source:
    - package: '@phantom/spec'
      contents: Schema, block format, validation CLI, example specs.
    - package: '@phantom/validator'
      contents: Readiness scoring, missing-field detection, schema migrations.
  phase_2_open_source_after_pilots:
    - package: '@phantom/visuals'
      contents: React components rendered from Phantom specs.
    - package: '@phantom/react-adapters'
      contents: React scaffold exporters and adapter stubs.
  proprietary:
    - Authoring app
    - Context-aware elicitation engine
    - Collaboration, comments, approvals, and version history
    - Cloud workspace
    - Private IP library
    - Premium export workflows
---

# Phantom — Product Spec v0.2

> This document is both a product spec for Phantom and an example of the Phantom spec format applied to Phantom itself. If this file cannot drive a renderer, validator, and implementation agent, the format is wrong.

## 1. Intent

Phantom is a workshop-native elicitation engine for analytical products.

The live mockup is the conversation surface with the stakeholder. The durable output is not the mockup itself; it is a versioned, agent-readable analytical build contract that captures metric definitions, grain, drill paths, data-contract requirements, target-render constraints, acceptance rules, and approval state.

Phantom is not a dashboard design tool, a BI platform, or a generic AI dashboard generator. It is the spec layer between unstable stakeholder reactions and stable, build-ready analytical product definitions.

## 2. Primary Audience

| Segment | Why they care | Buying trigger |
|---|---|---|
| BI / analytics consultancies with 2–50 people | Workshops are where scope ambiguity is created, but the handoff artifact is usually weak. | A client dashboard or reporting rebuild with expensive discovery and rework risk. |
| In-house analytics teams | Stakeholders approve screenshots but later dispute metric meaning, drill behavior, or data definitions. | Repeated dashboard churn, unclear requirements, or contested metric definitions. |
| Product teams building customer-facing analytics | Product, design, data, and engineering need one executable artifact. | Embedded analytics or reporting features where design, data, and engineering must align. |

## 3. Business Questions Phantom Answers

For the consultant or analytics team:

- What is the client actually asking for after reacting to a rendered mockup?
- What analytical scaffolding is still missing?
- Is the spec build-ready, or is something undefined?
- Can a human builder or AI agent build directly from this artifact?
- Which approved patterns can be reused from previous projects?

For the stakeholder or client:

- Does this match the decision I am trying to make?
- Which metric definitions, filters, drill paths, assumptions, and gaps am I approving?
- What will change if I approve this version?

## 4. Core Loop

1. Create a Phantom project and set context: greenfield or brownfield, audience, business questions, app platform, export targets, and connected semantic layer if present.
2. Compose pages from the analytical component library. Each placement is a spec mutation, not a pixel mutation.
3. The elicitation engine detects missing fields from the structured spec and asks only for unresolved scaffolding: metric grain, source binding, null behavior, drill target, permissions, accepted gaps, and target-render constraints.
4. The rendered preview updates live from the spec. Stakeholder reactions mutate the spec, not a canvas.
5. Decisions, comments, accepted gaps, and approvals are captured against a specific spec version.
6. Export build artifacts: React component scaffolds, mock data, types, Power BI build notes, approval pack, and data-contract YAML.

---

## 5. Structured Spec Blocks

Phantom specs are Markdown files with YAML frontmatter plus embedded structured blocks. The Markdown is for humans; the blocks are for renderers, validators, exporters, and agents.

### 5.1 Block Convention

Use fenced YAML blocks with a stable `phantom_block` key.

```yaml
phantom_block:
  id: example_block
  type: example
  version: 0.2
```

Agents should edit structured blocks through validated operations, not arbitrary prose rewrites.

---

### 5.2 Pages

```yaml
phantom_block:
  id: pages
  type: page_registry
  version: 0.2
pages:
  - id: project_dashboard
    title: Project dashboard
    purpose: Shows project status, pages, readiness, recent activity, comments, and approval state.
    primary_roles: [facilitator, analytics_owner, dashboard_builder]
    layout: dashboard_grid
    components:
      - project_header
      - readiness_score_panel
      - page_list_table
      - activity_feed
    acceptance:
      - Displays current spec version.
      - Displays build readiness score and blocking issues.
      - Shows approval state for each page.

  - id: spec_canvas
    title: Spec canvas
    purpose: Primary workshop surface for editing the spec and showing the rendered preview.
    primary_roles: [facilitator, stakeholder, analytics_owner]
    layout: three_panel_with_source_drawer
    regions:
      left: page_navigation_and_component_palette
      center: rendered_preview_from_spec
      right: context_aware_elicitation_panel
      bottom: collapsible_spec_source_view
    components:
      - component_palette
      - rendered_preview
      - elicitation_panel
      - source_drawer
    acceptance:
      - Every component placement creates or updates a structured spec object.
      - Selecting a component shows unresolved prompts for that object.
      - Manual source edits are validated before becoming current state.

  - id: metric_definition
    title: Metric definition
    purpose: Defines reusable metrics with grain, formula, null behavior, comparison rules, and source binding.
    primary_roles: [analytics_owner, facilitator, data_engineer]
    layout: side_panel_or_modal
    components:
      - metric_form
      - semantic_layer_binding_picker
      - metric_status_badge
    acceptance:
      - Metrics cannot be approved without grain and null behavior.
      - Brownfield semantic-layer bindings suppress redundant prompts only when required attributes exist.

  - id: data_contract
    title: Data contract
    purpose: Derived manifest of fields, sources, types, cardinalities, refresh cadence, row identity, and entity identity.
    primary_roles: [data_engineer, analytics_owner, dashboard_builder]
    layout: table_with_gap_filters
    components:
      - required_fields_table
      - source_binding_map
      - accepted_gaps_panel
    acceptance:
      - Unresolved fields are marked `to_be_defined`.
      - Accepted gaps require owner, reason, and resolution date.

  - id: approval_view
    title: Approval view
    purpose: Client-facing read-only render with comments, version history, page approvals, and approve-current-version workflow.
    primary_roles: [stakeholder, approver, facilitator]
    layout: read_only_review
    components:
      - approval_header
      - rendered_pages
      - comment_threads
      - approval_action
    acceptance:
      - Approval is always tied to a version hash or immutable version id.
      - Approval pack includes assumptions, accepted gaps, and metric definitions.

  - id: ip_library
    title: IP library
    purpose: Searchable repository of reusable specs, pages, metric definitions, components, and project patterns.
    primary_roles: [facilitator, analytics_owner, dashboard_builder]
    layout: searchable_library
    components:
      - pattern_search
      - pattern_cards
      - import_preview
    acceptance:
      - Imported patterns retain provenance.
      - Users can tag by industry, data domain, target render, and complexity.

  - id: export_panel
    title: Export panel
    purpose: Shows target-specific readiness, blocking issues, and export artifacts.
    primary_roles: [dashboard_builder, facilitator, analytics_owner]
    layout: target_tabs_with_artifact_preview
    components:
      - target_readiness_tabs
      - blocking_issues_list
      - artifact_preview
      - export_action
    acceptance:
      - Exports are blocked when target readiness is below threshold unless explicitly overridden by an approver.
```

---

### 5.3 Component Library

```yaml
phantom_block:
  id: component_library
  type: component_library
  version: 0.2
render_target_statuses:
  - react_ready
  - pbi_safe
  - pbi_approximate
  - design_only
component_types:
  - group: KPI
    types:
      - id: kpi_card
        required_bindings: [metric]
        optional_bindings: [comparison_metric, target_value, sparkline_series]
        prompts: [metric_grain, null_behavior, comparison_rule, source_binding]
        render_targets: { react: react_ready, power_bi: pbi_safe }
      - id: kpi_card_with_sparkline
        required_bindings: [metric, time_dimension]
        optional_bindings: [comparison_metric, target_value]
        prompts: [metric_grain, null_behavior, time_grain, source_binding]
        render_targets: { react: react_ready, power_bi: pbi_safe }
      - id: comparison_kpi
        required_bindings: [metric, comparison_rule]
        optional_bindings: [target_value]
        prompts: [metric_grain, null_behavior, comparison_rule, source_binding]
        render_targets: { react: react_ready, power_bi: pbi_safe }

  - group: Charts
    types:
      - id: ranked_bar
        required_bindings: [metric, dimension]
        optional_bindings: [sort_rule, top_n]
        prompts: [metric_grain, dimension_cardinality, sort_rule, null_behavior]
        render_targets: { react: react_ready, power_bi: pbi_safe }
      - id: line
        required_bindings: [metric, time_dimension]
        optional_bindings: [series_dimension, comparison_period]
        prompts: [time_grain, missing_period_behavior, null_behavior]
        render_targets: { react: react_ready, power_bi: pbi_safe }
      - id: waterfall
        required_bindings: [metric, step_dimension]
        optional_bindings: [start_value, end_value]
        prompts: [step_order, subtotal_behavior, null_behavior]
        render_targets: { react: react_ready, power_bi: pbi_approximate }
      - id: heatmap
        required_bindings: [metric, x_dimension, y_dimension]
        optional_bindings: [color_scale]
        prompts: [dimension_cardinality, color_scale_meaning, null_behavior]
        render_targets: { react: react_ready, power_bi: pbi_safe }

  - group: Tables
    types:
      - id: data_table
        required_bindings: [columns]
        optional_bindings: [default_sort, row_action]
        prompts: [row_identity, pagination_behavior, export_permission]
        render_targets: { react: react_ready, power_bi: pbi_safe }
      - id: matrix
        required_bindings: [rows, columns, metric]
        optional_bindings: [subtotal_rules]
        prompts: [aggregation_behavior, subtotal_behavior, null_behavior]
        render_targets: { react: react_ready, power_bi: pbi_safe }

  - group: Filters
    types:
      - id: date_range
        required_bindings: [time_dimension]
        optional_bindings: [default_range]
        prompts: [default_range, timezone, fiscal_calendar]
        render_targets: { react: react_ready, power_bi: pbi_safe }
      - id: dropdown_filter
        required_bindings: [dimension]
        optional_bindings: [default_selection, multi_select]
        prompts: [dimension_cardinality, default_selection, cross_filter_scope]
        render_targets: { react: react_ready, power_bi: pbi_safe }

  - group: Narrative
    types:
      - id: insight_callout
        required_bindings: [text_or_rule]
        optional_bindings: [metric, severity]
        prompts: [insight_source, owner, update_cadence]
        render_targets: { react: react_ready, power_bi: design_only }
      - id: methodology_note
        required_bindings: [text]
        optional_bindings: [linked_metrics]
        prompts: [owner, approval_required]
        render_targets: { react: react_ready, power_bi: pbi_approximate }

  - group: States
    types:
      - id: empty
        required_bindings: [empty_condition, message]
        optional_bindings: [recovery_action]
        prompts: [empty_condition, recovery_action]
        render_targets: { react: react_ready, power_bi: pbi_approximate }
      - id: no_access
        required_bindings: [permission_scope, message]
        optional_bindings: [request_access_action]
        prompts: [permission_scope, owner]
        render_targets: { react: react_ready, power_bi: pbi_approximate }
```

---

### 5.4 Example Component Instances

These are concrete instances from Phantom’s own product spec. They are intentionally simple enough for a renderer and validator to consume.

```yaml
phantom_block:
  id: component_instances
  type: component_instance_registry
  version: 0.2
components:
  - id: readiness_score_panel
    page_id: project_dashboard
    type: kpi_card
    title: Build readiness
    bindings:
      metric: build_readiness_score
      dimensions: []
    render_targets:
      react: react_ready
      power_bi: pbi_safe
    elicitation:
      missing_fields: []
      suppressed_prompts: []
    acceptance:
      - Shows score as a percentage.
      - Shows threshold.
      - Links to blocking issues.

  - id: page_list_table
    page_id: project_dashboard
    type: data_table
    title: Pages
    bindings:
      columns:
        - page_id
        - title
        - approval_state
        - readiness_score
        - blocking_issue_count
      row_identity: page_id
    render_targets:
      react: react_ready
      power_bi: pbi_safe
    elicitation:
      missing_fields: []
      suppressed_prompts: []
    acceptance:
      - One row per page.
      - Clicking a row opens the selected page in the spec canvas.

  - id: elicitation_panel
    page_id: spec_canvas
    type: insight_callout
    title: Missing scaffolding prompts
    bindings:
      text_or_rule: show_required_prompts_for_selected_spec_object
      metric: unresolved_prompt_count
    render_targets:
      react: react_ready
      power_bi: design_only
    elicitation:
      missing_fields:
        - pbi_fallback_behavior
      suppressed_prompts: []
    acceptance:
      - Shows only prompts relevant to the selected spec object.
      - Shows why each prompt is required.
      - Records confirmed answers as structured spec mutations.
```

---

### 5.5 Metrics

```yaml
phantom_block:
  id: metrics
  type: metric_registry
  version: 0.2
metrics:
  - id: build_readiness_score
    display_name: Build readiness score
    definition: Weighted measure of whether the current spec version is ready for implementation in the selected target render.
    formula: >-
      0.40 * required_fields_completeness
      + 0.25 * metric_completeness
      + 0.20 * interaction_completeness
      + 0.15 * target_render_compatibility
    grain: spec_version
    format: percentage_0dp
    null_behavior: Missing category scores count as zero.
    comparison_rules:
      - compare_to_threshold: 0.85
      - compare_to_previous_version: true
    source_binding:
      type: internal
      path: phantom.validator.readiness_score
    owner_role: analytics_owner
    status: draft

  - id: unresolved_prompt_count
    display_name: Unresolved prompt count
    definition: Count of required elicitation prompts that have not been answered or accepted as explicit gaps.
    formula: count(required_prompts where state in ['unanswered', 'rejected'])
    grain: spec_object
    format: integer
    null_behavior: Empty prompt set returns 0.
    comparison_rules:
      - lower_is_better: true
    source_binding:
      type: internal
      path: phantom.validator.prompts
    owner_role: facilitator
    status: draft

  - id: target_render_compatibility
    display_name: Target render compatibility
    definition: Share of component instances that are compatible with the selected export target without manual workaround.
    formula: compatible_component_instances / total_component_instances
    grain: spec_version_by_target_render
    format: percentage_0dp
    null_behavior: If there are no component instances, score is 0.
    comparison_rules:
      - compare_to_threshold: 0.85
    source_binding:
      type: internal
      path: phantom.validator.target_render_compatibility
    owner_role: dashboard_builder
    status: draft
```

---

### 5.6 Readiness Scoring

```yaml
phantom_block:
  id: readiness_scoring
  type: readiness_model
  version: 0.2
readiness_model:
  threshold: 0.85
  weighted_score:
    required_fields_completeness:
      weight: 0.40
      numerator: required_fields_with_valid_values
      denominator: total_required_fields
    metric_completeness:
      weight: 0.25
      numerator: metrics_with_grain_null_behavior_owner_and_source_binding
      denominator: total_metrics
    interaction_completeness:
      weight: 0.20
      numerator: interactions_with_trigger_source_target_filter_context_and_back_behavior
      denominator: total_interactions
    target_render_compatibility:
      weight: 0.15
      numerator: component_instances_not_marked_design_only_for_selected_target
      denominator: total_component_instances
  gates:
    - id: current_version_approval
      required: true
      pass_when: approval.state == 'approved' and approval.version == current_version
    - id: no_unowned_data_gaps
      required: true
      pass_when: all(data_contract.fields where source == 'to_be_defined' have accepted_gap.owner_role)
    - id: all_drill_targets_defined
      required: true
      pass_when: all(interactions where type starts_with 'drill_' have target.id)
  build_ready_when:
    - weighted_score >= readiness_model.threshold
    - all_required_gates_pass == true
```

---

### 5.7 Data Contract

The data contract is derived from components, metrics, interactions, and export targets. It can be edited only through source bindings, accepted gaps, and owner assignments.

```yaml
phantom_block:
  id: data_contract_preview
  type: data_contract
  version: 0.2
data_contract:
  derivation: derived_from_metrics_components_interactions_and_exports
  fields:
    - id: spec_version_id
      display_name: Spec version ID
      type: string
      source: phantom_project_store
      required_by: [build_readiness_score, approval_view, export_panel]
      cardinality_expectation: one_per_spec_version
      row_identity: spec_version_id
      entity_identity: spec_version
      refresh_cadence: on_spec_mutation
      owner_role: facilitator
      status: defined

    - id: component_id
      display_name: Component ID
      type: string
      source: phantom_spec_file
      required_by: [page_list_table, target_render_compatibility]
      cardinality_expectation: many_per_spec_version
      row_identity: component_id
      entity_identity: component_instance
      refresh_cadence: on_spec_mutation
      owner_role: dashboard_builder
      status: defined

    - id: approval_state
      display_name: Approval state
      type: enum[pending, approved, rejected, revoked]
      source: phantom_project_store
      required_by: [approval_view, project_dashboard]
      cardinality_expectation: one_per_spec_version_per_required_role
      row_identity: approval_event_id
      entity_identity: approval_event
      refresh_cadence: on_approval_event
      owner_role: approver
      status: defined

    - id: pbi_fallback_behavior
      display_name: Power BI fallback behavior
      type: string
      source: to_be_defined
      required_by: [elicitation_panel, export_panel]
      cardinality_expectation: one_per_design_only_or_pbi_approximate_component
      row_identity: component_id
      entity_identity: export_constraint
      refresh_cadence: on_export_validation
      owner_role: dashboard_builder
      status: accepted_gap
      accepted_gap:
        owner_role: dashboard_builder
        reason: Power BI export is limited to build notes in v1.
        resolution_target: post_v1
```

---

### 5.8 Interactions

Interactions are first-class spec objects, not visual flourishes.

```yaml
phantom_block:
  id: interactions
  type: interaction_registry
  version: 0.2
interactions:
  - id: select_page_from_project_dashboard
    type: open_page
    trigger: click
    source_component: page_list_table
    target:
      type: page
      id: spec_canvas
    filter_context:
      carry:
        - page_id
    back_behavior: return_to_project_dashboard
    permission_scope: project_member
    acceptance:
      - Opens selected page in the spec canvas.
      - Preserves selected spec version.

  - id: select_component_in_canvas
    type: inspect_spec_object
    trigger: click
    source_component: rendered_preview
    target:
      type: panel
      id: elicitation_panel
    filter_context:
      carry:
        - component_id
        - page_id
    back_behavior: none
    permission_scope: project_member
    acceptance:
      - Shows prompts for selected component.
      - Shows metric and data-contract dependencies.

  - id: approve_current_version
    type: approval_action
    trigger: click
    source_component: approval_action
    target:
      type: mutation
      id: approval.history.append
    filter_context:
      carry:
        - version
        - approver_role
        - approval_notes
    back_behavior: stay_on_approval_view
    permission_scope: approver
    acceptance:
      - Writes immutable approval event.
      - Locks approval to current version id.
      - Marks approval stale when spec version changes.

  - id: export_react_app
    type: export_action
    trigger: click
    source_component: export_action
    target:
      type: artifact
      id: react_app_export
    filter_context:
      carry:
        - version
        - export_target
        - selected_pages
    back_behavior: stay_on_export_panel
    permission_scope: dashboard_builder
    acceptance:
      - Generates React scaffold, TypeScript types, mock data, route definitions, and adapter stubs.
      - Fails with blocking issues when readiness gates do not pass.
```

---

### 5.9 Elicitation Rules

```yaml
phantom_block:
  id: elicitation_rules
  type: elicitation_rule_registry
  version: 0.2
rules:
  - id: require_metric_scaffolding_for_kpi
    when:
      component_type_in: [kpi_card, kpi_card_with_sparkline, comparison_kpi]
    require:
      - metric.display_name
      - metric.definition
      - metric.grain
      - metric.null_behavior
      - metric.source_binding
    suppress_when:
      - brownfield_semantic_layer_has_all_required_fields

  - id: require_drill_target
    when:
      interaction_type_in: [drill_to_entity, drill_to_detail_page, drill_to_external_app]
    require:
      - interaction.target.type
      - interaction.target.id
      - interaction.filter_context.carry
      - interaction.back_behavior

  - id: require_pbi_fallback_for_approximate_or_design_only
    when:
      export_targets_include: [power_bi_build_notes]
      component_render_target_in:
        power_bi: [pbi_approximate, design_only]
    require:
      - pbi_fallback_behavior
      - accepted_gap.owner_role
      - accepted_gap.reason
      - accepted_gap.resolution_target

  - id: require_accepted_gap_metadata
    when:
      field_status: accepted_gap
    require:
      - accepted_gap.owner_role
      - accepted_gap.reason
      - accepted_gap.resolution_target
```

---

### 5.10 Export Targets

```yaml
phantom_block:
  id: export_targets
  type: export_target_registry
  version: 0.2
exports:
  - id: react_app
    label: React app scaffold
    maturity: v1_target
    artifacts:
      - page_component_scaffolds
      - props_derived_from_spec
      - TypeScript_data_contract_types
      - mock_data_generator
      - route_definitions
      - data_adapter_stubs
    adapter_stubs:
      - REST
      - GraphQL
      - Cube
    readiness_requirements:
      - build_readiness_score >= 0.85
      - no_missing_required_component_bindings
      - no_unowned_data_contract_gaps

  - id: power_bi_build_notes
    label: Power BI build notes
    maturity: v1_target
    artifacts:
      - theme_json
      - layout_notes
      - visual_mapping_table
      - data_contract_yaml
      - known_workarounds
    readiness_requirements:
      - all_pbi_approximate_or_design_only_components_have_fallback_behavior
      - all_metrics_have_grain_and_null_behavior
    explicit_limitation: Full PBIP or PBIT fidelity is out of scope for v1.

  - id: approval_pack
    label: Client approval pack
    maturity: v1_target
    artifacts:
      - read_only_rendered_pages
      - metric_definitions
      - assumptions
      - accepted_gaps
      - data_contract_summary
      - approval_log
    readiness_requirements:
      - all_pages_have_human_readable_purpose
      - all_accepted_gaps_have_owner_and_reason
```

---

## 6. Build Notes for Phantom Itself

### 6.1 Product Shape

Phantom v1 should be a web app with a spec-first architecture:

- React + TypeScript front end.
- Canvas renders from the structured spec, not from freeform pixels.
- Project store in Postgres for v1.
- Git-backed storage optional after the workflow is validated.
- Markdown-with-YAML-frontmatter is the human-readable import/export format.
- Structured embedded blocks are the machine-readable contract.

### 6.2 Elicitation Engine

The v1 elicitation engine should be rules-first and LLM-assisted.

Rules determine which fields are required for a component, context, and export target. LLMs may suggest likely answers from a project brief, transcript, prior specs, or connected semantic layer. In v1, LLM suggestions should never silently become approved spec state; a human must confirm or edit them.

### 6.3 Agent Integration

Expose an MCP server or equivalent API with controlled operations:

- Read spec.
- Validate spec.
- List unresolved prompts.
- Add component instance.
- Update metric definition.
- Add or resolve accepted gap.
- Generate export artifact.
- Compare versions.

The spec is the human–AI interface. Pixels are output.

---

## 7. Out of Scope for v1

- Hosting or executing dashboards.
- Replacing the semantic or data layer.
- Full Tableau, Hex, Sigma, Mode, PBIP, or PBIT export fidelity.
- Live monitoring or drift detection between built reports and approved specs.
- Public marketplace for spec patterns.
- Generic product design.
- Fully autonomous requirement authoring without human confirmation.

---

## 8. Wedge and Distribution

Initial wedge: BI and analytics consultancies with 2–50 people.

Why this wedge:

- They run stakeholder workshops repeatedly.
- Rework and ambiguity are expensive.
- A single project can justify the subscription.
- Every completed project creates reusable internal IP.
- They can introduce Phantom as a client-facing professional workflow rather than an internal-only tool.

Distribution sequence:

1. Founder-led outreach to analytics consultancies.
2. Sell a paid pilot around one real client workshop.
3. Publish examples of anonymized specs and build handoffs.
4. Open-source `@phantom/spec` and validator to create trust and a standard.
5. Expand inside consultancies through IP library stickiness.

---

## 9. Competitive Position

Direct overlap exists on individual axes:

- Figma and Figma Make: strong on visual rendering, prototyping, and AI-generated dashboard/app surfaces.
- Mokkup.ai: strong on dashboard wireframing, BI-oriented templates, collaboration, and Power BI/Tableau-oriented export workflows.
- Lightdash: strong on semantic-layer-driven BI, metrics, dashboards as code, Git-style workflows, and governed analytics.
- Power BI Copilot and Hex AI: strong on AI-assisted generation and analysis inside analytics platforms.
- Productboard, Aha!, Dovetail, and similar tools: strong on capturing stakeholder input, but weaker as renderable analytical build contracts.

Defensible position:

> Phantom should not claim to be the best mockup tool, BI tool, or AI dashboard generator. Phantom should own the intersection of live stakeholder-reactive analytical mockup, context-aware elicitation, versioned build-ready spec, semantic-layer linkage, approval workflow, reusable IP library, and downstream export.

---

## 10. Acceptance Criteria for Phantom v1

Phantom v1 is worth shipping when all of the following are true:

```yaml
phantom_block:
  id: v1_acceptance_criteria
  type: acceptance_criteria
  version: 0.2
criteria:
  - id: live_workshop_usability
    description: A facilitator can run a 60-minute stakeholder workshop and leave with a spec that both parties understand.
    measure: At least 3 pilot workshops completed with documented feedback.

  - id: faster_than_current_workflow
    description: Creating a useful handoff in Phantom is faster than creating an equivalent Figma/Miro/doc handoff plus follow-up requirements document.
    measure: At least 30% reduction in facilitator time from workshop to handoff across pilots.

  - id: build_ready_handoff
    description: A dashboard builder can implement from the approved spec without a second requirements-discovery cycle.
    measure: Builder reports no more than 3 clarification questions per page after handoff.

  - id: validator_trust
    description: Readiness score and blocking issues match expert judgment.
    measure: Pilot users agree with validator severity in at least 80% of reviewed prompts.

  - id: reusable_ip
    description: Consultants reuse at least one page, metric, or pattern from a prior spec in a later project.
    measure: Reuse happens in at least 2 pilot organizations or 3 projects.
```

---

## 11. Risks and Open Questions

| Risk | Why it matters | Mitigation |
|---|---|---|
| Authoring overhead | If the spec is slower than building directly, users will abandon it. | Optimize around live workshop speed; measure time-to-handoff in pilots. |
| Schema too rigid or too loose | Too rigid fails real reports; too loose creates unusable agent outputs. | Keep a small v1 component library and add escape hatches through accepted gaps. |
| Weak elicitation rules | The rule library is the product depth. Shallow prompts make Phantom a prettier canvas. | Start with KPI, table, filter, line, bar, drill-through, and data-contract rules only. |
| OSS copy risk | Competitors may adopt the format without buying Phantom. | Open-source schema/validator first; hold authoring UX, collaboration, IP library, and premium exporters proprietary. |
| Incumbent AI progress | Figma, Power BI, Hex, and BI tools will keep improving generation. | Compete on pre-build approval, spec durability, and consultancy workflow, not raw dashboard generation. |
| Buyer confusion | Users may think Phantom is a BI tool or design tool. | Position as “requirements and approval layer for analytical products.” |

---

## 12. Suggested v1 Scope

Build the smallest product that proves the workflow:

1. Project creation with context, export target, and roles.
2. Spec canvas with a limited analytical component library.
3. Elicitation panel driven by rules.
4. Metric registry.
5. Derived data-contract view.
6. Version history, comments, and approval view.
7. Readiness validator.
8. React scaffold export.
9. Power BI build-notes export.
10. Private IP library for saved patterns.

Defer everything else.

---

## 13. Approval Log

| Version | Date | Approver | Notes |
|---|---:|---|---|
| 0.2.0-draft | 2026-05-15 | — | Fixed frontmatter, export-target split, roles, structured blocks, readiness formula, gates, elicitation rules, and phased OSS strategy. |

---

*Self-reference: this spec describes Phantom in the same format Phantom produces. The recursive case is a deliberate v1 acceptance test: if a Phantom spec cannot describe Phantom itself well enough to build from, the format is wrong.*
