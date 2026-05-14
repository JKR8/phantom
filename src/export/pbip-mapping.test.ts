import { describe, it, expect } from 'vitest';
import type { DashboardItem, VisualType } from '../types';
import type { DAXMeasure } from './daxGenerator';
import { getSchemaForScenario, mapFieldToPBIColumn } from './schemaGenerator';
import { PBI_VISUAL_TYPES } from './layoutConverter';
import {
  getMeasureName,
  getOperationLabel,
  buildQueryProjection,
  buildSortDefinition,
  makeLiteral,
  makeDecimalLiteral,
  makeIntegerLiteral,
  makeSolidColor,
  mapToPBIPQueryState,
  mapToPBIPVisualObjects,
  getPBIVisualType,
} from './pbip-mapping';

const BASE_LAYOUT = { x: 0, y: 0, w: 12, h: 6 };

const makeItem = (
  type: VisualType,
  props: Record<string, unknown> = {},
  title = 'Test Visual'
): DashboardItem => ({
  id: `${type}-1`,
  type,
  title,
  layout: BASE_LAYOUT,
  props,
});

const makeMeasure = (name: string): DAXMeasure => ({
  name,
  expression: '0',
});

const RETAIL_MEASURES: DAXMeasure[] = [
  makeMeasure('Total Revenue'),
  makeMeasure('Total Profit'),
  makeMeasure('Total Quantity'),
  makeMeasure('Total Price'),
  makeMeasure('Total Discount'),
];

const SAAS_MEASURES: DAXMeasure[] = [makeMeasure('Total MRR')];

const RETAIL_SCHEMA = getSchemaForScenario('Retail');
const SAAS_SCHEMA = getSchemaForScenario('SaaS');

