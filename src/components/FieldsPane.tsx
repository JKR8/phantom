import React from 'react';
import { makeStyles, shorthands, Text, Tree, TreeItem, TreeItemLayout } from '@fluentui/react-components';
import {
  TableRegular,
  NumberSymbolRegular,
  TextFieldRegular,
  CalendarRegular
} from '@fluentui/react-icons';
import { ColorPicker } from './ColorPicker';

const useStyles = makeStyles({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F3F2F1',
  },
  header: {
    ...shorthands.padding('12px'),
    borderBottom: '1px solid #E1DFDD',
    fontWeight: '600',
    fontSize: '12px',
    color: '#323130',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    ...shorthands.padding('8px'),
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
});

const fields = {
  Stores: [
    { name: 'Store Name', type: 'text' },
    { name: 'Region', type: 'text' },
    { name: 'Country', type: 'text' },
  ],
  Products: [
    { name: 'Product Name', type: 'text' },
    { name: 'Category', type: 'text' },
    { name: 'Price', type: 'number' },
  ],
  Sales: [
    { name: 'Date', type: 'date' },
    { name: 'Quantity', type: 'number' },
    { name: 'Revenue', type: 'number' },
    { name: 'Profit', type: 'number' },
  ],
};

const getFieldIcon = (type: string, styles: ReturnType<typeof useStyles>) => {
  switch (type) {
    case 'number':
      return <NumberSymbolRegular className={`${styles.fieldIcon} ${styles.measureIcon}`} fontSize={14} />;
    case 'date':
      return <CalendarRegular className={`${styles.fieldIcon} ${styles.dimensionIcon}`} fontSize={14} />;
    default:
      return <TextFieldRegular className={`${styles.fieldIcon} ${styles.dimensionIcon}`} fontSize={14} />;
  }
};

export const FieldsPane: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <ColorPicker />
      <div className={styles.header}>Fields</div>
      <div className={styles.content}>
        <Tree aria-label="Data fields">
          {Object.entries(fields).map(([table, tableFields]) => (
            <TreeItem key={table} itemType="branch">
              <TreeItemLayout iconBefore={<TableRegular className={styles.tableIcon} fontSize={16} />}>
                <Text size={200} weight="semibold">{table}</Text>
              </TreeItemLayout>
              <Tree>
                {tableFields.map((field) => (
                  <TreeItem key={field.name} itemType="leaf">
                    <TreeItemLayout iconBefore={getFieldIcon(field.type, styles)}>
                      <Text size={200}>{field.name}</Text>
                    </TreeItemLayout>
                  </TreeItem>
                ))}
              </Tree>
            </TreeItem>
          ))}
        </Tree>
      </div>
    </div>
  );
};
