/**
 * PBIT Writer - Assembles all components into a downloadable .pbit file
 * 
 * A .pbit file is a ZIP archive containing:
 * - [Content_Types].xml - File type manifest
 * - DataModelSchema - JSON with tables, columns, measures, relationships
 * - Report/Layout - JSON with pages, visuals, positions
 * - Settings - JSON with report settings
 * - Metadata - JSON with report metadata
 */

import JSZip from 'jszip';
import { DashboardItem, Scenario } from '../types';
import { PBISchema, getSchemaForScenario, getFactTableForScenario } from './schemaGenerator';
import { DAXMeasure, generateAllMeasures } from './daxGenerator';
import { PBIVisualConfig, convertLayoutToPBI, generatePBILayoutJSON, PBI_CANVAS_WIDTH, PBI_CANVAS_HEIGHT } from './layoutConverter';

/**
 * Generate [Content_Types].xml
 */
function generateContentTypes(): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="json" ContentType="application/json" />
  <Default Extension="xml" ContentType="application/xml" />
</Types>`;
}

/**
 * Generate DataModelSchema JSON
 */
function generateDataModelSchema(schema: PBISchema, measures: DAXMeasure[], scenario: Scenario): object {
  const factTable = getFactTableForScenario(scenario);
  
  return {
    name: 'Model',
    compatibilityLevel: 1550,
    model: {
      culture: 'en-US',
      dataAccessOptions: {
        legacyRedirects: true,
        returnErrorValuesAsNull: true,
      },
      tables: schema.tables.map((table) => ({
        name: table.name,
        description: table.description,
        columns: table.columns.map((col) => ({
          name: col.name,
          dataType: mapDataType(col.dataType),
          sourceColumn: col.sourceColumn || col.name,
          isHidden: col.isHidden || false,
          summarizeBy: col.summarizeBy === 'none' ? 'none' : (col.summarizeBy || 'default'),
        })),
        partitions: [
          {
            name: `${table.name}_Partition`,
            source: {
              type: 'query',
              query: `/* Replace with your data source query for ${table.name} */\nSELECT * FROM ${table.name}`,
              dataSource: 'DataSource',
            },
          },
        ],
        // Add measures to the fact table
        ...(table.name === factTable ? { measures: measures.map((m) => ({
          name: m.name,
          expression: m.expression.trim(),
          displayFolder: m.displayFolder,
          formatString: m.formatString,
          description: m.description,
        })) } : {}),
      })),
      relationships: schema.relationships.map((rel) => ({
        name: rel.name,
        fromTable: rel.fromTable,
        fromColumn: rel.fromColumn,
        toTable: rel.toTable,
        toColumn: rel.toColumn,
        crossFilteringBehavior: rel.crossFilteringBehavior === 'bothDirections' ? 2 : 1,
        isActive: rel.isActive,
      })),
      dataSources: [
        {
          name: 'DataSource',
          connectionString: '/* Configure your connection string here */',
          type: 'structured',
          credential: {
            AuthenticationKind: 'UsernamePassword',
          },
        },
      ],
    },
  };
}

/**
 * Map Phantom data types to Power BI Analysis Services data types
 */
function mapDataType(type: string): string {
  switch (type) {
    case 'string': return 'string';
    case 'int64': return 'int64';
    case 'double': return 'double';
    case 'dateTime': return 'dateTime';
    case 'boolean': return 'boolean';
    default: return 'string';
  }
}

/**
 * Generate Report Layout JSON
 */
function generateReportLayout(visuals: PBIVisualConfig[], scenario: Scenario): object {
  return generatePBILayoutJSON(visuals);
}

/**
 * Generate Settings JSON
 */
function generateSettings(): object {
  return {
    version: '1.0',
    allowChangeFilterTypes: true,
    allowInlineExploration: true,
    allowModifyQueries: true,
    defaultDrillFilterOtherVisuals: false,
    allowImmersiveReader: true,
    queryLimitOption: 0,
    autoRecoverEnabled: false,
  };
}

/**
 * Generate Metadata JSON
 */
function generateMetadata(scenario: Scenario): object {
  return {
    version: '1.0',
    createdFrom: 'Phantom Dashboard Designer',
    scenario: scenario,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Generate companion documentation markdown
 */
function generateDocumentation(
  schema: PBISchema,
  measures: DAXMeasure[],
  scenario: Scenario
): string {
  const factTable = getFactTableForScenario(scenario);

  let doc = `# Power BI Report Template - ${scenario} Dashboard

## Overview
${schema.description}

This template was generated from Phantom Dashboard Designer and includes:
- Complete data model with ${schema.tables.length} tables
- ${schema.relationships.length} relationships
- ${measures.length} pre-built DAX measures

---

## Data Model

### Tables

`;

  schema.tables.forEach((table) => {
    doc += `#### ${table.name}
${table.description || ''}

| Column | Type | Notes |
|--------|------|-------|
`;
    table.columns.forEach((col) => {
      doc += `| ${col.name} | ${col.dataType} | ${col.isHidden ? 'Hidden, ' : ''}${col.summarizeBy !== 'none' ? `Summarize: ${col.summarizeBy}` : ''} |\n`;
    });
    doc += '\n';
  });

  doc += `### Relationships

| From | → | To | Type |
|------|---|-----|------|
`;
  schema.relationships.forEach((rel) => {
    doc += `| ${rel.fromTable}[${rel.fromColumn}] | → | ${rel.toTable}[${rel.toColumn}] | ${rel.crossFilteringBehavior === 'bothDirections' ? 'Bi-directional' : 'Single'} |\n`;
  });

  doc += `

