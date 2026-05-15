/**
 * Export Button Component
 *
 * Provides a dropdown menu with export options including Power BI Project (PBIP) export.
 */

import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  Spinner,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  makeStyles,
  shorthands,
} from '@fluentui/react-components';
import {
  ArrowExportRegular,
  DocumentDataRegular,
  ImageRegular,
  CodeRegular,
  CheckmarkCircleRegular,
} from '@fluentui/react-icons';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import {
  createPhantomDataContract,
  createPhantomDataContractMarkdown,
  createDesignSourcesMarkdown,
  createPhantomHandoffSummary,
  createPhantomSpec,
  createPowerBiImplementationGuide,
  createPowerBiImplementationGuideMarkdown,
  createReactImplementationBacklog,
  createReactImplementationBacklogMarkdown,
  downloadPBIPPackage,
  generateAllMeasures,
  getSchemaForScenario,
} from '../export';

const useStyles = makeStyles({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  successIcon: {
    color: '#107C10',
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '4px',
  },
  summaryList: {
    ...shorthands.margin(0),
    ...shorthands.padding('0', '0', '0', '20px'),
    lineHeight: '1.8',
  },
  topButton: {
    color: 'white',
    ':hover': {
      backgroundColor: '#3b3a39',
      color: 'white',
    }
  },
});

