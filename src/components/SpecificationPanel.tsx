import React from 'react';
import {
  makeStyles,
  shorthands,
  Text,
  Textarea,
  Select,
  Label,
  Badge,
  Input,
  Button,
} from '@fluentui/react-components';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import {
  checkPhantomReadiness,
  createHandoffRecommendation,
  createPhantomDataPath,
  createPhantomDesignHandoff,
  createPhantomDesignMappingSummary,
  createPhantomDesignWorkflow,
  createPhantomSpec,
  createPhantomWorkshopIntentCompleteness,
} from '../export';
import type { DashboardSpecification, DataSourceReference, DataSourceReferenceType, DesignSource, DesignSourceType } from '../types';

const parseIdList = (value: string) =>
  value.split(',').map((item) => item.trim()).filter(Boolean);

const formatIdList = (values?: string[]) => values?.join(', ') || '';

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
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#252423',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#605E5C',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: 'white',
    ...shorthands.padding('12px', '14px'),
    ...shorthands.borderRadius('6px'),
  },
  fieldRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#252423',
    fontWeight: '500',
  },
  textarea: {
    width: '100%',
    minHeight: '60px',
    fontSize: '12px',
    boxSizing: 'border-box',
  },
  selectRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  selectField: {
    flex: '1 1 96px',
    minWidth: 0,
  },
  statusBadge: {
    textTransform: 'capitalize',
  },
  hint: {
    fontSize: '10px',
    color: '#8A8886',
    marginTop: '2px',
  },
  readinessGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
  },
  readinessCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    ...shorthands.padding('8px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.borderRadius('6px'),
    backgroundColor: '#FAFAF9',
  },
  readinessLabel: {
    fontSize: '11px',
    color: '#605E5C',
    fontWeight: 600,
  },
  readinessCount: {
    fontSize: '11px',
    color: '#605E5C',
  },
  issueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  issueText: {
    fontSize: '11px',
    color: '#605E5C',
    lineHeight: '1.35',
  },
  metricValue: {
    fontSize: '15px',
    color: '#252423',
    fontWeight: 600,
  },
  sourceCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    ...shorthands.padding('10px'),
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.borderRadius('6px'),
    backgroundColor: '#FAFAF9',
  },
  sourceHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  sourceTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#252423',
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
});