describe('pbip-mapping', () => {
  describe('getOperationLabel', () => {
    it('maps sum to Total', () => {
      expect(getOperationLabel('sum')).toBe('Total');
      expect(getOperationLabel('SUM')).toBe('Total');
    });

    it('maps avg/average to Avg', () => {
      expect(getOperationLabel('avg')).toBe('Avg');
      expect(getOperationLabel('average')).toBe('Avg');
    });

    it('maps count to Count of', () => {
      expect(getOperationLabel('count')).toBe('Count of');
    });

    it('maps min/max appropriately', () => {
      expect(getOperationLabel('min')).toBe('Min');
      expect(getOperationLabel('max')).toBe('Max');
    });

    it('capitalizes unknown operations', () => {
      expect(getOperationLabel('median')).toBe('Median');
    });
  });

  describe('getMeasureName', () => {
    it('combines operation label with metric', () => {
      expect(getMeasureName('Revenue', 'sum')).toBe('Total Revenue');
      expect(getMeasureName('Profit', 'avg')).toBe('Avg Profit');
    });

    it('converts PL suffix to Plan', () => {
      expect(getMeasureName('RevenuePL', 'sum')).toBe('Total Revenue Plan');
    });

    it('converts PY suffix to PY', () => {
      expect(getMeasureName('RevenuePY', 'sum')).toBe('Total Revenue PY');
    });

    it('defaults to sum operation', () => {
      expect(getMeasureName('Revenue')).toBe('Total Revenue');
    });

    it('trims extra whitespace', () => {
      expect(getMeasureName('  Revenue  ', 'sum')).toBe('Total Revenue');
    });
  });

  describe('makeLiteral', () => {
    it('creates literal expression', () => {
      expect(makeLiteral("'hello'")).toEqual({
        expr: { Literal: { Value: "'hello'" } },
      });
    });
  });

  describe('makeDecimalLiteral', () => {
    it('creates decimal literal with D suffix', () => {
      expect(makeDecimalLiteral(3.14)).toEqual({
        expr: { Literal: { Value: '3.14D' } },
      });
    });
  });

  describe('makeIntegerLiteral', () => {
    it('creates integer literal with L suffix', () => {
      expect(makeIntegerLiteral(42)).toEqual({
        expr: { Literal: { Value: '42L' } },
      });
    });
  });

  describe('makeSolidColor', () => {
    it('creates solid color expression', () => {
      expect(makeSolidColor('#FF0000')).toEqual({
        solid: {
          color: { expr: { Literal: { Value: "'#FF0000'" } } },
        },
      });
    });
  });

  describe('buildQueryProjection', () => {
    it('builds measure projection', () => {
      const result = buildQueryProjection('Sales', 'Total Revenue', true);
      expect(result.field).toEqual({
        Measure: {
          Expression: { SourceRef: { Entity: 'Sales' } },
          Property: 'Total Revenue',
        },
      });
      expect(result.queryRef).toBe('Sales.Total Revenue');
      expect(result.nativeQueryRef).toBe('Total Revenue');
    });

    it('builds column projection', () => {
      const result = buildQueryProjection('Sales', 'Category', false);
      expect(result.field).toEqual({
        Column: {
          Expression: { SourceRef: { Entity: 'Sales' } },
          Property: 'Category',
        },
      });
    });

    it('adds active flag when specified', () => {
      const result = buildQueryProjection('Sales', 'Category', false, { active: true });
      expect(result.active).toBe(true);
    });

    it('adds displayName when specified', () => {
      const result = buildQueryProjection('Sales', 'Revenue', true, { displayName: 'Rev' });
      expect(result.displayName).toBe('Rev');
    });
  });

  describe('buildSortDefinition', () => {
    it('builds descending sort by default', () => {
      const result = buildSortDefinition('Sales', 'Revenue');
      expect(result.sort[0].direction).toBe('Descending');
      expect(result.isDefaultSort).toBe(true);
    });

    it('builds ascending sort when specified', () => {
      const result = buildSortDefinition('Sales', 'Revenue', 'Ascending');
      expect(result.sort[0].direction).toBe('Ascending');
    });

    it('references correct table and field', () => {
      const result = buildSortDefinition('Sales', 'Profit');
      const fieldDef = result.sort[0].field;
      expect(fieldDef.Aggregation.Expression.Column.Property).toBe('Profit');
      expect(fieldDef.Aggregation.Expression.Column.Expression.SourceRef.Entity).toBe('Sales');
    });
  });

  describe('mapToPBIPQueryState', () => {
    it.each<VisualType>(['bar', 'column'])('maps %s with Category + Y projections', (type) => {
      const result = mapToPBIPQueryState(
        makeItem(type, { dimension: 'Category', metric: 'Revenue' }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;

      expect(result.Category.projections[0].field.Column.Property).toBe('Category');
      expect(result.Y.projections[0].field.Measure.Property).toBe('Total Revenue');
    });

    it.each<VisualType>(['line', 'area'])('maps %s with time Category + Y projections', (type) => {
      const result = mapToPBIPQueryState(
        makeItem(type, { dimension: 'Month', metric: 'Revenue' }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;

      expect(result.Category.projections[0].field.Column.Expression.SourceRef.Entity).toBe('DateTable');
      expect(result.Category.projections[0].field.Column.Property).toBe('Month');
      expect(result.Y.projections[0].field.Measure.Property).toBe('Total Revenue');
    });

    it.each<VisualType>(['pie', 'donut'])('maps %s with Legend + Y projections', (type) => {
      const result = mapToPBIPQueryState(
        makeItem(type, { dimension: 'Category', metric: 'Revenue' }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;

      expect(result.Legend.projections[0].field.Column.Property).toBe('Category');
      expect(result.Y.projections[0].field.Measure.Property).toBe('Total Revenue');
      expect(result.Category).toBeUndefined();
    });

    it('maps scatter with Category, X, Y, and Size projections', () => {
      const result = mapToPBIPQueryState(
        makeItem('scatter', {
          dimension: 'Category',
          xMetric: 'Revenue',
          yMetric: 'Profit',
          sizeMetric: 'Quantity',
        }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;

      expect(result.Category.projections[0].field.Column.Property).toBe('Category');
      expect(result.X.projections[0].field.Measure.Property).toBe('Total Revenue');
      expect(result.Y.projections[0].field.Measure.Property).toBe('Total Profit');
      expect(result.Size.projections[0].field.Measure.Property).toBe('Total Quantity');
    });

    it('maps card with Values projections', () => {
      const result = mapToPBIPQueryState(
        makeItem('card', { metric: 'MRR' }),
        'SaaS',
        SAAS_MEASURES,
        SAAS_SCHEMA
      ) as Record<string, any>;

      expect(result.Values.projections).toHaveLength(1);
      expect(result.Values.projections[0].field.Measure.Property).toBe('Total MRR');
    });

    it('maps nudgeKpi same as card with Values projections', () => {
      const result = mapToPBIPQueryState(
        makeItem('nudgeKpi', { metric: 'MRR' }),
        'SaaS',
        SAAS_MEASURES,
        SAAS_SCHEMA
      ) as Record<string, any>;

      expect(result.Values).toBeDefined();
      expect(result.Values.projections).toHaveLength(1);
      expect(result.Values.projections[0].field.Measure.Property).toBe('Total MRR');
    });

    it('maps table using explicit columns array', () => {
      const result = mapToPBIPQueryState(
        makeItem('table', { columns: ['Category', 'Region'] }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;

      expect(result.Values.projections).toHaveLength(2);
      expect(result.Values.projections[0].field.Column.Property).toBe('Category');
      expect(result.Values.projections[1].field.Column.Property).toBe('Region');
    });

    it('maps table using default columns fallback when columns are missing', () => {
      const result = mapToPBIPQueryState(makeItem('table'), 'Retail', RETAIL_MEASURES, RETAIL_SCHEMA) as Record<
        string,
        any
      >;

      const mappedColumns = result.Values.projections.map((projection: any) => projection.field.Column.Property);
      expect(mappedColumns.length).toBeGreaterThan(0);
      expect(mappedColumns).toContain('Date');
    });

    it('maps matrix with Rows, Columns, and Values', () => {
      const result = mapToPBIPQueryState(
        makeItem('matrix', {
          rows: 'Category',
          columns: 'Region',
          values: 'Revenue',
        }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;

      expect(result.Rows.projections[0].field.Column.Property).toBe('Category');
      expect(result.Columns.projections[0].field.Column.Property).toBe('Region');
      expect(result.Values.projections[0].field.Measure.Property).toBe('Total Revenue');
    });

    it('maps combo with Category, ColumnY, and LineY', () => {
      const result = mapToPBIPQueryState(
        makeItem('combo', {
          dimension: 'Month',
          barMetric: 'Revenue',
          lineMetric: 'Profit',
        }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;

      expect(result.Category.projections[0].field.Column.Property).toBe('Month');
      expect(result.ColumnY.projections[0].field.Measure.Property).toBe('Total Revenue');
      expect(result.LineY.projections[0].field.Measure.Property).toBe('Total Profit');
    });

    it('maps waterfall, funnel, and slicer projections', () => {
      const waterfall = mapToPBIPQueryState(
        makeItem('waterfall', { dimension: 'Category', metric: 'Revenue' }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;
      expect(waterfall.Category.projections[0].field.Column.Property).toBe('Category');
      expect(waterfall.Y.projections[0].field.Measure.Property).toBe('Total Revenue');

      const funnel = mapToPBIPQueryState(
        makeItem('funnel', { dimension: 'Category', metric: 'Revenue' }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;
      expect(funnel.Category.projections[0].field.Column.Property).toBe('Category');
      expect(funnel.Y.projections[0].field.Measure.Property).toBe('Total Revenue');
      expect(funnel._sortDefinition).toBeDefined();

      const slicer = mapToPBIPQueryState(
        makeItem('slicer', { dimension: 'Category' }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;
      expect(slicer.Values.projections[0].field.Column.Property).toBe('Category');
    });

    it('returns empty query state for textBox and banner visuals', () => {
      const textBox = mapToPBIPQueryState(makeItem('textBox', { text: 'Hello' }), 'Retail', RETAIL_MEASURES, RETAIL_SCHEMA);
      const banner = mapToPBIPQueryState(makeItem('banner', { title: 'Headline' }), 'Retail', RETAIL_MEASURES, RETAIL_SCHEMA);
      expect(textBox).toEqual({});
      expect(banner).toEqual({});
    });

    it('uses fallback dimension when no dimension prop is provided', () => {
      const result = mapToPBIPQueryState(
        makeItem('bar', { metric: 'Revenue' }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;

      expect(result.Category).toBeDefined();
      expect(result.Category.projections[0].field.Column.Property).toBeDefined();
      expect(result.Y.projections[0].field.Measure.Property).toBe('Total Revenue');
    });

    it('handles missing measures gracefully', () => {
      const result = mapToPBIPQueryState(
        makeItem('bar', { dimension: 'Category', metric: 'DoesNotExist' }),
        'Retail',
        RETAIL_MEASURES,
        RETAIL_SCHEMA
      ) as Record<string, any>;

      expect(result.Category.projections[0].field.Column.Property).toBe('Category');
      expect(result.Y).toBeUndefined();
    });
  });

  describe('mapToPBIPVisualObjects', () => {
    const titleEligibleTypes = (Object.keys(PBI_VISUAL_TYPES) as VisualType[]).filter(
      (type) => getPBIVisualType(type) !== 'textbox'
    );

    it.each<VisualType>(titleEligibleTypes)('applies title formatting for %s', (type) => {
      const item = makeItem(type, {}, 'Visual Title');
      const pbiType = getPBIVisualType(type);
      const objects = mapToPBIPVisualObjects(item, pbiType, 'SaaS') as Record<string, any>;

      expect(objects.title).toBeDefined();
      expect(objects.title[0].properties.show.expr.Literal.Value).toBe('true');
      expect(objects.title[0].properties.text.expr.Literal.Value).toBe("'Visual Title'");
    });

    it.each<VisualType>([
      'bar',
      'column',
      'stackedBar',
      'stackedColumn',
      'line',
      'area',
      'stackedArea',
      'waterfall',
      'scatter',
    ])('applies axis formatting for %s', (type) => {
      const item = makeItem(type);
      const pbiType = getPBIVisualType(type);
      const objects = mapToPBIPVisualObjects(item, pbiType, 'SaaS') as Record<string, any>;

      expect(objects.categoryAxis).toBeDefined();
      expect(objects.valueAxis).toBeDefined();
      expect(objects.valueAxis[0].properties.gridlineShow.expr.Literal.Value).toBe('true');
    });

    it.each<VisualType>(['pie', 'donut', 'stackedBar', 'stackedColumn', 'line', 'area', 'stackedArea'])(
      'applies legend formatting for %s',
      (type) => {
        const item = makeItem(type);
        const pbiType = getPBIVisualType(type);
        const objects = mapToPBIPVisualObjects(item, pbiType, 'SaaS') as Record<string, any>;

        expect(objects.legend).toBeDefined();
        expect(objects.legend[0].properties.show.expr.Literal.Value).toBe('true');
      }
    );

    it('applies slicer dropdown styling', () => {
      const defaultSlicer = mapToPBIPVisualObjects(makeItem('slicer'), 'slicer', 'SaaS') as Record<string, any>;
      expect(defaultSlicer.slicer[0].properties.slicerType.expr.Literal.Value).toBe("'Dropdown'");

      const retailSlicer = mapToPBIPVisualObjects(makeItem('slicer'), 'slicer', 'Retail') as Record<string, any>;
      expect(retailSlicer.data[0].properties.mode.expr.Literal.Value).toBe("'Dropdown'");
      expect(retailSlicer.selection[0].properties.strictSingleSelect.expr.Literal.Value).toBe('true');
    });

    it('maps banner content and styling', () => {
      const bannerItem = makeItem(
        'banner',
        {
          title: 'Executive Summary',
          subtitle: 'FY26 Q1',
          backgroundColor: '#123456',
          fontColor: '#FFFFFF',
          titleFontSize: 28,
          subtitleFontSize: 12,
        },
        'Ignored Fallback'
      );

      const objects = mapToPBIPVisualObjects(bannerItem, 'textbox', 'SaaS') as Record<string, any>;
      const paragraphJson = objects.general[0].properties.paragraphs.expr.Literal.Value as string;
      const paragraphs = JSON.parse(paragraphJson);

      expect(paragraphs[0].textRuns[0].value).toBe('Executive Summary');
      expect(paragraphs[0].textRuns[1].value).toContain('FY26 Q1');
      expect(objects.background[0].properties.show.expr.Literal.Value).toBe('true');
      expect(objects.background[0].properties.color.solid.color.expr.Literal.Value).toBe("'#123456'");
    });

    it('maps textBox content and styling', () => {
      const textBoxItem = makeItem(
        'textBox',
        {
          text: 'Action required',
          fontSize: 16,
          fontColor: '#333333',
          bold: true,
          alignment: 'center',
          backgroundColor: '#EFEFEF',
        },
        'Fallback Title'
      );

      const objects = mapToPBIPVisualObjects(textBoxItem, 'textbox', 'SaaS') as Record<string, any>;
      const paragraphJson = objects.general[0].properties.paragraphs.expr.Literal.Value as string;
      const paragraphs = JSON.parse(paragraphJson);

      expect(paragraphs[0].textRuns[0].value).toBe('Action required');
      expect(paragraphs[0].textRuns[0].textStyle.fontWeight).toBe('bold');
      expect(paragraphs[0].horizontalTextAlignment).toBe('center');
      expect(objects.background[0].properties.show.expr.Literal.Value).toBe('true');
      expect(objects.background[0].properties.color.solid.color.expr.Literal.Value).toBe("'#EFEFEF'");
    });
  });

  describe('mapFieldToPBIColumn case resolution', () => {
    it('resolves lowercase abbreviations to correct schema casing (MRR, LTV, ARR, CAC)', () => {
      expect(mapFieldToPBIColumn('SaaS', 'mrr')).toEqual({ table: 'Subscription', column: 'MRR' });
      expect(mapFieldToPBIColumn('SaaS', 'ltv')).toEqual({ table: 'Subscription', column: 'LTV' });
      expect(mapFieldToPBIColumn('SaaS', 'arr')).toEqual({ table: 'Subscription', column: 'ARR' });
      expect(mapFieldToPBIColumn('SaaS', 'cac')).toEqual({ table: 'Subscription', column: 'CAC' });
    });

    it('resolves lowercase metrics to PascalCase schema columns', () => {
      expect(mapFieldToPBIColumn('Retail', 'revenue')).toEqual({ table: 'Sales', column: 'Revenue' });
      expect(mapFieldToPBIColumn('HR', 'salary')).toEqual({ table: 'Employee', column: 'Salary' });
      expect(mapFieldToPBIColumn('Logistics', 'cost')).toEqual({ table: 'Shipment', column: 'Cost' });
      expect(mapFieldToPBIColumn('Finance', 'amount')).toEqual({ table: 'FinanceRecord', column: 'Amount' });
      expect(mapFieldToPBIColumn('Social', 'engagements')).toEqual({ table: 'SocialPost', column: 'Engagements' });
    });

    it('preserves explicit dimension mappings for lowercase fields', () => {
      expect(mapFieldToPBIColumn('SaaS', 'tier')).toEqual({ table: 'Customer', column: 'Tier' });
      expect(mapFieldToPBIColumn('HR', 'department')).toEqual({ table: 'Employee', column: 'Department' });
      expect(mapFieldToPBIColumn('Logistics', 'carrier')).toEqual({ table: 'Shipment', column: 'Carrier' });
      expect(mapFieldToPBIColumn('Finance', 'account')).toEqual({ table: 'FinanceRecord', column: 'Account' });
      expect(mapFieldToPBIColumn('Social', 'platform')).toEqual({ table: 'SocialPost', column: 'Platform' });
    });
  });
});
