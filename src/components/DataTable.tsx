import React, { useMemo } from 'react';
import {
  makeStyles,
  shorthands,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@fluentui/react-components';
import { useStore, useFilteredSales } from '../store/useStore';
import { ScenarioFields, ScenarioType } from '../store/semanticLayer';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

const useStyles = makeStyles({
  container: {
    height: '100%',
    ...shorthands.overflow('auto'),
    ...shorthands.padding('8px'),
  },
  table: {
    fontSize: '11px',
  },
  headerCell: {
    fontWeight: '600',
    fontSize: '11px',
    backgroundColor: '#F3F2F1',
  },
  cell: {
    fontSize: '11px',
    ...shorthands.padding('4px', '8px'),
  },
  numberCell: {
    textAlign: 'right',
  },
});

interface DataTableProps {
  maxRows?: number;
  columns?: string[];
}

export const DataTable: React.FC<DataTableProps> = ({ maxRows = 50, columns }) => {
  const styles = useStyles();
  const scenario = useStore((state) => state.scenario) as ScenarioType;
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);

  const scenarioFields = ScenarioFields[scenario] || [];
  const roleLookup = useMemo(() => {
    const map = new Map<string, string>();
    scenarioFields.forEach((field) => {
      map.set(field.name.toLowerCase(), field.role);
    });
    return map;
  }, [scenarioFields]);

  const tableData = useMemo(() => {
    return filteredSales.slice(0, maxRows).map((sale) => {
      // Existing enrich logic for Retail scenario (lookup from stores/products)
      const store = stores.find((s) => s.id === sale.storeId);
      const product = products.find((p) => p.id === sale.productId);

      const row: any = {
        id: sale.id,
        ...sale, // Spread raw data first
      };

      // Only overwrite with lookups if the value exists
      if (store?.name) row.store = store.name;
      if (store?.region && !sale.region) row.region = store.region;
      if (product?.name) row.product = product.name;
      if (product?.category) row.category = product.category;
      if (sale.date) row.date = new Date(sale.date).toLocaleDateString();

      return row;
    });
  }, [filteredSales, stores, products, maxRows]);

  const resolveCellValue = (row: any, column: string) => {
    const role = roleLookup.get(column.toLowerCase());
    if (role === 'Measure') {
      return getMetricValue(row, column);
    }
    if (role === 'Time') {
      const raw = row[column] ?? row[column.toLowerCase()];
      if (raw) {
        const parsed = new Date(raw);
        if (!Number.isNaN(parsed.getTime())) {
          return parsed.toLocaleDateString();
        }
      }
    }
    return getDimensionValue(row, column, { stores, products, customers });
  };

  // Use scenario-appropriate default columns
  const defaultColumns = useMemo(() => {
    const defaultsByScenario: Record<ScenarioType, string[]> = {
      Retail: ['Date', 'Region', 'Category', 'Product', 'Quantity', 'Revenue', 'Profit'],
      SaaS: ['Date', 'Customer', 'Region', 'Tier', 'MRR', 'ARR', 'Churn'],
      HR: ['Date', 'Employee', 'Department', 'Role', 'Salary', 'Rating', 'Tenure'],
      Logistics: ['Date', 'Carrier', 'Origin', 'Destination', 'Status', 'Cost', 'Weight'],
      Finance: ['Date', 'Account', 'Region', 'BusinessUnit', 'Scenario', 'Amount', 'Variance'],
      Portfolio: ['Date', 'Entity', 'Sector', 'Region', 'MarketValue', 'Score'],
      Social: ['Date', 'Platform', 'Location', 'Sentiment', 'Engagements', 'Mentions'],
    };
    return defaultsByScenario[scenario] || defaultsByScenario.Retail;
  }, [scenario]);

  const effectiveColumns = columns && columns.length > 0 ? columns : defaultColumns;

  return (
    <div className={styles.container}>
      <Table size="extra-small" className={styles.table}>
        <TableHeader>
          <TableRow>
            {effectiveColumns.map(col => (
              <TableHeaderCell key={col} className={styles.headerCell}>{col}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row) => (
            <TableRow key={row.id}>
              {effectiveColumns.map(col => {
                const val = resolveCellValue(row, col);
                const isNum = typeof val === 'number' && Number.isFinite(val);
                return (
                  <TableCell key={col} className={`${styles.cell} ${isNum ? styles.numberCell : ''}`}>
                    {isNum ? formatMetricValue(col, val, false) : val}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
