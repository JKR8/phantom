/**
 * Vega-Lite Specification Generators
 *
 * Creates Vega-Lite JSON specs that can be rendered in:
 * - Phantom (via vega-embed)
 * - Power BI (via Deneb custom visual)
 *
 * Same spec = identical rendering = 100% parity
 */

// Use a more permissive type to support layered specs
type VegaLiteSpec = Record<string, unknown>;

// Mokkup brand colors (from pbipWriter.ts)
const MOKKUP_COLORS = {
  primary: '#342BC2',
  secondary: '#6F67F1',
  tertiary: '#9993FF',
  accent: '#44B0AB',
  success: '#93BF35',
  text: '#252423',
  textSecondary: '#605E5C',
  grid: '#F3F2F1',
};

interface ChartData {
  name: string;
  value: number;
}

interface BarChartConfig {
  title?: string;
  horizontal?: boolean;
  colors?: string[];  // Explicit color array matching data order
}

interface LineChartConfig {
  title?: string;
  color?: string;
  showPoints?: boolean;
}

interface TimeSeriesData {
  date: string;
  value: number;
}

/**
 * Generate Vega-Lite spec for a bar chart
 */
export function createBarChartSpec(
  data: ChartData[],
  config: BarChartConfig = {}
): VegaLiteSpec {
  const { title, horizontal = true, colors } = config;

  // Sort data by value descending for consistent color mapping
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  const categoryNames = sortedData.map(d => d.name);

  // Horizontal bar chart (like Phantom's default)
  if (horizontal) {
    return {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      description: title || 'Bar Chart',
      width: 'container',
      height: 'container',
      autosize: { type: 'fit', contains: 'padding' },
      data: { values: sortedData },
      mark: {
        type: 'bar',
        cornerRadiusEnd: 4,
      },
      encoding: {
        y: {
          field: 'name',
          type: 'nominal',
          sort: null,  // Already sorted
          axis: {
            labelFontSize: 10,
            labelColor: MOKKUP_COLORS.textSecondary,
            title: null,
            labelLimit: 80,
          }
        },
        x: {
          field: 'value',
          type: 'quantitative',
          axis: {
            grid: true,
            gridColor: MOKKUP_COLORS.grid,
            gridDash: [3, 3],
            title: null,
            labels: false,
            ticks: false,
            domain: false,
          }
        },
        color: colors ? {
          field: 'name',
          type: 'nominal',
          scale: {
            domain: categoryNames,
            range: colors.slice(0, categoryNames.length),
          },
          legend: null,
        } : undefined,
        tooltip: [
          { field: 'name', type: 'nominal', title: 'Category' },
          { field: 'value', type: 'quantitative', title: 'Value', format: ',.0f' }
        ]
      },
      config: {
        view: { stroke: 'transparent' },
        font: 'Segoe UI, Arial, sans-serif',
        axis: {
          labelFont: 'Segoe UI, Arial, sans-serif',
          titleFont: 'Segoe UI, Arial, sans-serif',
        }
      }
    };
  }

  // Vertical column chart

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: title || 'Column Chart',
    width: 'container',
    height: 'container',
    autosize: { type: 'fit', contains: 'padding' },
    data: { values: data },  // Keep original order for x-axis
    mark: {
      type: 'bar',
      cornerRadiusTopLeft: 4,
      cornerRadiusTopRight: 4,
    },
    encoding: {
      x: {
        field: 'name',
        type: 'nominal',
        axis: {
          labelFontSize: 10,
          labelColor: MOKKUP_COLORS.textSecondary,
          title: null,
          labelAngle: 0,
        }
      },
      y: {
        field: 'value',
        type: 'quantitative',
        axis: {
          grid: true,
          gridColor: MOKKUP_COLORS.grid,
          gridDash: [3, 3],
          title: null,
        }
      },
      color: colors ? {
        field: 'name',
        type: 'nominal',
        scale: {
          domain: data.map(d => d.name),
          range: colors.slice(0, data.length),
        },
        legend: null,
      } : undefined,
      tooltip: [
        { field: 'name', type: 'nominal', title: 'Category' },
        { field: 'value', type: 'quantitative', title: 'Value', format: ',.0f' }
      ]
    },
    config: {
      view: { stroke: 'transparent' },
      font: 'Segoe UI, Arial, sans-serif',
    }
  };
}

/**
 * Generate Vega-Lite spec for a line chart
 */
