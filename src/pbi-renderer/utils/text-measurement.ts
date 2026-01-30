/**
 * Text Measurement Utilities
 *
 * Utilities for measuring text width and handling label truncation
 * to match Power BI's text rendering behavior.
 */

// Cache for measured text widths
const textWidthCache = new Map<string, number>();

/**
 * Measure text width using canvas context.
 * Uses a cached canvas for performance.
 */
let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
    measureCtx = measureCanvas.getContext('2d');
  }
  return measureCtx!;
}

/**
 * Measure the width of text with given font settings.
 */
export function measureTextWidth(
  text: string,
  fontSize: number = 11,
  fontFamily: string = 'Segoe UI, sans-serif',
  fontWeight: number = 400
): number {
  const cacheKey = `${text}-${fontSize}-${fontFamily}-${fontWeight}`;
  if (textWidthCache.has(cacheKey)) {
    return textWidthCache.get(cacheKey)!;
  }

  // Fallback for server-side rendering or when canvas not available
  if (typeof document === 'undefined') {
    // Approximate character width as 0.6 * fontSize for Segoe UI
    const charWidth = fontSize * 0.6;
    return text.length * charWidth;
  }

  const ctx = getMeasureContext();
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  const width = metrics.width;

  textWidthCache.set(cacheKey, width);
  return width;
}

/**
 * Truncate text with ellipsis to fit within maxWidth.
 * Matches Power BI's truncation behavior.
 */
export function truncateLabel(
  text: string,
  maxWidth: number,
  fontSize: number = 11,
  fontFamily: string = 'Segoe UI, sans-serif',
  fontWeight: number = 400
): string {
  const fullWidth = measureTextWidth(text, fontSize, fontFamily, fontWeight);

  if (fullWidth <= maxWidth) {
    return text;
  }

  const ellipsis = '...';
  const ellipsisWidth = measureTextWidth(ellipsis, fontSize, fontFamily, fontWeight);
  const availableWidth = maxWidth - ellipsisWidth;

  if (availableWidth <= 0) {
    return ellipsis;
  }

  // Binary search for optimal truncation point
  let low = 0;
  let high = text.length;

  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    const truncated = text.substring(0, mid);
    const width = measureTextWidth(truncated, fontSize, fontFamily, fontWeight);

    if (width <= availableWidth) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  if (low === 0) {
    return ellipsis;
  }

  return text.substring(0, low) + ellipsis;
}

/**
 * Approximate text width without canvas (for SSR/tests).
 * Uses average character width for Segoe UI font.
 */
export function approximateTextWidth(
  text: string,
  fontSize: number = 11
): number {
  // Segoe UI approximate character widths
  const charWidths: Record<string, number> = {
    'W': 0.85,
    'M': 0.85,
    'm': 0.75,
    'w': 0.75,
    'i': 0.25,
    'l': 0.25,
    'I': 0.3,
    '1': 0.5,
    ' ': 0.3,
  };

  let width = 0;
  for (const char of text) {
    const charWidth = charWidths[char] ?? 0.6;
    width += charWidth * fontSize;
  }

  return width;
}

/**
 * Truncate label using approximate character widths (for SSR/tests).
 */
export function truncateLabelApproximate(
  text: string,
  maxWidth: number,
  fontSize: number = 11
): string {
  const fullWidth = approximateTextWidth(text, fontSize);

  if (fullWidth <= maxWidth) {
    return text;
  }

  const ellipsisWidth = approximateTextWidth('...', fontSize);
  const availableWidth = maxWidth - ellipsisWidth;

  if (availableWidth <= 0) {
    return '...';
  }

  // Use average char width for truncation
  const avgCharWidth = fontSize * 0.6;
  const maxChars = Math.floor(availableWidth / avgCharWidth);

  if (maxChars <= 0) {
    return '...';
  }

  return text.substring(0, maxChars) + '...';
}

/**
 * Clear the text width cache (useful for testing or memory management).
 */
export function clearTextWidthCache(): void {
  textWidthCache.clear();
}
