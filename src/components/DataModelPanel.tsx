import React from 'react';
import { makeStyles, shorthands } from '@fluentui/react-components';
import {
  NumberSymbolRegular,
  TextFieldRegular,
  CalendarRegular,
  KeyRegular
} from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { ScenarioType } from '../store/semanticLayer';

// Star schema definitions for each scenario
interface TableDef {
  name: string;
  type: 'fact' | 'dimension';
  fields: { name: string; type: 'key' | 'measure' | 'attribute' | 'date' }[];
}

interface StarSchema {
  fact: TableDef;
  dimensions: TableDef[];
}

const StarSchemas: Record<ScenarioType, StarSchema> = {
  Retail: {
    fact: {
      name: 'Sales',
      type: 'fact',
      fields: [
        { name: 'DateKey', type: 'key' },
        { name: 'StoreKey', type: 'key' },
        { name: 'ProductKey', type: 'key' },
        { name: 'Revenue', type: 'measure' },
        { name: 'Profit', type: 'measure' },
        { name: 'Quantity', type: 'measure' },
        { name: 'Discount', type: 'measure' },
      ],
    },
    dimensions: [
      { name: 'Date', type: 'dimension', fields: [{ name: 'DateKey', type: 'key' }, { name: 'Date', type: 'date' }, { name: 'Month', type: 'attribute' }, { name: 'Quarter', type: 'attribute' }, { name: 'Year', type: 'attribute' }] },
      { name: 'Store', type: 'dimension', fields: [{ name: 'StoreKey', type: 'key' }, { name: 'Store', type: 'attribute' }, { name: 'Region', type: 'attribute' }] },
      { name: 'Product', type: 'dimension', fields: [{ name: 'ProductKey', type: 'key' }, { name: 'Product', type: 'attribute' }, { name: 'Category', type: 'attribute' }] },
    ],
  },
  SaaS: {
    fact: {
      name: 'Subscriptions',
      type: 'fact',
      fields: [
        { name: 'DateKey', type: 'key' },
        { name: 'CustomerKey', type: 'key' },
        { name: 'MRR', type: 'measure' },
        { name: 'ARR', type: 'measure' },
        { name: 'Churn', type: 'measure' },
        { name: 'LTV', type: 'measure' },
        { name: 'CAC', type: 'measure' },
      ],
    },
    dimensions: [
      { name: 'Date', type: 'dimension', fields: [{ name: 'DateKey', type: 'key' }, { name: 'Date', type: 'date' }, { name: 'Month', type: 'attribute' }, { name: 'Year', type: 'attribute' }] },
      { name: 'Customer', type: 'dimension', fields: [{ name: 'CustomerKey', type: 'key' }, { name: 'Customer', type: 'attribute' }, { name: 'Tier', type: 'attribute' }, { name: 'Industry', type: 'attribute' }, { name: 'Region', type: 'attribute' }] },
    ],
  },
  HR: {
    fact: {
      name: 'Workforce',
      type: 'fact',
      fields: [
        { name: 'DateKey', type: 'key' },
        { name: 'EmployeeKey', type: 'key' },
        { name: 'DeptKey', type: 'key' },
        { name: 'Salary', type: 'measure' },
        { name: 'Rating', type: 'measure' },
        { name: 'Tenure', type: 'measure' },
        { name: 'Attrition', type: 'measure' },
      ],
    },
    dimensions: [
      { name: 'Date', type: 'dimension', fields: [{ name: 'DateKey', type: 'key' }, { name: 'Date', type: 'date' }, { name: 'Month', type: 'attribute' }, { name: 'Year', type: 'attribute' }] },
      { name: 'Employee', type: 'dimension', fields: [{ name: 'EmployeeKey', type: 'key' }, { name: 'Employee', type: 'attribute' }, { name: 'Role', type: 'attribute' }, { name: 'Office', type: 'attribute' }] },
      { name: 'Department', type: 'dimension', fields: [{ name: 'DeptKey', type: 'key' }, { name: 'Department', type: 'attribute' }] },
    ],
  },
  Logistics: {
    fact: {
      name: 'Shipments',
      type: 'fact',
      fields: [
        { name: 'DateKey', type: 'key' },
        { name: 'CarrierKey', type: 'key' },
        { name: 'RouteKey', type: 'key' },
        { name: 'Cost', type: 'measure' },
        { name: 'Weight', type: 'measure' },
        { name: 'OnTime', type: 'measure' },
      ],
    },
    dimensions: [
      { name: 'Date', type: 'dimension', fields: [{ name: 'DateKey', type: 'key' }, { name: 'Date', type: 'date' }, { name: 'Month', type: 'attribute' }, { name: 'Year', type: 'attribute' }] },
      { name: 'Carrier', type: 'dimension', fields: [{ name: 'CarrierKey', type: 'key' }, { name: 'Carrier', type: 'attribute' }, { name: 'Status', type: 'attribute' }] },
      { name: 'Route', type: 'dimension', fields: [{ name: 'RouteKey', type: 'key' }, { name: 'Origin', type: 'attribute' }, { name: 'Destination', type: 'attribute' }] },
    ],
  },
  Finance: {
    fact: {
      name: 'Actuals',
      type: 'fact',
      fields: [
        { name: 'DateKey', type: 'key' },
        { name: 'AccountKey', type: 'key' },
        { name: 'Amount', type: 'measure' },
        { name: 'Variance', type: 'measure' },
      ],
    },
    dimensions: [
      { name: 'Date', type: 'dimension', fields: [{ name: 'DateKey', type: 'key' }, { name: 'Date', type: 'date' }, { name: 'Month', type: 'attribute' }, { name: 'FiscalYear', type: 'attribute' }] },
      { name: 'Account', type: 'dimension', fields: [{ name: 'AccountKey', type: 'key' }, { name: 'Account', type: 'attribute' }, { name: 'BusinessUnit', type: 'attribute' }, { name: 'Region', type: 'attribute' }] },
      { name: 'Scenario', type: 'dimension', fields: [{ name: 'ScenarioKey', type: 'key' }, { name: 'Scenario', type: 'attribute' }] },
    ],
  },
  Portfolio: {
    fact: {
      name: 'Holdings',
      type: 'fact',
      fields: [
        { name: 'DateKey', type: 'key' },
        { name: 'EntityKey', type: 'key' },
        { name: 'MarketValue', type: 'measure' },
        { name: 'ControversyScore', type: 'measure' },
        { name: 'Score', type: 'measure' },
      ],
    },
    dimensions: [
      { name: 'Date', type: 'dimension', fields: [{ name: 'DateKey', type: 'key' }, { name: 'Date', type: 'date' }, { name: 'Month', type: 'attribute' }, { name: 'Year', type: 'attribute' }] },
      { name: 'Entity', type: 'dimension', fields: [{ name: 'EntityKey', type: 'key' }, { name: 'Entity', type: 'attribute' }, { name: 'Sector', type: 'attribute' }, { name: 'Region', type: 'attribute' }] },
    ],
  },
  Social: {
    fact: {
      name: 'Engagement',
      type: 'fact',
      fields: [
        { name: 'DateKey', type: 'key' },
        { name: 'UserKey', type: 'key' },
        { name: 'PlatformKey', type: 'key' },
        { name: 'Engagements', type: 'measure' },
        { name: 'Mentions', type: 'measure' },
        { name: 'SentimentScore', type: 'measure' },
      ],
    },
    dimensions: [
      { name: 'Date', type: 'dimension', fields: [{ name: 'DateKey', type: 'key' }, { name: 'Date', type: 'date' }, { name: 'Month', type: 'attribute' }, { name: 'Year', type: 'attribute' }] },
      { name: 'User', type: 'dimension', fields: [{ name: 'UserKey', type: 'key' }, { name: 'User', type: 'attribute' }, { name: 'Location', type: 'attribute' }] },
      { name: 'Platform', type: 'dimension', fields: [{ name: 'PlatformKey', type: 'key' }, { name: 'Platform', type: 'attribute' }, { name: 'Sentiment', type: 'attribute' }] },
    ],
  },
};

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F3F2F1',
    ...shorthands.borderRadius('8px'),
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    ...shorthands.padding('16px', '24px'),
    borderBottom: '1px solid #E1DFDD',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.borderRadius('8px', '8px', '0', '0'),
  },
  headerTitle: {
    fontWeight: '600',
    fontSize: '18px',
    color: '#323130',
  },
  scenarioBadge: {
    fontSize: '12px',
    color: '#fff',
    backgroundColor: '#0078D4',
    ...shorthands.padding('4px', '12px'),
    ...shorthands.borderRadius('12px'),
    fontWeight: '500',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    ...shorthands.padding('40px'),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schemaContainer: {
    position: 'relative',
    minWidth: '800px',
    minHeight: '500px',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  tableCard: {
    position: 'absolute',
    backgroundColor: '#fff',
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.borderRadius('6px'),
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    minWidth: '160px',
    zIndex: 1,
  },
  factTable: {
    ...shorthands.border('2px', 'solid', '#0078D4'),
    boxShadow: '0 4px 12px rgba(0,120,212,0.2)',
  },
  dimensionTable: {
    ...shorthands.border('1px', 'solid', '#8A8886'),
  },
  tableHeader: {
    ...shorthands.padding('10px', '14px'),
    fontWeight: '600',
    fontSize: '13px',
    borderBottom: '1px solid #E1DFDD',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    ...shorthands.borderRadius('5px', '5px', '0', '0'),
  },
  factHeader: {
    backgroundColor: '#0078D4',
    color: '#fff',
  },
  dimHeader: {
    backgroundColor: '#F3F2F1',
    color: '#323130',
  },
  tableFields: {
    ...shorthands.padding('6px', '0'),
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    ...shorthands.padding('4px', '14px'),
    fontSize: '12px',
    color: '#605E5C',
  },
  keyIcon: {
    color: '#D83B01',
    fontSize: '12px',
  },
  measureIcon: {
    color: '#107C10',
    fontSize: '12px',
  },
  attrIcon: {
    color: '#5C2D91',
    fontSize: '12px',
  },
  dateIcon: {
    color: '#D83B01',
    fontSize: '12px',
  },
});

