import { describe, expect, it } from 'vitest';
import {
  getSupportLabel,
  isVisualAvailableForMode,
  pbiUiKitVisuals,
} from './VisualizationsPane';

describe('VisualizationsPane mode contract', () => {
  it('hides design-only visuals in Power BI Mode but keeps them available in React Product Mode', () => {
    const designOnlyVisuals = pbiUiKitVisuals.filter((visual) => visual.pbiSupport === 'design-only');

    expect(designOnlyVisuals.map((visual) => visual.id)).toEqual(
      expect.arrayContaining(['histogram', 'boxplot', 'violin', 'regressionScatter', 'barbell', 'slope']),
    );
    expect(designOnlyVisuals.every((visual) => isVisualAvailableForMode(visual, 'powerBi'))).toBe(false);
    expect(designOnlyVisuals.every((visual) => isVisualAvailableForMode(visual, 'react'))).toBe(true);
  });

  it('labels approximate Power BI visuals distinctly', () => {
    const approximateVisual = pbiUiKitVisuals.find((visual) => visual.id === 'lollipop');

    expect(approximateVisual?.pbiSupport).toBe('approximate');
    expect(approximateVisual && isVisualAvailableForMode(approximateVisual, 'powerBi')).toBe(true);
    expect(approximateVisual && getSupportLabel(approximateVisual, 'powerBi')).toBe('PBI~');
    expect(approximateVisual && getSupportLabel(approximateVisual, 'react')).toBe('React');
  });
});
