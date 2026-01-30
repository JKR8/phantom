/**
 * Test Case PBIP Exporter
 *
 * Exports all PBI renderer test cases as a PBIP package that can be
 * opened in Power BI Desktop to generate reference screenshots.
 */

import JSZip from 'jszip';

interface TestCaseData {
  category: string;
  value: number;
  series?: string;
}

interface TestCaseConfig {
  showDataLabels?: boolean;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showGridLines?: boolean;
  title?: string;
  subTitle?: string;
  dataLabelPosition?: 'outsideEnd' | 'insideEnd' | 'insideBase' | 'insideCenter';
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  showShadow?: boolean;
  categoryAxisTitle?: string;
  valueAxisTitle?: string;
  showAxisTitles?: boolean;
  showTickMarks?: boolean;
  barStrokeWidth?: number;
  barStrokeColor?: string;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  data: TestCaseData[];
  config: TestCaseConfig;
}

// Test case definitions (must match PBIRendererTest.tsx)
const TEST_CASES: TestCase[] = [
  {
    id: 'T01',
    name: 'Default Bar Chart',
    description: 'Basic bars, axes, grid with 5 categories',
    data: [
      { category: 'Category A', value: 120 },
      { category: 'Category B', value: 250 },
      { category: 'Category C', value: 180 },
      { category: 'Category D', value: 320 },
      { category: 'Category E', value: 210 }
    ],
    config: { showDataLabels: false, showGridLines: true }
  },
  {
    id: 'T02',
    name: 'Multi-series with Legend',
    description: 'Multiple series with legend positioning',
    data: [
      { category: 'Q1', value: 100, series: 'Series A' },
      { category: 'Q1', value: 80, series: 'Series B' },
      { category: 'Q2', value: 150, series: 'Series A' },
      { category: 'Q2', value: 120, series: 'Series B' },
      { category: 'Q3', value: 180, series: 'Series A' },
      { category: 'Q3', value: 160, series: 'Series B' },
      { category: 'Q4', value: 200, series: 'Series A' },
      { category: 'Q4', value: 190, series: 'Series B' }
    ],
    config: { showLegend: true, legendPosition: 'right', showGridLines: true }
  },
  {
    id: 'T03',
    name: 'Data Labels Enabled',
    description: 'Testing label placement algorithm',
    data: [
      { category: 'Product A', value: 450 },
      { category: 'Product B', value: 380 },
      { category: 'Product C', value: 290 },
      { category: 'Product D', value: 520 },
      { category: 'Product E', value: 410 }
    ],
    config: { showDataLabels: true, showGridLines: true }
  },
  {
    id: 'T04',
    name: 'Long Category Names',
    description: 'Testing text truncation with ellipsis',
    data: [
      { category: 'Very Long Category Name That Should Truncate', value: 150 },
      { category: 'Another Extremely Long Category Label', value: 220 },
      { category: 'Short', value: 180 },
      { category: 'This Is Also A Very Long Name For Testing', value: 310 },
      { category: 'Medium Length Name', value: 260 }
    ],
    config: { showDataLabels: false, showGridLines: true }
  },
  {
    id: 'T05',
    name: 'Large Values (K/M/B Formatting)',
    description: 'Testing K/M/B number formatting',
    data: [
      { category: 'Region A', value: 125000 },
      { category: 'Region B', value: 2500000 },
      { category: 'Region C', value: 890000 },
      { category: 'Region D', value: 1750000 },
      { category: 'Region E', value: 3200000 }
    ],
    config: { showDataLabels: true, showGridLines: true }
  },
  {
    id: 'T06',
    name: 'Visual with Title',
    description: 'Testing title and subtitle rendering',
    data: [
      { category: 'Sales', value: 450 },
      { category: 'Marketing', value: 380 },
      { category: 'Operations', value: 290 },
      { category: 'Engineering', value: 520 },
      { category: 'Support', value: 410 }
    ],
    config: {
      showDataLabels: false,
      showGridLines: true,
      title: 'Sales by Region',
      subTitle: 'Q4 2024 Performance'
    }
  },
  {
    id: 'T07',
    name: 'Data Labels - Inside End',
    description: 'Testing insideEnd label position',
    data: [
      { category: 'Product A', value: 450 },
      { category: 'Product B', value: 380 },
      { category: 'Product C', value: 290 },
      { category: 'Product D', value: 520 },
      { category: 'Product E', value: 410 }
    ],
    config: { showDataLabels: true, dataLabelPosition: 'insideEnd', showGridLines: true }
  },
  {
    id: 'T08',
    name: 'Data Labels - Inside Base',
    description: 'Testing insideBase label position',
    data: [
      { category: 'Product A', value: 450 },
      { category: 'Product B', value: 380 },
      { category: 'Product C', value: 290 },
      { category: 'Product D', value: 520 },
      { category: 'Product E', value: 410 }
    ],
    config: { showDataLabels: true, dataLabelPosition: 'insideBase', showGridLines: true }
  },
  {
    id: 'T09',
    name: 'Data Labels - Inside Center',
    description: 'Testing insideCenter label position',
    data: [
      { category: 'Product A', value: 450 },
      { category: 'Product B', value: 380 },
      { category: 'Product C', value: 290 },
      { category: 'Product D', value: 520 },
      { category: 'Product E', value: 410 }
    ],
    config: { showDataLabels: true, dataLabelPosition: 'insideCenter', showGridLines: true }
  },
  {
    id: 'T10',
    name: 'Data Labels - Outside End',
    description: 'Testing default outsideEnd label position',
    data: [
      { category: 'Product A', value: 450 },
      { category: 'Product B', value: 380 },
      { category: 'Product C', value: 290 },
      { category: 'Product D', value: 520 },
      { category: 'Product E', value: 410 }
    ],
    config: { showDataLabels: true, dataLabelPosition: 'outsideEnd', showGridLines: true }
  },
  {
    id: 'T11',
    name: 'Container with Border/Shadow',
    description: 'Testing border and drop shadow',
    data: [
      { category: 'Category A', value: 120 },
      { category: 'Category B', value: 250 },
      { category: 'Category C', value: 180 },
      { category: 'Category D', value: 320 },
      { category: 'Category E', value: 210 }
    ],
    config: {
      showDataLabels: false,
      showGridLines: true,
      showBorder: true,
      borderColor: '#342BC2',
      borderWidth: 2,
      borderRadius: 8,
      showShadow: true
    }
  },
  {
    id: 'T12',
    name: 'Axis Titles',
    description: 'Testing category and value axis titles',
    data: [
      { category: 'Q1', value: 1200 },
      { category: 'Q2', value: 1800 },
      { category: 'Q3', value: 1500 },
      { category: 'Q4', value: 2100 }
    ],
    config: {
      showDataLabels: false,
      showGridLines: true,
      showAxisTitles: true,
      categoryAxisTitle: 'Quarter',
      valueAxisTitle: 'Revenue ($K)'
    }
  },
  {
    id: 'T13',
    name: 'Tick Marks Enabled',
    description: 'Testing tick mark rendering',
    data: [
      { category: 'Category A', value: 120 },
      { category: 'Category B', value: 250 },
      { category: 'Category C', value: 180 },
      { category: 'Category D', value: 320 },
      { category: 'Category E', value: 210 }
    ],
    config: { showDataLabels: false, showGridLines: true, showTickMarks: true }
  },
  {
    id: 'T14',
    name: 'Bars with Stroke',
    description: 'Testing bar border/stroke',
    data: [
      { category: 'Category A', value: 120 },
      { category: 'Category B', value: 250 },
      { category: 'Category C', value: 180 },
      { category: 'Category D', value: 320 },
      { category: 'Category E', value: 210 }
    ],
    config: { showDataLabels: false, showGridLines: true, barStrokeWidth: 2, barStrokeColor: '#1A1464' }
  },
  {
    id: 'T15',
    name: 'Negative Values',
    description: 'Testing bidirectional bars with negative values',
    data: [
      { category: 'Product A', value: 150 },
      { category: 'Product B', value: -80 },
      { category: 'Product C', value: 220 },
      { category: 'Product D', value: -120 },
      { category: 'Product E', value: 50 }
    ],
    config: { showDataLabels: true, showGridLines: true }
  }
];

