import React, { useState, useMemo } from 'react';
import {
  makeStyles,
  shorthands,
  Text,
  Tab,
  TabList,
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
    backgroundColor: 'white',
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.overflow('hidden'),
  },
  tabsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shorthands.padding('4px', '12px'),
    ...shorthands.borderBottom('1px', 'solid', '#E1DFDD'),
    backgroundColor: '#FAFAFA',
  },
  tabList: {
    minHeight: '32px',
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    ...shorthands.overflow('hidden'),
  },
  leftPanel: {
    flex: '0 0 45%',
    ...shorthands.borderRight('1px', 'solid', '#E1DFDD'),
    ...shorthands.overflow('auto'),
  },
  middlePanel: {
    flex: '0 0 40%',
    ...shorthands.padding('12px'),
    ...shorthands.borderRight('1px', 'solid', '#E1DFDD'),
    ...shorthands.overflow('auto'),
    backgroundColor: '#FAFAFA',
  },
  rightPanel: {
    flex: '0 0 15%',
    ...shorthands.padding('8px'),
    ...shorthands.overflow('auto'),
  },
  table: {
    fontSize: '10px',
    width: '100%',
  },
  headerCell: {
    fontWeight: '600',
    fontSize: '9px',
    backgroundColor: '#F3F2F1',
    color: '#323130',
    ...shorthands.padding('6px', '8px'),
    textTransform: 'uppercase',
  },
  cell: {
    fontSize: '10px',
    ...shorthands.padding('4px', '8px'),
    color: '#323130',
    ...shorthands.borderBottom('1px', 'solid', '#E1DFDD'),
  },
  selectedRow: {
    backgroundColor: '#FFF4E5',
  },
  clickableRow: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#F5F5F5',
    },
  },
  scoreChangeUp: {
    color: '#C50F1F',
    fontWeight: '600',
  },
  scoreChangeDown: {
    color: '#107C10',
    fontWeight: '600',
  },
  scoreChangeNeutral: {
    color: '#605E5C',
  },
  justificationTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '8px',
  },
  justificationText: {
    fontSize: '11px',
    color: '#323130',
    lineHeight: '1.5',
  },
  rightPanelTitle: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '8px',
  },
  rightPanelItem: {
    fontSize: '10px',
    color: '#605E5C',
    marginBottom: '4px',
  },
  rightPanelValue: {
    fontSize: '10px',
    color: '#323130',
    fontWeight: '500',
  },
  mvLatestDate: {
    fontSize: '9px',
    color: '#605E5C',
    ...shorthands.padding('4px', '12px'),
    ...shorthands.borderTop('1px', 'solid', '#E1DFDD'),
    textAlign: 'right',
  },
  emptyState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#605E5C',
    fontSize: '12px',
    fontStyle: 'italic',
    ...shorthands.padding('20px'),
    textAlign: 'center',
  },
  tabCount: {
    fontSize: '9px',
    color: '#605E5C',
    marginLeft: '4px',
  },
});

// Tab configuration - defines what each tab filters/displays
const TAB_CONFIG: Record<string, { label: string; categories: string[]; emptyMessage: string }> = {
  controversy: {
    label: 'Controversy',
    categories: ['Environmental', 'Social', 'Governance', 'Business Ethics', 'Human Rights'],
    emptyMessage: 'No controversy data matching current filters.',
  },
  gss: {
    label: 'GSS',
    categories: ['Global Standards', 'UN Global Compact', 'OECD Guidelines', 'ILO Standards'],
    emptyMessage: 'No GSS (Global Standards Screening) data available.',
  },
  weapons: {
    label: 'Weapons',
    categories: ['Controversial Weapons', 'Nuclear Weapons', 'Cluster Munitions', 'Anti-Personnel Mines'],
    emptyMessage: 'No weapons-related data available.',
  },
  ngo: {
    label: 'NGO',
    categories: ['NGO Campaigns', 'Activist Pressure', 'Media Controversies', 'Public Scrutiny'],
    emptyMessage: 'No NGO-related data available.',
  },
};

