/**
 * Power BI Literal Expression Builders
 *
 * PBI uses a verbose { expr: { Literal: { Value: "..." } } } format for property values.
 * These helpers abstract that complexity and provide type-safe builders.
 */

import { PBIHexColor } from './colors';
import { PBIFontFamily, PBIFontSize, getPBIFontFamilyString } from './fonts';

/**
 * PBI literal expression structure
 */
export interface PBILiteralExpr {
  expr: {
    Literal: {
      Value: string;
    };
  };
}

/**
 * PBI solid color structure
 */
export interface PBISolidColor {
  solid: {
    color: PBILiteralExpr;
  };
}

/**
 * Create a literal expression for any value
 *
 * PBI uses different suffixes for different types:
 * - Strings: wrapped in single quotes: 'value'
 * - Numbers: D suffix for decimals, L suffix for integers
 * - Booleans: lowercase true/false
 */
export function makeLiteral(value: string | number | boolean): PBILiteralExpr {
  let formattedValue: string;

  if (typeof value === 'string') {
    // Strings are wrapped in single quotes
    formattedValue = `'${value}'`;
  } else if (typeof value === 'boolean') {
    // Booleans are lowercase
    formattedValue = value ? 'true' : 'false';
  } else {
    // Numbers are represented as-is (no suffix needed for most cases)
    formattedValue = String(value);
  }

  return {
    expr: {
      Literal: {
        Value: formattedValue,
      },
    },
  };
}

/**
 * Create a decimal literal (with D suffix)
 * Used for font sizes, padding, etc.
 */
export function makeDecimalLiteral(value: number): PBILiteralExpr {
  return {
    expr: {
      Literal: {
        Value: `${value}D`,
      },
    },
  };
}

/**
 * Create an integer literal (with L suffix)
 * Used for stroke widths, some padding values
 */
export function makeIntegerLiteral(value: number): PBILiteralExpr {
  return {
    expr: {
      Literal: {
        Value: `${value}L`,
      },
    },
  };
}

/**
 * Create a solid color expression from a hex color
 */
export function makeSolidColor(hex: PBIHexColor): PBISolidColor {
  return {
    solid: {
      color: makeLiteral(hex),
    },
  };
}

/**
 * Create a font size literal (with D suffix)
 */
export function makeFontSize(size: PBIFontSize): PBILiteralExpr {
  return makeDecimalLiteral(size);
}

/**
 * Create a font family literal with proper escaping
 * PBI requires triple quotes for font family strings with special characters
 */
export function makeFontFamily(font: PBIFontFamily): PBILiteralExpr {
  const fontString = getPBIFontFamilyString(font);
  // Triple-quote the font family string as PBI expects
  return {
    expr: {
      Literal: {
        Value: `''${fontString}''`,
      },
    },
  };
}

/**
 * Create a null literal
 */
export function makeNullLiteral(): PBILiteralExpr {
  return {
    expr: {
      Literal: {
        Value: 'null',
      },
    },
  };
}

/**
 * Create a transparency value (0-100, with D suffix)
 */
export function makeTransparency(percent: number): PBILiteralExpr {
  const clamped = Math.max(0, Math.min(100, percent));
  return makeDecimalLiteral(clamped);
}

/**
 * Create padding/margin values
 */
export function makePadding(value: number): PBILiteralExpr {
  return makeDecimalLiteral(value);
}

/**
 * Create border width value
 */
export function makeBorderWidth(value: number): PBILiteralExpr {
  return makeDecimalLiteral(value);
}

/**
 * Create border radius value
 */
export function makeBorderRadius(value: number): PBILiteralExpr {
  return makeDecimalLiteral(value);
}

/**
 * Helper to build a properties object with typed values
 * Filters out undefined values automatically
 */
export function buildProperties(
  props: Record<string, PBILiteralExpr | PBISolidColor | undefined>
): Record<string, PBILiteralExpr | PBISolidColor> {
  const result: Record<string, PBILiteralExpr | PBISolidColor> = {};

  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }

  return result;
}
