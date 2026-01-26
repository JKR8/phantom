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
}

export const DataTable: React.FC<DataTableProps> = ({ maxRows = 50 }) => {
  const styles = useStyles();
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);

  const tableData = useMemo(() => {
    return filteredSales.slice(0, maxRows).map((sale) => {
      const store = stores.find((s) => s.id === sale.storeId);
      const product = products.find((p) => p.id === sale.productId);
      return {
        id: sale.id,
        date: new Date(sale.date).toLocaleDateString(),
        store: store?.name || 'Unknown',
        region: store?.region || 'Unknown',
        product: product?.name || 'Unknown',
        category: product?.category || 'Unknown',
        quantity: sale.quantity,
        revenue: sale.revenue,
        profit: sale.profit,
      };
    });
  }, [filteredSales, stores, products, maxRows]);

  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

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
              <TableCell className={`${styles.cell} ${styles.numberCell}`}>{formatCurrency(row.revenue)}</TableCell>
              <TableCell className={`${styles.cell} ${styles.numberCell}`}>{formatCurrency(row.profit)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
