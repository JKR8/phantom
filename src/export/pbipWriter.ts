/**
 * PBIP Exporter - creates a Power BI Project (PBIP) package with a semantic model
 * and report definition that opens with data loaded.
 */

import JSZip from 'jszip';
import {
  DashboardItem,
  Scenario,
  Store,
  Product,
  Sale,
  Customer,
  Subscription,
  Employee,
  Shipment,
  PortfolioEntity,
  ControversyScore,
  SocialPost,
} from '../types';
import { PBISchema, getSchemaForScenario, getFactTableForScenario, mapFieldToPBIColumn } from './schemaGenerator';
import { DAXMeasure, generateAllMeasures } from './daxGenerator';
import { calculateOptimalCanvas, gridToPixels, getPBIVisualType } from './layoutConverter';
import { ScenarioFields, ScenarioType } from '../store/semanticLayer';

export interface ExportData {
  stores: Store[];
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  subscriptions: Subscription[];
  employees: Employee[];
  shipments: Shipment[];
  portfolioEntities: PortfolioEntity[];
  controversyScores: ControversyScore[];
  socialPosts: SocialPost[];
  financeRecords?: Array<Record<string, any>>;
}

const DEFAULT_THEME_COLORS = [
  '#118DFF',
  '#12239E',
  '#E66C37',
  '#6B007B',
  '#E044A7',
  '#744EC2',
  '#D9B300',
  '#D64550',
  '#197278',
  '#6F9FB0',
];

// Mokkup brand color palette for multi-series charts
const MOKKUP_BRAND_COLORS = {
  primary: '#342BC2',     // Bars, funnel, data points, heatmap max
  secondary: '#6F67F1',   // Second data series
  tertiary: '#9993FF',    // Third data series
  quaternary: '#417ED9',  // Fourth data series
  quinary: '#2565C3',     // Fifth data series
  lineAccent: '#44B0AB',  // Combo chart line (teal)
  success: '#93BF35',     // KPI distance positive
  textPrimary: '#252423', // KPI indicator, status colors
  textSecondary: '#808080', // Goal text, secondary labels
  title: '#342BC2',       // Visual titles
  background: '#FFFFFF',  // White backgrounds
};

// Array of series colors for multi-series charts
const MOKKUP_SERIES_COLORS = [
  MOKKUP_BRAND_COLORS.primary,
  MOKKUP_BRAND_COLORS.secondary,
  MOKKUP_BRAND_COLORS.tertiary,
  MOKKUP_BRAND_COLORS.quaternary,
  MOKKUP_BRAND_COLORS.quinary,
];

const buildBaseThemeJson = (colors?: string[]) => JSON.stringify({
  version: '5.50',
  name: 'CY25SU12',
  textClasses: {
    label: { fontFace: 'Segoe UI', fontSize: 12 },
    title: { fontFace: 'Segoe UI Semibold', fontSize: 16 },
  },
  dataColors: (colors && colors.length > 0) ? colors : DEFAULT_THEME_COLORS,
  visualStyles: {},
}, null, 2);

const REPORT_JSON = {
  $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/report/3.1.0/schema.json',
  themeCollection: {
    baseTheme: {
      name: 'CY25SU12',
      reportVersionAtImport: {
        visual: '2.5.0',
        report: '3.1.0',
        page: '2.3.0',
      },
      type: 'SharedResources',
    },
  },
  objects: {
    section: [
      {
        properties: {
          verticalAlignment: {
            expr: {
              Literal: {
                Value: "'Top'",
              },
            },
          },
        },
      },
    ],
  },
  resourcePackages: [
    {
      name: 'SharedResources',
      type: 'SharedResources',
      items: [
        {
          name: 'CY25SU12',
          path: 'BaseThemes/CY25SU12.json',
          type: 'BaseTheme',
        },
      ],
    },
  ],
  settings: {
    useStylableVisualContainerHeader: true,
    exportDataMode: 'AllowSummarized',
    defaultDrillFilterOtherVisuals: true,
    allowChangeFilterTypes: true,
    useEnhancedTooltips: true,
    useDefaultAggregateDisplayName: true,
  },
};

const REPORT_VERSION_JSON = {
  $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/versionMetadata/1.0.0/schema.json',
  version: '2.0.0',
};

const REPORT_PAGES_JSON = {
  $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.0.0/schema.json',
  pageOrder: ['page1'],
  activePageName: 'page1',
};

const PBISM_JSON = {
  version: '4.2',
  settings: {},
};

const DATABASE_TMDL = `database\n\tcompatibilityLevel: 1600\n`;

const CULTURE_TMDL = `cultureInfo en-US\n\n\tlinguisticMetadata =\n\t\t\t{\n\t\t\t  \"Version\": \"1.0.0\",\n\t\t\t  \"Language\": \"en-US\"\n\t\t\t}\n\t\tcontentType: json\n`;

const DIAGRAM_LAYOUT_JSON = {
  version: '1.1.0',
  diagrams: [
    {
      ordinal: 0,
      scrollPosition: { x: 0, y: 0 },
      nodes: [],
      name: 'All tables',
      zoomValue: 100,
      pinKeyFieldsToTop: false,
      showExtraHeaderInfo: false,
      hideKeyFieldsWhenCollapsed: false,
      tablesLocked: false,
    },
  ],
  selectedDiagram: 'All tables',
  defaultDiagram: 'All tables',
};

const EDITOR_SETTINGS_JSON = {
  version: '1.0',
  autodetectRelationships: false,
  parallelQueryLoading: true,
  typeDetectionEnabled: true,
  relationshipImportEnabled: true,
  runBackgroundAnalysis: true,
  shouldNotifyUserOfNameConflictResolution: true,
};

const PBIP_PLATFORM_SCHEMA = 'https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json';

const REPORT_PLATFORM_TEMPLATE = (displayName: string, logicalId: string) => ({
  $schema: PBIP_PLATFORM_SCHEMA,
  metadata: { type: 'Report', displayName },
  config: { version: '2.0', logicalId },
});

const MODEL_PLATFORM_TEMPLATE = (displayName: string, logicalId: string) => ({
  $schema: PBIP_PLATFORM_SCHEMA,
  metadata: { type: 'SemanticModel', displayName },
  config: { version: '2.0', logicalId },
});

const PBIP_MANIFEST = (reportPath: string) => ({
  version: '1.0',
  artifacts: [
    { report: { path: reportPath } },
  ],
  settings: { enableAutoRecovery: true },
});

const PBIR_TEMPLATE = (semanticModelPath: string) => ({
  version: '4.0',
  datasetReference: {
    byPath: {
      path: semanticModelPath,
    },
  },
});

const makePageJson = (displayName: string, width: number, height: number) => ({
  $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.0.0/schema.json',
  name: 'page1',
  displayName,
  displayOption: 'FitToPage',
  height,
  width,
});

const makeUuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const getOperationLabel = (operation: string) => {
  if (operation === 'sum') return 'Total';
  if (operation === 'avg' || operation === 'average') return 'Avg';
  if (operation === 'count') return 'Count of';
  if (operation === 'min') return 'Min';
  if (operation === 'max') return 'Max';
  return operation.charAt(0).toUpperCase() + operation.slice(1);
};

const getMeasureName = (metric: string, operation = 'sum') => {
  const metricLabel = metric.replace(/PL$/, ' Plan').replace(/PY$/, ' PY');
  return `${getOperationLabel(operation)} ${metricLabel}`.replace(/\s+/g, ' ').trim();
};

const toMType = (dataType: string) => {
  switch (dataType) {
    case 'string':
      return 'Text.Type';
    case 'int64':
      return 'Int64.Type';
    case 'double':
      return 'Number.Type';
    case 'dateTime':
      return 'DateTime.Type';
    case 'boolean':
      return 'Logical.Type';
    default:
      return 'Text.Type';
  }
};

