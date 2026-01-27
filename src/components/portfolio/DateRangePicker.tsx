import React, { useState } from 'react';
import { makeStyles, shorthands, Text, Input } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    ...shorthands.padding('8px', '12px'),
    height: '100%',
    backgroundColor: 'white',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#605E5C',
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dateInput: {
    fontSize: '11px',
    minWidth: '90px',
    maxWidth: '100px',
  },
  separator: {
    fontSize: '11px',
    color: '#605E5C',
  },
});

interface DateRangePickerProps {
  title?: string;
  startDate?: string;
  endDate?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  title = 'Event Date',
  startDate = '1/1/2023',
  endDate = '12/31/2023',
}) => {
  const styles = useStyles();
  const [start, setStart] = useState(startDate);
  const [end, setEnd] = useState(endDate);

  return (
    <div className={styles.container}>
      <Text className={styles.label}>{title}</Text>
      <div className={styles.dateRow}>
        <Input
          className={styles.dateInput}
          size="small"
          value={start}
          onChange={(_, data) => setStart(data.value)}
        />
        <Text className={styles.separator}>-</Text>
        <Input
          className={styles.dateInput}
          size="small"
          value={end}
          onChange={(_, data) => setEnd(data.value)}
        />
      </div>
    </div>
  );
};
