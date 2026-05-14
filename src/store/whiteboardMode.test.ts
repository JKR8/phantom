import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';

describe('Whiteboard Mode', () => {
  beforeEach(() => {
    // Reset the store to initial state
    useStore.getState().resetToNew();
  });

  describe('canvasMode', () => {
    it('defaults to pbi mode', () => {
      expect(useStore.getState().canvasMode).toBe('pbi');
    });

    it('can switch to whiteboard mode', () => {
      useStore.getState().setCanvasMode('whiteboard');
      expect(useStore.getState().canvasMode).toBe('whiteboard');
    });

    it('can switch back to pbi mode', () => {
      useStore.getState().setCanvasMode('whiteboard');
      useStore.getState().setCanvasMode('pbi');
      expect(useStore.getState().canvasMode).toBe('pbi');
    });

    it('resets zoom/pan when switching to pbi mode', () => {
      useStore.getState().setCanvasMode('whiteboard');
      useStore.getState().setCanvasZoom(1.5);
      useStore.getState().setCanvasPan(100, 200);

      useStore.getState().setCanvasMode('pbi');

      expect(useStore.getState().canvasZoom).toBe(1);
      expect(useStore.getState().canvasPanX).toBe(0);
      expect(useStore.getState().canvasPanY).toBe(0);
    });
  });

  describe('canvasZoom', () => {
    it('defaults to 1', () => {
      expect(useStore.getState().canvasZoom).toBe(1);
    });

    it('can set zoom within bounds', () => {
      useStore.getState().setCanvasZoom(1.5);
      expect(useStore.getState().canvasZoom).toBe(1.5);
    });

    it('clamps zoom to minimum 0.25', () => {
      useStore.getState().setCanvasZoom(0.1);
      expect(useStore.getState().canvasZoom).toBe(0.25);
    });

    it('clamps zoom to maximum 2.0', () => {
      useStore.getState().setCanvasZoom(3);
      expect(useStore.getState().canvasZoom).toBe(2);
    });
  });

  describe('canvasPan', () => {
    it('defaults to 0, 0', () => {
      expect(useStore.getState().canvasPanX).toBe(0);
      expect(useStore.getState().canvasPanY).toBe(0);
    });

    it('can set pan position', () => {
      useStore.getState().setCanvasPan(100, 200);
      expect(useStore.getState().canvasPanX).toBe(100);
      expect(useStore.getState().canvasPanY).toBe(200);
    });

    it('can set negative pan values', () => {
      useStore.getState().setCanvasPan(-50, -100);
      expect(useStore.getState().canvasPanX).toBe(-50);
      expect(useStore.getState().canvasPanY).toBe(-100);
    });
  });

  describe('resetCanvasView', () => {
    it('resets zoom and pan to defaults', () => {
      useStore.getState().setCanvasZoom(1.5);
      useStore.getState().setCanvasPan(100, 200);

      useStore.getState().resetCanvasView();

      expect(useStore.getState().canvasZoom).toBe(1);
      expect(useStore.getState().canvasPanX).toBe(0);
      expect(useStore.getState().canvasPanY).toBe(0);
    });
  });

  describe('annotations', () => {
    it('defaults to empty array', () => {
      expect(useStore.getState().annotations).toEqual([]);
    });

    it('can add an annotation', () => {
      const annotation = {
        id: 'test-1',
        type: 'sticky' as const,
        x: 100,
        y: 200,
        width: 150,
        height: 100,
        content: 'Test note',
        color: '#FFF9C4',
      };

      useStore.getState().addAnnotation(annotation);

      expect(useStore.getState().annotations).toHaveLength(1);
      expect(useStore.getState().annotations[0]).toEqual(annotation);
    });

    it('marks dashboard as dirty when adding annotation', () => {
      useStore.getState().markClean();

      useStore.getState().addAnnotation({
        id: 'test-1',
        type: 'sticky',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        content: '',
        color: '#FFF9C4',
      });

      expect(useStore.getState().isDirty).toBe(true);
    });

    it('can update an annotation', () => {
      useStore.getState().addAnnotation({
        id: 'test-1',
        type: 'sticky',
        x: 100,
        y: 200,
        width: 150,
        height: 100,
        content: 'Original',
        color: '#FFF9C4',
      });

      useStore.getState().updateAnnotation('test-1', { content: 'Updated', x: 150 });

      const annotation = useStore.getState().annotations[0];
      expect(annotation.content).toBe('Updated');
      expect(annotation.x).toBe(150);
      expect(annotation.y).toBe(200); // unchanged
    });

    it('can remove an annotation', () => {
      useStore.getState().addAnnotation({
        id: 'test-1',
        type: 'sticky',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        content: '',
        color: '#FFF9C4',
      });

      useStore.getState().removeAnnotation('test-1');

      expect(useStore.getState().annotations).toHaveLength(0);
    });

    it('clears selectedAnnotationId when removing selected annotation', () => {
      useStore.getState().addAnnotation({
        id: 'test-1',
        type: 'sticky',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        content: '',
        color: '#FFF9C4',
      });
      useStore.getState().selectAnnotation('test-1');

      useStore.getState().removeAnnotation('test-1');

      expect(useStore.getState().selectedAnnotationId).toBeNull();
    });
  });

  describe('annotation selection', () => {
    it('defaults to null', () => {
      expect(useStore.getState().selectedAnnotationId).toBeNull();
    });

    it('can select an annotation', () => {
      useStore.getState().selectAnnotation('test-1');
      expect(useStore.getState().selectedAnnotationId).toBe('test-1');
    });

    it('clears selectedItemId when selecting annotation', () => {
      useStore.getState().selectItem('some-item');
      useStore.getState().selectAnnotation('test-1');
      expect(useStore.getState().selectedItemId).toBeNull();
    });

    it('clears selectedAnnotationId when selecting item', () => {
      useStore.getState().selectAnnotation('test-1');
      useStore.getState().selectItem('some-item');
      expect(useStore.getState().selectedAnnotationId).toBeNull();
    });

    it('can deselect by passing null', () => {
      useStore.getState().selectAnnotation('test-1');
      useStore.getState().selectAnnotation(null);
      expect(useStore.getState().selectedAnnotationId).toBeNull();
    });
  });

  describe('getSerializableState', () => {
    it('includes annotations in serialized state', () => {
      useStore.getState().addAnnotation({
        id: 'test-1',
        type: 'sticky',
        x: 100,
        y: 200,
        width: 150,
        height: 100,
        content: 'Test',
        color: '#FFF9C4',
      });

      const state = useStore.getState().getSerializableState();

      expect(state.annotations).toHaveLength(1);
      expect(state.annotations![0].content).toBe('Test');
    });
  });

  describe('resetToNew', () => {
    it('resets whiteboard state', () => {
      useStore.getState().setCanvasMode('whiteboard');
      useStore.getState().setCanvasZoom(1.5);
      useStore.getState().setCanvasPan(100, 200);
      useStore.getState().addAnnotation({
        id: 'test-1',
        type: 'sticky',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        content: '',
        color: '#FFF9C4',
      });
      useStore.getState().selectAnnotation('test-1');

      useStore.getState().resetToNew();

      expect(useStore.getState().canvasMode).toBe('pbi');
      expect(useStore.getState().canvasZoom).toBe(1);
      expect(useStore.getState().canvasPanX).toBe(0);
      expect(useStore.getState().canvasPanY).toBe(0);
      expect(useStore.getState().annotations).toEqual([]);
      expect(useStore.getState().selectedAnnotationId).toBeNull();
    });
  });
});
