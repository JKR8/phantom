/**
 * PBIP Constraint Extractor
 *
 * Parses templates/mokkup/**\/*.json files to extract all valid PBI property values.
 * This helps discover and validate constraint types.
 *
 * Usage:
 *   npx ts-node tools/extract-pbi-constraints.ts
 *   npx ts-node tools/extract-pbi-constraints.ts --output src/pbi-constraints/extracted.json
 */

import * as fs from 'fs';
import * as path from 'path';

interface ExtractedConstraints {
  fontFamilies: Set<string>;
  fontSizes: Set<number>;
  colors: Set<string>;
  legendPositions: Set<string>;
  labelPositions: Set<string>;
  alignments: Set<string>;
  verticalAlignments: Set<string>;
  slicerModes: Set<string>;
  lineStyles: Set<string>;
  gridlineStyles: Set<string>;
  visualTypes: Set<string>;
  properties: Map<string, Set<string>>;
}

/**
 * Recursively find all JSON files in a directory
 */
function findJsonFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findJsonFiles(fullPath));
    } else if (entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Extract literal value from PBI expression format
 */
function extractLiteralValue(obj: any): string | number | boolean | null {
  if (!obj) return null;

  // Direct literal
  if (obj.expr?.Literal?.Value) {
    const value = obj.expr.Literal.Value;
    // String literal: 'value'
    if (typeof value === 'string') {
      const match = value.match(/^'(.+)'$/);
      if (match) return match[1];
      // Decimal literal: 10D
      const decMatch = value.match(/^(-?\d+(?:\.\d+)?)D$/);
      if (decMatch) return parseFloat(decMatch[1]);
      // Integer literal: 10L
      const intMatch = value.match(/^(-?\d+)L$/);
      if (intMatch) return parseInt(intMatch[1], 10);
      // Boolean
      if (value === 'true') return true;
      if (value === 'false') return false;
      return value;
    }
    return value;
  }

  // Solid color
  if (obj.solid?.color) {
    return extractLiteralValue(obj.solid.color);
  }

  return null;
}

/**
 * Recursively extract constraints from a JSON object
 */
function extractFromObject(
  obj: any,
  constraints: ExtractedConstraints,
  currentPath: string = ''
): void {
  if (!obj || typeof obj !== 'object') return;

  for (const [key, value] of Object.entries(obj)) {
    const newPath = currentPath ? `${currentPath}.${key}` : key;

    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        extractFromObject(item, constraints, `${newPath}[${idx}]`);
      });
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      // Check for specific property patterns
      const literalValue = extractLiteralValue(value);

      if (literalValue !== null) {
        // Track property values
        if (!constraints.properties.has(key)) {
          constraints.properties.set(key, new Set());
        }
        constraints.properties.get(key)!.add(String(literalValue));

        // Categorize specific constraints
        if (typeof literalValue === 'string') {
          // Font family patterns
          if (key === 'fontFamily' || key.includes('Font')) {
            if (literalValue.includes('Segoe') || literalValue.includes('DIN') || literalValue.includes('Arial')) {
              // Extract base font name
              const fontMatch = literalValue.match(/^'?([^',]+)/);
              if (fontMatch) {
                constraints.fontFamilies.add(fontMatch[1].trim());
              }
            }
          }

          // Color patterns
          if (literalValue.match(/^#[0-9A-Fa-f]{6}$/)) {
            constraints.colors.add(literalValue);
          }

          // Position patterns
          if (key === 'position' || key === 'legendPosition') {
            constraints.legendPositions.add(literalValue);
          }
          if (key === 'labelPosition') {
            constraints.labelPositions.add(literalValue);
          }
          if (key === 'horizontalAlignment' || key === 'alignment') {
            constraints.alignments.add(literalValue);
          }
          if (key === 'verticalAlignment') {
            constraints.verticalAlignments.add(literalValue);
          }
          if (key === 'mode' && newPath.includes('slicer')) {
            constraints.slicerModes.add(literalValue);
          }
          if (key === 'lineStyle') {
            constraints.lineStyles.add(literalValue);
          }
          if (key === 'gridlineStyle') {
            constraints.gridlineStyles.add(literalValue);
          }
        }

        // Font size patterns
        if (typeof literalValue === 'number' && (key === 'fontSize' || key === 'textSize')) {
          constraints.fontSizes.add(literalValue);
        }
      }

      // Visual type
      if (key === 'visualType' && typeof value === 'string') {
        constraints.visualTypes.add(value);
      }

      // Recurse into nested objects
      extractFromObject(value, constraints, newPath);
    } else if (key === 'visualType' && typeof value === 'string') {
      constraints.visualTypes.add(value);
    }
  }
}

