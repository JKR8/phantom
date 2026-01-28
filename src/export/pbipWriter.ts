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
import { gridToPixels, getPBIVisualType } from './layoutConverter';
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

const BASE_THEME_JSON = `{
  "version": "5.50",
  "name": "CY25SU12",
  "textClasses": {
    "label": {
      "fontFace": "Segoe UI",
      "fontSize": 12
    },
    "title": {
      "fontFace": "Segoe UI Semibold",
      "fontSize": 16
    }
  },
  "dataColors": [
    "#118DFF",
    "#12239E",
    "#E66C37",
    "#6B007B",
    "#E044A7",
    "#744EC2",
    "#D9B300",
    "#D64550",
    "#197278",
    "#6F9FB0"
  ],
  "visualStyles": {}
}`;

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

const PBIP_MANIFEST = (reportPath: string, modelPath: string) => ({
  version: '1.0',
  artifacts: [
    { report: { path: reportPath } },
    { semanticModel: { path: modelPath } },
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
      Revenue: sale.revenue,
      RevenuePL: sale.revenuePL,
      RevenuePY: sale.revenuePY,
      Profit: sale.profit,
      ProfitPL: sale.profitPL,
      ProfitPY: sale.profitPY,
      Discount: sale.discount,
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
      Salary: emp.salary,
      Rating: emp.rating,
      Attrition: emp.attrition,
      Tenure: emp.tenure,
    }));
    tableRows.Department = Array.from(new Set(data.employees.map((e) => e.department))).map((dept) => ({
      Department: dept,
      DepartmentGroup: 'General',
    }));
  } else if (scenario === 'Logistics') {
    tableRows.Shipment = data.shipments.map((ship) => ({
      ShipmentID: ship.id,
      Origin: ship.origin,
      Destination: ship.destination,
      Carrier: ship.carrier,
      Cost: ship.cost,
      Weight: ship.weight,
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
      Mentions: post.mentions,
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
    lines.push('');
    lines.push(`\tmeasure '${measure.name}' = ${measure.expression.trim()}`);
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

const buildQueryProjection = (table: string, field: string, isMeasure: boolean) => {
  if (isMeasure) {
    return {
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
    };
  }
  return {
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
};

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

  const queryState: Record<string, any> = {};

  switch (item.type) {
    case 'bar':
    case 'column':
    case 'stackedBar':
    case 'stackedColumn':
    case 'line':
    case 'area': {
      const dimField = props.dimension || (item.type === 'line' || item.type === 'area' ? defaultTime : defaultCategory);
      const dim = resolveColumn(dimField);
      const metric = resolveMeasure(props.metric);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      if (metric) queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
      break;
    }
    case 'pie':
    case 'donut':
    case 'funnel':
    case 'treemap': {
      const dimField = props.dimension || defaultCategory;
      const dim = resolveColumn(dimField);
      const metric = resolveMeasure(props.metric);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      if (metric) queryState.Y = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
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
      if (metric) queryState.Values = { projections: [buildQueryProjection(metric.table, metric.measure, true)] };
      break;
    }
    case 'scatter': {
      const x = resolveMeasure(props.xMetric);
      const y = resolveMeasure(props.yMetric);
      const dim = resolveColumn(props.dimension);
      if (dim) queryState.Category = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      if (x) queryState.X = { projections: [buildQueryProjection(x.table, x.measure, true)] };
      if (y) queryState.Y = { projections: [buildQueryProjection(y.table, y.measure, true)] };
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
      if (row) queryState.Rows = { projections: [buildQueryProjection(row.table, row.column, false)] };
      if (col) queryState.Columns = { projections: [buildQueryProjection(col.table, col.column, false)] };
      if (val) queryState.Values = { projections: [buildQueryProjection(val.table, val.measure, true)] };
      break;
    }
    case 'slicer': {
      const dim = resolveColumn(props.dimension);
      if (dim) queryState.Values = { projections: [buildQueryProjection(dim.table, dim.column, false)] };
      break;
    }
  }

  return queryState;
};

const makeLiteral = (value: string) => ({ expr: { Literal: { Value: value } } });
const makeSolidColor = (color: string) => ({ solid: { color: makeLiteral(`'${color}'`) } });

const buildVisualObjects = (item: DashboardItem): Record<string, any> => {
  const objects: Record<string, any> = {};

  // Title formatting
  objects.title = [{
    properties: {
      show: makeLiteral('true'),
      text: makeLiteral(`'${(item.title || '').replace(/'/g, "''")}'`),
      fontColor: makeSolidColor('#252423'),
      fontSize: makeLiteral('12L'),
    }
  }];

  // Category axis formatting (for chart types that have axes)
  const axisTypes = ['bar', 'column', 'stackedBar', 'stackedColumn', 'line', 'area', 'waterfall', 'scatter'];
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

  return objects;
};

const buildVisualJson = (item: DashboardItem, index: number, scenario: Scenario, measures: DAXMeasure[]) => {
  const position = gridToPixels(item.layout);
  const queryState = buildQueryState(item, scenario, measures);

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
      visualType: getPBIVisualType(item.type),
      query: {
        queryState,
      },
      objects: buildVisualObjects(item),
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

export async function createPBIPPackage(items: DashboardItem[], scenario: Scenario, data: ExportData, filename?: string) {
  const schema = getSchemaForScenario(scenario);
  const measures = generateAllMeasures(items, scenario);

  const projectName = `Phantom${scenario}`;
  const exportFilename = filename || `${projectName}_${new Date().toISOString().split('T')[0]}.pbip.zip`;

  const reportLogicalId = makeUuid();
  const modelLogicalId = makeUuid();

  const zip = new JSZip();

  // PBIP manifest
  writeFile(zip, `${projectName}.pbip`, PBIP_MANIFEST(`${projectName}.Report`, `${projectName}.SemanticModel`));

  // Report artifact
  writeFile(zip, `${projectName}.Report/.platform`, REPORT_PLATFORM_TEMPLATE(projectName, reportLogicalId));
  zip.folder(`${projectName}.Report/.pbi`);
  writeFile(zip, `${projectName}.Report/definition.pbir`, PBIR_TEMPLATE(`../${projectName}.SemanticModel`));
  writeFile(zip, `${projectName}.Report/definition/report.json`, REPORT_JSON);
  writeFile(zip, `${projectName}.Report/definition/version.json`, REPORT_VERSION_JSON);
  writeFile(zip, `${projectName}.Report/definition/pages/pages.json`, REPORT_PAGES_JSON);
  writeFile(zip, `${projectName}.Report/definition/pages/page1/page.json`, makePageJson(`${scenario} Dashboard`, 1280, 720));
  writeFile(zip, `${projectName}.Report/StaticResources/SharedResources/BaseThemes/CY25SU12.json`, BASE_THEME_JSON);

  // Visuals
  items.forEach((item, index) => {
    const visualJson = buildVisualJson(item, index, scenario, measures);
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

export async function downloadPBIPPackage(items: DashboardItem[], scenario: Scenario, data: ExportData, filename?: string) {
  const { blob, filename: exportFilename } = await createPBIPPackage(items, scenario, data, filename);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
