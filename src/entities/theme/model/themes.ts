export type ThemeId = "win95" | "y2k" | "minimal" | "terminal"

export type ThemeMeta = {
  id: ThemeId
  name: string
  year: string
  tagline: string
  /** Click count at which this era would unlock in the future progression system. */
  unlockAt: number
  /** Whether this era is currently locked (all false for now). */
  locked: boolean
}

export const THEMES: ThemeMeta[] = [
  {
    id: "win95",
    name: "Corporate Era",
    year: "1995",
    tagline: "Beige. Beveled. Bureaucratic.",
    unlockAt: 0,
    locked: false,
  },
  {
    id: "y2k",
    name: "Millennium Bug Era",
    year: "2000",
    tagline: "Chrome, sparkles & impending doom.",
    unlockAt: 10000,
    locked: false,
  },
  {
    id: "minimal",
    name: "AI Era",
    year: "2024",
    tagline: "Sleek neural interface. Transcendent egg.",
    unlockAt: 50000,
    locked: false,
  },
  {
    id: "terminal",
    name: "System Override",
    year: "????",
    tagline: "wake up, clicker.",
    unlockAt: 100000,
    locked: false,
  },
]

export const DEFAULT_THEME: ThemeId = "win95"
export const STORAGE_KEY = "eggcorp-theme"

export function getThemeMeta(id: ThemeId): ThemeMeta {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
