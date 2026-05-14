import React, { useCallback, useMemo, useState } from 'react';
import {
  makeStyles,
  shorthands,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  mergeClasses,
  Input,
  Button,
  Popover,
  PopoverTrigger,
  PopoverSurface,
} from '@fluentui/react-components';
import {
  ArrowSortRegular,
  ArrowSortDownRegular,
  ArrowSortUpRegular,
  FilterRegular,
  FilterDismissRegular,
} from '@fluentui/react-icons';
import { useStore, useFilteredSales } from '../store/useStore';
import { formatFieldLabel, ScenarioFields, ScenarioType } from '../store/semanticLayer';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

const useStyles = makeStyles({
  container: {
    height: '100%',
    ...shorthands.overflow('auto'),
    ...shorthands.padding('4px'),
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    backgroundColor: 'white',
  },
  table: {
    fontSize: '12px',
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    boxShadow: '0 1px 0 #E2E8F0',
  },
  headerCell: {
    fontWeight: '600',
    fontSize: '11px',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    ...shorthands.padding('0'),
    textAlign: 'left' as const,
    borderBottom: '1px solid #E2E8F0',
    whiteSpace: 'nowrap',
  },
  headerContent: {
    minHeight: '32px',
    width: '100%',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 26px',
    alignItems: 'center',
    gap: '2px',
    ...shorthands.padding('4px', '6px', '4px', '10px'),
    boxSizing: 'border-box',
  },
  sortButton: {
    minHeight: '32px',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px',
    ...shorthands.padding('0', '4px', '0', '0'),
    ...shorthands.border('0'),
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    fontWeight: '600',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#EEF2FF',
    },
  },
  filterButton: {
    width: '24px',
    height: '24px',
    minWidth: '24px',
    color: '#64748B',
    ...shorthands.borderRadius('5px'),
    ':hover': {
      color: '#2563EB',
      backgroundColor: '#DBEAFE',
    },
  },
  filterButtonActive: {
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
  },
  filterPopover: {
    width: '220px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    ...shorthands.padding('10px'),
  },
  filterInput: {
    width: '100%',
    '& input': {
      fontSize: '12px',
    },
  },
  filterTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#475569',
  },
  filterActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  headerLabel: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sortIcon: {
    flexShrink: 0,
    color: '#605E5C',
  },
  sortIconActive: {
    flexShrink: 0,
    color: '#2563EB',
  },
  row: {
    ':hover': {
      backgroundColor: '#F5F5F5',
    },
  },
  rowEven: {
    backgroundColor: '#F8FAFC',
  },
  cell: {
    fontSize: '12px',
    ...shorthands.padding('6px', '12px'),
    borderBottom: '1px solid #EEF2F7',
    color: '#0F172A',
  },
  numberCell: {
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
});

interface DataTableProps {
  maxRows?: number;
  columns?: string[];
}

type SortDirection = 'asc' | 'desc';

interface SortState {
  column: string;
  direction: SortDirection;
}

const toComparableValue = (value: unknown): number | string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? value : '';

  const text = String(value).trim();
  if (!text) return '';

  const numeric = Number(text.replace(/[$,%\s,]/g, ''));
  if (Number.isFinite(numeric) && /[\d]/.test(text)) return numeric;

  const parsedDate = new Date(text);
  if (!Number.isNaN(parsedDate.getTime()) && /[/-]|\d{4}/.test(text)) {
    return parsedDate.getTime();
  }

  return text.toLocaleLowerCase();
};

const compareCellValues = (left: unknown, right: unknown, direction: SortDirection) => {
  const a = toComparableValue(left);
  const b = toComparableValue(right);
  const multiplier = direction === 'asc' ? 1 : -1;

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * multiplier;
  }

  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }) * multiplier;
};

