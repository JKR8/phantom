/**
 * Export Button Component
 * 
 * Provides a dropdown menu with export options including Power BI Template (.pbit) export.
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
  DialogTrigger,
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
import { useStore } from '../store/useStore';
import { downloadPBITFile, generateAllMeasures, getSchemaForScenario } from '../export';

const useStyles = makeStyles({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  successIcon: {
    color: '#107C10',
    fontSize: '48px',
    textAlign: 'center',
    marginBottom: '8px',
  },
  summaryList: {
    ...shorthands.margin(0),
    ...shorthands.padding('0', '0', '0', '20px'),
    lineHeight: '1.6',
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

  const handlePBIExport = async () => {
    setIsExporting(true);
    try {
      // Generate summary info before export
      const schema = getSchemaForScenario(scenario);
      const measures = generateAllMeasures(items, scenario);

      // Perform the export
      await downloadPBITFile(items, scenario);

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

  const handlePNGExport = () => {
    // TODO: Implement PNG screenshot export
    alert('PNG export coming soon!');
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
              Power BI Template (.pbit)
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
              <p>Your Power BI Template has been exported successfully!</p>
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
                <li><code>.pbit</code> - Power BI Template (open in Power BI Desktop)</li>
                <li><code>_Guide.md</code> - Documentation with schema, measures, and setup instructions</li>
              </ul>
              <p style={{ fontSize: '12px', color: '#605E5C' }}>
                Open the .pbit file in Power BI Desktop and connect your data source. 
                Refer to the guide for detailed instructions on configuring the data model.
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
