# Phantom Gantt Chart Visual
## Technical Specification Document

**Version:** 1.0  
**Date:** January 2026  
**Status:** Draft for Engineering Review  
**Author:** Product Team  
**Phase:** 2 (follows Statistical Pack)

---

## 1. Executive Summary

### 1.1 Purpose
Build a Power BI custom visual that renders professional Gantt charts with pan/zoom, dependencies, baseline comparison, and progress tracking. The visual targets project managers, operations teams, and consultants who currently pay $3-10/user/month for comparable functionality.

### 1.2 Strategic Context
- No native Gantt chart in Power BI
- Existing options: MAQ ($3/user/mo), xViz, JVIZ ($10/user/mo)
- David Bacci's Deneb Gantt proves the visual can be stunning
- Every PM, PMO, and operations team needs this
- Phantom already outputs data models - project data is tabular

### 1.3 Competitive Analysis

| Feature | MAQ Gantt | xViz Gantt | JVIZ Gantt | Phantom Gantt |
|---------|-----------|------------|------------|---------------|
| Price | $3/user/mo | $5/user/mo | $10/user/mo | Free (basic) |
| Pan/Zoom | ❌ | ✅ | ✅ | ✅ |
| Dependencies | ❌ | ✅ | ✅ | ✅ |
| Baseline comparison | ❌ | ✅ | ✅ | ✅ |
| Collapsible hierarchy | ✅ | ✅ | ✅ | ✅ |
| Critical path | ❌ | ❌ | ❌ | ✅ |
| ggplot aesthetic | ❌ | ❌ | ❌ | ✅ |
| Today line | ✅ | ✅ | ✅ | ✅ |
| Progress % | ✅ | ✅ | ✅ | ✅ |
| Milestones | ❌ | ✅ | ✅ | ✅ |

### 1.4 Success Criteria
- User can create a functional Gantt from raw project data in <90 seconds
- Pan/zoom renders smoothly at 60fps
- Supports 500+ tasks without performance degradation
- Passes Microsoft certification requirements
- Free tier competitive with paid alternatives

---

## 2. Scope

### 2.1 In Scope (Phase 2)

| Component | Description |
|-----------|-------------|
| **Task Bars** | Horizontal bars showing task duration, progress fill |
| **Hierarchy** | Parent/child task relationships, collapsible groups |
| **Timeline** | Day/week/month/quarter/year views with auto-scaling |
| **Dependencies** | Finish-to-start, start-to-start arrows between tasks |
| **Milestones** | Diamond markers for zero-duration events |
| **Baseline** | Ghost bars showing planned vs actual |
| **Today Line** | Vertical marker for current date |
| **Progress** | Percentage complete with fill indicator |
| **Data Grid** | Optional left panel showing task details |
| **Pan/Zoom** | Mouse drag to pan, scroll to zoom, zoom buttons |
| **Theme System** | Consistent with Statistical Pack themes |

### 2.2 Out of Scope (Phase 2)
- Resource allocation / leveling
- Critical path calculation (future enhancement)
- Hourly granularity (day minimum)
- Drag-to-edit task dates (read-only visual)
- Export to MS Project / Primavera
- Multi-project portfolio view
- Earned value metrics

### 2.3 Constraints
- Must work without external dependencies (certified visual)
- 30,000 row Power BI data limit
- Touch support for mobile (pan/zoom gestures)
- Must render in sandboxed iframe

---

## 3. Technical Architecture

### 3.1 Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Power BI Host                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │               Phantom Gantt Visual                   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  Timeline   │  │    Grid     │  │   Gantt     │  │   │
│  │  │  Renderer   │  │  Renderer   │  │  Renderer   │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │   │
│  │         │                │                │         │   │
│  │  ┌──────┴────────────────┴────────────────┴──────┐  │   │
│  │  │              Core Engine (TypeScript)          │  │   │
│  │  ├────────────────────────────────────────────────┤  │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │   │
│  │  │  │ Hierarchy│  │ Timeline │  │  Interaction │  │  │   │
│  │  │  │  Manager │  │  Engine  │  │   Handler    │  │  │   │
│  │  │  └──────────┘  └──────────┘  └──────────────┘  │  │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │   │
│  │  │  │Dependency│  │  Zoom    │  │    Theme     │  │  │   │
│  │  │  │  Engine  │  │ Controller│  │   Engine    │  │  │   │
│  │  │  └──────────┘  └──────────┘  └──────────────┘  │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                 Power BI Visual SDK (pbiviz)                │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Core Dependencies

| Package | Version | Purpose | Bundle Size |
|---------|---------|---------|-------------|
| `d3` | ^7.8.5 | SVG rendering, scales, zoom behavior | ~280KB |
| `d3-scale` | ^4.0.2 | Time scales | included |
| `d3-zoom` | ^3.0.0 | Pan/zoom behavior | included |
| `date-fns` | ^3.0.0 | Date manipulation | ~30KB |
| `powerbi-visuals-api` | ^5.8.0 | Power BI integration | SDK |

### 3.3 Project Structure

