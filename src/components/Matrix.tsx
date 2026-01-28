import React, { useMemo } from 'react';
import { makeStyles, shorthands } from '@fluentui/react-components';
import { useStore, useFilteredSales } from '../store/useStore';
import { ScenarioFields, ScenarioType } from '../store/semanticLayer';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

const useStyles = makeStyles({
  container: {
    height: '100%',
    ...shorthands.overflow('auto'),
    backgroundColor: 'white',
    ...shorthands.padding('4px'),
  },
  table: {
    fontSize: '10px',
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    backgroundColor: '#F3F2F1',
  },
  headerCell: {
    fontWeight: '600',
    fontSize: '9px',
    textAlign: 'right',
    color: '#323130',
    ...shorthands.padding('4px', '6px'),
    borderBottom: '2px solid #323130',
    whiteSpace: 'nowrap',
  },
  firstHeaderCell: {
    textAlign: 'left',
    minWidth: '140px',
  },
  cell: {
    fontSize: '10px',
    ...shorthands.padding('3px', '6px'),
    textAlign: 'right',
    borderBottom: '1px solid #edebe9',
  },
  firstCell: {
    textAlign: 'left',
  },
  totalRow: {
    fontWeight: '700',
    backgroundColor: '#fafafa',
  },
});

interface MatrixProps {
  rows?: string;
  columns?: string;
  values?: string;
}

export const Matrix: React.FC<MatrixProps> = ({ rows, columns, values }) => {
  const styles = useStyles();
  const filteredData = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const scenario = useStore((state) => state.scenario) as ScenarioType;

  const matrix = useMemo(() => {
    const fields = ScenarioFields[scenario] || [];
    const defaultRow = fields.find((f) => ['Category', 'Entity', 'Geography'].includes(f.role))?.name;
    const defaultCol = fields.find((f) => f.role === 'Time')?.name;
    const defaultVal = fields.find((f) => f.role === 'Measure')?.name;

    const rowField = rows || defaultRow || 'Category';
    const colField = columns || defaultCol || 'Date';
    const valField = values || defaultVal || 'Value';

    const isTimeField = ['date', 'month', 'year', 'quarter'].includes(colField.toLowerCase());
    const columnLabels = new Map<string, string>();

    const getTimeKey = (item: any) => {
      const raw = item?.date ?? item?.[colField] ?? item?.[colField.toLowerCase()];
      const parsed = new Date(raw);
      if (Number.isNaN(parsed.getTime())) {
        columnLabels.set('Unknown', 'Unknown');
        return 'Unknown';
      }

      const year = parsed.getFullYear();
      const month = parsed.getMonth();
      if (colField.toLowerCase() === 'year') {
        const key = String(year);
        columnLabels.set(key, key);
        return key;
      }
      if (colField.toLowerCase() === 'quarter') {
        const q = Math.floor(month / 3) + 1;
        const key = `${year}-Q${q}`;
        columnLabels.set(key, `Q${q} ${year}`);
        return key;
      }
      if (colField.toLowerCase() === 'month') {
        const key = `${year}-${String(month + 1).padStart(2, '0')}`;
        columnLabels.set(key, parsed.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }));
        return key;
      }

      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
      columnLabels.set(key, parsed.toLocaleDateString());
      return key;
    };

    const pivot: Record<string, Record<string, number>> = {};
    const rowKeys = new Set<string>();
    const colKeys = new Set<string>();

    filteredData.forEach((item) => {
      const rowKey = getDimensionValue(item, rowField, { stores, products, customers });
      const colKey = isTimeField ? getTimeKey(item) : getDimensionValue(item, colField, { stores, products, customers });
      const val = getMetricValue(item, valField);

      rowKeys.add(rowKey);
      colKeys.add(colKey);
      if (!pivot[rowKey]) pivot[rowKey] = {};
      pivot[rowKey][colKey] = (pivot[rowKey][colKey] || 0) + val;
    });

    const rowsList = Array.from(rowKeys).sort();
    const colsList = Array.from(colKeys).sort();
    if (isTimeField) colsList.sort((a, b) => a.localeCompare(b));

    return {
      rowsList,
      colsList,
      pivot,
      rowField,
      colField,
      valField,
      columnLabels,
    };
  }, [filteredData, stores, products, customers, rows, columns, values, scenario]);

  const rowTotals = matrix.rowsList.map((rowKey) =>
    matrix.colsList.reduce((acc, colKey) => acc + (matrix.pivot[rowKey]?.[colKey] || 0), 0)
  );
  const colTotals = matrix.colsList.map((colKey) =>
    matrix.rowsList.reduce((acc, rowKey) => acc + (matrix.pivot[rowKey]?.[colKey] || 0), 0)
  );
  const grandTotal = rowTotals.reduce((acc, v) => acc + v, 0);

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={`${styles.headerCell} ${styles.firstHeaderCell}`}>{matrix.rowField}</th>
            {matrix.colsList.map((colKey) => (
              <th key={colKey} className={styles.headerCell}>
                {matrix.columnLabels.get(colKey) || colKey}
              </th>
            ))}
            <th className={styles.headerCell}>Total</th>
          </tr>
        </thead>
        <tbody>
          {matrix.rowsList.map((rowKey, rowIndex) => (
            <tr key={rowKey}>
              <td className={`${styles.cell} ${styles.firstCell}`}>{rowKey}</td>
              {matrix.colsList.map((colKey) => (
                <td key={colKey} className={styles.cell}>
                  {formatMetricValue(matrix.valField, matrix.pivot[rowKey]?.[colKey] || 0, true)}
                </td>
              ))}
              <td className={styles.cell}>{formatMetricValue(matrix.valField, rowTotals[rowIndex], true)}</td>
            </tr>
          ))}
          <tr className={styles.totalRow}>
            <td className={`${styles.cell} ${styles.firstCell}`}>Total</td>
            {colTotals.map((total, idx) => (
              <td key={matrix.colsList[idx]} className={styles.cell}>
                {formatMetricValue(matrix.valField, total, true)}
              </td>
            ))}
            <td className={styles.cell}>{formatMetricValue(matrix.valField, grandTotal, true)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
