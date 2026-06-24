/**
 * ThemeContext.tsx
 * 放置路徑：src/ThemeContext.tsx
 *
 * 全域主題狀態
 * 'hacker'  = 開發者硬核風（預設）
 * 'default' = 原版 light 設計
 */

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'hacker' | 'default'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'default',
  toggleTheme: () => {},
})

// 系列 @archlens/tokens 主題包：Web 的 'default'（淺色）對應 al-theme-light，
// 'hacker' 對應 al-theme-hacker。輕觸整合——既有主題元件不變，只同步 <html> 的
// class，讓共用 token / 未來共用元件對齊。預設 Light、不持久化（與系列慣例一致）。
const THEME_CLASS: Record<Theme, string> = {
  default: 'al-theme-light',
  hacker: 'al-theme-hacker',
}
const ALL_THEME_CLASSES = ['al-theme-light', 'al-theme-blueprint', 'al-theme-hacker']

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('default')
  const toggleTheme = () =>
    setTheme(prev => (prev === 'hacker' ? 'default' : 'hacker'))

  useEffect(() => {
    const el = document.documentElement
    el.classList.remove(...ALL_THEME_CLASSES)
    el.classList.add(THEME_CLASS[theme])
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
