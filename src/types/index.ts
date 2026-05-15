export interface Store {
  id: string;
  name: string;
  region: string;
  country: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface Sale {
  id: string;
  storeId: string;
  productId: string;
  date: string;
  quantity: number;
  quantityPL: number; // Plan
  quantityPY: number; // Previous Year
  revenue: number;
  revenuePL: number; // Plan
  revenuePY: number; // Previous Year
  profit: number;
  profitPL: number;
  profitPY: number;
  discount: number;
  discountPL: number; // Plan
  discountPY: number; // Previous Year
}

export interface Customer {
  id: string;
  name: string;
  tier: 'Free' | 'Starter' | 'Professional' | 'Enterprise';
  region: string;
  industry: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  date: string;
  mrr: number;
  mrrPL: number;
  mrrPY: number;
  churn: number; // 0 or 1 for boolean-like, or a value
  ltv: number;
  arr: number;
  cac: number;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  office: string;
  hireDate: string;
  salary: number;
  salaryPL: number; // Plan
  salaryPY: number; // Prior Year
  rating: number; // 1-5
  ratingPL: number;
  ratingPY: number;
  attrition: number; // 0 or 1
  tenure: number; // years
}

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  carrier: string;
  cost: number;
  costPL: number; // Plan
  costPY: number; // Prior Year
  weight: number;
  weightPL: number;
  weightPY: number;
  status: 'Delivered' | 'In Transit' | 'Delayed';
  date: string;
  onTime: number; // 0 or 1
}

export interface FinanceRecord {
  id: string;
  date: string;
  account: string;
  region: string;
  businessUnit: string;
  scenario: 'Actual' | 'Budget' | 'Forecast';
  amount: number;
  variance: number;
}

// Portfolio Monitoring types
export interface PortfolioEntity {
  id: string;
  name: string;
  sector: string;
  region: string;
  marketValue: number;
  sourceRegion: string;
  source: string;
  accountReportName: string;  // e.g. "Global Equity Fund"
  accountCode: string;        // the "Acc" column (ID like "ACC001")
}

export interface ControversyScore {
  id: string;
  entityId: string;
  entityName: string;
  category: string;
  score: number;
  previousScore: number;
  scoreChange: number;
  validFrom: string;
  marketValue: number;
  justification: string;
  source: string;
  region: string;
  group: string; // For bar chart grouping (USA, EMEA, APAC, CEMAR, Gulf+, Basic Capital, etc.)
}

// Social scenario types
export interface SocialPost {
  id: string;
  date: string;
  user: string;
  location: string;
  platform: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  engagements: number;
  engagementsPL: number; // Plan
  engagementsPY: number; // Prior Year
  mentions: number;
  mentionsPL: number;
  mentionsPY: number;
  sentimentScore: number; // -1 to 1
}

export type SemanticRole = 'Time' | 'Entity' | 'Geography' | 'Category' | 'Measure' | 'Identifier';

/**
 * Represents a field in a data model, with its semantic role.
 */
export interface Field {
  /** The name of the field (e.g., "revenue", "store_name") */
  name: string;
  /** The semantic role of the field */
  role: SemanticRole;
  /** The data type of the field */
  dataType: 'string' | 'number' | 'Date' | 'boolean';
  /** Optional: A description for the field */
  description?: string;
  /** Optional: The DAX expression for a measure */
  expression?: string;
}

export type Scenario = 'Retail' | 'SaaS' | 'HR' | 'Logistics' | 'Social' | 'Portfolio' | 'Finance';
export type LayoutMode = 'Free' | 'Standard';
export type Archetype = 'Executive' | 'Diagnostic' | 'Operational';
export type CanvasMode = 'pbi' | 'whiteboard';

/**
 * Canvas annotation for whiteboard mode
 */
export interface CanvasAnnotation {
  id: string;
  type: 'sticky' | 'text' | 'arrow';
  x: number;      // Canvas pixels (not grid)
  y: number;
  width: number;
  height: number;
  content: string;
  color: string;  // Sticky note color
  fontSize?: number;
}

export type VisualType =
  | 'bar'
  | 'column'
  | 'stackedBar'
  | 'stackedColumn'
  | 'line'
  | 'area'
  | 'stackedArea'
  | 'combo'
  | 'map'
  | 'scatter'
  | 'pie'
  | 'donut'
  | 'treemap'
  | 'funnel'
  | 'gauge'
  | 'card'
  | 'kpi'
  | 'nudgeKpi'
  | 'multiRowCard'
  | 'table'
  | 'matrix'
  | 'waterfall'
  | 'slicer'
  | 'boxplot'
  | 'histogram'
  | 'violin'
  | 'regressionScatter'
  // Bar chart variants
  | 'groupedBar'
  | 'lollipop'
  | 'barbell'
  | 'diverging'
  // Line chart variants
  | 'slope'
  | 'lineForecast'
  | 'lineStepped'
  // Specialized visuals
  | 'bullet'
  | 'ribbon'
  // Map variants
  | 'mapBubble'
  | 'mapChoropleth'
  // Text/Layout visuals
  | 'textBox'
  | 'banner';

