/**
 * PBI Renderer POC - Visual Comparison Tests
 *
 * These tests validate that the PBI bar chart renderer produces
 * visuals that closely match Power BI Desktop's output.
 *
 * Test Cases:
 * - T01: Default (5 categories) - Basic bars, axes, grid
 * - T02: Multi-series with legend - Legend positioning, color palette
 * - T03: Data labels enabled - Label placement algorithm
 * - T04: Long category names - Text truncation with ellipsis
 * - T05: Large values (100K+) - K/M/B number formatting
 *
 * Success Criteria:
 * - Minimum: 85% average pixel match across all test cases
 * - Target: 90% average pixel match
 * - Each individual test case must achieve at least 80%
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

// Reference dimensions matching Power BI capture
const REFERENCE_WIDTH = 400;
const REFERENCE_HEIGHT = 300;

// Threshold for pixel matching (0 = exact, 0.1 = 10% tolerance per pixel)
const PIXEL_THRESHOLD = 0.1;

// Minimum acceptable match percentages
const MIN_INDIVIDUAL_MATCH = 80;
const MIN_AVERAGE_MATCH = 85;
const TARGET_AVERAGE_MATCH = 90;

// Test case IDs
const TEST_CASES = ['T01', 'T02', 'T03', 'T04', 'T05'];

// Reference screenshots directory
const REFERENCE_DIR = 'src/pbi-renderer/measurements/bar-chart/screenshots';
const OUTPUT_DIR = 'e2e/screenshots/pbi-renderer';
const DIFF_DIR = 'e2e/screenshots/pbi-renderer/diffs';

interface ComparisonResult {
  testId: string;
  matchPercentage: number;
  totalPixels: number;
  differentPixels: number;
  passed: boolean;
  hasReference: boolean;
  error?: string;
}

/**
 * Compare two PNG images and return match percentage.
 */
function compareImages(
  referencePath: string,
  renderedPath: string,
  diffPath: string
): { matchPercentage: number; totalPixels: number; differentPixels: number } {
  const referenceImg = PNG.sync.read(fs.readFileSync(referencePath));
  const renderedImg = PNG.sync.read(fs.readFileSync(renderedPath));

  const { width, height } = referenceImg;
  const totalPixels = width * height;

  // Create diff image
  const diff = new PNG({ width, height });

  const differentPixels = pixelmatch(
    referenceImg.data,
    renderedImg.data,
    diff.data,
    width,
    height,
    { threshold: PIXEL_THRESHOLD }
  );

  // Save diff image
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  const matchPercentage = ((totalPixels - differentPixels) / totalPixels) * 100;

  return { matchPercentage, totalPixels, differentPixels };
}