export const ControversyBottomPanel: React.FC = () => {
  const styles = useStyles();
  const filteredScores = useFilteredControversyScores();
  const [selectedTab, setSelectedTab] = useState('controversy');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // Filter data based on selected tab
  const tabFilteredScores = useMemo(() => {
    const tabConfig = TAB_CONFIG[selectedTab];
    if (!tabConfig) return filteredScores;

    // For controversy tab, show all data (it's the main view)
    if (selectedTab === 'controversy') {
      return filteredScores;
    }

    // For other tabs, filter by matching categories
    return filteredScores.filter(score =>
      tabConfig.categories.some(cat =>
        score.category.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(score.category.toLowerCase())
      )
    );
  }, [filteredScores, selectedTab]);

  const tableData = useMemo(() => {
    return tabFilteredScores.slice(0, 50).map((score) => ({
      id: score.id,
      entityName: score.entityName,
      category: score.category,
      score: score.score,
      previousScore: score.previousScore,
      scoreChange: score.scoreChange,
      validFrom: new Date(score.validFrom).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      marketValue: score.marketValue,
      justification: score.justification,
    }));
  }, [tabFilteredScores]);

  const selectedRow = tableData.find(row => row.id === selectedRowId) || tableData[0];

  // Reset selection when tab changes
  const handleTabChange = (_: any, data: { value: unknown }) => {
    setSelectedTab(data.value as string);
    setSelectedRowId(null);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`;
    }
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const formatScoreChange = (prev: number, current: number, change: number) => {
    const arrow = change > 0 ? '▲' : change < 0 ? '▼' : '◀';
    return { display: `${current} ${arrow} From: ${prev}`, change };
  };

  return (
    <div className={styles.container}>
      {/* Tab Header */}
      <div className={styles.tabsHeader}>
        <TabList
          className={styles.tabList}
          selectedValue={selectedTab}
          onTabSelect={handleTabChange}
          size="small"
        >
          <Tab value="controversy">Controversy ({filteredScores.length})</Tab>
          <Tab value="gss">GSS</Tab>
          <Tab value="weapons">Weapons</Tab>
          <Tab value="ngo">NGO</Tab>
        </TabList>
      </div>

      {/* Content Area - 3 Panels */}
      <div className={styles.contentArea}>
        {/* Left Panel - Table */}
        <div className={styles.leftPanel}>
          {tableData.length === 0 ? (
            <div className={styles.emptyState}>
              {TAB_CONFIG[selectedTab]?.emptyMessage || 'No data available.'}
            </div>
          ) : (
            <Table size="extra-small" className={styles.table}>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell className={styles.headerCell}>Entity Name</TableHeaderCell>
                  <TableHeaderCell className={styles.headerCell}>Category Name</TableHeaderCell>
                  <TableHeaderCell className={styles.headerCell}>Score Change</TableHeaderCell>
                  <TableHeaderCell className={styles.headerCell}>Valid From</TableHeaderCell>
                  <TableHeaderCell className={styles.headerCell}>MV (AUD$)</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => {
                  const scoreInfo = formatScoreChange(row.previousScore, row.score, row.scoreChange);
                  const isSelected = row.id === selectedRowId || (!selectedRowId && row.id === tableData[0]?.id);
                  return (
                    <TableRow
                      key={row.id}
                      className={`${styles.clickableRow} ${isSelected ? styles.selectedRow : ''}`}
                      onClick={() => setSelectedRowId(row.id)}
                    >
                      <TableCell className={styles.cell}>
                        <TableCellLayout truncate>{row.entityName}</TableCellLayout>
                      </TableCell>
                      <TableCell className={styles.cell}>
                        <TableCellLayout truncate>{row.category}</TableCellLayout>
                      </TableCell>
                      <TableCell className={styles.cell}>
                        <span className={
                          scoreInfo.change > 0 ? styles.scoreChangeUp :
                          scoreInfo.change < 0 ? styles.scoreChangeDown :
                          styles.scoreChangeNeutral
                        }>
                          {scoreInfo.display}
                        </span>
                      </TableCell>
                      <TableCell className={styles.cell}>{row.validFrom}</TableCell>
                      <TableCell className={styles.cell}>{formatCurrency(row.marketValue)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Middle Panel - Justification */}
        <div className={styles.middlePanel}>
          <Text className={styles.justificationTitle} block>Justification</Text>
          <div style={{ marginTop: '8px' }}>
            <Text className={styles.justificationText}>
              {selectedRow?.justification || 'Select a row to view justification.'}
            </Text>
          </div>
        </div>

        {/* Right Panel - Selected Entity */}
        <div className={styles.rightPanel}>
          <Text className={styles.rightPanelTitle}>Selected Entity</Text>
          <Table size="extra-small" className={styles.table}>
            <TableHeader>
              <TableRow>
                <TableHeaderCell className={styles.headerCell}>Entity Name</TableHeaderCell>
                <TableHeaderCell className={styles.headerCell}>Valid From</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedRow && (
                <TableRow>
                  <TableCell className={styles.cell}>
                    <TableCellLayout truncate>{selectedRow.entityName}</TableCellLayout>
                  </TableCell>
                  <TableCell className={styles.cell}>{selectedRow.validFrom}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MV Latest Date */}
      <div className={styles.mvLatestDate}>
        MV Latest Date: 19/12/2025
      </div>
    </div>
  );
};
