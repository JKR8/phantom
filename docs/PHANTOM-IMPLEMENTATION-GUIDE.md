# Phantom Power BI Mockup Tool - Implementation Guide

## Overview

Build a web-based Power BI mockup tool where users can design dashboards that export to PBIP with **100% fidelity**. The key constraint: the web UI can ONLY use values that Power BI supports, so there's no translation loss on export.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         PHANTOM WEB UI                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐    ┌─────────────────┐                   │
│   │  Component      │    │  PBIP Store     │                   │
│   │  Library        │───▶│  (JSON State)   │                   │
│   │  (Constrained)  │    │                 │                   │
│   └─────────────────┘    └────────┬────────┘                   │
│           │                       │                             │
│           ▼                       ▼                             │
│   ┌─────────────────┐    ┌─────────────────┐                   │
│   │  Canvas         │    │  Export         │                   │
│   │  (Drag & Drop)  │    │  (Write Files)  │                   │
│   └─────────────────┘    └─────────────────┘                   │
│                                   │                             │
│                                   ▼                             │
│                          ┌─────────────────┐                   │
│                          │  .pbip files    │                   │
│                          └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

## Source of Truth

The CSS specification extracted from Nudge BI's Power BI UI Kit 2.0 defines ALL allowed values. Reference document: `power-bi-chart-css.md`

---

## Part 1: Design Tokens

Create a tokens file that defines the ONLY values allowed in the system. These map directly to Power BI's supported values.

### File: `src/tokens/pbi-tokens.ts`

```typescript
/**
 * Power BI Design Tokens
 * Source: Nudge BI Power BI UI Kit 2.0
 * 
 * IMPORTANT: These are the ONLY values allowed in components.
 * Adding values not in this file will break PBIP export fidelity.
 */

export const PBI_TOKENS = {
  // ============================================
  // COLORS - Data Visualization
  // ============================================
  colors: {
    dataViz: {
      category1: '#118dff',  // Blue (default)
      category2: '#12239e',  // Dark Blue
      category3: '#e66c37',  // Orange
      category4: '#6b007b',  // Purple
      category5: '#e044a7',  // Pink
      category6: '#744ec2',  // Violet
    },
    text: {
      primary: '#020617',    // Titles, important text
      tertiary: '#475569',   // Legend titles
      quaternary: '#64748b', // Axis values, secondary text
    },
    brand: {
      50: '#eff6ff',         // Light (gradient start)
      500: '#3b82f6',        // Primary (gradient end)
    },
    neutral: {
      white: '#ffffff',
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    
    // Named styles (use these, not raw values)
    styles: {
      chartTitle: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 19,
      },
      legendTitle: {
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 16,
      },
      legendValue: {
        fontSize: 13,
        fontWeight: 400,
        lineHeight: 16,
      },
      axisTitle: {
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 14,
      },
      axisValue: {
        fontSize: 12,
        fontWeight: 400,
        lineHeight: 14,
      },
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    4: 4,
    12: 12,
    16: 16,
  },

  // ============================================
  // DIMENSIONS
  // ============================================
  dimensions: {
    chart: {
      defaultWidth: 500,
      defaultHeight: 300,
      minWidth: 200,
      minHeight: 150,
    },
    legend: {
      dotSize: 12,
      itemHeight: 20,
      gradientHeight: 24,
    },
    axis: {
      yAxisWidth: 36,
      xAxisHeight: 31,
    },
  },
} as const;

// Type exports for strict typing
export type DataVizColor = keyof typeof PBI_TOKENS.colors.dataViz;
export type TextColor = keyof typeof PBI_TOKENS.colors.text;
export type TypographyStyle = keyof typeof PBI_TOKENS.typography.styles;
export type Spacing = keyof typeof PBI_TOKENS.spacing;
```

---

## Part 2: PBIP Mapping

Create a mapping layer that converts component props to PBIP JSON structure.

### File: `src/export/pbip-mapping.ts`

