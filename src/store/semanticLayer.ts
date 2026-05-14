export type SemanticRole = 
  | 'Time' 
  | 'Entity' 
  | 'Geography' 
  | 'Category' 
  | 'Measure' 
  | 'Identifier';

export interface SemanticField {
  name: string;
  role: SemanticRole;
  type: 'string' | 'number' | 'date';
}

export type ScenarioType = 'Retail' | 'SaaS' | 'HR' | 'Logistics' | 'Finance' | 'Portfolio' | 'Social';

export const ScenarioFields: Record<ScenarioType, SemanticField[]> = {
  Retail: [
    { name: 'date', role: 'Time', type: 'date' },
    { name: 'store_name', role: 'Entity', type: 'string' },
    { name: 'region', role: 'Geography', type: 'string' },
    { name: 'country', role: 'Geography', type: 'string' },
    { name: 'category', role: 'Category', type: 'string' },
    { name: 'product_name', role: 'Entity', type: 'string' },
    { name: 'price', role: 'Measure', type: 'number' },
    { name: 'revenue', role: 'Measure', type: 'number' },
    { name: 'revenuePL', role: 'Measure', type: 'number' },
    { name: 'revenuePY', role: 'Measure', type: 'number' },
    { name: 'profit', role: 'Measure', type: 'number' },
    { name: 'profitPL', role: 'Measure', type: 'number' },
    { name: 'profitPY', role: 'Measure', type: 'number' },
    { name: 'quantity', role: 'Measure', type: 'number' },
    { name: 'quantityPL', role: 'Measure', type: 'number' },
    { name: 'quantityPY', role: 'Measure', type: 'number' },
    { name: 'discount', role: 'Measure', type: 'number' },
    { name: 'discountPL', role: 'Measure', type: 'number' },
    { name: 'discountPY', role: 'Measure', type: 'number' },
  ],
  SaaS: [
    { name: 'date', role: 'Time', type: 'date' },
    { name: 'name', role: 'Entity', type: 'string' },
    { name: 'region', role: 'Geography', type: 'string' },
    { name: 'tier', role: 'Category', type: 'string' },
    { name: 'industry', role: 'Category', type: 'string' },
    { name: 'mrr', role: 'Measure', type: 'number' },
    { name: 'mrrPL', role: 'Measure', type: 'number' },
    { name: 'mrrPY', role: 'Measure', type: 'number' },
    { name: 'arr', role: 'Measure', type: 'number' },
    { name: 'churn', role: 'Measure', type: 'number' },
    { name: 'ltv', role: 'Measure', type: 'number' },
    { name: 'cac', role: 'Measure', type: 'number' },
  ],
  HR: [
    { name: 'hireDate', role: 'Time', type: 'date' },
    { name: 'name', role: 'Entity', type: 'string' },
    { name: 'office', role: 'Geography', type: 'string' },
    { name: 'department', role: 'Category', type: 'string' },
    { name: 'role', role: 'Category', type: 'string' },
    { name: 'salary', role: 'Measure', type: 'number' },
    { name: 'salaryPL', role: 'Measure', type: 'number' },
    { name: 'salaryPY', role: 'Measure', type: 'number' },
    { name: 'rating', role: 'Measure', type: 'number' },
    { name: 'ratingPL', role: 'Measure', type: 'number' },
    { name: 'ratingPY', role: 'Measure', type: 'number' },
    { name: 'tenure', role: 'Measure', type: 'number' },
    { name: 'attrition', role: 'Measure', type: 'number' },
  ],
  Logistics: [
    { name: 'date', role: 'Time', type: 'date' },
    { name: 'carrier', role: 'Entity', type: 'string' },
    { name: 'origin', role: 'Geography', type: 'string' },
    { name: 'destination', role: 'Geography', type: 'string' },
    { name: 'status', role: 'Category', type: 'string' },
    { name: 'cost', role: 'Measure', type: 'number' },
    { name: 'costPL', role: 'Measure', type: 'number' },
    { name: 'costPY', role: 'Measure', type: 'number' },
    { name: 'weight', role: 'Measure', type: 'number' },
    { name: 'weightPL', role: 'Measure', type: 'number' },
    { name: 'weightPY', role: 'Measure', type: 'number' },
    { name: 'onTime', role: 'Measure', type: 'number' },
  ],
  Finance: [
    { name: 'date', role: 'Time', type: 'date' },
    { name: 'account', role: 'Entity', type: 'string' },
    { name: 'region', role: 'Geography', type: 'string' },
    { name: 'businessUnit', role: 'Category', type: 'string' },
    { name: 'scenario', role: 'Category', type: 'string' },
    { name: 'amount', role: 'Measure', type: 'number' },
    { name: 'variance', role: 'Measure', type: 'number' },
  ],
  Portfolio: [
    { name: 'validFrom', role: 'Time', type: 'date' },
    { name: 'entityName', role: 'Entity', type: 'string' },
    { name: 'region', role: 'Geography', type: 'string' },
    { name: 'sector', role: 'Category', type: 'string' },
    { name: 'category', role: 'Category', type: 'string' },
    { name: 'group', role: 'Category', type: 'string' },
    { name: 'marketValue', role: 'Measure', type: 'number' },
    { name: 'score', role: 'Measure', type: 'number' },
    { name: 'previousScore', role: 'Measure', type: 'number' },
    { name: 'scoreChange', role: 'Measure', type: 'number' },
    { name: 'source', role: 'Entity', type: 'string' },
  ],
  Social: [
    { name: 'date', role: 'Time', type: 'date' },
    { name: 'user', role: 'Entity', type: 'string' },
    { name: 'location', role: 'Geography', type: 'string' },
    { name: 'platform', role: 'Category', type: 'string' },
    { name: 'sentiment', role: 'Category', type: 'string' },
    { name: 'engagements', role: 'Measure', type: 'number' },
    { name: 'engagementsPL', role: 'Measure', type: 'number' },
    { name: 'engagementsPY', role: 'Measure', type: 'number' },
    { name: 'mentions', role: 'Measure', type: 'number' },
    { name: 'mentionsPL', role: 'Measure', type: 'number' },
    { name: 'mentionsPY', role: 'Measure', type: 'number' },
    { name: 'sentimentScore', role: 'Measure', type: 'number' },
  ]
};

