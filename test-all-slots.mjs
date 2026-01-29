import { chromium } from 'playwright';

// Executive layout slots from slotLayouts.ts
const EXECUTIVE_SLOTS = [
  { id: 'kpi1', name: 'Primary KPI', x: 0, y: 0, w: 12, h: 6 },
  { id: 'kpi2', name: 'Secondary KPI', x: 12, y: 0, w: 12, h: 6 },
  { id: 'kpi3', name: 'Tertiary KPI', x: 24, y: 0, w: 12, h: 6 },
  { id: 'kpi4', name: 'Quaternary KPI', x: 36, y: 0, w: 12, h: 6 },
  { id: 'mainTrend', name: 'Main Trend', x: 0, y: 6, w: 32, h: 14 },
  { id: 'breakdown', name: 'Breakdown', x: 32, y: 6, w: 16, h: 14 },
  { id: 'details', name: 'Details', x: 0, y: 20, w: 48, h: 10 },
];

async function testAllSlots() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture all console logs for debugging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[')) {
      console.log('BROWSER:', text);
    }
  });

  // Track results
  const results = [];

  // Navigate to the app
  await page.goto('http://localhost:5174');
  await page.waitForTimeout(2000);

  // Click "New Screen" to clear canvas
  const newScreenBtn = page.locator('button[title="New Screen"]');
  if (await newScreenBtn.isVisible()) {
    await newScreenBtn.click();
    await page.waitForTimeout(500);
  }

  // Select Executive layout
  const layoutBtn = page.locator('button:has-text("Layout")');
  await layoutBtn.click();
  await page.waitForTimeout(300);

  const execItem = page.locator('div[role="menuitem"]:has-text("Executive")');
  await execItem.click();
  await page.waitForTimeout(500);

  // Get canvas info
  const canvas = page.locator('[data-testid="canvas-drop-area"]');
  const canvasBox = await canvas.boundingBox();

  // Calculate grid metrics (same as Canvas.tsx)
  const GRID_COLS = 48;
  const ROW_HEIGHT = 20;
  const MARGIN = 8;
  const PADDING = 12;
  const colWidth = (canvasBox.width - (2 * PADDING) - (MARGIN * (GRID_COLS - 1))) / GRID_COLS;

  console.log('Canvas:', canvasBox);
  console.log('Column width:', colWidth.toFixed(2), 'px');
  console.log('\n=== Testing all Executive slots ===\n');

  // Test each slot
  for (const slot of EXECUTIVE_SLOTS) {
    console.log(`\nTesting slot: ${slot.name} (x:${slot.x}, y:${slot.y}, w:${slot.w}, h:${slot.h})`);

    // Clear canvas first
    await newScreenBtn.click();
    await page.waitForTimeout(300);

    // Re-select Executive layout
    await layoutBtn.click();
    await page.waitForTimeout(200);
    await execItem.click();
    await page.waitForTimeout(300);

    // Calculate pixel position for the CENTER of this slot
    const slotCenterX = PADDING + (slot.x * (colWidth + MARGIN)) + ((slot.w * colWidth + (slot.w - 1) * MARGIN) / 2);
    const slotCenterY = PADDING + (slot.y * (ROW_HEIGHT + MARGIN)) + ((slot.h * ROW_HEIGHT + (slot.h - 1) * MARGIN) / 2);

    console.log(`  Drop target (center of slot): x=${slotCenterX.toFixed(0)}, y=${slotCenterY.toFixed(0)}`);

    // Find table visual (doesn't require variant picker)
    const tableViz = page.locator('[data-testid="viz-table"], [draggable="true"]:has-text("Table")').first();

    // Drag to slot center
    await tableViz.dragTo(canvas, {
      targetPosition: { x: slotCenterX, y: slotCenterY }
    });
    await page.waitForTimeout(500);

    // Get the placed visual's position
    const visual = page.locator('.react-grid-item').first();
    const visualStyle = await visual.getAttribute('style');

    // Parse transform: translate(Xpx, Ypx)
    const translateMatch = visualStyle?.match(/translate\((\d+)px,\s*(\d+)px\)/);
    const actualX = translateMatch ? parseInt(translateMatch[1]) : -1;
    const actualY = translateMatch ? parseInt(translateMatch[2]) : -1;

    // Parse width and height
    const widthMatch = visualStyle?.match(/width:\s*(\d+)px/);
    const heightMatch = visualStyle?.match(/height:\s*(\d+)px/);
    const actualW = widthMatch ? parseInt(widthMatch[1]) : -1;
    const actualH = heightMatch ? parseInt(heightMatch[1]) : -1;

    // Calculate expected pixel position
    const expectedX = PADDING + (slot.x * (colWidth + MARGIN));
    const expectedY = PADDING + (slot.y * (ROW_HEIGHT + MARGIN));
    const expectedW = (slot.w * colWidth) + ((slot.w - 1) * MARGIN);
    const expectedH = (slot.h * ROW_HEIGHT) + ((slot.h - 1) * MARGIN);

    // Check if positions match (allow 2px tolerance for rounding)
    const xOk = Math.abs(actualX - expectedX) <= 2;
    const yOk = Math.abs(actualY - expectedY) <= 2;
    const wOk = Math.abs(actualW - expectedW) <= 2;
    const hOk = Math.abs(actualH - expectedH) <= 2;

    const status = xOk && yOk && wOk && hOk ? '✓ PASS' : '✗ FAIL';

    console.log(`  Expected: x=${expectedX.toFixed(0)}, y=${expectedY.toFixed(0)}, w=${expectedW.toFixed(0)}, h=${expectedH.toFixed(0)}`);
    console.log(`  Actual:   x=${actualX}, y=${actualY}, w=${actualW}, h=${actualH}`);
    console.log(`  ${status}`);

    if (!xOk || !yOk || !wOk || !hOk) {
      console.log(`    Issues: ${!xOk ? 'X_MISMATCH ' : ''}${!yOk ? 'Y_MISMATCH ' : ''}${!wOk ? 'W_MISMATCH ' : ''}${!hOk ? 'H_MISMATCH' : ''}`);
    }

    results.push({
      slot: slot.name,
      pass: xOk && yOk && wOk && hOk,
      expected: { x: expectedX, y: expectedY, w: expectedW, h: expectedH },
      actual: { x: actualX, y: actualY, w: actualW, h: actualH }
    });
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  const passed = results.filter(r => r.pass).length;
  console.log(`${passed}/${results.length} slots passed`);

  if (passed < results.length) {
    console.log('\nFailed slots:');
    results.filter(r => !r.pass).forEach(r => {
      console.log(`  - ${r.slot}`);
    });
  }

  await page.screenshot({ path: 'test-slots-final.png' });
  console.log('\nScreenshot saved: test-slots-final.png');

  await page.waitForTimeout(3000);
  await browser.close();

  return results;
}

testAllSlots().catch(console.error);
