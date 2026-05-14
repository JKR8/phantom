import React, { useMemo } from 'react';
import { Dropdown, Option, useId, makeStyles, shorthands } from '@fluentui/react-components';
import { useStore } from '../store/useStore';
import { normalizeDimensionName, ScenarioType } from '../store/semanticLayer';

interface SlicerProps {
  dimension: string;
  title?: string;
}

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    ...shorthands.padding('6px', '8px'),
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    ...shorthands.overflow('hidden'),
    boxSizing: 'border-box',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#323130',
    lineHeight: '1.2',
    ...shorthands.overflow('hidden'),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropdown: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
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
  const socialPosts = useStore((state) => state.socialPosts);
  const scenario = useStore((state) => state.scenario);
  
  const setFilter = useStore((state) => state.setFilter);
  const activeFilters = useStore((state) => state.filters);
  const filterDimension = normalizeDimensionName(scenario as ScenarioType, dimension) || dimension;

  // Get unique options for the selected dimension
  const options = useMemo(() => {
    let rawOptions: string[] = [];
    const normalizedDimension = normalizeDimensionName(scenario as ScenarioType, dimension) || dimension;

    // Retail
    if (scenario === 'Retail') {
        if (normalizedDimension === 'store_name') rawOptions = stores.map(s => s.name);
        else if (normalizedDimension === 'region') rawOptions = Array.from(new Set(stores.map(s => s.region)));
        else if (normalizedDimension === 'product_name') rawOptions = products.map(p => p.name);
        else if (normalizedDimension === 'category') rawOptions = Array.from(new Set(products.map(p => p.category)));
        else if (normalizedDimension === 'date') {
          const sales = useStore.getState().sales;
          rawOptions = Array.from(new Set(sales.map(s => {
            const d = new Date(s.date as any);
            if (Number.isNaN(d.getTime())) return null;
            return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
          }).filter(Boolean) as string[]));
        }
    } 
    // SaaS
    else if (scenario === 'SaaS') {
        if (normalizedDimension === 'region') rawOptions = Array.from(new Set(customers.map(c => c.region)));
        else if (normalizedDimension === 'tier') rawOptions = Array.from(new Set(customers.map(c => c.tier)));
        else if (normalizedDimension === 'industry') rawOptions = Array.from(new Set(customers.map(c => c.industry)));
        else if (normalizedDimension === 'name') rawOptions = Array.from(new Set(customers.map(c => c.name)));
    }
    // HR
    else if (scenario === 'HR') {
        if (normalizedDimension === 'department') rawOptions = Array.from(new Set(employees.map(e => e.department)));
        else if (normalizedDimension === 'role') rawOptions = Array.from(new Set(employees.map(e => e.role)));
        else if (normalizedDimension === 'office') rawOptions = Array.from(new Set(employees.map(e => e.office)));
        else if (normalizedDimension === 'name') rawOptions = Array.from(new Set(employees.map(e => e.name)));
    }
    // Logistics
    else if (scenario === 'Logistics') {
        if (normalizedDimension === 'carrier') rawOptions = Array.from(new Set(shipments.map(s => s.carrier)));
        else if (normalizedDimension === 'status') rawOptions = Array.from(new Set(shipments.map(s => s.status)));
        else if (normalizedDimension === 'origin') rawOptions = Array.from(new Set(shipments.map(s => s.origin)));
        else if (normalizedDimension === 'destination') rawOptions = Array.from(new Set(shipments.map(s => s.destination)));
    }
    // Social
    else if (scenario === 'Social') {
        if (normalizedDimension === 'platform') rawOptions = Array.from(new Set(socialPosts.map(p => p.platform)));
        else if (normalizedDimension === 'sentiment') rawOptions = Array.from(new Set(socialPosts.map(p => p.sentiment)));
        else if (normalizedDimension === 'location') rawOptions = Array.from(new Set(socialPosts.map(p => p.location)));
        else if (normalizedDimension === 'user') rawOptions = Array.from(new Set(socialPosts.map(p => p.user)));
    }
    // Finance
    else if (scenario === 'Finance') {
        const financeRecords = useStore.getState().financeRecords;
        if (normalizedDimension === 'account') rawOptions = Array.from(new Set(financeRecords.map(r => r.account)));
        else if (normalizedDimension === 'region') rawOptions = Array.from(new Set(financeRecords.map(r => r.region)));
        else if (normalizedDimension === 'businessUnit') rawOptions = Array.from(new Set(financeRecords.map(r => r.businessUnit)));
        else if (normalizedDimension === 'scenario') rawOptions = Array.from(new Set(financeRecords.map(r => r.scenario)));
    }
    // Portfolio
    else if (scenario === 'Portfolio') {
        const portfolioEntities = useStore.getState().portfolioEntities;
        const controversyScores = useStore.getState().controversyScores;
        if (normalizedDimension === 'region') rawOptions = Array.from(new Set(portfolioEntities.map(e => e.region)));
        else if (normalizedDimension === 'sector') rawOptions = Array.from(new Set(portfolioEntities.map(e => e.sector)));
        else if (normalizedDimension === 'entityName') rawOptions = Array.from(new Set(portfolioEntities.map(e => e.name)));
        else if (normalizedDimension === 'source') rawOptions = Array.from(new Set(portfolioEntities.map(e => e.source)));
        else if (normalizedDimension === 'category') rawOptions = Array.from(new Set(controversyScores.map(c => c.category)));
        else if (dimension === 'Score') rawOptions = ['1', '2', '3', '4', '5'];
        else if (dimension === 'ChangeDirection') rawOptions = ['Increase', 'Decrease', 'No Change'];
        else if (normalizedDimension === 'group') rawOptions = Array.from(new Set(controversyScores.map(c => c.group)));
    }

    if (rawOptions.length === 0) {
        // Fallback for generic property matching if not explicitly mapped above
         let source: any[] = [];
         if (scenario === 'Retail') source = stores.concat(products as any); // imperfect fallback
         else if (scenario === 'SaaS') source = customers;
         else if (scenario === 'HR') source = employees;
         else if (scenario === 'Logistics') source = shipments;
         else if (scenario === 'Social') source = socialPosts;
         else if (scenario === 'Finance') source = useStore.getState().financeRecords;

         const key = normalizedDimension.toLowerCase();
          // @ts-ignore
         const values = source.map(i => i[key] || i[normalizedDimension] || i[dimension]).filter(v => v !== undefined);
         rawOptions = Array.from(new Set(values));
    }

    return rawOptions.sort();
  }, [dimension, stores, products, customers, employees, shipments, socialPosts, scenario]);

  const handleSelect = (_: any, data: { optionValue: string | undefined }) => {
     // If the placeholder/clearing is handled or if we want a clear button,
     // Fluent UI Dropdown typically supports clearing via selection or a separate mechanism.
     // For this MVP, selecting a value sets the filter. 
     // We might need a way to clear it. For now, assuming standard behavior.
     setFilter(filterDimension, data.optionValue || null);
  };

  return (
    <div className={styles.container}>
      {title && <label className={styles.label} htmlFor={dropdownId}>{title}</label>}
      <Dropdown
        aria-labelledby={dropdownId}
        placeholder="All"
        value={activeFilters[filterDimension] || activeFilters[dimension] || ''}
        onOptionSelect={handleSelect}
        clearable
        size="small"
        className={styles.dropdown}
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
