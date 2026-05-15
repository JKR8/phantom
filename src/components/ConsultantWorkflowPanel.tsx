import React from 'react';
import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  Text,
  Textarea,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import {
  CheckmarkCircleRegular,
  ClipboardTextEditRegular,
  DismissCircleRegular,
  WarningRegular,
} from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import {
  createHandoffRecommendation,
  createPhantomDataPath,
  createPhantomHandoffSummary,
  createPhantomImplementationGate,
  createPhantomSpec,
  createPhantomWorkshopIntentCompleteness,
} from '../export';
import type {
  DataSourceReference,
  DataSourceReferenceType,
  DesignSource,
  DesignSourceType,
  DrillActionTargetType,
  RequirementDisposition,
  RequirementItem,
} from '../types';
import {
  createConsultantWorkflowModel,
  createRequirementItemFromSuggestion,
  type ConsultantWorkflowStepId,
  type RequirementSuggestion,
} from '../workflow/consultantWorkflow';

const useStyles = makeStyles({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: '#FAFAF9',
  },
  header: {
    display: 'grid',
    gap: '8px',
    ...shorthands.padding('12px'),
    borderBottom: '1px solid #E1DFDD',
    backgroundColor: '#FFFFFF',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#252423',
  },
  subtitle: {
    fontSize: '11px',
    color: '#605E5C',
    lineHeight: 1.35,
  },
  stepList: {
    display: 'grid',
    gap: '6px',
    ...shorthands.padding('10px'),
    borderBottom: '1px solid #E1DFDD',
    backgroundColor: '#F3F2F1',
  },
  stepButton: {
    justifyContent: 'space-between',
    minHeight: '40px',
  },
  body: {
    display: 'grid',
    gap: '12px',
    ...shorthands.padding('12px'),
  },
  section: {
    display: 'grid',
    gap: '10px',
    backgroundColor: '#FFFFFF',
    ...shorthands.border('1px', 'solid', '#E1DFDD'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('12px'),
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#605E5C',
    textTransform: 'uppercase',
  },
  field: {
    display: 'grid',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#252423',
  },
  textarea: {
    width: '100%',
    minHeight: '72px',
    fontSize: '12px',
    boxSizing: 'border-box',
  },
  compactTextarea: {
    width: '100%',
    minHeight: '52px',
    fontSize: '12px',
    boxSizing: 'border-box',
  },
  card: {
    display: 'grid',
    gap: '8px',
    ...shorthands.padding('10px'),
    ...shorthands.border('1px', 'solid', '#E7E5E4'),
    ...shorthands.borderRadius('7px'),
    backgroundColor: '#FAFAF9',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  cardText: {
    display: 'grid',
    gap: '4px',
    minWidth: 0,
  },
  cardTitle: {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: '#252423',
    lineHeight: 1.35,
  },
  smallText: {
    fontSize: '11px',
    color: '#605E5C',
    lineHeight: 1.35,
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  metricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
  },
  metric: {
    display: 'grid',
    gap: '4px',
    ...shorthands.padding('8px'),
    backgroundColor: '#F8F8F7',
    ...shorthands.borderRadius('6px'),
  },
  metricValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#252423',
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
});

const dispositionLabels: Record<RequirementDisposition, string> = {
  client_decision: 'Ask client',
  consultant_task: 'Consultant',
  assumption: 'Assumption',
  accepted_gap: 'Accepted gap',
  export_blocker: 'Export blocker',
};

const dispositionColors: Record<RequirementDisposition, 'informative' | 'warning' | 'success' | 'important' | 'danger'> = {
  client_decision: 'important',
  consultant_task: 'informative',
  assumption: 'success',
  accepted_gap: 'warning',
  export_blocker: 'danger',
};

const statusIcon = (status: string) => {
  if (status === 'ready') return <CheckmarkCircleRegular />;
  if (status === 'blocked') return <DismissCircleRegular />;
  return <WarningRegular />;
};

const todayIso = () => new Date().toISOString();

const parseIdList = (value: string) =>
  value.split(',').map((item) => item.trim()).filter(Boolean);

const formatIdList = (values?: string[]) => values?.join(', ') || '';

export const ConsultantWorkflowPanel: React.FC = () => {
  const styles = useStyles();
  const [activeStep, setActiveStep] = React.useState<ConsultantWorkflowStepId>('brief');
  const [newRequirementTitle, setNewRequirementTitle] = React.useState('');
  const [newRequirementDetail, setNewRequirementDetail] = React.useState('');
  const [journeySourceId, setJourneySourceId] = React.useState('');
  const [journeyTargetType, setJourneyTargetType] = React.useState<DrillActionTargetType>('view');
  const [journeyTargetId, setJourneyTargetId] = React.useState('detail');
  const [journeyLabel, setJourneyLabel] = React.useState('');
  const [journeyContextSource, setJourneyContextSource] = React.useState('');
  const [journeyContextTarget, setJourneyContextTarget] = React.useState('');
  const scenario = useStore((s) => s.scenario);
  const items = useStore((s) => s.items);
  const filters = useStore((s) => s.filters);
  const layoutMode = useStore((s) => s.layoutMode);
  const exportMode = useStore((s) => s.exportMode);
  const drillActions = useStore((s) => s.drillActions);
  const addDrillAction = useStore((s) => s.addDrillAction);
  const specification = useStore((s) => s.specification);
  const updateSpecification = useStore((s) => s.updateSpecification);
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
  const workflow = React.useMemo(() => createConsultantWorkflowModel(currentSpec), [currentSpec]);
  const dataPath = React.useMemo(() => createPhantomDataPath(currentSpec), [currentSpec]);
  const gate = React.useMemo(() => createPhantomImplementationGate(currentSpec), [currentSpec]);
  const intent = React.useMemo(() => createPhantomWorkshopIntentCompleteness(currentSpec), [currentSpec]);
  const recommendation = React.useMemo(
    () => createHandoffRecommendation(gate.reactReady, gate.powerBiReady),
    [gate.powerBiReady, gate.reactReady],
  );
  const handoffSummary = React.useMemo(() => createPhantomHandoffSummary(currentSpec), [currentSpec]);
  const requirements = specification.requirementItems || [];
  const designSources = specification.designSources || [];
  const dataSources = specification.dataSources || [];

  const updateRequirements = (nextRequirements: RequirementItem[]) => {
    updateSpecification({ requirementItems: nextRequirements });
  };

  const upsertRequirement = (item: RequirementItem) => {
    const exists = requirements.some((requirement) => requirement.id === item.id);
    updateRequirements(exists
      ? requirements.map((requirement) => requirement.id === item.id ? item : requirement)
      : [...requirements, item]);
  };

  const acceptSuggestion = (
    suggestion: RequirementSuggestion,
    disposition: RequirementDisposition = suggestion.disposition,
  ) => {
    upsertRequirement(createRequirementItemFromSuggestion(suggestion, { disposition }));
  };

  const updateRequirement = (id: string, updates: Partial<RequirementItem>) => {
    updateRequirements(requirements.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: todayIso() } : item,
    ));
  };

  const addManualRequirement = (disposition: RequirementDisposition) => {
    const title = newRequirementTitle.trim();
    if (!title) return;
    const now = todayIso();
    updateRequirements([
      ...requirements,
      {
        id: `req-manual-${Date.now()}`,
        title,
        detail: newRequirementDetail.trim() || undefined,
        disposition,
        status: 'open',
        source: 'consultant',
        ownerRole: disposition === 'client_decision' ? 'client_stakeholder' : 'consultant',
        createdAt: now,
        updatedAt: now,
      },
    ]);
    setNewRequirementTitle('');
    setNewRequirementDetail('');
  };

  const applySensibleDefaults = () => {
    updateSpecification({
      grain: specification.grain || 'monthly',
      refreshCadence: specification.refreshCadence || 'weekly',
      designEntryPoint: specification.designEntryPoint || 'phantom-led',
      designSources: specification.designSources?.length
        ? specification.designSources
        : [{
          id: 'phantom-defaults',
          type: 'phantomDefault',
          name: 'Phantom analytical defaults',
          linkedViewIds: ['main'],
          linkedComponentIds: items.map((item) => item.id),
          notes: 'Consultant-owned default design baseline for workshop speed.',
        }],
      requirementItems: [
        ...requirements,
        {
          id: `req-assumption-defaults-${Date.now()}`,
          title: 'Use Phantom analytical defaults unless challenged',
          detail: 'Monthly grain, weekly refresh, and Phantom default design source are acceptable workshop assumptions until the client or delivery team replaces them.',
          disposition: 'assumption',
          status: 'resolved',
          source: 'consultant',
          ownerRole: 'consultant',
          resolution: 'Applied default design, grain, and refresh assumptions.',
          createdAt: todayIso(),
          updatedAt: todayIso(),
        },
      ],
    });
  };

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

  const addDesignSource = (type: DesignSourceType) => {
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

  const createBlankDataSource = (type: DataSourceReferenceType = 'dbt'): DataSourceReference => ({
    id: `data-source-${Date.now()}`,
    type,
    name: '',
  });

  const updateDataSourceAt = (index: number, updates: Partial<DataSourceReference>) => {
    const nextSources = dataSources.length ? [...dataSources] : [createBlankDataSource()];
    const currentSource = nextSources[index] || createBlankDataSource();
    nextSources[index] = {
      ...currentSource,
      id: currentSource.id || `data-source-${Date.now()}`,
      name: currentSource.name || '',
      ...updates,
    };
    updateSpecification({ dataSources: nextSources });
  };

  const addDataSource = (type: DataSourceReferenceType) => {
    updateSpecification({
      dataSources: [...dataSources, createBlankDataSource(type)],
    });
  };

  const removeDataSource = (index: number) => {
    updateSpecification({
      dataSources: dataSources.filter((_, sourceIndex) => sourceIndex !== index),
    });
  };

  const downloadJson = (payload: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadSpec = () => {
    const date = new Date().toISOString().split('T')[0];
    downloadJson(currentSpec, `${scenario}_Phantom_Spec_${date}.json`);
  };

  const downloadSummary = () => {
    const date = new Date().toISOString().split('T')[0];
    downloadJson(handoffSummary, `${scenario}_Handoff_Summary_${date}.json`);
  };

  const addJourney = () => {
    const sourceComponentId = journeySourceId || items[0]?.id;
    if (!sourceComponentId || !journeyTargetId.trim()) return;
    const label = journeyLabel.trim() || `Open ${journeyTargetId.trim()}`;
    addDrillAction({
      id: `drill-${Date.now()}`,
      sourceComponentId,
      trigger: 'click',
      targetType: journeyTargetType,
      targetId: journeyTargetId.trim(),
      label,
      context: journeyContextSource.trim() && journeyContextTarget.trim()
        ? [{ source: journeyContextSource.trim(), target: journeyContextTarget.trim() }]
        : [],
      preserveFilters: true,
      notes: 'Captured in the consultant workflow.',
    });
    setJourneySourceId(sourceComponentId);
    setJourneyTargetId('detail');
    setJourneyLabel('');
    setJourneyContextSource('');
    setJourneyContextTarget('');
  };

  const renderRequirementCard = (item: RequirementItem) => (
    <div className={styles.card} key={item.id}>
      <div className={styles.cardHeader}>
        <div className={styles.cardText}>
          <Text className={styles.cardTitle}>{item.title}</Text>
          {item.detail && <Text className={styles.smallText}>{item.detail}</Text>}
        </div>
        <Badge appearance="filled" color={dispositionColors[item.disposition]}>
          {dispositionLabels[item.disposition]}
        </Badge>
      </div>
      <div className={styles.twoColumn}>
        <Select
          size="small"
          value={item.disposition}
          onChange={(_, data) => updateRequirement(item.id, {
            disposition: data.value as RequirementDisposition,
          })}
        >
          {Object.entries(dispositionLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select
          size="small"
          value={item.status}
          onChange={(_, data) => updateRequirement(item.id, {
            status: data.value as RequirementItem['status'],
          })}
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="deferred">Deferred</option>
        </Select>
      </div>
      <Textarea
        className={styles.compactTextarea}
        placeholder="Decision, assumption, accepted gap, or implementation note..."
        value={item.resolution || ''}
        onChange={(_, data) => updateRequirement(item.id, { resolution: data.value })}
        resize="vertical"
      />
      <div className={styles.actionRow}>
        <Button size="small" appearance="primary" onClick={() => updateRequirement(item.id, { status: 'resolved' })}>
          Mark resolved
        </Button>
        <Button size="small" appearance="subtle" onClick={() => updateRequirements(requirements.filter((requirement) => requirement.id !== item.id))}>
          Remove
        </Button>
      </div>
    </div>
  );

  const renderBrief = () => (
    <>
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Fast Capture</Text>
        <div className={styles.field}>
          <Label className={styles.label}>Workshop notes</Label>
          <Textarea
            className={styles.textarea}
            placeholder="Paste messy client notes here. Convert them into decisions, tasks, assumptions, and blockers in Clarify."
            value={specification.rawRequirementNotes || ''}
            onChange={(_, data) => updateSpecification({ rawRequirementNotes: data.value })}
            resize="vertical"
          />
        </div>
      </div>
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Client Intent</Text>
        <div className={styles.field}>
          <Label className={styles.label}>Business questions</Label>
          <Textarea className={styles.compactTextarea} value={specification.businessQuestions || ''} onChange={(_, data) => updateSpecification({ businessQuestions: data.value })} resize="vertical" />
        </div>
        <div className={styles.field}>
          <Label className={styles.label}>Audience</Label>
          <Input size="small" value={specification.audience || ''} onChange={(_, data) => updateSpecification({ audience: data.value })} />
        </div>
        <div className={styles.field}>
          <Label className={styles.label}>Decisions / actions</Label>
          <Textarea className={styles.compactTextarea} value={specification.decisions || ''} onChange={(_, data) => updateSpecification({ decisions: data.value })} resize="vertical" />
        </div>
        <div className={styles.field}>
          <Label className={styles.label}>Acceptance criteria</Label>
          <Textarea className={styles.compactTextarea} value={specification.acceptanceCriteria || ''} onChange={(_, data) => updateSpecification({ acceptanceCriteria: data.value })} resize="vertical" />
        </div>
      </div>
    </>
  );

  const renderClarify = () => (
    <>
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Generated Prompts</Text>
        {workflow.suggestions.length === 0 ? (
          <Text className={styles.smallText}>No generated prompts are waiting to be classified.</Text>
        ) : workflow.suggestions.slice(0, 8).map((suggestion) => (
          <div className={styles.card} key={suggestion.id}>
            <div className={styles.cardHeader}>
              <div className={styles.cardText}>
                <Text className={styles.cardTitle}>{suggestion.title}</Text>
                <Text className={styles.smallText}>{suggestion.detail}</Text>
              </div>
              <Badge appearance="filled" color={dispositionColors[suggestion.disposition]}>
                {dispositionLabels[suggestion.disposition]}
              </Badge>
            </div>
            <div className={styles.actionRow}>
              <Button size="small" appearance="primary" onClick={() => acceptSuggestion(suggestion)}>
                Add
              </Button>
              <Button size="small" onClick={() => acceptSuggestion(suggestion, 'client_decision')}>
                Ask client
              </Button>
              <Button size="small" onClick={() => acceptSuggestion(suggestion, 'consultant_task')}>
                Consultant owns
              </Button>
              <Button size="small" onClick={() => acceptSuggestion(suggestion, 'assumption')}>
                Make assumption
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Manual Requirement</Text>
        <Input
          size="small"
          placeholder="Requirement, decision, or assumption title"
          value={newRequirementTitle}
          onChange={(_, data) => setNewRequirementTitle(data.value)}
        />
        <Textarea
          className={styles.compactTextarea}
          placeholder="Context or notes"
          value={newRequirementDetail}
          onChange={(_, data) => setNewRequirementDetail(data.value)}
          resize="vertical"
        />
        <div className={styles.actionRow}>
          <Button size="small" appearance="primary" onClick={() => addManualRequirement('client_decision')}>
            Ask client
          </Button>
          <Button size="small" onClick={() => addManualRequirement('consultant_task')}>
            Consultant task
          </Button>
          <Button size="small" onClick={() => addManualRequirement('assumption')}>
            Assumption
          </Button>
          <Button size="small" onClick={() => addManualRequirement('accepted_gap')}>
            Accepted gap
          </Button>
        </div>
      </div>
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Open Items</Text>
        {workflow.openRequirements.length === 0 ? (
          <Text className={styles.smallText}>No open requirement items yet.</Text>
        ) : workflow.openRequirements.map(renderRequirementCard)}
      </div>
    </>
  );

  const renderDesign = () => (
    <>
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Design Progress</Text>
        <div className={styles.metricGrid}>
          <div className={styles.metric}>
            <Text className={styles.smallText}>Canvas components</Text>
            <Text className={styles.metricValue}>{items.length}</Text>
          </div>
          <div className={styles.metric}>
            <Text className={styles.smallText}>Mode</Text>
            <Text className={styles.metricValue}>{exportMode === 'react' ? 'React' : 'Power BI'}</Text>
          </div>
        </div>
        <Text className={styles.smallText}>
          Use the Visuals button for chart/table/filter components and the canvas for stakeholder-facing layout.
        </Text>
        <Button size="small" appearance="primary" onClick={applySensibleDefaults}>
          Apply consultant defaults
        </Button>
      </div>

      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Design Source</Text>
        <div className={styles.field}>
          <Label className={styles.label}>Entry point</Label>
          <Select
            size="small"
            value={specification.designEntryPoint || 'phantom-led'}
            onChange={(_, data) => updateSpecification({
              designEntryPoint: data.value as typeof specification.designEntryPoint,
            })}
          >
            <option value="phantom-led">Phantom defaults</option>
            <option value="figma-led">Figma-led</option>
          </Select>
        </div>
        <div className={styles.actionRow}>
          <Button size="small" onClick={() => addDesignSource('figmaFrame')}>Add Figma</Button>
          <Button size="small" onClick={() => addDesignSource('screenshot')}>Add screenshot</Button>
          <Button size="small" appearance="primary" onClick={() => addDesignSource('phantomDefault')}>Add defaults</Button>
        </div>
        {(designSources.length ? designSources : [{
          id: 'design-source-draft',
          type: 'figmaFrame' as DesignSourceType,
          name: '',
        }]).map((source, index) => (
          <div className={styles.card} key={source.id || `design-${index}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardText}>
                <Text className={styles.cardTitle}>{source.name || `Design source ${index + 1}`}</Text>
                <Text className={styles.smallText}>
                  Map Figma, screenshot, or Phantom defaults to views/components so handoff knows the design provenance.
                </Text>
              </div>
              <Button size="small" appearance="subtle" disabled={designSources.length === 0} onClick={() => removeDesignSource(index)}>
                Remove
              </Button>
            </div>
            <div className={styles.twoColumn}>
              <Select
                size="small"
                value={source.type || 'figmaFrame'}
                onChange={(_, data) => updateDesignSourceAt(index, { type: data.value as DesignSourceType })}
              >
                <option value="figmaFrame">Figma frame</option>
                <option value="figmaComponent">Figma component</option>
                <option value="screenshot">Screenshot</option>
                <option value="externalReference">External ref</option>
                <option value="phantomDefault">Phantom default</option>
              </Select>
              <Input
                size="small"
                placeholder="Source name"
                value={source.name || ''}
                onChange={(_, data) => updateDesignSourceAt(index, { name: data.value })}
              />
            </div>
            <Input
              size="small"
              placeholder="Figma/screenshot/reference URL"
              value={source.url || ''}
              onChange={(_, data) => updateDesignSourceAt(index, { url: data.value })}
            />
            <div className={styles.twoColumn}>
              <Input
                size="small"
                placeholder="Frame ID"
                value={source.frameId || ''}
                onChange={(_, data) => updateDesignSourceAt(index, { frameId: data.value })}
              />
              <Input
                size="small"
                placeholder="Component ID"
                value={source.componentId || ''}
                onChange={(_, data) => updateDesignSourceAt(index, { componentId: data.value })}
              />
            </div>
            <Input
              size="small"
              placeholder="Linked components, comma-separated"
              value={formatIdList(source.linkedComponentIds)}
              onChange={(_, data) => updateDesignSourceAt(index, {
                linkedComponentIds: parseIdList(data.value),
              })}
            />
            <Textarea
              className={styles.compactTextarea}
              placeholder="Design notes for handoff"
              value={source.notes || ''}
              onChange={(_, data) => updateDesignSourceAt(index, { notes: data.value })}
              resize="vertical"
            />
          </div>
        ))}
      </div>
    </>
  );

  const renderInteractions = () => (
    <>
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Define Journey</Text>
        <div className={styles.field}>
          <Label className={styles.label}>Source component</Label>
          <Select
            size="small"
            value={journeySourceId || items[0]?.id || ''}
            onChange={(_, data) => setJourneySourceId(data.value)}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.title || item.id}</option>
            ))}
          </Select>
        </div>
        <div className={styles.twoColumn}>
          <div className={styles.field}>
            <Label className={styles.label}>Target type</Label>
            <Select
              size="small"
              value={journeyTargetType}
              onChange={(_, data) => setJourneyTargetType(data.value as DrillActionTargetType)}
            >
              <option value="view">Page/view</option>
              <option value="detailPanel">Detail panel</option>
              <option value="modal">Modal</option>
              <option value="entityProfile">Entity profile</option>
              <option value="externalUrl">External URL</option>
            </Select>
          </div>
          <div className={styles.field}>
            <Label className={styles.label}>Target ID</Label>
            <Input
              size="small"
              placeholder="detail"
              value={journeyTargetId}
              onChange={(_, data) => setJourneyTargetId(data.value)}
            />
          </div>
        </div>
        <Input
          size="small"
          placeholder="Journey label, e.g. Open customer detail"
          value={journeyLabel}
          onChange={(_, data) => setJourneyLabel(data.value)}
        />
        <div className={styles.twoColumn}>
          <Input
            size="small"
            placeholder="Context source field"
            value={journeyContextSource}
            onChange={(_, data) => setJourneyContextSource(data.value)}
          />
          <Input
            size="small"
            placeholder="Target parameter"
            value={journeyContextTarget}
            onChange={(_, data) => setJourneyContextTarget(data.value)}
          />
        </div>
        <Button size="small" appearance="primary" onClick={addJourney} disabled={items.length === 0}>
          Add journey
        </Button>
      </div>

      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Analytical Journeys</Text>
        {drillActions.length === 0 ? (
          <Text className={styles.smallText}>
            No drill-throughs or journey actions are defined. Capture intended click paths here or classify them as consultant tasks.
          </Text>
        ) : drillActions.map((action) => (
          <div className={styles.card} key={action.id}>
            <Text className={styles.cardTitle}>{action.label}</Text>
            <Text className={styles.smallText}>
              {action.sourceComponentId} to {action.targetType}:{action.targetId}
            </Text>
            <Text className={styles.smallText}>
              Context: {action.context.map((context) => `${context.source} to ${context.target}`).join(', ') || 'none'}; preserve filters: {action.preserveFilters ? 'yes' : 'no'}
            </Text>
          </div>
        ))}
      </div>
    </>
  );

  const renderData = () => (
    <>
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Data Contract</Text>
        <div className={styles.twoColumn}>
          <div className={styles.field}>
            <Label className={styles.label}>Grain</Label>
            <Select size="small" value={specification.grain || ''} onChange={(_, data) => updateSpecification({ grain: data.value as typeof specification.grain })}>
              <option value="">Select...</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>
          <div className={styles.field}>
            <Label className={styles.label}>Refresh</Label>
            <Select size="small" value={specification.refreshCadence || ''} onChange={(_, data) => updateSpecification({ refreshCadence: data.value as typeof specification.refreshCadence })}>
              <option value="">Select...</option>
              <option value="real-time">Real-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="on-demand">On-demand</option>
            </Select>
          </div>
        </div>
        <Textarea
          className={styles.compactTextarea}
          placeholder="Source systems, data owners, warehouse/dbt/API notes..."
          value={specification.sourceSystems || ''}
          onChange={(_, data) => updateSpecification({ sourceSystems: data.value })}
          resize="vertical"
        />
        <div className={styles.metricGrid}>
          <div className={styles.metric}>
            <Text className={styles.smallText}>Unmapped components</Text>
            <Text className={styles.metricValue}>{dataPath.unmappedComponents.length}</Text>
          </div>
          <div className={styles.metric}>
            <Text className={styles.smallText}>Unmapped fields</Text>
            <Text className={styles.metricValue}>{dataPath.unmappedFields.length}</Text>
          </div>
        </div>
        {dataPath.requiredNextSteps.slice(0, 4).map((step) => (
          <Text className={styles.smallText} key={step}>Next: {step}</Text>
        ))}
      </div>

      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Structured Sources</Text>
        <div className={styles.actionRow}>
          <Button size="small" onClick={() => addDataSource('dbt')}>Add dbt</Button>
          <Button size="small" onClick={() => addDataSource('api')}>Add API</Button>
          <Button size="small" onClick={() => addDataSource('warehouse')}>Add warehouse</Button>
          <Button size="small" onClick={() => addDataSource('manual')}>Add manual</Button>
        </div>
        {(dataSources.length ? dataSources : [{
          id: 'data-source-draft',
          type: 'dbt' as DataSourceReferenceType,
          name: '',
        }]).map((source, index) => (
          <div className={styles.card} key={source.id || `data-${index}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardText}>
                <Text className={styles.cardTitle}>{source.name || `Data source ${index + 1}`}</Text>
                <Text className={styles.smallText}>
                  Map source fields/components so exports tell humans and agents what to wire.
                </Text>
              </div>
              <Button size="small" appearance="subtle" disabled={dataSources.length === 0} onClick={() => removeDataSource(index)}>
                Remove
              </Button>
            </div>
            <div className={styles.twoColumn}>
              <Select
                size="small"
                value={source.type || 'dbt'}
                onChange={(_, data) => updateDataSourceAt(index, { type: data.value as DataSourceReferenceType })}
              >
                <option value="dbt">dbt model</option>
                <option value="warehouse">Warehouse</option>
                <option value="api">REST API</option>
                <option value="graphql">GraphQL</option>
                <option value="semantic">Semantic API</option>
                <option value="file">File</option>
                <option value="manual">Manual</option>
                <option value="unknown">Unknown</option>
              </Select>
              <Input
                size="small"
                placeholder="Source name"
                value={source.name || ''}
                onChange={(_, data) => updateDataSourceAt(index, { name: data.value })}
              />
            </div>
            <div className={styles.twoColumn}>
              <Input
                size="small"
                placeholder="Model/table"
                value={source.model || ''}
                onChange={(_, data) => updateDataSourceAt(index, { model: data.value })}
              />
              <Input
                size="small"
                placeholder="Endpoint URL"
                value={source.url || ''}
                onChange={(_, data) => updateDataSourceAt(index, { url: data.value })}
              />
            </div>
            <Input
              size="small"
              placeholder="Linked components, comma-separated"
              value={formatIdList(source.linkedComponentIds)}
              onChange={(_, data) => updateDataSourceAt(index, {
                linkedComponentIds: parseIdList(data.value),
              })}
            />
            <Input
              size="small"
              placeholder="Linked fields, comma-separated"
              value={formatIdList(source.linkedFields)}
              onChange={(_, data) => updateDataSourceAt(index, {
                linkedFields: parseIdList(data.value),
              })}
            />
            <Textarea
              className={styles.compactTextarea}
              placeholder="Ownership, transformations, API assumptions, or open data questions"
              value={source.description || ''}
              onChange={(_, data) => updateDataSourceAt(index, { description: data.value })}
              resize="vertical"
            />
          </div>
        ))}
      </div>
    </>
  );

  const renderReview = () => (
    <>
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Client Review Pack</Text>
        <div className={styles.metricGrid}>
          <div className={styles.metric}>
            <Text className={styles.smallText}>Client decisions</Text>
            <Text className={styles.metricValue}>{handoffSummary.requirements.clientQuestions.length}</Text>
          </div>
          <div className={styles.metric}>
            <Text className={styles.smallText}>Assumptions</Text>
            <Text className={styles.metricValue}>{handoffSummary.requirements.assumptions.length}</Text>
          </div>
          <div className={styles.metric}>
            <Text className={styles.smallText}>Accepted gaps</Text>
            <Text className={styles.metricValue}>{handoffSummary.requirements.acceptedGaps.length}</Text>
          </div>
          <div className={styles.metric}>
            <Text className={styles.smallText}>Export blockers</Text>
            <Text className={styles.metricValue}>{handoffSummary.requirements.exportBlockers.length}</Text>
          </div>
        </div>
        {handoffSummary.requirements.clientQuestions.slice(0, 4).map((item) => (
          <Text className={styles.smallText} key={item.id}>Ask client: {item.title}</Text>
        ))}
        {handoffSummary.requirements.assumptions.slice(0, 4).map((item) => (
          <Text className={styles.smallText} key={item.id}>Assumption: {item.title}</Text>
        ))}
      </div>

      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Review And Approval</Text>
        <div className={styles.metricGrid}>
          <div className={styles.metric}>
            <Text className={styles.smallText}>Intent</Text>
            <Badge appearance="filled" color={intent.complete ? 'success' : 'warning'}>
              {intent.complete ? 'Ready' : 'Missing'}
            </Badge>
          </div>
          <div className={styles.metric}>
            <Text className={styles.smallText}>Gate</Text>
            <Badge appearance="filled" color={gate.readyForImplementation ? 'success' : 'warning'}>
              {gate.readyForImplementation ? 'Ready' : 'Not ready'}
            </Badge>
          </div>
        </div>
        <div className={styles.field}>
          <Label className={styles.label}>Sign-off status</Label>
          <Select
            size="small"
            value={specification.signOffStatus || 'draft'}
            onChange={(_, data) => updateSpecification({ signOffStatus: data.value as typeof specification.signOffStatus })}
          >
            <option value="draft">Draft</option>
            <option value="in-review">In review</option>
            <option value="approved">Approved</option>
          </Select>
        </div>
        {gate.requiredNextSteps.slice(0, 6).map((step) => (
          <Text className={styles.smallText} key={step}>Next: {step}</Text>
        ))}
      </div>
    </>
  );

  const renderExport = () => (
    <div className={styles.section}>
      <Text className={styles.sectionHeader}>Handoff Readiness</Text>
      <Badge appearance="filled" color={gate.readyForImplementation ? 'success' : 'warning'}>
        {gate.readyForImplementation ? recommendation.target.replace(/-/g, ' ') : 'fix before handoff'}
      </Badge>
      <Text className={styles.smallText}>
        {gate.readyForImplementation
          ? recommendation.guidance
          : 'Resolve the implementation gate items before treating this as a build contract.'}
      </Text>
      <div className={styles.metricGrid}>
        <div className={styles.metric}>
          <Text className={styles.smallText}>Open items</Text>
          <Text className={styles.metricValue}>{handoffSummary.requirements.openItems.length}</Text>
        </div>
        <div className={styles.metric}>
          <Text className={styles.smallText}>Components</Text>
          <Text className={styles.metricValue}>{handoffSummary.counts.components}</Text>
        </div>
        <div className={styles.metric}>
          <Text className={styles.smallText}>Fields</Text>
          <Text className={styles.metricValue}>{handoffSummary.counts.fields}</Text>
        </div>
        <div className={styles.metric}>
          <Text className={styles.smallText}>Journeys</Text>
          <Text className={styles.metricValue}>{handoffSummary.counts.drillActions}</Text>
        </div>
      </div>
      {gate.requiredNextSteps.slice(0, 5).map((step) => (
        <Text className={styles.smallText} key={step}>Before handoff: {step}</Text>
      ))}
      <div className={styles.actionRow}>
        <Button size="small" appearance="primary" onClick={downloadSpec}>
          Download spec
        </Button>
        <Button size="small" onClick={downloadSummary}>
          Download summary
        </Button>
      </div>
      <Text className={styles.smallText}>
        Use the top Export menu for the full Handoff Pack, React Build Pack, Data Contract, or Power BI Build Guide.
      </Text>
    </div>
  );

  const renderActiveStep = () => {
    if (activeStep === 'brief') return renderBrief();
    if (activeStep === 'clarify') return renderClarify();
    if (activeStep === 'design') return renderDesign();
    if (activeStep === 'interactions') return renderInteractions();
    if (activeStep === 'data') return renderData();
    if (activeStep === 'review') return renderReview();
    return renderExport();
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Text className={styles.title}>Consultant Workflow</Text>
          <Badge appearance="filled" color={gate.readyForImplementation ? 'success' : 'warning'}>
            {gate.readyForImplementation ? 'Build-ready' : 'In workshop'}
          </Badge>
        </div>
        <Text className={styles.subtitle}>
          Capture messy client requirements, classify what needs refinement, and turn the canvas into a clean spec for humans or agents.
        </Text>
      </div>

      <div className={styles.stepList}>
        {workflow.steps.map((step) => (
          <Button
            key={step.id}
            className={styles.stepButton}
            appearance={activeStep === step.id ? 'primary' : 'secondary'}
            icon={statusIcon(step.status)}
            onClick={() => setActiveStep(step.id)}
          >
            {step.label}
          </Button>
        ))}
      </div>

      <div className={styles.body}>
        <div className={styles.section}>
          <div className={styles.titleRow}>
            <Text className={styles.sectionHeader}>Current Step</Text>
            <ClipboardTextEditRegular />
          </div>
          {workflow.steps.filter((step) => step.id === activeStep).map((step) => (
            <div key={step.id}>
              <Text className={styles.cardTitle}>{step.summary}</Text>
              {step.nextAction && <Text className={styles.smallText}>Next: {step.nextAction}</Text>}
            </div>
          ))}
        </div>
        {renderActiveStep()}
      </div>
    </div>
  );
};
