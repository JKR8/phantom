/**
 * PBIP Export Verification Utilities
 *
 * Utilities for verifying PBIP export fidelity in E2E tests.
 */

import type { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';
import type { ChartDefinition } from './chart-definitions';

// ============================================================================
// Types
// ============================================================================

export interface PBIPVerificationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  visualJson?: any;
  zipPath?: string;
}

export interface PBIPPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExpectedLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ============================================================================
// Constants
// ============================================================================

// Grid conversion constants (from layoutConverter.ts)
const PBI_CANVAS_WIDTH = 1280;
const PHANTOM_GRID_COLS = 48;
const PHANTOM_ROW_HEIGHT = 20;

// ============================================================================
// Grid Conversion
// ============================================================================

/**
 * Convert Phantom grid position to Power BI pixels
 * Mirrors the gridToPixels function from layoutConverter.ts
 */
export function gridToPixels(layout: ExpectedLayout): PBIPPosition {
  const colWidth = PBI_CANVAS_WIDTH / PHANTOM_GRID_COLS;

  const x = Math.round(layout.x * colWidth);
  const width = Math.round(layout.w * colWidth);
  const y = Math.round(layout.y * PHANTOM_ROW_HEIGHT);
  const height = Math.round(layout.h * PHANTOM_ROW_HEIGHT);

  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: Math.max(50, width),
    height: Math.max(30, height),
  };
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export current dashboard as PBIP and return the ZIP bytes
 */
export async function exportPBIP(page: Page): Promise<{
  bytes: number[];
  scenario: string;
  itemCount: number;
  itemIds: string[];
}> {
  const result = await page.evaluate(async () => {
    const debug = (window as any).__phantomDebug;
    const state = debug.useStore.getState();
    const { blob } = await debug.createPBIPPackage(state.items, state.scenario, state);
    const buffer = await blob.arrayBuffer();

    return {
      bytes: Array.from(new Uint8Array(buffer)),
      scenario: state.scenario,
      itemCount: state.items.length,
      itemIds: state.items.map((item: any) => item.id),
    };
  });

  return result;
}

/**
 * Save PBIP ZIP to test-results directory
 */
