import React, { useMemo, useState } from 'react';
import { makeStyles, shorthands } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useStore, useFilteredSales } from '../store/useStore';

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
  row: {
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  parentRow: {
    fontWeight: '600',
    backgroundColor: '#fafafa',
  },
  cell: {
    fontSize: '10px',
    ...shorthands.padding('3px', '6px'),
    textAlign: 'right',
    borderBottom: '1px solid #edebe9',
  },
  firstCell: {
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  childRow: {
    paddingLeft: '16px',
  },
  expandIcon: {
    cursor: 'pointer',
    color: '#605E5C',
    flexShrink: 0,
  },
  barCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
  },
  barContainer: {
    width: '50px',
    height: '12px',
    backgroundColor: '#f3f2f1',
    position: 'relative',
    display: 'inline-block',
    verticalAlign: 'middle',
  },
  bar: {
    height: '100%',
    position: 'absolute',
  },
  positiveBar: {
    backgroundColor: '#107C10',
  },
  negativeBar: {
    backgroundColor: '#A4262C',
  },
  zeroLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: '1px',
    backgroundColor: '#323130',
    zIndex: 1,
  },
  positive: {
    color: '#107C10',
  },
  negative: {
    color: '#A4262C',
  },
});

interface RowData {
  name: string;
  ac: number;
  py: number;
  pl: number;
  isParent?: boolean;
  children?: RowData[];
}