```
phantom-gantt-visual/
├── src/
│   ├── visual.ts                 # Main visual entry point
│   ├── settings.ts               # Visual settings/capabilities
│   ├── core/
│   │   ├── dataManager.ts        # Power BI data ingestion
│   │   ├── hierarchyManager.ts   # Task hierarchy operations
│   │   ├── timelineEngine.ts     # Date calculations, scale management
│   │   ├── dependencyEngine.ts   # Dependency path calculations
│   │   ├── zoomController.ts     # Pan/zoom state management
│   │   └── interactionHandler.ts # Selection, tooltips, collapse
│   ├── renderers/
│   │   ├── timelineRenderer.ts   # Header timeline (days/weeks/months)
│   │   ├── gridRenderer.ts       # Left data grid panel
│   │   ├── ganttRenderer.ts      # Task bars, dependencies, milestones
│   │   ├── todayLineRenderer.ts  # Current date marker
│   │   └── baselineRenderer.ts   # Baseline comparison bars
│   ├── themes/
│   │   └── (shared with Statistical Pack)
│   └── utils/
│       ├── dateUtils.ts          # Date formatting, business days
│       ├── colorUtils.ts         # Status colors, gradients
│       └── pathUtils.ts          # Dependency arrow paths
├── style/
│   └── visual.less
├── assets/
│   └── icon.png
├── capabilities.json
├── pbiviz.json
├── package.json
└── tsconfig.json
```

---

## 4. Data Interface

### 4.1 Data Roles (capabilities.json)

```json
{
  "dataRoles": [
    {
      "name": "taskId",
      "displayName": "Task ID",
      "description": "Unique identifier for each task",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }, { "numeric": true }]
    },
    {
      "name": "taskName",
      "displayName": "Task Name",
      "description": "Display name of the task",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }]
    },
    {
      "name": "startDate",
      "displayName": "Start Date",
      "description": "Task start date",
      "kind": "Measure",
      "requiredTypes": [{ "dateTime": true }]
    },
    {
      "name": "endDate",
      "displayName": "End Date",
      "description": "Task end date",
      "kind": "Measure",
      "requiredTypes": [{ "dateTime": true }]
    },
    {
      "name": "progress",
      "displayName": "Progress %",
      "description": "Percentage complete (0-100)",
      "kind": "Measure",
      "requiredTypes": [{ "numeric": true }]
    },
    {
      "name": "parentId",
      "displayName": "Parent Task ID",
      "description": "Parent task for hierarchy",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }, { "numeric": true }]
    },
    {
      "name": "dependencies",
      "displayName": "Dependencies",
      "description": "Predecessor task IDs (comma-separated)",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }]
    },
    {
      "name": "milestone",
      "displayName": "Is Milestone",
      "description": "Flag for milestone tasks",
      "kind": "Measure",
      "requiredTypes": [{ "bool": true }, { "numeric": true }]
    },
    {
      "name": "baselineStart",
      "displayName": "Baseline Start",
      "description": "Planned start date for comparison",
      "kind": "Measure",
      "requiredTypes": [{ "dateTime": true }]
    },
    {
      "name": "baselineEnd",
      "displayName": "Baseline End",
      "description": "Planned end date for comparison",
      "kind": "Measure",
      "requiredTypes": [{ "dateTime": true }]
    },
    {
      "name": "resource",
      "displayName": "Resource",
      "description": "Assigned resource name",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }]
    },
    {
      "name": "status",
      "displayName": "Status",
      "description": "Task status for color coding",
      "kind": "Grouping",
      "requiredTypes": [{ "text": true }]
    },
    {
      "name": "colorBy",
      "displayName": "Color By",
      "description": "Field for bar color encoding",
      "kind": "Grouping"
    },
    {
      "name": "tooltipFields",
      "displayName": "Tooltips",
      "description": "Additional tooltip fields",
      "kind": "Measure"
    }
  ],
  "dataViewMappings": [
    {
      "conditions": [
        {
          "taskId": { "max": 1 },
          "taskName": { "max": 1 },
          "startDate": { "max": 1 },
          "endDate": { "max": 1 },
          "progress": { "max": 1 },
          "parentId": { "max": 1 },
          "dependencies": { "max": 1 },
          "milestone": { "max": 1 },
          "baselineStart": { "max": 1 },
          "baselineEnd": { "max": 1 },
          "resource": { "max": 1 },
          "status": { "max": 1 },
          "colorBy": { "max": 1 }
        }
      ],
      "categorical": {
        "categories": {
          "select": [
            { "for": { "in": "taskId" } },
            { "for": { "in": "taskName" } },
            { "for": { "in": "parentId" } },
            { "for": { "in": "dependencies" } },
            { "for": { "in": "resource" } },
            { "for": { "in": "status" } },
            { "for": { "in": "colorBy" } }
          ],
          "dataReductionAlgorithm": { "top": { "count": 5000 } }
        },
        "values": {
          "select": [
            { "bind": { "to": "startDate" } },
            { "bind": { "to": "endDate" } },
            { "bind": { "to": "progress" } },
            { "bind": { "to": "milestone" } },
            { "bind": { "to": "baselineStart" } },
            { "bind": { "to": "baselineEnd" } },
            { "bind": { "to": "tooltipFields" } }
          ]
        }
      }
    }
  ]
}
```

### 4.2 Internal Data Model

