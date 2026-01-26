import React, { useMemo } from 'react';
import { Dropdown, Option, useId, makeStyles, shorthands } from '@fluentui/react-components';
import { useStore } from '../store/useStore';

interface SlicerProps {
  dimension: 'Store' | 'Product' | 'Region' | 'Category';
  title?: string;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    height: '100%',
    ...shorthands.overflow('hidden'),
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#605E5C',
  },
});

export const Slicer: React.FC<SlicerProps> = ({ dimension, title }) => {
  const styles = useStyles();
  const dropdownId = useId('slicer-dropdown');
  
  // We use unfiltered lists to populate the slicer options, 
  // ensuring all options are available even when other filters are active.
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const setFilter = useStore((state) => state.setFilter);
  const activeFilters = useStore((state) => state.filters);

  // Get unique options for the selected dimension
  const options = useMemo(() => {
    let rawOptions: string[] = [];

    switch (dimension) {
      case 'Store':
        rawOptions = stores.map(s => s.name);
        break;
      case 'Region':
        rawOptions = Array.from(new Set(stores.map(s => s.region)));
        break;
      case 'Product':
        rawOptions = products.map(p => p.name);
        break;
      case 'Category':
        rawOptions = Array.from(new Set(products.map(p => p.category)));
        break;
    }

    return rawOptions.sort();
  }, [dimension, stores, products]);

  const handleSelect = (_: any, data: { optionValue: string | undefined }) => {
     // If the placeholder/clearing is handled or if we want a clear button,
     // Fluent UI Dropdown typically supports clearing via selection or a separate mechanism.
     // For this MVP, selecting a value sets the filter. 
     // We might need a way to clear it. For now, assuming standard behavior.
     setFilter(dimension, data.optionValue || null);
  };

  return (
    <div className={styles.container}>
      {title && <label className={styles.label} htmlFor={dropdownId}>{title}</label>}
      <Dropdown
        aria-labelledby={dropdownId}
        placeholder={`Select ${dimension}...`}
        value={activeFilters[dimension] || ''}
        onOptionSelect={handleSelect}
        clearable
      >
        {options.map((option) => (
          <Option key={option} value={option}>
            {option}
          </Option>
        ))}
      </Dropdown>
    </div>
  );
};
