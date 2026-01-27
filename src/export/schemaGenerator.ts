/**
 * Schema Generator - Creates Power BI data model definitions per scenario
 * 
 * Each scenario maps to a star schema with:
 * - Dimension tables (lookup tables)
 * - Fact tables (transactional data)
 * - Relationships (foreign key links)
 */

import { Scenario } from '../types';

export interface PBIColumn {
  name: string;
  dataType: 'string' | 'int64' | 'double' | 'dateTime' | 'boolean';
  sourceColumn?: string;
  isHidden?: boolean;
  sortByColumn?: string;
  summarizeBy?: 'none' | 'sum' | 'count' | 'average' | 'min' | 'max';
}

export interface PBITable {
  name: string;
  columns: PBIColumn[];
  isHidden?: boolean;
  description?: string;
}

export interface PBIRelationship {
  name: string;
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  crossFilteringBehavior: 'oneDirection' | 'bothDirections';
  isActive: boolean;
}

export interface PBISchema {
  tables: PBITable[];
  relationships: PBIRelationship[];
  description: string;
}

/**
 * Retail Schema: Store (dim) → Sale (fact) ← Product (dim)
 */
const retailSchema: PBISchema = {
  description: 'Retail Sales Star Schema - Store and Product dimensions with Sales fact table',
  tables: [
    {
      name: 'Store',
      description: 'Store dimension - physical retail locations',
      columns: [
        { name: 'StoreID', dataType: 'string', summarizeBy: 'none' },
        { name: 'StoreName', dataType: 'string', summarizeBy: 'none' },
        { name: 'Region', dataType: 'string', summarizeBy: 'none' },
        { name: 'Country', dataType: 'string', summarizeBy: 'none' },
      ]
    },
    {
      name: 'Product',
      description: 'Product dimension - product catalog',
      columns: [
        { name: 'ProductID', dataType: 'string', summarizeBy: 'none' },
        { name: 'ProductName', dataType: 'string', summarizeBy: 'none' },
        { name: 'Category', dataType: 'string', summarizeBy: 'none' },
        { name: 'Price', dataType: 'double', summarizeBy: 'none' },
      ]
    },
    {
      name: 'Sales',
      description: 'Sales fact table - transactional sales data with actuals, plan, and prior year',
      columns: [
        { name: 'SaleID', dataType: 'string', summarizeBy: 'none', isHidden: true },
        { name: 'StoreID', dataType: 'string', summarizeBy: 'none', isHidden: true },
        { name: 'ProductID', dataType: 'string', summarizeBy: 'none', isHidden: true },
        { name: 'Date', dataType: 'dateTime', summarizeBy: 'none' },
        { name: 'Quantity', dataType: 'int64', summarizeBy: 'sum' },
        { name: 'Revenue', dataType: 'double', summarizeBy: 'sum' },
        { name: 'RevenuePL', dataType: 'double', summarizeBy: 'sum' },
        { name: 'RevenuePY', dataType: 'double', summarizeBy: 'sum' },
        { name: 'Profit', dataType: 'double', summarizeBy: 'sum' },
        { name: 'ProfitPL', dataType: 'double', summarizeBy: 'sum' },
        { name: 'ProfitPY', dataType: 'double', summarizeBy: 'sum' },
      ]
    },
    {
      name: 'DateTable',
      description: 'Date dimension - auto-generated calendar table for time intelligence',
      columns: [
        { name: 'Date', dataType: 'dateTime', summarizeBy: 'none' },
        { name: 'Year', dataType: 'int64', summarizeBy: 'none' },
        { name: 'Quarter', dataType: 'string', summarizeBy: 'none' },
        { name: 'Month', dataType: 'string', summarizeBy: 'none' },
        { name: 'MonthNum', dataType: 'int64', summarizeBy: 'none', isHidden: true },
        { name: 'WeekNum', dataType: 'int64', summarizeBy: 'none' },
        { name: 'DayOfWeek', dataType: 'string', summarizeBy: 'none' },
      ]
    }
  ],
  relationships: [
    {
      name: 'Sales_Store',
      fromTable: 'Sales',
      fromColumn: 'StoreID',
      toTable: 'Store',
      toColumn: 'StoreID',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    },
    {
      name: 'Sales_Product',
      fromTable: 'Sales',
      fromColumn: 'ProductID',
      toTable: 'Product',
      toColumn: 'ProductID',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    },
    {
      name: 'Sales_Date',
      fromTable: 'Sales',
      fromColumn: 'Date',
      toTable: 'DateTable',
      toColumn: 'Date',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    }
  ]
};