```typescript
interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  duration: number;              // in days
  progress: number;              // 0-100
  
  // Hierarchy
  parentId: string | null;
  children: GanttTask[];
  level: number;                 // nesting depth
  isExpanded: boolean;
  isVisible: boolean;            // hidden if parent collapsed
  
  // Dependencies
  predecessors: string[];        // task IDs
  successors: string[];          // computed from predecessors
  
  // Display
  isMilestone: boolean;
  resource: string | null;
  status: string | null;
  color: string;
  
  // Baseline
  baselineStart: Date | null;
  baselineEnd: Date | null;
  baselineDuration: number | null;
  variance: number | null;       // days difference
  
  // Computed
  rowIndex: number;              // visual row position
  isOnCriticalPath: boolean;     // future enhancement
  
  // Power BI
  selectionId: ISelectionId;
}

interface GanttDependency {
  fromTaskId: string;
  toTaskId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';  // Finish-Start, Start-Start, etc.
}

interface GanttData {
  tasks: GanttTask[];
  dependencies: GanttDependency[];
  dateRange: { start: Date; end: Date };
  hierarchy: GanttTask[];        // root-level tasks with nested children
}
```

### 4.3 Data Flow

```
Power BI DataView
       │
       ▼
┌──────────────────┐
│   DataManager    │
│                  │
│  - Parse dates
│  - Validate ranges
│  - Handle nulls
│  - Parse dependency strings
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ HierarchyManager │
│                  │
│  - Build tree from parentId
│  - Compute levels
│  - Track expand/collapse state
│  - Calculate visible rows
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ DependencyEngine │
│                  │
│  - Parse predecessor strings
│  - Build dependency graph
│  - Calculate arrow paths
│  - Detect cycles (warn)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  TimelineEngine  │
│                  │
│  - Calculate date extent
│  - Build time scale
│  - Determine granularity
│  - Generate tick marks
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Renderers     │
│                  │
│  - Timeline header
│  - Grid panel
│  - Task bars
│  - Dependencies
│  - Today line
└──────────────────┘
```

---

## 5. Component Specifications

### 5.1 Timeline Header

#### 5.1.1 Granularity Levels

| Level | When Used | Primary Row | Secondary Row |
|-------|-----------|-------------|---------------|
| Day | < 30 days visible | Day number | Month/Year |
| Week | 30-90 days | Week number or date range | Month/Year |
| Month | 90-365 days | Month name | Year |
| Quarter | 1-3 years | Q1, Q2, Q3, Q4 | Year |
| Year | > 3 years | Year | - |

#### 5.1.2 Visual Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              January 2026                                   │  ← Secondary row
├────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┤
│ 1  │ 2  │ 3  │ 4  │ 5  │ 6  │ 7  │ 8  │ 9  │ 10 │ 11 │ 12 │ 13 │ 14 │ 15 │  ← Primary row (days)
├────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┤
│ M    T    W    T    F    S    S    M    T    W    T    F    S    S    M   │  ← Weekday row (optional)
└────────────────────────────────────────────────────────────────────────────┘
```

#### 5.1.3 Configuration Options

```typescript
interface TimelineSettings {
  // Granularity
  autoGranularity: boolean;      // auto-select based on zoom
  granularity: 'day' | 'week' | 'month' | 'quarter' | 'year';
  
  // Display
  showSecondaryRow: boolean;
  showWeekdayRow: boolean;
  headerHeight: number;          // pixels per row
  
  // Weekend highlighting
  highlightWeekends: boolean;
  weekendColor: string;
  weekendOpacity: number;
  
  // Today marker
  showTodayLine: boolean;
  todayLineColor: string;
  todayLineWidth: number;
  todayLineStyle: 'solid' | 'dashed';
  
  // Date formatting
  dateFormat: string;            // date-fns format string
  firstDayOfWeek: 0 | 1;         // 0 = Sunday, 1 = Monday
  
  // Scrolling
  minColumnWidth: number;        // minimum pixels per day
  maxColumnWidth: number;        // maximum pixels per day
}
```

### 5.2 Grid Panel (Left Side)

#### 5.2.1 Visual Structure

```
┌──────────────────────────────┐
│ Task Name           │ Start  │
├──────────────────────────────┤
│ ▼ Project Alpha            │ Jan 1 │
│   ├─ ▼ Phase 1             │ Jan 1 │
│   │   ├─ Design            │ Jan 1 │
│   │   └─ Development       │ Jan 8 │
│   └─ ▼ Phase 2             │ Jan 20│
│       ├─ Testing           │ Jan 20│
│       └─ Deployment        │ Jan 28│
│ ▼ Project Beta             │ Feb 1 │
│   └─ Research              │ Feb 1 │
└──────────────────────────────┘
  ▲ Expand/collapse icons
```

#### 5.2.2 Configuration Options

```typescript
interface GridSettings {
  // Visibility
  showGrid: boolean;
  gridWidth: number;             // pixels, or 'auto'
  
  // Columns
  columns: GridColumn[];
  
  // Row styling
  rowHeight: number;
  alternateRowColor: boolean;
  alternateRowColorValue: string;
  
  // Hierarchy
  indentWidth: number;           // pixels per level
  showExpandIcons: boolean;
  expandIconSize: number;
  
