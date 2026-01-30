/**
 * Visual Props Validator
 *
 * Validates visual props against PBI constraints and scenario data.
 * Provides errors for invalid values and warnings for potential issues.
 */

import type { VisualType, Scenario, ValidationResult, ValidationError, ValidationWarning } from '../types';
import type { AnyPhantomProps } from '../types/visual-props';
import { isValidHexColor } from '../pbi-constraints/colors';
import { isValidPBIFontSize, PBI_FONT_SIZES } from '../pbi-constraints/fonts';
import { isValidDataVizColor, PBI_DATA_VIZ_COLORS_ARRAY } from '../tokens/pbi-css-tokens';
import { ScenarioFields, ScenarioType } from '../store/semanticLayer';

/**
 * Get valid dimension fields for a scenario
 */
function getValidDimensions(scenario: Scenario): string[] {
  const fields = ScenarioFields[scenario as ScenarioType] || [];
  return fields
    .filter(f => f.role === 'Category' || f.role === 'Entity' || f.role === 'Geography' || f.role === 'Time')
    .map(f => f.name);
}

/**
 * Get valid metric fields for a scenario
 */
function getValidMetrics(scenario: Scenario): string[] {
  const fields = ScenarioFields[scenario as ScenarioType] || [];
  return fields
    .filter(f => f.role === 'Measure')
    .map(f => f.name);
}

/**
 * Validate a hex color value
 */
function validateHexColor(value: unknown, field: string): ValidationError | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    return {
      field,
      message: `Color must be a string, got ${typeof value}`,
      code: 'TYPE_MISMATCH',
    };
  }
  if (!isValidHexColor(value)) {
    return {
      field,
      message: `Invalid hex color format: "${value}". Must be #RRGGBB format.`,
      code: 'INVALID_VALUE',
    };
  }
  return null;
}

/**
 * Validate a font size value
 */
function validateFontSize(value: unknown, field: string): ValidationError | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number') {
    return {
      field,
      message: `Font size must be a number, got ${typeof value}`,
      code: 'TYPE_MISMATCH',
    };
  }
  if (!isValidPBIFontSize(value)) {
    return {
      field,
      message: `Invalid font size: ${value}. Valid sizes: ${PBI_FONT_SIZES.join(', ')}`,
      code: 'INVALID_VALUE',
    };
  }
  return null;
}

/**
 * Check if a color is a standard PBI data viz color (warning if not)
 */
function checkDataVizColor(value: unknown, field: string): ValidationWarning | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return null;
  if (!isValidDataVizColor(value)) {
    return {
      field,
      message: `Color "${value}" is not a standard PBI data viz color. Export may look different.`,
      code: 'APPROXIMATION',
    };
  }
  return null;
}

/**
 * Validate dimension field exists in scenario
 */
function validateDimension(
  value: unknown,
  field: string,
  scenario: Scenario
): { error?: ValidationError; warning?: ValidationWarning } {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'string') {
    return {
      error: {
        field,
        message: `Dimension must be a string, got ${typeof value}`,
        code: 'TYPE_MISMATCH',
      },
    };
  }

  const validDimensions = getValidDimensions(scenario);
  if (!validDimensions.includes(value)) {
    // Check if it might be a metric instead
    const validMetrics = getValidMetrics(scenario);
    if (validMetrics.includes(value)) {
      return {
        warning: {
          field,
          message: `"${value}" is a metric, not a dimension. This may cause unexpected results.`,
          code: 'APPROXIMATION',
        },
      };
    }
    return {
      warning: {
        field,
        message: `Dimension "${value}" not found in ${scenario} scenario. Available: ${validDimensions.join(', ')}`,
        code: 'ORPHANED_FIELD',
      },
    };
  }
  return {};
}

/**
 * Validate metric field exists in scenario
 */
