import { describe, it, expect } from 'vitest';
import {
  extractMetricBindings,
  generateBaseMeasures,
  generateVarianceMeasures,
  generateWaterfallMeasures,
  generateRetailMeasures,
  generateSaaSMeasures,
  generateHRMeasures,
  generateLogisticsMeasures,
  generatePortfolioMeasures,
  generateFinanceMeasures,
  generateSocialMeasures,
  generateAllMeasures,
} from './daxGenerator';
import type { DashboardItem } from '../types';

describe('daxGenerator', () => {
  describe('generateBaseMeasures', () => {
    it('maps sum operation to Total label', () => {
      const bindings = [
        { metric: 'revenue', operation: 'sum', table: 'Sales', column: 'Revenue' },
      ];
      const measures = generateBaseMeasures(bindings, 'Retail');

      expect(measures[0].name).toBe('Total revenue');
      expect(measures[0].expression).toContain('SUM(Sales[Revenue])');
    });

    it('maps avg operation to Avg label', () => {
      const bindings = [
        { metric: 'revenue', operation: 'avg', table: 'Sales', column: 'Revenue' },
      ];
      const measures = generateBaseMeasures(bindings, 'Retail');

      expect(measures[0].name).toBe('Avg revenue');
      expect(measures[0].expression).toContain('AVERAGE(Sales[Revenue])');
    });

    it('maps count operation to Count of label', () => {
      const bindings = [
        { metric: 'revenue', operation: 'count', table: 'Sales', column: 'Revenue' },
      ];
      const measures = generateBaseMeasures(bindings, 'Retail');

      expect(measures[0].name).toBe('Count of revenue');
      expect(measures[0].expression).toContain('COUNTROWS(Sales)');
    });

    it('maps min/max operations', () => {
      const bindings = [
        { metric: 'cost', operation: 'min', table: 'Shipment', column: 'Cost' },
        { metric: 'cost', operation: 'max', table: 'Shipment', column: 'Cost' },
      ];
      const measures = generateBaseMeasures(bindings, 'Logistics');

      expect(measures[0].name).toBe('Min cost');
      expect(measures[0].expression).toContain('MIN(Shipment[Cost])');
      expect(measures[1].name).toBe('Max cost');
      expect(measures[1].expression).toContain('MAX(Shipment[Cost])');
    });

    it('applies currency format for revenue/profit metrics', () => {
      const bindings = [
        { metric: 'revenue', operation: 'sum', table: 'Sales', column: 'Revenue' },
        { metric: 'profit', operation: 'sum', table: 'Sales', column: 'Profit' },
      ];
      const measures = generateBaseMeasures(bindings, 'Retail');

      expect(measures[0].formatString).toBe('$#,##0');
      expect(measures[1].formatString).toBe('$#,##0');
    });

    it('applies number format for quantity metrics', () => {
      const bindings = [
        { metric: 'quantity', operation: 'sum', table: 'Sales', column: 'Quantity' },
      ];
      const measures = generateBaseMeasures(bindings, 'Retail');

      expect(measures[0].formatString).toBe('#,##0');
    });

    it('converts PL suffix to Plan in name', () => {
      const bindings = [
        { metric: 'revenuePL', operation: 'sum', table: 'Sales', column: 'RevenuePL' },
      ];
      const measures = generateBaseMeasures(bindings, 'Retail');

      expect(measures[0].name).toBe('Total revenue Plan');
    });

    it('converts PY suffix to PY in name', () => {
      const bindings = [
        { metric: 'revenuePY', operation: 'sum', table: 'Sales', column: 'RevenuePY' },
      ];
      const measures = generateBaseMeasures(bindings, 'Retail');

      expect(measures[0].name).toBe('Total revenue PY');
    });
  });

  describe('generateVarianceMeasures', () => {
    it('generates ΔPY and ΔPY% for PY bindings', () => {
      const bindings = [
        { metric: 'revenue', operation: 'sum', table: 'Sales', column: 'Revenue' },
        { metric: 'revenuePY', operation: 'sum', table: 'Sales', column: 'RevenuePY' },
      ];
      const measures = generateVarianceMeasures(bindings, 'Retail');

      const names = measures.map((m) => m.name);
      expect(names).toContain('Revenue ΔPY');
      expect(names).toContain('Revenue ΔPY%');
    });

    it('generates ΔPL and ΔPL% for PL bindings', () => {
      const bindings = [
        { metric: 'revenue', operation: 'sum', table: 'Sales', column: 'Revenue' },
        { metric: 'revenuePL', operation: 'sum', table: 'Sales', column: 'RevenuePL' },
      ];
      const measures = generateVarianceMeasures(bindings, 'Retail');

      const names = measures.map((m) => m.name);
      expect(names).toContain('Revenue ΔPL');
      expect(names).toContain('Revenue ΔPL%');
    });

    it('uses correct operation label for avg bindings', () => {
      const bindings = [
        { metric: 'revenue', operation: 'avg', table: 'Sales', column: 'Revenue' },
        { metric: 'revenuePY', operation: 'avg', table: 'Sales', column: 'RevenuePY' },
      ];
      const measures = generateVarianceMeasures(bindings, 'Retail');

      const deltaPY = measures.find((m) => m.name === 'Revenue ΔPY');
      expect(deltaPY).toBeTruthy();
      expect(deltaPY!.expression).toContain('[Avg Revenue]');
      expect(deltaPY!.expression).toContain('[Avg Revenue PY]');
      expect(deltaPY!.expression).not.toContain('[Total Revenue]');
    });

    it('uses Total label for sum bindings', () => {
      const bindings = [
        { metric: 'revenue', operation: 'sum', table: 'Sales', column: 'Revenue' },
        { metric: 'revenuePY', operation: 'sum', table: 'Sales', column: 'RevenuePY' },
      ];
      const measures = generateVarianceMeasures(bindings, 'Retail');

      const deltaPY = measures.find((m) => m.name === 'Revenue ΔPY');
      expect(deltaPY!.expression).toContain('[Total Revenue]');
    });
  });

  describe('scenario-specific KPI measures', () => {
    it('generates Retail KPIs', () => {
      const measures = generateRetailMeasures([], 'Retail');
      const names = measures.map((m) => m.name);

      expect(names).toContain('Margin %');
      expect(names).toContain('YoY Growth');
      expect(names).toContain('Revenue per Store');
      expect(names).toContain('Avg Order Value');
    });

    it('generates SaaS KPIs', () => {
      const measures = generateSaaSMeasures([], 'SaaS');
      const names = measures.map((m) => m.name);

      expect(names).toContain('Churn Rate');
      expect(names).toContain('ARR');
      expect(names).toContain('Customer Count');
      expect(names).toContain('ARPU');
    });

    it('generates HR KPIs', () => {
      const measures = generateHRMeasures([], 'HR');
      const names = measures.map((m) => m.name);

      expect(names).toContain('Headcount');
      expect(names).toContain('Attrition Rate');
      expect(names).toContain('Avg Performance Rating');
      expect(names).toContain('Avg Tenure');
    });

    it('generates Logistics KPIs', () => {
      const measures = generateLogisticsMeasures([], 'Logistics');
      const names = measures.map((m) => m.name);

      expect(names).toContain('Total Shipments');
      expect(names).toContain('On-Time Rate');
      expect(names).toContain('Avg Shipment Cost');
      expect(names).toContain('Delivered Count');
      expect(names).toContain('In Transit Count');
      expect(names).toContain('Delayed Count');
    });

    it('generates Portfolio KPIs', () => {
      const measures = generatePortfolioMeasures([], 'Portfolio');
      const names = measures.map((m) => m.name);

      expect(names).toContain('Unique Entities');
      expect(names).toContain('Above Threshold');
      expect(names).toContain('Negative Changes');
      expect(names).toContain('Avg Controversy Score');
      expect(names).toContain('Total Market Value');
    });

    it('generates Finance KPIs', () => {
      const measures = generateFinanceMeasures([], 'Finance');
      const names = measures.map((m) => m.name);

      expect(names).toContain('Budget Variance %');
      expect(names).toContain('Forecast Accuracy');
      expect(names).toContain('Net Variance');
    });

    it('generates Social KPIs', () => {
      const measures = generateSocialMeasures([], 'Social');
      const names = measures.map((m) => m.name);

      expect(names).toContain('Avg Engagement Rate');
      expect(names).toContain('Positive Sentiment %');
      expect(names).toContain('Net Sentiment');
      expect(names).toContain('Total Mentions');
    });

    it('returns empty for wrong scenario', () => {
      expect(generateRetailMeasures([], 'SaaS')).toEqual([]);
      expect(generateSaaSMeasures([], 'Retail')).toEqual([]);
    });
  });

  describe('generateWaterfallMeasures', () => {
    it('generates 4 measures for a single waterfall with expected names', () => {
      const items: DashboardItem[] = [
        {
          id: 'wf-1',
          type: 'waterfall',
          title: 'Profit Waterfall',
          layout: { x: 0, y: 0, w: 12, h: 8 },
          props: { dimension: 'Region', metric: 'profit' },
        },
      ];

      const measures = generateWaterfallMeasures(items, 'Retail');

      expect(measures).toHaveLength(4);
      expect(measures.map((m) => m.name)).toEqual([
        'Waterfall Start',
        'Waterfall Variance',
        'Waterfall End',
        'Waterfall Running',
      ]);
    });

    it('generates 8 suffixed measures for two waterfalls', () => {
      const items: DashboardItem[] = [
        {
          id: 'wf-1',
          type: 'waterfall',
          title: 'Profit Waterfall',
          layout: { x: 0, y: 0, w: 12, h: 8 },
          props: { dimension: 'Region', metric: 'profit' },
        },
        {
          id: 'wf-2',
          type: 'waterfall',
          title: 'Revenue Waterfall',
          layout: { x: 12, y: 0, w: 12, h: 8 },
          props: { dimension: 'Category', metric: 'revenue' },
        },
      ];

      const measures = generateWaterfallMeasures(items, 'Retail');
      const names = measures.map((m) => m.name);

      expect(measures).toHaveLength(8);
      expect(names).toContain('Waterfall 1 Start');
      expect(names).toContain('Waterfall 1 Variance');
      expect(names).toContain('Waterfall 1 End');
      expect(names).toContain('Waterfall 1 Running');
      expect(names).toContain('Waterfall 2 Start');
      expect(names).toContain('Waterfall 2 Variance');
      expect(names).toContain('Waterfall 2 End');
      expect(names).toContain('Waterfall 2 Running');
    });

    it('uses scenario fact tables in expressions', () => {
      const testCases: Array<{
        scenario: 'Retail' | 'SaaS' | 'HR' | 'Logistics' | 'Finance' | 'Social';
        expectedFactTable: string;
        metric: string;
        dimension: string;
      }> = [
        { scenario: 'Retail', expectedFactTable: 'Sales', metric: 'profit', dimension: 'Region' },
        { scenario: 'SaaS', expectedFactTable: 'Subscription', metric: 'mrr', dimension: 'Tier' },
        { scenario: 'HR', expectedFactTable: 'Employee', metric: 'salary', dimension: 'Department' },
        { scenario: 'Logistics', expectedFactTable: 'Shipment', metric: 'cost', dimension: 'Status' },
        { scenario: 'Finance', expectedFactTable: 'FinanceRecord', metric: 'amount', dimension: 'BusinessUnit' },
        { scenario: 'Social', expectedFactTable: 'SocialPost', metric: 'engagements', dimension: 'Platform' },
      ];

      testCases.forEach(({ scenario, expectedFactTable, metric, dimension }) => {
        const items: DashboardItem[] = [
          {
            id: `wf-${scenario}`,
            type: 'waterfall',
            title: `${scenario} Waterfall`,
            layout: { x: 0, y: 0, w: 12, h: 8 },
            props: { metric, dimension },
          },
        ];
        const measures = generateWaterfallMeasures(items, scenario);

        measures.forEach((measure) => {
          expect(measure.expression).toContain(expectedFactTable);
        });
      });
    });

    it('uses SUM/SUMX/FILTER patterns and Waterfall display folder', () => {
      const items: DashboardItem[] = [
        {
          id: 'wf-1',
          type: 'waterfall',
          title: 'Profit Waterfall',
          layout: { x: 0, y: 0, w: 12, h: 8 },
          props: { dimension: 'Region', metric: 'profit' },
        },
      ];

      const measures = generateWaterfallMeasures(items, 'Retail');
      const start = measures.find((m) => m.name === 'Waterfall Start');
      const variance = measures.find((m) => m.name === 'Waterfall Variance');
      const running = measures.find((m) => m.name === 'Waterfall Running');

      expect(start?.expression).toContain('SUM(Sales[ProfitPY])');
      expect(variance?.expression).toContain('SUM(Sales[Profit])');
      expect(variance?.expression).toContain('SUM(Sales[ProfitPY])');
      expect(running?.expression).toContain('SUMX(');
      expect(running?.expression).toContain('FILTER(');
      expect(running?.expression).toContain('SUM(Sales[Profit])');

      measures.forEach((measure) => {
        expect(measure.displayFolder).toBe('Waterfall');
      });
    });
  });

  describe('extractMetricBindings', () => {
    it('extracts xMetric and yMetric from scatter charts', () => {
      const items: DashboardItem[] = [
        { id: '1', type: 'scatter', title: 'Scatter', layout: { x: 0, y: 0, w: 12, h: 8 }, props: { xMetric: 'revenue', yMetric: 'profit' } },
      ];
      const bindings = extractMetricBindings(items, 'Retail');
      const metrics = bindings.map((b) => b.metric);

      expect(metrics).toContain('revenue');
      expect(metrics).toContain('profit');
    });

    it('extracts barMetric and lineMetric from combo charts', () => {
      const items: DashboardItem[] = [
        { id: '1', type: 'combo', title: 'Combo', layout: { x: 0, y: 0, w: 12, h: 8 }, props: { barMetric: 'revenue', lineMetric: 'profit' } },
      ];
      const bindings = extractMetricBindings(items, 'Retail');
      const metrics = bindings.map((b) => b.metric);

      expect(metrics).toContain('revenue');
      expect(metrics).toContain('profit');
    });

    it('extracts comparisonMetric from barbell/diverging charts', () => {
      const items: DashboardItem[] = [
        { id: '1', type: 'barbell', title: 'Barbell', layout: { x: 0, y: 0, w: 12, h: 8 }, props: { metric: 'revenue', comparisonMetric: 'profit' } },
      ];
      const bindings = extractMetricBindings(items, 'Retail');
      const metrics = bindings.map((b) => b.metric);

      expect(metrics).toContain('revenue');
      expect(metrics).toContain('profit');
    });
  });

  describe('generateAllMeasures', () => {
    it('deduplicates measures by name', () => {
      const items: DashboardItem[] = [
        { id: '1', type: 'card', title: 'R1', layout: { x: 0, y: 0, w: 6, h: 2 }, props: { metric: 'revenue', operation: 'sum' } },
        { id: '2', type: 'bar', title: 'R2', layout: { x: 0, y: 2, w: 12, h: 4 }, props: { metric: 'revenue', operation: 'sum', dimension: 'Category' } },
      ];
      const measures = generateAllMeasures(items, 'Retail');

      const names = measures.map((m) => m.name);
      const uniqueNames = [...new Set(names)];
      expect(names.length).toBe(uniqueNames.length);
    });

    it('includes scenario KPIs', () => {
      const items: DashboardItem[] = [
        { id: '1', type: 'card', title: 'Rev', layout: { x: 0, y: 0, w: 6, h: 2 }, props: { metric: 'revenue' } },
      ];
      const measures = generateAllMeasures(items, 'Retail');
      const names = measures.map((m) => m.name);

      expect(names).toContain('Margin %');
      expect(names).toContain('YoY Growth');
    });

    it('generates measures for scatter chart xMetric and yMetric', () => {
      const items: DashboardItem[] = [
        { id: '1', type: 'scatter', title: 'Scatter', layout: { x: 0, y: 0, w: 12, h: 8 }, props: { xMetric: 'revenue', yMetric: 'profit' } },
      ];
      const measures = generateAllMeasures(items, 'Retail');
      const names = measures.map((m) => m.name);

      expect(names).toContain('Total revenue');
      expect(names).toContain('Total profit');
    });
  });
});
