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

const useStyles = makeStyles({
  container: {
    height: '100%',
    ...shorthands.overflow('auto'),
    ...shorthands.padding('8px'),
  },
  table: {
    fontSize: '11px',
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerCell: {
    fontWeight: '600',
    fontSize: '11px',
    backgroundColor: '#F3F2F1',
    textAlign: 'right',
  },
  firstHeaderCell: {
      textAlign: 'left',
  },
  cell: {
    fontSize: '11px',
    ...shorthands.padding('4px', '8px'),
    textAlign: 'right',
    borderBottom: '1px solid #f3f2f1'
  },
  firstCell: {
      textAlign: 'left',
      fontWeight: '600'
  },
  totalRow: {
      fontWeight: 'bold',
      backgroundColor: '#f8f8f8'
  }
});

interface MatrixProps {
}

export const Matrix: React.FC<MatrixProps> = () => {
  const styles = useStyles();
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);

  // Pivot: Rows = Region, Cols = Category, Values = Revenue
  const data = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    const regions = new Set<string>();
    const categories = new Set<string>();

    filteredSales.forEach((sale) => {
        const region = stores.find(s => s.id === sale.storeId)?.region || 'Unknown';
        const category = products.find(p => p.id === sale.productId)?.category || 'Unknown';

        regions.add(region);
        categories.add(category);

        if (!matrix[region]) matrix[region] = {};
        matrix[region][category] = (matrix[region][category] || 0) + sale.revenue;
    });

    const sortedRegions = Array.from(regions).sort();
    const sortedCategories = Array.from(categories).sort();

    return { matrix, regions: sortedRegions, categories: sortedCategories };
  }, [filteredSales, stores, products]);

  const { matrix, regions, categories } = data;

  const formatCurrency = (value: number) => `$${(value / 1000).toFixed(0)}k`;

  return (
    <div className={styles.container}>
      <Table size="extra-small" className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell className={`${styles.headerCell} ${styles.firstHeaderCell}`}>Region</TableHeaderCell>
            {categories.map(cat => (
                <TableHeaderCell key={cat} className={styles.headerCell}>{cat}</TableHeaderCell>
            ))}
            <TableHeaderCell className={styles.headerCell}>Total</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {regions.map((region) => {
              let rowTotal = 0;
              return (
                <TableRow key={region}>
                <TableCell className={`${styles.cell} ${styles.firstCell}`}>{region}</TableCell>
                {categories.map(cat => {
                    const val = matrix[region][cat] || 0;
                    rowTotal += val;
                    return (
                        <TableCell key={cat} className={styles.cell}>{val ? formatCurrency(val) : '-'}</TableCell>
                    );
                })}
                <TableCell className={`${styles.cell} ${styles.totalRow}`}>{formatCurrency(rowTotal)}</TableCell>
                </TableRow>
              );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
