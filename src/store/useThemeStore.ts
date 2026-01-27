import { create } from 'zustand';

export interface ColorPalette {
  name: string;
  colors: string[];
}

export const PALETTES: ColorPalette[] = [
  {
    name: 'Power BI Default',
    colors: ['#0078D4', '#00BCF2', '#00B294', '#FFB900', '#D83B01', '#B4009E', '#5C2D91', '#008272'],
  },
  {
    name: 'Ocean',
    colors: ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'],
  },
  {
    name: 'Forest',
    colors: ['#2D5A27', '#4A7C43', '#6B9E5F', '#8BBF7A', '#107C10', '#498205', '#7FBA00', '#BAD80A'],
  },
  {
    name: 'Sunset',
    colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#6BCB77', '#4D96FF', '#9B59B6', '#E74C3C', '#F39C12'],
  },
  {
    name: 'Monochrome',
    colors: ['#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc'],
  },
  {
    name: 'Corporate',
    colors: ['#003366', '#006699', '#0099CC', '#00CCFF', '#336699', '#6699CC', '#99CCFF', '#CCE5FF'],
  },
  {
    name: 'Zebra (IBCS)',
    colors: ['#333333', '#999999', '#D0021B', '#417505', '#000000', '#CCCCCC', '#FFFFFF', '#000000'],
  },
  {
    name: 'Social',
    colors: ['#7B5EA7', '#26C6DA', '#FFB300', '#9575CD', '#4DD0E1', '#FF8A65', '#81C784', '#F06292'],
  },
  {
    name: 'Portfolio',
    colors: ['#D4A548', '#C08930', '#E5A645', '#EDBE6A', '#F5D79E', '#B87A2B', '#A66B1F', '#8B5A1B'],
  },
];

interface ThemeState {
  activePalette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
  getColor: (index: number) => string;
  highlightColor: string;
  setHighlightColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  activePalette: PALETTES[0],
  highlightColor: '#004578',
  setPalette: (palette) => set({ activePalette: palette }),
  setHighlightColor: (color) => set({ highlightColor: color }),
  getColor: (index) => {
    const { activePalette } = get();
    return activePalette.colors[index % activePalette.colors.length];
  },
}));