const formatMValue = (value: any, dataType: string) => {
  if (value === null || value === undefined) return 'null';
  if (dataType === 'string') {
    const safe = String(value).replace(/"/g, '""');
    return `"${safe}"`;
  }
  if (dataType === 'dateTime') {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'null';
    return `#datetime(${date.getFullYear()}, ${date.getMonth() + 1}, ${date.getDate()}, ${date.getHours()}, ${date.getMinutes()}, ${date.getSeconds()})`;
  }
  if (dataType === 'boolean') return value ? 'true' : 'false';
  return String(value);
};

const getFormatString = (dataType: string, columnName: string) => {
  const lower = columnName.toLowerCase();
  if (dataType === 'dateTime') return 'General Date';
  if (dataType === 'int64') return '0';
  if (dataType === 'double') {
    if (['revenue', 'profit', 'cost', 'salary', 'mrr', 'ltv', 'amount', 'price', 'marketvalue'].some((k) => lower.includes(k))) {
      return '$#,0.00;($#,0.00);$#,0.00';
    }
    return '0.00';
  }
  return undefined;
};

const buildDateTable = (
  dates: string[],
  includeQuarter = false,
  includeMonthNum = false,
  includeWeekNum = false,
  includeDayOfWeek = false
) => {
  const uniqueDates = Array.from(new Set(dates.map((d) => new Date(d).toISOString().split('T')[0])));
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return uniqueDates.map((dateStr) => {
    const date = new Date(dateStr);
    const month = monthNames[date.getMonth()];
    const row: Record<string, any> = {
      Date: date.toISOString(),
      Year: date.getFullYear(),
      Month: month,
    };
    if (includeQuarter) {
      row.Quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`;
    }
    if (includeMonthNum) {
      row.MonthNum = date.getMonth() + 1;
    }
    if (includeWeekNum) {
      // ISO week number calculation
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      row.WeekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    }
    if (includeDayOfWeek) {
      row.DayOfWeek = dayNames[date.getDay()];
    }
    return row;
  });
};

const buildScenarioTables = (scenario: Scenario, data: ExportData, schema: PBISchema) => {
  const tableRows: Record<string, Array<Record<string, any>>> = {};

  if (scenario === 'Retail') {
    tableRows.Sales = data.sales.map((sale) => ({
      SaleID: sale.id,
      Date: sale.date,
      StoreID: sale.storeId,
      ProductID: sale.productId,
      Quantity: sale.quantity,
      QuantityPL: sale.quantityPL,
      QuantityPY: sale.quantityPY,
      Revenue: sale.revenue,
      RevenuePL: sale.revenuePL,
      RevenuePY: sale.revenuePY,
      Profit: sale.profit,
      ProfitPL: sale.profitPL,
      ProfitPY: sale.profitPY,
      Discount: sale.discount,
      DiscountPL: sale.discountPL,
      DiscountPY: sale.discountPY,
    }));
    tableRows.Store = data.stores.map((store) => ({
      StoreID: store.id,
      StoreName: store.name,
      Region: store.region,
      Country: store.country,
    }));
    tableRows.Product = data.products.map((product) => ({
      ProductID: product.id,
      ProductName: product.name,
      Category: product.category,
      Price: product.price,
    }));
    tableRows.DateTable = buildDateTable(data.sales.map((s) => s.date), true, true, true, true);
  } else if (scenario === 'SaaS') {
    tableRows.Subscription = data.subscriptions.map((sub) => ({
      SubscriptionID: sub.id,
      Date: sub.date,
      CustomerID: sub.customerId,
      MRR: sub.mrr,
      MRRPL: sub.mrrPL,
      MRRPY: sub.mrrPY,
      Churn: sub.churn,
      LTV: sub.ltv,
      ARR: sub.arr,
      CAC: sub.cac,
    }));
    tableRows.Customer = data.customers.map((cust) => ({
      CustomerID: cust.id,
      CustomerName: cust.name,
      Tier: cust.tier,
      Region: cust.region,
      Industry: cust.industry,
    }));
    tableRows.DateTable = buildDateTable(data.subscriptions.map((s) => s.date), false, true);
  } else if (scenario === 'HR') {
    tableRows.Employee = data.employees.map((emp) => ({
      EmployeeID: emp.id,
      EmployeeName: emp.name,
      Department: emp.department,
      Role: emp.role,
      Office: emp.office,
      HireDate: emp.hireDate,
      Salary: emp.salary,
      SalaryPL: emp.salaryPL,
      SalaryPY: emp.salaryPY,
      Rating: emp.rating,
      RatingPL: emp.ratingPL,
      RatingPY: emp.ratingPY,
      Attrition: emp.attrition,
      Tenure: emp.tenure,
    }));
    tableRows.Department = Array.from(new Set(data.employees.map((e) => e.department))).map((dept) => ({
      Department: dept,
      DepartmentGroup: 'General',
    }));
    tableRows.DateTable = buildDateTable(data.employees.map((e) => e.hireDate), false, true);
  } else if (scenario === 'Logistics') {
    tableRows.Shipment = data.shipments.map((ship) => ({
      ShipmentID: ship.id,
      Origin: ship.origin,
      Destination: ship.destination,
      Carrier: ship.carrier,
      Cost: ship.cost,
      CostPL: ship.costPL,
      CostPY: ship.costPY,
      Weight: ship.weight,
      WeightPL: ship.weightPL,
      WeightPY: ship.weightPY,
      Status: ship.status,
      Date: ship.date,
      OnTime: ship.onTime,
    }));
    tableRows.Carrier = Array.from(new Set(data.shipments.map((s) => s.carrier))).map((carrier) => ({
      Carrier: carrier,
      CarrierType: 'Third Party',
    }));
    const locations = Array.from(new Set(data.shipments.flatMap((s) => [s.origin, s.destination])));
    tableRows.Location = locations.map((city) => ({
      City: city,
      Country: 'Unknown',
      Region: 'Unknown',
    }));
    tableRows.DateTable = buildDateTable(data.shipments.map((s) => s.date), false, true);
  } else if (scenario === 'Portfolio') {
    tableRows.PortfolioEntity = data.portfolioEntities.map((entity) => ({
      EntityID: entity.id,
      EntityName: entity.name,
      Sector: entity.sector,
      Region: entity.region,
      MarketValue: entity.marketValue,
      SourceRegion: entity.sourceRegion,
      Source: entity.source,
      AccountReportName: entity.accountReportName,
      AccountCode: entity.accountCode,
    }));
    tableRows.ControversyScore = data.controversyScores.map((score) => ({
      ScoreID: score.id,
      EntityID: score.entityId,
      EntityName: score.entityName,
      Category: score.category,
      Score: score.score,
      PreviousScore: score.previousScore,
      ScoreChange: score.scoreChange,
      ValidFrom: score.validFrom,
      MarketValue: score.marketValue,
      Justification: score.justification,
      Source: score.source,
      Region: score.region,
      Group: score.group,
    }));
    tableRows.Category = Array.from(new Set(data.controversyScores.map((s) => s.category))).map((category) => ({
      Category: category,
      CategoryType: 'ESG',
    }));
    tableRows.DateTable = buildDateTable(data.controversyScores.map((s) => s.validFrom), false, false);
  } else if (scenario === 'Social') {
    tableRows.SocialPost = data.socialPosts.map((post) => ({
      PostID: post.id,
      Date: post.date,
      User: post.user,
      Location: post.location,
      Platform: post.platform,
      Sentiment: post.sentiment,
      Engagements: post.engagements,
      EngagementsPL: post.engagementsPL,
      EngagementsPY: post.engagementsPY,
      Mentions: post.mentions,
      MentionsPL: post.mentionsPL,
      MentionsPY: post.mentionsPY,
      SentimentScore: post.sentimentScore,
    }));
    tableRows.DateTable = buildDateTable(data.socialPosts.map((p) => p.date), true, true);
  } else if (scenario === 'Finance') {
    const records = data.financeRecords || [];
    tableRows.FinanceRecord = records.map((record) => ({
      FinanceID: record.id,
      Date: record.date,
      Account: record.account,
      Region: record.region,
      BusinessUnit: record.businessUnit,
      Scenario: record.scenario,
      Amount: record.amount,
      Variance: record.variance,
    }));
    tableRows.DateTable = buildDateTable(records.map((r) => r.date), false, true);
  }

  // Ensure every schema table exists
  schema.tables.forEach((table) => {
    if (!tableRows[table.name]) {
      tableRows[table.name] = [];
    }
  });

  return tableRows;
};

const buildTableTMDL = (tableName: string, columns: PBISchema['tables'][0]['columns'], rows: Array<Record<string, any>>, measures: DAXMeasure[] = []) => {
  const lines: string[] = [];
  lines.push(`table ${tableName}`);
  lines.push(`\tlineageTag: ${makeUuid()}`);

  measures.forEach((measure) => {
    const expression = measure.expression.trim().replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ');
    lines.push('');
    lines.push(`\tmeasure '${measure.name}' = ${expression}`);
    if (measure.formatString) {
      lines.push(`\t\tformatString: ${measure.formatString}`);
    }
    if (measure.displayFolder) {
      lines.push(`\t\tdisplayFolder: ${measure.displayFolder}`);
    }
    lines.push(`\t\tlineageTag: ${makeUuid()}`);
  });

  columns.forEach((col) => {
    lines.push('');
    lines.push(`\tcolumn ${col.name}`);
    lines.push(`\t\tdataType: ${col.dataType}`);
    const formatString = getFormatString(col.dataType, col.name);
    if (formatString) {
      lines.push(`\t\tformatString: ${formatString}`);
    }
    lines.push(`\t\tlineageTag: ${makeUuid()}`);
    lines.push(`\t\tsummarizeBy: ${col.summarizeBy || 'none'}`);
    lines.push(`\t\tsourceColumn: ${col.sourceColumn || col.name}`);
  });

  const typeFields = columns.map((col) => `${col.name} = ${toMType(col.dataType)}`).join(', ');
  const rowValues = rows.map((row) => {
    const values = columns.map((col) => formatMValue(row[col.name], col.dataType));
    return `\t\t\t\t{${values.join(', ')}}`;
  });

  lines.push('');
  lines.push(`\tpartition ${tableName} = m`);
  lines.push(`\t\tmode: import`);
  lines.push(`\t\tsource =`);
  lines.push(`\t\t\tlet`);
  lines.push(`\t\t\t    Source = #table(`);
  lines.push(`\t\t\t        type table [${typeFields}],`);
  lines.push(`\t\t\t        {`);
  lines.push(rowValues.join(',\n'));
  lines.push(`\t\t\t        }`);
  lines.push(`\t\t\t    )`);
  lines.push(`\t\t\tin`);
  lines.push(`\t\t\t    Source`);

  return lines.join('\n');
};

const buildModelTMDL = (schema: PBISchema) => {
  const lines: string[] = [];
  lines.push('model Model');
  lines.push('\tculture: en-US');
  lines.push('\tdefaultPowerBIDataSourceVersion: powerBI_V3');
  lines.push('\tsourceQueryCulture: en-AU');
  lines.push('\tdataAccessOptions');
  lines.push('\t\tlegacyRedirects');
  lines.push('\t\treturnErrorValuesAsNull');
  lines.push('');
  lines.push('annotation __PBI_TimeIntelligenceEnabled = 1');
  lines.push('');
  lines.push('annotation PBI_ProTooling = ["DevMode"]');
  lines.push('');
  schema.tables.forEach((table) => {
    lines.push(`ref table ${table.name}`);
  });
  lines.push('');
  lines.push('ref cultureInfo en-US');

  schema.relationships.forEach((rel) => {
    lines.push('');
    lines.push(`relationship ${makeUuid()}`);
    lines.push(`\tfromColumn: ${rel.fromTable}.${rel.fromColumn}`);
    lines.push(`\ttoColumn: ${rel.toTable}.${rel.toColumn}`);
    lines.push(`\tcrossFilteringBehavior: ${rel.crossFilteringBehavior}`);
    lines.push('\tfromCardinality: many');
    lines.push('\ttoCardinality: one');
    lines.push(`\tisActive: ${rel.isActive ? 'true' : 'false'}`);
  });

  return lines.join('\n');
};

const buildQueryProjection = (table: string, field: string, isMeasure: boolean, options?: { active?: boolean; displayName?: string }) => {
  const base = isMeasure ? {
    field: {
      Measure: {
        Expression: {
          SourceRef: { Entity: table },
        },
        Property: field,
      },
    },
    queryRef: `${table}.${field}`,
    nativeQueryRef: field,
  } : {
    field: {
      Column: {
        Expression: {
          SourceRef: { Entity: table },
        },
        Property: field,
      },
    },
    queryRef: `${table}.${field}`,
    nativeQueryRef: field,
  };

  // Add optional properties
  if (options?.active) {
    (base as any).active = true;
  }
  if (options?.displayName) {
    (base as any).displayName = options.displayName;
  }

  return base;
};

// Helper to build sort definition for visuals
const buildSortDefinition = (table: string, field: string, direction: 'Ascending' | 'Descending' = 'Descending') => ({
  sort: [{
    field: {
      Aggregation: {
        Expression: {
          Column: {
            Expression: {
              SourceRef: { Entity: table },
            },
            Property: field,
          },
        },
        Function: 0,
      },
    },
    direction,
  }],
  isDefaultSort: true,
});

const getDefaultTableColumns = (scenario: ScenarioType) => {
  const fields = ScenarioFields[scenario] || [];
  const dimension = fields.find((f) => f.role !== 'Measure' && f.role !== 'Identifier')?.name;
  const measures = fields.filter((f) => f.role === 'Measure').slice(0, 2).map((f) => f.name);
  return [dimension, ...measures].filter(Boolean) as string[];
};

const buildQueryState = (item: DashboardItem, scenario: Scenario, measures: DAXMeasure[]) => {
  const props = item.props || {};
  const operation = (props.operation || 'sum').toString().toLowerCase();
  const factTable = getFactTableForScenario(scenario);
  const measureName = props.metric ? getMeasureName(props.metric, operation) : undefined;
  const measureExists = measureName && measures.some((m) => m.name === measureName);
  const scenarioFields = ScenarioFields[scenario as ScenarioType] || [];
  const defaultCategory = scenarioFields.find((f) => f.role === 'Category' || f.role === 'Entity' || f.role === 'Geography')?.name;
  const defaultTime = scenarioFields.find((f) => f.role === 'Time')?.name;

  const resolveColumn = (field?: string) => {
    if (!field) return null;
    const mapping = mapFieldToPBIColumn(scenario, field);
    return { table: mapping.table, column: mapping.column };
  };

  const resolveMeasure = (metric?: string) => {
    if (!metric) return null;
    const name = getMeasureName(metric, operation);
    if (!measures.some((m) => m.name === name)) return null;
    return { table: factTable, measure: name };
  };

  const resolveNamedMeasure = (name?: string) => {
    if (!name) return null;
    if (!measures.some((m) => m.name === name)) return null;
    return { table: factTable, measure: name };
  };

  const addRetailKpiMeasures = (metric?: string, op?: string) => {
    if (!metric) return [] as any[];
    const operation = (op || 'sum').toString().toLowerCase();
    const metricLabel = metric.charAt(0).toUpperCase() + metric.slice(1);
    const candidates = [
      getMeasureName(`${metric}PY`, operation),
      getMeasureName(`${metric}PL`, operation),
      `${metricLabel} ΔPY%`,
      `${metricLabel} ΔPL%`,
    ];
    return candidates
      .map((name) => resolveNamedMeasure(name))
      .filter(Boolean)
      .map((m) => buildQueryProjection(m!.table, m!.measure, true));
  };

  const queryState: Record<string, any> = {};

  // Retail cards use new cardVisual with reference labels for variance display
  // Structure: Values[0] = main callout, Values[1..n] = reference labels (variances)
  if (item.type === 'card' && scenario === 'Retail') {
    const metric = resolveMeasure(props.metric);
    if (metric) {
      const projections = [buildQueryProjection(metric.table, metric.measure, true)];

      // Add variance measures as reference labels
      const metricLabel = (props.metric || '').charAt(0).toUpperCase() + (props.metric || '').slice(1);

      // ΔPY% (Prior Year variance percentage)
      const pyPctMeasure = resolveNamedMeasure(`${metricLabel} ΔPY%`);
      if (pyPctMeasure) {
        projections.push(buildQueryProjection(pyPctMeasure.table, pyPctMeasure.measure, true));
      }

      // ΔPL% (Plan variance percentage)
      const plPctMeasure = resolveNamedMeasure(`${metricLabel} ΔPL%`);
      if (plPctMeasure) {
        projections.push(buildQueryProjection(plPctMeasure.table, plPctMeasure.measure, true));
      }

      queryState.Values = { projections };
    }
    return queryState;
  }

  switch (item.type) {
    case 'bar':
    case 'column':
    case 'stackedBar':
    case 'stackedColumn': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField);
      const metric = resolveMeasure(props.metric);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })] };
      if (metric) {
        queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true, { displayName: metric.measure })] };
        // Add default sort
        queryState._sortDefinition = { isDefaultSort: true };
      }
      break;
    }
    case 'line':
    case 'area': {
      const dimField = props.dimension || defaultTime;
      const dim = resolveColumn(dimField);
      const metric = resolveMeasure(props.metric);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })] };
      if (metric) queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
      break;
    }
    case 'pie':
    case 'donut':
    case 'treemap': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField);
      const metric = resolveMeasure(props.metric);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })] };
      if (metric) queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
      break;
    }
    case 'funnel': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField);
      const metric = resolveMeasure(props.metric);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })] };
      if (metric) {
        queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
        // Funnel needs sort definition to order by value descending
        queryState._sortDefinition = buildSortDefinition(factTable, metric.measure.replace('Total ', ''));
      }
      break;
    }
    case 'waterfall': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField);
      const metric = resolveMeasure(props.metric);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      if (metric) queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
      break;
    }
    case 'card':
    case 'gauge': {
      const metric = resolveMeasure(props.metric);
      if (metric) {
        const projections = [buildQueryProjection(metric.table, metric.measure, true)];
        if (scenario === 'Retail') {
          projections.push(...addRetailKpiMeasures(props.metric, operation));
        }
        queryState.Values = { projections };
      }
      break;
    }
    case 'kpi': {
      // Power BI KPI visual: Indicator (main value), Goal (target), TrendLine (time column for sparkline)
      const metric = resolveMeasure(props.metric);
      if (metric) {
        // Indicator: the main measure value
        queryState.Indicator = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };

        // Goal: use PY measure for comparison (matches "vs prev" / "PY" goalText)
        const pyMeasureName = getMeasureName(`${props.metric}PY`, operation);
        const pyMeasure = resolveNamedMeasure(pyMeasureName);
        if (pyMeasure) {
          queryState.Goal = { projections: [buildQueryProjection(pyMeasure.table, pyMeasure.measure, true)] };
        }

        // TrendLine: bind to DateTable.Month for the sparkline (required for KPI to display properly)
        queryState.TrendLine = { projections: [buildQueryProjection('DateTable', 'Month', false)] };
      }
      break;
    }
    case 'scatter': {
      const x = resolveMeasure(props.xMetric);
      const y = resolveMeasure(props.yMetric);
      const size = resolveMeasure(props.sizeMetric);
      const dim = resolveColumn(props.dimension);
      // Category is the bubble identity
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })] };
      // Series for color grouping (use dimension if available)
      if (dim) queryState.Series = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      // Size for bubble size
      if (size) queryState.Size = { projections: [buildQueryProjection(size.table, size.measure, true)] };
      // X axis measure
      if (x) queryState.X = { projections: [buildQueryProjection(x.table, x.measure, true, { active: true })] };
      // Y axis measure
      if (y) queryState.Y = { projections: [buildQueryProjection(y.table, y.measure, true)] };
      break;
    }
    case 'combo': {
      // Combo chart: Category (x-axis), Y (bars), Y2 (line)
      const dimField = props.dimension || defaultTime;
      const dim = resolveColumn(dimField);
      const barMetric = resolveMeasure(props.barMetric || props.metric);
      const lineMetric = resolveMeasure(props.lineMetric);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })] };
      if (barMetric) queryState.Y = { projections: [buildQueryProjection(barMetric.table, barMetric.measure, true, { displayName: 'Bars' })] };
      if (lineMetric) queryState.Y2 = { projections: [buildQueryProjection(lineMetric.table, lineMetric.measure, true, { displayName: 'Line' })] };
      queryState._sortDefinition = { isDefaultSort: true };
      break;
    }
    case 'table': {
      const columns = (props.columns && props.columns.length > 0)
        ? props.columns
        : getDefaultTableColumns(scenario as ScenarioType);
      const projections: any[] = [];
      columns.forEach((col: string) => {
        const dimension = resolveColumn(col);
        if (dimension) {
          projections.push(buildQueryProjection(dimension.table, dimension.column, false));
          return;
        }
        const measure = resolveMeasure(col);
        if (measure) projections.push(buildQueryProjection(measure.table, measure.measure, true));
      });
      if (measureExists) {
        projections.push(buildQueryProjection(factTable, measureName!, true));
      }
      queryState.Values = { projections };
      break;
    }
    case 'matrix': {
      const rowField = props.rows;
      const colField = props.columns;
      const valField = props.values;
      const row = resolveColumn(rowField);
      const col = resolveColumn(colField);
      const val = resolveMeasure(valField);
      if (row) queryState.Rows = { projections: [buildQueryProjection(row.table, row.column, false, { active: true })] };
      if (col) queryState.Columns = { projections: [buildQueryProjection(col.table, col.column, false, { active: true })] };
      if (val) queryState.Values = { projections: [buildQueryProjection(val.table, val.measure, true)] };
      break;
    }
    case 'slicer': {
      const dim = resolveColumn(props.dimension);
      if (dim) queryState.Values = { projections: [buildQueryProjection(dim.table, dim.column, false, { active: true })] };
      break;
    }
    // Card-like visuals - use same pattern as 'card'
    case 'multiRowCard':
    case 'portfolioCard':
    case 'portfolioKPICards': {
      // Multi-row cards show category + multiple measures
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField);
      const metric = resolveMeasure(props.metric);
      const projections: any[] = [];
      if (dim) projections.push(buildQueryProjection(dim.table, dim.column, false));
      if (metric) projections.push(buildQueryProjection(metric.table, metric.measure, true));
      if (scenario === 'Retail') {
        projections.push(...addRetailKpiMeasures(props.metric, operation));
      }
      if (projections.length > 0) queryState.Values = { projections };
      break;
    }
    // Table-like visuals - use same pattern as 'table'
    case 'entityTable':
    case 'controversyTable':
    case 'controversyBottomPanel': {
      const columns = (props.columns && props.columns.length > 0)
        ? props.columns
        : getDefaultTableColumns(scenario as ScenarioType);
      const projections: any[] = [];
      columns.forEach((col: string) => {
        const dimension = resolveColumn(col);
        if (dimension) {
          projections.push(buildQueryProjection(dimension.table, dimension.column, false));
          return;
        }
        const measure = resolveMeasure(col);
        if (measure) projections.push(buildQueryProjection(measure.table, measure.measure, true));
      });
      if (projections.length > 0) queryState.Values = { projections };
      break;
    }
    // Bar chart visuals - use same pattern as 'bar'
    case 'controversyBar': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField);
      const metric = resolveMeasure(props.metric);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      if (metric) queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
      break;
    }
    // Slicer-like visuals
    case 'dateRangePicker':
    case 'justificationSearch': {
      const dim = resolveColumn(props.dimension || 'Date');
      if (dim) queryState.Values = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      break;
    }
    // Text visuals - return empty queryState (content handled in buildVisualObjects)
    case 'portfolioHeader':
    case 'portfolioHeaderBar': {
      // No query state needed for text boxes
      break;
    }
  }

  return queryState;
};

