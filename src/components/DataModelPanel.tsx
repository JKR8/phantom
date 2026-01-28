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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FAFAF9',
  },
  header: {
    ...shorthands.padding('12px'),
    borderBottom: '1px solid #E1DFDD',
    fontWeight: '600',
    fontSize: '11px',
    color: '#605E5C',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  scenarioLabel: {
    ...shorthands.padding('8px', '12px'),
    fontSize: '12px',
    color: '#252423',
    fontWeight: '500',
    backgroundColor: '#F3F2F1',
    borderBottom: '1px solid #E1DFDD',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    ...shorthands.padding('12px'),
    position: 'relative',
  },
  schemaContainer: {
    position: 'relative',
    minHeight: '400px',
    width: '100%',
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
    ...shorthands.borderRadius('4px'),
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    minWidth: '120px',
    zIndex: 1,
  },
  factTable: {
    ...shorthands.border('2px', 'solid', '#0078D4'),
  },
  dimensionTable: {
    ...shorthands.border('1px', 'solid', '#8A8886'),
  },
  tableHeader: {
    ...shorthands.padding('6px', '8px'),
    fontWeight: '600',
    fontSize: '11px',
    borderBottom: '1px solid #E1DFDD',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
    ...shorthands.padding('4px', '0'),
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    ...shorthands.padding('2px', '8px'),
    fontSize: '10px',
    color: '#605E5C',
  },
  keyIcon: {
    color: '#D83B01',
    fontSize: '10px',
  },
  measureIcon: {
    color: '#107C10',
    fontSize: '10px',
  },
  attrIcon: {
    color: '#5C2D91',
    fontSize: '10px',
  },
  dateIcon: {
    color: '#D83B01',
    fontSize: '10px',
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

  // Calculate positions for star layout
  // Fact table in center, dimensions around it
  const factX = 50;
  const factY = 160;

  // Position dimensions in an arc above/around the fact table
  const dimPositions = schema.dimensions.map((_, i) => {
    const count = schema.dimensions.length;
    // Spread dimensions in an arc from top-left to top-right
    const angle = Math.PI * (0.25 + (0.5 * i / Math.max(count - 1, 1)));
    const radius = 140;
    return {
      x: factX + 40 + radius * Math.cos(angle) - 60,
      y: factY - radius * Math.sin(angle) + 20,
    };
  });

  // Calculate SVG connection lines
  const factCenterX = factX + 60;
  const factCenterY = factY + 50;
  const lines = schema.dimensions.map((dim, i) => {
    const dimX = dimPositions[i].x + 60;
    const dimY = dimPositions[i].y + 40;
    return { x1: factCenterX, y1: factCenterY, x2: dimX, y2: dimY, key: dim.name };
  });

  const svgHeight = Math.max(400, factY + 150);

  return (
    <div className={styles.container}>
      <div className={styles.header}>Data Model</div>
      <div className={styles.scenarioLabel}>Scenario: {scenario}</div>
      <div className={styles.content}>
        <div className={styles.schemaContainer} style={{ height: svgHeight }}>
          {/* SVG relationship lines */}
          <svg className={styles.svgLayer} style={{ height: svgHeight }}>
            {lines.map((line) => (
              <g key={line.key}>
                <line
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="#8A8886"
                  strokeWidth={1.5}
                />
                {/* Cardinality markers: 1 on dimension side, * on fact side */}
                <text
                  x={line.x2 + (line.x1 - line.x2) * 0.15}
                  y={line.y2 + (line.y1 - line.y2) * 0.15 - 4}
                  fontSize={9}
                  fill="#605E5C"
                >
                  1
                </text>
                <text
                  x={line.x1 + (line.x2 - line.x1) * 0.15}
                  y={line.y1 + (line.y2 - line.y1) * 0.15 - 4}
                  fontSize={9}
                  fill="#605E5C"
                >
                  *
                </text>
              </g>
            ))}
          </svg>

          {/* Fact table */}
          <TableCard table={schema.fact} x={factX} y={factY} styles={styles} />

          {/* Dimension tables */}
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
