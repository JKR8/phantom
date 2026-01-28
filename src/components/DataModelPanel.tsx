import React from 'react';
import { makeStyles, shorthands, Text, Tree, TreeItem, TreeItemLayout } from '@fluentui/react-components';
import {
  TableRegular,
  NumberSymbolRegular,
  TextFieldRegular,
  CalendarRegular
} from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { ScenarioFields, ScenarioType, SemanticField } from '../store/semanticLayer';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FAFAF9',
  },
  header: {
    ...shorthands.padding('12px'),
    borderBottom: '1px solid #E1DFDD',
    fontWeight: '600',
    fontSize: '11px',
    color: '#605E5C',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  scenarioLabel: {
    ...shorthands.padding('8px', '12px'),
    fontSize: '12px',
    color: '#252423',
    fontWeight: '500',
    backgroundColor: '#F3F2F1',
    borderBottom: '1px solid #E1DFDD',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    ...shorthands.padding('8px', '10px'),
  },
  tableIcon: {
    color: '#0078D4',
  },
  fieldIcon: {
    marginRight: '6px',
  },
  measureIcon: {
    color: '#107C10',
  },
  dimensionIcon: {
    color: '#5C2D91',
  },
  timeIcon: {
    color: '#D83B01',
  },
  treeText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  roleTag: {
    fontSize: '9px',
    color: '#605E5C',
    marginLeft: '4px',
    fontWeight: 'normal',
  },
});

function getFieldIcon(field: SemanticField, styles: ReturnType<typeof useStyles>) {
  if (field.role === 'Measure') {
    return <NumberSymbolRegular className={`${styles.fieldIcon} ${styles.measureIcon}`} fontSize={14} />;
  }
  if (field.role === 'Time') {
    return <CalendarRegular className={`${styles.fieldIcon} ${styles.timeIcon}`} fontSize={14} />;
  }
  return <TextFieldRegular className={`${styles.fieldIcon} ${styles.dimensionIcon}`} fontSize={14} />;
}

function groupFieldsByTable(fields: SemanticField[]): Record<string, SemanticField[]> {
  const tables: Record<string, SemanticField[]> = {
    Dimensions: [],
    Measures: [],
  };

  for (const field of fields) {
    if (field.role === 'Measure') {
      tables.Measures.push(field);
    } else {
      tables.Dimensions.push(field);
    }
  }

  return tables;
}

export const DataModelPanel: React.FC = () => {
  const styles = useStyles();
  const scenario = useStore((s) => s.scenario) as ScenarioType;
  const fields = ScenarioFields[scenario] || [];
  const groupedFields = groupFieldsByTable(fields);

  // Open both groups by default
  const defaultOpenItems = Object.keys(groupedFields).filter(k => groupedFields[k].length > 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>Data Model</div>
      <div className={styles.scenarioLabel}>Scenario: {scenario}</div>
      <div className={styles.content}>
        <Tree aria-label="Data model fields" defaultOpenItems={defaultOpenItems}>
          {Object.entries(groupedFields).map(([tableName, tableFields]) => (
            tableFields.length > 0 && (
              <TreeItem key={tableName} itemType="branch" value={tableName}>
                <TreeItemLayout iconBefore={<TableRegular className={styles.tableIcon} fontSize={16} />}>
                  <Text size={200} weight="semibold" className={styles.treeText}>
                    {tableName} ({tableFields.length})
                  </Text>
                </TreeItemLayout>
                <Tree>
                  {tableFields.map((field) => (
                    <TreeItem key={field.name} itemType="leaf">
                      <TreeItemLayout iconBefore={getFieldIcon(field, styles)}>
                        <Text size={200} className={styles.treeText}>
                          {field.name}
                          <span className={styles.roleTag}>{field.role}</span>
                        </Text>
                      </TreeItemLayout>
                    </TreeItem>
                  ))}
                </Tree>
              </TreeItem>
            )
          ))}
        </Tree>
      </div>
    </div>
  );
};
