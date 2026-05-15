import { describe, expect, it } from 'vitest';
import { createPhantomHandoffSummary, createPhantomImplementationGate, createPhantomSpec } from '../export';
import type { DashboardItem } from '../types';
import {
  createConsultantWorkflowModel,
  createRequirementItemFromSuggestion,
} from './consultantWorkflow';

const item: DashboardItem = {
  id: 'chart-1',
  type: 'bar',
  title: 'Revenue by Region',
  layout: { x: 0, y: 0, w: 12, h: 8 },
  props: { dimension: 'Region', metric: 'revenue' },
};

describe('consultantWorkflow', () => {
  it('creates workflow prompts from missing workshop intent and data path gaps', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [item],
      filters: {},
      layoutMode: 'Free',
      exportMode: 'react',
      themePalette: 'Default',
      specification: { signOffStatus: 'draft', designEntryPoint: 'phantom-led' },
    });

    const workflow = createConsultantWorkflowModel(spec);

    expect(workflow.steps.map((step) => step.id)).toEqual([
      'brief',
      'clarify',
      'design',
      'interactions',
      'data',
      'review',
      'export',
    ]);
    expect(workflow.steps.find((step) => step.id === 'brief')?.status).toBe('blocked');
    expect(workflow.suggestions.some((suggestion) =>
      suggestion.disposition === 'client_decision'
      && suggestion.detail.includes('business questions'),
    )).toBe(true);
    expect(workflow.suggestions.some((suggestion) =>
      suggestion.disposition === 'consultant_task'
      && suggestion.detail.includes('Map each component'),
    )).toBe(true);
  });

  it('preserves classified requirements as workflow counts', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [item],
      filters: {},
      layoutMode: 'Free',
      exportMode: 'react',
      themePalette: 'Default',
      specification: {
        signOffStatus: 'draft',
        designEntryPoint: 'phantom-led',
        requirementItems: [{
          id: 'req-1',
          title: 'Confirm executive audience',
          disposition: 'client_decision',
          status: 'open',
        }],
      },
    });

    const workflow = createConsultantWorkflowModel(spec);

    expect(workflow.counts.client_decision).toBe(1);
    expect(workflow.openRequirements).toHaveLength(1);
    expect(workflow.steps.find((step) => step.id === 'clarify')?.status).toBe('needs-input');

    const handoffSummary = createPhantomHandoffSummary(spec);
    expect(handoffSummary.requirements.counts.client_decision).toBe(1);
    expect(handoffSummary.requirements.clientQuestions[0].title).toBe('Confirm executive audience');

    const gate = createPhantomImplementationGate(spec);
    expect(gate.readyForImplementation).toBe(false);
    expect(gate.requiredNextSteps).toContain('Resolve or reclassify workflow blockers: Confirm executive audience.');
  });

  it('creates requirement items from generated suggestions', () => {
    const itemFromSuggestion = createRequirementItemFromSuggestion({
      id: 'readiness-react-missing-audience',
      title: 'missing audience',
      detail: 'Workshop intent has no audience.',
      disposition: 'client_decision',
      ownerRole: 'facilitator',
      source: 'readiness_check',
    }, {
      status: 'resolved',
      resolution: 'Audience is regional sales leadership.',
    });

    expect(itemFromSuggestion.disposition).toBe('client_decision');
    expect(itemFromSuggestion.status).toBe('resolved');
    expect(itemFromSuggestion.resolution).toContain('regional sales');
  });

  it('moves design and data steps to ready when sources are mapped', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [item],
      filters: {},
      layoutMode: 'Free',
      exportMode: 'react',
      themePalette: 'Default',
      specification: {
        signOffStatus: 'approved',
        businessQuestions: 'Which regions need sales attention?',
        audience: 'Sales leadership',
        decisions: 'Prioritise regional follow-up.',
        acceptanceCriteria: 'Leaders can identify and act on underperforming regions.',
        designEntryPoint: 'phantom-led',
        designSources: [{
          id: 'phantom-defaults',
          type: 'phantomDefault',
          name: 'Phantom defaults',
          linkedViewIds: ['main'],
          linkedComponentIds: ['chart-1'],
        }],
        sourceSystems: 'Sales mart',
        grain: 'monthly',
        refreshCadence: 'weekly',
        dataSources: [{
          id: 'sales-mart',
          type: 'dbt',
          name: 'Sales mart',
          model: 'mart_sales',
          linkedComponentIds: ['chart-1'],
          linkedFields: ['Region', 'revenue'],
        }],
      },
    });

    const workflow = createConsultantWorkflowModel(spec);

    expect(workflow.steps.find((step) => step.id === 'brief')?.status).toBe('ready');
    expect(workflow.steps.find((step) => step.id === 'design')?.status).toBe('ready');
    expect(workflow.steps.find((step) => step.id === 'data')?.status).toBe('ready');
  });

  it('marks interactions ready when a drill journey is captured', () => {
    const spec = createPhantomSpec({
      scenario: 'Retail',
      items: [item],
      filters: {},
      layoutMode: 'Free',
      exportMode: 'react',
      themePalette: 'Default',
      specification: { signOffStatus: 'draft', designEntryPoint: 'phantom-led' },
      drillActions: [{
        id: 'drill-1',
        sourceComponentId: 'chart-1',
        trigger: 'click',
        targetType: 'view',
        targetId: 'detail',
        label: 'Open detail',
        context: [{ source: 'Region', target: 'region' }],
        preserveFilters: true,
      }],
    });

    const workflow = createConsultantWorkflowModel(spec);

    expect(workflow.steps.find((step) => step.id === 'interactions')?.status).toBe('ready');
  });
});