/**
 * Main extraction function
 */
function extractConstraints(templateDir: string): ExtractedConstraints {
  const constraints: ExtractedConstraints = {
    fontFamilies: new Set(),
    fontSizes: new Set(),
    colors: new Set(),
    legendPositions: new Set(),
    labelPositions: new Set(),
    alignments: new Set(),
    verticalAlignments: new Set(),
    slicerModes: new Set(),
    lineStyles: new Set(),
    gridlineStyles: new Set(),
    visualTypes: new Set(),
    properties: new Map(),
  };

  const jsonFiles = findJsonFiles(templateDir);
  console.log(`Found ${jsonFiles.length} JSON files in ${templateDir}`);

  for (const filePath of jsonFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(content);
      extractFromObject(json, constraints, '');
    } catch (err) {
      console.error(`Error parsing ${filePath}:`, err);
    }
  }

  return constraints;
}

/**
 * Convert Sets to arrays for JSON output
 */
function constraintsToJSON(constraints: ExtractedConstraints): object {
  return {
    fontFamilies: Array.from(constraints.fontFamilies).sort(),
    fontSizes: Array.from(constraints.fontSizes).sort((a, b) => a - b),
    colors: Array.from(constraints.colors).sort(),
    legendPositions: Array.from(constraints.legendPositions).sort(),
    labelPositions: Array.from(constraints.labelPositions).sort(),
    alignments: Array.from(constraints.alignments).sort(),
    verticalAlignments: Array.from(constraints.verticalAlignments).sort(),
    slicerModes: Array.from(constraints.slicerModes).sort(),
    lineStyles: Array.from(constraints.lineStyles).sort(),
    gridlineStyles: Array.from(constraints.gridlineStyles).sort(),
    visualTypes: Array.from(constraints.visualTypes).sort(),
    propertyValues: Object.fromEntries(
      Array.from(constraints.properties.entries())
        .map(([key, values]) => [key, Array.from(values).sort()])
        .sort((a, b) => a[0].localeCompare(b[0]))
    ),
  };
}

/**
 * Print summary to console
 */
function printSummary(constraints: ExtractedConstraints): void {
  console.log('\n=== PBI Constraint Extraction Summary ===\n');

  console.log('Visual Types:');
  Array.from(constraints.visualTypes).sort().forEach(v => console.log(`  - ${v}`));

  console.log('\nFont Families:');
  Array.from(constraints.fontFamilies).sort().forEach(v => console.log(`  - ${v}`));

  console.log('\nFont Sizes:');
  console.log(`  ${Array.from(constraints.fontSizes).sort((a, b) => a - b).join(', ')}`);

  console.log('\nColors (sample of 10):');
  Array.from(constraints.colors).slice(0, 10).forEach(v => console.log(`  - ${v}`));

  console.log('\nLegend Positions:');
  Array.from(constraints.legendPositions).sort().forEach(v => console.log(`  - ${v}`));

  console.log('\nLabel Positions:');
  Array.from(constraints.labelPositions).sort().forEach(v => console.log(`  - ${v}`));

  console.log('\nAlignments:');
  Array.from(constraints.alignments).sort().forEach(v => console.log(`  - ${v}`));

  console.log('\nVertical Alignments:');
  Array.from(constraints.verticalAlignments).sort().forEach(v => console.log(`  - ${v}`));

  console.log('\nSlicer Modes:');
  Array.from(constraints.slicerModes).sort().forEach(v => console.log(`  - ${v}`));

  console.log('\nLine Styles:');
  Array.from(constraints.lineStyles).sort().forEach(v => console.log(`  - ${v}`));

  console.log('\nGridline Styles:');
  Array.from(constraints.gridlineStyles).sort().forEach(v => console.log(`  - ${v}`));

  console.log('\n=== Property Keys Found ===');
  console.log(`Total unique properties: ${constraints.properties.size}`);
}

// Main execution
const args = process.argv.slice(2);
const outputIndex = args.indexOf('--output');
const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : null;

const templateDir = path.resolve(__dirname, '../templates/mokkup');
const constraints = extractConstraints(templateDir);

printSummary(constraints);

if (outputPath) {
  const jsonOutput = constraintsToJSON(constraints);
  fs.writeFileSync(outputPath, JSON.stringify(jsonOutput, null, 2));
  console.log(`\nConstraints written to: ${outputPath}`);
}