function getFieldIcon(fieldType: string, styles: ReturnType<typeof useStyles>) {
  switch (fieldType) {
    case 'key':
      return <KeyRegular className={styles.keyIcon} />;
    case 'measure':
      return <NumberSymbolRegular className={styles.measureIcon} />;
    case 'date':
      return <CalendarRegular className={styles.dateIcon} />;
    default:
      return <TextFieldRegular className={styles.attrIcon} />;
  }
}

interface TableCardProps {
  table: TableDef;
  x: number;
  y: number;
  styles: ReturnType<typeof useStyles>;
}

const TableCard: React.FC<TableCardProps> = ({ table, x, y, styles }) => {
  const isFact = table.type === 'fact';
  return (
    <div
      className={`${styles.tableCard} ${isFact ? styles.factTable : styles.dimensionTable}`}
      style={{ left: x, top: y }}
    >
      <div className={`${styles.tableHeader} ${isFact ? styles.factHeader : styles.dimHeader}`}>
        {table.name}
      </div>
      <div className={styles.tableFields}>
        {table.fields.map((f) => (
          <div key={f.name} className={styles.fieldRow}>
            {getFieldIcon(f.type, styles)}
            <span>{f.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const DataModelPanel: React.FC = () => {
  const styles = useStyles();
  const scenario = useStore((s) => s.scenario) as ScenarioType;
  const schema = StarSchemas[scenario];

  // Center fact table, dimensions arranged in a circle around it
  const centerX = 400;
  const centerY = 280;
  const factX = centerX - 80;
  const factY = centerY - 60;

  // Position dimensions evenly around the fact table
  const dimCount = schema.dimensions.length;
  const radius = 220;
  const dimPositions = schema.dimensions.map((_, i) => {
    // Start from top and go clockwise
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / dimCount;
    return {
      x: centerX + radius * Math.cos(angle) - 80,
      y: centerY + radius * Math.sin(angle) - 50,
    };
  });

  // Calculate SVG connection lines from fact to each dimension
  const factCenterX = factX + 80;
  const factCenterY = factY + 80;
  const lines = schema.dimensions.map((dim, i) => {
    const dimCenterX = dimPositions[i].x + 80;
    const dimCenterY = dimPositions[i].y + 50;
    return { x1: factCenterX, y1: factCenterY, x2: dimCenterX, y2: dimCenterY, key: dim.name };
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Data Model</span>
        <span className={styles.scenarioBadge}>{scenario}</span>
      </div>
      <div className={styles.content}>
        <div className={styles.schemaContainer}>
          {/* SVG relationship lines */}
          <svg className={styles.svgLayer} width="800" height="560">
            {lines.map((line) => (
              <g key={line.key}>
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#8A8886"
                  strokeWidth={2}
                />
                {/* Cardinality markers: 1 on dimension side, * on fact side */}
                <text
                  x={line.x2 + (line.x1 - line.x2) * 0.12}
                  y={line.y2 + (line.y1 - line.y2) * 0.12 - 6}
                  fontSize={11}
                  fill="#605E5C"
                  fontWeight="600"
                >
                  1
                </text>
                <text
                  x={line.x1 + (line.x2 - line.x1) * 0.12}
                  y={line.y1 + (line.y2 - line.y1) * 0.12 - 6}
                  fontSize={11}
                  fill="#605E5C"
                  fontWeight="600"
                >
                  *
                </text>
              </g>
            ))}
          </svg>

          {/* Fact table (center) */}
          <TableCard table={schema.fact} x={factX} y={factY} styles={styles} />

          {/* Dimension tables (around the fact) */}
          {schema.dimensions.map((dim, i) => (
            <TableCard
              key={dim.name}
              table={dim}
              x={dimPositions[i].x}
              y={dimPositions[i].y}
              styles={styles}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
