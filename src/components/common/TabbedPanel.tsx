import React, { useState, ReactNode } from 'react';
import {
  makeStyles,
  shorthands,
  Tab,
  TabList,
} from '@fluentui/react-components';

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
    ...shorthands.overflow('hidden'),
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
});

export interface TabConfig {
  id: string;
  label: string;
  badge?: number | string;
}

interface TabbedPanelProps {
  tabs: TabConfig[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  children: (selectedTab: string) => ReactNode;
  headerExtra?: ReactNode;
}

/**
 * Reusable tabbed panel component.
 * Use this pattern for creating tabbed interfaces in dashboards.
 *
 * @example
 * <TabbedPanel
 *   tabs={[
 *     { id: 'overview', label: 'Overview', badge: 42 },
 *     { id: 'details', label: 'Details' },
 *   ]}
 *   defaultTab="overview"
 *   onTabChange={(tabId) => console.log('Tab changed:', tabId)}
 * >
 *   {(selectedTab) => (
 *     selectedTab === 'overview' ? <OverviewContent /> : <DetailsContent />
 *   )}
 * </TabbedPanel>
 */
export const TabbedPanel: React.FC<TabbedPanelProps> = ({
  tabs,
  defaultTab,
  onTabChange,
  children,
  headerExtra,
}) => {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = useState(defaultTab || tabs[0]?.id || '');

  const handleTabChange = (_: any, data: { value: unknown }) => {
    const newTab = data.value as string;
    setSelectedTab(newTab);
    onTabChange?.(newTab);
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabsHeader}>
        <TabList
          className={styles.tabList}
          selectedValue={selectedTab}
          onTabSelect={handleTabChange}
          size="small"
        >
          {tabs.map((tab) => (
            <Tab key={tab.id} value={tab.id}>
              {tab.label}
              {tab.badge !== undefined && ` (${tab.badge})`}
            </Tab>
          ))}
        </TabList>
        {headerExtra}
      </div>
      <div className={styles.contentArea}>
        {children(selectedTab)}
      </div>
    </div>
  );
};

/**
 * Empty state component for tabs with no data
 */
export const TabEmptyState: React.FC<{ message: string }> = ({ message }) => {
  const styles = useStyles();
  return <div className={styles.emptyState}>{message}</div>;
};
