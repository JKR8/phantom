import React, { useCallback } from 'react';
import {
  makeStyles,
  shorthands,
  Text,
  Input,
  Button,
  Radio,
  RadioGroup,
  Label,
  Select,
  Divider,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular } from '@fluentui/react-icons';
import { useStore } from '../store/useStore';

const useStyles = makeStyles({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...shorthands.padding('12px'),
    gap: '12px',
    overflowY: 'auto',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#605E5C',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#323130',
    fontWeight: '500',
  },
  typeLabel: {
    fontSize: '12px',
    color: '#605E5C',
  },
  dataRow: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  dataInput: {
    flex: 1,
    minWidth: 0,
  },
  dataValueInput: {
    width: '70px',
    flexShrink: 0,
  },
  addButton: {
    alignSelf: 'flex-start',
  },
  noSelection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#A19F9D',
    fontSize: '12px',
  },
});

const DIMENSION_OPTIONS = ['Region', 'Category', 'Store', 'Product', 'Tier', 'Department', 'Carrier', 'Status'];
const METRIC_OPTIONS = ['revenue', 'profit', 'quantity', 'mrr', 'ltv', 'salary', 'rating', 'cost', 'weight'];
const OPERATION_OPTIONS = ['sum', 'avg', 'count', 'min', 'max'];

const VISUAL_TYPE_LABELS: Record<string, string> = {
  bar: 'Clustered Bar Chart',
  column: 'Clustered Column Chart',
  stackedBar: 'Stacked Bar Chart',
  stackedColumn: 'Stacked Column Chart',
  line: 'Line Chart',
  area: 'Area Chart',
  scatter: 'Scatter Chart',
  pie: 'Pie Chart',
  donut: 'Donut Chart',
  funnel: 'Funnel Chart',
  treemap: 'Treemap',
  gauge: 'Gauge',
  card: 'KPI Card',
  multiRowCard: 'Multi-row Card',
  table: 'Data Table',
  matrix: 'Matrix',
  waterfall: 'Waterfall Chart',
  slicer: 'Slicer',
};