```typescript
import { PBI_TOKENS } from '../tokens/pbi-tokens';

/**
 * Maps Phantom component props to PBIP visual objects
 */

// Color token to PBIP color object
export function toPBIPColor(hex: string) {
  return {
    solid: { color: hex }
  };
}

// Typography to PBIP text properties
export function toPBIPTextStyle(style: keyof typeof PBI_TOKENS.typography.styles) {
  const s = PBI_TOKENS.typography.styles[style];
  return {
    fontSize: s.fontSize,
    fontFamily: 'Segoe UI',  // PBI uses Segoe UI, not Inter
    bold: s.fontWeight >= 600,
  };
}

// Bar Chart props to PBIP
export function barChartToPBIP(props: BarChartProps): PBIPVisual {
  return {
    name: props.id || generateVisualId(),
    position: {
      x: props.x,
      y: props.y,
      z: props.z || 0,
      width: props.width,
      height: props.height,
      tabOrder: props.tabOrder || 0,
    },
    visual: {
      visualType: props.orientation === 'horizontal' ? 'barChart' : 'columnChart',
      objects: {
        general: {
          responsive: true,
        },
        title: {
          show: props.showTitle ?? true,
          text: props.title,
          ...toPBIPTextStyle('chartTitle'),
          fontColor: toPBIPColor(PBI_TOKENS.colors.text.primary),
        },
        legend: {
          show: props.showLegend ?? false,
          position: props.legendPosition || 'Top',
          ...toPBIPTextStyle('legendValue'),
          labelColor: toPBIPColor(PBI_TOKENS.colors.text.tertiary),
        },
        categoryAxis: {
          show: props.showCategoryAxis ?? true,
          ...toPBIPTextStyle('axisValue'),
          labelColor: toPBIPColor(PBI_TOKENS.colors.text.quaternary),
        },
        valueAxis: {
          show: props.showValueAxis ?? true,
          ...toPBIPTextStyle('axisValue'),
          labelColor: toPBIPColor(PBI_TOKENS.colors.text.quaternary),
        },
        dataColors: {
          fill: toPBIPColor(props.barColor || PBI_TOKENS.colors.dataViz.category1),
        },
      },
    },
  };
}

// Area Chart props to PBIP
export function areaChartToPBIP(props: AreaChartProps): PBIPVisual {
  return {
    name: props.id || generateVisualId(),
    position: {
      x: props.x,
      y: props.y,
      z: props.z || 0,
      width: props.width,
      height: props.height,
      tabOrder: props.tabOrder || 0,
    },
    visual: {
      visualType: 'areaChart',
      objects: {
        title: {
          show: props.showTitle ?? true,
          text: props.title,
          ...toPBIPTextStyle('chartTitle'),
          fontColor: toPBIPColor(PBI_TOKENS.colors.text.primary),
        },
        legend: {
          show: props.showLegend ?? true,
          position: props.legendPosition || 'Top',
        },
        categoryAxis: {
          show: true,
          ...toPBIPTextStyle('axisValue'),
        },
        valueAxis: {
          show: true,
          ...toPBIPTextStyle('axisValue'),
        },
        dataColors: {
          fill: toPBIPColor(props.fillColor || PBI_TOKENS.colors.dataViz.category1),
        },
      },
    },
  };
}

// Add mappings for: lineChart, pieChart, donutChart, card, table, etc.
```

---

## Part 3: Component Library

Build React components that ONLY accept constrained props.

### File: `src/components/charts/PBIBarChart.tsx`