export const Matrix: React.FC = () => {
  const styles = useStyles();
  const filteredData = useFilteredSales();
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Personal care', 'Electronics']));

  const data = useMemo(() => {
    // Group by Category (parent) -> Region (child)
    const grouped: Record<string, Record<string, { ac: number, py: number, pl: number }>> = {};

    filteredData.forEach((item) => {
      const category = products.find(p => p.id === item.productId)?.category || 'Other';
      const region = stores.find(s => s.id === item.storeId)?.region || 'Other';

      if (!grouped[category]) grouped[category] = {};
      if (!grouped[category][region]) grouped[category][region] = { ac: 0, py: 0, pl: 0 };

      grouped[category][region].ac += (item.revenue || 0);
      grouped[category][region].py += (item.revenuePY || item.revenue * 0.9 || 0);
      grouped[category][region].pl += (item.revenuePL || item.revenue * 0.95 || 0);
    });

    // Convert to hierarchical structure
    const result: RowData[] = [];
    Object.entries(grouped).forEach(([category, regions]) => {
      const children: RowData[] = Object.entries(regions).map(([region, vals]) => ({
        name: region,
        ...vals,
      })).sort((a, b) => b.ac - a.ac);

      const parentTotals = children.reduce(
        (acc, child) => ({
          ac: acc.ac + child.ac,
          py: acc.py + child.py,
          pl: acc.pl + child.pl,
        }),
        { ac: 0, py: 0, pl: 0 }
      );

      result.push({
        name: category,
        ...parentTotals,
        isParent: true,
        children,
      });
    });

    // Add total row
    const grandTotal = result.reduce(
      (acc, row) => ({
        ac: acc.ac + row.ac,
        py: acc.py + row.py,
        pl: acc.pl + row.pl,
      }),
      { ac: 0, py: 0, pl: 0 }
    );

    return { rows: result.sort((a, b) => b.ac - a.ac), total: grandTotal };
  }, [filteredData, stores, products]);

  const formatVal = (v: number) => {
    if (Math.abs(v) >= 1000000) return (v / 1000000).toFixed(1) + 'M';
    if (Math.abs(v) >= 1000) return (v / 1000).toFixed(1) + 'K';
    return v.toFixed(0);
  };

  const maxAbsDiff = useMemo(() => {
    let maxDiff = 1;
    data.rows.forEach(row => {
      maxDiff = Math.max(maxDiff, Math.abs(row.ac - row.py));
      row.children?.forEach(child => {
        maxDiff = Math.max(maxDiff, Math.abs(child.ac - child.py));
      });
    });
    return maxDiff;
  }, [data]);

  const toggleExpand = (name: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const renderBar = (diff: number) => (
    <div className={styles.barContainer}>
      <div className={styles.zeroLine} />
      <div
        className={`${styles.bar} ${diff >= 0 ? styles.positiveBar : styles.negativeBar}`}
        style={{
          left: diff >= 0 ? '50%' : `calc(50% - ${Math.min(50, (Math.abs(diff) / maxAbsDiff) * 50)}%)`,
          width: `${Math.min(50, (Math.abs(diff) / maxAbsDiff) * 50)}%`
        }}
      />
    </div>
  );

  const renderRow = (row: RowData, isChild = false) => {
    const diffPY = row.ac - row.py;
    const diffPL = row.ac - row.pl;
    const pctPY = row.py !== 0 ? (diffPY / row.py) * 100 : 0;
    const pctPL = row.pl !== 0 ? (diffPL / row.pl) * 100 : 0;

    return (
      <tr key={row.name} className={`${styles.row} ${row.isParent ? styles.parentRow : ''}`}>
        <td className={`${styles.cell} ${styles.firstCell}`} style={{ paddingLeft: isChild ? '20px' : '4px' }}>
          {row.isParent && (
            <span className={styles.expandIcon} onClick={() => toggleExpand(row.name)}>
              {expanded.has(row.name) ? <ChevronDownRegular fontSize={12} /> : <ChevronRightRegular fontSize={12} />}
            </span>
          )}
          <span>{isChild ? '  ' : ''}{row.name}</span>
        </td>
        <td className={styles.cell}>{formatVal(row.ac)}</td>
        <td className={styles.cell}>{formatVal(row.py)}</td>
        <td className={styles.cell}>{formatVal(row.pl)}</td>
        <td className={styles.cell}>
          <div className={styles.barCell}>
            <span className={diffPY >= 0 ? styles.positive : styles.negative} style={{ fontWeight: 600 }}>
              {diffPY >= 0 ? '+' : ''}{formatVal(diffPY)}
            </span>
            {renderBar(diffPY)}
          </div>
        </td>
        <td className={styles.cell}>
          <div className={styles.barCell}>
            <span className={diffPL >= 0 ? styles.positive : styles.negative} style={{ fontWeight: 600 }}>
              {diffPL >= 0 ? '+' : ''}{formatVal(diffPL)}
            </span>
            {renderBar(diffPL)}
          </div>
        </td>
        <td className={styles.cell}>
          <span className={pctPY >= 0 ? styles.positive : styles.negative} style={{ fontWeight: 600 }}>
            {pctPY >= 0 ? '+' : ''}{pctPY.toFixed(1)}%
          </span>
        </td>
        <td className={styles.cell}>
          <span className={pctPL >= 0 ? styles.positive : styles.negative} style={{ fontWeight: 600 }}>
            {pctPL >= 0 ? '+' : ''}{pctPL.toFixed(1)}%
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th className={`${styles.headerCell} ${styles.firstHeaderCell}`}>Business Unit</th>
            <th className={styles.headerCell}>AC</th>
            <th className={styles.headerCell}>PY</th>
            <th className={styles.headerCell}>PL</th>
            <th className={styles.headerCell}>ΔPY</th>
            <th className={styles.headerCell}>ΔPL</th>
            <th className={styles.headerCell}>ΔPY%</th>
            <th className={styles.headerCell}>ΔPL%</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map(row => (
            <React.Fragment key={row.name}>
              {renderRow(row)}
              {row.isParent && expanded.has(row.name) && row.children?.map(child => renderRow(child, true))}
            </React.Fragment>
          ))}
          <tr className={styles.parentRow} style={{ borderTop: '2px solid #323130' }}>
            <td className={`${styles.cell} ${styles.firstCell}`} style={{ fontWeight: 700 }}>Total</td>
            <td className={styles.cell} style={{ fontWeight: 700 }}>{formatVal(data.total.ac)}</td>
            <td className={styles.cell} style={{ fontWeight: 700 }}>{formatVal(data.total.py)}</td>
            <td className={styles.cell} style={{ fontWeight: 700 }}>{formatVal(data.total.pl)}</td>
            <td className={styles.cell}>
              <span className={(data.total.ac - data.total.py) >= 0 ? styles.positive : styles.negative} style={{ fontWeight: 700 }}>
                {(data.total.ac - data.total.py) >= 0 ? '+' : ''}{formatVal(data.total.ac - data.total.py)}
              </span>
            </td>
            <td className={styles.cell}>
              <span className={(data.total.ac - data.total.pl) >= 0 ? styles.positive : styles.negative} style={{ fontWeight: 700 }}>
                {(data.total.ac - data.total.pl) >= 0 ? '+' : ''}{formatVal(data.total.ac - data.total.pl)}
              </span>
            </td>
            <td className={styles.cell}>
              <span className={(data.total.ac - data.total.py) >= 0 ? styles.positive : styles.negative} style={{ fontWeight: 700 }}>
                {((data.total.ac - data.total.py) / data.total.py * 100).toFixed(1)}%
              </span>
            </td>
            <td className={styles.cell}>
              <span className={(data.total.ac - data.total.pl) >= 0 ? styles.positive : styles.negative} style={{ fontWeight: 700 }}>
                {((data.total.ac - data.total.pl) / data.total.pl * 100).toFixed(1)}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
