export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    primary: string; // The "Red" replacement
    secondary: string; // The "Pink" replacement
    accent: string; // Extra pop
    bg: string; // The "Cream" replacement
    text: string;
    soft: string;
  };
  icon: string; // 'heart', 'star', 'cake', 'gift'
}

export const THEMES: Record<string, ThemePreset> = {
  valentine: {
    id: 'valentine',
    name: 'Classic Valentine',
    colors: {
      primary: '#D63447',
      secondary: '#F7CAC9',
      accent: '#FF5E78',
      bg: '#FFF5E1',
      text: '#1F2937',
      soft: '#6B7280'
    },
    icon: 'heart'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Elegance',
    colors: {
      primary: '#6366F1',
      secondary: '#1E1B4B',
      accent: '#818CF8',
      bg: '#0F172A',
      text: '#F8FAFC',
      soft: '#94A3B8'
    },
    icon: 'star'
  },
  sunshine: {
    id: 'sunshine',
    name: 'Golden Hour',
    colors: {
      primary: '#F59E0B',
      secondary: '#FEF3C7',
      accent: '#D97706',
      bg: '#FFFBEB',
      text: '#451A03',
      soft: '#92400E'
    },
    icon: 'star'
  },
  forest: {
    id: 'forest',
    name: 'Deep Forest',
    colors: {
      primary: '#10B981',
      secondary: '#D1FAE5',
      accent: '#059669',
      bg: '#F0FDF4',
      text: '#064E3B',
      soft: '#065F46'
    },
    icon: 'star'
  },
  lavender: {
    id: 'lavender',
    name: 'Soft Lavender',
    colors: {
      primary: '#8B5CF6',
      secondary: '#EDE9FE',
      accent: '#7C3AED',
      bg: '#F5F3FF',
      text: '#4C1D95',
      soft: '#5B21B6'
    },
    icon: 'heart'
  }
};

export const DEFAULT_THEME = THEMES.valentine;
