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
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { downloadPBIPPackage, generateAllMeasures, getSchemaForScenario } from '../export';

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
    // Export the current dashboard state as JSON
    const exportData = {
      scenario,
      items,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scenario}_Dashboard_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <MenuItem icon={<ImageRegular />} onClick={handlePNGExport}>
              Image (PNG)
            </MenuItem>
            <MenuItem icon={<CodeRegular />} onClick={handleJSONExport}>
              Dashboard JSON
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
