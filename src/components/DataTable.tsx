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
  TableCellLayout,
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
      // Existing enrich logic (keep as fallback or base)
      const store = stores.find((s) => s.id === sale.storeId);
      const product = products.find((p) => p.id === sale.productId);
      
      const row: any = {
        id: sale.id,
        ...sale, // Spread raw data
        store: store?.name || 'Unknown',
        region: store?.region || 'Unknown',
        product: product?.name || 'Unknown',
        category: product?.category || 'Unknown',
        date: new Date(sale.date).toLocaleDateString(),
      };
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

  // If dynamic columns are provided, use them
  if (columns && columns.length > 0) {
      return (
        <div className={styles.container}>
          <Table size="extra-small" className={styles.table}>
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                    <TableHeaderCell key={col} className={styles.headerCell}>{col}</TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map(col => {
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
  }

  // Fallback to original hardcoded view
  return (
    <div className={styles.container}>
      <Table size="extra-small" className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell className={styles.headerCell}>Date</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Region</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Category</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Product</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Qty</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Revenue</TableHeaderCell>
            <TableHeaderCell className={styles.headerCell}>Profit</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row) => (
            <TableRow key={row.id}>
              <TableCell className={styles.cell}>{row.date}</TableCell>
              <TableCell className={styles.cell}>{row.region}</TableCell>
              <TableCell className={styles.cell}>{row.category}</TableCell>
              <TableCell className={styles.cell}>
                <TableCellLayout truncate>{row.product}</TableCellLayout>
              </TableCell>
              <TableCell className={`${styles.cell} ${styles.numberCell}`}>{row.quantity}</TableCell>
              <TableCell className={`${styles.cell} ${styles.numberCell}`}>{formatMetricValue('Revenue', row.revenue, false)}</TableCell>
              <TableCell className={`${styles.cell} ${styles.numberCell}`}>{formatMetricValue('Profit', row.profit, false)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