function validateMetric(
  value: unknown,
  field: string,
  scenario: Scenario
): { error?: ValidationError; warning?: ValidationWarning } {
  if (value === undefined || value === null) return {};
  if (typeof value !== 'string') {
    return {
      error: {
        field,
        message: `Metric must be a string, got ${typeof value}`,
        code: 'TYPE_MISMATCH',
      },
    };
  }

  const validMetrics = getValidMetrics(scenario);
  if (!validMetrics.includes(value)) {
    // Check if it might be a dimension instead
    const validDimensions = getValidDimensions(scenario);
    if (validDimensions.includes(value)) {
      return {
        warning: {
          field,
          message: `"${value}" is a dimension, not a metric. This may cause unexpected results.`,
          code: 'APPROXIMATION',
        },
      };
    }
    return {
      warning: {
        field,
        message: `Metric "${value}" not found in ${scenario} scenario. Available: ${validMetrics.join(', ')}`,
        code: 'ORPHANED_FIELD',
      },
    };
  }
  return {};
}

/**
 * Validate operation value
 */
function validateOperation(value: unknown, field: string): ValidationError | null {
  if (value === undefined || value === null) return null;
  const validOps = ['sum', 'avg', 'count', 'min', 'max', 'average'];
  if (typeof value !== 'string' || !validOps.includes(value.toLowerCase())) {
    return {
      field,
      message: `Invalid operation: "${value}". Valid operations: sum, avg, count, min, max`,
      code: 'INVALID_VALUE',
    };
  }
  return null;
}

/**
 * Validate color index is within valid range
 */
function validateColorIndex(value: unknown, field: string): ValidationError | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'number') {
    return {
      field,
      message: `Color index must be a number, got ${typeof value}`,
      code: 'TYPE_MISMATCH',
    };
  }
  if (value < 0 || value >= PBI_DATA_VIZ_COLORS_ARRAY.length) {
    return {
      field,
      message: `Color index ${value} out of range. Valid range: 0-${PBI_DATA_VIZ_COLORS_ARRAY.length - 1}`,
      code: 'INVALID_VALUE',
    };
  }
  return null;
}

/**
 * Validate slicer mode
 */
function validateSlicerMode(value: unknown, field: string): ValidationError | null {
  if (value === undefined || value === null) return null;
  const validModes = ['Dropdown', 'List', 'Tile'];
  if (typeof value !== 'string' || !validModes.includes(value)) {
    return {
      field,
      message: `Invalid slicer mode: "${value}". Valid modes: ${validModes.join(', ')}`,
      code: 'INVALID_VALUE',
    };
  }
  return null;
}

/**
 * Validate visual props for a specific visual type
 */
