import { describe, it, expect } from 'vitest';
import { getRecipeForVisual, generateSmartTitle } from './bindingRecipes';
import type { ScenarioType } from './semanticLayer';

describe('bindingRecipes', () => {
  describe('getRecipeForVisual - bar/column', () => {
    const scenarios: ScenarioType[] = ['Retail', 'SaaS', 'HR', 'Logistics', 'Finance', 'Portfolio', 'Social'];
    const expectedDimensions: Record<ScenarioType, string> = {
      Retail: 'category',
      SaaS: 'tier',
      HR: 'department',
      Logistics: 'status',
      Finance: 'businessUnit',
      Portfolio: 'sector',
      Social: 'platform',
    };

    scenarios.forEach((scenario) => {
      it(`returns correct dimension for ${scenario}`, () => {
        const recipe = getRecipeForVisual('bar', scenario);
        expect(recipe.dimension).toBe(expectedDimensions[scenario]);
        expect(recipe.topN).toBe(5);
        expect(recipe.sort).toBe('desc');
      });
    });
  });

  describe('getRecipeForVisual - line', () => {
    it('binds to time dimension with comparison=both', () => {
      const scenarios: ScenarioType[] = ['Retail', 'SaaS', 'HR', 'Logistics', 'Finance', 'Portfolio', 'Social'];
      const expectedTimeDimensions: Record<ScenarioType, string> = {
        Retail: 'date',
        SaaS: 'date',
        HR: 'hireDate',
        Logistics: 'date',
        Finance: 'date',
        Portfolio: 'validFrom',
        Social: 'date',
      };

      scenarios.forEach((scenario) => {
        const recipe = getRecipeForVisual('line', scenario);
        expect(recipe.dimension).toBe(expectedTimeDimensions[scenario]);
        expect(recipe.comparison).toBe('both');
        expect(recipe.timeGrain).toBe('month');
      });
    });
  });

  describe('getRecipeForVisual - pie', () => {
    it('has topN=6 with showOther for all scenarios', () => {
      const scenarios: ScenarioType[] = ['Retail', 'SaaS', 'HR', 'Logistics'];

      scenarios.forEach((scenario) => {
        const recipe = getRecipeForVisual('pie', scenario);
        expect(recipe.topN).toBe(6);
        expect(recipe.showOther).toBe(true);
      });
    });
  });

  describe('getRecipeForVisual - scatter', () => {
    it('binds x, y, size metrics and play axis', () => {
      const recipe = getRecipeForVisual('scatter', 'Retail');

      expect(recipe.xMetric).toBe('revenue');
      expect(recipe.yMetric).toBe('profit');
      expect(recipe.sizeMetric).toBe('quantity');
      expect(recipe.playAxis).toBe('date');
      expect(recipe.dimension).toBe('category');
    });
  });

  describe('getRecipeForVisual - stacked variants', () => {
    it('returns a series field for stacked bar/column/area', () => {
      const stackedBar = getRecipeForVisual('stackedBar', 'Retail');
      const stackedColumn = getRecipeForVisual('stackedColumn', 'Retail');
      const stackedArea = getRecipeForVisual('stackedArea', 'Retail');

      expect(stackedBar.series).toBeTruthy();
      expect(stackedColumn.series).toBeTruthy();
      expect(stackedArea.series).toBeTruthy();
      expect(stackedBar.dimension).toBe('category');
      expect(stackedColumn.dimension).toBe('category');
      expect(stackedArea.dimension).toBe('date');
    });
  });

  describe('getRecipeForVisual - table', () => {
    it('includes primary category + top 3 measures', () => {
      const recipe = getRecipeForVisual('table', 'Retail');

      expect(recipe.columns).toContain('category');
      expect(recipe.columns).toContain('revenue');
      expect(recipe.columns).toContain('profit');
      expect(recipe.columns).toContain('quantity');
      expect((recipe.columns as string[]).length).toBe(4);
      expect(recipe.maxRows).toBe(25);
    });
  });

  describe('getRecipeForVisual - matrix', () => {
    it('binds rows, columns, values', () => {
      const recipe = getRecipeForVisual('matrix', 'Retail');

      expect(recipe.rows).toBe('category');
      expect(recipe.columns).toBe('date');
      expect(recipe.values).toBe('revenue');
    });
  });

  describe('getRecipeForVisual - card', () => {
    it('uses primary measure with sum operation', () => {
      const scenarios: ScenarioType[] = ['Retail', 'SaaS', 'HR', 'Logistics'];

      scenarios.forEach((scenario) => {
        const recipe = getRecipeForVisual('card', scenario);
        expect(recipe.operation).toBe('sum');
        expect(recipe.metric).toBeTruthy();
      });
    });
  });

  describe('getRecipeForVisual - slicer', () => {
    it('binds primary category dimension', () => {
      const scenarios: ScenarioType[] = ['Retail', 'SaaS', 'HR', 'Logistics'];
      const expected = ['category', 'tier', 'department', 'status'];

      scenarios.forEach((scenario, i) => {
        const recipe = getRecipeForVisual('slicer', scenario);
        expect(recipe.dimension).toBe(expected[i]);
      });
    });
  });

  describe('getRecipeForVisual - combo', () => {
    it('binds barMetric and lineMetric', () => {
      const recipe = getRecipeForVisual('combo', 'Retail');

      expect(recipe.barMetric).toBe('revenue');
      expect(recipe.lineMetric).toBe('revenuePL');
      expect(recipe.topN).toBe(5);
    });

    it('returns both barMetric and lineMetric for other scenarios', () => {
      const recipe = getRecipeForVisual('combo', 'Finance');

      expect(recipe.barMetric).toBe('amount');
      expect(recipe.lineMetric).toBe('variance');
      expect(recipe.metric).toBeUndefined();
    });
  });

  describe('getRecipeForVisual - map', () => {
    it('binds geoDimension and defaults to Australia choropleth', () => {
      const recipe = getRecipeForVisual('map', 'Retail');

      expect(recipe.geoDimension).toBe('region');
      expect(recipe.mapType).toBe('au');
      expect(recipe.displayMode).toBe('choropleth');
    });
  });

  describe('getRecipeForVisual - waterfall', () => {
    it('binds category dimension and primary metric', () => {
      const recipe = getRecipeForVisual('waterfall', 'Retail');

      expect(recipe.dimension).toBe('category');
      expect(recipe.metric).toBe('revenue');
    });
  });

  describe('getRecipeForVisual - mapBubble', () => {
    it('binds geoDimension with bubble display mode', () => {
      const recipe = getRecipeForVisual('mapBubble', 'Retail');

      expect(recipe.geoDimension).toBe('region');
      expect(recipe.metric).toBe('revenue');
      expect(recipe.mapType).toBe('au');
      expect(recipe.displayMode).toBe('bubble');
    });
  });
});

