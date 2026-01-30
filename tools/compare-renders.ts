/**
 * Compare Renders Tool
 *
 * Compares rendered screenshots with Power BI Desktop references
 * and generates a fidelity report.
 *
 * Usage: npx tsx tools/compare-renders.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

// Configuration
const REFERENCE_DIR = 'src/pbi-renderer/measurements/bar-chart/screenshots';
const RENDERED_DIR = 'e2e/screenshots/pbi-renderer';
const DIFF_DIR = 'e2e/screenshots/pbi-renderer/diffs';
const OUTPUT_DIR = 'output';

const PIXEL_THRESHOLD = 0.1;

interface ComparisonResult {
  testId: string;
  totalPixels: number;
  differentPixels: number;
  matchPercentage: number;
  diffImagePath: string;
}

interface ComparisonReport {
  generatedAt: string;
  referenceDir: string;
  renderedDir: string;
  threshold: number;
  results: ComparisonResult[];
  summary: {
    totalTestCases: number;
    averageMatch: number;
    minMatch: number;
    maxMatch: number;
    passingCount: number;
    failingCount: number;
  };
}

async function compareRenders(
  referenceDir: string,
  renderedDir: string,
  outputDir: string
): Promise<ComparisonResult[]> {
  const results: ComparisonResult[] = [];

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Find all reference images
  if (!fs.existsSync(referenceDir)) {
    console.log(`Reference directory not found: ${referenceDir}`);
    console.log('Please capture Power BI Desktop screenshots first.');
    return results;
  }

  const referenceFiles = fs.readdirSync(referenceDir)
    .filter(f => f.endsWith('_reference.png'));

  if (referenceFiles.length === 0) {
    console.log('No reference images found.');
    console.log('Expected format: T01_reference.png, T02_reference.png, etc.');
    return results;
  }

  for (const filename of referenceFiles) {
    const testId = filename.replace('_reference.png', '');
    const referencePath = path.join(referenceDir, filename);
    const renderedPath = path.join(renderedDir, `${testId}_rendered.png`);

    if (!fs.existsSync(renderedPath)) {
      console.warn(`Missing rendered image for ${testId}: ${renderedPath}`);
      continue;
    }

    try {
      const referenceImg = PNG.sync.read(fs.readFileSync(referencePath));
      const renderedImg = PNG.sync.read(fs.readFileSync(renderedPath));

      const { width, height } = referenceImg;

      // Check dimensions match
      if (renderedImg.width !== width || renderedImg.height !== height) {
        console.warn(`Dimension mismatch for ${testId}: reference ${width}x${height}, rendered ${renderedImg.width}x${renderedImg.height}`);
        continue;
      }

      const diff = new PNG({ width, height });
      const differentPixels = pixelmatch(
        referenceImg.data,
        renderedImg.data,
        diff.data,
        width,
        height,
        { threshold: PIXEL_THRESHOLD }
      );

      const totalPixels = width * height;
      const matchPercentage = ((totalPixels - differentPixels) / totalPixels) * 100;

      const diffImagePath = path.join(outputDir, `diff_${testId}.png`);
      fs.writeFileSync(diffImagePath, PNG.sync.write(diff));

      results.push({
        testId,
        totalPixels,
        differentPixels,
        matchPercentage,
        diffImagePath
      });

      console.log(`${testId}: ${matchPercentage.toFixed(2)}% match`);
    } catch (error) {
      console.error(`Error comparing ${testId}:`, error);
    }
  }

  return results;
}

function generateReport(results: ComparisonResult[]): ComparisonReport {
  const matchPercentages = results.map(r => r.matchPercentage);
  const avgMatch = matchPercentages.length > 0
    ? matchPercentages.reduce((a, b) => a + b, 0) / matchPercentages.length
    : 0;

  const passingThreshold = 85;

  return {
    generatedAt: new Date().toISOString(),
    referenceDir: REFERENCE_DIR,
    renderedDir: RENDERED_DIR,
    threshold: PIXEL_THRESHOLD,
    results,
    summary: {
      totalTestCases: results.length,
      averageMatch: avgMatch,
      minMatch: matchPercentages.length > 0 ? Math.min(...matchPercentages) : 0,
      maxMatch: matchPercentages.length > 0 ? Math.max(...matchPercentages) : 0,
      passingCount: results.filter(r => r.matchPercentage >= passingThreshold).length,
      failingCount: results.filter(r => r.matchPercentage < passingThreshold).length
    }
  };
}

function generateMarkdownReport(report: ComparisonReport): string {
  let md = `# Visual Comparison Report\n\n`;
  md += `**Generated:** ${report.generatedAt}\n\n`;

  md += `## Summary\n\n`;
  md += `| Metric | Value |\n|--------|-------|\n`;
  md += `| Test Cases | ${report.summary.totalTestCases} |\n`;
  md += `| Average Match | ${report.summary.averageMatch.toFixed(2)}% |\n`;
  md += `| Min Match | ${report.summary.minMatch.toFixed(2)}% |\n`;
  md += `| Max Match | ${report.summary.maxMatch.toFixed(2)}% |\n`;
  md += `| Passing (≥85%) | ${report.summary.passingCount} |\n`;
  md += `| Failing (<85%) | ${report.summary.failingCount} |\n\n`;

  md += `## Results\n\n`;
  md += `| Test Case | Match % | Status | Diff Pixels |\n`;
  md += `|-----------|---------|--------|-------------|\n`;

  for (const result of report.results) {
    const status = result.matchPercentage >= 90 ? '✅ PASS' :
                   result.matchPercentage >= 85 ? '⚠️ WARN' :
                   '❌ FAIL';
    md += `| ${result.testId} | ${result.matchPercentage.toFixed(2)}% | ${status} | ${result.differentPixels.toLocaleString()} |\n`;
  }

  md += `\n## Configuration\n\n`;
  md += `- **Reference Directory:** \`${report.referenceDir}\`\n`;
  md += `- **Rendered Directory:** \`${report.renderedDir}\`\n`;
  md += `- **Pixel Threshold:** ${report.threshold}\n`;

  return md;
}

async function main() {
  console.log('========== PBI Renderer Comparison Tool ==========\n');

  // Ensure directories exist
  fs.mkdirSync(DIFF_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Run comparison
  const results = await compareRenders(REFERENCE_DIR, RENDERED_DIR, DIFF_DIR);

  if (results.length === 0) {
    console.log('\nNo comparisons performed.');
    console.log('To generate rendered images, run:');
    console.log('  npx playwright test e2e/pbi-renderer-poc.spec.ts');
    console.log('\nTo create reference images:');
    console.log('  1. Open Power BI Desktop');
    console.log('  2. Create test visuals at 400x300 pixels');
    console.log('  3. Screenshot and save to src/pbi-renderer/measurements/bar-chart/screenshots/');
    console.log('  4. Name as T01_reference.png, T02_reference.png, etc.');
    return;
  }

  // Generate report
  const report = generateReport(results);

  // Write JSON report
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'comparison-report.json'),
    JSON.stringify(report, null, 2)
  );

  // Write Markdown report
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'comparison-report.md'), markdown);

  // Print summary
  console.log('\n========== COMPARISON SUMMARY ==========');
  console.log(`Total test cases: ${report.summary.totalTestCases}`);
  console.log(`Average match: ${report.summary.averageMatch.toFixed(2)}%`);
  console.log(`Min: ${report.summary.minMatch.toFixed(2)}%, Max: ${report.summary.maxMatch.toFixed(2)}%`);
  console.log(`Passing: ${report.summary.passingCount}, Failing: ${report.summary.failingCount}`);
  console.log('=========================================\n');

  console.log(`Reports saved to ${OUTPUT_DIR}/`);
  console.log('  - comparison-report.json');
  console.log('  - comparison-report.md');
  console.log(`Diff images saved to ${DIFF_DIR}/`);
}

main().catch(console.error);
