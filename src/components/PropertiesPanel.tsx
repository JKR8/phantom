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
  Textarea,
  Badge,
} from '@fluentui/react-components';
import { AddRegular, DeleteRegular, WarningRegular, ErrorCircleRegular } from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { getPowerBiExportStatus } from '../export';
import {
  formatFieldLabel,
  isKnownDimension,
  normalizeDimensionName,
  ScenarioFields,
  ScenarioType,
  RecommendedDimensions,
  RecommendedMeasures,
} from '../store/semanticLayer';
import {
  ValidationDisplay,
  ValidationIndicator,
  ConstrainedSelect,
  OPERATION_OPTIONS,
  TIME_GRAIN_OPTIONS,
  COMPARISON_OPTIONS,
} from './property-inputs';
import type { DrillAction, DrillActionTargetType } from '../types';

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
  validationSummary: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    ...shorthands.padding('8px', '10px'),
    ...shorthands.borderRadius('4px'),
    marginBottom: '8px',
  },
  validationError: {
    backgroundColor: '#FEF2F2',
    ...shorthands.border('1px', 'solid', '#FECACA'),
    color: '#D13438',
  },
  validationWarning: {
    backgroundColor: '#FFFBEB',
    ...shorthands.border('1px', 'solid', '#FDE68A'),
    color: '#92400E',
  },
  notesTextarea: {
    width: '100%',
    minHeight: '80px',
    fontSize: '12px',
  },
  notesHint: {
    fontSize: '10px',
    color: '#8A8886',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  buttonRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  compatibilityGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  compatibilityCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    ...shorthands.padding('8px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.borderRadius('6px'),
    backgroundColor: '#FAFAF9',
  },
  compatibilityLabel: {
    fontSize: '11px',
    color: '#605E5C',
    fontWeight: 600,
  },
  compatibilityNote: {
    fontSize: '11px',
    color: '#605E5C',
    lineHeight: '1.35',
  },
});

// OPERATION_OPTIONS imported from property-inputs

/**
 * Visual type labels matching Power BI UI Kit 2.0 CSS spec
 * All 29+ chart types from docs/power-bi-chart-css.md
 */
const VISUAL_TYPE_LABELS: Record<string, string> = {
  // Layout & Text
  banner: 'Report Banner',
  textBox: 'Text Box',
  // KPI Cards
  nudgeKpi: 'Nudge KPI Card',
  // Bar & Column Charts
  bar: 'Clustered Bar Chart',
  stackedBar: 'Stacked Bar Chart',
  column: 'Clustered Column Chart',
  stackedColumn: 'Stacked Column Chart',
  waterfall: 'Waterfall Chart',
  combo: 'Combination Chart',

  // Line & Area Charts
  line: 'Line Chart',
  lineForecast: 'Line Chart (Forecast)',
  lineStepped: 'Stepped Line Chart',
  area: 'Area Chart (Layered)',
  stackedArea: 'Stacked Area Chart',

  // Pie & Part-to-Whole
  pie: 'Pie Chart',
  donut: 'Donut Chart',
  funnel: 'Funnel Chart',
  treemap: 'Treemap',

  // Maps
  map: 'Map Chart',
  mapChoropleth: 'Choropleth Map',
  mapBubble: 'Bubble Map',

  // KPI & Cards
  card: 'Card / KPI',
  kpi: 'KPI Visual',
  gauge: 'Gauge Chart',
  bullet: 'Bullet Chart',
  multiRowCard: 'Multi-row Card',

  // Tables
  table: 'Data Table',
  matrix: 'Matrix',

  // Comparison Charts
  scatter: 'Scatter Plot',
  barbell: 'Barbell Chart',
  diverging: 'Diverging Chart',
  slope: 'Slope Chart',

  // Specialized Charts
  ribbon: 'Ribbon Chart',
  gantt: 'Gantt Chart',
  dotStrip: 'Dot Strip Chart',
  slicer: 'Slicer',

  // Statistical Visuals
  boxplot: 'Boxplot',
  histogram: 'Histogram',
  violin: 'Violin Plot',
  regressionScatter: 'Scatter with Regression',
};