export function validateVisualProps(
  type: VisualType,
  props: AnyPhantomProps | undefined,
  scenario: Scenario
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!props) {
    return { valid: true, errors: [], warnings: [] };
  }

  // Type-specific validation
  const p = props as Record<string, unknown>;

  // Common validations
  if ('dimension' in p) {
    const { error, warning } = validateDimension(p.dimension, 'dimension', scenario);
    if (error) errors.push(error);
    if (warning) warnings.push(warning);
  }

  if ('metric' in p) {
    const { error, warning } = validateMetric(p.metric, 'metric', scenario);
    if (error) errors.push(error);
    if (warning) warnings.push(warning);
  }

  if ('operation' in p) {
    const error = validateOperation(p.operation, 'operation');
    if (error) errors.push(error);
  }

  if ('colorIndex' in p) {
    const error = validateColorIndex(p.colorIndex, 'colorIndex');
    if (error) errors.push(error);
  }

  // Slicer-specific
  if (type === 'slicer' && 'mode' in p) {
    const error = validateSlicerMode(p.mode, 'mode');
    if (error) errors.push(error);
  }

  // Scatter-specific
  if (type === 'scatter' || type === 'regressionScatter') {
    if ('xMetric' in p) {
      const { error, warning } = validateMetric(p.xMetric, 'xMetric', scenario);
      if (error) errors.push(error);
      if (warning) warnings.push(warning);
    }
    if ('yMetric' in p) {
      const { error, warning } = validateMetric(p.yMetric, 'yMetric', scenario);
      if (error) errors.push(error);
      if (warning) warnings.push(warning);
    }
    if ('sizeMetric' in p) {
      const { error, warning } = validateMetric(p.sizeMetric, 'sizeMetric', scenario);
      if (error) errors.push(error);
      if (warning) warnings.push(warning);
    }
  }

  // Combo chart
  if (type === 'combo') {
    if ('barMetric' in p) {
      const { error, warning } = validateMetric(p.barMetric, 'barMetric', scenario);
      if (error) errors.push(error);
      if (warning) warnings.push(warning);
    }
    if ('lineMetric' in p) {
      const { error, warning } = validateMetric(p.lineMetric, 'lineMetric', scenario);
      if (error) errors.push(error);
      if (warning) warnings.push(warning);
    }
  }

  // Matrix
  if (type === 'matrix') {
    if ('rows' in p) {
      const { error, warning } = validateDimension(p.rows, 'rows', scenario);
      if (error) errors.push(error);
      if (warning) warnings.push(warning);
    }
    if ('columns' in p) {
      const { error, warning } = validateDimension(p.columns, 'columns', scenario);
      if (error) errors.push(error);
      if (warning) warnings.push(warning);
    }
    if ('values' in p) {
      const { error, warning } = validateMetric(p.values, 'values', scenario);
      if (error) errors.push(error);
      if (warning) warnings.push(warning);
    }
  }

  // Validate nested styling props
  if ('dataPoint' in p && p.dataPoint && typeof p.dataPoint === 'object') {
    const dp = p.dataPoint as Record<string, unknown>;
    if ('fill' in dp) {
      const error = validateHexColor(dp.fill, 'dataPoint.fill');
      if (error) errors.push(error);
      const warning = checkDataVizColor(dp.fill, 'dataPoint.fill');
      if (warning) warnings.push(warning);
    }
  }

  if ('accentColor' in p) {
    const error = validateHexColor(p.accentColor, 'accentColor');
    if (error) errors.push(error);
    const warning = checkDataVizColor(p.accentColor, 'accentColor');
    if (warning) warnings.push(warning);
  }

  // Validate title props
  if ('title' in p && p.title && typeof p.title === 'object') {
    const t = p.title as Record<string, unknown>;
    if ('fontSize' in t) {
      const error = validateFontSize(t.fontSize, 'title.fontSize');
      if (error) errors.push(error);
    }
    if ('fontColor' in t) {
      const error = validateHexColor(t.fontColor, 'title.fontColor');
      if (error) errors.push(error);
    }
    if ('backgroundColor' in t) {
      const error = validateHexColor(t.backgroundColor, 'title.backgroundColor');
      if (error) errors.push(error);
    }
  }

  // Validate legend props
  if ('legend' in p && p.legend && typeof p.legend === 'object') {
    const l = p.legend as Record<string, unknown>;
    if ('fontSize' in l) {
      const error = validateFontSize(l.fontSize, 'legend.fontSize');
      if (error) errors.push(error);
    }
    if ('fontColor' in l) {
      const error = validateHexColor(l.fontColor, 'legend.fontColor');
      if (error) errors.push(error);
    }
  }

  // Validate axis props
  const axisFields = ['categoryAxis', 'valueAxis'];
  for (const axisField of axisFields) {
    if (axisField in p && p[axisField] && typeof p[axisField] === 'object') {
      const a = p[axisField] as Record<string, unknown>;
      if ('labelFontSize' in a) {
        const error = validateFontSize(a.labelFontSize, `${axisField}.labelFontSize`);
        if (error) errors.push(error);
      }
      if ('labelFontColor' in a) {
        const error = validateHexColor(a.labelFontColor, `${axisField}.labelFontColor`);
        if (error) errors.push(error);
      }
      if ('gridlineColor' in a) {
        const error = validateHexColor(a.gridlineColor, `${axisField}.gridlineColor`);
        if (error) errors.push(error);
      }
    }
  }

  // Validate labels props
  if ('labels' in p && p.labels && typeof p.labels === 'object') {
    const l = p.labels as Record<string, unknown>;
    if ('fontSize' in l) {
      const error = validateFontSize(l.fontSize, 'labels.fontSize');
      if (error) errors.push(error);
    }
    if ('fontColor' in l) {
      const error = validateHexColor(l.fontColor, 'labels.fontColor');
      if (error) errors.push(error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create an empty validation result (all valid)
 */
export function createEmptyValidation(): ValidationResult {
  return { valid: true, errors: [], warnings: [] };
}

/**
 * Merge validation results
 */
export function mergeValidations(...results: ValidationResult[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  for (const result of results) {
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export default validateVisualProps;