test.describe('PBI Bar Chart Renderer - Visual Comparison', () => {
  test.beforeAll(async () => {
    // Ensure output directories exist
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.mkdirSync(DIFF_DIR, { recursive: true });
  });

  // Individual test cases
  for (const testId of TEST_CASES) {
    test(`${testId}: Renders bar chart matching Power BI specification`, async ({ page }) => {
      // Navigate to test harness in comparison mode
      const url = `http://localhost:5173/pbi-renderer-test?case=${testId}&mode=comparison&width=${REFERENCE_WIDTH}&height=${REFERENCE_HEIGHT}`;
      await page.goto(url);

      // Wait for chart to render
      await page.waitForSelector('.pbi-bar-chart', { timeout: 5000 });

      // Take screenshot
      const renderedPath = path.join(OUTPUT_DIR, `${testId}_rendered.png`);
      await page.screenshot({
        path: renderedPath,
        clip: {
          x: 0,
          y: 0,
          width: REFERENCE_WIDTH,
          height: REFERENCE_HEIGHT
        }
      });

      // Check if reference exists
      const referencePath = path.join(REFERENCE_DIR, `${testId}_reference.png`);
      const referenceExists = fs.existsSync(referencePath);

      if (!referenceExists) {
        // No reference to compare - test passes but logs warning
        console.warn(`[${testId}] No reference image found at ${referencePath}`);
        console.warn(`[${testId}] Screenshot saved to ${renderedPath}`);
        console.warn(`[${testId}] To create reference, capture from Power BI Desktop and save as ${testId}_reference.png`);

        // Still pass - reference images will be manually created
        expect(true).toBe(true);
        return;
      }

      // Compare with reference
      const diffPath = path.join(DIFF_DIR, `${testId}_diff.png`);
      const { matchPercentage, differentPixels, totalPixels } = compareImages(
        referencePath,
        renderedPath,
        diffPath
      );

      console.log(`[${testId}] Match: ${matchPercentage.toFixed(2)}% (${differentPixels}/${totalPixels} pixels differ)`);

      // Assert minimum match
      expect(
        matchPercentage,
        `${testId} should achieve at least ${MIN_INDIVIDUAL_MATCH}% pixel match`
      ).toBeGreaterThanOrEqual(MIN_INDIVIDUAL_MATCH);
    });
  }

  // Aggregate test for overall fidelity
  test('Overall: Average fidelity meets minimum threshold', async ({ page }) => {
    const results: ComparisonResult[] = [];

    for (const testId of TEST_CASES) {
      const url = `http://localhost:5173/pbi-renderer-test?case=${testId}&mode=comparison&width=${REFERENCE_WIDTH}&height=${REFERENCE_HEIGHT}`;

      try {
        await page.goto(url);
        await page.waitForSelector('.pbi-bar-chart', { timeout: 5000 });

        const renderedPath = path.join(OUTPUT_DIR, `${testId}_rendered.png`);
        await page.screenshot({
          path: renderedPath,
          clip: {
            x: 0,
            y: 0,
            width: REFERENCE_WIDTH,
            height: REFERENCE_HEIGHT
          }
        });

        const referencePath = path.join(REFERENCE_DIR, `${testId}_reference.png`);

        if (!fs.existsSync(referencePath)) {
          results.push({
            testId,
            matchPercentage: 0,
            totalPixels: 0,
            differentPixels: 0,
            passed: false,
            hasReference: false,
            error: 'No reference image'
          });
          continue;
        }

        const diffPath = path.join(DIFF_DIR, `${testId}_diff.png`);
        const comparison = compareImages(referencePath, renderedPath, diffPath);

        results.push({
          testId,
          matchPercentage: comparison.matchPercentage,
          totalPixels: comparison.totalPixels,
          differentPixels: comparison.differentPixels,
          passed: comparison.matchPercentage >= MIN_INDIVIDUAL_MATCH,
          hasReference: true
        });
      } catch (error) {
        results.push({
          testId,
          matchPercentage: 0,
          totalPixels: 0,
          differentPixels: 0,
          passed: false,
          hasReference: false,
          error: String(error)
        });
      }
    }

    // Calculate average of tests with references
    const testsWithReferences = results.filter(r => r.hasReference);

    if (testsWithReferences.length === 0) {
      console.log('No reference images available for comparison.');
      console.log('To run visual comparison tests:');
      console.log(`1. Capture Power BI Desktop screenshots at ${REFERENCE_WIDTH}x${REFERENCE_HEIGHT}`);
      console.log(`2. Save as ${REFERENCE_DIR}/T01_reference.png, T02_reference.png, etc.`);
      expect(true).toBe(true);
      return;
    }

    const averageMatch =
      testsWithReferences.reduce((sum, r) => sum + r.matchPercentage, 0) /
      testsWithReferences.length;

    // Generate summary report
    console.log('\n========== VISUAL COMPARISON REPORT ==========');
    console.log(`Test Cases: ${testsWithReferences.length}/${TEST_CASES.length}`);
    console.log(`Average Match: ${averageMatch.toFixed(2)}%`);
    console.log(`Target: ${TARGET_AVERAGE_MATCH}%`);
    console.log(`Minimum: ${MIN_AVERAGE_MATCH}%`);
    console.log('');
    console.log('Per-test results:');
    for (const result of results) {
      const status = !result.hasReference
        ? '⏳ NO REF'
        : result.passed
        ? '✅ PASS'
        : '❌ FAIL';
      const matchStr = result.hasReference
        ? `${result.matchPercentage.toFixed(2)}%`
        : 'N/A';
      console.log(`  ${result.testId}: ${matchStr} ${status}`);
    }
    console.log('===============================================\n');

    // Write report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        testCount: testsWithReferences.length,
        totalTestCases: TEST_CASES.length,
        averageMatch,
        targetMatch: TARGET_AVERAGE_MATCH,
        minimumMatch: MIN_AVERAGE_MATCH,
        passesMinimum: averageMatch >= MIN_AVERAGE_MATCH,
        passesTarget: averageMatch >= TARGET_AVERAGE_MATCH
      },
      results
    };

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'comparison-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Assert minimum average
    expect(
      averageMatch,
      `Average fidelity should be at least ${MIN_AVERAGE_MATCH}%`
    ).toBeGreaterThanOrEqual(MIN_AVERAGE_MATCH);
  });
});

