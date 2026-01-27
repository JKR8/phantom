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
import { useFilteredControversyScores } from '../../store/useStore';

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
    fontSize: '11px',
    width: '100%',
    tableLayout: 'fixed',
  },
  headerCell: {
    fontWeight: '600',
    fontSize: '10px',
    backgroundColor: '#F3F2F1',
    color: '#323130',
    ...shorthands.padding('8px'),
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  headerEntityName: {
    width: '140px',
  },
  headerCategory: {
    width: '140px',
  },
  headerScoreChange: {
    width: '80px',
  },
  headerValidFrom: {
    width: '90px',
  },
  headerMV: {
    width: '100px',
  },
  headerJustification: {
    width: 'auto',
    minWidth: '300px',
  },
  cell: {
    fontSize: '11px',
    ...shorthands.padding('6px', '8px'),
    color: '#323130',
    ...shorthands.borderBottom('1px', 'solid', '#E1DFDD'),
    verticalAlign: 'top',
  },
  entityName: {
    fontWeight: '500',
    color: '#323130',
  },
  categoryCell: {
    color: '#605E5C',
  },
  scoreChangeCell: {
    textAlign: 'center',
  },
  scoreChangePositive: {
    color: '#C50F1F',
    fontWeight: '600',
  },
  scoreChangeNegative: {
    color: '#107C10',
    fontWeight: '600',
  },
  scoreChangeNeutral: {
    color: '#605E5C',
    fontWeight: '500',
  },
  mvCell: {
    textAlign: 'right',
    fontFamily: 'monospace',
    fontSize: '10px',
  },
  justificationCell: {
    fontSize: '10px',
    lineHeight: '1.4',
    color: '#605E5C',
    maxHeight: '60px',
    ...shorthands.overflow('hidden'),
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
  },
  dateCell: {
    fontSize: '10px',
    color: '#605E5C',
  },
  row: {
    ':hover': {
      backgroundColor: '#FAFAFA',
    },
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

interface ControversyDetailTableProps {
  maxRows?: number;
}

export const ControversyDetailTable: React.FC<ControversyDetailTableProps> = ({ maxRows = 50 }) => {
  const styles = useStyles();
  const filteredScores = useFilteredControversyScores();

  const tableData = useMemo(() => {
    return filteredScores.slice(0, maxRows).map((score) => ({
      id: score.id,
      entityName: score.entityName,
      category: score.category,
      score: score.score,
      previousScore: score.previousScore,
      scoreChange: score.scoreChange,
      validFrom: new Date(score.validFrom).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      marketValue: score.marketValue,
      justification: score.justification,
    }));
  }, [filteredScores, maxRows]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const getScoreChangeClass = (change: number) => {
    if (change > 0) return styles.scoreChangePositive;
    if (change < 0) return styles.scoreChangeNegative;
    return styles.scoreChangeNeutral;
  };

  const formatScoreChange = (prev: number, current: number) => {
    return `${prev} to ${current}`;
  };

  if (tableData.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>No controversy data available. Switch to Portfolio scenario.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <Table size="extra-small" className={styles.table}>
          <TableHeader>
            <TableRow>
              <TableHeaderCell className={`${styles.headerCell} ${styles.headerEntityName}`}>
                Entity Name
              </TableHeaderCell>
              <TableHeaderCell className={`${styles.headerCell} ${styles.headerCategory}`}>
                Category Name
              </TableHeaderCell>
              <TableHeaderCell className={`${styles.headerCell} ${styles.headerScoreChange}`}>
                Score Change
              </TableHeaderCell>
              <TableHeaderCell className={`${styles.headerCell} ${styles.headerValidFrom}`}>
                Valid From
              </TableHeaderCell>
              <TableHeaderCell className={`${styles.headerCell} ${styles.headerMV}`}>
                MV (USD)
              </TableHeaderCell>
              <TableHeaderCell className={`${styles.headerCell} ${styles.headerJustification}`}>
                Justification
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id} className={styles.row}>
                <TableCell className={styles.cell}>
                  <TableCellLayout truncate>
                    <span className={styles.entityName}>{row.entityName}</span>
                  </TableCellLayout>
                </TableCell>
                <TableCell className={`${styles.cell} ${styles.categoryCell}`}>
                  <TableCellLayout truncate>{row.category}</TableCellLayout>
                </TableCell>
                <TableCell className={`${styles.cell} ${styles.scoreChangeCell}`}>
                  <span className={getScoreChangeClass(row.scoreChange)}>
                    {formatScoreChange(row.previousScore, row.score)}
                  </span>
                </TableCell>
                <TableCell className={`${styles.cell} ${styles.dateCell}`}>
                  {row.validFrom}
                </TableCell>
                <TableCell className={`${styles.cell} ${styles.mvCell}`}>
                  {formatCurrency(row.marketValue)}
                </TableCell>
                <TableCell className={styles.cell}>
                  <div className={styles.justificationCell} title={row.justification}>
                    {row.justification}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