export const PropertiesPanel: React.FC = () => {
  const styles = useStyles();
  const selectedItemId = useStore((s) => s.selectedItemId);
  const items = useStore((s) => s.items);
  const updateItemProps = useStore((s) => s.updateItemProps);
  const updateItemTitle = useStore((s) => s.updateItemTitle);

  const item = items.find((i) => i.id === selectedItemId);

  const onPropChange = useCallback(
    (key: string, value: any) => {
      if (selectedItemId) updateItemProps(selectedItemId, { [key]: value });
    },
    [selectedItemId, updateItemProps]
  );

  const onTitleChange = useCallback(
    (title: string) => {
      if (selectedItemId) updateItemTitle(selectedItemId, title);
    },
    [selectedItemId, updateItemTitle]
  );

  if (!item) {
    return <div className={styles.noSelection}>Select a visual to edit</div>;
  }

  const props = item.props || {};
  const type = item.type;
  const manualData: Array<{ label: string; value: number }> = props.manualData || [];
  const dataSource = props.manualData ? 'manual' : 'auto';

  const setDataSource = (source: string) => {
    if (source === 'manual') {
      onPropChange('manualData', manualData.length > 0 ? manualData : [{ label: 'Item 1', value: 100 }]);
    } else {
      onPropChange('manualData', undefined);
    }
  };

  const updateManualRow = (index: number, field: 'label' | 'value', val: string) => {
    const updated = [...manualData];
    if (field === 'label') {
      updated[index] = { ...updated[index], label: val };
    } else {
      updated[index] = { ...updated[index], value: Number(val) || 0 };
    }
    onPropChange('manualData', updated);
  };

  const addManualRow = () => {
    onPropChange('manualData', [...manualData, { label: `Item ${manualData.length + 1}`, value: 0 }]);
  };

  const removeManualRow = (index: number) => {
    const updated = manualData.filter((_, i) => i !== index);
    onPropChange('manualData', updated.length > 0 ? updated : undefined);
  };

  // Determine which fields to show based on visual type
  const showDimension = ['bar', 'column', 'stackedBar', 'stackedColumn', 'pie', 'donut', 'treemap', 'funnel', 'waterfall', 'slicer'].includes(type);
  const showMetric = ['bar', 'column', 'stackedBar', 'stackedColumn', 'line', 'area', 'pie', 'donut', 'treemap', 'funnel', 'waterfall', 'card', 'gauge'].includes(type);
  const showScatterMetrics = type === 'scatter';
  const showOperation = type === 'card';
  const showCardLabel = type === 'card';
  const showTarget = type === 'gauge';
  const showMaxRows = type === 'table';
  const showManualData = ['bar', 'column', 'stackedBar', 'stackedColumn', 'line', 'area', 'pie', 'donut', 'treemap', 'funnel', 'waterfall'].includes(type);

  return (
    <div className={styles.panel}>
      {/* Header */}
      <Text className={styles.sectionHeader}>Properties</Text>

      {/* Title */}
      <div className={styles.section}>
        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Title</Label>
          <Input
            size="small"
            value={item.title}
            onChange={(_, d) => onTitleChange(d.value)}
          />
        </div>
        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Type</Label>
          <Text className={styles.typeLabel}>{VISUAL_TYPE_LABELS[type] || type}</Text>
        </div>
      </div>

      <Divider />

      {/* Data Source (for charts that support manual data) */}
      {showManualData && (
        <>
          <div className={styles.section}>
            <Text className={styles.sectionHeader}>Data Source</Text>
            <RadioGroup
              value={dataSource}
              onChange={(_, d) => setDataSource(d.value)}
            >
              <Radio value="auto" label="Auto (scenario)" />
              <Radio value="manual" label="Manual" />
            </RadioGroup>
          </div>

          {/* Manual Data Editor */}
          {dataSource === 'manual' && (
            <div className={styles.section}>
              <Text className={styles.sectionHeader}>Manual Data</Text>
              <div className={styles.dataRow}>
                <Text className={styles.fieldLabel} style={{ flex: 1 }}>Label</Text>
                <Text className={styles.fieldLabel} style={{ width: '70px' }}>Value</Text>
                <div style={{ width: '24px' }} />
              </div>
              {manualData.map((row, i) => (
                <div key={i} className={styles.dataRow}>
                  <Input
                    size="small"
                    className={styles.dataInput}
                    value={row.label}
                    onChange={(_, d) => updateManualRow(i, 'label', d.value)}
                  />
                  <Input
                    size="small"
                    className={styles.dataValueInput}
                    type="number"
                    value={String(row.value)}
                    onChange={(_, d) => updateManualRow(i, 'value', d.value)}
                  />
                  <Button
                    appearance="subtle"
                    icon={<DeleteRegular />}
                    size="small"
                    onClick={() => removeManualRow(i)}
                  />
                </div>
              ))}
              <Button
                appearance="subtle"
                icon={<AddRegular />}
                size="small"
                className={styles.addButton}
                onClick={addManualRow}
              >
                Add Row
              </Button>
            </div>
          )}

          <Divider />
        </>
      )}

      {/* Settings */}
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Settings</Text>

        {showDimension && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Dimension</Label>
            <Select
              size="small"
              value={props.dimension || ''}
              onChange={(_, d) => onPropChange('dimension', d.value)}
            >
              {DIMENSION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </div>
        )}

        {showMetric && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Metric</Label>
            <Select
              size="small"
              value={props.metric || ''}
              onChange={(_, d) => onPropChange('metric', d.value)}
            >
              {METRIC_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </div>
        )}

        {showScatterMetrics && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>X Metric</Label>
              <Select
                size="small"
                value={props.xMetric || ''}
                onChange={(_, d) => onPropChange('xMetric', d.value)}
              >
                {METRIC_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Y Metric</Label>
              <Select
                size="small"
                value={props.yMetric || ''}
                onChange={(_, d) => onPropChange('yMetric', d.value)}
              >
                {METRIC_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
            </div>
          </>
        )}

        {showOperation && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Operation</Label>
            <Select
              size="small"
              value={props.operation || 'sum'}
              onChange={(_, d) => onPropChange('operation', d.value)}
            >
              {OPERATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
          </div>
        )}

        {showCardLabel && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Label</Label>
            <Input
              size="small"
              value={props.label || ''}
              onChange={(_, d) => onPropChange('label', d.value)}
            />
          </div>
        )}

        {showTarget && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Target</Label>
            <Input
              size="small"
              type="number"
              value={String(props.target || 2000000)}
              onChange={(_, d) => onPropChange('target', Number(d.value) || 0)}
            />
          </div>
        )}

        {showMaxRows && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Max Rows</Label>
            <Input
              size="small"
              type="number"
              value={String(props.maxRows || 100)}
              onChange={(_, d) => onPropChange('maxRows', Number(d.value) || 100)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