// Re-export visual props types
export type {
  PhantomPropsMap,
  PhantomPropsForType,
  PhantomVisualProps,
  AnyPhantomProps,
  BarChartPhantomProps,
  LineChartPhantomProps,
  AreaChartPhantomProps,
  ComboChartPhantomProps,
  PieChartPhantomProps,
  CardPhantomProps,
  NudgeKpiPhantomProps,
  SlicerPhantomProps,
  TablePhantomProps,
  MatrixPhantomProps,
  ScatterPhantomProps,
  GaugePhantomProps,
  TreemapPhantomProps,
  FunnelPhantomProps,
  WaterfallPhantomProps,
  MapPhantomProps,
} from './visual-props';

/**
 * Validation error for visual props
 */
export interface ValidationError {
  /** Field path that has the error (e.g., "dimension", "dataPoint.fill") */
  field: string;
  /** Error message */
  message: string;
  /** Error code for programmatic handling */
  code: 'INVALID_VALUE' | 'MISSING_REQUIRED' | 'FIELD_NOT_FOUND' | 'TYPE_MISMATCH';
}

/**
 * Validation warning for visual props
 */
export interface ValidationWarning {
  /** Field path that has the warning */
  field: string;
  /** Warning message */
  message: string;
  /** Warning code */
  code: 'ORPHANED_FIELD' | 'DEPRECATED' | 'UNSUPPORTED_EXPORT' | 'APPROXIMATION';
}

/**
 * Validation result for visual props
 */
export interface ValidationResult {
  /** Whether the props are valid */
  valid: boolean;
  /** Validation errors (prevent export if present) */
  errors: ValidationError[];
  /** Validation warnings (allow export but may not render correctly) */
  warnings: ValidationWarning[];
}

export interface DashboardItem<T extends VisualType = VisualType> {
  id: string;
  type: T;
  title: string;
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  /** Visual-specific props. Typed when T is specific, otherwise any for backward compat. */
  props?: T extends keyof import('./visual-props').PhantomPropsMap
    ? import('./visual-props').PhantomPropsMap[T]
    : Record<string, unknown>;
  /** Runtime validation state (populated by store on prop changes) */
  _validation?: ValidationResult;
  /**
   * Four Questions notes - freeform text documenting:
   * 1. Is it good or bad? (polarity, thresholds)
   * 2. By how much? (variance, comparison basis)
   * 3. Why? (drivers, drill paths)
   * 4. What action? (triggers, owner)
   */
  fourQuestionsNotes?: string;
}

export type DrillActionTargetType = 'view' | 'detailPanel' | 'modal' | 'entityProfile' | 'externalUrl';

export interface DrillActionContextMap {
  /** Source field or prop key from the clicked visual/table row */
  source: string;
  /** Target parameter/filter/entity key */
  target: string;
}

export interface DrillAction {
  id: string;
  sourceComponentId: string;
  trigger: 'click' | 'rowClick' | 'pointClick' | 'markClick';
  targetType: DrillActionTargetType;
  targetId: string;
  label: string;
  context: DrillActionContextMap[];
  preserveFilters: boolean;
  notes?: string;
}

export type DesignSourceType = 'phantomDefault' | 'figmaFrame' | 'figmaComponent' | 'screenshot' | 'externalReference';

export interface DesignSource {
  id: string;
  type: DesignSourceType;
  name: string;
  url?: string;
  frameId?: string;
  componentId?: string;
  notes?: string;
}

/**
 * Dashboard specification - captures requirements and context
 */
export interface DashboardSpecification {
  /** Business questions this dashboard answers */
  businessQuestions?: string;
  /** Data granularity level */
  grain?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  /** Source systems for the data */
  sourceSystems?: string;
  /** How often data refreshes */
  refreshCadence?: 'real-time' | 'daily' | 'weekly' | 'monthly' | 'on-demand';
  /** Who will use this dashboard */
  audience?: string;
  /** Decisions or actions the report should support */
  decisions?: string;
  /** Acceptance criteria for client sign-off or implementation QA */
  acceptanceCriteria?: string;
  /** Distribution method */
  distribution?: string;
  /** Current sign-off status */
  signOffStatus?: 'draft' | 'in-review' | 'approved';
  /** Build notes for developers */
  buildNotes?: string;
  /** Whether the project starts from Figma/design references or Phantom defaults */
  designEntryPoint?: 'figma-led' | 'phantom-led';
  /** Imported or linked design references */
  designSources?: DesignSource[];
}

