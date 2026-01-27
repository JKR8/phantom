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
import { useStore, useFilteredPortfolioEntities } from '../../store/useStore';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.overflow('hidden'),
    backgroundColor: 'white',
  },
  tableWrapper: {
    flex: 1,
    ...shorthands.overflow('auto'),
  },
  table: {
    fontSize: '10px',
    width: '100%',
    tableLayout: 'fixed',
  },
  headerCell: {
    fontWeight: '600',
    fontSize: '9px',
    backgroundColor: '#F3F2F1',
    color: '#323130',
    ...shorthands.padding('4px', '6px'),
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  cell: {
    fontSize: '10px',
    ...shorthands.padding('2px', '6px'),
    color: '#323130',
    ...shorthands.borderBottom('1px', 'solid', '#EDEBE9'),
    lineHeight: '1.3',
  },
  entityName: {
    fontWeight: '500',
    color: '#0078D4',
  },
  totalRow: {
    backgroundColor: '#F3F2F1',
  },
  totalCell: {
    fontSize: '10px',
    ...shorthands.padding('3px', '6px'),
    color: '#323130',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#D4A548',
  },
  clickableRow: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#F5F5F5',
    },
  },
  selectedRow: {
    backgroundColor: '#FFF8E7',
  },
  mvCell: {
    textAlign: 'right',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    color: '#A19F9D',
    fontSize: '12px',
    ...shorthands.padding('24px'),
  },
});

interface EntitySourceTableProps {
  maxRows?: number;
}

export const EntitySourceTable: React.FC<EntitySourceTableProps> = ({ maxRows = 15 }) => {
  const styles = useStyles();
  const filteredEntities = useFilteredPortfolioEntities();
  const setFilter = useStore((state) => state.setFilter);
  const activeFilters = useStore((state) => state.filters);

  const tableData = useMemo(() => {
    return filteredEntities.slice(0, maxRows).map((entity) => ({
      id: entity.id,
      name: entity.name,
      accountReportName: entity.accountReportName,
      accountCode: entity.accountCode,
      marketValue: entity.marketValue,
    }));
  }, [filteredEntities, maxRows]);

  const totalMarketValue = useMemo(() => {
    return filteredEntities.reduce((acc, entity) => acc + entity.marketValue, 0);
  }, [filteredEntities]);

  const formatCurrency = (value: number) => {
    // Always format as $X,XXX.XXM style
    const millions = value / 1000000;
    return `$${millions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
  };

  const handleRowClick = (entityName: string) => {
    const currentFilter = activeFilters['EntityName'];
    if (currentFilter === entityName) {
      setFilter('EntityName', null);
    } else {
      setFilter('EntityName', entityName);
    }
  };

  if (tableData.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>No entity data available. Switch to Portfolio scenario.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <Table size="extra-small" className={styles.table}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell className={styles.headerCell}>Entity Name</TableHeaderCell>
              <TableHeaderCell className={styles.headerCell}>Account Report Name</TableHeaderCell>
              <TableHeaderCell className={styles.headerCell}>Acc</TableHeaderCell>
              <TableHeaderCell className={styles.headerCell}>MV (AUD$)</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow
                key={row.id}
                className={`${styles.clickableRow} ${activeFilters['EntityName'] === row.name ? styles.selectedRow : ''}`}
                onClick={() => handleRowClick(row.name)}
              >
                <TableCell className={styles.cell}>
                  <TableCellLayout truncate>
                    <span className={styles.entityName}>{row.name}</span>
                  </TableCellLayout>
                </TableCell>
                <TableCell className={styles.cell}>
                  <TableCellLayout truncate>{row.accountReportName}</TableCellLayout>
                </TableCell>
                <TableCell className={styles.cell}>{row.accountCode}</TableCell>
                <TableCell className={`${styles.cell} ${styles.mvCell}`}>{formatCurrency(row.marketValue)}</TableCell>
              </TableRow>
            ))}
            {/* Total Row */}
            <TableRow className={styles.totalRow}>
              <TableCell className={styles.totalCell}>Total</TableCell>
              <TableCell className={styles.totalCell}></TableCell>
              <TableCell className={styles.totalCell}></TableCell>
              <TableCell className={`${styles.totalCell} ${styles.mvCell}`}>
                <span className={styles.totalValue}>{formatCurrency(totalMarketValue)}</span>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
