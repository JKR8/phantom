import React, { useState } from 'react';
import {
  makeStyles,
  shorthands,
  Input,
} from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';
import { useStore } from '../../store/useStore';

const useStyles = makeStyles({
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    ...shorthands.padding('4px', '6px'),
    boxSizing: 'border-box',
    ...shorthands.overflow('hidden'),
  },
  searchInput: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
  },
});

export const JustificationSearch: React.FC = () => {
  const styles = useStyles();
  const setFilter = useStore((state) => state.setFilter);
  const filters = useStore((state) => state.filters);
  const [searchValue, setSearchValue] = useState(filters['JustificationSearch'] || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setFilter('JustificationSearch', value || null);
  };

  return (
    <div className={styles.container}>
      <Input
        className={styles.searchInput}
        placeholder="Search..."
        value={searchValue}
        onChange={handleSearchChange}
        contentBefore={<SearchRegular />}
        size="small"
      />
    </div>
  );
};
