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
import { DEFAULT_THEME, STORAGE_KEY, THEMES, getThemeMeta, type ThemeId } from "./themes"

type ThemeContextValue = {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
  transitioning: boolean
  toast: string | null
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSavedTheme(): ThemeId | null {
  if (typeof window === "undefined") return null

  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeId | null
    return saved && THEMES.some((themeMeta) => themeMeta.id === saved) ? saved : null
  } catch {
    return null
  }
}

function saveTheme(id: ThemeId) {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    return
  }
}

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

  useEffect(() => {
    let cancelled = false

    queueMicrotask(() => {
      const saved = getSavedTheme()
      if (!cancelled && saved) setThemeState(saved)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  const setTheme = useCallback(
    (id: ThemeId) => {
      setThemeState((prev) => {
        if (prev === id) return prev
        saveTheme(id)

        setTransitioning(true)
        if (transTimer.current) clearTimeout(transTimer.current)
        transTimer.current = setTimeout(() => setTransitioning(false), 450)

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
