/**
 * PBIP Writer Tests
 *
 * Validates that exported PBIP visual JSON conforms to Power BI Desktop's schema.
 * These tests catch issues that cause PBI Desktop to reject .pbip imports:
 * - Invalid border properties (per-side widths)
 * - Invalid visual type strings
 * - Malformed literal expressions
 * - Missing required fields
 * - References to removed visual types
 */

import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { createPBIPPackage } from './pbipWriter';
import { PBI_VISUAL_TYPES } from './layoutConverter';
import type { DashboardItem, Scenario, VisualType } from '../types';
import { getRecipeForVisual } from '../store/bindingRecipes';

// ============================================================================
// Test Helpers
// ============================================================================

/** Known valid PBI visual type identifiers (from Power BI schema) */
const VALID_PBI_VISUAL_TYPES = new Set([
  'actionButton',
  'advancedSlicerVisual',
  'aiNarrativesViz',
  'anomalyDetectorVisual',
  'arcGISMap',
  'areaChart',
  'azureMap',
  'barChart',
  'basicShape',
  'card',
  'cardVisual',
  'clusteredBarChart',
  'clusteredColumnChart',
  'comboChart',
  'decompositionTreeVisual',
  'donutChart',
  'filledMap',
  'funnel',
  'gauge',
  'hundredPercentStackedBarChart',
  'hundredPercentStackedColumnChart',
  'image',
  'kpi',
  'lineChart',
  'lineClusteredColumnComboChart',
  'lineStackedColumnComboChart',
  'map',
  'multiRowCard',
  'paginator',
  'pieChart',
  'pivotTable',
  'ribbonChart',
  'scatterChart',
  'scriptVisual',
  'shapeMap',
  'slicer',
  'stackedAreaChart',
  'stackedBarChart',
  'stackedColumnChart',
  'tableEx',
  'textbox',
  'treemap',
  'waterfallChart',
]);

/** Visual types that were removed and must never appear in exports */
const REMOVED_VISUAL_TYPES = [
  'boxplot', 'histogram', 'violin', 'regressionScatter',
  'gantt', 'dotStrip',
  'controversyBar', 'entityTable', 'controversyTable',
  'portfolioCard', 'portfolioHeader', 'dateRangePicker',
  'portfolioHeaderBar', 'controversyBottomPanel',
  'justificationSearch', 'portfolioKPICards',
];

/** Border properties that PBI Desktop does NOT support */
const INVALID_BORDER_PROPS = ['topWidth', 'rightWidth', 'bottomWidth', 'leftWidth'];

/** Valid border properties according to PBI schema */
const VALID_BORDER_PROPS = ['show', 'color', 'radius', 'width'];

/** Create a minimal test item */
function makeItem(type: VisualType, scenario: Scenario, overrides?: Partial<DashboardItem>): DashboardItem {
  const recipe = getRecipeForVisual(type, scenario);
  return {
    id: `test-${type}-1`,
    type,
    title: `Test ${type}`,
    layout: { x: 0, y: 0, w: 16, h: 8 },
    props: { ...recipe },
    ...overrides,
  };
}