/**
 * SaaS Schema: Customer (dim) → Subscription (fact)
 */
const saasSchema: PBISchema = {
  description: 'SaaS Subscription Star Schema - Customer dimension with Subscription fact table',
  tables: [
    {
      name: 'Customer',
      description: 'Customer dimension - account information',
      columns: [
        { name: 'CustomerID', dataType: 'string', summarizeBy: 'none' },
        { name: 'CustomerName', dataType: 'string', summarizeBy: 'none' },
        { name: 'Tier', dataType: 'string', summarizeBy: 'none' },
        { name: 'Region', dataType: 'string', summarizeBy: 'none' },
      ]
    },
    {
      name: 'Subscription',
      description: 'Subscription fact table - MRR, churn, and LTV metrics with plan/prior year',
      columns: [
        { name: 'SubscriptionID', dataType: 'string', summarizeBy: 'none', isHidden: true },
        { name: 'CustomerID', dataType: 'string', summarizeBy: 'none', isHidden: true },
        { name: 'Date', dataType: 'dateTime', summarizeBy: 'none' },
        { name: 'MRR', dataType: 'double', summarizeBy: 'sum' },
        { name: 'MRRPL', dataType: 'double', summarizeBy: 'sum' },
        { name: 'MRRPY', dataType: 'double', summarizeBy: 'sum' },
        { name: 'Churn', dataType: 'int64', summarizeBy: 'sum' },
        { name: 'LTV', dataType: 'double', summarizeBy: 'average' },
      ]
    },
    {
      name: 'DateTable',
      description: 'Date dimension - auto-generated calendar table',
      columns: [
        { name: 'Date', dataType: 'dateTime', summarizeBy: 'none' },
        { name: 'Year', dataType: 'int64', summarizeBy: 'none' },
        { name: 'Quarter', dataType: 'string', summarizeBy: 'none' },
        { name: 'Month', dataType: 'string', summarizeBy: 'none' },
        { name: 'MonthNum', dataType: 'int64', summarizeBy: 'none', isHidden: true },
      ]
    }
  ],
  relationships: [
    {
      name: 'Subscription_Customer',
      fromTable: 'Subscription',
      fromColumn: 'CustomerID',
      toTable: 'Customer',
      toColumn: 'CustomerID',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    },
    {
      name: 'Subscription_Date',
      fromTable: 'Subscription',
      fromColumn: 'Date',
      toTable: 'DateTable',
      toColumn: 'Date',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    }
  ]
};

/**
 * HR Schema: Employee (fact/dim - flat structure)
 */
const hrSchema: PBISchema = {
  description: 'HR Analytics Schema - Employee table with department analysis',
  tables: [
    {
      name: 'Employee',
      description: 'Employee table - headcount, salary, rating, and attrition data',
      columns: [
        { name: 'EmployeeID', dataType: 'string', summarizeBy: 'none' },
        { name: 'EmployeeName', dataType: 'string', summarizeBy: 'none' },
        { name: 'Department', dataType: 'string', summarizeBy: 'none' },
        { name: 'Role', dataType: 'string', summarizeBy: 'none' },
        { name: 'Salary', dataType: 'double', summarizeBy: 'sum' },
        { name: 'Rating', dataType: 'int64', summarizeBy: 'average' },
        { name: 'Attrition', dataType: 'int64', summarizeBy: 'sum' },
        { name: 'Tenure', dataType: 'int64', summarizeBy: 'average' },
      ]
    },
    {
      name: 'Department',
      description: 'Department dimension - for hierarchy and grouping',
      columns: [
        { name: 'Department', dataType: 'string', summarizeBy: 'none' },
        { name: 'DepartmentGroup', dataType: 'string', summarizeBy: 'none' },
      ]
    }
  ],
  relationships: [
    {
      name: 'Employee_Department',
      fromTable: 'Employee',
      fromColumn: 'Department',
      toTable: 'Department',
      toColumn: 'Department',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    }
  ]
};

/**
 * Logistics Schema: Shipment (fact - flat)
 */