export const SpecificationPanel: React.FC = () => {
  const styles = useStyles();
  const specification = useStore((s) => s.specification);
  const updateSpecification = useStore((s) => s.updateSpecification);
  const scenario = useStore((s) => s.scenario);
  const items = useStore((s) => s.items);
  const filters = useStore((s) => s.filters);
  const layoutMode = useStore((s) => s.layoutMode);
  const exportMode = useStore((s) => s.exportMode);
  const drillActions = useStore((s) => s.drillActions);
  const activePalette = useThemeStore((s) => s.activePalette);

  const currentSpec = React.useMemo(() => createPhantomSpec({
    scenario,
    items,
    drillActions,
    filters,
    layoutMode,
    exportMode,
    themePalette: activePalette.name,
    specification,
  }), [activePalette.name, drillActions, exportMode, filters, items, layoutMode, scenario, specification]);
  const reactReadiness = React.useMemo(() => checkPhantomReadiness(currentSpec, 'react'), [currentSpec]);
  const powerBiReadiness = React.useMemo(() => checkPhantomReadiness(currentSpec, 'powerBi'), [currentSpec]);
  const designMapping = React.useMemo(
    () => createPhantomDesignMappingSummary(currentSpec.project.designSources),
    [currentSpec],
  );
  const designWorkflow = React.useMemo(
    () => createPhantomDesignWorkflow(currentSpec),
    [currentSpec],
  );
  const designHandoff = React.useMemo(
    () => createPhantomDesignHandoff(currentSpec),
    [currentSpec],
  );
  const workshopCompleteness = React.useMemo(
    () => createPhantomWorkshopIntentCompleteness(currentSpec),
    [currentSpec],
  );
  const dataPath = React.useMemo(
    () => createPhantomDataPath(currentSpec),
    [currentSpec],
  );
  const handoffRecommendation = React.useMemo(
    () => createHandoffRecommendation(reactReadiness.ready, powerBiReadiness.ready),
    [powerBiReadiness.ready, reactReadiness.ready],
  );
  const visibleIssues = [...powerBiReadiness.errors, ...powerBiReadiness.warnings].slice(0, 3);

  const handleChange = (field: keyof DashboardSpecification, value: string) => {
    updateSpecification({ [field]: value });
  };

  const primaryDataSource = specification.dataSources?.[0];
  const designEntryPoint = specification.designEntryPoint || 'phantom-led';
  const designSources = specification.designSources || [];
  const displayedDesignSources = designSources.length
    ? designSources
    : [{ id: 'design-source-draft', type: 'figmaFrame' as DesignSourceType, name: '' }];

  const createBlankDesignSource = (type: DesignSourceType = 'figmaFrame'): DesignSource => ({
    id: `design-source-${Date.now()}`,
    type,
    name: '',
  });

  const updateDesignSourceAt = (index: number, updates: Partial<DesignSource>) => {
    const nextSources = designSources.length ? [...designSources] : [createBlankDesignSource()];
    const currentSource = nextSources[index] || createBlankDesignSource();
    nextSources[index] = {
      ...currentSource,
      id: currentSource.id || `design-source-${Date.now()}`,
      name: currentSource.name || '',
      ...updates,
    };
    updateSpecification({ designSources: nextSources });
  };

  const handleDesignSourceChange = (index: number, field: keyof DesignSource, value: string) => {
    updateDesignSourceAt(index, {
      [field]: value,
    });
  };

  const handleDesignSourceListChange = (
    index: number,
    field: 'linkedViewIds' | 'linkedComponentIds',
    value: string,
  ) => {
    const nextValues = parseIdList(value);
    updateDesignSourceAt(index, nextValues.length ? { [field]: nextValues } : { [field]: undefined });
  };

  const addDesignSource = (type: DesignSourceType = 'figmaFrame') => {
    updateSpecification({
      designEntryPoint: type === 'phantomDefault' ? 'phantom-led' : 'figma-led',
      designSources: [...designSources, createBlankDesignSource(type)],
    });
  };

  const removeDesignSource = (index: number) => {
    updateSpecification({
      designSources: designSources.filter((_, sourceIndex) => sourceIndex !== index),
    });
  };

  const usePhantomDefaults = () => {
    updateSpecification({
      designEntryPoint: 'phantom-led',
      designSources: [{
        id: 'phantom-defaults',
        type: 'phantomDefault',
        name: 'Phantom analytical defaults',
        linkedViewIds: ['main'],
        linkedComponentIds: items.map((item) => item.id),
        notes: 'No external Figma source required. Use Phantom layout, component, analytics, and handoff defaults as the design baseline.',
      }],
    });
  };

  const handleDataSourceChange = (field: keyof DataSourceReference, value: string) => {
    const currentSource: DataSourceReference = primaryDataSource || {
      id: 'data-source-primary',
      type: 'dbt',
      name: '',
    };
    const nextSource = {
      ...currentSource,
      [field]: value,
      id: currentSource.id || `data-source-${Date.now()}`,
    };
    updateSpecification({ dataSources: [nextSource] });
  };

  const handleDataSourceListChange = (
    field: 'linkedComponentIds' | 'linkedFields',
    value: string,
  ) => {
    const currentSource: DataSourceReference = primaryDataSource || {
      id: 'data-source-primary',
      type: 'dbt',
      name: '',
    };
    const nextValues = parseIdList(value);
    const nextSource = {
      ...currentSource,
      ...(nextValues.length ? { [field]: nextValues } : { [field]: undefined }),
    };
    updateSpecification({ dataSources: [nextSource] });
  };

  const getStatusColor = (status: string | undefined): 'warning' | 'success' | 'informative' => {
    if (status === 'approved') return 'success';
    if (status === 'in-review') return 'warning';
    return 'informative';
  };

  const getWorkflowStatusColor = (status: string): 'warning' | 'success' | 'informative' => {
    if (status === 'ready') return 'success';
    if (status === 'needs-design-source' || status === 'needs-mapping') return 'warning';
    return 'informative';
  };

  const getHandoffTargetLabel = (target: string) => {
    if (target === 'dual-track') return 'Dual Track';
    if (target === 'react-product') return 'React Product';
    if (target === 'power-bi') return 'Power BI';
    return 'Fix First';
  };

  const getSourceModeLabel = (sourceMode: string) => {
    if (sourceMode === 'figma-imported') return 'Figma imported';
    if (sourceMode === 'phantom-defaults') return 'Phantom defaults';
    if (sourceMode === 'needs-source') return 'Needs source';
    return 'Mixed';
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Text className={styles.title}>Dashboard Specification</Text>
        <Badge
          className={styles.statusBadge}
          appearance="filled"
          color={getStatusColor(specification.signOffStatus)}
        >
          {specification.signOffStatus || 'draft'}
        </Badge>
      </div>

      {/* Export Readiness */}
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Export Readiness</Text>
        <div className={styles.readinessGrid}>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>React Product</Text>
            <Badge appearance="filled" color={reactReadiness.ready ? 'success' : 'danger'}>
              {reactReadiness.ready ? 'Ready' : 'Blocked'}
            </Badge>
            <Text className={styles.readinessCount}>
              {reactReadiness.errors.length} errors, {reactReadiness.warnings.length} warnings
            </Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Power BI</Text>
            <Badge appearance="filled" color={powerBiReadiness.ready ? 'success' : 'danger'}>
              {powerBiReadiness.ready ? 'Ready' : 'Blocked'}
            </Badge>
            <Text className={styles.readinessCount}>
              {powerBiReadiness.errors.length} errors, {powerBiReadiness.warnings.length} warnings
            </Text>
          </div>
        </div>
        <div className={styles.readinessCard}>
          <Text className={styles.readinessLabel}>Recommended Handoff</Text>
          <Badge
            appearance="filled"
            color={handoffRecommendation.target === 'fix-before-handoff' ? 'warning' : 'success'}
          >
            {getHandoffTargetLabel(handoffRecommendation.target)}
          </Badge>
          <Text className={styles.issueText}>{handoffRecommendation.guidance}</Text>
        </div>
        <div className={styles.issueList}>
          {visibleIssues.length === 0 ? (
            <Text className={styles.issueText}>No Power BI blockers detected for the current spec.</Text>
          ) : visibleIssues.map((issue) => (
            <Text key={`${issue.code}-${issue.componentId || issue.drillActionId || issue.message}`} className={styles.issueText}>
              {issue.severity.toUpperCase()} {issue.code}: {issue.message}
            </Text>
          ))}
        </div>
        <Text className={styles.hint}>
          These checks match the Phantom Spec export and CLI readiness reports.
        </Text>
      </div>

      {/* Business Context */}
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Business Context</Text>

        <div className={styles.metricGrid}>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Intent</Text>
            <Badge appearance="filled" color={workshopCompleteness.complete ? 'success' : 'warning'}>
              {workshopCompleteness.complete ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Present</Text>
            <Text className={styles.metricValue}>{workshopCompleteness.present.length}</Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Missing</Text>
            <Text className={styles.metricValue}>{workshopCompleteness.missing.length}</Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Required</Text>
            <Text className={styles.metricValue}>
              {workshopCompleteness.present.length + workshopCompleteness.missing.length}
            </Text>
          </div>
        </div>
        <Text className={styles.hint}>
          Missing: {workshopCompleteness.missing.join(', ') || 'none'}
        </Text>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Business Questions</Label>
          <Textarea
            className={styles.textarea}
            placeholder="What business questions does this dashboard answer?"
            value={specification.businessQuestions || ''}
            onChange={(_, d) => handleChange('businessQuestions', d.value)}
            resize="vertical"
          />
          <Text className={styles.hint}>List the key questions stakeholders need answered</Text>
        </div>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Audience</Label>
          <Textarea
            className={styles.textarea}
            placeholder="Who will use this dashboard?"
            value={specification.audience || ''}
            onChange={(_, d) => handleChange('audience', d.value)}
            resize="vertical"
          />
        </div>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Decisions / Actions</Label>
          <Textarea
            className={styles.textarea}
            placeholder="What decisions or actions should this experience support?"
            value={specification.decisions || ''}
            onChange={(_, d) => handleChange('decisions', d.value)}
            resize="vertical"
          />
        </div>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Acceptance Criteria</Label>
          <Textarea
            className={styles.textarea}
            placeholder="What must be true before the client or delivery team signs this off?"
            value={specification.acceptanceCriteria || ''}
            onChange={(_, d) => handleChange('acceptanceCriteria', d.value)}
            resize="vertical"
          />
        </div>
      </div>

      {/* Design Source */}
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Design Source</Text>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Entry Point</Label>
          <Select
            size="small"
            value={designEntryPoint}
            onChange={(_, d) => updateSpecification({
              designEntryPoint: d.value as DashboardSpecification['designEntryPoint'],
            })}
          >
            <option value="phantom-led">Phantom Defaults</option>
            <option value="figma-led">Figma-led</option>
          </Select>
          <Text className={styles.hint}>
            Use Figma-led when visual design starts outside Phantom; use Phantom defaults when speed matters.
          </Text>
        </div>

        <div className={styles.metricGrid}>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Workflow</Text>
            <Badge appearance="filled" color={getWorkflowStatusColor(designWorkflow.status)}>
              {designWorkflow.status.replace(/-/g, ' ')}
            </Badge>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Design Plane</Text>
            <Text className={styles.metricValue}>
              {designWorkflow.designPlane === 'figma' ? 'Figma' : 'Phantom'}
            </Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Sources</Text>
            <Text className={styles.metricValue}>{designMapping.totalSources}</Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Mapped</Text>
            <Text className={styles.metricValue}>{designMapping.mappedSources}</Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Unmapped</Text>
            <Text className={styles.metricValue}>{designMapping.unmappedSources}</Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Targets</Text>
            <Text className={styles.metricValue}>
              {designMapping.linkedViewIds.length + designMapping.linkedComponentIds.length}
            </Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Source Mode</Text>
            <Text className={styles.metricValue}>{getSourceModeLabel(designHandoff.sourceMode)}</Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Missing Component Maps</Text>
            <Text className={styles.metricValue}>{designHandoff.missingMappings.length}</Text>
          </div>
        </div>
        <Text className={styles.hint}>
          Next: {designWorkflow.requiredNextSteps[0] || 'ready for implementation handoff'}
        </Text>
        <Text className={styles.hint}>
          Linked views: {designMapping.linkedViewIds.join(', ') || 'none'}; linked components: {designMapping.linkedComponentIds.join(', ') || 'none'}
        </Text>
        <Text className={styles.hint}>
          Component design handoff: {designHandoff.canSkipFigma ? 'Figma optional' : 'Figma/design source required'}; missing maps: {designHandoff.missingMappings.join(', ') || 'none'}
        </Text>

        <div className={styles.actionRow}>
          <Button size="small" appearance="secondary" onClick={() => addDesignSource('figmaFrame')}>
            Add Figma Source
          </Button>
          <Button size="small" appearance="secondary" onClick={() => addDesignSource('screenshot')}>
            Add Screenshot
          </Button>
          <Button size="small" appearance="primary" onClick={usePhantomDefaults}>
            Use Phantom Defaults
          </Button>
        </div>

        {displayedDesignSources.map((source, index) => (
          <div className={styles.sourceCard} key={source.id || `design-source-${index}`}>
            <div className={styles.sourceHeader}>
              <Text className={styles.sourceTitle}>
                {source.name || `Design Source ${index + 1}`}
              </Text>
              <Button
                size="small"
                appearance="subtle"
                disabled={designSources.length === 0}
                onClick={() => removeDesignSource(index)}
              >
                Remove
              </Button>
            </div>

            <div className={styles.selectRow}>
              <div className={`${styles.fieldRow} ${styles.selectField}`}>
                <Label className={styles.fieldLabel}>Source Type</Label>
                <Select
                  size="small"
                  value={source.type || 'figmaFrame'}
                  onChange={(_, d) => handleDesignSourceChange(index, 'type', d.value as DesignSourceType)}
                >
                  <option value="figmaFrame">Figma Frame</option>
                  <option value="figmaComponent">Figma Component</option>
                  <option value="screenshot">Screenshot</option>
                  <option value="externalReference">External Reference</option>
                  <option value="phantomDefault">Phantom Default</option>
                </Select>
              </div>

              <div className={`${styles.fieldRow} ${styles.selectField}`}>
                <Label className={styles.fieldLabel}>Name</Label>
                <Input
                  size="small"
                  placeholder="Exec dashboard frame"
                  value={source.name || ''}
                  onChange={(_, d) => handleDesignSourceChange(index, 'name', d.value)}
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Design Link</Label>
              <Input
                size="small"
                placeholder="https://www.figma.com/file/..."
                value={source.url || ''}
                onChange={(_, d) => handleDesignSourceChange(index, 'url', d.value)}
              />
            </div>

            <div className={styles.selectRow}>
              <div className={`${styles.fieldRow} ${styles.selectField}`}>
                <Label className={styles.fieldLabel}>Frame ID</Label>
                <Input
                  size="small"
                  placeholder="Optional"
                  value={source.frameId || ''}
                  onChange={(_, d) => handleDesignSourceChange(index, 'frameId', d.value)}
                />
              </div>

              <div className={`${styles.fieldRow} ${styles.selectField}`}>
                <Label className={styles.fieldLabel}>Component ID</Label>
                <Input
                  size="small"
                  placeholder="Optional"
                  value={source.componentId || ''}
                  onChange={(_, d) => handleDesignSourceChange(index, 'componentId', d.value)}
                />
              </div>
            </div>

            <div className={styles.selectRow}>
              <div className={`${styles.fieldRow} ${styles.selectField}`}>
                <Label className={styles.fieldLabel}>Linked Views</Label>
                <Input
                  size="small"
                  placeholder="main"
                  value={formatIdList(source.linkedViewIds)}
                  onChange={(_, d) => handleDesignSourceListChange(index, 'linkedViewIds', d.value)}
                />
              </div>

              <div className={`${styles.fieldRow} ${styles.selectField}`}>
                <Label className={styles.fieldLabel}>Linked Components</Label>
                <Input
                  size="small"
                  placeholder={items.slice(0, 2).map((item) => item.id).join(', ') || 'visual-1'}
                  value={formatIdList(source.linkedComponentIds)}
                  onChange={(_, d) => handleDesignSourceListChange(index, 'linkedComponentIds', d.value)}
                />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <Label className={styles.fieldLabel}>Design Notes</Label>
              <Textarea
                className={styles.textarea}
                placeholder="Brand, component, token, or handoff notes..."
                value={source.notes || ''}
                onChange={(_, d) => handleDesignSourceChange(index, 'notes', d.value)}
                resize="vertical"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Data Requirements */}
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Data Requirements</Text>

        <div className={styles.selectRow}>
          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Grain</Label>
            <Select
              size="small"
              value={specification.grain || ''}
              onChange={(_, d) => handleChange('grain', d.value)}
            >
              <option value="">Select...</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>

          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Refresh</Label>
            <Select
              size="small"
              value={specification.refreshCadence || ''}
              onChange={(_, d) => handleChange('refreshCadence', d.value)}
            >
              <option value="">Select...</option>
              <option value="real-time">Real-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="on-demand">On-demand</option>
            </Select>
          </div>
        </div>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Source Systems</Label>
          <Textarea
            className={styles.textarea}
            placeholder="Where does the data come from?"
            value={specification.sourceSystems || ''}
            onChange={(_, d) => handleChange('sourceSystems', d.value)}
            resize="vertical"
          />
        </div>

        <div className={styles.metricGrid}>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Data Path</Text>
            <Badge appearance="filled" color={dataPath.requiredNextSteps.length === 0 ? 'success' : 'warning'}>
              {dataPath.requiredNextSteps.length === 0 ? 'Ready' : 'Needs mapping'}
            </Badge>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Sources</Text>
            <Text className={styles.metricValue}>{dataPath.dataSources.length}</Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Unmapped Components</Text>
            <Text className={styles.metricValue}>{dataPath.unmappedComponents.length}</Text>
          </div>
          <div className={styles.readinessCard}>
            <Text className={styles.readinessLabel}>Unmapped Fields</Text>
            <Text className={styles.metricValue}>{dataPath.unmappedFields.length}</Text>
          </div>
        </div>
        <Text className={styles.hint}>
          Next: {dataPath.requiredNextSteps[0] || 'data path ready for handoff'}
        </Text>

        <div className={styles.selectRow}>
          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Data Source Type</Label>
            <Select
              size="small"
              value={primaryDataSource?.type || 'dbt'}
              onChange={(_, d) => handleDataSourceChange('type', d.value as DataSourceReferenceType)}
            >
              <option value="dbt">dbt Model</option>
              <option value="warehouse">Warehouse Table</option>
              <option value="api">REST API</option>
              <option value="graphql">GraphQL</option>
              <option value="semantic">Semantic API</option>
              <option value="file">File</option>
              <option value="manual">Manual</option>
              <option value="unknown">Unknown</option>
            </Select>
          </div>

          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Data Source Name</Label>
            <Input
              size="small"
              placeholder="Orders mart"
              value={primaryDataSource?.name || ''}
              onChange={(_, d) => handleDataSourceChange('name', d.value)}
            />
          </div>
        </div>

        <div className={styles.selectRow}>
          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Model / Table</Label>
            <Input
              size="small"
              placeholder="mart_orders"
              value={primaryDataSource?.model || ''}
              onChange={(_, d) => handleDataSourceChange('model', d.value)}
            />
          </div>

          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Endpoint URL</Label>
            <Input
              size="small"
              placeholder="https://api.client.com/orders"
              value={primaryDataSource?.url || ''}
              onChange={(_, d) => handleDataSourceChange('url', d.value)}
            />
          </div>
        </div>

        <div className={styles.selectRow}>
          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Linked Components</Label>
            <Input
              size="small"
              placeholder="visual-1, visual-2"
              value={formatIdList(primaryDataSource?.linkedComponentIds)}
              onChange={(_, d) => handleDataSourceListChange('linkedComponentIds', d.value)}
            />
          </div>

          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Linked Fields</Label>
            <Input
              size="small"
              placeholder="Region, revenue"
              value={formatIdList(primaryDataSource?.linkedFields)}
              onChange={(_, d) => handleDataSourceListChange('linkedFields', d.value)}
            />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Data Source Notes</Label>
          <Textarea
            className={styles.textarea}
            placeholder="Ownership, assumptions, transformations, or API notes..."
            value={primaryDataSource?.description || ''}
            onChange={(_, d) => handleDataSourceChange('description', d.value)}
            resize="vertical"
          />
        </div>
      </div>

      {/* Distribution */}
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Distribution</Text>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Distribution Method</Label>
          <Textarea
            className={styles.textarea}
            placeholder="How will this be distributed? (e.g., Power BI Service, Email, Embedded)"
            value={specification.distribution || ''}
            onChange={(_, d) => handleChange('distribution', d.value)}
            resize="vertical"
          />
        </div>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Sign-off Status</Label>
          <Select
            size="small"
            value={specification.signOffStatus || 'draft'}
            onChange={(_, d) => handleChange('signOffStatus', d.value)}
          >
            <option value="draft">Draft</option>
            <option value="in-review">In Review</option>
            <option value="approved">Approved</option>
          </Select>
        </div>
      </div>

      {/* Build Notes */}
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Build Notes</Text>

        <div className={styles.fieldRow}>
          <Textarea
            className={styles.textarea}
            style={{ minHeight: '100px' }}
            placeholder="Notes for developers building this dashboard..."
            value={specification.buildNotes || ''}
            onChange={(_, d) => handleChange('buildNotes', d.value)}
            resize="vertical"
          />
          <Text className={styles.hint}>
            Include data transformations, DAX requirements, known issues, etc.
          </Text>
        </div>
      </div>
    </div>
  );
};