/** Create mock export data for a scenario */
function makeMockData(): any {
  const date = '2024-06-15T00:00:00Z';
  return {
    stores: [{ id: 's1', name: 'Store A', region: 'North', country: 'US' }],
    products: [{ id: 'p1', name: 'Widget', category: 'Gadgets', price: 9.99 }],
    sales: [{
      id: 'sale1', date, storeId: 's1', productId: 'p1',
      quantity: 10, quantityPL: 8, quantityPY: 9,
      revenue: 100, revenuePL: 80, revenuePY: 90,
      profit: 30, profitPL: 25, profitPY: 28,
      discount: 5, discountPL: 4, discountPY: 3,
    }],
    customers: [{ id: 'c1', name: 'Acme', tier: 'Gold', region: 'East', industry: 'Tech' }],
    subscriptions: [{
      id: 'sub1', date, customerId: 'c1',
      mrr: 500, mrrPL: 450, mrrPY: 400,
      churn: 0.02, ltv: 6000, arr: 6000, cac: 100,
    }],
    employees: [{
      id: 'e1', name: 'Jane', department: 'Engineering', role: 'Dev', office: 'NYC',
      hireDate: date, salary: 100000, salaryPL: 95000, salaryPY: 90000,
      rating: 4.5, ratingPL: 4.0, ratingPY: 4.2, attrition: 0, tenure: 3,
    }],
    shipments: [{
      id: 'sh1', origin: 'NYC', destination: 'LA', carrier: 'FedEx',
      cost: 50, costPL: 45, costPY: 48, weight: 10, weightPL: 9, weightPY: 8,
      status: 'Delivered', date, onTime: true,
    }],
    portfolioEntities: [{
      id: 'pe1', name: 'Corp A', sector: 'Tech', region: 'US',
      marketValue: 1000000, sourceRegion: 'NA', source: 'Bloomberg',
      accountReportName: 'Report1', accountCode: 'A001',
    }],
    controversyScores: [{
      id: 'cs1', entityId: 'pe1', entityName: 'Corp A', category: 'Environmental',
      score: 7, previousScore: 6, scoreChange: 1, validFrom: date,
      marketValue: 1000000, justification: 'Improved', source: 'MSCI',
      region: 'US', group: 'Group1',
    }],
    socialPosts: [{
      id: 'sp1', date, user: 'user1', location: 'NYC', platform: 'Twitter',
      sentiment: 'Positive', engagements: 100, engagementsPL: 90, engagementsPY: 80,
      mentions: 50, mentionsPL: 45, mentionsPY: 40, sentimentScore: 0.8,
    }],
    financeRecords: [{
      id: 'f1', date, account: 'Revenue', region: 'East', businessUnit: 'Corp',
      scenario: 'Actual', amount: 50000, variance: 5000,
    }],
  };
}

/** Extract all visual.json files from a PBIP zip blob */
async function extractVisuals(blob: Blob): Promise<Record<string, any>[]> {
  const buffer = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const visuals: Record<string, any>[] = [];

  for (const [path, file] of Object.entries(zip.files)) {
    if (path.endsWith('/visual.json') && !file.dir) {
      const content = await file.async('string');
      visuals.push(JSON.parse(content));
    }
  }
  return visuals;
}

/** Extract all files from a PBIP zip blob */
async function extractAllFiles(blob: Blob): Promise<Record<string, string>> {
  const buffer = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const files: Record<string, string> = {};

  for (const [path, file] of Object.entries(zip.files)) {
    if (!file.dir) {
      files[path] = await file.async('string');
    }
  }
  return files;
}

// ============================================================================
// Recursive Validation Helpers
// ============================================================================

/** Check if a value looks like a PBI literal value string */
function isValidLiteralValue(value: string): boolean {
  // Valid formats: 'true', 'false', 'null', '123D', '123L', quoted strings, etc.
  if (value === 'true' || value === 'false' || value === 'null') return true;
  if (/^-?\d+(\.\d+)?D$/.test(value)) return true; // decimal: 4D, 62.5D
  if (/^-?\d+(\.\d+)?L$/.test(value)) return true; // integer/long: 9L, 62L, 62.5L
  if (/^'.*'$/.test(value)) return true; // quoted string: '#FF0000', 'left'
  // JSON strings (paragraphs)
  if (value.startsWith('[') || value.startsWith('{')) return true;
  return false;
}