const makeLiteral = (value: string) => ({ expr: { Literal: { Value: value } } });
const makeSolidColor = (color: string) => ({ solid: { color: makeLiteral(`'${color}'`) } });

const buildVisualObjects = (item: DashboardItem, pbiType: string, scenario: Scenario, themeColors?: string[]): Record<string, any> => {
  const objects: Record<string, any> = {};
  const primaryColor = (themeColors && themeColors.length > 0) ? themeColors[0] : '#118DFF';

  // Special handling for textbox visuals
  if (pbiType === 'textbox') {
    const textContent = item.title || item.props?.title || item.props?.text || '';
    objects.general = [{
      properties: {
        paragraphs: {
          expr: {
            Literal: {
              Value: JSON.stringify([{
                textRuns: [{
                  value: textContent,
                  textStyle: {
                    fontFamily: 'Segoe UI',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  }
                }],
                horizontalTextAlignment: 'left',
              }])
            }
          }
        }
      }
    }];
    return objects;
  }

  // Retail: apply Mokkup-style visual formatting
  if (scenario === 'Retail') {
    // New cardVisual styling (GA November 2025) - matches web UI KPICard design
    // Features: callout value + reference labels for ΔPY/ΔPL variance indicators
    if (pbiType === 'cardVisual' && item.type === 'card') {
      // Callout area styling - large bold value
      objects.calloutArea = [{
        properties: {
          size: makeLiteral('60D'), // Callout takes 60% of card height
        }
      }];

      // Callout value - main KPI number (matches web UI 28px bold)
      objects.calloutValue = [{
        properties: {
          fontFamily: makeLiteral("'''Segoe UI Bold'', wf_segoe-ui_bold, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('28D'),
          fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textPrimary),
          horizontalAlignment: makeLiteral("'center'"),
          labelDisplayUnits: makeLiteral('1D'), // Auto display units (K, M)
        }
      }];

      // Callout label - title/label (matches web UI 12px gray)
      objects.calloutLabel = [{
        properties: {
          fontFamily: makeLiteral("'''Segoe UI'', wf_segoe-ui_normal, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('12D'),
          fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textSecondary),
          position: makeLiteral("'aboveValue'"),
          show: makeLiteral('true'),
        }
      }];

      // Reference labels layout - vertical stacking (matches web UI variance rows)
      objects.referenceLabelsLayout = [{
        properties: {
          position: makeLiteral("'below'"), // Reference labels below callout
          layout: makeLiteral("'vertical'"), // Stack vertically
          spacing: makeLiteral('4D'), // Gap between rows
        }
      }];

      // Reference labels divider - separator line (matches web UI border-top)
      objects.divider = [{
        properties: {
          show: makeLiteral('true'),
          color: makeSolidColor('#F0F0F0'), // Light gray divider
          width: makeLiteral('1D'),
        }
      }];

      // Reference label value styling - percentage variance
      objects.referenceLabelValue = [{
        properties: {
          fontFamily: makeLiteral("'''Segoe UI Semibold'', wf_segoe-ui_semibold, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('12D'),
          // Color is applied via conditional formatting rules per-label
          labelDisplayUnits: makeLiteral('0D'), // Show percentage as-is
        }
      }];

      // Reference label title styling - ΔPY, ΔPL labels
      objects.referenceLabelTitle = [{
        properties: {
          fontFamily: makeLiteral("'''Segoe UI'', wf_segoe-ui_normal, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('11D'),
          fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textSecondary),
          show: makeLiteral('true'),
        }
      }];

      // Reference label detail - absolute variance value
      objects.referenceLabelDetail = [{
        properties: {
          fontFamily: makeLiteral("'''Segoe UI'', wf_segoe-ui_normal, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('11D'),
          fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textSecondary),
          show: makeLiteral('true'),
        }
      }];

      // Reference labels background
      objects.referenceLabelsBackground = [{
        properties: {
          show: makeLiteral('false'),
        }
      }];

      // Card styling - accent bar effect via border
      objects.cardBackground = [{
        properties: {
          color: makeSolidColor(MOKKUP_BRAND_COLORS.background),
          show: makeLiteral('true'),
        }
      }];

      // Layout padding
      objects.padding = [{
        properties: {
          top: makeLiteral('6D'),
          bottom: makeLiteral('6D'),
          left: makeLiteral('10D'),
          right: makeLiteral('10D'),
        }
      }];

      return objects;
    }

    // KPI visual styling - matches mokkup template
    if (pbiType === 'kpi') {
      // Determine if this KPI should show distance (percentage) based on goalText
      // "vs prev" style = show distance, specific number goal (like "10,000") = hide distance
      const goalText = item.props?.goalText || 'vs prev';
      const showDistance = goalText.toLowerCase().includes('vs') || goalText.toLowerCase().includes('prev') || goalText.toLowerCase() === 'py';

      objects.goals = [{
        properties: {
          goalText: makeLiteral(`'${goalText}'`),
          fontSize: makeLiteral('10D'),
          goalFontFamily: makeLiteral("'''Segoe UI'', wf_segoe-ui_normal, helvetica, arial, sans-serif'"),
          goalFontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textSecondary),
          showGoal: makeLiteral('true'),
          direction: makeLiteral("'High is good'"),
          distanceLabel: makeLiteral("'Percent'"),
          distanceFontColor: makeSolidColor(MOKKUP_BRAND_COLORS.success),
          distanceFontFamily: makeLiteral("'''Segoe UI Semibold'', wf_segoe-ui_semibold, helvetica, arial, sans-serif'"),
          showDistance: makeLiteral(showDistance ? 'true' : 'false'),
          titleFontSize: makeLiteral('10D'),
          titleBold: makeLiteral('false'),
          titleItalic: makeLiteral('false'),
          titleUnderline: makeLiteral('false'),
          underline: makeLiteral('false'),
          italic: makeLiteral('false'),
          bold: makeLiteral('false'),
        }
      }];
      objects.indicator = [{
        properties: {
          horizontalAlignment: makeLiteral("'left'"),
          verticalAlignment: makeLiteral("'middle'"),
          fontFamily: makeLiteral("'''Segoe UI Bold'', wf_segoe-ui_bold, helvetica, arial, sans-serif'"),
          fontSize: makeLiteral('18D'),
          indicatorDisplayUnits: makeLiteral('1D'),
          showIcon: makeLiteral('false'),
          bold: makeLiteral('false'),
          italic: makeLiteral('false'),
          underline: makeLiteral('false'),
        }
      }];
      objects.trendline = [{
        properties: {
          transparency: makeLiteral('20D'),
          show: makeLiteral('false'),
        }
      }];
      objects.status = [{
        properties: {
          direction: makeLiteral("'Negative'"), // Mokkup template uses 'Negative'
          goodColor: makeSolidColor(MOKKUP_BRAND_COLORS.textPrimary),
          neutralColor: makeSolidColor(MOKKUP_BRAND_COLORS.textPrimary),
          badColor: makeSolidColor(MOKKUP_BRAND_COLORS.textPrimary),
        }
      }];
      objects.lastDate = [{
        properties: { show: makeLiteral('false') }
      }];
      return objects;
    }

    // Slicer styling (dropdown)
    if (pbiType === 'slicer') {
      objects.data = [{
        properties: {
          mode: makeLiteral("'Dropdown'"),
        }
      }];
      objects.header = [{
        properties: { show: makeLiteral('false') }
      }];
      objects.selection = [{
        properties: { strictSingleSelect: makeLiteral('true') }
      }];
      objects.items = [{
        properties: {
          background: makeSolidColor(MOKKUP_BRAND_COLORS.background),
        }
      }];
      return objects;
    }

    // Bar chart styling (matches mokkup template)
    if (item.type === 'bar' || item.type === 'column') {
      objects.categoryAxis = [{
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('false'),
          innerPadding: makeLiteral('62.5L'),
          preferredCategoryWidth: makeLiteral('20D'),
        }
      }];
      objects.valueAxis = [{
        properties: {
          show: makeLiteral('false'),
          showAxisTitle: makeLiteral('false'),
          end: makeLiteral('null'),
          invertAxis: makeLiteral('false'),
          gridlineShow: makeLiteral('true'),
        }
      }];
      objects.legend = [{
        properties: {
          show: makeLiteral('false'),
          showGradientLegend: makeLiteral('false'),
          position: makeLiteral("'Top'"),
        }
      }];
      objects.labels = [{
        properties: {
          show: makeLiteral('true'),
          labelPosition: makeLiteral("'InsideEnd'"),
          enableTitleDataLabel: makeLiteral('false'),
          fontSize: makeLiteral('8D'),
        }
      }];
      objects.dataPoint = [
        {
          properties: {
            fill: makeSolidColor(MOKKUP_BRAND_COLORS.primary),
            fillTransparency: makeLiteral('0D'),
          }
        },
        { properties: { fill: makeSolidColor(MOKKUP_BRAND_COLORS.primary) } },
      ];
      return objects;
    }

    // Stacked bar/column chart styling (with multi-series colors)
    if (item.type === 'stackedBar' || item.type === 'stackedColumn') {
      objects.categoryAxis = [{
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('false'),
          innerPadding: makeLiteral('62.5L'),
          preferredCategoryWidth: makeLiteral('20D'),
        }
      }];
      objects.valueAxis = [{
        properties: {
          show: makeLiteral('false'),
          showAxisTitle: makeLiteral('false'),
          end: makeLiteral('null'),
          invertAxis: makeLiteral('false'),
          gridlineShow: makeLiteral('true'),
        }
      }];
      objects.legend = [{
        properties: {
          show: makeLiteral('true'),
          showGradientLegend: makeLiteral('false'),
          position: makeLiteral("'Top'"),
        }
      }];
      objects.labels = [{
        properties: {
          show: makeLiteral('true'),
          labelPosition: makeLiteral("'InsideCenter'"),
          enableTitleDataLabel: makeLiteral('false'),
          fontSize: makeLiteral('8D'),
        }
      }];
      // Multi-series colors for stacked charts
      objects.dataPoint = MOKKUP_SERIES_COLORS.map((color, index) => ({
        properties: {
          fill: makeSolidColor(color),
          fillTransparency: makeLiteral('0D'),
        },
        ...(index > 0 ? { selector: { data: [{ dataViewWildcard: { matchingOption: index } }] } } : {}),
      }));
      return objects;
    }

    // Line chart styling
    if (item.type === 'line' || item.type === 'area') {
      objects.categoryAxis = [{
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('false'),
          innerPadding: makeLiteral('62.5L'),
        }
      }];
      objects.valueAxis = [{
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('false'),
          invertAxis: makeLiteral('false'),
          gridlineShow: makeLiteral('false'),
          gridlineStyle: makeLiteral("'solid'"),
        }
      }];
      objects.legend = [{
        properties: {
          show: makeLiteral('false'),
        }
      }];
      objects.labels = [{
        properties: {
          show: makeLiteral('false'),
          labelPosition: makeLiteral("'Under'"),
          enableTitleDataLabel: makeLiteral('false'),
          fontSize: makeLiteral('8D'),
        }
      }];
      objects.lineStyles = [{
        properties: {
          lineStyle: makeLiteral("'solid'"),
          lineChartType: makeLiteral("'smooth'"),
          strokeWidth: makeLiteral('1L'),
          showMarker: makeLiteral('true'),
          markerSize: makeLiteral('4D'),
        }
      }];
      objects.dataPoint = [{
        properties: {
          fill: makeSolidColor(primaryColor),
        }
      }];
      objects.title = [{
        properties: {
          show: makeLiteral('true'),
          text: makeLiteral(`'${(item.title || '').replace(/'/g, "''")}'`),
          fontColor: makeSolidColor('#252423'),
          fontSize: makeLiteral('12L'),
        }
      }];
      return objects;
    }

    // Combo chart styling (matches mokkup template)
    if (item.type === 'combo') {
      objects.categoryAxis = [{
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('false'),
          innerPadding: makeLiteral('62.5L'),
        }
      }];
      objects.valueAxis = [{
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('false'),
          invertAxis: makeLiteral('false'),
          gridlineShow: makeLiteral('false'),
          gridlineStyle: makeLiteral("'solid'"),
          secShow: makeLiteral('true'),
          secShowAxisTitle: makeLiteral('false'),
        }
      }];
      objects.legend = [{
        properties: {
          show: makeLiteral('true'),
          position: makeLiteral("'Top'"),
        }
      }];
      objects.labels = [{
        properties: {
          show: makeLiteral('false'),
          labelPosition: makeLiteral("'Under'"),
          enableTitleDataLabel: makeLiteral('false'),
          fontSize: makeLiteral('8D'),
        }
      }];
      objects.lineStyles = [{
        properties: {
          lineStyle: makeLiteral("'solid'"),
          lineChartType: makeLiteral("'smooth'"),
          strokeWidth: makeLiteral('1L'),
          showMarker: makeLiteral('true'),
          markerSize: makeLiteral('4D'),
        }
      }];
      // Mokkup colors: lineAccent for line, primary for bars
      objects.dataPoint = [
        {
          properties: { fill: makeSolidColor(MOKKUP_BRAND_COLORS.lineAccent) }, // Line color (teal)
          selector: { metadata: `Sum(${getFactTableForScenario(scenario)}.${(item.props?.lineMetric || '').charAt(0).toUpperCase() + (item.props?.lineMetric || '').slice(1)})` }
        },
        {
          properties: { fill: makeSolidColor(MOKKUP_BRAND_COLORS.primary) }, // Bar color (brand purple)
        }
      ];
      return objects;
    }

    // Pie/donut cleanup with multi-series colors
    if (item.type === 'pie' || item.type === 'donut') {
      objects.legend = [{
        properties: {
          show: makeLiteral('true'),
          position: makeLiteral("'Top'"),
        }
      }];
      objects.dataLabels = [{
        properties: {
          show: makeLiteral('false'),
        }
      }];
      objects.title = [{
        properties: {
          show: makeLiteral('true'),
          text: makeLiteral(`'${(item.title || '').replace(/'/g, "''")}'`),
          fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.textPrimary),
          fontSize: makeLiteral('12L'),
        }
      }];
      // Multi-series colors for pie/donut slices
      objects.dataPoint = MOKKUP_SERIES_COLORS.map((color, index) => ({
        properties: {
          fill: makeSolidColor(color),
        },
        ...(index > 0 ? { selector: { data: [{ dataViewWildcard: { matchingOption: index } }] } } : {}),
      }));
      return objects;
    }

    // Funnel chart styling (matches mokkup template)
    if (item.type === 'funnel') {
      objects.percentBarLabel = [{
        properties: { show: makeLiteral('false') }
      }];
      objects.labels = [{
        properties: {
          show: makeLiteral('false'),
          labelPosition: makeLiteral("'InsideCenter'"),
          labelDisplayUnits: makeLiteral('0D'),
          labelPrecision: makeLiteral('2L'),
        }
      }];
      objects.dataPoint = [
        { properties: { showAllDataPoints: makeLiteral('true') } },
        { properties: { fill: makeSolidColor(MOKKUP_BRAND_COLORS.primary) } },
      ];
      return objects;
    }

    // Scatter chart styling (matches mokkup template)
    if (item.type === 'scatter') {
      objects.trend = [{
        properties: {
          show: makeLiteral('false'),
          displayName: makeLiteral("'Trend line'"),
          width: makeLiteral('3D'),
          style: makeLiteral("'solid'"),
          combineSeries: makeLiteral('false'),
        }
      }];
      objects.categoryAxis = [{
        properties: {
          show: makeLiteral('true'),
          showAxisTitle: makeLiteral('true'),
          gridlineShow: makeLiteral('false'),
          gridlineTransparency: makeLiteral('0D'),
          gridlineStyle: makeLiteral("'solid'"),
        }
      }];
      objects.valueAxis = [{
        properties: {
          showAxisTitle: makeLiteral('true'),
          start: makeLiteral('null'),
          end: makeLiteral('null'),
          gridlineShow: makeLiteral('false'),
          gridlineStyle: makeLiteral("'solid'"),
          gridlineTransparency: makeLiteral('0D'),
        }
      }];
      objects.legend = [{
        properties: {
          show: makeLiteral('true'),
          showGradientLegend: makeLiteral('true'),
          position: makeLiteral("'Top'"),
          showTitle: makeLiteral('false'),
        }
      }];
      objects.dataPoint = [{
        properties: { fill: makeSolidColor(MOKKUP_BRAND_COLORS.primary) }
      }];
      objects.bubbles = [{
        properties: {
          bubbleSize: makeLiteral('6.5L'),
          markerShape: makeLiteral("'circle'"),
        }
      }];
      objects.markers = [{
        properties: {
          borderShow: makeLiteral('true'),
          transparency: makeLiteral('0D'),
        }
      }];
      return objects;
    }

    // Matrix/pivotTable styling (matches mokkup heatmap template)
    if (item.type === 'matrix') {
      objects.subTotals = [{
        properties: {
          columnSubtotals: makeLiteral('false'),
          rowSubtotals: makeLiteral('false'),
        }
      }];
      objects.grid = [{
        properties: {
          textSize: makeLiteral('10D'),
          rowPadding: makeLiteral('1D'),
          gridVertical: makeLiteral('false'),
          gridHorizontal: makeLiteral('false'),
          outlineColor: makeSolidColor('#ffffff'),
        }
      }];
      objects.columnHeaders = [{
        properties: {
          wordWrap: makeLiteral('false'),
          alignment: makeLiteral("'Center'"),
        }
      }];
      objects.rowHeaders = [{
        properties: {
          wordWrap: makeLiteral('false'),
        }
      }];
      objects.columnFormatting = [{
        properties: {
          alignment: makeLiteral("'Center'"),
        }
      }];
      // Heatmap gradient using FillRule with linearGradient2 for conditional formatting
      // This creates a gradient from white (min) to purple (max)
      const heatmapFillRule = {
        linearGradient2: {
          min: { color: { expr: { Literal: { Value: "'#FFFFFF'" } } } },
          max: { color: { expr: { Literal: { Value: "'#342BC2'" } } } },
        }
      };
      objects.values = [{
        properties: {
          backColorSecondary: makeSolidColor('#FFFFFF'),
          backColor: { expr: { FillRule: heatmapFillRule } },
          fontColor: { expr: { FillRule: heatmapFillRule } },
        }
      }];
      return objects;
    }
  }

  // Title formatting (default)
  objects.title = [{
    properties: {
      show: makeLiteral('true'),
      text: makeLiteral(`'${(item.title || '').replace(/'/g, "''")}'`),
      fontColor: makeSolidColor('#252423'),
      fontSize: makeLiteral('12L'),
    }
  }];

  // Retail KPI cards: make sure category labels show for multi-row cards
  if (pbiType === 'multiRowCard') {
    objects.categoryLabels = [{
      properties: {
        show: makeLiteral('true'),
        fontSize: makeLiteral('10L'),
        fontColor: makeSolidColor('#605E5C'),
      }
    }];
  }

  // Slicer styling (best-effort dropdown)
  if (pbiType === 'slicer') {
    objects.slicer = [{
      properties: {
        slicerType: makeLiteral("'Dropdown'"),
      }
    }];
  }

  // Category axis formatting (for chart types that have axes)
  const axisTypes = ['bar', 'column', 'stackedBar', 'stackedColumn', 'line', 'area', 'waterfall', 'scatter', 'controversyBar'];
  if (axisTypes.includes(item.type)) {
    objects.categoryAxis = [{
      properties: {
        fontSize: makeLiteral('9L'),
        fontColor: makeSolidColor('#605E5C'),
      }
    }];
    objects.valueAxis = [{
      properties: {
        fontSize: makeLiteral('9L'),
        fontColor: makeSolidColor('#605E5C'),
        gridlineShow: makeLiteral('true'),
        gridlineColor: makeSolidColor('#F3F2F1'),
      }
    }];
  }

  // Legend formatting (for charts with legends)
  const legendTypes = ['pie', 'donut', 'stackedBar', 'stackedColumn', 'line', 'area'];
  if (legendTypes.includes(item.type)) {
    objects.legend = [{
      properties: {
        show: makeLiteral('true'),
        fontSize: makeLiteral('9L'),
        fontColor: makeSolidColor('#605E5C'),
      }
    }];
  }

  // Pie/donut: reduce clutter by hiding labels (legend only)
  if (item.type === 'pie' || item.type === 'donut') {
    objects.dataLabels = [{
      properties: {
        show: makeLiteral('false'),
      }
    }];
  }

  return objects;
};

