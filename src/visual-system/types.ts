export type VisualSort = 'desc' | 'asc' | 'alpha' | 'none';

export interface VisualDataSpec {
  dimensions?: string[];
  measures?: string[];
  series?: string;
  colorBy?: string;
  date?: string;
  facetBy?: string;
  sort?: VisualSort;
  limit?: number | 'All';
  showOther?: boolean;
  filters?: Record<string, unknown>;
}

export interface PreparedVisualDatum {
  key: string;
  label: string;
  value: number;
  formattedValue: string;
  isOther?: boolean;
  isMissing?: boolean;
  values?: Record<string, number | string | Date | null>;
}

export interface PreparedVisualData {
  rows: PreparedVisualDatum[];
  total: number;
  min: number;
  max: number;
  missingCount: number;
  meta: {
    dimension?: string;
    metric?: string;
    limit?: number | 'All';
    sort?: VisualSort;
    showOther: boolean;
  };
}

export interface VisualTheme {
  name: string;
  fontFamily: string;
  colors: {
    background: string;
    surface: string;
    ink: string;
    muted: string;
    subtle: string;
    grid: string;
    border: string;
    primary: string;
    primaryMuted: string;
    positive: string;
    negative: string;
    warning: string;
    categorical: string[];
    mutedCategorical: string[];
    sequential: string[];
    diverging: string[];
  };
  typography: {
    axis: number;
    label: number;
    value: number;
    title: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  plot: {
    gridOpacity: number;
    axisOpacity: number;
    markOpacity: number;
    labelColor: string;
  };
}

