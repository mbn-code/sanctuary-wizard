export interface ThemePreset {
  id: string;
  name: string;
  colors: {
    primary: string; 
    secondary: string;
    accent: string;
    bg: string;
    text: string;
    soft: string;
  };
  icon: 'heart' | 'star' | 'cake' | 'gift' | 'moon' | 'sun' | 'bell' | 'sparkles' | 'award';
  font: 'elegant' | 'modern' | 'playful';
}

export const THEMES: Record<string, ThemePreset> = {
  classic: {
    id: 'classic',
    name: 'Romantic Blush',
    colors: {
      primary: '#9D2B38', // Muted Deep Crimson
      secondary: '#F3D2D2', // Soft Rose Mist
      accent: '#C44D58',
      bg: '#FFFBF5', // Warm Cream
      text: '#111827',
      soft: '#6B7280'
    },
    icon: 'heart',
    font: 'elegant'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Star',
    colors: {
      primary: '#4F46E5', // Muted Indigo
      secondary: '#111827', // Deep Night
      accent: '#6366F1',
      bg: '#030712', // Pure Black-Blue
      text: '#F8FAFC',
      soft: '#475569'
    },
    icon: 'star',
    font: 'modern'
  },
  celebration: {
    id: 'celebration',
    name: 'Golden Party',
    colors: {
      primary: '#B45309', // Deep Amber
      secondary: '#FEF3C7',
      accent: '#D97706',
      bg: '#FFFDF5',
      text: '#451A03',
      soft: '#92400E'
    },
    icon: 'cake',
    font: 'playful'
  },
  forest: {
    id: 'forest',
    name: 'Evergreen',
    colors: {
      primary: '#065F46', // Deep Forest
      secondary: '#D1FAE5',
      accent: '#047857',
      bg: '#F8FAF9',
      text: '#064E3B',
      soft: '#065F46'
    },
    icon: 'star',
    font: 'elegant'
  },
  lavender: {
    id: 'lavender',
    name: 'Soft Lavender',
    colors: {
      primary: '#6D28D9', // Muted Violet
      secondary: '#F5F3FF',
      accent: '#7C3AED',
      bg: '#FAF5FF',
      text: '#4C1D95',
      soft: '#5B21B6'
    },
    icon: 'heart',
    font: 'elegant'
  },
  minimalist: {
    id: 'minimalist',
    name: 'Wedding Slate',
    colors: {
      primary: '#334155',
      secondary: '#F1F5F9',
      accent: '#94A3B8',
      bg: '#FFFFFF',
      text: '#0F172A',
      soft: '#64748B'
    },
    icon: 'sparkles',
    font: 'elegant'
  },
  advent: {
    id: 'advent',
    name: 'Christmas Magic',
    colors: {
      primary: '#166534',
      secondary: '#FEE2E2',
      accent: '#991B1B',
      bg: '#FAFAFA',
      text: '#064E3B',
      soft: '#450A0A'
    },
    icon: 'bell',
    font: 'elegant'
  }
};

export const DEFAULT_THEME = THEMES.classic;