const buildVisualJson = (item: DashboardItem, index: number, scenario: Scenario, measures: DAXMeasure[], themeColors?: string[]) => {
  const position = gridToPixels(item.layout);
  const queryState = buildQueryState(item, scenario, measures);

  // Extract sortDefinition if present (used by funnel, bar charts)
  const sortDefinition = queryState._sortDefinition;
  delete queryState._sortDefinition;

  // Use new cardVisual for Retail cards (supports reference labels for ΔPY/ΔPL variance)
  // Use kpi visual only for explicit 'kpi' type
  const isRetailCard = scenario === 'Retail' && item.type === 'card';
  const isRetailKpi = scenario === 'Retail' && item.type === 'kpi';
  const isEmailCombo = scenario === 'Retail' && item.type === 'combo' && item.id.startsWith('email-');
  const pbiType = isRetailCard
    ? 'cardVisual'
    : isRetailKpi
      ? 'kpi'
      : (isEmailCombo ? 'lineClusteredColumnComboChart' : getPBIVisualType(item.type));
  const primaryColor = (themeColors && themeColors.length > 0) ? themeColors[0] : '#118DFF';
  let visualContainerObjects: Record<string, any> | undefined;

  if (scenario === 'Retail') {
    // New cardVisual styling with accent bar effect via border
    if (pbiType === 'cardVisual' && item.type === 'card') {
      const colorIndex = item.props?.colorIndex ?? 0;
      const accentColor = (themeColors && themeColors.length > colorIndex) ? themeColors[colorIndex] : primaryColor;
      visualContainerObjects = {
        title: [{
          properties: {
            show: makeLiteral('false'), // Title is shown via calloutLabel
          }
        }],
        // Accent bar effect using left border (mimics web UI 4px colored bar)
        border: [{
          properties: {
            show: makeLiteral('true'),
            color: makeSolidColor(accentColor),
            radius: makeLiteral('2D'),
            width: makeLiteral('4D'),
            // Apply border only on left side
            topWidth: makeLiteral('0D'),
            rightWidth: makeLiteral('0D'),
            bottomWidth: makeLiteral('0D'),
            leftWidth: makeLiteral('4D'),
          }
        }],
        background: [{
          properties: {
            show: makeLiteral('true'),
            color: makeSolidColor(MOKKUP_BRAND_COLORS.background),
            transparency: makeLiteral('0D'),
          }
        }],
        visualHeader: [{
          properties: {
            show: makeLiteral('false'),
          }
        }],
      };
    } else if (pbiType === 'kpi') {
      visualContainerObjects = {
        title: [{
          properties: {
            show: makeLiteral('true'),
            text: makeLiteral(`'${(item.title || '').replace(/'/g, "''")}'`),
            fontFamily: makeLiteral("'''Segoe UI Semibold'', wf_segoe-ui_semibold, helvetica, arial, sans-serif'"),
            fontSize: makeLiteral('12D'),
            fontColor: makeSolidColor(MOKKUP_BRAND_COLORS.title),
            alignment: makeLiteral("'left'"),
            background: { solid: { color: makeLiteral("'None'") } },
          }
        }],
        padding: [{
          properties: {
            top: makeLiteral('5D'),
            bottom: makeLiteral('5D'),
            left: makeLiteral('5D'),
          }
        }],
        background: [{
          properties: { show: makeLiteral('false') }
        }],
      };
    } else if (pbiType === 'slicer') {
      visualContainerObjects = {
        padding: [{
          properties: {
            top: makeLiteral('0D'),
            bottom: makeLiteral('0D'),
            right: makeLiteral('0D'),
            left: makeLiteral('0D'),
          }
        }],
        background: [{
          properties: {
            color: makeSolidColor(MOKKUP_BRAND_COLORS.background),
          }
        }],
      };
    } else if (item.type === 'bar' || item.type === 'column' || item.type === 'line' || item.type === 'area' || item.type === 'combo' || item.type === 'stackedBar' || item.type === 'stackedColumn' || item.type === 'stackedArea') {
      // Charts: hidden header, visible tooltip, no border/background
      visualContainerObjects = {
        visualHeader: [{ properties: { show: makeLiteral('false') } }],
        visualTooltip: [{ properties: { show: makeLiteral('true') } }],
        border: [{ properties: { show: makeLiteral('false') } }],
        subTitle: [{ properties: { show: makeLiteral('false') } }],
        title: [{ properties: { show: makeLiteral('false') } }],
        background: [{ properties: { show: makeLiteral('false') } }],
      };
    } else if (item.type === 'funnel' || item.type === 'scatter' || item.type === 'matrix') {
      // Funnel, scatter, matrix: hidden title and background
      visualContainerObjects = {
        title: [{ properties: { show: makeLiteral('false') } }],
        background: [{ properties: { show: makeLiteral('false') } }],
      };
    }
  }

  // Build query object with optional sortDefinition
  const queryObject: Record<string, any> = { queryState };
  if (sortDefinition) {
    queryObject.sortDefinition = sortDefinition;
  }

  return {
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.5.0/schema.json',
    name: item.id,
    position: {
      x: position.x,
      y: position.y,
      z: index * 1000,
      width: position.width,
      height: position.height,
      tabOrder: index,
    },
    visual: {
      visualType: pbiType,
      query: queryObject,
      objects: buildVisualObjects(item, pbiType, scenario, themeColors),
      ...(visualContainerObjects ? { visualContainerObjects } : {}),
      drillFilterOtherVisuals: true,
    },
  };
};

