export type ThemeId = 'light' | 'dark' | 'green' | 'gray'

export interface Theme {
  id: ThemeId
  name: string
  description: string
  preview: {
    bg: string
    sidebar: string
    card: string
    accent: string
    text: string
    subtext: string
    border: string
    hover: string
  }
  css: {
    '--bg': string
    '--bg-secondary': string
    '--card': string
    '--card-hover': string
    '--sidebar': string
    '--sidebar-active': string
    '--sidebar-text': string
    '--sidebar-subtext': string
    '--accent': string
    '--accent-hover': string
    '--accent-light': string
    '--text': string
    '--text-secondary': string
    '--text-muted': string
    '--border': string
    '--border-light': string
    '--topbar': string
    '--success': string
    '--danger': string
    '--warning': string
  }
}

export const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Professional Light',
    description: 'Clean and professional. Ideal for consultants, agencies, and service providers.',
    preview: {
      bg: '#F9FAFB',
      sidebar: '#111827',
      card: '#FFFFFF',
      accent: '#7C3AED',
      text: '#111827',
      subtext: '#6B7280',
      border: '#F3F4F6',
      hover: '#F5F3FF',
    },
    css: {
      '--bg': '#F9FAFB',
      '--bg-secondary': '#F3F4F6',
      '--card': '#FFFFFF',
      '--card-hover': '#FAFAFA',
      '--sidebar': '#111827',
      '--sidebar-active': '#7C3AED',
      '--sidebar-text': '#9CA3AF',
      '--sidebar-subtext': '#6B7280',
      '--accent': '#7C3AED',
      '--accent-hover': '#6D28D9',
      '--accent-light': '#EDE9FE',
      '--text': '#111827',
      '--text-secondary': '#374151',
      '--text-muted': '#6B7280',
      '--border': '#F3F4F6',
      '--border-light': '#E5E7EB',
      '--topbar': '#FFFFFF',
      '--success': '#22C55E',
      '--danger': '#EF4444',
      '--warning': '#F59E0B',
    },
  },
  {
    id: 'dark',
    name: 'Executive Dark',
    description: 'High contrast dark mode. Premium feel for power users and founders.',
    preview: {
      bg: '#162272',
      sidebar: '#111827',
      card: '#1a2a8a',
      accent: '#818CF8',
      text: '#F1F5F9',
      subtext: '#94A3B8',
      border: '#1e32a0',
      hover: '#1e2d9c',
    },
    css: {
      '--bg': '#0F172A',
      '--bg-secondary': '#1E293B',
      '--card': '#1E293B',
      '--card-hover': '#263244',
      '--sidebar': '#020617',
      '--sidebar-active': '#818CF8',
      '--sidebar-text': '#64748B',
      '--sidebar-subtext': '#475569',
      '--accent': '#818CF8',
      '--accent-hover': '#6366F1',
      '--accent-light': '#1E1B4B',
      '--text': '#F1F5F9',
      '--text-secondary': '#CBD5E1',
      '--text-muted': '#94A3B8',
      '--border': '#1E293B',
      '--border-light': '#334155',
      '--topbar': '#0F172A',
      '--success': '#34D399',
      '--danger': '#F87171',
      '--warning': '#FBBF24',
    },
  },
  {
    id: 'green',
    name: 'Growth Green',
    description: 'Action-oriented with green accents. Built for growth-focused entrepreneurs.',
    preview: {
      bg: '#F0FDF4',
      sidebar: '#14532D',
      card: '#FFFFFF',
      accent: '#16A34A',
      text: '#14532D',
      subtext: '#6B7280',
      border: '#DCFCE7',
      hover: '#F0FDF4',
    },
    css: {
      '--bg': '#F0FDF4',
      '--bg-secondary': '#DCFCE7',
      '--card': '#FFFFFF',
      '--card-hover': '#F7FEF9',
      '--sidebar': '#14532D',
      '--sidebar-active': '#16A34A',
      '--sidebar-text': '#86EFAC',
      '--sidebar-subtext': '#4ADE80',
      '--accent': '#16A34A',
      '--accent-hover': '#15803D',
      '--accent-light': '#DCFCE7',
      '--text': '#14532D',
      '--text-secondary': '#166534',
      '--text-muted': '#6B7280',
      '--border': '#DCFCE7',
      '--border-light': '#BBF7D0',
      '--topbar': '#FFFFFF',
      '--success': '#16A34A',
      '--danger': '#EF4444',
      '--warning': '#F59E0B',
    },
  },
  {
    id: 'gray',
    name: 'Slate Gray',
    description: 'Neutral and sophisticated. A calm gray palette for focused, distraction-free work.',
    preview: {
      bg: '#F8FAFC',
      sidebar: '#334155',
      card: '#FFFFFF',
      accent: '#7C3AED',
      text: '#1E293B',
      subtext: '#64748B',
      border: '#E2E8F0',
      hover: '#F1F5F9',
    },
    css: {
      '--bg': '#F8FAFC',
      '--bg-secondary': '#F1F5F9',
      '--card': '#FFFFFF',
      '--card-hover': '#F8FAFC',
      '--sidebar': '#334155',
      '--sidebar-active': '#7C3AED',
      '--sidebar-text': '#94A3B8',
      '--sidebar-subtext': '#64748B',
      '--accent': '#7C3AED',
      '--accent-hover': '#6D28D9',
      '--accent-light': '#EDE9FE',
      '--text': '#1E293B',
      '--text-secondary': '#334155',
      '--text-muted': '#64748B',
      '--border': '#E2E8F0',
      '--border-light': '#CBD5E1',
      '--topbar': '#FFFFFF',
      '--success': '#22C55E',
      '--danger': '#EF4444',
      '--warning': '#F59E0B',
    },
  },
]

export const DEFAULT_THEME: ThemeId = 'light'

export function getTheme(id: ThemeId): Theme {
  return THEMES.find(t => t.id === id) || THEMES[0]
}
