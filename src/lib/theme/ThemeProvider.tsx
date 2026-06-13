'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { THEMES, DEFAULT_THEME, getTheme, type ThemeId } from './themes'

interface ThemeContextType {
  themeId: ThemeId
  setTheme: (id: ThemeId) => Promise<void>
}

const ThemeContext = createContext<ThemeContextType>({
  themeId: DEFAULT_THEME,
  setTheme: async () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: ThemeId
}

export function ThemeProvider({ children, initialTheme = DEFAULT_THEME }: ThemeProviderProps) {
  const supabase = createClient()
  const [themeId, setThemeId] = useState<ThemeId>(initialTheme)

  // Apply CSS variables to :root whenever theme changes
  useEffect(() => {
    const theme = getTheme(themeId)
    const root = document.documentElement
    Object.entries(theme.css).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    root.setAttribute('data-theme', themeId)
    localStorage.setItem('amana-theme', themeId)
  }, [themeId])

  // Load theme from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem('amana-theme') as ThemeId | null
    if (stored && THEMES.find(t => t.id === stored)) {
      setThemeId(stored)
    }
  }, [])

  const setTheme = async (id: ThemeId) => {
    setThemeId(id)
    // Persist to Supabase user metadata
    try {
      await supabase.auth.updateUser({ data: { theme: id } })
    } catch {
      // Non-critical — localStorage already saved it
    }
  }

  return (
    <ThemeContext.Provider value={{ themeId, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
