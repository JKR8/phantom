import React from 'react';
import {
  makeStyles,
  shorthands,
  tokens,
  Dropdown,
  Option,
  Switch,
  Text,
  Divider,
} from '@fluentui/react-components';
import {
  DatabaseRegular,
  ArrowSyncRegular,
  TableRegular,
  LinkRegular,
} from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { DataModelSchemas, DataModelType } from '../store/semanticLayer';
import type { Scenario } from '../types';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: '#FAFAF9',
    ...shorthands.padding('12px'),
    ...shorthands.gap('16px'),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    ...shorthands.padding('4px', '0'),
  },
  headerIcon: {
    color: '#0078D4',
    fontSize: '20px',
  },
  headerText: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#323130',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  sectionLabel: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#605E5C',
  },
  dropdown: {
    width: '100%',
  },
  description: {
    fontSize: '11px',
    color: '#8A8886',
    lineHeight: '1.4',
    ...shorthands.padding('4px', '0'),
  },
  schemaPreview: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
    backgroundColor: '#fff',
    ...shorthands.borderRadius('6px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding('10px'),
  },
  schemaHeader: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    fontSize: '12px',
    fontWeight: '500',
    color: '#323130',
  },
  tableList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('6px'),
  },
  tableItem: {
    display: 'flex',
    alignItems: 'flex-start',
    ...shorthands.gap('6px'),
    fontSize: '11px',
    color: '#605E5C',
  },
  tableIcon: {
    color: '#0078D4',
    fontSize: '12px',
    marginTop: '2px',
  },
  tableName: {
    fontWeight: '500',
    color: '#323130',
  },
  tableFields: {
    color: '#8A8886',
  },
  relationships: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
    ...shorthands.padding('8px', '0', '0'),
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  relationshipItem: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('4px'),
    fontSize: '10px',
    color: '#8A8886',
  },
  relationshipIcon: {
    fontSize: '10px',
    color: '#8A8886',
  },
  crossFilterSection: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('6px'),
    backgroundColor: '#fff',
    ...shorthands.borderRadius('6px'),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    ...shorthands.padding('10px'),
  },
  crossFilterHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  crossFilterLabel: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('6px'),
    fontSize: '12px',
    fontWeight: '500',
    color: '#323130',
  },
  crossFilterIcon: {
    color: '#107C10',
    fontSize: '14px',
  },
  crossFilterDescription: {
    fontSize: '10px',
    color: '#8A8886',
    lineHeight: '1.4',
  },
});

const DATA_MODEL_OPTIONS: DataModelType[] = ['Retail', 'SaaS', 'HR'];

export const DataModelPane: React.FC = () => {
  const styles = useStyles();
  const scenario = useStore((s) => s.scenario);
  const setScenario = useStore((s) => s.setScenario);
  const crossFilterEnabled = useStore((s) => s.crossFilterEnabled);
  const setCrossFilterEnabled = useStore((s) => s.setCrossFilterEnabled);

  // Map current scenario to data model (only show dropdown if in one of the 3 core models)
  const currentModel = DATA_MODEL_OPTIONS.includes(scenario as DataModelType)
    ? (scenario as DataModelType)
    : 'Retail';

  const schema = DataModelSchemas[currentModel];

  const handleModelChange = (_: unknown, data: { optionValue?: string }) => {
    if (data.optionValue && DATA_MODEL_OPTIONS.includes(data.optionValue as DataModelType)) {
      setScenario(data.optionValue as Scenario);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <DatabaseRegular className={styles.headerIcon} />
        <Text className={styles.headerText}>Data Model</Text>
      </div>

      <div className={styles.section}>
        <Text className={styles.sectionLabel}>Select Model</Text>
        <Dropdown
          className={styles.dropdown}
          value={currentModel}
          selectedOptions={[currentModel]}
          onOptionSelect={handleModelChange}
        >
          {DATA_MODEL_OPTIONS.map((model) => (
            <Option key={model} value={model}>
              {DataModelSchemas[model].name}
            </Option>
          ))}
        </Dropdown>
        <Text className={styles.description}>{schema.description}</Text>
      </div>

      <Divider />

      <div className={styles.section}>
        <Text className={styles.sectionLabel}>Schema</Text>
        <div className={styles.schemaPreview}>
          <div className={styles.schemaHeader}>
            <TableRegular />
            Tables
          </div>
          <div className={styles.tableList}>
            {schema.tables.map((table) => (
              <div key={table.name} className={styles.tableItem}>
                <TableRegular className={styles.tableIcon} />
                <div>
                  <span className={styles.tableName}>{table.name}</span>
                  <span className={styles.tableFields}>
                    {' '}({table.fields.join(', ')})
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.relationships}>
            <div className={styles.schemaHeader}>
              <LinkRegular />
              Relationships
            </div>
            {schema.relationships.map((rel, i) => (
              <div key={i} className={styles.relationshipItem}>
                <LinkRegular className={styles.relationshipIcon} />
                <span>{rel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Divider />

      <div className={styles.crossFilterSection}>
        <div className={styles.crossFilterHeader}>
          <div className={styles.crossFilterLabel}>
            <ArrowSyncRegular className={styles.crossFilterIcon} />
            Cross-filtering
          </div>
          <Switch
            checked={crossFilterEnabled}
            onChange={(_, data) => setCrossFilterEnabled(data.checked)}
          />
        </div>
        <Text className={styles.crossFilterDescription}>
          {crossFilterEnabled
            ? 'Clicking a chart element filters all other charts to show related data.'
            : 'Charts display independently without click-based filtering.'}
        </Text>
      </div>
    </div>
  );
};