/** Recursively find all border object arrays in a visual JSON */
function findBorderObjects(obj: any, path = ''): Array<{ path: string; properties: Record<string, any> }> {
  const results: Array<{ path: string; properties: Record<string, any> }> = [];
  if (!obj || typeof obj !== 'object') return results;

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (key === 'border' && Array.isArray(value)) {
      for (const entry of value) {
        if (entry && entry.properties) {
          results.push({ path: currentPath, properties: entry.properties });
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      results.push(...findBorderObjects(value, currentPath));
    }
  }
  return results;
}

// ============================================================================
// Tests
// ============================================================================

describe('PBIP Schema Compliance', () => {
  // We test with multiple scenarios to cover different code paths
  const SCENARIOS: Scenario[] = ['Retail', 'SaaS', 'HR', 'Finance'];

  describe('removed visual types are excluded from PBI_VISUAL_TYPES', () => {
    it('PBI_VISUAL_TYPES does not contain any removed types', () => {
      const mappedTypes = Object.keys(PBI_VISUAL_TYPES);
      for (const removed of REMOVED_VISUAL_TYPES) {
        expect(mappedTypes).not.toContain(removed);
      }
    });
  });

  describe('all PBI_VISUAL_TYPES map to valid PBI identifiers', () => {
    it('every mapped type is a known PBI visual type', () => {
      const invalidMappings: string[] = [];
      for (const [phantomType, pbiType] of Object.entries(PBI_VISUAL_TYPES)) {
        if (!VALID_PBI_VISUAL_TYPES.has(pbiType)) {
          invalidMappings.push(`${phantomType} → ${pbiType}`);
        }
      }
      expect(invalidMappings).toEqual([]);
    });
  });

  describe('border properties comply with PBI schema', () => {
    // This test specifically catches the bug where topWidth/rightWidth/bottomWidth/leftWidth
    // were added to border objects, causing PBI Desktop to reject the import
    const borderScenarios: Array<{ scenario: Scenario; types: VisualType[] }> = [
      { scenario: 'Retail', types: ['card', 'kpi', 'bar', 'line', 'table', 'slicer'] },
      { scenario: 'SaaS', types: ['card', 'bar', 'line'] },
      { scenario: 'HR', types: ['card', 'bar'] },
    ];

    for (const { scenario, types } of borderScenarios) {
      it(`${scenario}: border objects only have valid properties (no per-side widths)`, async () => {
        const items = types.map((type) => makeItem(type, scenario));
        const { blob } = await createPBIPPackage(items, scenario, makeMockData());
        const visuals = await extractVisuals(blob);

        for (const visual of visuals) {
          const borders = findBorderObjects(visual);
          for (const { path, properties } of borders) {
            const propKeys = Object.keys(properties);

            // Assert no invalid per-side border properties
            for (const invalidProp of INVALID_BORDER_PROPS) {
              expect(propKeys, `${visual.name} at ${path} has invalid border property '${invalidProp}'`)
                .not.toContain(invalidProp);
            }

            // Assert all border props are from the valid set
            for (const key of propKeys) {
              expect(VALID_BORDER_PROPS, `${visual.name} at ${path}: unknown border property '${key}'`)
                .toContain(key);
            }
          }
        }
      });
    }
  });

  describe('visual JSON structure is valid', () => {
    for (const scenario of SCENARIOS) {
      it(`${scenario}: every visual has required fields`, async () => {
        const types: VisualType[] = ['card', 'bar', 'line', 'table'];
        const items = types.map((type) => makeItem(type, scenario));
        const { blob } = await createPBIPPackage(items, scenario, makeMockData());
        const visuals = await extractVisuals(blob);

        expect(visuals.length).toBe(types.length);

        for (const visual of visuals) {
          // Required top-level fields
          expect(visual.$schema).toBe(
            'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.5.0/schema.json'
          );
          expect(visual.name).toBeTruthy();
          expect(typeof visual.name).toBe('string');

          // Position
          expect(visual.position).toBeDefined();
          expect(typeof visual.position.x).toBe('number');
          expect(typeof visual.position.y).toBe('number');
          expect(typeof visual.position.width).toBe('number');
          expect(typeof visual.position.height).toBe('number');
          expect(visual.position.x).toBeGreaterThanOrEqual(0);
          expect(visual.position.y).toBeGreaterThanOrEqual(0);
          expect(visual.position.width).toBeGreaterThan(0);
          expect(visual.position.height).toBeGreaterThan(0);

          // Visual type
          expect(visual.visual).toBeDefined();
          expect(visual.visual.visualType).toBeTruthy();
          expect(VALID_PBI_VISUAL_TYPES.has(visual.visual.visualType),
            `Invalid PBI visual type: ${visual.visual.visualType}`
          ).toBe(true);
        }
      });
    }
  });

  describe('literal expressions are well-formed', () => {
    it('all literal values in visual objects are correctly formatted', async () => {
      const items: DashboardItem[] = [
        makeItem('card', 'Retail'),
        makeItem('bar', 'Retail'),
        makeItem('kpi', 'Retail'),
        makeItem('slicer', 'Retail'),
        makeItem('pie', 'Retail'),
        makeItem('line', 'Retail'),
      ];
      const { blob } = await createPBIPPackage(items, 'Retail', makeMockData());
      const visuals = await extractVisuals(blob);
      const errors: string[] = [];

      function checkLiterals(obj: any, path: string) {
        if (!obj || typeof obj !== 'object') return;

        // Check if this is a literal expression
        if (obj.expr?.Literal?.Value !== undefined) {
          const val = obj.expr.Literal.Value;
          if (typeof val !== 'string') {
            errors.push(`${path}: Literal.Value must be string, got ${typeof val} (${val})`);
          } else if (!isValidLiteralValue(val)) {
            errors.push(`${path}: Invalid literal value format: ${val}`);
          }
          return;
        }

        // Recurse
        for (const [key, value] of Object.entries(obj)) {
          if (Array.isArray(value)) {
            value.forEach((item, i) => checkLiterals(item, `${path}.${key}[${i}]`));
          } else if (typeof value === 'object' && value !== null) {
            checkLiterals(value, `${path}.${key}`);
          }
        }
      }

      for (const visual of visuals) {
        if (visual.visual?.objects) {
          checkLiterals(visual.visual.objects, `${visual.name}.objects`);
        }
        if (visual.visual?.visualContainerObjects) {
          checkLiterals(visual.visual.visualContainerObjects, `${visual.name}.visualContainerObjects`);
        }
      }

      expect(errors).toEqual([]);
    });
  });

  describe('color values are valid hex format', () => {
    it('all color literals in visuals are valid #RRGGBB', async () => {
      const items: DashboardItem[] = [
        makeItem('card', 'Retail'),
        makeItem('bar', 'Retail'),
        makeItem('line', 'Retail'),
        makeItem('pie', 'Retail'),
        makeItem('kpi', 'Retail'),
      ];
      const { blob } = await createPBIPPackage(items, 'Retail', makeMockData());
      const visuals = await extractVisuals(blob);
      const errors: string[] = [];
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      function checkColors(obj: any, path: string) {
        if (!obj || typeof obj !== 'object') return;

        // solid.color pattern indicates a color value
        if (obj.solid?.color?.expr?.Literal?.Value) {
          const rawValue = obj.solid.color.expr.Literal.Value;
          // Strip surrounding quotes: "'#FF0000'" → "#FF0000"
          const colorValue = rawValue.replace(/^'|'$/g, '');
          if (colorValue !== 'None' && !hexColorRegex.test(colorValue)) {
            errors.push(`${path}: Invalid hex color: ${rawValue}`);
          }
          return;
        }

        for (const [key, value] of Object.entries(obj)) {
          if (Array.isArray(value)) {
            value.forEach((item, i) => checkColors(item, `${path}.${key}[${i}]`));
          } else if (typeof value === 'object' && value !== null) {
            checkColors(value, `${path}.${key}`);
          }
        }
      }

      for (const visual of visuals) {
        if (visual.visual?.objects) {
          checkColors(visual.visual.objects, `${visual.name}.objects`);
        }
        if (visual.visual?.visualContainerObjects) {
          checkColors(visual.visual.visualContainerObjects, `${visual.name}.vco`);
        }
      }

      expect(errors).toEqual([]);
    });
  });

  describe('query state projections have correct structure', () => {
    it('all projections use Column or Measure field references', async () => {
      const items: DashboardItem[] = [
        makeItem('bar', 'Retail'),
        makeItem('line', 'Retail'),
        makeItem('scatter', 'Retail'),
        makeItem('combo', 'Retail'),
        makeItem('table', 'Retail'),
        makeItem('matrix', 'Retail'),
        makeItem('card', 'Retail'),
        makeItem('kpi', 'Retail'),
        makeItem('pie', 'Retail'),
        makeItem('funnel', 'Retail'),
        makeItem('slicer', 'Retail'),
      ];
      const { blob } = await createPBIPPackage(items, 'Retail', makeMockData());
      const visuals = await extractVisuals(blob);
      const errors: string[] = [];

      for (const visual of visuals) {
        const queryState = visual.visual?.query?.queryState;
        if (!queryState) continue;

        for (const [slot, slotData] of Object.entries(queryState as Record<string, any>)) {
          if (!slotData?.projections) continue;

          for (const [i, proj] of (slotData.projections as any[]).entries()) {
            const field = proj.field;
            if (!field) {
              errors.push(`${visual.name}.${slot}[${i}]: missing field`);
              continue;
            }

            const hasColumn = field.Column?.Expression?.SourceRef?.Entity;
            const hasMeasure = field.Measure?.Expression?.SourceRef?.Entity;

            if (!hasColumn && !hasMeasure) {
              errors.push(
                `${visual.name}.${slot}[${i}]: field must have Column.Expression.SourceRef.Entity or Measure.Expression.SourceRef.Entity`
              );
            }

            // Validate queryRef format: "Table.Field"
            if (proj.queryRef && !proj.queryRef.includes('.')) {
              errors.push(`${visual.name}.${slot}[${i}]: queryRef must be "Table.Field" format, got "${proj.queryRef}"`);
            }
          }
        }
      }

      expect(errors).toEqual([]);
    });
  });

  describe('PBIP ZIP structure is complete', () => {
    for (const scenario of SCENARIOS) {
      it(`${scenario}: has all required files`, async () => {
        const items = [makeItem('bar', scenario), makeItem('card', scenario)];
        const { blob } = await createPBIPPackage(items, scenario, makeMockData());
        const files = await extractAllFiles(blob);
        const paths = Object.keys(files);

        const projectName = `Phantom${scenario}`;

        // Manifest
        expect(paths.some(p => p.endsWith('.pbip'))).toBe(true);

        // Report structure
        expect(paths.some(p => p.includes(`${projectName}.Report/.platform`))).toBe(true);
        expect(paths.some(p => p.includes('definition/report.json'))).toBe(true);
        expect(paths.some(p => p.includes('definition/version.json'))).toBe(true);
        expect(paths.some(p => p.includes('pages/pages.json'))).toBe(true);
        expect(paths.some(p => p.includes('pages/page1/page.json'))).toBe(true);
        expect(paths.some(p => p.includes('BaseThemes/CY25SU12.json'))).toBe(true);

        // Visuals
        const visualFiles = paths.filter(p => p.endsWith('/visual.json'));
        expect(visualFiles.length).toBe(items.length);

        // Semantic model
        expect(paths.some(p => p.includes(`${projectName}.SemanticModel/.platform`))).toBe(true);
        expect(paths.some(p => p.includes('definition.pbism'))).toBe(true);
        expect(paths.some(p => p.includes('database.tmdl'))).toBe(true);
        expect(paths.some(p => p.includes('model.tmdl'))).toBe(true);
        expect(paths.some(p => p.includes('en-US.tmdl'))).toBe(true);

        // Tables
        const tmdlFiles = paths.filter(p => p.includes('/tables/') && p.endsWith('.tmdl'));
        expect(tmdlFiles.length).toBeGreaterThan(0);

        // Guide
        expect(paths.some(p => p.endsWith('_Guide.md'))).toBe(true);
      });
    }
  });

  describe('semantic model TMDL is valid', () => {
    it('model.tmdl has relationships and table refs', async () => {
      const items = [makeItem('bar', 'Retail')];
      const { blob } = await createPBIPPackage(items, 'Retail', makeMockData());
      const files = await extractAllFiles(blob);

      const modelFile = Object.entries(files).find(([p]) => p.endsWith('model.tmdl'));
      expect(modelFile).toBeDefined();

      const [, content] = modelFile!;
      expect(content).toContain('model Model');
      expect(content).toContain('culture: en-US');
      expect(content).toContain('defaultPowerBIDataSourceVersion: powerBI_V3');
      expect(content).toContain('ref table');
      expect(content).toContain('relationship');
      expect(content).toContain('fromColumn:');
      expect(content).toContain('toColumn:');
    });

    it('table TMDL files have measures and partitions', async () => {
      const items = [makeItem('bar', 'Retail')];
      const { blob } = await createPBIPPackage(items, 'Retail', makeMockData());
      const files = await extractAllFiles(blob);

      const tableFiles = Object.entries(files).filter(([p]) => p.includes('/tables/') && p.endsWith('.tmdl'));
      expect(tableFiles.length).toBeGreaterThan(0);

      // At least one table should have measures (the fact table)
      const hasMeasures = tableFiles.some(([, content]) => content.includes('measure '));
      expect(hasMeasures).toBe(true);

      // All tables should have partitions with data
      for (const [path, content] of tableFiles) {
        expect(content, `${path}: missing table declaration`).toMatch(/^table \w+/);
        expect(content, `${path}: missing partition`).toContain('partition ');
        expect(content, `${path}: missing lineageTag`).toContain('lineageTag:');
      }
    });
  });

  describe('report.json and page.json are well-formed', () => {
    it('report.json has required schema and settings', async () => {
      const items = [makeItem('bar', 'Retail')];
      const { blob } = await createPBIPPackage(items, 'Retail', makeMockData());
      const files = await extractAllFiles(blob);

      const reportFile = Object.entries(files).find(([p]) => p.endsWith('report.json'));
      expect(reportFile).toBeDefined();

      const report = JSON.parse(reportFile![1]);
      expect(report.$schema).toContain('report');
      expect(report.themeCollection).toBeDefined();
      expect(report.resourcePackages).toBeDefined();
      expect(report.settings).toBeDefined();
    });

    it('page.json has valid dimensions', async () => {
      const items = [makeItem('bar', 'Retail')];
      const { blob } = await createPBIPPackage(items, 'Retail', makeMockData());
      const files = await extractAllFiles(blob);

      const pageFile = Object.entries(files).find(([p]) => p.endsWith('page.json'));
      expect(pageFile).toBeDefined();

      const page = JSON.parse(pageFile![1]);
      expect(page.name).toBe('page1');
      expect(page.displayName).toBeTruthy();
      expect(page.width).toBeGreaterThan(0);
      expect(page.height).toBeGreaterThan(0);
      expect(page.displayOption).toBe('FitToPage');
    });
  });

  describe('all active visual types produce valid exports', () => {
    // Test every type in PBI_VISUAL_TYPES to ensure none crash during export
    const ALL_TYPES = Object.keys(PBI_VISUAL_TYPES) as VisualType[];

    it('every mapped visual type exports without error', async () => {
      const errors: string[] = [];

      for (const type of ALL_TYPES) {
        try {
          const item = makeItem(type, 'Retail');
          const { blob } = await createPBIPPackage([item], 'Retail', makeMockData());
          const visuals = await extractVisuals(blob);

          if (visuals.length === 0) {
            errors.push(`${type}: no visual.json generated`);
            continue;
          }

          const visual = visuals[0];
          if (!visual.visual?.visualType) {
            errors.push(`${type}: missing visualType`);
          } else if (!VALID_PBI_VISUAL_TYPES.has(visual.visual.visualType)) {
            errors.push(`${type}: invalid PBI type "${visual.visual.visualType}"`);
          }
        } catch (e) {
          errors.push(`${type}: export threw error: ${(e as Error).message}`);
        }
      }

      expect(errors).toEqual([]);
    });
  });

  describe('manifest and platform files are valid JSON', () => {
    it('.pbip manifest has artifacts', async () => {
      const items = [makeItem('bar', 'Retail')];
      const { blob } = await createPBIPPackage(items, 'Retail', makeMockData());
      const files = await extractAllFiles(blob);

      const manifest = Object.entries(files).find(([p]) => p.endsWith('.pbip'));
      expect(manifest).toBeDefined();

      const json = JSON.parse(manifest![1]);
      expect(json.version).toBe('1.0');
      expect(json.artifacts).toBeDefined();
      expect(json.artifacts.length).toBeGreaterThan(0);
    });

    it('.platform files have correct schema', async () => {
      const items = [makeItem('bar', 'Retail')];
      const { blob } = await createPBIPPackage(items, 'Retail', makeMockData());
      const files = await extractAllFiles(blob);

      const platformFiles = Object.entries(files).filter(([p]) => p.endsWith('.platform'));
      expect(platformFiles.length).toBe(2); // Report + SemanticModel

      for (const [path, content] of platformFiles) {
        const json = JSON.parse(content);
        expect(json.$schema, `${path}: missing $schema`).toContain('platformProperties');
        expect(json.metadata, `${path}: missing metadata`).toBeDefined();
        expect(json.metadata.type, `${path}: missing type`).toBeTruthy();
        expect(json.config, `${path}: missing config`).toBeDefined();
      }
    });
  });
});
