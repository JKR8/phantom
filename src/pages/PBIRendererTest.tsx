/**
 * PBI Renderer Test Harness
 *
 * Test page for validating Power BI renderer accuracy.
 * Renders test cases at specific dimensions for pixel comparison.
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PBIBarChart } from '../components/PBIBarChart';
import { downloadTestCasesPBIP } from '../pbi-renderer/test-export/exportTestCases';

// Test case configuration type
interface TestCaseConfig {
  showDataLabels?: boolean;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right';
  showGridLines?: boolean;
  title?: string;
  subTitle?: string;
  dataLabelPosition?: 'outsideEnd' | 'insideEnd' | 'insideBase' | 'insideCenter';
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  showShadow?: boolean;
  categoryAxisTitle?: string;
  valueAxisTitle?: string;
  showAxisTitles?: boolean;
  showTickMarks?: boolean;
  barStrokeWidth?: number;
  barStrokeColor?: string;
}

interface TestCase {
  name: string;
  description: string;
  data: Array<{ category: string; value: number; series?: string }>;
  config: TestCaseConfig;
}

// Test case data definitions
const TEST_CASES: Record<string, TestCase> = {
  // T01: Default (5 categories)
  T01: {
    name: 'Default Bar Chart',
    description: 'Basic bars, axes, grid with 5 categories',
    data: [
      { category: 'Category A', value: 120 },
      { category: 'Category B', value: 250 },
      { category: 'Category C', value: 180 },
      { category: 'Category D', value: 320 },
      { category: 'Category E', value: 210 }
    ],
    config: {
      showDataLabels: false,
      showGridLines: true
    }
  },

  // T02: Multi-series with legend
  T02: {
    name: 'Multi-series with Legend',
    description: 'Multiple series with legend positioning',
    data: [
      { category: 'Q1', value: 100, series: 'Series A' },
      { category: 'Q1', value: 80, series: 'Series B' },
      { category: 'Q2', value: 150, series: 'Series A' },
      { category: 'Q2', value: 120, series: 'Series B' },
      { category: 'Q3', value: 180, series: 'Series A' },
      { category: 'Q3', value: 160, series: 'Series B' },
      { category: 'Q4', value: 200, series: 'Series A' },
      { category: 'Q4', value: 190, series: 'Series B' }
    ],
    config: {
      showLegend: true,
      legendPosition: 'right',
      showGridLines: true
    }
  },

  // T03: Data labels enabled
  T03: {
    name: 'Data Labels Enabled',
    description: 'Testing label placement algorithm',
    data: [
      { category: 'Product A', value: 450 },
      { category: 'Product B', value: 380 },
      { category: 'Product C', value: 290 },
      { category: 'Product D', value: 520 },
      { category: 'Product E', value: 410 }
    ],
    config: {
      showDataLabels: true,
      showGridLines: true
    }
  },

  // T04: Long category names
  T04: {
    name: 'Long Category Names',
    description: 'Testing text truncation with ellipsis',
    data: [
      { category: 'Very Long Category Name That Should Truncate', value: 150 },
      { category: 'Another Extremely Long Category Label', value: 220 },
      { category: 'Short', value: 180 },
      { category: 'This Is Also A Very Long Name For Testing', value: 310 },
      { category: 'Medium Length Name', value: 260 }
    ],
    config: {
      showDataLabels: false,
      showGridLines: true
    }
  },

  // T05: Large values (100K+)
  T05: {
    name: 'Large Values (K/M/B Formatting)',
    description: 'Testing K/M/B number formatting',
    data: [
      { category: 'Region A', value: 125000 },
      { category: 'Region B', value: 2500000 },
      { category: 'Region C', value: 890000 },
      { category: 'Region D', value: 1750000 },
      { category: 'Region E', value: 3200000 }
    ],
    config: {
      showDataLabels: true,
      showGridLines: true
    }
  },

  // T06: Visual with title and subtitle
  T06: {
    name: 'Visual with Title',
    description: 'Testing title and subtitle rendering',
    data: [
      { category: 'Sales', value: 450 },
      { category: 'Marketing', value: 380 },
      { category: 'Operations', value: 290 },
      { category: 'Engineering', value: 520 },
      { category: 'Support', value: 410 }
    ],
    config: {
      showDataLabels: false,
      showGridLines: true,
      title: 'Sales by Region',
      subTitle: 'Q4 2024 Performance'
    }
  },

  // T07: Data labels insideEnd
  T07: {
    name: 'Data Labels - Inside End',
    description: 'Testing insideEnd label position',
    data: [
      { category: 'Product A', value: 450 },
      { category: 'Product B', value: 380 },
      { category: 'Product C', value: 290 },
      { category: 'Product D', value: 520 },
      { category: 'Product E', value: 410 }
    ],
    config: {
      showDataLabels: true,
      dataLabelPosition: 'insideEnd',
      showGridLines: true
    }
  },

  // T08: Data labels insideBase
  T08: {
    name: 'Data Labels - Inside Base',
    description: 'Testing insideBase label position',
    data: [
      { category: 'Product A', value: 450 },
      { category: 'Product B', value: 380 },
      { category: 'Product C', value: 290 },
      { category: 'Product D', value: 520 },
      { category: 'Product E', value: 410 }
    ],
    config: {
      showDataLabels: true,
      dataLabelPosition: 'insideBase',
      showGridLines: true
    }
  },

  // T09: Data labels insideCenter
  T09: {
    name: 'Data Labels - Inside Center',
    description: 'Testing insideCenter label position',
    data: [
      { category: 'Product A', value: 450 },
      { category: 'Product B', value: 380 },
      { category: 'Product C', value: 290 },
      { category: 'Product D', value: 520 },
      { category: 'Product E', value: 410 }
    ],
    config: {
      showDataLabels: true,
      dataLabelPosition: 'insideCenter',
      showGridLines: true
    }
  },

  // T10: Data labels auto-position (same as outsideEnd for now)
  T10: {
    name: 'Data Labels - Outside End',
    description: 'Testing default outsideEnd label position',
    data: [
      { category: 'Product A', value: 450 },
      { category: 'Product B', value: 380 },
      { category: 'Product C', value: 290 },
      { category: 'Product D', value: 520 },
      { category: 'Product E', value: 410 }
    ],
    config: {
      showDataLabels: true,
      dataLabelPosition: 'outsideEnd',
      showGridLines: true
    }
  },

  // T11: Container with border and shadow
  T11: {
    name: 'Container with Border/Shadow',
    description: 'Testing border and drop shadow',
    data: [
      { category: 'Category A', value: 120 },
      { category: 'Category B', value: 250 },
      { category: 'Category C', value: 180 },
      { category: 'Category D', value: 320 },
      { category: 'Category E', value: 210 }
    ],
    config: {
      showDataLabels: false,
      showGridLines: true,
      showBorder: true,
      borderColor: '#342BC2',
      borderWidth: 2,
      borderRadius: 8,
      showShadow: true
    }
  },

  // T12: Axis titles
  T12: {
    name: 'Axis Titles',
    description: 'Testing category and value axis titles',
    data: [
      { category: 'Q1', value: 1200 },
      { category: 'Q2', value: 1800 },
      { category: 'Q3', value: 1500 },
      { category: 'Q4', value: 2100 }
    ],
    config: {
      showDataLabels: false,
      showGridLines: true,
      showAxisTitles: true,
      categoryAxisTitle: 'Quarter',
      valueAxisTitle: 'Revenue ($K)'
    }
  },

  // T13: Tick marks enabled
  T13: {
    name: 'Tick Marks Enabled',
    description: 'Testing tick mark rendering',
    data: [
      { category: 'Category A', value: 120 },
      { category: 'Category B', value: 250 },
      { category: 'Category C', value: 180 },
      { category: 'Category D', value: 320 },
      { category: 'Category E', value: 210 }
    ],
    config: {
      showDataLabels: false,
      showGridLines: true,
      showTickMarks: true
    }
  },

  // T14: Bars with stroke
  T14: {
    name: 'Bars with Stroke',
    description: 'Testing bar border/stroke',
    data: [
      { category: 'Category A', value: 120 },
      { category: 'Category B', value: 250 },
      { category: 'Category C', value: 180 },
      { category: 'Category D', value: 320 },
      { category: 'Category E', value: 210 }
    ],
    config: {
      showDataLabels: false,
      showGridLines: true,
      barStrokeWidth: 2,
      barStrokeColor: '#1A1464'
    }
  },

  // T15: Negative values
  T15: {
    name: 'Negative Values',
    description: 'Testing bidirectional bars with negative values',
    data: [
      { category: 'Product A', value: 150 },
      { category: 'Product B', value: -80 },
      { category: 'Product C', value: 220 },
      { category: 'Product D', value: -120 },
      { category: 'Product E', value: 50 }
    ],
    config: {
      showDataLabels: true,
      showGridLines: true
    }
  }
};

type TestCaseId = string;

// Reference dimensions (matching Power BI capture)
const REFERENCE_WIDTH = 400;
const REFERENCE_HEIGHT = 300;

export const PBIRendererTest: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [exporting, setExporting] = useState(false);
  const caseId = (searchParams.get('case') || 'T01') as TestCaseId;
  const testCase = TEST_CASES[caseId] || TEST_CASES.T01;

  const handleExportAllTestCases = async () => {
    setExporting(true);
    try {
      await downloadTestCasesPBIP();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setExporting(false);
    }
  };

  // Parse optional size parameters
  const width = parseInt(searchParams.get('width') || String(REFERENCE_WIDTH), 10);
  const height = parseInt(searchParams.get('height') || String(REFERENCE_HEIGHT), 10);

  // Check if running in comparison mode (minimal UI)
  const comparisonMode = searchParams.get('mode') === 'comparison';

  if (comparisonMode) {
    // Minimal render for pixel comparison
    return (
      <div
        style={{
          width,
          height,
          margin: 0,
          padding: 0,
          overflow: 'hidden'
        }}
      >
        <PBIBarChart
          data={testCase.data}
          width={width}
          height={height}
          showDataLabels={testCase.config.showDataLabels}
          showLegend={testCase.config.showLegend}
          legendPosition={testCase.config.legendPosition}
          showGridLines={testCase.config.showGridLines}
          title={testCase.config.title}
          subTitle={testCase.config.subTitle}
          dataLabelPosition={testCase.config.dataLabelPosition}
          showBorder={testCase.config.showBorder}
          borderColor={testCase.config.borderColor}
          borderWidth={testCase.config.borderWidth}
          borderRadius={testCase.config.borderRadius}
          showShadow={testCase.config.showShadow}
          categoryAxisTitle={testCase.config.categoryAxisTitle}
          valueAxisTitle={testCase.config.valueAxisTitle}
          showAxisTitles={testCase.config.showAxisTitles}
          showTickMarks={testCase.config.showTickMarks}
          barStrokeWidth={testCase.config.barStrokeWidth}
          barStrokeColor={testCase.config.barStrokeColor}
        />
      </div>
    );
  }

  // Full UI for manual testing
  return (
    <div style={{ padding: 20, fontFamily: 'Segoe UI, sans-serif' }}>
      <h1>PBI Renderer Test Harness</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div>
          <label htmlFor="testCase">Test Case: </label>
          <select
            id="testCase"
            value={caseId}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              params.set('case', e.target.value);
              window.location.search = params.toString();
            }}
            style={{ padding: '4px 8px', fontSize: 14 }}
          >
            {Object.entries(TEST_CASES).map(([id, tc]) => (
              <option key={id} value={id}>
                {id}: {tc.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleExportAllTestCases}
          disabled={exporting}
          style={{
            padding: '6px 12px',
            fontSize: 14,
            backgroundColor: '#342BC2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting ? 0.6 : 1,
          }}
        >
          {exporting ? 'Exporting...' : 'Export All Test Cases to PBIP'}
        </button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong>{testCase.name}</strong>
        <div style={{ color: '#666', fontSize: 14 }}>{testCase.description}</div>
      </div>

      <div
        style={{
          width,
          height,
          border: '1px solid #ccc',
          marginBottom: 20,
          background: '#fff'
        }}
        className="pbi-visual-container"
      >
        <PBIBarChart
          data={testCase.data}
          width={width}
          height={height}
          showDataLabels={testCase.config.showDataLabels}
          showLegend={testCase.config.showLegend}
          legendPosition={testCase.config.legendPosition}
          showGridLines={testCase.config.showGridLines}
          title={testCase.config.title}
          subTitle={testCase.config.subTitle}
          dataLabelPosition={testCase.config.dataLabelPosition}
          showBorder={testCase.config.showBorder}
          borderColor={testCase.config.borderColor}
          borderWidth={testCase.config.borderWidth}
          borderRadius={testCase.config.borderRadius}
          showShadow={testCase.config.showShadow}
          categoryAxisTitle={testCase.config.categoryAxisTitle}
          valueAxisTitle={testCase.config.valueAxisTitle}
          showAxisTitles={testCase.config.showAxisTitles}
          showTickMarks={testCase.config.showTickMarks}
          barStrokeWidth={testCase.config.barStrokeWidth}
          barStrokeColor={testCase.config.barStrokeColor}
        />
      </div>

      <div style={{ marginTop: 20, padding: 10, background: '#f5f5f5', borderRadius: 4 }}>
        <strong>Test Data:</strong>
        <pre style={{ fontSize: 12, overflow: 'auto', maxHeight: 200 }}>
          {JSON.stringify(testCase.data, null, 2)}
        </pre>
      </div>

      <div style={{ marginTop: 20, color: '#666', fontSize: 12 }}>
        <p>
          <strong>Comparison Mode:</strong> Add <code>?mode=comparison</code> to URL for minimal UI
        </p>
        <p>
          <strong>Custom Size:</strong> Add <code>?width=800&height=600</code> to URL
        </p>
        <p>
          <strong>Reference Dimensions:</strong> {REFERENCE_WIDTH}×{REFERENCE_HEIGHT}px
        </p>
      </div>
    </div>
  );
};

export default PBIRendererTest;