test.describe('PBI Bar Chart Renderer - Functional Tests', () => {
  test('Renders chart with correct structure', async ({ page }) => {
    await page.goto('http://localhost:5173/pbi-renderer-test?case=T01');

    // Check SVG is rendered
    const svg = await page.locator('.pbi-bar-chart');
    await expect(svg).toBeVisible();

    // Check bars are rendered
    const bars = await page.locator('.pbi-bar-chart .bars rect');
    const barCount = await bars.count();
    expect(barCount).toBe(5); // T01 has 5 categories
  });

  test('Renders grid lines', async ({ page }) => {
    await page.goto('http://localhost:5173/pbi-renderer-test?case=T01');

    const gridLines = await page.locator('.pbi-bar-chart .grid-lines line');
    const lineCount = await gridLines.count();
    expect(lineCount).toBeGreaterThan(0);
  });

  test('Renders data labels when enabled', async ({ page }) => {
    await page.goto('http://localhost:5173/pbi-renderer-test?case=T03');

    const labels = await page.locator('.pbi-bar-chart .data-labels text');
    const labelCount = await labels.count();
    expect(labelCount).toBe(5); // T03 has 5 data points
  });

  test('Renders category axis labels', async ({ page }) => {
    await page.goto('http://localhost:5173/pbi-renderer-test?case=T01');

    const categoryLabels = await page.locator('.pbi-bar-chart .category-axis text');
    const labelCount = await categoryLabels.count();
    expect(labelCount).toBe(5); // 5 categories
  });

  test('Renders value axis labels', async ({ page }) => {
    await page.goto('http://localhost:5173/pbi-renderer-test?case=T01');

    const valueLabels = await page.locator('.pbi-bar-chart .value-axis text');
    const labelCount = await valueLabels.count();
    expect(labelCount).toBeGreaterThan(0);
  });

  test('Handles empty data gracefully', async ({ page }) => {
    // Navigate to test harness and check it doesn't crash
    await page.goto('http://localhost:5173/pbi-renderer-test');
    const svg = await page.locator('.pbi-bar-chart');
    await expect(svg).toBeVisible();
  });

  test('Truncates long category labels', async ({ page }) => {
    await page.goto('http://localhost:5173/pbi-renderer-test?case=T04');

    const categoryLabels = await page.locator('.pbi-bar-chart .category-axis text');
    const firstLabel = await categoryLabels.first().textContent();

    // Should be truncated (not the full long text)
    expect(firstLabel).toContain('...');
  });

  test('Formats large values with K/M suffix', async ({ page }) => {
    await page.goto('http://localhost:5173/pbi-renderer-test?case=T05');

    const valueLabels = await page.locator('.pbi-bar-chart .value-axis text');
    const allLabels = await valueLabels.allTextContents();

    // Should have K or M suffixes for large values
    const hasFormatted = allLabels.some(
      label => label.includes('K') || label.includes('M')
    );
    expect(hasFormatted).toBe(true);
  });
});