export const ExportButton: React.FC = () => {
  const styles = useStyles();
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [exportSummary, setExportSummary] = useState<{
    tables: number;
    measures: number;
    visuals: number;
    relationships: number;
  } | null>(null);

  const items = useStore((state) => state.items);
  const scenario = useStore((state) => state.scenario);
  const activePalette = useThemeStore((state) => state.activePalette);

  const createCurrentSpec = () => {
    const state = useStore.getState();
    return createPhantomSpec({
      scenario,
      items,
      drillActions: state.drillActions,
      filters: state.filters,
      layoutMode: state.layoutMode,
      exportMode: state.exportMode,
      themePalette: activePalette.name,
      specification: state.specification,
    });
  };

  const downloadTextFile = (contents: string, filename: string, type: string) => {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePBIExport = async () => {
    setIsExporting(true);
    try {
      // Generate summary info before export
      const schema = getSchemaForScenario(scenario);
      const measures = generateAllMeasures(items, scenario);

      // Perform the export
      const state = useStore.getState();
      await downloadPBIPPackage(items, scenario, state, undefined, activePalette.colors);

      // Show success dialog with summary
      setExportSummary({
        tables: schema.tables.length,
        measures: measures.length,
        visuals: items.length,
        relationships: schema.relationships.length,
      });
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePNGExport = async () => {
    setIsExporting(true);
    try {
      // Find the canvas container element
      const canvasElement = document.querySelector('.canvas-container') as HTMLElement;
      if (!canvasElement) {
        alert('Canvas not found. Please ensure a dashboard is loaded.');
        return;
      }

      // Use html2canvas to capture the canvas
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#f3f2f1', // Power BI-like background
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        logging: false,
        // Ignore react-grid-layout resize handles and other UI chrome
        ignoreElements: (element: Element) => {
          return element.classList.contains('react-resizable-handle') ||
                 element.classList.contains('react-grid-placeholder');
        },
      });

      // Convert to data URL and trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${scenario}_Dashboard_${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('PNG export failed:', error);
      alert('PNG export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleJSONExport = () => {
    const exportData = createCurrentSpec();
    downloadTextFile(
      JSON.stringify(exportData, null, 2),
      `${scenario}_Phantom_Spec_${new Date().toISOString().split('T')[0]}.json`,
      'application/json',
    );
  };

  const handleDataContractExport = () => {
    const spec = createCurrentSpec();
    const contract = createPhantomDataContract(spec);
    const date = new Date().toISOString().split('T')[0];
    downloadTextFile(
      JSON.stringify(contract, null, 2),
      `${scenario}_Data_Contract_${date}.json`,
      'application/json',
    );
    downloadTextFile(
      createPhantomDataContractMarkdown(contract),
      `${scenario}_Data_Contract_${date}.md`,
      'text/markdown',
    );
  };

  const handlePowerBiGuideExport = () => {
    const spec = createCurrentSpec();
    const guide = createPowerBiImplementationGuide(spec);
    downloadTextFile(
      createPowerBiImplementationGuideMarkdown(guide),
      `${scenario}_Power_BI_Implementation_Guide_${new Date().toISOString().split('T')[0]}.md`,
      'text/markdown',
    );
  };

  const handleHandoffPackExport = async () => {
    setIsExporting(true);
    try {
      const spec = createCurrentSpec();
      const contract = createPhantomDataContract(spec);
      const powerBiGuide = createPowerBiImplementationGuide(spec);
      const reactBacklog = createReactImplementationBacklog(spec);
      const handoffSummary = createPhantomHandoffSummary(spec);
      const date = new Date().toISOString().split('T')[0];
      const zip = new JSZip();
      const manifest = {
        manifestVersion: '0.1.0',
        sourceSpecVersion: spec.specVersion,
        generatedAt: new Date().toISOString(),
        project: {
          scenario: spec.project.scenario,
          mode: spec.mode,
          signOffStatus: spec.project.specification.signOffStatus || 'draft',
          designEntryPoint: spec.project.designEntryPoint,
          designSources: spec.project.designSources,
        },
        readiness: handoffSummary.readiness,
        handoffRecommendation: handoffSummary.handoffRecommendation,
        designWorkflow: handoffSummary.designWorkflow,
        designMapping: handoffSummary.designMapping,
        workshopIntent: handoffSummary.workshopIntent,
        workshopCompleteness: handoffSummary.workshopCompleteness,
        nextActions: handoffSummary.nextActions,
        artifacts: {
          spec: 'phantom-spec.json',
          handoffSummary: 'handoff-summary.json',
          dataContract: ['data-contract/data-contract.json', 'data-contract/DATA_CONTRACT.md'],
          powerBi: ['power-bi/power-bi-implementation-guide.json', 'power-bi/POWER_BI_IMPLEMENTATION_GUIDE.md'],
          react: ['react-product/REACT_IMPLEMENTATION_NOTES.md', 'react-product/react-implementation-backlog.json', 'react-product/REACT_IMPLEMENTATION_BACKLOG.md', 'react-product/phantom-spec.json', 'react-product/phantom-data-contract.json'],
        },
        summary: {
          components: powerBiGuide.summary.components,
          fields: contract.fields.length,
          drillActions: powerBiGuide.summary.drillActions,
          reactImplementationTasks: reactBacklog.length,
          powerBiApproximateVisuals: powerBiGuide.summary.approximateVisuals,
          powerBiUnsupportedVisuals: powerBiGuide.summary.unsupportedVisuals,
        },
      };
      const readme = `# ${spec.project.scenario} Phantom Handoff Pack

Generated from Phantom Spec ${spec.specVersion}.

## Project

- Mode: ${spec.mode}
- Sign-off: ${spec.project.specification.signOffStatus || 'draft'}
- Entry point: ${spec.project.designEntryPoint}
- Design sources: ${spec.project.designSources.length}

## Design Sources

${createDesignSourcesMarkdown(spec.project.designSources)}

## Design Workflow

- Design plane: ${handoffSummary.designWorkflow.designPlane}
- Phantom role: ${handoffSummary.designWorkflow.phantomRole}
- Status: ${handoffSummary.designWorkflow.status}
- Handoff modes: ${handoffSummary.designWorkflow.handoffModes.join(', ')}

### Design Workflow Next Steps

${handoffSummary.designWorkflow.requiredNextSteps.map((step) => `- ${step}`).join('\n')}

## Design Mapping

- Sources: ${handoffSummary.designMapping.totalSources}
- Mapped sources: ${handoffSummary.designMapping.mappedSources}
- Unmapped sources: ${handoffSummary.designMapping.unmappedSources}
- Linked views: ${handoffSummary.designMapping.linkedViewIds.join(', ') || 'None'}
- Linked components: ${handoffSummary.designMapping.linkedComponentIds.join(', ') || 'None'}

## Workshop Intent

- Business questions: ${contract.workshopIntent.businessQuestions || 'Not specified'}
- Audience: ${contract.workshopIntent.audience || 'Not specified'}
- Decisions/actions: ${contract.workshopIntent.decisions || 'Not specified'}
- Acceptance criteria: ${contract.workshopIntent.acceptanceCriteria || 'Not specified'}
- Build notes: ${contract.workshopIntent.buildNotes || 'Not specified'}

## Workshop Completeness

- Complete: ${handoffSummary.workshopCompleteness.complete ? 'Yes' : 'No'}
- Present: ${handoffSummary.workshopCompleteness.present.join(', ') || 'None'}
- Missing: ${handoffSummary.workshopCompleteness.missing.join(', ') || 'None'}

## Contents

- \`phantom-spec.json\`: canonical workshop/spec artifact.
- \`data-contract/\`: data requirements for API, warehouse/dbt, or semantic endpoint mapping.
- \`power-bi/\`: Power BI build guide with readiness, visual support status, fields, and drill-through notes.
- \`react-product/\`: React implementation starting notes plus the same spec and data contract.
- \`handoff-summary.json\`: first-pass design workflow, design mapping, readiness, recommendation, counts, and next actions for agents.
- \`HANDOFF_MANIFEST.json\`: machine-readable index for agents and engineering automation.
`;
      const reactNotes = `# React Product Implementation Notes

Use \`phantom-spec.json\` and \`phantom-data-contract.json\` as the implementation contract.

## Expected Work

- Replace Phantom placeholder visuals with production React components.
- Wire data requirements to client-owned APIs, warehouse/dbt models, or optional semantic endpoints.
- Implement drill actions from \`phantom-spec.json > interactions.drillActions\`.
- Apply Figma/design-source references from \`phantom-spec.json > project.designSources\` when present.

## Workshop Intent

- Business questions: ${contract.workshopIntent.businessQuestions || 'Not specified'}
- Audience: ${contract.workshopIntent.audience || 'Not specified'}
- Decisions/actions: ${contract.workshopIntent.decisions || 'Not specified'}
- Acceptance criteria: ${contract.workshopIntent.acceptanceCriteria || 'Not specified'}
- Build notes: ${contract.workshopIntent.buildNotes || 'Not specified'}

## Design Sources

${createDesignSourcesMarkdown(spec.project.designSources)}

## Design Workflow

- Design plane: ${handoffSummary.designWorkflow.designPlane}
- Status: ${handoffSummary.designWorkflow.status}
- Next steps: ${handoffSummary.designWorkflow.requiredNextSteps.join(' ')}

## Design Mapping

- Sources: ${handoffSummary.designMapping.totalSources}
- Mapped sources: ${handoffSummary.designMapping.mappedSources}
- Unmapped sources: ${handoffSummary.designMapping.unmappedSources}
- Linked views: ${handoffSummary.designMapping.linkedViewIds.join(', ') || 'None'}
- Linked components: ${handoffSummary.designMapping.linkedComponentIds.join(', ') || 'None'}

## Component Backlog

${createReactImplementationBacklogMarkdown(reactBacklog)}

For a runnable starter app, use:

\`\`\`bash
npm run phantom:spec -- export-react phantom-spec.json ./generated-app
\`\`\`
`;

      zip.file('phantom-spec.json', JSON.stringify(spec, null, 2));
      zip.file('handoff-summary.json', JSON.stringify(handoffSummary, null, 2));
      zip.file('HANDOFF_MANIFEST.json', JSON.stringify(manifest, null, 2));
      zip.file('README.md', readme);
      zip.file('data-contract/data-contract.json', JSON.stringify(contract, null, 2));
      zip.file('data-contract/DATA_CONTRACT.md', createPhantomDataContractMarkdown(contract));
      zip.file('power-bi/power-bi-implementation-guide.json', JSON.stringify(powerBiGuide, null, 2));
      zip.file('power-bi/POWER_BI_IMPLEMENTATION_GUIDE.md', createPowerBiImplementationGuideMarkdown(powerBiGuide));
      zip.file('react-product/REACT_IMPLEMENTATION_NOTES.md', reactNotes);
      zip.file('react-product/react-implementation-backlog.json', JSON.stringify(reactBacklog, null, 2));
      zip.file('react-product/REACT_IMPLEMENTATION_BACKLOG.md', createReactImplementationBacklogMarkdown(reactBacklog));
      zip.file('react-product/phantom-spec.json', JSON.stringify(spec, null, 2));
      zip.file('react-product/phantom-data-contract.json', JSON.stringify(contract, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(blob, `${scenario}_Phantom_Handoff_Pack_${date}.zip`);
    } catch (error) {
      console.error('Handoff pack export failed:', error);
      alert('Handoff pack export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            appearance="subtle"
            className={styles.topButton}
            size="small"
            icon={isExporting ? <Spinner size="tiny" /> : <ArrowExportRegular />}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            <MenuItem icon={<DocumentDataRegular />} onClick={handlePBIExport}>
              Power BI Project (PBIP)
            </MenuItem>
            <MenuItem icon={<DocumentDataRegular />} onClick={handleHandoffPackExport}>
              Handoff Pack (.zip)
            </MenuItem>
            <MenuItem icon={<DocumentDataRegular />} onClick={handlePowerBiGuideExport}>
              Power BI Build Guide
            </MenuItem>
            <MenuItem icon={<ImageRegular />} onClick={handlePNGExport}>
              Image (PNG)
            </MenuItem>
            <MenuItem icon={<CodeRegular />} onClick={handleJSONExport}>
              Phantom Spec JSON
            </MenuItem>
            <MenuItem icon={<DocumentDataRegular />} onClick={handleDataContractExport}>
              Data Contract
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>

      <Dialog open={showSuccessDialog} onOpenChange={(_, data) => setShowSuccessDialog(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Export Successful</DialogTitle>
            <DialogContent className={styles.dialogContent}>
              <div style={{ textAlign: 'center' }}>
                <CheckmarkCircleRegular className={styles.successIcon} fontSize={48} />
              </div>
              <p>Your Power BI Project export is ready!</p>
              {exportSummary && (
                <>
                  <p><strong>Export Summary:</strong></p>
                  <ul className={styles.summaryList}>
                    <li><strong>{exportSummary.visuals}</strong> visuals configured</li>
                    <li><strong>{exportSummary.tables}</strong> tables in data model</li>
                    <li><strong>{exportSummary.relationships}</strong> relationships defined</li>
                    <li><strong>{exportSummary.measures}</strong> DAX measures generated</li>
                  </ul>
                </>
              )}
              <p><strong>Two files downloaded:</strong></p>
              <ul className={styles.summaryList}>
                <li><code>.pbip.zip</code> - PBIP project package (unzip, then open the <code>.pbip</code> file)</li>
                <li><code>_Guide.md</code> - Documentation with schema, measures, and setup instructions</li>
              </ul>
              <p style={{ fontSize: '12px', color: '#605E5C' }}>
                Unzip the package, then open the <code>.pbip</code> manifest in Power BI Desktop (Developer mode enabled).
              </p>
            </DialogContent>
            <DialogActions>
              <Button appearance="primary" onClick={() => setShowSuccessDialog(false)}>
                Done
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};
