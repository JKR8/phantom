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
    { name: 'Date', role: 'Time', type: 'date' },
    { name: 'Store', role: 'Entity', type: 'string' },
    { name: 'Region', role: 'Geography', type: 'string' },
    { name: 'Category', role: 'Category', type: 'string' },
    { name: 'Product', role: 'Category', type: 'string' },
    { name: 'Revenue', role: 'Measure', type: 'number' },
    { name: 'Profit', role: 'Measure', type: 'number' },
    { name: 'Quantity', role: 'Measure', type: 'number' },
    { name: 'Discount', role: 'Measure', type: 'number' },
  ],
  SaaS: [
    { name: 'Date', role: 'Time', type: 'date' },
    { name: 'Customer', role: 'Entity', type: 'string' },
    { name: 'Region', role: 'Geography', type: 'string' },
    { name: 'Tier', role: 'Category', type: 'string' },
    { name: 'Industry', role: 'Category', type: 'string' },
    { name: 'MRR', role: 'Measure', type: 'number' },
    { name: 'ARR', role: 'Measure', type: 'number' },
    { name: 'Churn', role: 'Measure', type: 'number' },
    { name: 'LTV', role: 'Measure', type: 'number' },
    { name: 'CAC', role: 'Measure', type: 'number' },
  ],
  HR: [
    { name: 'Date', role: 'Time', type: 'date' },
    { name: 'Employee', role: 'Entity', type: 'string' },
    { name: 'Office', role: 'Geography', type: 'string' },
    { name: 'Department', role: 'Category', type: 'string' },
    { name: 'Role', role: 'Category', type: 'string' },
    { name: 'Salary', role: 'Measure', type: 'number' },
    { name: 'Rating', role: 'Measure', type: 'number' },
    { name: 'Tenure', role: 'Measure', type: 'number' },
    { name: 'Attrition', role: 'Measure', type: 'number' }, // 1 or 0
  ],
  Logistics: [
    { name: 'Date', role: 'Time', type: 'date' },
    { name: 'Carrier', role: 'Entity', type: 'string' },
    { name: 'Origin', role: 'Geography', type: 'string' },
    { name: 'Destination', role: 'Geography', type: 'string' },
    { name: 'Status', role: 'Category', type: 'string' },
    { name: 'Cost', role: 'Measure', type: 'number' },
    { name: 'Weight', role: 'Measure', type: 'number' },
    { name: 'OnTime', role: 'Measure', type: 'number' }, // 1 or 0
  ],
  Finance: [
    { name: 'Date', role: 'Time', type: 'date' },
    { name: 'Account', role: 'Entity', type: 'string' },
    { name: 'Region', role: 'Geography', type: 'string' },
    { name: 'BusinessUnit', role: 'Category', type: 'string' },
    { name: 'Scenario', role: 'Category', type: 'string' }, // Actual, Budget, Forecast
    { name: 'Amount', role: 'Measure', type: 'number' },
    { name: 'Variance', role: 'Measure', type: 'number' },
  ],
  Portfolio: [
    { name: 'Date', role: 'Time', type: 'date' },
    { name: 'Entity', role: 'Entity', type: 'string' },
    { name: 'Region', role: 'Geography', type: 'string' },
    { name: 'Sector', role: 'Category', type: 'string' },
    { name: 'MarketValue', role: 'Measure', type: 'number' },
    { name: 'ControversyScore', role: 'Measure', type: 'number' },
    { name: 'Score', role: 'Measure', type: 'number' },
  ],
  Social: [
    { name: 'Date', role: 'Time', type: 'date' },
    { name: 'User', role: 'Entity', type: 'string' },
    { name: 'Location', role: 'Geography', type: 'string' },
    { name: 'Platform', role: 'Category', type: 'string' },
    { name: 'Sentiment', role: 'Category', type: 'string' },
    { name: 'Engagements', role: 'Measure', type: 'number' },
    { name: 'Mentions', role: 'Measure', type: 'number' },
    { name: 'SentimentScore', role: 'Measure', type: 'number' },
  ]
};

/** Ordered dimension lists per scenario (best first) — powers sorted dropdowns */
export const RecommendedDimensions: Record<ScenarioType, string[]> = {
  Retail: ['Category', 'Product', 'Store', 'Region', 'Date'],
  SaaS: ['Tier', 'Industry', 'Customer', 'Region', 'Date'],
  HR: ['Department', 'Role', 'Employee', 'Office', 'Date'],
  Logistics: ['Status', 'Carrier', 'Origin', 'Destination', 'Date'],
  Finance: ['BusinessUnit', 'Scenario', 'Account', 'Region', 'Date'],
  Portfolio: ['Sector', 'Entity', 'Region', 'Date'],
  Social: ['Platform', 'Sentiment', 'User', 'Location', 'Date'],
};

/** Ordered measure lists per scenario (primary first) — powers sorted dropdowns */
export const RecommendedMeasures: Record<ScenarioType, string[]> = {
  Retail: ['Revenue', 'RevenuePL', 'RevenuePY', 'Profit', 'ProfitPL', 'ProfitPY', 'Quantity', 'Discount'],
  SaaS: ['MRR', 'MRRPL', 'MRRPY', 'ARR', 'Churn', 'LTV', 'CAC'],
  HR: ['Salary', 'SalaryPL', 'SalaryPY', 'Rating', 'RatingPL', 'RatingPY', 'Tenure', 'Attrition'],
  Logistics: ['Cost', 'CostPL', 'CostPY', 'Weight', 'WeightPL', 'WeightPY', 'OnTime'],
  Finance: ['Amount', 'Variance'],
  Portfolio: ['MarketValue', 'ControversyScore', 'Score'],
  Social: ['Engagements', 'EngagementsPL', 'EngagementsPY', 'Mentions', 'MentionsPL', 'MentionsPY', 'SentimentScore'],
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
