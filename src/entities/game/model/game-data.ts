export type EventId = "NORMAL" | "GRAVITY_FAILURE" | "INVERSION" | "BUREAUCRACY"

export type GameEvent = {
  id: EventId
  label: string
  duration: number // seconds
  blurb: string
}

export const EVENTS: Record<Exclude<EventId, "NORMAL">, GameEvent> = {
  GRAVITY_FAILURE: {
    id: "GRAVITY_FAILURE",
    label: "GRAVITY FAILURE",
    duration: 15,
    blurb: "Workplace gravity license expired. The egg is fleeing. Click responsibly.",
  },
  INVERSION: {
    id: "INVERSION",
    label: "INVERSION",
    duration: 12,
    blurb: "Reality.dll returned a negative value. Everything is upside-down and clicks DEDUCT.",
  },
  BUREAUCRACY: {
    id: "BUREAUCRACY",
    label: "BUREAUCRACY",
    duration: 20,
    blurb: "A mandatory User Agreement must be accepted before further egg interaction.",
  },
}

// Absurd multi-lingual usernames for the simulated crowd.
export const FAKE_USERS = [
  "Грустный Пельмень",
  "Токсичный Кактус",
  "xX_MiddleManager_Xx",
  "Clippy_Lives",
  "归档大师",
  "BlueScreenBarry",
  "Соседский Кот",
  "CtrlAltDefeat",
  "Madame_Spreadsheet",
  "おにぎり_99",
  "DialUpDave",
  "Synergy_Sandra",
  "Гусь_Менеджер",
  "404_Brain",
  "PivotTablePete",
  "Quarterly_Greg",
  "СонныйАдминистратор",
  "TabsNotSpaces",
  "Boss_Felix",
  "WingDingWanda",
]

export const EMOTES = ["🧊", "🔥", "🍅", "💣", "🎉", "👻"] as const
export type Emote = (typeof EMOTES)[number]

// Hex codepoint labels for the Terminal theme emote buttons.
export const EMOTE_HEX: Record<string, string> = {
  "🧊": "0x1F9CA",
  "🔥": "0x1F525",
  "🍅": "0x1F345",
  "💣": "0x1F4A3",
  "🎉": "0x1F389",
  "👻": "0x1F47B",
}

// ----- Universal full-screen "chaos" overlays (theme-agnostic) -----
export type OverlayId =
  | "BSOD" // Win95 blue screen of death (~1s)
  | "MAINTENANCE" // 503 Service Unavailable (~5s)
  | "INFINITE_LOOP" // recursive tunnel (~3s)
  | "SCREAMER_STOP" // red flash "STOP CLICKING" (~0.5s)
  | "SCREAMER_WHY" // minimal "WHY ARE YOU DOING THIS?" (~2s)
  | "CRASH" // fake "Not Responding" overlay (~2.5s)
  | "BREACH" // terminal "SYSTEM BREACH" (~1.4s)

export const OVERLAY_DURATION: Record<OverlayId, number> = {
  BSOD: 1100,
  MAINTENANCE: 5000,
  INFINITE_LOOP: 3000,
  SCREAMER_STOP: 600,
  SCREAMER_WHY: 2000,
  CRASH: 2600,
  BREACH: 1400,
}

// Fake Windows error dialogs (Win95 theme).
export const WINDOWS_ERRORS = [
  { code: "EGG_NOT_FOUND", msg: "The egg could not be located. It may have been moved or deleted." },
  { code: "CLICK_OVERFLOW", msg: "Click buffer exceeded maximum capacity (255). Please click less." },
  { code: "0x000000EGG", msg: "A fatal exception 0E has occurred at 0028:C001EGG7 in module YOLK.DLL." },
  { code: "MORALE.SYS", msg: "MORALE.SYS is not responding. Productivity will continue regardless." },
  { code: "MEETING_REQUIRED", msg: "This action requires a meeting. A meeting has been scheduled about the meeting." },
]

// Calm/zen messages (Minimal theme), shown every 50 clicks.
export const ZEN_CALM = [
  "You are doing great.",
  "Breathe. The egg is grateful.",
  "Progress is a gentle spiral.",
  "Be present with the egg.",
  "You are exactly where you need to be.",
  "Each click, a small kindness.",
]

export const ACTIONS = [
  "clicked the egg",
  "clicked aggressively",
  "filed a TPS report",
  "double-clicked (illegal)",
  "questioned the egg",
  "achieved synergy",
  "rage-clicked",
  "blamed the intern",
  "scheduled a meeting about the egg",
  "yelled into the void",
  "minimized reality",
  "rebooted their morale",
]

// ----- Egg evolution system -----
// Player-click thresholds that trigger each evolution phase.
export const EGG_MILESTONES = [100, 500, 1000] as const

// Per-phase dramatic announcement copy (theme-agnostic headline + flavor).
export const EGG_PHASE_LABELS = [
  "EGG ONLINE",
  "EGG EVOLUTION: PHASE 1",
  "EGG EVOLUTION: PHASE 2",
  "EGG EVOLUTION: PHASE 3",
] as const

// Returns the current phase (0-3) for a given player-click count.
export function eggPhaseFor(clicks: number): 0 | 1 | 2 | 3 {
  if (clicks >= EGG_MILESTONES[2]) return 3
  if (clicks >= EGG_MILESTONES[1]) return 2
  if (clicks >= EGG_MILESTONES[0]) return 1
  return 0
}

// Egg "integrity" — degrades from 100% toward 0% as the next milestone nears.
// At the final phase it stays at 0% (CRITICAL).
export function eggIntegrityFor(clicks: number): number {
  if (clicks >= EGG_MILESTONES[2]) return 0
  const lower = clicks >= EGG_MILESTONES[1] ? EGG_MILESTONES[1] : clicks >= EGG_MILESTONES[0] ? EGG_MILESTONES[0] : 0
  const upper = clicks >= EGG_MILESTONES[1] ? EGG_MILESTONES[2] : clicks >= EGG_MILESTONES[0] ? EGG_MILESTONES[1] : EGG_MILESTONES[0]
  const progress = (clicks - lower) / (upper - lower)
  return Math.max(0, Math.round(100 - progress * 100))
}

// Terminal-era ASCII egg art, one variant per evolution phase.
export const ASCII_EGGS: [string, string, string, string] = [
  `   .oOo.
  o     o
 o       o
 o       o
  o     o
   'oOo'`,
  `  .o@Oo.
 o@OoO@o
o@O@o@O@o
o@OoO@oO@o
 o@OoO@o
  'o@O'`,
  `  .#%@*.
 %@*#@%*o
*@%#*@o%@#
@*%o#@%*@o
 #@*%o@#
  '*@#'`,
  `  10110
 1[####]0
0[##0##]1
1[#1#0#]0
 0[####]1
  10010`,
]

export function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Format a number as a padded uppercase hex string, e.g. 20266 -> "0x004F2A".
export function toHex(n: number, pad = 6) {
  const sign = n < 0 ? "-" : ""
  return `${sign}0x${Math.abs(n).toString(16).toUpperCase().padStart(pad, "0")}`
}

export function nowStamp() {
  const d = new Date()
  const p = (n: number) => n.toString().padStart(2, "0")
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

const GLITCH_CHARS = "@#$%&!?*░▒▓█▄▀×§¶".split("")

export function glitchText(text: string, intensity = 0.18) {
  return text
    .split("")
    .map((ch) => (ch !== " " && Math.random() < intensity ? randomFrom(GLITCH_CHARS) : ch))
    .join("")
}