const logisticsSchema: PBISchema = {
  description: 'Logistics Supply Chain Schema - Shipment tracking and delivery metrics',
  tables: [
    {
      name: 'Shipment',
      description: 'Shipment fact table - cost, weight, status, and on-time delivery',
      columns: [
        { name: 'ShipmentID', dataType: 'string', summarizeBy: 'none' },
        { name: 'Origin', dataType: 'string', summarizeBy: 'none' },
        { name: 'Destination', dataType: 'string', summarizeBy: 'none' },
        { name: 'Carrier', dataType: 'string', summarizeBy: 'none' },
        { name: 'Cost', dataType: 'double', summarizeBy: 'sum' },
        { name: 'Weight', dataType: 'double', summarizeBy: 'sum' },
        { name: 'Status', dataType: 'string', summarizeBy: 'none' },
        { name: 'Date', dataType: 'dateTime', summarizeBy: 'none' },
        { name: 'OnTime', dataType: 'int64', summarizeBy: 'sum' },
      ]
    },
    {
      name: 'Carrier',
      description: 'Carrier dimension - shipping provider details',
      columns: [
        { name: 'Carrier', dataType: 'string', summarizeBy: 'none' },
        { name: 'CarrierType', dataType: 'string', summarizeBy: 'none' },
      ]
    },
    {
      name: 'Location',
      description: 'Location dimension - origin/destination geography',
      columns: [
        { name: 'City', dataType: 'string', summarizeBy: 'none' },
        { name: 'Country', dataType: 'string', summarizeBy: 'none' },
        { name: 'Region', dataType: 'string', summarizeBy: 'none' },
      ]
    },
    {
      name: 'DateTable',
      description: 'Date dimension',
      columns: [
        { name: 'Date', dataType: 'dateTime', summarizeBy: 'none' },
        { name: 'Year', dataType: 'int64', summarizeBy: 'none' },
        { name: 'Month', dataType: 'string', summarizeBy: 'none' },
      ]
    }
  ],
  relationships: [
    {
      name: 'Shipment_Carrier',
      fromTable: 'Shipment',
      fromColumn: 'Carrier',
      toTable: 'Carrier',
      toColumn: 'Carrier',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    },
    {
      name: 'Shipment_Date',
      fromTable: 'Shipment',
      fromColumn: 'Date',
      toTable: 'DateTable',
      toColumn: 'Date',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    }
  ]
};

/**
 * Portfolio Schema: PortfolioEntity (dim) → ControversyScore (fact)
 */
const portfolioSchema: PBISchema = {
  description: 'Portfolio Monitoring Schema - ESG controversy scores and entity tracking',
  tables: [
    {
      name: 'PortfolioEntity',
      description: 'Entity dimension - companies/investments in the portfolio',
      columns: [
        { name: 'EntityID', dataType: 'string', summarizeBy: 'none' },
        { name: 'EntityName', dataType: 'string', summarizeBy: 'none' },
        { name: 'Sector', dataType: 'string', summarizeBy: 'none' },
        { name: 'Region', dataType: 'string', summarizeBy: 'none' },
        { name: 'MarketValue', dataType: 'double', summarizeBy: 'sum' },
        { name: 'SourceRegion', dataType: 'string', summarizeBy: 'none' },
        { name: 'Source', dataType: 'string', summarizeBy: 'none' },
        { name: 'AccountReportName', dataType: 'string', summarizeBy: 'none' },
        { name: 'AccountCode', dataType: 'string', summarizeBy: 'none' },
      ]
    },
    {
      name: 'ControversyScore',
      description: 'Controversy score fact table - ESG ratings and changes',
      columns: [
        { name: 'ScoreID', dataType: 'string', summarizeBy: 'none', isHidden: true },
        { name: 'EntityID', dataType: 'string', summarizeBy: 'none', isHidden: true },
        { name: 'EntityName', dataType: 'string', summarizeBy: 'none' },
        { name: 'Category', dataType: 'string', summarizeBy: 'none' },
        { name: 'Score', dataType: 'int64', summarizeBy: 'average' },
        { name: 'PreviousScore', dataType: 'int64', summarizeBy: 'average' },
        { name: 'ScoreChange', dataType: 'int64', summarizeBy: 'sum' },
        { name: 'ValidFrom', dataType: 'dateTime', summarizeBy: 'none' },
        { name: 'MarketValue', dataType: 'double', summarizeBy: 'sum' },
        { name: 'Justification', dataType: 'string', summarizeBy: 'none' },
        { name: 'Source', dataType: 'string', summarizeBy: 'none' },
        { name: 'Region', dataType: 'string', summarizeBy: 'none' },
        { name: 'Group', dataType: 'string', summarizeBy: 'none' },
      ]
    },
    {
      name: 'Category',
      description: 'Category dimension - controversy category classification',
      columns: [
        { name: 'Category', dataType: 'string', summarizeBy: 'none' },
        { name: 'CategoryType', dataType: 'string', summarizeBy: 'none' },
      ]
    },
    {
      name: 'DateTable',
      description: 'Date dimension',
      columns: [
        { name: 'Date', dataType: 'dateTime', summarizeBy: 'none' },
        { name: 'Year', dataType: 'int64', summarizeBy: 'none' },
        { name: 'Month', dataType: 'string', summarizeBy: 'none' },
      ]
    }
  ],
  relationships: [
    {
      name: 'ControversyScore_Entity',
      fromTable: 'ControversyScore',
      fromColumn: 'EntityID',
      toTable: 'PortfolioEntity',
      toColumn: 'EntityID',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    },
    {
      name: 'ControversyScore_Category',
      fromTable: 'ControversyScore',
      fromColumn: 'Category',
      toTable: 'Category',
      toColumn: 'Category',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    },
    {
      name: 'ControversyScore_Date',
      fromTable: 'ControversyScore',
      fromColumn: 'ValidFrom',
      toTable: 'DateTable',
      toColumn: 'Date',
      crossFilteringBehavior: 'oneDirection',
      isActive: true
    }
  ]
};

