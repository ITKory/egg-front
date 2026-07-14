export type EventId = "NORMAL" | "GRAVITY_FAILURE" | "INVERSION" | "BUREAUCRACY"

export type GameEvent = {
  id: EventId
  label: string
  duration: number
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
    duration: 10,
    blurb: "Reality.dll returned a negative value. Everything feels suspiciously inverted.",
  },
  BUREAUCRACY: {
    id: "BUREAUCRACY",
    label: "BUREAUCRACY",
    duration: 20,
    blurb: "A mandatory User Agreement must be accepted before further egg interaction.",
  },
}

export const EMOTES = ["🧊", "🔥", "🍅", "💣", "🎉", "👻"] as const
export type Emote = (typeof EMOTES)[number]
export type ScreenEmote = { id: number; emote: string; user: string }

export type OverlayId =
  | "BSOD"
  | "MAINTENANCE"
  | "INFINITE_LOOP"
  | "SCREAMER_STOP"
  | "SCREAMER_WHY"
  | "CRASH"
  | "BREACH"

export const OVERLAY_DURATION: Record<OverlayId, number> = {
  BSOD: 1100,
  MAINTENANCE: 5000,
  INFINITE_LOOP: 3000,
  SCREAMER_STOP: 600,
  SCREAMER_WHY: 2000,
  CRASH: 2600,
  BREACH: 1400,
}

export const WINDOWS_ERRORS = [
  { code: "EGG_NOT_FOUND", msg: "The egg could not be located. It may have been moved or deleted." },
  { code: "CLICK_OVERFLOW", msg: "Click buffer exceeded maximum capacity (255). Please click less." },
  { code: "0x000000EGG", msg: "A fatal exception 0E has occurred at 0028:C001EGG7 in module YOLK.DLL." },
  { code: "MORALE.SYS", msg: "MORALE.SYS is not responding. Productivity will continue regardless." },
  { code: "MEETING_REQUIRED", msg: "This action requires a meeting. A meeting has been scheduled about the meeting." },
]

export const ZEN_CALM = [
  "You are doing great.",
  "Breathe. The egg is grateful.",
  "Progress is a gentle spiral.",
  "Be present with the egg.",
  "You are exactly where you need to be.",
  "Each click, a small kindness.",
]

export const EGG_MILESTONES = [1000, 2000, 4000] as const
export const INITIAL_EGG_LIFE = EGG_MILESTONES[0]

export const EGG_PHASE_LABELS = [
  "EGG ONLINE",
  "EGG EVOLUTION: PHASE 1",
  "EGG EVOLUTION: PHASE 2",
  "EGG EVOLUTION: PHASE 3",
] as const

export function eggPhaseFor(clicks: number): 0 | 1 | 2 | 3 {
  if (clicks >= EGG_MILESTONES[2]) return 3
  if (clicks >= EGG_MILESTONES[1]) return 2
  if (clicks >= EGG_MILESTONES[0]) return 1
  return 0
}

export function eggIntegrityFor(clicks: number): number {
  const safeClicks = Math.max(0, Math.floor(clicks))
  let lower = 0
  let upper = INITIAL_EGG_LIFE

  while (safeClicks >= upper) {
    lower = upper
    upper *= 2
  }

  const progress = (safeClicks - lower) / (upper - lower)
  return Math.max(0, Math.min(100, Math.round(100 - progress * 100)))
}

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
