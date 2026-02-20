import { describe, it, expect } from 'vitest';
import type { DashboardItem, VisualType } from '../types';
import {
  PBI_CANVAS_HEIGHT,
  PBI_CANVAS_WIDTH,
  PBI_VISUAL_TYPES,
  PHANTOM_GRID_COLS,
  PHANTOM_ROW_HEIGHT,
  calculateOptimalCanvas,
  convertLayoutToPBI,
  getPBIVisualType,
  gridToPixels,
} from './layoutConverter';

describe('layoutConverter', () => {
  describe('gridToPixels', () => {
    it('calculates pixel positions from grid coordinates', () => {
      const layout = { x: 12, y: 3, w: 24, h: 5 };
      const colWidth = PBI_CANVAS_WIDTH / PHANTOM_GRID_COLS;
      const result = gridToPixels(layout);

      expect(result).toEqual({
        x: Math.round(12 * colWidth),
        y: Math.round(3 * PHANTOM_ROW_HEIGHT),
        width: Math.round(24 * colWidth),
        height: Math.round(5 * PHANTOM_ROW_HEIGHT),
      });
    });

    it('enforces minimum width >= 50 and height >= 30', () => {
      const result = gridToPixels({ x: 0, y: 0, w: 1, h: 1 });
      expect(result.width).toBe(50);
      expect(result.height).toBe(30);
    });
  });

  describe('getPBIVisualType', () => {
    it.each(Object.entries(PBI_VISUAL_TYPES) as Array<[VisualType, string]>)(
      'maps %s to %s',
      (phantomType, pbiType) => {
        expect(getPBIVisualType(phantomType)).toBe(pbiType);
      }
    );

    it('falls back to card for unknown visual types', () => {
      expect(getPBIVisualType('unknownVisual' as VisualType)).toBe('card');
    });
  });

  describe('convertLayoutToPBI', () => {
    it('returns mapped visual configs with expected structure', () => {
      const items: DashboardItem[] = [
        {
          id: '1',
          type: 'bar',
          title: 'Revenue by Category',
          layout: { x: 0, y: 0, w: 12, h: 5 },
          props: { dimension: 'Category', metric: 'Revenue' },
        },
      ];

      const result = convertLayoutToPBI(items, 'Retail');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'visual_1',
        visualType: 'clusteredBarChart',
        title: 'Revenue by Category',
        phantomProps: { dimension: 'Category', metric: 'Revenue' },
        originalType: 'bar',
      });
      expect(result[0].position).toEqual(gridToPixels(items[0].layout));
    });
  });

  describe('calculateOptimalCanvas', () => {
    it('keeps minimum height at default canvas height', () => {
      const result = calculateOptimalCanvas([]);
      expect(result.width).toBe(PBI_CANVAS_WIDTH);
      expect(result.height).toBe(PBI_CANVAS_HEIGHT);
    });

    it('expands height to fit content below default fold', () => {
      const items: DashboardItem[] = [
        {
          id: 'tall-1',
          type: 'table',
          title: 'Tall Table',
          layout: { x: 0, y: 40, w: 24, h: 10 },
          props: {},
        },
      ];

      const result = calculateOptimalCanvas(items);
      expect(result.width).toBe(PBI_CANVAS_WIDTH);
      expect(result.height).toBe((40 + 10) * PHANTOM_ROW_HEIGHT);
      expect(result.height).toBeGreaterThanOrEqual(PBI_CANVAS_HEIGHT);
    });
  });
});
