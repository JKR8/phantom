/**
 * Store Action Unit Tests
 *
 * Tests for Zustand store actions that don't require a browser.
 * These test the pure logic of state transitions.
 */

import { describe, it, expect, beforeEach } from 'vitest';

// Mock minimal store state for testing actions
interface MockHighlight {
  dimension: string;
  values: Set<string>;
}

interface MockState {
  filters: Record<string, string>;
  highlight: MockHighlight | null;
  isDirty: boolean;
}

// Replicate the store logic for unit testing
function setFilter(
  state: MockState,
  column: string,
  value: string | null
): Partial<MockState> {
  const newFilters = { ...state.filters };
  if (value === null || value === undefined) {
    delete newFilters[column];
  } else {
    newFilters[column] = value;
  }
  return { filters: newFilters, isDirty: true };
}

function setHighlight(
  state: MockState,
  dimension: string,
  value: string,
  ctrlKey = false
): Partial<MockState> {
  const current = state.highlight;

  // If clicking the same dimension
  if (current && current.dimension === dimension) {
    if (ctrlKey) {
      // Ctrl+Click: toggle value in the set
      const newValues = new Set(current.values);
      if (newValues.has(value)) {
        newValues.delete(value);
      } else {
        newValues.add(value);
      }
      // If empty, clear highlight
      if (newValues.size === 0) return { highlight: null };
      return { highlight: { dimension, values: newValues } };
    } else {
      // Regular click: if same value, toggle off; otherwise replace
      if (current.values.has(value) && current.values.size === 1) {
        return { highlight: null };
      }
      return { highlight: { dimension, values: new Set([value]) } };
    }
  }

  // Different dimension or no current: start new
  return { highlight: { dimension, values: new Set([value]) } };
}

function clearHighlight(): Partial<MockState> {
  return { highlight: null };
}

function clearFilters(): Partial<MockState> {
  return { filters: {}, highlight: null };
}

describe('store actions', () => {
  let state: MockState;

  beforeEach(() => {
    state = {
      filters: {},
      highlight: null,
      isDirty: false,
    };
  });

  describe('setFilter', () => {
    it('adds filter and sets isDirty', () => {
      const result = setFilter(state, 'Category', 'Electronics');

      expect(result.filters).toEqual({ Category: 'Electronics' });
      expect(result.isDirty).toBe(true);
    });

    it('removes filter when value is null', () => {
      state.filters = { Category: 'Electronics' };
      const result = setFilter(state, 'Category', null);

      expect(result.filters).toEqual({});
    });

    it('stacks multiple filters', () => {
      let result = setFilter(state, 'Category', 'Electronics');
      state = { ...state, ...result };
      result = setFilter(state, 'Region', 'North America');

      expect(result.filters).toEqual({
        Category: 'Electronics',
        Region: 'North America',
      });
    });

    it('replaces existing filter value', () => {
      state.filters = { Category: 'Electronics' };
      const result = setFilter(state, 'Category', 'Furniture');

      expect(result.filters).toEqual({ Category: 'Furniture' });
    });
  });

  describe('setHighlight', () => {
    it('creates highlight with single value', () => {
      const result = setHighlight(state, 'Category', 'Electronics');

      expect(result.highlight?.dimension).toBe('Category');
      expect(Array.from(result.highlight?.values || [])).toEqual(['Electronics']);
    });

    it('adds to selection with ctrlKey', () => {
      state.highlight = { dimension: 'Category', values: new Set(['Electronics']) };
      const result = setHighlight(state, 'Category', 'Furniture', true);

      expect(result.highlight?.dimension).toBe('Category');
      expect(Array.from(result.highlight?.values || []).sort()).toEqual(['Electronics', 'Furniture']);
    });

    it('toggles off existing value with ctrlKey', () => {
      state.highlight = { dimension: 'Category', values: new Set(['Electronics', 'Furniture']) };
      const result = setHighlight(state, 'Category', 'Electronics', true);

      expect(Array.from(result.highlight?.values || [])).toEqual(['Furniture']);
    });

    it('clears when all values toggled off with ctrlKey', () => {
      state.highlight = { dimension: 'Category', values: new Set(['Electronics']) };
      const result = setHighlight(state, 'Category', 'Electronics', true);

      expect(result.highlight).toBeNull();
    });

    it('replaces highlight on different dimension', () => {
      state.highlight = { dimension: 'Category', values: new Set(['Electronics']) };
      const result = setHighlight(state, 'Region', 'North America');

      expect(result.highlight?.dimension).toBe('Region');
      expect(Array.from(result.highlight?.values || [])).toEqual(['North America']);
    });

    it('toggles off when clicking same single value without ctrl', () => {
      state.highlight = { dimension: 'Category', values: new Set(['Electronics']) };
      const result = setHighlight(state, 'Category', 'Electronics');

      expect(result.highlight).toBeNull();
    });

    it('replaces multi-selection with single value on regular click', () => {
      state.highlight = { dimension: 'Category', values: new Set(['Electronics', 'Furniture']) };
      const result = setHighlight(state, 'Category', 'Clothing');

      expect(Array.from(result.highlight?.values || [])).toEqual(['Clothing']);
    });
  });

  describe('clearHighlight', () => {
    it('resets highlight to null', () => {
      state.highlight = { dimension: 'Category', values: new Set(['Electronics']) };
      const result = clearHighlight();

      expect(result.highlight).toBeNull();
    });
  });

  describe('clearFilters', () => {
    it('clears both filters and highlight', () => {
      state.filters = { Category: 'Electronics' };
      state.highlight = { dimension: 'Region', values: new Set(['North America']) };
      const result = clearFilters();

      expect(result.filters).toEqual({});
      expect(result.highlight).toBeNull();
    });
  });
});
