/**
 * PBI CSS Tokens for Visual Verification
 *
 * CSS token values from the Power BI UI Kit 2.0 CSS specification
 * used to verify visual styling in E2E tests.
 */

export const PBI_CSS_TOKENS = {
  colors: {
    // Default PBI theme categorical colors
    category1: '#118dff',
    category2: '#12239e',
    category3: '#e66c37',
    category4: '#6b007b',
    category5: '#e044a7',
    category6: '#744ec2',
    category7: '#d9b300',
    category8: '#d64550',
    category9: '#197278',
    category10: '#6f9fb0',

    // Text colors
    textPrimary: '#020617',
    textSecondary: '#605e5c',
    textTertiary: '#a19f9d',
    textQuaternary: '#64748b',

    // Background colors
    backgroundPrimary: '#ffffff',
    backgroundSecondary: '#f3f2f1',
    backgroundTertiary: '#edebe9',

    // Border colors
    borderDefault: '#e1dfdd',
    borderHover: '#0078d4',

    // Status colors
    success: '#107c10',
    warning: '#ffaa44',
    error: '#d13438',

    // Mokkup brand colors (used in Retail template)
    mokkupPrimary: '#342bc2',
    mokkupSecondary: '#6f67f1',
    mokkupTertiary: '#9993ff',
  },

  typography: {
    fontFamily: {
      primary: 'Segoe UI',
      secondary: 'Inter',
      monospace: 'Consolas',
    },

    chartTitle: {
      fontSize: '16px',
      fontWeight: 600,
      lineHeight: '22px',
    },

    axisLabel: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
    },

    axisValue: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
    },

    dataLabel: {
      fontSize: '11px',
      fontWeight: 400,
      lineHeight: '14px',
    },

    kpiValue: {
      fontSize: '32px',
      fontWeight: 600,
      lineHeight: '40px',
    },

    kpiLabel: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
    },

    cardValue: {
      fontSize: '28px',
      fontWeight: 700,
      lineHeight: '36px',
    },

    legendItem: {
      fontSize: '11px',
      fontWeight: 400,
      lineHeight: '14px',
    },

    tooltipTitle: {
      fontSize: '12px',
      fontWeight: 600,
      lineHeight: '16px',
    },

    tooltipValue: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: '16px',
    },
  },

  spacing: {
    visualPadding: '8px',
    chartPadding: '12px',
    legendGap: '8px',
    axisGap: '4px',
  },

  borders: {
    visualBorder: '1px solid #e1dfdd',
    visualBorderRadius: '4px',
    chartBorderRadius: '0',
  },

  shadows: {
    visualShadow: '0 1px 2px rgba(0, 0, 0, 0.06)',
    visualShadowHover: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
};

/**
 * Mokkup series colors (used in template exports)
 */
export const MOKKUP_SERIES_COLORS = [
  '#118DFF',
  '#12239E',
  '#E66C37',
  '#6B007B',
  '#E044A7',
  '#744EC2',
  '#D9B300',
  '#D64550',
  '#197278',
  '#6F9FB0',
];

/**
 * Type definitions for CSS verification results
 */
export interface CSSVerificationResult {
  passed: boolean;
  failures: CSSFailure[];
}

export interface CSSFailure {
  property: string;
  expected: string;
  actual: string;
  element: string;
}

/**
 * Get expected font family for Inter-based components
 */
export function getExpectedFontFamily(): string {
  return PBI_CSS_TOKENS.typography.fontFamily.secondary;
}

/**
 * Get expected chart title styles
 */
export function getChartTitleStyles() {
  return {
    fontSize: PBI_CSS_TOKENS.typography.chartTitle.fontSize,
    fontWeight: String(PBI_CSS_TOKENS.typography.chartTitle.fontWeight),
    fontFamily: PBI_CSS_TOKENS.typography.fontFamily.secondary,
  };
}

/**
 * Get expected KPI value styles
 */
export function getKPIValueStyles() {
  return {
    fontSize: PBI_CSS_TOKENS.typography.kpiValue.fontSize,
    fontWeight: String(PBI_CSS_TOKENS.typography.kpiValue.fontWeight),
    fontFamily: PBI_CSS_TOKENS.typography.fontFamily.secondary,
  };
}

/**
 * Get expected axis label styles
 */
export function getAxisLabelStyles() {
  return {
    fontSize: PBI_CSS_TOKENS.typography.axisLabel.fontSize,
    fontWeight: String(PBI_CSS_TOKENS.typography.axisLabel.fontWeight),
  };
}
