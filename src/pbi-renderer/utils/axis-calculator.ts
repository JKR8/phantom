/**
 * Axis Calculator Utilities
 *
 * Reverse-engineered tick interval and axis calculation logic
 * to match Power BI Desktop's behavior.
 */

/**
 * Calculate "nice" tick intervals matching Power BI's algorithm.
 * Power BI uses intervals like 1, 2, 5, 10, 20, 50, 100, etc.
 */
export function calculateNiceTicks(
  min: number,
  max: number,
  targetTicks: number = 5
): { min: number; max: number; interval: number; ticks: number[] } {
  const range = max - min;

  if (range === 0) {
    return {
      min: 0,
      max: max === 0 ? 10 : max * 1.1,
      interval: max === 0 ? 2 : max * 0.2,
      ticks: max === 0 ? [0, 2, 4, 6, 8, 10] : [0, max]
    };
  }

  const roughInterval = range / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughInterval)));
  const normalized = roughInterval / magnitude;

  let niceInterval: number;
  if (normalized <= 1.5) niceInterval = 1;
  else if (normalized <= 3) niceInterval = 2;
  else if (normalized <= 7) niceInterval = 5;
  else niceInterval = 10;

  const interval = niceInterval * magnitude;

  // Calculate nice min and max
  const niceMin = Math.floor(min / interval) * interval;
  const niceMax = Math.ceil(max / interval) * interval;

  // Generate tick values
  const ticks: number[] = [];
  for (let tick = niceMin; tick <= niceMax + interval * 0.001; tick += interval) {
    // Round to avoid floating point errors
    ticks.push(Math.round(tick * 1e10) / 1e10);
  }

  return {
    min: niceMin,
    max: niceMax,
    interval,
    ticks
  };
}

/**
 * Format axis value with K, M, B, T suffixes like Power BI.
 */
export function formatAxisValue(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 1e12) {
    const formatted = (value / 1e12);
    return formatted % 1 === 0 ? formatted.toFixed(0) + 'T' : formatted.toFixed(1) + 'T';
  }
  if (abs >= 1e9) {
    const formatted = (value / 1e9);
    return formatted % 1 === 0 ? formatted.toFixed(0) + 'B' : formatted.toFixed(1) + 'B';
  }
  if (abs >= 1e6) {
    const formatted = (value / 1e6);
    return formatted % 1 === 0 ? formatted.toFixed(0) + 'M' : formatted.toFixed(1) + 'M';
  }
  if (abs >= 1e3) {
    const formatted = (value / 1e3);
    return formatted % 1 === 0 ? formatted.toFixed(0) + 'K' : formatted.toFixed(1) + 'K';
  }

  // For values < 1000, use locale string for proper formatting
  if (Number.isInteger(value)) {
    return value.toLocaleString('en-US');
  }

  // For decimals, limit to 2 decimal places
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

/**
 * Calculate the width needed for Y-axis labels based on max value.
 */
export function calculateYAxisWidth(
  maxValue: number,
  fontSize: number = 11,
  charWidth: number = 0.6
): number {
  const formatted = formatAxisValue(maxValue);
  const textWidth = formatted.length * fontSize * charWidth;
  // Add padding for tick marks and margin
  return Math.max(40, textWidth + 15);
}

/**
 * Calculate the height needed for X-axis labels based on longest label.
 */
export function calculateXAxisHeight(
  labels: string[],
  fontSize: number = 11,
  rotation: number = 0
): number {
  if (rotation === 0) {
    return 30; // Fixed height for horizontal labels
  }

  // For rotated labels, height depends on longest label
  const maxLength = Math.max(...labels.map(l => l.length));
  const charWidth = fontSize * 0.6;
  const textHeight = Math.sin((rotation * Math.PI) / 180) * maxLength * charWidth;
  return Math.max(30, textHeight + 15);
}
