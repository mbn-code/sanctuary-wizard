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
      primary: '#D63447',
      secondary: '#F7CAC9',
      accent: '#FF5E78',
      bg: '#FFF5E1',
      text: '#1F2937',
      soft: '#6B7280'
    },
    icon: 'heart',
    font: 'elegant'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Star',
    colors: {
      primary: '#6366F1',
      secondary: '#1E1B4B',
      accent: '#818CF8',
      bg: '#0F172A',
      text: '#F8FAFC',
      soft: '#94A3B8'
    },
    icon: 'star',
    font: 'modern'
  },
  celebration: {
    id: 'celebration',
    name: 'Golden Party',
    colors: {
      primary: '#F59E0B',
      secondary: '#FEF3C7',
      accent: '#D97706',
      bg: '#FFFBEB',
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
      primary: '#10B981',
      secondary: '#D1FAE5',
      accent: '#059669',
      bg: '#F0FDF4',
      text: '#064E3B',
      soft: '#065F46'
    },
    icon: 'star',
    font: 'modern'
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
