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
} from '@fluentui/react-components';
import { useStore } from '../store/useStore';
import type { DashboardSpecification, DesignSource, DesignSourceType } from '../types';

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
});

export const SpecificationPanel: React.FC = () => {
  const styles = useStyles();
  const specification = useStore((s) => s.specification);
  const updateSpecification = useStore((s) => s.updateSpecification);

  const handleChange = (field: keyof DashboardSpecification, value: string) => {
    updateSpecification({ [field]: value });
  };

  const primaryDesignSource = specification.designSources?.[0];
  const designEntryPoint = specification.designEntryPoint || 'phantom-led';

  const handleDesignSourceChange = (field: keyof DesignSource, value: string) => {
    const currentSource: DesignSource = primaryDesignSource || {
      id: 'design-source-primary',
      type: 'figmaFrame',
      name: '',
    };
    const nextSource = {
      ...currentSource,
      [field]: value,
    };
    updateSpecification({ designSources: [nextSource] });
  };

  const getStatusColor = (status: string | undefined): 'warning' | 'success' | 'informative' => {
    if (status === 'approved') return 'success';
    if (status === 'in-review') return 'warning';
    return 'informative';
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

      {/* Business Context */}
      <div className={styles.section}>
        <Text className={styles.sectionHeader}>Business Context</Text>

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

        <div className={styles.selectRow}>
          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Source Type</Label>
            <Select
              size="small"
              value={primaryDesignSource?.type || 'figmaFrame'}
              onChange={(_, d) => handleDesignSourceChange('type', d.value as DesignSourceType)}
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
              value={primaryDesignSource?.name || ''}
              onChange={(_, d) => handleDesignSourceChange('name', d.value)}
            />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Design Link</Label>
          <Input
            size="small"
            placeholder="https://www.figma.com/file/..."
            value={primaryDesignSource?.url || ''}
            onChange={(_, d) => handleDesignSourceChange('url', d.value)}
          />
        </div>

        <div className={styles.selectRow}>
          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Frame ID</Label>
            <Input
              size="small"
              placeholder="Optional"
              value={primaryDesignSource?.frameId || ''}
              onChange={(_, d) => handleDesignSourceChange('frameId', d.value)}
            />
          </div>

          <div className={`${styles.fieldRow} ${styles.selectField}`}>
            <Label className={styles.fieldLabel}>Component ID</Label>
            <Input
              size="small"
              placeholder="Optional"
              value={primaryDesignSource?.componentId || ''}
              onChange={(_, d) => handleDesignSourceChange('componentId', d.value)}
            />
          </div>
        </div>

        <div className={styles.fieldRow}>
          <Label className={styles.fieldLabel}>Design Notes</Label>
          <Textarea
            className={styles.textarea}
            placeholder="Brand, component, token, or handoff notes..."
            value={primaryDesignSource?.notes || ''}
            onChange={(_, d) => handleDesignSourceChange('notes', d.value)}
            resize="vertical"
          />
        </div>
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