```typescript
import React from 'react';
import { PBI_TOKENS, DataVizColor } from '../../tokens/pbi-tokens';

/**
 * PBI Bar Chart Component
 * 
 * Props are strictly typed to only allow PBI-valid values.
 * This component renders a preview that approximates PBI's rendering.
 * Export fidelity is guaranteed because props map directly to PBIP.
 */

interface PBIBarChartProps {
  // Required
  data: Array<{ label: string; value: number }>;
  
  // Position (integers only, will be validated)
  x: number;
  y: number;
  width?: number;
  height?: number;
  
  // Content
  title?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  
  // Orientation
  orientation?: 'horizontal' | 'vertical';
  
  // Visibility toggles
  showTitle?: boolean;
  showLegend?: boolean;
  showCategoryAxis?: boolean;
  showValueAxis?: boolean;
  showDataLabels?: boolean;
  
  // Styling (constrained to PBI values)
  barColor?: DataVizColor;
  legendPosition?: 'Top' | 'Bottom' | 'Left' | 'Right';
  
  // Callbacks
  onSelect?: () => void;
  onPositionChange?: (x: number, y: number) => void;
}

export function PBIBarChart({
  data,
  x,
  y,
  width = PBI_TOKENS.dimensions.chart.defaultWidth,
  height = PBI_TOKENS.dimensions.chart.defaultHeight,
  title = '',
  xAxisTitle = '',
  yAxisTitle = '',
  orientation = 'horizontal',
  showTitle = true,
  showLegend = false,
  showCategoryAxis = true,
  showValueAxis = true,
  barColor = 'category1',
  onSelect,
}: PBIBarChartProps) {
  
  const tokens = PBI_TOKENS;
  const color = tokens.colors.dataViz[barColor];
  const maxValue = Math.max(...data.map(d => d.value));
  
  const styles = {
    container: {
      position: 'absolute' as const,
      left: x,
      top: y,
      width,
      height,
      display: 'flex',
      flexDirection: 'column' as const,
      padding: tokens.spacing[16],
      gap: tokens.spacing[12],
      fontFamily: tokens.typography.fontFamily,
      backgroundColor: tokens.colors.neutral.white,
      cursor: 'pointer',
    },
    title: {
      fontSize: tokens.typography.styles.chartTitle.fontSize,
      fontWeight: tokens.typography.styles.chartTitle.fontWeight,
      lineHeight: `${tokens.typography.styles.chartTitle.lineHeight}px`,
      color: tokens.colors.text.primary,
      margin: 0,
    },
    content: {
      display: 'flex',
      flexDirection: (orientation === 'horizontal' ? 'column' : 'row') as const,
      flex: 1,
    },
    barRow: {
      display: 'flex',
      flexDirection: 'row' as const,
      alignItems: 'center',
      gap: tokens.spacing[4],
      flex: 1,
    },
    label: {
      width: 72,
      fontSize: tokens.typography.styles.axisValue.fontSize,
      fontWeight: tokens.typography.styles.axisValue.fontWeight,
      lineHeight: `${tokens.typography.styles.axisValue.lineHeight}px`,
      color: tokens.colors.text.quaternary,
    },
    barContainer: {
      flex: 1,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
    },
    bar: {
      height: '76%',
      backgroundColor: color,
    },
    axisValue: {
      fontSize: tokens.typography.styles.axisValue.fontSize,
      fontWeight: tokens.typography.styles.axisValue.fontWeight,
      color: tokens.colors.text.quaternary,
    },
    axisTitle: {
      fontSize: tokens.typography.styles.axisTitle.fontSize,
      fontWeight: tokens.typography.styles.axisTitle.fontWeight,
      color: tokens.colors.text.primary,
      textAlign: 'center' as const,
    },
  };

  if (orientation === 'horizontal') {
    return (
      <div style={styles.container} onClick={onSelect}>
        {showTitle && title && <h3 style={styles.title}>{title}</h3>}
        
        <div style={styles.content}>
          {data.map((item, i) => (
            <div key={i} style={styles.barRow}>
              {showCategoryAxis && <span style={styles.label}>{item.label}</span>}
              <div style={styles.barContainer}>
                <div style={{ ...styles.bar, width: `${(item.value / maxValue) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        
        {showValueAxis && (
          <div style={{ paddingLeft: 76, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                <span key={i} style={styles.axisValue}>
                  {formatValue(maxValue * pct)}
                </span>
              ))}
            </div>
            {xAxisTitle && <span style={styles.axisTitle}>{xAxisTitle}</span>}
          </div>
        )}
      </div>
    );
  }
  
  // Vertical orientation (column chart)
  return (
    <div style={styles.container} onClick={onSelect}>
      {showTitle && title && <h3 style={styles.title}>{title}</h3>}
      
      <div style={{ display: 'flex', flex: 1 }}>
        {showValueAxis && (
          <div style={{ display: 'flex', gap: 3, paddingBottom: 22 }}>
            {yAxisTitle && (
              <span style={{ 
                ...styles.axisTitle, 
                writingMode: 'vertical-rl', 
                transform: 'rotate(180deg)' 
              }}>
                {yAxisTitle}
              </span>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {[1, 0.75, 0.5, 0.25, 0].map((pct, i) => (
                <span key={i} style={styles.axisValue}>
                  {formatValue(maxValue * pct)}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', flex: 1, alignItems: 'flex-end' }}>
          {data.map((item, i) => (
            <div key={i} style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              height: '100%',
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                <div style={{ 
                  width: '77%', 
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                }} />
              </div>
              {showCategoryAxis && (
                <span style={{ 
                  ...styles.axisValue, 
                  textAlign: 'center', 
                  marginTop: 4,
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatValue(val: number): string {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${Math.round(val / 1000)}k`;
  return val.toString();
}
```

### Additional Components to Build

Create similar components for:

```
src/components/charts/
├── PBIBarChart.tsx       ✅ (above)
├── PBIAreaChart.tsx
├── PBILineChart.tsx
├── PBIPieChart.tsx
├── PBIDonutChart.tsx
├── PBICard.tsx
├── PBITable.tsx
├── PBIMatrix.tsx
└── PBIGauge.tsx

src/components/shared/
├── PBILegend.tsx
├── PBIXAxis.tsx
├── PBIYAxis.tsx
└── PBIChartHeading.tsx

src/components/slicers/
├── PBIDropdownSlicer.tsx
├── PBIButtonSlicer.tsx
└── PBIDateSlicer.tsx
```

---

## Part 4: PBIP Store

Create a state management layer that stores the mockup in PBIP-native format.

### File: `src/store/pbip-store.ts`

```typescript
import { create } from 'zustand';

interface PBIPPage {
  name: string;
  displayName: string;
  displayOption: number;
  width: number;
  height: number;
  visuals: PBIPVisual[];
}

interface PBIPVisual {
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    tabOrder: number;
  };
  visual: {
    visualType: string;
    objects: Record<string, any>;
  };
}

interface PBIPReport {
  pages: PBIPPage[];
  config: {
    version: string;
    themeCollection: any;
  };
}

interface PBIPStore {
  report: PBIPReport;
  currentPageIndex: number;
  selectedVisualId: string | null;
  
  // Actions
  addVisual: (visual: PBIPVisual) => void;
  updateVisual: (id: string, updates: Partial<PBIPVisual>) => void;
  removeVisual: (id: string) => void;
  moveVisual: (id: string, x: number, y: number) => void;
  resizeVisual: (id: string, width: number, height: number) => void;
  selectVisual: (id: string | null) => void;
  
  // Page actions
  addPage: () => void;
  removePage: (index: number) => void;
  setCurrentPage: (index: number) => void;
  
  // Export
  exportToPBIP: () => PBIPReport;
}

export const usePBIPStore = create<PBIPStore>((set, get) => ({
  report: {
    pages: [{
      name: 'ReportSection1',
      displayName: 'Page 1',
      displayOption: 1,
      width: 1280,
      height: 720,
      visuals: [],
    }],
    config: {
      version: '5.50',
      themeCollection: {},
    },
  },
  currentPageIndex: 0,
  selectedVisualId: null,
  
  addVisual: (visual) => set((state) => {
    const pages = [...state.report.pages];
    pages[state.currentPageIndex].visuals.push(visual);
    return { report: { ...state.report, pages } };
  }),
  
  updateVisual: (id, updates) => set((state) => {
    const pages = [...state.report.pages];
    const page = pages[state.currentPageIndex];
    const visualIndex = page.visuals.findIndex(v => v.name === id);
    if (visualIndex !== -1) {
      page.visuals[visualIndex] = {
        ...page.visuals[visualIndex],
        ...updates,
      };
    }
    return { report: { ...state.report, pages } };
  }),
  
  removeVisual: (id) => set((state) => {
    const pages = [...state.report.pages];
    const page = pages[state.currentPageIndex];
    page.visuals = page.visuals.filter(v => v.name !== id);
    return { report: { ...state.report, pages } };
  }),
  
  moveVisual: (id, x, y) => set((state) => {
    const pages = [...state.report.pages];
    const page = pages[state.currentPageIndex];
    const visual = page.visuals.find(v => v.name === id);
    if (visual) {
      visual.position.x = Math.round(x);
      visual.position.y = Math.round(y);
    }
    return { report: { ...state.report, pages } };
  }),
  
  resizeVisual: (id, width, height) => set((state) => {
    const pages = [...state.report.pages];
    const page = pages[state.currentPageIndex];
    const visual = page.visuals.find(v => v.name === id);
    if (visual) {
      visual.position.width = Math.round(width);
      visual.position.height = Math.round(height);
    }
    return { report: { ...state.report, pages } };
  }),
  
  selectVisual: (id) => set({ selectedVisualId: id }),
  
  addPage: () => set((state) => {
    const pages = [...state.report.pages];
    const newIndex = pages.length + 1;
    pages.push({
      name: `ReportSection${newIndex}`,
      displayName: `Page ${newIndex}`,
      displayOption: 1,
      width: 1280,
      height: 720,
      visuals: [],
    });
    return { report: { ...state.report, pages } };
  }),
  
  removePage: (index) => set((state) => {
    if (state.report.pages.length <= 1) return state;
    const pages = state.report.pages.filter((_, i) => i !== index);
    return { 
      report: { ...state.report, pages },
      currentPageIndex: Math.min(state.currentPageIndex, pages.length - 1),
    };
  }),
  
  setCurrentPage: (index) => set({ currentPageIndex: index }),
  
  exportToPBIP: () => get().report,
}));
```

---

## Part 5: Export Module

Write the PBIP files to disk (or generate for download).

### File: `src/export/pbip-writer.ts`

```typescript
import { PBIPReport } from '../store/pbip-store';
import JSZip from 'jszip';

/**
 * Generates PBIP folder structure as a downloadable zip
 */
export async function exportToPBIPZip(report: PBIPReport, reportName: string): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(`${reportName}.Report`);
  
  if (!folder) throw new Error('Failed to create folder');
  
  // 1. Write .platform file
  folder.file('.platform', JSON.stringify({
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json',
    metadata: {
      type: 'report',
      displayName: reportName,
    },
    config: {
      version: '2.0',
      logicalId: generateGuid(),
    },
  }, null, 2));
  
  // 2. Write definition.pbir
  folder.file('definition.pbir', JSON.stringify({
    version: '4.0',
    datasetReference: {
      byPath: null,
      byConnection: null,
    },
  }, null, 2));
  
  // 3. Write report.json (the main content)
  folder.file('report.json', JSON.stringify({
    $schema: 'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/report/1.0.0/schema.json',
    config: JSON.stringify(report.config),
    layoutOptimization: 0,
    pages: report.pages.map(page => ({
      name: page.name,
      displayName: page.displayName,
      displayOption: page.displayOption,
      height: page.height,
      width: page.width,
      visuals: page.visuals,
    })),
  }, null, 2));
  
  // Generate zip blob
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Trigger download in browser
 */
export function downloadPBIP(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

---

## Part 6: Canvas UI

Build the drag-and-drop canvas that renders components.

### File: `src/components/canvas/Canvas.tsx`

```typescript
import React, { useCallback } from 'react';
import { usePBIPStore } from '../../store/pbip-store';
import { PBIBarChart } from '../charts/PBIBarChart';
// Import other chart components...

const VISUAL_COMPONENTS: Record<string, React.ComponentType<any>> = {
  barChart: PBIBarChart,
  columnChart: PBIBarChart,  // Same component, different orientation
  // areaChart: PBIAreaChart,
  // lineChart: PBILineChart,
  // etc.
};

export function Canvas() {
  const { 
    report, 
    currentPageIndex, 
    selectedVisualId,
    moveVisual,
    selectVisual,
  } = usePBIPStore();
  
  const currentPage = report.pages[currentPageIndex];
  
  const handleDragEnd = useCallback((visualId: string, x: number, y: number) => {
    // Clamp to page bounds
    const clampedX = Math.max(0, Math.min(x, currentPage.width - 50));
    const clampedY = Math.max(0, Math.min(y, currentPage.height - 50));
    moveVisual(visualId, clampedX, clampedY);
  }, [currentPage, moveVisual]);

  return (
    <div 
      style={{
        position: 'relative',
        width: currentPage.width,
        height: currentPage.height,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}
      onClick={() => selectVisual(null)}
    >
      {currentPage.visuals.map((visual) => {
        const Component = VISUAL_COMPONENTS[visual.visual.visualType];
        if (!Component) return null;
        
        return (
          <DraggableVisual
            key={visual.name}
            visual={visual}
            isSelected={visual.name === selectedVisualId}
            onSelect={() => selectVisual(visual.name)}
            onDragEnd={(x, y) => handleDragEnd(visual.name, x, y)}
          >
            <Component
              {...visualToProps(visual)}
              onSelect={() => selectVisual(visual.name)}
            />
          </DraggableVisual>
        );
      })}
    </div>
  );
}

// Convert PBIP visual to component props
function visualToProps(visual: PBIPVisual): any {
  return {
    id: visual.name,
    x: visual.position.x,
    y: visual.position.y,
    width: visual.position.width,
    height: visual.position.height,
    title: visual.visual.objects?.title?.text,
    showTitle: visual.visual.objects?.title?.show,
    showLegend: visual.visual.objects?.legend?.show,
    // Map other properties...
  };
}
```

---

## Part 7: Property Panel

Build a property editor that shows ONLY valid options.

### File: `src/components/properties/PropertyPanel.tsx`

```typescript
import React from 'react';
import { usePBIPStore } from '../../store/pbip-store';
import { PBI_TOKENS } from '../../tokens/pbi-tokens';

export function PropertyPanel() {
  const { report, currentPageIndex, selectedVisualId, updateVisual } = usePBIPStore();
  
  if (!selectedVisualId) {
    return <div className="property-panel">Select a visual to edit properties</div>;
  }
  
  const page = report.pages[currentPageIndex];
  const visual = page.visuals.find(v => v.name === selectedVisualId);
  
  if (!visual) return null;
  
  return (
    <div className="property-panel">
      <h3>Properties</h3>
      
      {/* Position */}
      <section>
        <h4>Position</h4>
        <label>
          X: <input 
            type="number" 
            value={visual.position.x}
            onChange={(e) => updateVisual(selectedVisualId, {
              position: { ...visual.position, x: parseInt(e.target.value) || 0 }
            })}
          />
        </label>
        <label>
          Y: <input 
            type="number" 
            value={visual.position.y}
            onChange={(e) => updateVisual(selectedVisualId, {
              position: { ...visual.position, y: parseInt(e.target.value) || 0 }
            })}
          />
        </label>
        <label>
          Width: <input 
            type="number" 
            value={visual.position.width}
            min={PBI_TOKENS.dimensions.chart.minWidth}
            onChange={(e) => updateVisual(selectedVisualId, {
              position: { ...visual.position, width: parseInt(e.target.value) || 200 }
            })}
          />
        </label>
        <label>
          Height: <input 
            type="number" 
            value={visual.position.height}
            min={PBI_TOKENS.dimensions.chart.minHeight}
            onChange={(e) => updateVisual(selectedVisualId, {
              position: { ...visual.position, height: parseInt(e.target.value) || 150 }
            })}
          />
        </label>
      </section>
      
      {/* Colors - ONLY PBI-valid options */}
      <section>
        <h4>Data Color</h4>
        <select
          value={visual.visual.objects?.dataColors?.fill?.solid?.color || PBI_TOKENS.colors.dataViz.category1}
          onChange={(e) => updateVisual(selectedVisualId, {
            visual: {
              ...visual.visual,
              objects: {
                ...visual.visual.objects,
                dataColors: { fill: { solid: { color: e.target.value } } }
              }
            }
          })}
        >
          {Object.entries(PBI_TOKENS.colors.dataViz).map(([name, hex]) => (
            <option key={name} value={hex}>
              {name} ({hex})
            </option>
          ))}
        </select>
      </section>
      
      {/* Legend Position - ONLY PBI-valid options */}
      <section>
        <h4>Legend</h4>
        <label>
          <input 
            type="checkbox"
            checked={visual.visual.objects?.legend?.show ?? false}
            onChange={(e) => updateVisual(selectedVisualId, {
              visual: {
                ...visual.visual,
                objects: {
                  ...visual.visual.objects,
                  legend: { 
                    ...visual.visual.objects?.legend,
                    show: e.target.checked 
                  }
                }
              }
            })}
          />
          Show Legend
        </label>
        
        <select
          value={visual.visual.objects?.legend?.position || 'Top'}
          onChange={(e) => updateVisual(selectedVisualId, {
            visual: {
              ...visual.visual,
              objects: {
                ...visual.visual.objects,
                legend: { 
                  ...visual.visual.objects?.legend,
                  position: e.target.value 
                }
              }
            }
          })}
        >
          {/* ONLY these positions exist in PBI */}
          <option value="Top">Top</option>
          <option value="Bottom">Bottom</option>
          <option value="Left">Left</option>
          <option value="Right">Right</option>
          <option value="TopCenter">Top Center</option>
          <option value="BottomCenter">Bottom Center</option>
          <option value="LeftCenter">Left Center</option>
          <option value="RightCenter">Right Center</option>
        </select>
      </section>
    </div>
  );
}
```

---

## Part 8: File Structure

```
phantom/
├── src/
│   ├── tokens/
│   │   └── pbi-tokens.ts           # Design tokens (source of truth)
│   │
│   ├── components/
│   │   ├── charts/
│   │   │   ├── PBIBarChart.tsx
│   │   │   ├── PBIAreaChart.tsx
│   │   │   ├── PBILineChart.tsx
│   │   │   ├── PBIPieChart.tsx
│   │   │   └── ...
│   │   ├── shared/
│   │   │   ├── PBILegend.tsx
│   │   │   ├── PBIXAxis.tsx
│   │   │   └── PBIYAxis.tsx
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx
│   │   │   └── DraggableVisual.tsx
│   │   └── properties/
│   │       └── PropertyPanel.tsx
│   │
│   ├── store/
│   │   └── pbip-store.ts           # Zustand store (PBIP format)
│   │
│   ├── export/
│   │   ├── pbip-mapping.ts         # Props → PBIP conversion
│   │   └── pbip-writer.ts          # Write PBIP files
│   │
│   └── App.tsx
│
├── reference/
│   └── power-bi-chart-css.md       # Nudge BI CSS spec
│
└── package.json
```

---

## Part 9: Testing Checklist

### Export Fidelity Test

For each component:

1. Create visual in Phantom with specific settings
2. Export to PBIP
3. Open in Power BI Desktop
4. Compare visually

| Component | Property | Phantom Value | PBI Desktop Match? |
|-----------|----------|---------------|-------------------|
| Bar Chart | Bar color | #118dff | ☐ |
| Bar Chart | Title size | 16px | ☐ |
| Bar Chart | Axis color | #64748b | ☐ |
| Bar Chart | Position | x:100, y:50 | ☐ |
| ... | ... | ... | ☐ |

### Constraint Test

Verify that invalid values CANNOT be set:

| Test | Expected | Pass? |
|------|----------|-------|
| Set font to "Roboto" | Should not be possible (not in dropdown) | ☐ |
| Set color to gradient | Should not be possible | ☐ |
| Set shadow on chart | Should not be possible | ☐ |
| Set position to float (100.5) | Should round to integer | ☐ |

---

## Summary

| Layer | Purpose | Key Files |
|-------|---------|-----------|
| **Tokens** | Single source of constrained values | `pbi-tokens.ts` |
| **Components** | Render preview, accept only valid props | `PBIBarChart.tsx`, etc. |
| **Store** | State in PBIP format | `pbip-store.ts` |
| **Export** | Write PBIP files | `pbip-writer.ts` |
| **Canvas** | Drag-drop editing | `Canvas.tsx` |
| **Properties** | Edit panel with valid options only | `PropertyPanel.tsx` |

**The constraint is the feature.** Users can't break export fidelity because the UI prevents invalid values from entering the system.