export function createLineChartSpec(
  data: TimeSeriesData[],
  config: LineChartConfig = {}
): VegaLiteSpec {
  const { title, color = MOKKUP_COLORS.primary, showPoints = true } = config;

  const marks: VegaLiteSpec[] = [
    {
      mark: {
        type: 'line',
        color,
        strokeWidth: 2,
        interpolate: 'monotone',
      },
      encoding: {
        x: {
          field: 'date',
          type: 'temporal',
          axis: {
            labelFontSize: 10,
            labelColor: MOKKUP_COLORS.textSecondary,
            title: null,
            format: '%b %Y',
          }
        },
        y: {
          field: 'value',
          type: 'quantitative',
          axis: {
            grid: true,
            gridColor: MOKKUP_COLORS.grid,
            gridDash: [3, 3],
            title: null,
          }
        },
      }
    }
  ];

  if (showPoints) {
    marks.push({
      mark: {
        type: 'point',
        color,
        filled: true,
        size: 40,
      },
      encoding: {
        x: { field: 'date', type: 'temporal' },
        y: { field: 'value', type: 'quantitative' },
        tooltip: [
          { field: 'date', type: 'temporal', title: 'Date', format: '%b %d, %Y' },
          { field: 'value', type: 'quantitative', title: 'Value', format: ',.0f' }
        ]
      }
    });
  }

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: title || 'Line Chart',
    data: { values: data },
    layer: marks,
    config: {
      view: { stroke: 'transparent' },
      font: 'Segoe UI, Arial, sans-serif',
    }
  };
}

/**
 * Generate Vega-Lite spec for a multi-series line chart
 */
export function createMultiLineChartSpec(
  data: Array<{ date: string; value: number; series: string }>,
  config: { title?: string; colors?: string[] } = {}
): VegaLiteSpec {
  const { title, colors = [MOKKUP_COLORS.primary, MOKKUP_COLORS.accent, MOKKUP_COLORS.success] } = config;

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: title || 'Multi-Series Line Chart',
    data: { values: data },
    mark: {
      type: 'line',
      strokeWidth: 2,
      interpolate: 'monotone',
    },
    encoding: {
      x: {
        field: 'date',
        type: 'temporal',
        axis: {
          labelFontSize: 10,
          labelColor: MOKKUP_COLORS.textSecondary,
          title: null,
          format: '%b %Y',
        }
      },
      y: {
        field: 'value',
        type: 'quantitative',
        axis: {
          grid: true,
          gridColor: MOKKUP_COLORS.grid,
          gridDash: [3, 3],
          title: null,
        }
      },
      color: {
        field: 'series',
        type: 'nominal',
        scale: { range: colors },
        legend: {
          orient: 'bottom',
          labelFontSize: 10,
          labelColor: MOKKUP_COLORS.textSecondary,
        }
      },
      tooltip: [
        { field: 'series', type: 'nominal', title: 'Series' },
        { field: 'date', type: 'temporal', title: 'Date', format: '%b %d, %Y' },
        { field: 'value', type: 'quantitative', title: 'Value', format: ',.0f' }
      ]
    },
    config: {
      view: { stroke: 'transparent' },
      font: 'Segoe UI, Arial, sans-serif',
    }
  };
}

interface KPIConfig {
  value: string;
  label: string;
  varPY?: number;
  varPL?: number;
  accentColor?: string;
}

/**
 * Generate Vega-Lite spec for a KPI card
 */
export function createKPISpec(config: KPIConfig): VegaLiteSpec {
  const { value, label, varPY, varPL, accentColor = MOKKUP_COLORS.primary } = config;

  const layers: VegaLiteSpec[] = [];

  // Main value
  layers.push({
    mark: {
      type: 'text',
      fontSize: 32,
      fontWeight: 'bold',
      color: accentColor,
      baseline: 'middle',
      align: 'center',
    },
    encoding: {
      text: { value },
      x: { value: 'width / 2' },
      y: { value: 'height * 0.35' },
    }
  });

  // Label
  layers.push({
    mark: {
      type: 'text',
      fontSize: 12,
      color: MOKKUP_COLORS.textSecondary,
      baseline: 'top',
      align: 'center',
    },
    encoding: {
      text: { value: label },
      x: { value: 'width / 2' },
      y: { value: 'height * 0.55' },
    }
  });

  // Variance indicators
  if (varPY !== undefined) {
    const varColor = varPY >= 0 ? MOKKUP_COLORS.success : '#d13438';
    const varSign = varPY >= 0 ? '+' : '';
    layers.push({
      mark: {
        type: 'text',
        fontSize: 10,
        color: varColor,
        baseline: 'top',
        align: 'center',
      },
      encoding: {
        text: { value: `vs PY: ${varSign}${varPY.toFixed(1)}%` },
        x: { value: 'width / 2' },
        y: { value: 'height * 0.72' },
      }
    });
  }

  if (varPL !== undefined) {
    const varColor = varPL >= 0 ? MOKKUP_COLORS.success : '#d13438';
    const varSign = varPL >= 0 ? '+' : '';
    layers.push({
      mark: {
        type: 'text',
        fontSize: 10,
        color: varColor,
        baseline: 'top',
        align: 'center',
      },
      encoding: {
        text: { value: `vs PL: ${varSign}${varPL.toFixed(1)}%` },
        x: { value: 'width / 2' },
        y: { value: 'height * 0.85' },
      }
    });
  }

  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    description: `KPI: ${label}`,
    width: 'container',
    height: 'container',
    autosize: { type: 'fit', contains: 'padding' },
    data: { values: [{}] }, // Single dummy row for positioning
    layer: layers,
    config: {
      view: { stroke: 'transparent' },
      font: 'Segoe UI, Arial, sans-serif',
    }
  };
}