/** Ordered dimension lists per scenario (best first) — powers sorted dropdowns */
export const RecommendedDimensions: Record<ScenarioType, string[]> = {
  Retail: ['category', 'product_name', 'store_name', 'region', 'country', 'date'],
  SaaS: ['tier', 'industry', 'name', 'region', 'date'],
  HR: ['department', 'role', 'name', 'office', 'hireDate'],
  Logistics: ['status', 'carrier', 'origin', 'destination', 'date'],
  Finance: ['businessUnit', 'scenario', 'account', 'region', 'date'],
  Portfolio: ['sector', 'entityName', 'region', 'source', 'validFrom'],
  Social: ['platform', 'sentiment', 'user', 'location', 'date'],
};

/** Ordered measure lists per scenario (primary first) — powers sorted dropdowns */
export const RecommendedMeasures: Record<ScenarioType, string[]> = {
  Retail: ['revenue', 'revenuePL', 'revenuePY', 'profit', 'profitPL', 'profitPY', 'quantity', 'quantityPL', 'quantityPY', 'discount', 'price'],
  SaaS: ['mrr', 'mrrPL', 'mrrPY', 'arr', 'churn', 'ltv', 'cac'],
  HR: ['salary', 'salaryPL', 'salaryPY', 'rating', 'ratingPL', 'ratingPY', 'tenure', 'attrition'],
  Logistics: ['cost', 'costPL', 'costPY', 'weight', 'weightPL', 'weightPY', 'onTime'],
  Finance: ['amount', 'variance'],
  Portfolio: ['marketValue', 'score', 'previousScore', 'scoreChange'],
  Social: ['engagements', 'engagementsPL', 'engagementsPY', 'mentions', 'mentionsPL', 'mentionsPY', 'sentimentScore'],
};