const writeFile = (zip: JSZip, path: string, content: string | object) => {
  const payload = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  zip.file(path, payload);
};

const generateDocumentation = (schema: PBISchema, measures: DAXMeasure[], scenario: Scenario) => {
  let doc = `# Power BI Project (PBIP) - ${scenario} Dashboard\n\n`;
  doc += `This PBIP package was generated by Phantom and includes data-loaded tables and DAX measures.\n\n`;
  doc += `## Tables\n\n`;
  schema.tables.forEach((table) => {
    doc += `### ${table.name}\n`;
    table.columns.forEach((col) => {
      doc += `- ${col.name} (${col.dataType})\n`;
    });
    doc += '\n';
  });
  doc += '## Measures\n\n';
  measures.forEach((measure) => {
    doc += `- ${measure.name}\n`;
  });
  doc += '\n## Usage\n\n';
  doc += '1. Unzip the PBIP package.\n';
  doc += '2. Open the `.pbip` file in Power BI Desktop (Developer mode enabled).\n';
  doc += '3. Refresh if prompted; data is embedded in the semantic model.\n';
  return doc;
};

export async function createPBIPPackage(
  items: DashboardItem[],
  scenario: Scenario,
  data: ExportData,
  filename?: string,
  themeColors?: string[],
) {
  const schema = getSchemaForScenario(scenario);
  const exportItems = scenario === 'Retail'
    ? items.map((item) => {
        if (item.type === 'card') {
          return { ...item, props: { ...item.props, showVariance: true } };
        }
        return item;
      })
    : items;
  const measures = generateAllMeasures(exportItems, scenario);

  const projectName = `Phantom${scenario}`;
  const exportFilename = filename || `${projectName}_${new Date().toISOString().split('T')[0]}.pbip.zip`;

  const reportLogicalId = makeUuid();
  const modelLogicalId = makeUuid();

  const zip = new JSZip();

  // PBIP manifest
  writeFile(zip, `${projectName}.pbip`, PBIP_MANIFEST(`${projectName}.Report`));

  // Report artifact
  writeFile(zip, `${projectName}.Report/.platform`, REPORT_PLATFORM_TEMPLATE(projectName, reportLogicalId));
  zip.folder(`${projectName}.Report/.pbi`);
  writeFile(zip, `${projectName}.Report/definition.pbir`, PBIR_TEMPLATE(`../${projectName}.SemanticModel`));
  writeFile(zip, `${projectName}.Report/definition/report.json`, REPORT_JSON);
  writeFile(zip, `${projectName}.Report/definition/version.json`, REPORT_VERSION_JSON);
  writeFile(zip, `${projectName}.Report/definition/pages/pages.json`, REPORT_PAGES_JSON);
  const canvas = calculateOptimalCanvas(exportItems);
  writeFile(zip, `${projectName}.Report/definition/pages/page1/page.json`, makePageJson(`${scenario} Dashboard`, canvas.width, canvas.height));
  writeFile(zip, `${projectName}.Report/StaticResources/SharedResources/BaseThemes/CY25SU12.json`, buildBaseThemeJson(themeColors));

  // Visuals
  exportItems.forEach((item, index) => {
    const visualJson = buildVisualJson(item, index, scenario, measures, themeColors);
    writeFile(zip, `${projectName}.Report/definition/pages/page1/visuals/${item.id}/visual.json`, visualJson);
  });

  // Semantic model artifact
  writeFile(zip, `${projectName}.SemanticModel/.platform`, MODEL_PLATFORM_TEMPLATE(projectName, modelLogicalId));
  zip.folder(`${projectName}.SemanticModel/.pbi`);
  writeFile(zip, `${projectName}.SemanticModel/.pbi/editorSettings.json`, EDITOR_SETTINGS_JSON);
  writeFile(zip, `${projectName}.SemanticModel/definition.pbism`, PBISM_JSON);
  writeFile(zip, `${projectName}.SemanticModel/definition/database.tmdl`, DATABASE_TMDL);
  writeFile(zip, `${projectName}.SemanticModel/definition/cultures/en-US.tmdl`, CULTURE_TMDL);

  const tableRows = buildScenarioTables(scenario, data, schema);
  const factTable = getFactTableForScenario(scenario);

  schema.tables.forEach((table) => {
    const tableMeasures = table.name === factTable ? measures : [];
    const tmdl = buildTableTMDL(table.name, table.columns, tableRows[table.name] || [], tableMeasures);
    writeFile(zip, `${projectName}.SemanticModel/definition/tables/${table.name}.tmdl`, tmdl);
  });

  writeFile(zip, `${projectName}.SemanticModel/definition/model.tmdl`, buildModelTMDL(schema));
  writeFile(zip, `${projectName}.SemanticModel/diagramLayout.json`, DIAGRAM_LAYOUT_JSON);

  // Documentation
  const documentation = generateDocumentation(schema, measures, scenario);
  writeFile(zip, `${projectName}_Guide.md`, documentation);

  const blob = await zip.generateAsync({ type: 'blob' });

  return { blob, documentation, filename: exportFilename };
}

export async function downloadPBIPPackage(
  items: DashboardItem[],
  scenario: Scenario,
  data: ExportData,
  filename?: string,
  themeColors?: string[],
) {
  const { blob, filename: exportFilename } = await createPBIPPackage(items, scenario, data, filename, themeColors);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