  // Resize
  resizable: boolean;            // allow column resize
  minGridWidth: number;
  maxGridWidth: number;
}

interface GridColumn {
  field: 'taskName' | 'startDate' | 'endDate' | 'duration' | 'progress' | 'resource' | 'status';
  displayName: string;
  width: number;
  align: 'left' | 'center' | 'right';
  format?: string;               // for dates/numbers
}
```

### 5.3 Gantt Bars

#### 5.3.1 Visual Elements

```
Regular Task:
┌─────────────────────────────────────┐
│████████████░░░░░░░░░░░░░░░░░░░░░░░░│  ← Progress fill (40%)
└─────────────────────────────────────┘
     ↑ Task bar

Summary Task (parent):
┌─────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← Darker/different style
├─────────────────────────────────────┤
 ╲                                   ╱   ← Summary brackets
  ╲─────────────────────────────────╱

Milestone:
          ◆                              ← Diamond marker

With Baseline:
┌─────────────────────────────────────┐
│████████████░░░░░░░░░░░░░░░░░░░░░░░░│  ← Actual bar
└─────────────────────────────────────┘
   ┌───────────────────────────────────────┐
   │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← Baseline (ghost bar)
   └───────────────────────────────────────┘
```

#### 5.3.2 Configuration Options

```typescript
interface BarSettings {
  // Dimensions
  barHeight: number;             // pixels
  barCornerRadius: number;
  barPadding: number;            // vertical padding in row
  
  // Colors
  barFillColor: string;          // default color
  barStrokeColor: string;
  barStrokeWidth: number;
  useColorByField: boolean;      // color by data field
  
  // Progress
  showProgress: boolean;
  progressFillColor: string;
  progressFillOpacity: number;
  showProgressLabel: boolean;    // "40%" on bar
  progressLabelPosition: 'inside' | 'right';
  
  // Summary tasks
  summaryBarStyle: 'bracket' | 'solid' | 'outline';
  summaryBarColor: string;
  summaryBarHeight: number;
  
  // Milestones
  milestoneShape: 'diamond' | 'circle' | 'square' | 'star';
  milestoneSize: number;
  milestoneColor: string;
  milestoneBorderColor: string;
  
  // Labels
  showBarLabels: boolean;
  barLabelField: 'taskName' | 'resource' | 'progress' | 'dates';
  barLabelPosition: 'inside' | 'right' | 'left';
  barLabelColor: string;
  barLabelFontSize: number;
  
  // Status colors (conditional)
  statusColors: {
    notStarted: string;
    inProgress: string;
    completed: string;
    delayed: string;
    onHold: string;
  };
}
```

### 5.4 Dependencies

#### 5.4.1 Dependency Types

| Type | Code | Description | Arrow Path |
|------|------|-------------|------------|
| Finish-to-Start | FS | B starts when A finishes | A end → B start |
| Start-to-Start | SS | B starts when A starts | A start → B start |
| Finish-to-Finish | FF | B finishes when A finishes | A end → B end |
| Start-to-Finish | SF | B finishes when A starts | A start → B end |

#### 5.4.2 Arrow Path Calculation

```typescript
interface DependencyPath {
  fromTask: GanttTask;
  toTask: GanttTask;
  type: DependencyType;
  path: string;                  // SVG path d attribute
  isHighlighted: boolean;
}

// Path calculation for Finish-to-Start (most common)
function calculateFSPath(from: GanttTask, to: GanttTask, rowHeight: number): string {
  const fromX = timeScale(from.endDate);
  const fromY = from.rowIndex * rowHeight + rowHeight / 2;
  const toX = timeScale(to.startDate);
  const toY = to.rowIndex * rowHeight + rowHeight / 2;
  
  const midX = fromX + 15;  // horizontal offset before turning
  
  // Path: right from end, down/up, right to start
  return `
    M ${fromX} ${fromY}
    H ${midX}
    V ${toY}
    H ${toX - 8}
  `;
  // Arrow head added separately
}
```

#### 5.4.3 Visual Structure

```
Task A  ├────────────────────┤
                             │
                             └─────────────▶ ├─────────────┤  Task B
                                             ↑
                                        Arrow head

With routing around other tasks:
Task A  ├────────────────────┤
                             │
                             ├──────┐
                                    │
Task C  ├───────────────────────────┼──────────────────┤
                                    │
                                    └─────▶ ├─────────────┤  Task B
```

#### 5.4.4 Configuration Options

```typescript
interface DependencySettings {
  // Visibility
  showDependencies: boolean;
  
  // Line style
  lineColor: string;
  lineWidth: number;
  lineStyle: 'solid' | 'dashed';
  lineOpacity: number;
  
  // Arrow
  arrowSize: number;
  arrowStyle: 'filled' | 'outline';
  
  // Highlighting
  highlightOnHover: boolean;
  highlightColor: string;
  highlightWidth: number;
  
  // Routing
  routingStyle: 'direct' | 'orthogonal';  // straight vs right-angle
  
  // Lag display
  showLag: boolean;              // show +2d lag on arrow
  lagLabelFontSize: number;
}
```

### 5.5 Baseline Comparison

#### 5.5.1 Visual Structure

```
Normal view:
├────────────────────┤                     Actual bar