describe('generateSmartTitle', () => {
  describe('bar/column charts', () => {
    it('uses "Top N Dimension by Metric" format', () => {
      expect(generateSmartTitle('bar', { dimension: 'category', metric: 'revenue', topN: 5 }, 'Retail'))
        .toBe('Top 5 category by revenue');
    });

    it('omits "Top" when topN is All', () => {
      expect(generateSmartTitle('bar', { dimension: 'category', metric: 'revenue', topN: 'All' }, 'Retail'))
        .toBe('category by revenue');
    });

    it('handles different topN values', () => {
      expect(generateSmartTitle('column', { dimension: 'store_name', metric: 'profit', topN: 2 }, 'Retail'))
        .toBe('Top 2 store_name by profit');
    });
  });

  describe('line/area charts', () => {
    it('uses "Metric Trend" format', () => {
      expect(generateSmartTitle('line', { metric: 'revenue' }, 'Retail'))
        .toBe('revenue Trend');
    });

    it('returns "Trend" when no metric', () => {
      expect(generateSmartTitle('line', {}, 'Retail'))
        .toBe('Trend');
    });
  });

  describe('stackedArea', () => {
    it('uses "Metric by Dimension Over Time" format', () => {
      expect(generateSmartTitle('stackedArea', { metric: 'revenue', dimension: 'category' }, 'Retail'))
        .toBe('revenue by category Over Time');
    });
  });

  describe('card/kpi/gauge', () => {
    it('uses "Total Metric" format', () => {
      expect(generateSmartTitle('card', { metric: 'mrr' }, 'SaaS'))
        .toBe('Total mrr');
    });

    it('returns "KPI" when no metric', () => {
      expect(generateSmartTitle('card', {}, 'SaaS'))
        .toBe('KPI');
    });
  });

  describe('table', () => {
    it('uses "Scenario Details" format', () => {
      expect(generateSmartTitle('table', {}, 'Retail')).toBe('Retail Details');
      expect(generateSmartTitle('table', {}, 'SaaS')).toBe('SaaS Details');
      expect(generateSmartTitle('table', {}, 'HR')).toBe('HR Details');
    });
  });

  describe('scatter', () => {
    it('uses "X vs Y" format', () => {
      expect(generateSmartTitle('scatter', { xMetric: 'revenue', yMetric: 'profit' }, 'Retail'))
        .toBe('revenue vs profit');
    });

    it('returns "Scatter" when no metrics', () => {
      expect(generateSmartTitle('scatter', {}, 'Retail'))
        .toBe('Scatter');
    });
  });

  describe('combo', () => {
    it('uses "barMetric vs lineMetric" format', () => {
      expect(generateSmartTitle('combo', { barMetric: 'revenue', lineMetric: 'profit' }, 'Retail'))
        .toBe('revenue vs profit');
    });
  });

  describe('map', () => {
    it('uses "Metric by geoDimension" format', () => {
      expect(generateSmartTitle('map', { metric: 'revenue', geoDimension: 'region' }, 'Retail'))
        .toBe('revenue by region');
    });
  });

  describe('pie/donut', () => {
    it('uses "Metric by Dimension" format', () => {
      expect(generateSmartTitle('pie', { metric: 'revenue', dimension: 'category' }, 'Retail'))
        .toBe('revenue by category');
    });
  });

  describe('uncommon visual types', () => {
    it('waterfall uses "Metric Waterfall"', () => {
      expect(generateSmartTitle('waterfall', { metric: 'variance' }, 'Finance'))
        .toBe('variance Waterfall');
    });

    it('textBox and banner use provided title', () => {
      expect(generateSmartTitle('textBox', { title: 'My Notes' }, 'Retail'))
        .toBe('My Notes');
      expect(generateSmartTitle('banner', { title: 'Q1 Report' }, 'Retail'))
        .toBe('Q1 Report');
    });
  });
});
