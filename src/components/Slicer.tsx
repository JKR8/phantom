import React, { useMemo } from 'react';
import { Dropdown, Option, useId, makeStyles, shorthands } from '@fluentui/react-components';
import { useStore } from '../store/useStore';

interface SlicerProps {
  dimension: string;
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
  const customers = useStore((state) => state.customers);
  const employees = useStore((state) => state.employees);
  const shipments = useStore((state) => state.shipments);
  const scenario = useStore((state) => state.scenario);
  
  const setFilter = useStore((state) => state.setFilter);
  const activeFilters = useStore((state) => state.filters);

  // Get unique options for the selected dimension
  const options = useMemo(() => {
    let rawOptions: string[] = [];

    // Retail
    if (scenario === 'Retail') {
        if (dimension === 'Store') rawOptions = stores.map(s => s.name);
        else if (dimension === 'Region') rawOptions = Array.from(new Set(stores.map(s => s.region)));
        else if (dimension === 'Product') rawOptions = products.map(p => p.name);
        else if (dimension === 'Category') rawOptions = Array.from(new Set(products.map(p => p.category)));
    } 
    // SaaS
    else if (scenario === 'SaaS') {
        if (dimension === 'Region') rawOptions = Array.from(new Set(customers.map(c => c.region)));
        else if (dimension === 'Tier' || dimension === 'tier') rawOptions = Array.from(new Set(customers.map(c => c.tier)));
    }
    // HR
    else if (scenario === 'HR') {
        if (dimension === 'Department') rawOptions = Array.from(new Set(employees.map(e => e.department)));
        else if (dimension === 'Role') rawOptions = Array.from(new Set(employees.map(e => e.role)));
    }
    // Logistics
    else if (scenario === 'Logistics') {
        if (dimension === 'Carrier' || dimension === 'carrier') rawOptions = Array.from(new Set(shipments.map(s => s.carrier)));
        else if (dimension === 'Status' || dimension === 'status') rawOptions = Array.from(new Set(shipments.map(s => s.status)));
        else if (dimension === 'Origin') rawOptions = Array.from(new Set(shipments.map(s => s.origin)));
        else if (dimension === 'Destination') rawOptions = Array.from(new Set(shipments.map(s => s.destination)));
    }

    if (rawOptions.length === 0) {
        // Fallback for generic property matching if not explicitly mapped above
         let source: any[] = [];
         if (scenario === 'Retail') source = stores.concat(products as any); // imperfect fallback
         else if (scenario === 'SaaS') source = customers;
         else if (scenario === 'HR') source = employees;
         else if (scenario === 'Logistics') source = shipments;

         const key = dimension.toLowerCase();
         // @ts-ignore
         const values = source.map(i => i[key] || i[dimension]).filter(v => v !== undefined);
         rawOptions = Array.from(new Set(values));
    }

    return rawOptions.sort();
  }, [dimension, stores, products, customers, employees, shipments, scenario]);

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
