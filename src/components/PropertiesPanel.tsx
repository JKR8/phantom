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
  Checkbox,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, WarningRegular } from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { ScenarioFields, ScenarioType, RecommendedDimensions, RecommendedMeasures } from '../store/semanticLayer';

const useStyles = makeStyles({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...shorthands.padding('12px'),
    gap: '12px',
    overflowY: 'auto',
    backgroundColor: '#FAFAF9',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#605E5C',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: 'white',
    ...shorthands.padding('8px', '14px', '12px'),
    ...shorthands.borderRadius('6px'),
    minWidth: 0,
    overflow: 'hidden',
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#252423',
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
  warningRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#D83B01',
    ...shorthands.padding('4px', '0'),
  },
  warningIcon: {
    color: '#D83B01',
    flexShrink: 0,
  },
});

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

// Types that support topN/sort/showOther
const TOP_N_TYPES = ['bar', 'column', 'stackedBar', 'stackedColumn', 'pie', 'donut', 'funnel', 'treemap'];
// Types that support comparison
const COMPARISON_TYPES = ['line', 'area'];
// Types that support timeGrain
const TIME_GRAIN_TYPES = ['line', 'area'];

function sortByRecommended(items: string[], recommended: string[]): string[] {
  const order = new Map(recommended.map((name, idx) => [name, idx]));
  return [...items].sort((a, b) => {
    const ia = order.get(a) ?? 999;
    const ib = order.get(b) ?? 999;
    return ia - ib;
  });
}

export const PropertiesPanel: React.FC = () => {
  const styles = useStyles();
  const selectedItemId = useStore((s) => s.selectedItemId);
  const items = useStore((s) => s.items);
  const updateItemProps = useStore((s) => s.updateItemProps);
  const updateItemTitle = useStore((s) => s.updateItemTitle);
  const scenario = useStore((s) => s.scenario) as ScenarioType;

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
  const showTopN = TOP_N_TYPES.includes(type);
  const showSort = TOP_N_TYPES.includes(type);
  const showShowOther = TOP_N_TYPES.includes(type) && props.topN && props.topN !== 'All';
  const showComparison = COMPARISON_TYPES.includes(type);
  const showTimeGrain = TIME_GRAIN_TYPES.includes(type);

  const scenarioFields = ScenarioFields[scenario] || [];
  const recDims = RecommendedDimensions[scenario] || [];
  const recMeas = RecommendedMeasures[scenario] || [];

  const dimensionOptions = sortByRecommended(
    scenarioFields
      .filter((field) => field.role !== 'Measure' && field.role !== 'Identifier')
      .map((field) => field.name),
    recDims
  );
  const metricOptions = sortByRecommended(
    scenarioFields
      .filter((field) => field.role === 'Measure')
      .map((field) => field.name),
    recMeas
  );

  const resolveOptionValue = (options: string[], current: string | undefined) => {
    if (!current) return '';
    const matched = options.find((opt) => opt.toLowerCase() === current.toLowerCase());
    return matched || current;
  };

  // Validation: check if current dimension/metric values exist in scenario
  const isOrphanedDimension = props.dimension && !dimensionOptions.some(
    (opt) => opt.toLowerCase() === props.dimension?.toLowerCase()
  );
  const isOrphanedMetric = props.metric && !metricOptions.some(
    (opt) => opt.toLowerCase() === props.metric?.toLowerCase()
  );
  const isOrphanedXMetric = props.xMetric && !metricOptions.some(
    (opt) => opt.toLowerCase() === props.xMetric?.toLowerCase()
  );
  const isOrphanedYMetric = props.yMetric && !metricOptions.some(
    (opt) => opt.toLowerCase() === props.yMetric?.toLowerCase()
  );

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
              value={resolveOptionValue(dimensionOptions, props.dimension)}
              onChange={(_, d) => onPropChange('dimension', d.value)}
            >
              {dimensionOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
            {isOrphanedDimension && (
              <div className={styles.warningRow}>
                <WarningRegular className={styles.warningIcon} fontSize={14} />
                <span>"{props.dimension}" not in {scenario}</span>
              </div>
            )}
          </div>
        )}

        {showMetric && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Metric</Label>
            <Select
              size="small"
              value={resolveOptionValue(metricOptions, props.metric)}
              onChange={(_, d) => onPropChange('metric', d.value)}
            >
              {metricOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
            {isOrphanedMetric && (
              <div className={styles.warningRow}>
                <WarningRegular className={styles.warningIcon} fontSize={14} />
                <span>"{props.metric}" not in {scenario}</span>
              </div>
            )}
          </div>
        )}

        {showScatterMetrics && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>X Metric</Label>
              <Select
                size="small"
                value={resolveOptionValue(metricOptions, props.xMetric)}
                onChange={(_, d) => onPropChange('xMetric', d.value)}
              >
                {metricOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
              {isOrphanedXMetric && (
                <div className={styles.warningRow}>
                  <WarningRegular className={styles.warningIcon} fontSize={14} />
                  <span>"{props.xMetric}" not in {scenario}</span>
                </div>
              )}
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Y Metric</Label>
              <Select
                size="small"
                value={resolveOptionValue(metricOptions, props.yMetric)}
                onChange={(_, d) => onPropChange('yMetric', d.value)}
              >
                {metricOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
              {isOrphanedYMetric && (
                <div className={styles.warningRow}>
                  <WarningRegular className={styles.warningIcon} fontSize={14} />
                  <span>"{props.yMetric}" not in {scenario}</span>
                </div>
              )}
            </div>
          </>
        )}

        {showTopN && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Top N</Label>
            <Select
              size="small"
              value={String(props.topN ?? 'All')}
              onChange={(_, d) => onPropChange('topN', d.value)}
            >
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="10">10</option>
              <option value="All">All</option>
            </Select>
          </div>
        )}

        {showSort && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Sort</Label>
            <Select
              size="small"
              value={props.sort || 'desc'}
              onChange={(_, d) => onPropChange('sort', d.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
              <option value="alpha">Alphabetical</option>
            </Select>
          </div>
        )}

        {showShowOther && (
          <div className={styles.fieldRow}>
            <Checkbox
              checked={props.showOther !== false}
              onChange={(_, d) => onPropChange('showOther', !!d.checked)}
              label="Show Other bucket"
            />
          </div>
        )}

        {showComparison && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Comparison</Label>
            <Select
              size="small"
              value={props.comparison || 'both'}
              onChange={(_, d) => onPropChange('comparison', d.value)}
            >
              <option value="none">None</option>
              <option value="pl">Plan</option>
              <option value="py">Prior Year</option>
              <option value="both">Both</option>
            </Select>
          </div>
        )}

        {showTimeGrain && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Time Grain</Label>
            <Select
              size="small"
              value={props.timeGrain || 'month'}
              onChange={(_, d) => onPropChange('timeGrain', d.value)}
            >
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </Select>
          </div>
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