With baseline enabled:
├────────────────────┤                     Actual bar (solid)
   ├──────────────────────────┤            Baseline bar (ghost/outline)
                      ↑
              Variance indicator (red = late, green = early)
```

#### 5.5.2 Configuration Options

```typescript
interface BaselineSettings {
  // Visibility
  showBaseline: boolean;
  
  // Position
  baselinePosition: 'above' | 'below' | 'behind';
  
  // Styling
  baselineBarStyle: 'ghost' | 'outline' | 'line';
  baselineColor: string;
  baselineOpacity: number;
  baselineHeight: number;        // relative to main bar
  
  // Variance
  showVariance: boolean;
  variancePosition: 'bar' | 'grid' | 'tooltip';
  earlyColor: string;            // ahead of schedule
  lateColor: string;             // behind schedule
  onTimeColor: string;
  varianceThreshold: number;     // days tolerance for "on time"
}
```

### 5.6 Pan/Zoom Controller

#### 5.6.1 Zoom Levels

| Level | Days Visible | Column Width | Granularity |
|-------|--------------|--------------|-------------|
| Maximum zoom in | 7 days | 80px/day | Day + hour |
| Default | 30 days | 25px/day | Day |
| Medium | 90 days | 8px/day | Week |
| Wide | 365 days | 2px/day | Month |
| Maximum zoom out | 3 years | 0.5px/day | Quarter |

#### 5.6.2 Interaction Handlers

```typescript
interface ZoomController {
  // State
  currentScale: number;          // 1.0 = default
  currentTranslateX: number;     // pan offset
  
  // Methods
  zoomIn(): void;                // 1.2x zoom
  zoomOut(): void;               // 0.8x zoom
  zoomToFit(): void;             // fit all tasks in view
  zoomToSelection(): void;       // fit selected tasks
  zoomToDateRange(start: Date, end: Date): void;
  
  // Events
  onZoom(scale: number): void;
  onPan(translateX: number): void;
}

// D3 zoom behavior setup
const zoom = d3.zoom()
  .scaleExtent([0.1, 10])        // min/max zoom
  .translateExtent([[0, 0], [maxWidth, height]])
  .on('zoom', (event) => {
    const transform = event.transform;
    ganttGroup.attr('transform', `translate(${transform.x},0) scale(${transform.k},1)`);
    updateTimelineScale(transform.k);
  });
```

#### 5.6.3 Configuration Options

```typescript
interface ZoomSettings {
  // Enabled features
  enablePan: boolean;
  enableZoom: boolean;
  enableMouseWheel: boolean;
  enablePinchZoom: boolean;      // touch devices
  
  // Zoom controls
  showZoomControls: boolean;
  zoomControlPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  
  // Limits
  minZoom: number;               // 0.1 = 10%
  maxZoom: number;               // 10 = 1000%
  zoomStep: number;              // increment per click (1.2 = 20%)
  
  // Initial view
  initialView: 'fit' | 'today' | 'start';
  
  // Behavior
  zoomCenter: 'mouse' | 'center';  // zoom toward mouse or center
  panBeyondExtent: boolean;      // allow panning past data
}
```

---

## 6. Hierarchy Management

### 6.1 Tree Operations

```typescript
class HierarchyManager {
  private tasks: Map<string, GanttTask>;
  private roots: GanttTask[];
  
  buildHierarchy(flatTasks: GanttTask[]): void {
    // Index all tasks
    this.tasks = new Map(flatTasks.map(t => [t.id, t]));
    
    // Build parent-child relationships
    for (const task of flatTasks) {
      if (task.parentId && this.tasks.has(task.parentId)) {
        const parent = this.tasks.get(task.parentId)!;
        parent.children.push(task);
        task.level = parent.level + 1;
      } else {
        task.level = 0;
        this.roots.push(task);
      }
    }
    
    // Sort children by start date
    this.sortChildren(this.roots);
    
    // Assign row indices
    this.assignRowIndices();
  }
  
