"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { DEFAULT_THEME, STORAGE_KEY, getThemeMeta, type ThemeId } from "./themes"

type ThemeContextValue = {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
  /** True for the brief transition window after a theme change (for glitch/flash FX). */
  transitioning: boolean
  /** Toast text shown after switching, or null. */
  toast: string | null
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME)
  const [transitioning, setTransitioning] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load saved theme once on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
      if (saved && ["win95", "y2k", "minimal", "terminal"].includes(saved)) {
        setThemeState(saved)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  // Keep the document element's data-theme in sync so global CSS can react.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const setTheme = useCallback(
    (id: ThemeId) => {
      setThemeState((prev) => {
        if (prev === id) return prev
        try {
          localStorage.setItem(STORAGE_KEY, id)
        } catch {
          // ignore
        }

        // Brief transition flash/glitch.
        setTransitioning(true)
        if (transTimer.current) clearTimeout(transTimer.current)
        transTimer.current = setTimeout(() => setTransitioning(false), 450)

        // Toast notification.
        setToast(`ERA CHANGED: ${getThemeMeta(id).name.toUpperCase()}`)
        if (toastTimer.current) clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), 2600)

        return id
      })
    },
    [],
  )

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
      if (transTimer.current) clearTimeout(transTimer.current)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, transitioning, toast }}>
      {children}
    </ThemeContext.Provider>
  )
}