export interface DashboardSnapshot {
  scenario: Scenario;
  items: DashboardItem[];
  drillActions?: DrillAction[];
  filters: Record<string, any>;
  layoutMode: LayoutMode;
  themePalette: string;
  /** Dashboard specification and requirements */
  specification?: DashboardSpecification;
  /** Annotations for whiteboard mode */
  annotations?: CanvasAnnotation[];
}

export interface DbDashboard {
  id: string;
  user_id: string;
  name: string;
  scenario: string;
  items: DashboardItem[];
  filters: Record<string, any>;
  layout_mode: string;
  theme_palette: string;
  is_public: boolean;
  share_id: string | null;
  created_at: string;
  updated_at: string;
  /** Dashboard specification (stored as JSON) */
  specification?: DashboardSpecification;
}

export interface HighlightState {
  dimension: string;
  values: Set<string>;
}

export type ExportMode = 'react' | 'powerBi';

export interface DashboardState {
  scenario: Scenario;
  stores: Store[];
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  subscriptions: Subscription[];
  employees: Employee[];
  shipments: Shipment[];
  financeRecords: FinanceRecord[];
  portfolioEntities: PortfolioEntity[];
  controversyScores: ControversyScore[];
  socialPosts: SocialPost[];
  filters: Record<string, any>;
  highlight: HighlightState | null;
  items: DashboardItem[];
  drillActions: DrillAction[];
  selectedItemId: string | null;
  layoutMode: LayoutMode;
  exportMode: ExportMode;
  selectedArchetype: Archetype;
  setScenario: (scenario: Scenario) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setExportMode: (mode: ExportMode) => void;
  setArchetype: (archetype: Archetype) => void;
  setFilter: (column: string, value: any) => void;
  setHighlight: (dimension: string, value: string, ctrlKey?: boolean) => void;
  clearHighlight: () => void;
  clearFilters: () => void;
  addItem: (item: DashboardItem) => void;
  removeItem: (id: string) => void;
  addDrillAction: (action: DrillAction) => void;
  updateDrillAction: (id: string, updates: Partial<DrillAction>) => void;
  removeDrillAction: (id: string) => void;
  updateLayout: (layout: any[]) => void;
  loadTemplate: (templateName: string) => void;
  selectItem: (id: string | null) => void;
  updateItemProps: (id: string, props: any) => void;
  updateItemTitle: (id: string, title: string) => void;
  updateItemNotes: (id: string, notes: string) => void;
  clearCanvas: () => void;
  // Specification
  specification: DashboardSpecification;
  updateSpecification: (spec: Partial<DashboardSpecification>) => void;
  // Persistence fields
  dashboardId: string | null;
  dashboardName: string;
  isPublic: boolean;
  shareId: string | null;
  isDirty: boolean;
  lastSavedAt: string | null;
  // Vega-Lite rendering mode
  useVegaRendering: boolean;
  setUseVegaRendering: (use: boolean) => void;
  // Cross-filtering toggle
  crossFilterEnabled: boolean;
  setCrossFilterEnabled: (enabled: boolean) => void;
  // Whiteboard mode state
  canvasMode: CanvasMode;
  canvasZoom: number;        // 0.25 to 2.0 (25% to 200%)
  canvasPanX: number;        // Horizontal offset in pixels
  canvasPanY: number;        // Vertical offset in pixels
  annotations: CanvasAnnotation[];
  selectedAnnotationId: string | null;
  // Whiteboard mode actions
  setCanvasMode: (mode: CanvasMode) => void;
  setCanvasZoom: (zoom: number) => void;
  setCanvasPan: (x: number, y: number) => void;
  resetCanvasView: () => void;
  addAnnotation: (annotation: CanvasAnnotation) => void;
  updateAnnotation: (id: string, updates: Partial<CanvasAnnotation>) => void;
  removeAnnotation: (id: string) => void;
  selectAnnotation: (id: string | null) => void;
  // Persistence actions
  setDashboardMeta: (meta: { id?: string | null; name?: string; isPublic?: boolean; shareId?: string | null }) => void;
  markDirty: () => void;
  markClean: () => void;
  loadDashboardFromDb: (db: DbDashboard) => void;
  getSerializableState: () => DashboardSnapshot;
  resetToNew: () => void;
}
