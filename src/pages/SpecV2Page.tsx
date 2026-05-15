import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Text,
  Title2,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import { ArrowLeftRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';
import v2SpecMarkdown from '../../phantom_product_spec_v0.2.md?raw';
import {
  applyPhantomSpecV2Approval,
  applyPhantomSpecV2PromptResolution,
  createPhantomSpecV2AcceptedGaps,
  createPhantomSpecV2ApprovalStatus,
  createPhantomSpecV2DataContractExport,
  createPhantomSpecV2ElicitationPrompts,
  createPhantomSpecV2PowerBiExport,
  createPhantomSpecV2ReactProductExport,
  createPhantomSpecV2Summary,
  parsePhantomSpecV2Markdown,
  replacePhantomSpecV2Frontmatter,
  scorePhantomSpecV2Readiness,
  validatePhantomSpecV2Document,
} from '../export/phantomSpecV2';

const useStyles = makeStyles({
  page: {
    minHeight: '100vh',
    backgroundColor: '#F7F8FA',
    color: '#172033',
  },
  topBar: {
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #D9DEE8',
    ...shorthands.padding('0', '22px'),
  },
  header: {
    maxWidth: '1380px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.2fr 0.8fr',
    gap: '18px',
    ...shorthands.padding('22px'),
    '@media (max-width: 900px)': {
      gridTemplateColumns: '1fr',
    },
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  subText: {
    color: '#536071',
    lineHeight: 1.45,
    maxWidth: '760px',
  },
  scoreStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '10px',
    '@media (max-width: 620px)': {
      gridTemplateColumns: '1fr',
    },
  },
  metric: {
    backgroundColor: '#FFFFFF',
    ...shorthands.border('1px', 'solid', '#D9DEE8'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('12px'),
    minHeight: '86px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: '#687386',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '26px',
    fontWeight: 750,
    lineHeight: 1.1,
  },
  shell: {
    maxWidth: '1380px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '260px minmax(0, 1fr) 360px',
    gap: '16px',
    ...shorthands.padding('0', '22px', '24px'),
    '@media (max-width: 1080px)': {
      gridTemplateColumns: '1fr',
    },
  },
  panel: {
    backgroundColor: '#FFFFFF',
    ...shorthands.border('1px', 'solid', '#D9DEE8'),
    ...shorthands.borderRadius('8px'),
    minWidth: 0,
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #E7EAF0',
    ...shorthands.padding('12px', '14px'),
  },
  panelBody: {
    ...shorthands.padding('14px'),
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  navButton: {
    justifyContent: 'flex-start',
  },
  canvas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
    gap: '12px',
  },
  previewItem: {
    gridColumn: 'span 6',
    minHeight: '128px',
    backgroundColor: '#FBFCFD',
    ...shorthands.border('1px', 'solid', '#E0E5ED'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('14px'),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '12px',
    '@media (max-width: 760px)': {
      gridColumn: 'span 12',
    },
  },
  previewTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  miniChart: {
    height: '42px',
    display: 'flex',
    alignItems: 'end',
    gap: '6px',
  },
  bar: {
    width: '18px',
    backgroundColor: '#427AA1',
    ...shorthands.borderRadius('3px', '3px', '0', '0'),
  },
  tableRows: {
    display: 'grid',
    gap: '7px',
  },
  tableRow: {
    height: '9px',
    backgroundColor: '#D9E6EC',
    ...shorthands.borderRadius('999px'),
  },
  prompt: {
    ...shorthands.border('1px', 'solid', '#E2C16B'),
    backgroundColor: '#FFF8E6',
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('10px'),
    display: 'grid',
    gap: '6px',
  },
  list: {
    display: 'grid',
    gap: '8px',
  },
  listItem: {
    ...shorthands.border('1px', 'solid', '#E7EAF0'),
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('10px'),
    display: 'grid',
    gap: '4px',
  },
  source: {
    maxHeight: '280px',
    overflow: 'auto',
    backgroundColor: '#101923',
    color: '#DDE7F0',
    ...shorthands.borderRadius('8px'),
    ...shorthands.padding('12px'),
    fontFamily: 'Consolas, "Courier New", monospace',
    fontSize: '12px',
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap',
  },
  tabRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
});

type RightPanel = 'elicitation' | 'data' | 'approval' | 'exports';

const percent = (value: number) => `${Math.round(value * 100)}%`;

export const SpecV2Page: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [rightPanel, setRightPanel] = useState<RightPanel>('elicitation');
  const [specMarkdown, setSpecMarkdown] = useState(v2SpecMarkdown);
  const model = useMemo(() => {
    const document = parsePhantomSpecV2Markdown(specMarkdown);
    return {
      document,
      validation: validatePhantomSpecV2Document(document),
      summary: createPhantomSpecV2Summary(document),
      reactReadiness: scorePhantomSpecV2Readiness(document, 'react'),
      powerBiReadiness: scorePhantomSpecV2Readiness(document, 'power_bi'),
      prompts: createPhantomSpecV2ElicitationPrompts(document),
      dataContract: createPhantomSpecV2DataContractExport(document),
      acceptedGaps: createPhantomSpecV2AcceptedGaps(document),
      approval: createPhantomSpecV2ApprovalStatus(document),
      reactExport: createPhantomSpecV2ReactProductExport(document),
      powerBiExport: createPhantomSpecV2PowerBiExport(document),
    };
  }, [specMarkdown]);
  const pages = model.document.blocks.find((block) => block.header.id === 'pages')?.body.pages;
  const pageList = Array.isArray(pages) ? pages : [];
  const components = model.reactExport.components;
  const resolveFirstPrompt = () => {
    const prompt = model.prompts.find((item) => item.objectType === 'component');
    if (!prompt) return;
    const result = applyPhantomSpecV2PromptResolution(specMarkdown, {
      objectType: 'component',
      objectId: prompt.objectId,
      fieldPath: prompt.fieldPath,
      value: 'Document Power BI as an implementation note and use React for exact workshop behavior.',
      ownerRole: prompt.ownerRole || 'dashboard_builder',
      date: '2026-05-15',
      notes: 'Resolved in the v0.2 workshop surface.',
    });
    setSpecMarkdown(result.markdown);
  };
  const approveAs = (role: 'approver' | 'analytics_owner') => {
    const result = applyPhantomSpecV2Approval(model.document, {
      approver: role === 'approver' ? 'Workshop approver' : 'Analytics owner',
      role,
      date: '2026-05-15',
      notes: 'Approved in the v0.2 workshop surface.',
    });
    setSpecMarkdown(replacePhantomSpecV2Frontmatter(specMarkdown, result.frontmatter));
  };

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Button icon={<ArrowLeftRegular />} appearance="subtle" onClick={() => navigate('/editor')}>
          Editor
        </Button>
        <Badge appearance="filled" color={model.validation.valid ? 'success' : 'danger'}>
          v0.2 spec {model.validation.valid ? 'valid' : 'invalid'}
        </Badge>
      </div>

      <section className={styles.header}>
        <div className={styles.heroText}>
          <Title2>Phantom v0.2 spec workspace</Title2>
          <Text className={styles.subText}>
            A workshop surface backed by the Markdown/YAML build contract. The preview, prompts,
            data contract, approvals, and export packs all come from the parsed v0.2 spec.
          </Text>
        </div>
        <div className={styles.scoreStrip}>
          <div className={styles.metric}>
            <Text className={styles.metricLabel}>React readiness</Text>
            <Text className={styles.metricValue}>{percent(model.reactReadiness.score)}</Text>
            <Badge color={model.reactReadiness.buildReady ? 'success' : 'warning'}>
              {model.reactReadiness.buildReady ? 'Build ready' : 'Blocked'}
            </Badge>
          </div>
          <div className={styles.metric}>
            <Text className={styles.metricLabel}>Power BI readiness</Text>
            <Text className={styles.metricValue}>{percent(model.powerBiReadiness.score)}</Text>
            <Badge color={model.powerBiReadiness.buildReady ? 'success' : 'warning'}>
              {model.powerBiReadiness.buildReady ? 'Build ready' : 'Constrained'}
            </Badge>
          </div>
          <div className={styles.metric}>
            <Text className={styles.metricLabel}>Unresolved prompts</Text>
            <Text className={styles.metricValue}>{model.prompts.length}</Text>
            <Badge color={model.prompts.length === 0 ? 'success' : 'important'}>
              {model.prompts.length === 0 ? 'Resolved' : 'Needs answer'}
            </Badge>
          </div>
        </div>
      </section>

      <section className={styles.shell}>
        <aside className={styles.panel} aria-label="Spec navigation">
          <div className={styles.panelHeader}>
            <Text weight="semibold">Spec pages</Text>
            <Badge>{pageList.length}</Badge>
          </div>
          <div className={styles.panelBody}>
            {pageList.map((page) => {
              const record = page as Record<string, unknown>;
              return (
                <Button
                  key={String(record.id)}
                  appearance="subtle"
                  className={styles.navButton}
                >
                  {String(record.title || record.id)}
                </Button>
              );
            })}
          </div>
        </aside>

        <section className={styles.panel} aria-label="Spec canvas">
          <div className={styles.panelHeader}>
            <Text weight="semibold">Spec canvas</Text>
            <Badge>{components.length} components</Badge>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.canvas}>
              {components.map((component, index) => (
                <div key={component.id} className={styles.previewItem}>
                  <div className={styles.previewTitle}>
                    <div>
                      <Text weight="semibold">{component.title || component.id}</Text>
                      <br />
                      <Text size={200}>{component.type}</Text>
                    </div>
                    <Badge color={component.unresolvedPrompts.length > 0 ? 'important' : 'success'}>
                      {component.unresolvedPrompts.length > 0 ? 'Prompt' : 'Ready'}
                    </Badge>
                  </div>
                  {component.type === 'data_table' ? (
                    <div className={styles.tableRows} aria-hidden="true">
                      {[88, 74, 92, 63].map((width) => (
                        <div key={width} className={styles.tableRow} style={{ width: `${width}%` }} />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.miniChart} aria-hidden="true">
                      {[42, 28, 36, 54, 46].map((height, barIndex) => (
                        <div
                          key={`${component.id}-${barIndex}`}
                          className={styles.bar}
                          style={{
                            height: `${height + index * 4}px`,
                            backgroundColor: barIndex % 2 === 0 ? '#427AA1' : '#8A6F3D',
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <Text size={200}>
                    React: {String(component.renderTargets.react || 'unknown')} | Power BI:{' '}
                    {String(component.renderTargets.power_bi || 'unknown')}
                  </Text>
                </div>
              ))}
            </div>
            <pre className={styles.source}>{specMarkdown.slice(0, 1800)}...</pre>
          </div>
        </section>

        <aside className={styles.panel} aria-label="Spec details">
          <div className={styles.panelHeader}>
            <Text weight="semibold">Workshop controls</Text>
            <Badge>{rightPanel}</Badge>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.tabRow}>
              {(['elicitation', 'data', 'approval', 'exports'] as RightPanel[]).map((panel) => (
                <Button
                  key={panel}
                  size="small"
                  appearance={rightPanel === panel ? 'primary' : 'secondary'}
                  onClick={() => setRightPanel(panel)}
                >
                  {panel}
                </Button>
              ))}
            </div>

            {rightPanel === 'elicitation' && (
              <div className={styles.list}>
                {model.prompts.length === 0 && (
                  <div className={styles.listItem}>
                    <Text weight="semibold">All prompts resolved</Text>
                    <Text size={200}>
                      The spec has no unresolved elicitation prompts in the current workshop state.
                    </Text>
                  </div>
                )}
                {model.prompts.map((prompt) => (
                  <div key={prompt.id} className={styles.prompt}>
                    <Text weight="semibold">{prompt.prompt}</Text>
                    <Text size={200}>{prompt.reason}</Text>
                    <Text size={200}>Owner: {prompt.ownerRole || 'unassigned'}</Text>
                    {prompt.objectType === 'component' && (
                      <Button size="small" appearance="primary" onClick={resolveFirstPrompt}>
                        Resolve prompt
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {rightPanel === 'data' && (
              <div className={styles.list}>
                {model.dataContract.fields.map((field) => (
                  <div key={String(field.id)} className={styles.listItem}>
                    <Text weight="semibold">{String(field.display_name || field.id)}</Text>
                    <Text size={200}>
                      {String(field.type)} from {String(field.source)}
                    </Text>
                  </div>
                ))}
                {model.acceptedGaps.map((gap) => (
                  <div key={gap.fieldId} className={styles.prompt}>
                    <Text weight="semibold">Accepted gap: {gap.fieldLabel || gap.fieldId}</Text>
                    <Text size={200}>{gap.reason}</Text>
                  </div>
                ))}
              </div>
            )}

            {rightPanel === 'approval' && (
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <Text weight="semibold">Current version</Text>
                  <Text>{model.approval.currentVersion}</Text>
                </div>
                <div className={styles.listItem}>
                  <Text weight="semibold">Approval state</Text>
                  <Text>{model.approval.state || 'unknown'}</Text>
                  <Text size={200}>
                    Missing roles: {model.approval.missingApprovalRoles.join(', ') || 'none'}
                  </Text>
                  <div className={styles.tabRow}>
                    <Button
                      size="small"
                      appearance="primary"
                      disabled={!model.approval.missingApprovalRoles.includes('approver')}
                      onClick={() => approveAs('approver')}
                    >
                      Approve as approver
                    </Button>
                    <Button
                      size="small"
                      appearance="primary"
                      disabled={!model.approval.missingApprovalRoles.includes('analytics_owner')}
                      onClick={() => approveAs('analytics_owner')}
                    >
                      Approve as analytics owner
                    </Button>
                  </div>
                </div>
                <div className={styles.listItem}>
                  <Text weight="semibold">Stale approval</Text>
                  <Text>{model.approval.stale ? 'Yes' : 'No'}</Text>
                </div>
              </div>
            )}

            {rightPanel === 'exports' && (
              <div className={styles.list}>
                <div className={styles.listItem}>
                  <Text weight="semibold">React Product Mode</Text>
                  <Text size={200}>
                    Routes: {model.reactExport.routeManifest.length}; components:{' '}
                    {model.reactExport.components.length}
                  </Text>
                  <Text size={200}>Build ready: {model.reactExport.buildReady ? 'yes' : 'no'}</Text>
                </div>
                <div className={styles.listItem}>
                  <Text weight="semibold">Power BI Mode</Text>
                  <Text size={200}>
                    Visuals: {model.powerBiExport.visualBuildMatrix.length}; fallbacks:{' '}
                    {model.powerBiExport.visualBuildMatrix.filter((item) => item.fallbackRequired).length}
                  </Text>
                  <Text size={200}>Build ready: {model.powerBiExport.buildReady ? 'yes' : 'no'}</Text>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
};