export function savePBIPArtifact(bytes: number[], chartId: string): string {
  const outputDir = path.join('test-results', 'pbip-exports', chartId);
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${chartId}.zip`);
  fs.writeFileSync(outputPath, Buffer.from(bytes));

  return outputPath;
}

// ============================================================================
// ZIP Parsing
// ============================================================================

/**
 * Extract visual.json from PBIP ZIP
 */
export async function extractVisualJson(
  zipBytes: number[],
  itemId: string,
  scenario: string
): Promise<any | null> {
  const zip = await JSZip.loadAsync(Buffer.from(zipBytes));

  // Normalize itemId for file path (remove special characters)
  const normalizedId = itemId.replace(/[^a-zA-Z0-9-_]/g, '_');

  // Path pattern: Phantom{Scenario}.Report/definition/pages/page1/visuals/{itemId}/visual.json
  const visualJsonPath = `Phantom${scenario}.Report/definition/pages/page1/visuals/${normalizedId}/visual.json`;

  // Try exact path first
  let file = zip.file(visualJsonPath);

  // If not found, search for any visual.json that matches the item ID
  if (!file) {
    const files = Object.keys(zip.files);
    const visualFiles = files.filter(
      (f) => f.includes('/visuals/') && f.endsWith('/visual.json')
    );

    // Try to find a match by checking visual JSON contents
    for (const vf of visualFiles) {
      const content = await zip.file(vf)?.async('string');
      if (content) {
        try {
          const json = JSON.parse(content);
          // Check if this visual matches our item ID
          if (json.name === itemId || json.name?.includes(itemId.split('-').pop())) {
            file = zip.file(vf);
            break;
          }
        } catch {
          // Continue to next file
        }
      }
    }
  }

  if (!file) {
    return null;
  }

  const content = await file.async('string');
  return JSON.parse(content);
}

/**
 * List all files in the ZIP
 */
export async function listZipFiles(zipBytes: number[]): Promise<string[]> {
  const zip = await JSZip.loadAsync(Buffer.from(zipBytes));
  return Object.keys(zip.files);
}

/**
 * Get a specific file from the ZIP
 */
export async function getZipFile(zipBytes: number[], filePath: string): Promise<string | null> {
  const zip = await JSZip.loadAsync(Buffer.from(zipBytes));
  const file = zip.file(filePath);

  if (!file) {
    return null;
  }

  return file.async('string');
}

// ============================================================================
// Verification Functions
// ============================================================================

/**
 * Verify PBIP position matches expected layout
 */
export function verifyPBIPPosition(
  visualJson: any,
  expectedLayout: ExpectedLayout,
  tolerance: number = 5
): { passed: boolean; errors: string[] } {
  const errors: string[] = [];
  const expected = gridToPixels(expectedLayout);

  if (!visualJson.position) {
    errors.push('visual.json missing position object');
    return { passed: false, errors };
  }

  const actual = visualJson.position;

  if (Math.abs(actual.x - expected.x) > tolerance) {
    errors.push(`Position x: expected ${expected.x}, got ${actual.x}`);
  }

  if (Math.abs(actual.y - expected.y) > tolerance) {
    errors.push(`Position y: expected ${expected.y}, got ${actual.y}`);
  }

  if (Math.abs(actual.width - expected.width) > tolerance) {
    errors.push(`Width: expected ${expected.width}, got ${actual.width}`);
  }

  if (Math.abs(actual.height - expected.height) > tolerance) {
    errors.push(`Height: expected ${expected.height}, got ${actual.height}`);
  }

  return { passed: errors.length === 0, errors };
}

/**
 * Verify PBIP visual type matches expected type
 */
export function verifyPBIPVisualType(
  visualJson: any,
  expectedType: string
): { passed: boolean; error?: string } {
  if (!visualJson.visual?.visualType) {
    return {
      passed: false,
      error: 'visual.json missing visual.visualType',
    };
  }

  const actualType = visualJson.visual.visualType;

  if (actualType !== expectedType) {
    return {
      passed: false,
      error: `Visual type: expected ${expectedType}, got ${actualType}`,
    };
  }

  return { passed: true };
}

/**
 * Verify PBIP has data bindings
 */
export function verifyPBIPBindings(
  visualJson: any,
  expectedProps: Record<string, unknown>
): { passed: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!visualJson.visual?.query?.queryState) {
    errors.push('visual.json missing query.queryState');
    return { passed: false, errors, warnings };
  }

  const queryState = visualJson.visual.query.queryState;

  // Check for Category binding if dimension is expected
  if (expectedProps.dimension && !queryState.Category) {
    warnings.push('Expected Category binding for dimension prop');
  }

  // Check for Y binding if metric is expected
  if (expectedProps.metric && !queryState.Y && !queryState.Values) {
    warnings.push('Expected Y or Values binding for metric prop');
  }

  // Check for Values binding for card/kpi types
  if (expectedProps.operation && !queryState.Values && !queryState.Indicator) {
    warnings.push('Expected Values or Indicator binding for operation prop');
  }

  return { passed: errors.length === 0, errors, warnings };
}

/**
 * Verify PBIP title
 */
export function verifyPBIPTitle(
  visualJson: any,
  expectedTitle: string
): { passed: boolean; error?: string } {
  const titleObj = visualJson.visual?.visualContainerObjects?.title;

  if (!titleObj || !Array.isArray(titleObj) || titleObj.length === 0) {
    return {
      passed: false,
      error: 'visual.json missing visualContainerObjects.title',
    };
  }

  const titleText = titleObj[0]?.properties?.text?.expr?.Literal?.Value;

  if (!titleText) {
    return {
      passed: false,
      error: 'Could not extract title text from visual.json',
    };
  }

  // Title is stored as "'Title Text'" in PBIP
  const actualTitle = titleText.replace(/^'|'$/g, '');

  if (actualTitle !== expectedTitle) {
    return {
      passed: false,
      error: `Title: expected "${expectedTitle}", got "${actualTitle}"`,
    };
  }

  return { passed: true };
}

// ============================================================================
// Full Verification
// ============================================================================

/**
 * Export and verify PBIP for a chart
 */
export async function exportAndVerifyPBIP(
  page: Page,
  chartDef: ChartDefinition,
  itemId: string,
  expectedLayout: ExpectedLayout,
  expectedTitle: string
): Promise<PBIPVerificationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Export PBIP
  const exportResult = await exportPBIP(page);

  if (exportResult.itemCount === 0) {
    errors.push('No items in export');
    return { passed: false, errors, warnings };
  }

  // Save artifact
  const zipPath = savePBIPArtifact(exportResult.bytes, chartDef.id);

  // Extract visual.json
  const visualJson = await extractVisualJson(
    exportResult.bytes,
    itemId,
    exportResult.scenario
  );

  if (!visualJson) {
    errors.push(`Could not find visual.json for item ${itemId}`);
    return { passed: false, errors, warnings, zipPath };
  }

  // Verify position
  const positionResult = verifyPBIPPosition(visualJson, expectedLayout);
  errors.push(...positionResult.errors);

  // Verify visual type
  const typeResult = verifyPBIPVisualType(visualJson, chartDef.pbiVisualType);
  if (typeResult.error) {
    errors.push(typeResult.error);
  }

  // Verify bindings
  const bindingsResult = verifyPBIPBindings(visualJson, chartDef.defaultProps);
  errors.push(...bindingsResult.errors);
  warnings.push(...bindingsResult.warnings);

  // Verify title (optional - may not match exactly due to smart title generation)
  const titleResult = verifyPBIPTitle(visualJson, expectedTitle);
  if (titleResult.error) {
    warnings.push(titleResult.error);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    visualJson,
    zipPath,
  };
}

/**
 * Create test info string for logging
 */
export function createPBIPTestInfo(result: PBIPVerificationResult): string {
  const lines: string[] = [];

  lines.push(`Passed: ${result.passed}`);

  if (result.zipPath) {
    lines.push(`ZIP Path: ${result.zipPath}`);
  }

  if (result.errors.length > 0) {
    lines.push('Errors:');
    result.errors.forEach((e) => lines.push(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    lines.push('Warnings:');
    result.warnings.forEach((w) => lines.push(`  - ${w}`));
  }

  if (result.visualJson) {
    lines.push(`Visual Type: ${result.visualJson.visual?.visualType || 'unknown'}`);
    lines.push(`Position: ${JSON.stringify(result.visualJson.position || {})}`);
  }

  return lines.join('\n');
}