const DimensionAliases: Record<ScenarioType, Record<string, string>> = {
  Retail: {
    store: 'store_name',
    store_name: 'store_name',
    region: 'region',
    country: 'country',
    category: 'category',
    product: 'product_name',
    product_name: 'product_name',
    date: 'date',
    month: 'date',
  },
  SaaS: {
    customer: 'name',
    name: 'name',
    region: 'region',
    tier: 'tier',
    industry: 'industry',
    date: 'date',
  },
  HR: {
    employee: 'name',
    name: 'name',
    office: 'office',
    department: 'department',
    role: 'role',
    hiredate: 'hireDate',
  },
  Logistics: {
    carrier: 'carrier',
    origin: 'origin',
    destination: 'destination',
    status: 'status',
    date: 'date',
  },
  Finance: {
    account: 'account',
    region: 'region',
    businessunit: 'businessUnit',
    scenario: 'scenario',
    date: 'date',
  },
  Portfolio: {
    entity: 'entityName',
    entityname: 'entityName',
    region: 'region',
    sector: 'sector',
    source: 'source',
    validfrom: 'validFrom',
    category: 'category',
    group: 'group',
  },
  Social: {
    user: 'user',
    location: 'location',
    platform: 'platform',
    sentiment: 'sentiment',
    date: 'date',
  },
};

export const normalizeDimensionName = (
  scenario: ScenarioType,
  dimension: string | undefined
): string | undefined => {
  if (!dimension) return dimension;

  const fields = ScenarioFields[scenario] || [];
  const exactField = fields.find((field) => field.name.toLowerCase() === dimension.toLowerCase());
  if (exactField) return exactField.name;

  return DimensionAliases[scenario]?.[dimension.toLowerCase()] || dimension;
};

export const isKnownDimension = (
  scenario: ScenarioType,
  dimension: string | undefined
): boolean => {
  const normalized = normalizeDimensionName(scenario, dimension);
  if (!normalized) return false;
  return (ScenarioFields[scenario] || []).some(
    (field) =>
      field.role !== 'Measure' &&
      field.role !== 'Identifier' &&
      field.name.toLowerCase() === normalized.toLowerCase()
  );
};

export const formatFieldLabel = (fieldName: string): string => {
  const labels: Record<string, string> = {
    store_name: 'Store',
    product_name: 'Product',
    businessUnit: 'Business Unit',
    entityName: 'Entity',
    validFrom: 'Valid From',
    hireDate: 'Hire Date',
    sentimentScore: 'Sentiment Score',
  };

  return labels[fieldName] || fieldName.replace(/_/g, ' ');
};

/** Data model types available for selection (limited to 3 core scenarios) */
export type DataModelType = 'Retail' | 'SaaS' | 'HR';

/** Data model schemas for UI display */
export interface DataModelSchema {
  name: string;
  description: string;
  tables: { name: string; fields: string[] }[];
  relationships: string[];
}

export const DataModelSchemas: Record<DataModelType, DataModelSchema> = {
  Retail: {
    name: 'Retail Sales',
    description: 'Store and product sales data with regional breakdown',
    tables: [
      { name: 'Sales', fields: ['Date', 'Revenue', 'Profit', 'Quantity'] },
      { name: 'Stores', fields: ['Store', 'Region'] },
      { name: 'Products', fields: ['Product', 'Category'] },
    ],
    relationships: ['Sales → Store', 'Sales → Product'],
  },
  SaaS: {
    name: 'SaaS Metrics',
    description: 'Subscription and customer metrics for software-as-a-service',
    tables: [
      { name: 'Subscriptions', fields: ['Date', 'MRR', 'ARR', 'Churn', 'LTV', 'CAC'] },
      { name: 'Customers', fields: ['Customer', 'Tier', 'Industry', 'Region'] },
    ],
    relationships: ['Subscriptions → Customer'],
  },
  HR: {
    name: 'HR Analytics',
    description: 'Employee workforce data with performance and attrition metrics',
    tables: [
      { name: 'Workforce', fields: ['Date', 'Salary', 'Rating', 'Tenure', 'Attrition'] },
      { name: 'Employees', fields: ['Employee', 'Role', 'Office'] },
      { name: 'Departments', fields: ['Department'] },
    ],
    relationships: ['Workforce → Employee', 'Workforce → Department'],
  },
};