/**
 * Get the schema for a given scenario
 */
export function getSchemaForScenario(scenario: Scenario): PBISchema {
  switch (scenario) {
    case 'Retail':
      return retailSchema;
    case 'SaaS':
      return saasSchema;
    case 'HR':
      return hrSchema;
    case 'Logistics':
      return logisticsSchema;
    case 'Portfolio':
      return portfolioSchema;
    case 'Social':
      // Social uses Retail schema as base (per templates.ts)
      return retailSchema;
    default:
      return retailSchema;
  }
}

/**
 * Get the fact table name for a scenario (for measure generation)
 */
export function getFactTableForScenario(scenario: Scenario): string {
  switch (scenario) {
    case 'Retail':
    case 'Social':
      return 'Sales';
    case 'SaaS':
      return 'Subscription';
    case 'HR':
      return 'Employee';
    case 'Logistics':
      return 'Shipment';
    case 'Portfolio':
      return 'ControversyScore';
    default:
      return 'Sales';
  }
}

/**
 * Map Phantom field names to PBI column names
 */
export function mapFieldToPBIColumn(scenario: Scenario, field: string): { table: string; column: string } {
  const factTable = getFactTableForScenario(scenario);
  
  // Dimension mappings
  const dimensionMappings: Record<string, { table: string; column: string }> = {
    // Retail
    'Region': { table: 'Store', column: 'Region' },
    'Store': { table: 'Store', column: 'StoreName' },
    'Category': { table: 'Product', column: 'Category' },
    'Product': { table: 'Product', column: 'ProductName' },
    // SaaS
    'Tier': { table: 'Customer', column: 'Tier' },
    'Customer': { table: 'Customer', column: 'CustomerName' },
    // HR
    'Department': { table: 'Employee', column: 'Department' },
    'Role': { table: 'Employee', column: 'Role' },
    // Logistics
    'Carrier': { table: 'Shipment', column: 'Carrier' },
    'Origin': { table: 'Shipment', column: 'Origin' },
    'Destination': { table: 'Shipment', column: 'Destination' },
    'Status': { table: 'Shipment', column: 'Status' },
    // Portfolio
    'Sector': { table: 'PortfolioEntity', column: 'Sector' },
    'Group': { table: 'ControversyScore', column: 'Group' },
    'EntityName': { table: 'ControversyScore', column: 'EntityName' },
    // Date
    'Month': { table: 'DateTable', column: 'Month' },
    'Year': { table: 'DateTable', column: 'Year' },
    'Quarter': { table: 'DateTable', column: 'Quarter' },
  };

  if (dimensionMappings[field]) {
    return dimensionMappings[field];
  }

  // Metric mappings - capitalize first letter for PBI convention
  const capitalizedField = field.charAt(0).toUpperCase() + field.slice(1);
  return { table: factTable, column: capitalizedField };
}