// Visual dimensions matching test harness
const VISUAL_WIDTH = 400;
const VISUAL_HEIGHT = 300;
const PADDING = 20;
const VISUALS_PER_ROW = 4;

const makeUuid = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

const makeLiteral = (value: string) => ({ expr: { Literal: { Value: value } } });
const makeSolidColor = (color: string) => ({ solid: { color: makeLiteral(`'${color}'`) } });

/**
 * Format M value for inline table
 */
function formatMValue(value: any, dataType: 'string' | 'double'): string {
  if (value === null || value === undefined) return 'null';
  if (dataType === 'string') {
    const safe = String(value).replace(/"/g, '""');
    return `"${safe}"`;
  }
  return String(value);
}

/**
 * Build TMDL for a test case table with inline data and measure
 */
function buildTableTMDL(testCase: TestCase): string {
  const hasSeries = testCase.data.some(d => d.series);
  const lines: string[] = [];

  // Table header
  lines.push(`table '${testCase.id}'`);
  lines.push(`\tlineageTag: ${makeUuid()}`);

  // Add measure for the value (unique name per table)
  const measureName = `${testCase.id} Value`;
  lines.push('');
  lines.push(`\tmeasure '${measureName}' = SUM('${testCase.id}'[Value])`);
  lines.push(`\t\tlineageTag: ${makeUuid()}`);

  // Columns
  lines.push('');
  lines.push('\tcolumn Category');
  lines.push('\t\tdataType: string');
  lines.push(`\t\tlineageTag: ${makeUuid()}`);
  lines.push('\t\tsummarizeBy: none');
  lines.push('\t\tsourceColumn: Category');

  lines.push('');
  lines.push('\tcolumn Value');
  lines.push('\t\tdataType: double');
  lines.push(`\t\tlineageTag: ${makeUuid()}`);
  lines.push('\t\tsummarizeBy: sum');
  lines.push('\t\tsourceColumn: Value');

  if (hasSeries) {
    lines.push('');
    lines.push('\tcolumn Series');
    lines.push('\t\tdataType: string');
    lines.push(`\t\tlineageTag: ${makeUuid()}`);
    lines.push('\t\tsummarizeBy: none');
    lines.push('\t\tsourceColumn: Series');
  }

  // Build type fields for M query
  const typeFields = hasSeries
    ? 'Category = Text.Type, Value = Number.Type, Series = Text.Type'
    : 'Category = Text.Type, Value = Number.Type';

  // Build row values
  const rowValues = testCase.data.map(d => {
    if (hasSeries) {
      return `\t\t\t\t{${formatMValue(d.category, 'string')}, ${formatMValue(d.value, 'double')}, ${formatMValue(d.series || '', 'string')}}`;
    }
    return `\t\t\t\t{${formatMValue(d.category, 'string')}, ${formatMValue(d.value, 'double')}}`;
  });

  // Partition with M query
  lines.push('');
  lines.push(`\tpartition '${testCase.id}' = m`);
  lines.push('\t\tmode: import');
  lines.push('\t\tsource =');
  lines.push('\t\t\tlet');
  lines.push('\t\t\t    Source = #table(');
  lines.push(`\t\t\t        type table [${typeFields}],`);
  lines.push('\t\t\t        {');
  lines.push(rowValues.join(',\n'));
  lines.push('\t\t\t        }');
  lines.push('\t\t\t    )');
  lines.push('\t\t\tin');
  lines.push('\t\t\t    Source');

  return lines.join('\n');
}

/**
 * Map data label position to Power BI labelPosition value
 */
function getLabelPosition(position?: string): string {
  switch (position) {
    case 'insideEnd': return "'InsideEnd'";
    case 'insideBase': return "'InsideBase'";
    case 'insideCenter': return "'InsideCenter'";
    default: return "'OutsideEnd'";
  }
}

/**
 * Build visual JSON for a test case
 */
function buildVisualJson(testCase: TestCase, index: number): object {
  const row = Math.floor(index / VISUALS_PER_ROW);
  const col = index % VISUALS_PER_ROW;
  const x = PADDING + col * (VISUAL_WIDTH + PADDING);
  const y = PADDING + row * (VISUAL_HEIGHT + PADDING);

  const hasSeries = testCase.data.some(d => d.series);
  const config = testCase.config;
  const tableName = testCase.id;
  const measureName = `${testCase.id} Value`;

  // Build query state - Category uses Column, Y uses Measure
  const queryState: Record<string, any> = {
    Category: {
      projections: [{
        field: {
          Column: {
            Expression: { SourceRef: { Entity: tableName } },
            Property: 'Category'
          }
        },
        queryRef: `${tableName}.Category`,
        nativeQueryRef: 'Category',
        active: true
      }]
    },
    Y: {
      projections: [{
        field: {
          Measure: {
            Expression: { SourceRef: { Entity: tableName } },
            Property: measureName
          }
        },
        queryRef: `${tableName}.${measureName}`,
        nativeQueryRef: measureName
      }]
    }
  };

  // Add series/legend if multi-series
  if (hasSeries) {
    queryState.Series = {
      projections: [{
        field: {
          Column: {
            Expression: { SourceRef: { Entity: tableName } },
            Property: 'Series'
          }
        },
        queryRef: `${tableName}.Series`,
        nativeQueryRef: 'Series'
      }]
    };
  }

  // Build visual objects (styling)
  const objects: Record<string, any[]> = {};

  // Category axis
  objects.categoryAxis = [{
    properties: {
      show: makeLiteral('true'),
      showAxisTitle: makeLiteral(config.showAxisTitles && config.categoryAxisTitle ? 'true' : 'false'),
    }
  }];
  if (config.categoryAxisTitle) {
    objects.categoryAxis[0].properties.axisTitle = makeLiteral(`'${config.categoryAxisTitle}'`);
  }

  // Value axis
  objects.valueAxis = [{
    properties: {
      show: makeLiteral('true'),
      showAxisTitle: makeLiteral(config.showAxisTitles && config.valueAxisTitle ? 'true' : 'false'),
      gridlineShow: makeLiteral(config.showGridLines !== false ? 'true' : 'false'),
    }
  }];
  if (config.valueAxisTitle) {
    objects.valueAxis[0].properties.axisTitle = makeLiteral(`'${config.valueAxisTitle}'`);
  }

  // Data labels
  objects.labels = [{
    properties: {
      show: makeLiteral(config.showDataLabels ? 'true' : 'false'),
      labelPosition: makeLiteral(getLabelPosition(config.dataLabelPosition)),
    }
  }];

  // Legend
  const legendPos = config.legendPosition || 'right';
  const legendPosCapitalized = legendPos.charAt(0).toUpperCase() + legendPos.slice(1);
  objects.legend = [{
    properties: {
      show: makeLiteral(config.showLegend || hasSeries ? 'true' : 'false'),
      position: makeLiteral(`'${legendPosCapitalized}'`),
    }
  }];

  // Data point color
  objects.dataPoint = [{
    properties: {
      fill: makeSolidColor('#342BC2'),
    }
  }];

  // Visual container objects (border, shadow, title)
  const visualContainerObjects: Record<string, any[]> = {};

  // Title
  if (config.title) {
    visualContainerObjects.title = [{
      properties: {
        show: makeLiteral('true'),
        text: makeLiteral(`'${config.title}'`),
        fontColor: makeSolidColor('#342BC2'),
        fontSize: makeLiteral('14D'),
      }
    }];
  } else {
    visualContainerObjects.title = [{
      properties: {
        show: makeLiteral('false'),
      }
    }];
  }

  // Subtitle
  if (config.subTitle) {
    visualContainerObjects.subTitle = [{
      properties: {
        show: makeLiteral('true'),
        text: makeLiteral(`'${config.subTitle}'`),
        fontColor: makeSolidColor('#605E5C'),
        fontSize: makeLiteral('11D'),
      }
    }];
  }

  // Border
  if (config.showBorder) {
    visualContainerObjects.border = [{
      properties: {
        show: makeLiteral('true'),
        color: makeSolidColor(config.borderColor || '#CCCCCC'),
        width: makeLiteral(`${config.borderWidth || 1}D`),
        radius: makeLiteral(`${config.borderRadius || 0}D`),
      }
    }];
  }

  // Shadow
  if (config.showShadow) {
    visualContainerObjects.dropShadow = [{
      properties: {
        show: makeLiteral('true'),
        color: makeSolidColor('rgba(0,0,0,0.15)'),
        position: makeLiteral("'Outer'"),
        preset: makeLiteral("'BottomRight'"),
      }
    }];
  }

  return {
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.5.0/schema.json',
    name: testCase.id,
    position: {
      x,
      y,
      z: index * 1000,
      width: VISUAL_WIDTH,
      height: VISUAL_HEIGHT,
      tabOrder: index,
    },
    visual: {
      visualType: 'clusteredBarChart',
      query: { queryState },
      objects,
      visualContainerObjects,
      drillFilterOtherVisuals: true,
    },
  };
}

/**
 * Export all test cases as a PBIP package
 */
export async function exportAllTestCases(): Promise<{ blob: Blob; filename: string }> {
  const projectName = 'PBIRendererTestCases';
  const zip = new JSZip();

  const reportLogicalId = makeUuid();
  const modelLogicalId = makeUuid();

  // Calculate page dimensions
  const rows = Math.ceil(TEST_CASES.length / VISUALS_PER_ROW);
  const pageWidth = PADDING * 2 + VISUALS_PER_ROW * (VISUAL_WIDTH + PADDING);
  const pageHeight = PADDING * 2 + rows * (VISUAL_HEIGHT + PADDING);

  // PBIP manifest
  zip.file(`${projectName}.pbip`, JSON.stringify({
    version: '1.0',
    artifacts: [{ report: { path: `${projectName}.Report` } }],
    settings: { enableAutoRecovery: true },
  }, null, 2));

  // Report platform
  zip.file(`${projectName}.Report/.platform`, JSON.stringify({
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json',
    metadata: { type: 'Report', displayName: projectName },
    config: { version: '2.0', logicalId: reportLogicalId },
  }, null, 2));

  // Create .pbi folder
  zip.folder(`${projectName}.Report/.pbi`);

  // Report definition
  zip.file(`${projectName}.Report/definition.pbir`, JSON.stringify({
    version: '4.0',
    datasetReference: { byPath: { path: `../${projectName}.SemanticModel` } },
  }, null, 2));

  // Report JSON
  zip.file(`${projectName}.Report/definition/report.json`, JSON.stringify({
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/report/3.1.0/schema.json',
    themeCollection: {
      baseTheme: {
        name: 'CY25SU12',
        reportVersionAtImport: { visual: '2.5.0', report: '3.1.0', page: '2.3.0' },
        type: 'SharedResources',
      },
    },
    resourcePackages: [{
      name: 'SharedResources',
      type: 'SharedResources',
      items: [{ name: 'CY25SU12', path: 'BaseThemes/CY25SU12.json', type: 'BaseTheme' }],
    }],
    settings: {
      useStylableVisualContainerHeader: true,
      exportDataMode: 'AllowSummarized',
    },
  }, null, 2));

  // Version
  zip.file(`${projectName}.Report/definition/version.json`, JSON.stringify({
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/versionMetadata/1.0.0/schema.json',
    version: '2.0.0',
  }, null, 2));

  // Pages metadata
  zip.file(`${projectName}.Report/definition/pages/pages.json`, JSON.stringify({
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.0.0/schema.json',
    pageOrder: ['page1'],
    activePageName: 'page1',
  }, null, 2));

  // Page definition
  zip.file(`${projectName}.Report/definition/pages/page1/page.json`, JSON.stringify({
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.0.0/schema.json',
    name: 'page1',
    displayName: 'Test Cases',
    displayOption: 'FitToPage',
    height: pageHeight,
    width: pageWidth,
  }, null, 2));

  // Theme
  zip.file(`${projectName}.Report/StaticResources/SharedResources/BaseThemes/CY25SU12.json`, JSON.stringify({
    version: '5.50',
    name: 'CY25SU12',
    dataColors: ['#342BC2', '#6F67F1', '#9993FF', '#44B0AB', '#93BF35'],
  }, null, 2));

  // Visuals
  TEST_CASES.forEach((testCase, index) => {
    const visualJson = buildVisualJson(testCase, index);
    zip.file(
      `${projectName}.Report/definition/pages/page1/visuals/${testCase.id}/visual.json`,
      JSON.stringify(visualJson, null, 2)
    );
  });

  // Semantic model platform
  zip.file(`${projectName}.SemanticModel/.platform`, JSON.stringify({
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json',
    metadata: { type: 'SemanticModel', displayName: projectName },
    config: { version: '2.0', logicalId: modelLogicalId },
  }, null, 2));

  // Create .pbi folder for semantic model
  zip.folder(`${projectName}.SemanticModel/.pbi`);

  // Editor settings
  zip.file(`${projectName}.SemanticModel/.pbi/editorSettings.json`, JSON.stringify({
    version: '1.0',
    autodetectRelationships: false,
    parallelQueryLoading: true,
    typeDetectionEnabled: true,
  }, null, 2));

  // Semantic model definition
  zip.file(`${projectName}.SemanticModel/definition.pbism`, JSON.stringify({
    version: '4.2',
    settings: {},
  }, null, 2));

  // Database TMDL
  zip.file(`${projectName}.SemanticModel/definition/database.tmdl`, 'database\n\tcompatibilityLevel: 1600\n');

  // Culture
  zip.file(`${projectName}.SemanticModel/definition/cultures/en-US.tmdl`,
    'cultureInfo en-US\n\n\tlinguisticMetadata =\n\t\t\t{\n\t\t\t  "Version": "1.0.0",\n\t\t\t  "Language": "en-US"\n\t\t\t}\n\t\tcontentType: json\n'
  );

  // Model TMDL
  const modelTmdl = [
    'model Model',
    '\tculture: en-US',
    '\tdefaultPowerBIDataSourceVersion: powerBI_V3',
    '\tsourceQueryCulture: en-AU',
    '\tdataAccessOptions',
    '\t\tlegacyRedirects',
    '\t\treturnErrorValuesAsNull',
    '',
    ...TEST_CASES.map(tc => `ref table '${tc.id}'`),
    '',
    'ref cultureInfo en-US',
  ].join('\n');
  zip.file(`${projectName}.SemanticModel/definition/model.tmdl`, modelTmdl);

  // Tables - each test case is its own table
  TEST_CASES.forEach(testCase => {
    const tableTmdl = buildTableTMDL(testCase);
    zip.file(`${projectName}.SemanticModel/definition/tables/${testCase.id}.tmdl`, tableTmdl);
  });

  // Diagram layout
  zip.file(`${projectName}.SemanticModel/diagramLayout.json`, JSON.stringify({
    version: '1.1.0',
    diagrams: [{
      ordinal: 0,
      scrollPosition: { x: 0, y: 0 },
      nodes: [],
      name: 'All tables',
      zoomValue: 100,
      pinKeyFieldsToTop: false,
      showExtraHeaderInfo: false,
      hideKeyFieldsWhenCollapsed: false,
      tablesLocked: false,
    }],
    selectedDiagram: 'All tables',
    defaultDiagram: 'All tables',
  }, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const filename = `${projectName}_${new Date().toISOString().split('T')[0]}.pbip.zip`;

  return { blob, filename };
}

/**
 * Download test cases PBIP
 */
export async function downloadTestCasesPBIP(): Promise<void> {
  const { blob, filename } = await exportAllTestCases();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