  toggleExpand(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task && task.children.length > 0) {
      task.isExpanded = !task.isExpanded;
      this.updateVisibility(task);
      this.assignRowIndices();
    }
  }
  
  expandAll(): void {
    for (const task of this.tasks.values()) {
      if (task.children.length > 0) {
        task.isExpanded = true;
      }
    }
    this.assignRowIndices();
  }
  
  collapseAll(): void {
    for (const task of this.tasks.values()) {
      if (task.children.length > 0) {
        task.isExpanded = false;
      }
    }
    this.assignRowIndices();
  }
  
  private updateVisibility(task: GanttTask): void {
    for (const child of task.children) {
      child.isVisible = task.isExpanded && task.isVisible;
      this.updateVisibility(child);
    }
  }
  
  private assignRowIndices(): void {
    let rowIndex = 0;
    const assign = (tasks: GanttTask[]) => {
      for (const task of tasks) {
        if (task.isVisible) {
          task.rowIndex = rowIndex++;
          if (task.isExpanded) {
            assign(task.children);
          }
        }
      }
    };
    assign(this.roots);
  }
  
  getVisibleTasks(): GanttTask[] {
    return Array.from(this.tasks.values())
      .filter(t => t.isVisible)
      .sort((a, b) => a.rowIndex - b.rowIndex);
  }
  
  // Summary task date calculation
  calculateSummaryDates(task: GanttTask): void {
    if (task.children.length === 0) return;
    
    let minStart = Infinity;
    let maxEnd = -Infinity;
    let totalProgress = 0;
    let totalDuration = 0;
    
    for (const child of task.children) {
      this.calculateSummaryDates(child);  // recursive
      minStart = Math.min(minStart, child.startDate.getTime());
      maxEnd = Math.max(maxEnd, child.endDate.getTime());
      totalProgress += child.progress * child.duration;
      totalDuration += child.duration;
    }
    
    task.startDate = new Date(minStart);
    task.endDate = new Date(maxEnd);
    task.duration = (maxEnd - minStart) / (1000 * 60 * 60 * 24);
    task.progress = totalDuration > 0 ? totalProgress / totalDuration : 0;
  }
}
```

---

## 7. Settings Panel

### 7.1 Settings Categories

```json
{
  "objects": {
    "general": {
      "displayName": "General",
      "properties": {
        "rowHeight": {
          "displayName": "Row Height",
          "type": { "numeric": true }
        },
        "showTooltips": {
          "displayName": "Show Tooltips",
          "type": { "bool": true }
        }
      }
    },
    "timeline": {
      "displayName": "Timeline",
      "properties": {
        "autoGranularity": {
          "displayName": "Auto Granularity",
          "type": { "bool": true }
        },
        "granularity": {
          "displayName": "Granularity",
          "type": {
            "enumeration": [
              { "value": "day", "displayName": "Day" },
              { "value": "week", "displayName": "Week" },
              { "value": "month", "displayName": "Month" },
              { "value": "quarter", "displayName": "Quarter" },
              { "value": "year", "displayName": "Year" }
            ]
          }
        },
        "highlightWeekends": {
          "displayName": "Highlight Weekends",
          "type": { "bool": true }
        },
        "showTodayLine": {
          "displayName": "Show Today Line",
          "type": { "bool": true }
        },
        "todayLineColor": {
          "displayName": "Today Line Color",
          "type": { "fill": { "solid": { "color": true } } }
        }
      }
    },
    "grid": {
      "displayName": "Grid Panel",
      "properties": {
        "showGrid": {
          "displayName": "Show Grid",
          "type": { "bool": true }
        },
        "gridWidth": {
          "displayName": "Grid Width",
          "type": { "numeric": true }
        },
        "showTaskName": {
          "displayName": "Show Task Name",
          "type": { "bool": true }
        },
        "showStartDate": {
          "displayName": "Show Start Date",
          "type": { "bool": true }
        },
        "showEndDate": {
          "displayName": "Show End Date",
          "type": { "bool": true }
        },
        "showDuration": {
          "displayName": "Show Duration",
          "type": { "bool": true }
        },
        "showProgress": {
          "displayName": "Show Progress",
          "type": { "bool": true }
        },
        "showResource": {
          "displayName": "Show Resource",
          "type": { "bool": true }
        }
      }
    },
    "bars": {
      "displayName": "Task Bars",
      "properties": {
        "barHeight": {
          "displayName": "Bar Height",
          "type": { "numeric": true }
        },
        "barColor": {
          "displayName": "Bar Color",
          "type": { "fill": { "solid": { "color": true } } }
        },
        "barCornerRadius": {
          "displayName": "Corner Radius",
          "type": { "numeric": true }
        },
        "showProgress": {
          "displayName": "Show Progress Fill",
          "type": { "bool": true }
        },
        "progressColor": {
          "displayName": "Progress Color",
          "type": { "fill": { "solid": { "color": true } } }
        },
        "showBarLabels": {
          "displayName": "Show Labels",
          "type": { "bool": true }
        },
        "barLabelField": {
          "displayName": "Label Field",
          "type": {
            "enumeration": [
              { "value": "taskName", "displayName": "Task Name" },
              { "value": "resource", "displayName": "Resource" },
              { "value": "progress", "displayName": "Progress %" },
              { "value": "dates", "displayName": "Date Range" }
            ]
          }
        }
      }
    },
    "milestones": {
      "displayName": "Milestones",
      "properties": {
        "milestoneShape": {
          "displayName": "Shape",
          "type": {
            "enumeration": [
              { "value": "diamond", "displayName": "Diamond" },
              { "value": "circle", "displayName": "Circle" },
              { "value": "square", "displayName": "Square" },
              { "value": "star", "displayName": "Star" }
            ]
          }
        },
        "milestoneSize": {
          "displayName": "Size",
          "type": { "numeric": true }
        },
        "milestoneColor": {
          "displayName": "Color",
          "type": { "fill": { "solid": { "color": true } } }
        }
      }
    },
    "dependencies": {
      "displayName": "Dependencies",
      "properties": {
        "showDependencies": {
          "displayName": "Show Dependencies",
          "type": { "bool": true }
        },
        "lineColor": {
          "displayName": "Line Color",
          "type": { "fill": { "solid": { "color": true } } }
        },
        "lineWidth": {
          "displayName": "Line Width",
          "type": { "numeric": true }
        },
        "lineStyle": {
          "displayName": "Line Style",
          "type": {
            "enumeration": [
              { "value": "solid", "displayName": "Solid" },
              { "value": "dashed", "displayName": "Dashed" }
            ]
          }
        }
      }
    },
    "baseline": {
      "displayName": "Baseline",
      "properties": {
        "showBaseline": {
          "displayName": "Show Baseline",
          "type": { "bool": true }
        },
        "baselinePosition": {
          "displayName": "Position",
          "type": {
            "enumeration": [
              { "value": "below", "displayName": "Below Bar" },
              { "value": "above", "displayName": "Above Bar" },
              { "value": "behind", "displayName": "Behind Bar" }
            ]
          }
        },
        "baselineColor": {
          "displayName": "Baseline Color",
          "type": { "fill": { "solid": { "color": true } } }
        },
        "baselineOpacity": {
          "displayName": "Opacity",
          "type": { "numeric": true }
        },
        "showVariance": {
          "displayName": "Show Variance",
          "type": { "bool": true }
        },
        "lateColor": {
          "displayName": "Late Color",
          "type": { "fill": { "solid": { "color": true } } }
        },
        "earlyColor": {
          "displayName": "Early Color",
          "type": { "fill": { "solid": { "color": true } } }
        }
      }
    },
    "zoom": {
      "displayName": "Pan & Zoom",
      "properties": {
        "enablePan": {
          "displayName": "Enable Pan",
          "type": { "bool": true }
        },
        "enableZoom": {
          "displayName": "Enable Zoom",
          "type": { "bool": true }
        },
        "showZoomControls": {
          "displayName": "Show Zoom Buttons",
          "type": { "bool": true }
        },
        "initialView": {
          "displayName": "Initial View",
          "type": {
            "enumeration": [
              { "value": "fit", "displayName": "Fit All" },
              { "value": "today", "displayName": "Center on Today" },
              { "value": "start", "displayName": "Start of Project" }
            ]
          }
        }
      }
    },
    "theme": {
      "displayName": "Theme",
      "properties": {
        "name": {
          "displayName": "Style",
          "type": {
            "enumeration": [
              { "value": "grey", "displayName": "ggplot2 Grey" },
              { "value": "minimal", "displayName": "Minimal" },
              { "value": "classic", "displayName": "Classic" },
              { "value": "economist", "displayName": "The Economist" },
              { "value": "fivethirtyeight", "displayName": "FiveThirtyEight" }
            ]
          }
        }
      }
    }
  }
}
```

---

## 8. Rendering Pipeline

### 8.1 Main Render Flow

```typescript
class GanttRenderer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private gridGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private timelineGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private ganttGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  private dependencyGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  
  render(data: GanttData, viewport: IViewport, settings: GanttSettings): void {
    const gridWidth = settings.grid.showGrid ? settings.grid.gridWidth : 0;
    const timelineHeight = this.calculateTimelineHeight(settings);
    const ganttWidth = viewport.width - gridWidth;
    const ganttHeight = viewport.height - timelineHeight;
    
    // Clear
    this.svg.selectAll('*').remove();
    
    // Create clip path for gantt area (for pan/zoom)
    this.svg.append('defs')
      .append('clipPath')
      .attr('id', 'gantt-clip')
      .append('rect')
      .attr('x', gridWidth)
      .attr('y', timelineHeight)
      .attr('width', ganttWidth)
      .attr('height', ganttHeight);
    
    // Grid panel (left)
    if (settings.grid.showGrid) {
      this.gridGroup = this.svg.append('g')
        .attr('class', 'grid-panel')
        .attr('transform', `translate(0, ${timelineHeight})`);
      this.renderGrid(data, settings);
    }
    
    // Timeline header (top)
    this.timelineGroup = this.svg.append('g')
      .attr('class', 'timeline-header')
      .attr('transform', `translate(${gridWidth}, 0)`);
    this.renderTimeline(data, settings);
    
    // Gantt area (main)
    this.ganttGroup = this.svg.append('g')
      .attr('class', 'gantt-area')
      .attr('clip-path', 'url(#gantt-clip)')
      .attr('transform', `translate(${gridWidth}, ${timelineHeight})`);
    
    // Weekend highlighting
    if (settings.timeline.highlightWeekends) {
      this.renderWeekendHighlights(data, settings);
    }
    
    // Today line
    if (settings.timeline.showTodayLine) {
      this.renderTodayLine(data, settings);
    }
    
    // Baseline bars (behind main bars)
    if (settings.baseline.showBaseline) {
      this.renderBaselineBars(data, settings);
    }
    
    // Task bars
    this.renderTaskBars(data, settings);
    
    // Dependencies (on top)
    if (settings.dependencies.showDependencies) {
      this.dependencyGroup = this.ganttGroup.append('g')
        .attr('class', 'dependencies');
      this.renderDependencies(data, settings);
    }
    
    // Setup zoom behavior
    this.setupZoom(settings);
  }
  
  private renderTaskBars(data: GanttData, settings: GanttSettings): void {
    const visibleTasks = data.hierarchy
      .flatMap(t => this.flattenVisible(t))
      .filter(t => t.isVisible);
    
    const taskGroups = this.ganttGroup.selectAll('.task-group')
      .data(visibleTasks, (d: GanttTask) => d.id)
      .join(
        enter => enter.append('g')
          .attr('class', 'task-group')
          .attr('transform', d => `translate(0, ${d.rowIndex * settings.general.rowHeight})`),
        update => update
          .transition()
          .duration(200)
          .attr('transform', d => `translate(0, ${d.rowIndex * settings.general.rowHeight})`),
        exit => exit.remove()
      );
    
    // Regular tasks
    taskGroups.filter(d => !d.isMilestone && d.children.length === 0)
      .each(function(d) {
        const g = d3.select(this);
        renderTaskBar(g, d, settings);
      });
    
    // Summary tasks
    taskGroups.filter(d => d.children.length > 0)
      .each(function(d) {
        const g = d3.select(this);
        renderSummaryBar(g, d, settings);
      });
    
    // Milestones
    taskGroups.filter(d => d.isMilestone)
      .each(function(d) {
        const g = d3.select(this);
        renderMilestone(g, d, settings);
      });
  }
}
```

---

## 9. Testing Requirements

### 9.1 Unit Tests

| Component | Test Cases |
|-----------|------------|
| HierarchyManager | Build tree, expand/collapse, row index assignment |
| TimelineEngine | Date scale accuracy, granularity selection |
| DependencyEngine | Path calculation, cycle detection |
| DataManager | Date parsing, null handling, dependency string parsing |

### 9.2 Visual Tests

| Test | Expected Result |
|------|-----------------|
| Empty data | "No data" message |
| Single task | Renders correctly |
| 500 tasks | Renders in <3 seconds |
| Deep hierarchy (10 levels) | Proper indentation |
| Circular dependencies | Warning shown, no crash |
| Tasks spanning years | Correct zoom/pan |

### 9.3 Interaction Tests

| Test | Expected Result |
|------|-----------------|
| Click task | Selection applied, cross-filter |
| Click expand/collapse | Hierarchy toggles, rows reflow |
| Mouse drag | Pan works smoothly |
| Mouse wheel | Zoom in/out works |
| Touch pinch | Zoom works on mobile |
| Hover task | Tooltip appears |

---

## 10. Deliverables & Milestones

### 10.1 Phase 2a: Core Gantt (2.5 weeks)

- [ ] Project scaffolding
- [ ] DataManager (parse dates, dependencies)
- [ ] TimelineEngine (scales, ticks)
- [ ] Basic task bar rendering
- [ ] Timeline header
- [ ] Today line

### 10.2 Phase 2b: Hierarchy & Grid (2 weeks)

- [ ] HierarchyManager
- [ ] Expand/collapse functionality
- [ ] Grid panel renderer
- [ ] Summary task calculation
- [ ] Row reflow animation

### 10.3 Phase 2c: Dependencies & Milestones (1.5 weeks)

- [ ] Dependency parsing
- [ ] Arrow path calculation
- [ ] Dependency rendering
- [ ] Milestone shapes
- [ ] Dependency highlighting on hover

### 10.4 Phase 2d: Pan/Zoom & Baseline (1.5 weeks)

- [ ] D3 zoom behavior
- [ ] Zoom controls UI
- [ ] Baseline bar rendering
- [ ] Variance indicators
- [ ] Mobile touch support

### 10.5 Phase 2e: Polish & Settings (1 week)

- [ ] Complete settings panel
- [ ] Theme integration
- [ ] Tooltips
- [ ] Selection & cross-filter
- [ ] Performance optimization

### 10.6 Phase 2f: Testing (1 week)

- [ ] Unit tests
- [ ] Visual regression tests
- [ ] Accessibility audit
- [ ] Certification submission

**Total estimated time: 9.5 weeks**

---

## 11. Appendix

### 11.1 Reference Implementations

- David Bacci's Deneb Gantt: https://github.com/PBI-David/Deneb-Showcase/tree/main/Gantt%20Chart
- D3 Gantt examples: https://observablehq.com/@d3/gantt-chart
- MAQ Gantt source: https://github.com/maqsoftware/PowerBI-visuals-GanttChart

### 11.2 Sample Data Schema

```csv
TaskID,TaskName,StartDate,EndDate,Progress,ParentID,Dependencies,IsMilestone,Resource,BaselineStart,BaselineEnd,Status
1,Project Alpha,2026-01-01,2026-03-31,25,,,FALSE,John,2026-01-01,2026-03-15,In Progress
2,Phase 1,2026-01-01,2026-01-31,80,1,,FALSE,,2026-01-01,2026-01-25,In Progress
3,Design,2026-01-01,2026-01-10,100,2,,FALSE,Alice,2026-01-01,2026-01-08,Completed
4,Development,2026-01-11,2026-01-31,60,2,3,FALSE,Bob,2026-01-09,2026-01-25,In Progress
5,Phase 1 Complete,2026-01-31,2026-01-31,0,1,4,TRUE,,2026-01-25,2026-01-25,Not Started
6,Phase 2,2026-02-01,2026-03-31,0,1,5,FALSE,,2026-01-26,2026-03-15,Not Started
7,Testing,2026-02-01,2026-02-28,0,6,,FALSE,Carol,2026-01-26,2026-02-20,Not Started
8,Deployment,2026-03-01,2026-03-31,0,6,7,FALSE,Dave,2026-02-21,2026-03-15,Not Started
```

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Product | Initial draft |