// Types that support topN/sort/showOther
const TOP_N_TYPES = ['bar', 'column', 'stackedBar', 'stackedColumn', 'pie', 'donut', 'funnel', 'treemap', 'combo'];
// Types that support comparison
const COMPARISON_TYPES = ['line', 'area'];
// Types that support timeGrain
const TIME_GRAIN_TYPES = ['line', 'area', 'stackedArea'];

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
  const updateItemNotes = useStore((s) => s.updateItemNotes);
  const drillActions = useStore((s) => s.drillActions);
  const addDrillAction = useStore((s) => s.addDrillAction);
  const updateDrillAction = useStore((s) => s.updateDrillAction);
  const removeDrillAction = useStore((s) => s.removeDrillAction);
  const scenario = useStore((s) => s.scenario) as ScenarioType;
  const exportMode = useStore((s) => s.exportMode);

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

  const onNotesChange = useCallback(
    (notes: string) => {
      if (selectedItemId) updateItemNotes(selectedItemId, notes);
    },
    [selectedItemId, updateItemNotes]
  );

  const onTopNChange = useCallback(
    (topN: string) => {
      if (selectedItemId) updateItemProps(selectedItemId, { topN, showOther: false });
    },
    [selectedItemId, updateItemProps]
  );

  if (!item) {
    return <div className={styles.noSelection}>Select a visual to edit</div>;
  }

  // Use Record<string, any> since this component accesses props dynamically by key
  const props = (item.props || {}) as Record<string, any>;
  const type = item.type;
  const powerBiSupport = getPowerBiExportStatus(type);
  const validation = item._validation;
  const manualData: Array<{ label: string; value: number }> = (props.manualData as Array<{ label: string; value: number }>) || [];
  const dataSource = props.manualData ? 'manual' : 'auto';
  const drillAction = drillActions.find((action) => action.sourceComponentId === item.id);
  const drillContext = drillAction?.context[0];

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

  const defaultContextField = String(props.dimension || props.metric || props.category || props.geoDimension || '');

  const createDrillAction = () => {
    const nextAction: DrillAction = {
      id: `drill-${item.id}-${Date.now()}`,
      sourceComponentId: item.id,
      trigger: item.type === 'table' || item.type === 'matrix' ? 'rowClick' : 'click',
      targetType: 'detailPanel',
      targetId: `${item.id}-detail`,
      label: `Open ${item.title} detail`,
      context: defaultContextField ? [{ source: defaultContextField, target: defaultContextField }] : [],
      preserveFilters: true,
    };
    addDrillAction(nextAction);
  };

  const updateSelectedDrillAction = (updates: Partial<DrillAction>) => {
    if (drillAction) updateDrillAction(drillAction.id, updates);
  };

  const updateDrillContext = (field: 'source' | 'target', value: string) => {
    const currentContext = drillContext || { source: defaultContextField, target: defaultContextField };
    const nextContext = {
      ...currentContext,
      [field]: value,
    };
    updateSelectedDrillAction({
      context: nextContext.source || nextContext.target ? [nextContext] : [],
    });
  };

  // Determine which fields to show based on visual type
  const showDimension = ['bar', 'column', 'stackedBar', 'stackedColumn', 'pie', 'donut', 'treemap', 'funnel', 'waterfall', 'slicer', 'stackedArea', 'combo'].includes(type);
  const showMetric = ['bar', 'column', 'stackedBar', 'stackedColumn', 'line', 'area', 'pie', 'donut', 'treemap', 'funnel', 'waterfall', 'card', 'kpi', 'gauge', 'stackedArea', 'map'].includes(type);
  const showScatterMetrics = type === 'scatter';
  const showComboMetrics = type === 'combo';
  const showMapSettings = type === 'map';
  const showOperation = type === 'card' || type === 'kpi';
  const showCardLabel = type === 'card';
  const showKpiGoalText = type === 'kpi';
  const showTarget = type === 'gauge';
  const showMaxRows = type === 'table';
  const showTextBoxSettings = type === 'textBox';
  const showBannerSettings = type === 'banner';
  const showNudgeKpiSettings = type === 'nudgeKpi';
  const showManualData = ['bar', 'column', 'stackedBar', 'stackedColumn', 'line', 'area', 'pie', 'donut', 'treemap', 'funnel', 'waterfall'].includes(type);
  const showTopN = TOP_N_TYPES.includes(type);
  const showSort = TOP_N_TYPES.includes(type);
  const showShowOther = TOP_N_TYPES.includes(type) && props.topN && props.topN !== 'All';
  const showComparison = COMPARISON_TYPES.includes(type);
  const showTimeGrain = TIME_GRAIN_TYPES.includes(type);
  // Statistical visual specific settings (removed — no longer supported)
  const showWhiskerMethod = false;
  const showBinMethod = false;
  const showKernelSettings = false;
  const showRegressionType = false;

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
    const normalizedCurrent = normalizeDimensionName(scenario, current) || current;
    const matched = options.find((opt) => opt.toLowerCase() === normalizedCurrent.toLowerCase());
    return matched || current;
  };

  // Validation: check if current dimension/metric values exist in scenario
  const isOrphanedDimension = props.dimension && !isKnownDimension(scenario, props.dimension);
  const isOrphanedMetric = props.metric && !metricOptions.some(
    (opt) => opt.toLowerCase() === props.metric?.toLowerCase()
  );
  const isOrphanedXMetric = props.xMetric && !metricOptions.some(
    (opt) => opt.toLowerCase() === props.xMetric?.toLowerCase()
  );
  const isOrphanedYMetric = props.yMetric && !metricOptions.some(
    (opt) => opt.toLowerCase() === props.yMetric?.toLowerCase()
  );
  const isOrphanedBarMetric = props.barMetric && !metricOptions.some(
    (opt) => opt.toLowerCase() === props.barMetric?.toLowerCase()
  );
  const isOrphanedLineMetric = props.lineMetric && !metricOptions.some(
    (opt) => opt.toLowerCase() === props.lineMetric?.toLowerCase()
  );
  const isOrphanedGeoDimension = props.geoDimension && !isKnownDimension(scenario, props.geoDimension);
  const getSupportColor = (status: string): 'success' | 'warning' | 'danger' | 'informative' => {
    if (status === 'ready') return 'success';
    if (status === 'approximate') return 'warning';
    if (status === 'unsupported') return 'danger';
    return 'informative';
  };

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

      {/* Validation Summary */}
      {validation && !validation.valid && (
        <div className={`${styles.validationSummary} ${styles.validationError}`}>
          <ErrorCircleRegular fontSize={16} />
          <Text size={200}>
            {validation.errors.length} error{validation.errors.length !== 1 ? 's' : ''} found
          </Text>
        </div>
      )}
      {validation && validation.valid && validation.warnings.length > 0 && (
        <div className={`${styles.validationSummary} ${styles.validationWarning}`}>
          <WarningRegular fontSize={16} />
          <Text size={200}>
            {validation.warnings.length} warning{validation.warnings.length !== 1 ? 's' : ''}
          </Text>
        </div>
      )}

      <Divider />

      {/* Export Compatibility */}
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Export Compatibility</Text>
        <div className={styles.compatibilityGrid}>
          <div className={styles.compatibilityCard}>
            <Text className={styles.compatibilityLabel}>React Product</Text>
            <Badge appearance="filled" color="success">Ready</Badge>
            <Text className={styles.compatibilityNote}>Uses production React components or generated stubs.</Text>
          </div>
          <div className={styles.compatibilityCard}>
            <Text className={styles.compatibilityLabel}>Power BI</Text>
            <Badge appearance="filled" color={getSupportColor(powerBiSupport.status)}>
              {powerBiSupport.status}
            </Badge>
            <Text className={styles.compatibilityNote}>
              {powerBiSupport.notes[0] || 'Power BI-safe visual/control.'}
            </Text>
          </div>
        </div>
        <Text className={styles.notesHint}>
          Current mode: {exportMode === 'react' ? 'React Product' : 'Power BI'}
        </Text>
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
                <option key={opt} value={opt}>{formatFieldLabel(opt)}</option>
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

        {showComboMetrics && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Bar Metric</Label>
              <Select
                size="small"
                value={resolveOptionValue(metricOptions, props.barMetric)}
                onChange={(_, d) => onPropChange('barMetric', d.value)}
              >
                {metricOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
              {isOrphanedBarMetric && (
                <div className={styles.warningRow}>
                  <WarningRegular className={styles.warningIcon} fontSize={14} />
                  <span>"{props.barMetric}" not in {scenario}</span>
                </div>
              )}
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Line Metric</Label>
              <Select
                size="small"
                value={resolveOptionValue(metricOptions, props.lineMetric)}
                onChange={(_, d) => onPropChange('lineMetric', d.value)}
              >
                {metricOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
              {isOrphanedLineMetric && (
                <div className={styles.warningRow}>
                  <WarningRegular className={styles.warningIcon} fontSize={14} />
                  <span>"{props.lineMetric}" not in {scenario}</span>
                </div>
              )}
            </div>
          </>
        )}

        {showMapSettings && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Geography</Label>
              <Select
                size="small"
                value={resolveOptionValue(dimensionOptions, props.geoDimension)}
                onChange={(_, d) => onPropChange('geoDimension', d.value)}
              >
                {dimensionOptions.map((opt) => (
                  <option key={opt} value={opt}>{formatFieldLabel(opt)}</option>
                ))}
              </Select>
              {isOrphanedGeoDimension && (
                <div className={styles.warningRow}>
                  <WarningRegular className={styles.warningIcon} fontSize={14} />
                  <span>"{props.geoDimension}" not in {scenario}</span>
                </div>
              )}
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Map Type</Label>
              <Select
                size="small"
                value={props.mapType || 'au'}
                onChange={(_, d) => onPropChange('mapType', d.value)}
              >
                <option value="au">Australia States</option>
                <option value="us">US States</option>
                <option value="world">World Countries</option>
              </Select>
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Display Mode</Label>
              <Select
                size="small"
                value={props.displayMode || 'choropleth'}
                onChange={(_, d) => onPropChange('displayMode', d.value)}
              >
                <option value="choropleth">Choropleth (Fill)</option>
                <option value="bubble">Bubble</option>
              </Select>
            </div>
          </>
        )}

        {showTopN && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Top N</Label>
            <Select
              size="small"
              value={String(props.topN ?? 'All')}
              onChange={(_, d) => onTopNChange(d.value)}
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
            <ConstrainedSelect
              options={COMPARISON_OPTIONS}
              value={props.comparison || 'both'}
              onChange={(value) => onPropChange('comparison', value)}
            />
          </div>
        )}

        {showTimeGrain && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Time Grain</Label>
            <ConstrainedSelect
              options={TIME_GRAIN_OPTIONS}
              value={props.timeGrain || 'month'}
              onChange={(value) => onPropChange('timeGrain', value)}
            />
          </div>
        )}

        {showOperation && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>
              Operation
              <ValidationIndicator validation={validation} field="operation" />
            </Label>
            <ConstrainedSelect
              options={OPERATION_OPTIONS}
              value={props.operation || 'sum'}
              onChange={(value) => onPropChange('operation', value)}
            />
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

        {showKpiGoalText && (
          <div className={styles.fieldRow}>
            <Label className={styles.fieldLabel}>Goal Text</Label>
            <Input
              size="small"
              placeholder="vs prev"
              value={props.goalText || ''}
              onChange={(_, d) => onPropChange('goalText', d.value)}
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

        {/* Text Box Settings */}
        {showTextBoxSettings && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Text</Label>
              <Textarea
                size="small"
                value={props.text || ''}
                placeholder="Write text here"
                onChange={(_, d) => onPropChange('text', d.value)}
              />
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Font Size</Label>
              <Input
                size="small"
                type="number"
                value={String(props.fontSize || 18)}
                onChange={(_, d) => onPropChange('fontSize', Number(d.value) || 18)}
              />
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Alignment</Label>
              <Select
                size="small"
                value={props.alignment || 'left'}
                onChange={(_, d) => onPropChange('alignment', d.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </Select>
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Text Color</Label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={props.fontColor || '#252423'}
                  onChange={(e) => onPropChange('fontColor', e.target.value)}
                  style={{ width: '32px', height: '24px', padding: '0', border: '1px solid #E1DFDD', borderRadius: '4px', cursor: 'pointer' }}
                />
                <Input
                  size="small"
                  value={props.fontColor || '#252423'}
                  onChange={(_, d) => onPropChange('fontColor', d.value)}
                  style={{ width: '80px' }}
                />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.bold === true}
                onChange={(_, d) => onPropChange('bold', !!d.checked)}
                label="Bold"
              />
            </div>
          </>
        )}

        {/* Banner Settings */}
        {showBannerSettings && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Banner Text</Label>
              <Input
                size="small"
                value={props.title || 'Report Title'}
                onChange={(_, d) => onPropChange('title', d.value)}
              />
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Subtitle</Label>
              <Input
                size="small"
                value={props.subtitle || ''}
                placeholder="Optional subtitle"
                onChange={(_, d) => onPropChange('subtitle', d.value)}
              />
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Style</Label>
              <Select
                size="small"
                value={props.variant || 'thinLine'}
                onChange={(_, d) => onPropChange('variant', d.value)}
              >
                <option value="thinLine">Thin Line (default)</option>
                <option value="subtle">Subtle Background</option>
                <option value="gradient">Gradient</option>
                <option value="filled">Filled (classic)</option>
              </Select>
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Accent Color</Label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={props.accentColor || '#0078D4'}
                  onChange={(e) => onPropChange('accentColor', e.target.value)}
                  style={{ width: '32px', height: '24px', padding: '0', border: '1px solid #E1DFDD', borderRadius: '4px', cursor: 'pointer' }}
                />
                <Input
                  size="small"
                  value={props.accentColor || '#0078D4'}
                  onChange={(_, d) => onPropChange('accentColor', d.value)}
                  style={{ width: '80px' }}
                />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Title Size</Label>
              <Input
                size="small"
                type="number"
                value={String(props.titleFontSize || 20)}
                onChange={(_, d) => onPropChange('titleFontSize', Number(d.value) || 20)}
              />
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showLogo === true}
                onChange={(_, d) => onPropChange('showLogo', !!d.checked)}
                label="Show logo"
              />
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showAccentBar === true}
                onChange={(_, d) => onPropChange('showAccentBar', !!d.checked)}
                label="Show left accent bar"
              />
            </div>
          </>
        )}

        {/* Nudge KPI Settings */}
        {showNudgeKpiSettings && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Metric Name</Label>
              <Input
                size="small"
                value={props.metricName || 'Total Revenue'}
                onChange={(_, d) => onPropChange('metricName', d.value)}
                placeholder="Display name for the metric"
              />
            </div>
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
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Operation</Label>
              <ConstrainedSelect
                options={OPERATION_OPTIONS}
                value={props.operation || 'sum'}
                onChange={(value) => onPropChange('operation', value)}
              />
            </div>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Target Value</Label>
              <Input
                size="small"
                type="number"
                value={String(props.targetValue || '')}
                placeholder="Optional target"
                onChange={(_, d) => onPropChange('targetValue', d.value ? Number(d.value) : undefined)}
              />
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showPreviousPeriod !== false}
                onChange={(_, d) => onPropChange('showPreviousPeriod', !!d.checked)}
                label="Show Previous Period comparison"
              />
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showTarget !== false}
                onChange={(_, d) => onPropChange('showTarget', !!d.checked)}
                label="Show Target comparison"
              />
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showYoY !== false}
                onChange={(_, d) => onPropChange('showYoY', !!d.checked)}
                label="Show Year-over-Year"
              />
            </div>
          </>
        )}

        {/* Statistical Visual Settings */}
        {showWhiskerMethod && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Whisker Method</Label>
              <Select
                size="small"
                value={props.whiskerMethod || 'tukey'}
                onChange={(_, d) => onPropChange('whiskerMethod', d.value)}
              >
                <option value="tukey">Tukey (1.5 IQR)</option>
                <option value="minmax">Min/Max</option>
                <option value="percentile">Percentile (5/95)</option>
                <option value="stddev">Std Dev (2)</option>
              </Select>
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showOutliers !== false}
                onChange={(_, d) => onPropChange('showOutliers', !!d.checked)}
                label="Show outliers"
              />
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showMean === true}
                onChange={(_, d) => onPropChange('showMean', !!d.checked)}
                label="Show mean"
              />
            </div>
          </>
        )}

        {showBinMethod && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Bin Method</Label>
              <Select
                size="small"
                value={props.binMethod || 'sturges'}
                onChange={(_, d) => onPropChange('binMethod', d.value)}
              >
                <option value="sturges">Sturges</option>
                <option value="scott">Scott</option>
                <option value="freedman-diaconis">Freedman-Diaconis</option>
                <option value="sqrt">Square Root</option>
                <option value="fixed-count">Fixed Count</option>
              </Select>
            </div>
            {props.binMethod === 'fixed-count' && (
              <div className={styles.fieldRow}>
                <Label className={styles.fieldLabel}>Bin Count</Label>
                <Input
                  size="small"
                  type="number"
                  value={String(props.binCount || 10)}
                  onChange={(_, d) => onPropChange('binCount', Number(d.value) || 10)}
                />
              </div>
            )}
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showDensityCurve === true}
                onChange={(_, d) => onPropChange('showDensityCurve', !!d.checked)}
                label="Show density curve"
              />
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showMeanLine === true}
                onChange={(_, d) => onPropChange('showMeanLine', !!d.checked)}
                label="Show mean line"
              />
            </div>
          </>
        )}

        {showKernelSettings && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Kernel</Label>
              <Select
                size="small"
                value={props.kernel || 'gaussian'}
                onChange={(_, d) => onPropChange('kernel', d.value)}
              >
                <option value="gaussian">Gaussian</option>
                <option value="epanechnikov">Epanechnikov</option>
                <option value="uniform">Uniform</option>
                <option value="triangular">Triangular</option>
              </Select>
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showInnerBox !== false}
                onChange={(_, d) => onPropChange('showInnerBox', !!d.checked)}
                label="Show inner box"
              />
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showPoints === true}
                onChange={(_, d) => onPropChange('showPoints', !!d.checked)}
                label="Show data points"
              />
            </div>
          </>
        )}

        {showRegressionType && (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Regression Type</Label>
              <Select
                size="small"
                value={props.regressionType || 'linear'}
                onChange={(_, d) => onPropChange('regressionType', d.value)}
              >
                <option value="none">None</option>
                <option value="linear">Linear</option>
                <option value="polynomial">Polynomial</option>
                <option value="loess">LOESS</option>
              </Select>
            </div>
            {props.regressionType === 'polynomial' && (
              <div className={styles.fieldRow}>
                <Label className={styles.fieldLabel}>Polynomial Degree</Label>
                <Select
                  size="small"
                  value={String(props.polynomialDegree || 2)}
                  onChange={(_, d) => onPropChange('polynomialDegree', Number(d.value))}
                >
                  <option value="2">2 (Quadratic)</option>
                  <option value="3">3 (Cubic)</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </Select>
              </div>
            )}
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showConfidenceInterval === true}
                onChange={(_, d) => onPropChange('showConfidenceInterval', !!d.checked)}
                label="Show confidence interval"
              />
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showEquation !== false}
                onChange={(_, d) => onPropChange('showEquation', !!d.checked)}
                label="Show equation"
              />
            </div>
            <div className={styles.fieldRow}>
              <Checkbox
                checked={props.showRSquared !== false}
                onChange={(_, d) => onPropChange('showRSquared', !!d.checked)}
                label="Show R-squared"
              />
            </div>
          </>
        )}

      </div>

      {/* Four Questions Notes */}
      <Divider />
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Drill Action</Text>
        {!drillAction ? (
          <>
            <Text className={styles.notesHint}>
              Define what happens when a user clicks this visual in the finished analytical app or Power BI report.
            </Text>
            <Button
              appearance="secondary"
              icon={<AddRegular />}
              size="small"
              className={styles.addButton}
              onClick={createDrillAction}
            >
              Add Drill Action
            </Button>
          </>
        ) : (
          <>
            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Label</Label>
              <Input
                size="small"
                value={drillAction.label}
                onChange={(_, d) => updateSelectedDrillAction({ label: d.value })}
              />
            </div>

            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Trigger</Label>
              <Select
                size="small"
                value={drillAction.trigger}
                onChange={(_, d) => updateSelectedDrillAction({ trigger: d.value as DrillAction['trigger'] })}
              >
                <option value="click">Click</option>
                <option value="rowClick">Row Click</option>
                <option value="pointClick">Point Click</option>
                <option value="markClick">Mark Click</option>
              </Select>
            </div>

            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Target Type</Label>
              <Select
                size="small"
                value={drillAction.targetType}
                onChange={(_, d) => updateSelectedDrillAction({ targetType: d.value as DrillActionTargetType })}
              >
                <option value="view">View</option>
                <option value="detailPanel">Detail Panel</option>
                <option value="modal">Modal</option>
                <option value="entityProfile">Entity Profile</option>
                <option value="externalUrl">External URL</option>
              </Select>
            </div>

            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Target ID or URL</Label>
              <Input
                size="small"
                placeholder="region-detail"
                value={drillAction.targetId}
                onChange={(_, d) => updateSelectedDrillAction({ targetId: d.value })}
              />
            </div>

            <div className={styles.dataRow}>
              <div className={`${styles.fieldRow} ${styles.dataInput}`}>
                <Label className={styles.fieldLabel}>Context Field</Label>
                <Input
                  size="small"
                  placeholder="Region"
                  value={drillContext?.source || ''}
                  onChange={(_, d) => updateDrillContext('source', d.value)}
                />
              </div>
              <div className={`${styles.fieldRow} ${styles.dataInput}`}>
                <Label className={styles.fieldLabel}>Target Param</Label>
                <Input
                  size="small"
                  placeholder="region"
                  value={drillContext?.target || ''}
                  onChange={(_, d) => updateDrillContext('target', d.value)}
                />
              </div>
            </div>

            <Checkbox
              checked={drillAction.preserveFilters}
              onChange={(_, d) => updateSelectedDrillAction({ preserveFilters: !!d.checked })}
              label="Preserve active filters"
            />

            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Notes</Label>
              <Textarea
                className={styles.notesTextarea}
                placeholder="Describe the target view, expected detail, or implementation caveat..."
                value={drillAction.notes || ''}
                onChange={(_, d) => updateSelectedDrillAction({ notes: d.value })}
                resize="vertical"
              />
            </div>

            <div className={styles.buttonRow}>
              <Button
                appearance="subtle"
                icon={<DeleteRegular />}
                size="small"
                onClick={() => removeDrillAction(drillAction.id)}
              >
                Remove Drill Action
              </Button>
            </div>
          </>
        )}
      </div>

      <Divider />
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Four Questions</Text>
        <div className={styles.fieldRow}>
          <Textarea
            className={styles.notesTextarea}
            placeholder="Document answers to the four questions..."
            value={item.fourQuestionsNotes || ''}
            onChange={(_, d) => onNotesChange(d.value)}
            resize="vertical"
          />
          <Text className={styles.notesHint}>
            1. Is it good or bad? (polarity, thresholds){'\n'}
            2. By how much? (variance, comparison){'\n'}
            3. Why? (drivers, drill paths){'\n'}
            4. What action? (triggers, owner)
          </Text>
        </div>
      </div>

      {/* Validation Details */}
      {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <>
          <Divider />
          <div className={styles.section}>
            <Text className={styles.sectionHeader}>Validation</Text>
            <ValidationDisplay validation={validation} />
          </div>
        </>
      )}
    </div>
  );
};
