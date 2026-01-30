/**
 * Base Renderer
 *
 * Abstract base class for all Power BI visual renderers.
 * Provides common utilities for config resolution, plot area calculation,
 * and color handling.
 */

export interface DataPoint {
  category: string;
  value: number;
  series?: string;
}

export interface RenderContext {
  container: HTMLElement | SVGElement;
  width: number;
  height: number;
  data: DataPoint[];
}

export interface PlotArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisualConfig {
  objects?: Record<string, any>;
  [key: string]: any;
}

export interface BarChartDefaults {
  visualType: string;
  container: {
    padding: { top: number; right: number; bottom: number; left: number };
    background: string;
  };
  categoryAxis: {
    width: number;
    line: { visible: boolean; color: string; width: number };
    ticks: { visible: boolean; length: number; color: string; width: number };
    labels: {
      font: { family: string; size: number; color: string; weight: number };
      maxWidth: number;
      marginRight: number;
    };
  };
  valueAxis: {
    height: number;
    line: { visible: boolean; color: string; width: number };
    ticks: { visible: boolean; length: number; color: string; width: number };
    labels: {
      font: { family: string; size: number; color: string; weight: number };
      format: string;
      marginTop: number;
    };
    gridLines: {
      visible: boolean;
      color: string;
      width: number;
      dashArray: string | null;
    };
  };
  bars: {
    layout: { widthRatio: number; groupPadding: number; barPadding: number };
    appearance: { cornerRadius: number; strokeWidth: number; strokeColor: string | null };
    colors: { palette: string[] };
  };
  dataLabels: {
    defaultVisible: boolean;
    position: string;
    font: { family: string; size: number; color: string; weight: number };
    padding: number;
  };
  legend: {
    defaultVisible: boolean;
    position: string;
    dimensions: { widthWhenSide: number; heightWhenTopBottom: number };
    item: {
      marker: { shape: string; size: number };
      spacing: number;
      font: { family: string; size: number; color: string };
    };
    padding: number;
    marginFromPlot: number;
  };
}

export abstract class BaseRenderer<TDefaults = BarChartDefaults> {
  protected config: VisualConfig;
  protected defaults: TDefaults;

  constructor(config: VisualConfig, defaults: TDefaults) {
    this.config = config;
    this.defaults = defaults;
  }

  /**
   * Get a configuration value with fallback to defaults.
   * Supports dot notation for nested paths.
   */
  protected getConfig<T>(path: string, fallback?: T): T {
    // First try explicit config
    const explicit = this.getNestedValue(this.config, path);
    if (explicit !== undefined) return explicit;

    // Then try defaults
    const defaultValue = this.getNestedValue(this.defaults, path);
    if (defaultValue !== undefined) return defaultValue;

    // Finally return fallback
    if (fallback !== undefined) return fallback;

    throw new Error(`No value found for config path: ${path}`);
  }

  /**
   * Get a color value from PBIP format { solid: { color: "#xxx" } }
   * or return a direct string color.
   */
  protected getColor(path: string, fallback: string): string {
    const colorObj = this.getConfig<any>(path, null);
    if (colorObj?.solid?.color) return colorObj.solid.color;
    if (typeof colorObj === 'string') return colorObj;
    return fallback;
  }

  /**
   * Get color from palette by index.
   */
  protected getPaletteColor(index: number): string {
    const palette = this.getConfig<string[]>('bars.colors.palette', []);
    return palette[index % palette.length] || '#01B8AA';
  }

  /**
   * Calculate contrast color (white or black) for text on a given background.
   * Uses relative luminance calculation per WCAG guidelines.
   */
  protected getContrastColor(backgroundColor: string): string {
    // Parse hex color
    let hex = backgroundColor.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    // Calculate relative luminance
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Return white for dark backgrounds, dark gray for light backgrounds
    return luminance > 0.5 ? '#333333' : '#FFFFFF';
  }

  /**
   * Get nested value from object using dot notation.
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Main render method to be implemented by subclasses.
   */
  public abstract render(ctx: RenderContext): SVGElement;

  /**
   * Calculate plot area dimensions accounting for axes, legend, title.
   */
  protected abstract calculatePlotArea(ctx: RenderContext): PlotArea;
}
