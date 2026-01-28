import React, { useState } from 'react';
import {
  makeStyles,
  shorthands,
  Text,
  Dropdown,
  Option,
  Input,
  Button,
} from '@fluentui/react-components';
import {
  DiamondRegular,
  InfoRegular,
  OptionsRegular,
} from '@fluentui/react-icons';
const useStyles = makeStyles({
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    ...shorthands.padding('0px', '12px'),
    height: '100%',
    width: '100%',
    ...shorthands.borderRadius('4px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    boxSizing: 'border-box',
    ...shorthands.overflow('hidden'),
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  brandSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  icon: {
    color: '#D4A548',
    fontSize: '18px',
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
  },
  title: {
    color: '#1A1A2E',
    fontSize: '13px',
    fontWeight: '600',
    lineHeight: '1.1',
  },
  subtitle: {
    color: '#605E5C',
    fontSize: '9px',
    fontWeight: '400',
    lineHeight: '1.1',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  controlLabel: {
    fontSize: '10px',
    color: '#605E5C',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },
  dropdown: {
    minWidth: '110px',
    fontSize: '10px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dateSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  dateInput: {
    width: '80px',
    fontSize: '10px',
  },
  iconButton: {
    color: '#605E5C',
    minWidth: '24px',
    minHeight: '24px',
  },
});

export const PortfolioHeaderBar: React.FC = () => {
  const styles = useStyles();

  const [startDate, setStartDate] = useState('01/09/2023');
  const [endDate, setEndDate] = useState('22/12/2025');

  return (
    <div className={styles.headerBar}>
      {/* Left - Branding */}
      <div className={styles.leftSection}>
        <div className={styles.brandSection}>
          <DiamondRegular className={styles.icon} />
          <div className={styles.titleContainer}>
            <Text className={styles.title}>Portfolio Monitoring</Text>
            <Text className={styles.subtitle}>Portfolio Monitoring selected</Text>
          </div>
        </div>

        {/* Fund Selector */}
        <div className={styles.controlGroup}>
          <Text className={styles.controlLabel}>Fund:</Text>
          <Dropdown
            className={styles.dropdown}
            placeholder="Multiple selections"
            size="small"
          >
            <Option value="all">All Funds</Option>
            <Option value="fund1">Fund 1</Option>
            <Option value="fund2">Fund 2</Option>
          </Dropdown>
        </div>
      </div>

      {/* Right - Date + Icons + KPIs */}
      <div className={styles.rightSection}>
        {/* Event Date */}
        <div className={styles.dateSection}>
          <Text className={styles.controlLabel}>Events Date:</Text>
          <Input
            className={styles.dateInput}
            size="small"
            value={startDate}
            onChange={(_, data) => setStartDate(data.value)}
          />
          <Input
            className={styles.dateInput}
            size="small"
            value={endDate}
            onChange={(_, data) => setEndDate(data.value)}
          />
        </div>

        {/* Icons */}
        <Button
          className={styles.iconButton}
          appearance="subtle"
          icon={<InfoRegular />}
          size="small"
        />
        <Button
          className={styles.iconButton}
          appearance="subtle"
          icon={<OptionsRegular />}
          size="small"
        />
      </div>
    </div>
  );
};