---

## DAX Measures

The following measures are pre-built and ready to use. They are stored in the \`${factTable}\` table.

`;

  // Group measures by display folder
  const measuresByFolder = new Map<string, DAXMeasure[]>();
  measures.forEach((m) => {
    const folder = m.displayFolder || 'General';
    if (!measuresByFolder.has(folder)) {
      measuresByFolder.set(folder, []);
    }
    measuresByFolder.get(folder)!.push(m);
  });

  measuresByFolder.forEach((folderMeasures, folder) => {
    doc += `### ${folder}\n\n`;
    folderMeasures.forEach((m) => {
      doc += `#### ${m.name}
\`\`\`dax
${m.expression.trim()}
\`\`\`
${m.description || ''}
Format: \`${m.formatString || 'General'}\`

`;
    });
  });

  doc += `---

## Connecting Your Data

### Step 1: Open the Template
1. Open the .pbit file in Power BI Desktop
2. You'll be prompted to enter parameters or connect data sources

### Step 2: Configure Data Source
Replace the placeholder queries in each table with your actual data source:

**For SQL Server:**
\`\`\`
Server=your-server.database.windows.net
Database=your-database
\`\`\`

**For Excel/CSV:**
- Use "Get Data" → "Text/CSV" or "Excel"
- Map columns to match the schema above

### Step 3: Verify Relationships
After loading data:
1. Go to Model view
2. Verify relationships are correctly mapped
3. Adjust cardinality if needed

### Step 4: Test Measures
1. Create a simple card visual
2. Drag each measure to verify it calculates correctly
3. Check format strings are appropriate for your data

---

## Waterfall Chart Configuration

Waterfall charts require special setup in Power BI. The generated measures include:

1. **Waterfall Start** - The baseline (typically Prior Year)
2. **Waterfall Variance** - The contribution of each category
3. **Waterfall End** - The final value (Actual)
4. **Waterfall Running** - For proper bar positioning

To configure:
1. Add the Waterfall chart visual
2. Set Category to your dimension (e.g., Region)
3. Use the Breakdown field for the variance measure
4. Adjust the Sentiment colors (positive = green, negative = red)

---

## Best Practices

1. **Date Table**: Ensure your DateTable is marked as a Date Table in Power BI
2. **Star Schema**: Keep the star schema pattern - filter from dimensions to facts
3. **Measure Folders**: Measures are organized into folders for easy navigation
4. **Format Strings**: Adjust format strings to match your locale/currency

---

## Troubleshooting

**Blank visuals after connecting data:**
- Check that column names match exactly
- Verify relationships are active
- Ensure data types are compatible

**Measures showing errors:**
- Check that all referenced columns exist
- Verify table names haven't changed
- Look for BLANK() values in calculations

**Performance issues:**
- Ensure relationships use indexed columns
- Consider aggregations for large datasets
- Review query folding in Power Query

---

Generated by Phantom Dashboard Designer
`;

  return doc;
}

/**
 * Main export function - creates the .pbit file
 */
export async function createPBITFile(
  items: DashboardItem[],
  scenario: Scenario,
  filename?: string
): Promise<{ blob: Blob; documentation: string; filename: string }> {
  // Generate all components
  const schema = getSchemaForScenario(scenario);
  const measures = generateAllMeasures(items, scenario);
  const visuals = convertLayoutToPBI(items);
  
  // Create ZIP archive
  const zip = new JSZip();
  
  // Add files to archive
  zip.file('[Content_Types].xml', generateContentTypes());
  zip.file('DataModelSchema', JSON.stringify(generateDataModelSchema(schema, measures, scenario), null, 2));
  zip.file('Report/Layout', JSON.stringify(generateReportLayout(visuals, scenario), null, 2));
  zip.file('Settings', JSON.stringify(generateSettings(), null, 2));
  zip.file('Metadata', JSON.stringify(generateMetadata(scenario), null, 2));
  
  // Generate documentation
  const documentation = generateDocumentation(schema, measures, scenario);
  
  // Create blob
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  
  // Generate filename
  const exportFilename = filename || `${scenario}_Dashboard_${new Date().toISOString().split('T')[0]}.pbit`;
  
  return {
    blob,
    documentation,
    filename: exportFilename,
  };
}

/**
 * Trigger download of the .pbit file and documentation
 */
export async function downloadPBITFile(
  items: DashboardItem[],
  scenario: Scenario,
  filename?: string
): Promise<void> {
  const { blob, documentation, filename: exportFilename } = await createPBITFile(items, scenario, filename);
  
  // Download .pbit file
  const pbitUrl = URL.createObjectURL(blob);
  const pbitLink = document.createElement('a');
  pbitLink.href = pbitUrl;
  pbitLink.download = exportFilename;
  document.body.appendChild(pbitLink);
  pbitLink.click();
  document.body.removeChild(pbitLink);
  URL.revokeObjectURL(pbitUrl);
  
  // Download documentation
  const docBlob = new Blob([documentation], { type: 'text/markdown' });
  const docUrl = URL.createObjectURL(docBlob);
  const docLink = document.createElement('a');
  docLink.href = docUrl;
  docLink.download = exportFilename.replace('.pbit', '_Guide.md');
  document.body.appendChild(docLink);
  docLink.click();
  document.body.removeChild(docLink);
  URL.revokeObjectURL(docUrl);
}