export const DataTable: React.FC<DataTableProps> = ({ maxRows = 50, columns }) => {
  const styles = useStyles();
  const scenario = useStore((state) => state.scenario) as ScenarioType;
  const filteredSales = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  const scenarioFields = ScenarioFields[scenario] || [];
  const roleLookup = useMemo(() => {
    const map = new Map<string, string>();
    scenarioFields.forEach((field) => {
      map.set(field.name.toLowerCase(), field.role);
    });
    return map;
  }, [scenarioFields]);

  const resolveCellValue = useCallback((row: any, column: string) => {
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
  }, [customers, products, roleLookup, stores]);

  const enrichedRows = useMemo(() => {
    return filteredSales.map((sale) => {
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
  }, [filteredSales, stores, products]);

  const tableData = useMemo(() => {
    let rows = [...enrichedRows];
    const activeColumnFilters = Object.entries(columnFilters)
      .map(([column, filter]) => [column, filter.trim().toLocaleLowerCase()] as const)
      .filter(([, filter]) => filter.length > 0);

    if (activeColumnFilters.length > 0) {
      rows = rows.filter((row) => activeColumnFilters.every(([column, filter]) => {
        const value = resolveCellValue(row, column);
        return String(value ?? '').toLocaleLowerCase().includes(filter);
      }));
    }

    if (sortState) {
      rows.sort((left, right) => {
        const result = compareCellValues(
          resolveCellValue(left, sortState.column),
          resolveCellValue(right, sortState.column),
          sortState.direction
        );
        return result;
      });
    }
    return rows.slice(0, maxRows);
  }, [columnFilters, enrichedRows, maxRows, resolveCellValue, sortState]);

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
  const setColumnFilter = (column: string, value: string) => {
    setColumnFilters((current) => {
      const next = { ...current };
      if (!value.trim()) {
        delete next[column];
      } else {
        next[column] = value;
      }
      return next;
    });
  };

  const handleSort = (column: string) => {
    setSortState((current) => {
      if (current?.column !== column) return { column, direction: 'asc' };
      return { column, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  return (
    <div className={styles.container}>
      <Table size="extra-small" className={styles.table}>
        <TableHeader className={styles.tableHeader}>
          <TableRow>
            {effectiveColumns.map(col => {
              const active = sortState?.column === col;
              const SortIcon = active
                ? sortState.direction === 'asc'
                  ? ArrowSortUpRegular
                  : ArrowSortDownRegular
                : ArrowSortRegular;
              const nextDirection = active && sortState.direction === 'asc' ? 'descending' : 'ascending';
              const hasFilter = Boolean(columnFilters[col]);

              return (
                <TableHeaderCell key={col} className={styles.headerCell}>
                  <div className={styles.headerContent}>
                    <button
                      type="button"
                      className={styles.sortButton}
                      onClick={() => handleSort(col)}
                      aria-label={`Sort ${formatFieldLabel(col)} ${nextDirection}`}
                    >
                      <span className={styles.headerLabel}>{formatFieldLabel(col)}</span>
                      <SortIcon className={active ? styles.sortIconActive : styles.sortIcon} fontSize={14} />
                    </button>
                    <Popover positioning="below-start" withArrow>
                      <PopoverTrigger disableButtonEnhancement>
                        <Button
                          appearance="transparent"
                          size="small"
                          className={mergeClasses(styles.filterButton, hasFilter ? styles.filterButtonActive : undefined)}
                          icon={hasFilter ? <FilterDismissRegular /> : <FilterRegular />}
                          aria-label={`Filter ${formatFieldLabel(col)}`}
                          title={`Filter ${formatFieldLabel(col)}`}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </PopoverTrigger>
                      <PopoverSurface className={styles.filterPopover} onClick={(event) => event.stopPropagation()}>
                        <div className={styles.filterTitle}>Filter {formatFieldLabel(col)}</div>
                        <Input
                          size="small"
                          value={columnFilters[col] || ''}
                          placeholder="Type to filter..."
                          aria-label={`Filter ${formatFieldLabel(col)}`}
                          className={styles.filterInput}
                          autoFocus
                          onChange={(_, data) => setColumnFilter(col, data.value)}
                        />
                        {hasFilter && (
                          <div className={styles.filterActions}>
                            <Button
                              size="small"
                              appearance="subtle"
                              onClick={() => setColumnFilter(col, '')}
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </PopoverSurface>
                    </Popover>
                  </div>
                </TableHeaderCell>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, index) => (
            <TableRow key={row.id} className={mergeClasses(styles.row, index % 2 === 1 ? styles.rowEven : undefined)}>
              {effectiveColumns.map(col => {
                const val = resolveCellValue(row, col);
                const isNum = typeof val === 'number' && Number.isFinite(val);
                return (
                  <TableCell key={col} className={mergeClasses(styles.cell, isNum ? styles.numberCell : undefined)}>
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
