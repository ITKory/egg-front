"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  ACTIONS,
  EGG_PHASE_LABELS,
  EMOTES,
  EVENTS,
  FAKE_USERS,
  OVERLAY_DURATION,
  WINDOWS_ERRORS,
  ZEN_CALM,
  type EventId,
  type OverlayId,
  eggIntegrityFor,
  eggPhaseFor,
  nowStamp,
  randomFrom,
} from "@/entities/game"
import { useTheme } from "@/entities/theme"
import { sfx, setMuted as setSfxMuted } from "@/shared/lib/sounds"

export type TickerMessage = {
  id: number
  time: string
  user: string
  text: string
  system?: boolean
}

export type LeaderRow = { name: string; clicks: number; you?: boolean }
export type WinError = { id: number; code: string; msg: string }
export type ZenMessage = { id: number; text: string; scary: boolean }

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
]

let msgId = 0
let errId = 0

export function useChaosGame() {
  const { theme } = useTheme()
  const themeRef = useRef(theme)
  themeRef.current = theme

  const [clicks, setClicks] = useState(48273)
  const [event, setEvent] = useState<EventId>("NORMAL")
  const [eventTimeLeft, setEventTimeLeft] = useState(0)
  const [ticker, setTicker] = useState<TickerMessage[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([])
  const [muted, setMuted] = useState(false)
  const [chaosMode, setChaosMode] = useState(false)
  const [bureaucracyOpen, setBureaucracyOpen] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [milestoneKey, setMilestoneKey] = useState(0)
  const [clickPulse, setClickPulse] = useState(0)

  // ---- Egg evolution ----
  const [eggClicks, setEggClicks] = useState(0)
  const [eggEvolution, setEggEvolution] = useState<{ id: number; phase: number } | null>(null)
  const prevEggPhase = useRef(0)
  const evoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ---- Universal chaos / screamer effects ----
  const [overlay, setOverlay] = useState<OverlayId | null>(null)
  const [winError, setWinError] = useState<WinError | null>(null)
  const [flicker, setFlicker] = useState(false)
  const [zenMessage, setZenMessage] = useState<ZenMessage | null>(null)
  const [eggEscape, setEggEscape] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const eventRef = useRef(event)
  eventRef.current = event
  const clicksRef = useRef(clicks)
  clicksRef.current = clicks
  const overlayRef = useRef(overlay)
  overlayRef.current = overlay
  const lastMilestone = useRef(Math.floor(clicks / 1000))

  const playerClicks = useRef(0)
  const nextScreamer = useRef(200 + Math.floor(Math.random() * 300))
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pushTicker = useCallback((user: string, text: string, system = false) => {
    setTicker((prev) => {
      const next = [...prev, { id: msgId++, time: nowStamp(), user, text, system }]
      return next.slice(-60)
    })
  }, [])

  // Seed leaderboard once
  useEffect(() => {
    const rows: LeaderRow[] = FAKE_USERS.slice(0, 9).map((name) => ({
      name,
      clicks: Math.floor(2000 + Math.random() * 9000),
    }))
    rows.push({ name: "YOU", clicks: 1240, you: true })
    rows.sort((a, b) => b.clicks - a.clicks)
    setLeaderboard(rows)
    pushTicker("SYSTEM", "EGGCORP PORTAL v3.1 initialized. Welcome, employee.", true)
  }, [pushTicker])

  const triggerShake = useCallback(() => setShakeKey((k) => k + 1), [])

  const showNotice = useCallback((text: string, ms = 2600) => {
    setNotice(text)
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(null), ms)
  }, [])

  // ---- Overlay controller ----
  const showOverlay = useCallback(
    (id: OverlayId) => {
      if (overlayRef.current) return
      setOverlay(id)
      if (id === "BSOD" || id === "CRASH") sfx.crash()
      else if (id === "MAINTENANCE") sfx.offline()
      else if (id === "SCREAMER_STOP" || id === "SCREAMER_WHY") sfx.screamer()
      else if (id === "BREACH") sfx.chaos()
      if (id !== "SCREAMER_STOP") triggerShake()
      if (overlayTimer.current) clearTimeout(overlayTimer.current)
      overlayTimer.current = setTimeout(() => {
        setOverlay(null)
        // Minimal theme: apologize after the WHY screamer.
        if (id === "SCREAMER_WHY") {
          setZenMessage({ id: errId++, text: "Sorry, system glitch.", scary: false })
          setTimeout(() => setZenMessage(null), 3200)
        }
      }, OVERLAY_DURATION[id])
    },
    [triggerShake],
  )

  // ---- Mute wiring ----
  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m
      setSfxMuted(next)
      return next
    })
  }, [])

  // ---- Start a status event ----
  const startEvent = useCallback(
    (id: Exclude<EventId, "NORMAL">) => {
      if (eventRef.current !== "NORMAL") return
      setEvent(id)
      setEventTimeLeft(EVENTS[id].duration)
      sfx.eventStart()
      triggerShake()
      pushTicker("SYSTEM", `EVENT TRIGGERED: ${EVENTS[id].label}`, true)
      if (id === "BUREAUCRACY") setBureaucracyOpen(true)
    },
    [pushTicker, triggerShake],
  )

  const endEvent = useCallback(() => {
    const ending = eventRef.current
    setEvent("NORMAL")
    setEventTimeLeft(0)
    setBureaucracyOpen(false)
    if (ending !== "NORMAL") {
      sfx.eventEnd()
      pushTicker("SYSTEM", `Threat neutralized. STATUS restored to NORMAL.`, true)
    }
  }, [pushTicker])

  // ---- Event countdown ----
  useEffect(() => {
    if (event === "NORMAL") return
    const t = setInterval(() => {
      setEventTimeLeft((s) => {
        if (s <= 1) {
          endEvent()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [event, endEvent])

  // ---- Random status-event scheduler ----
  useEffect(() => {
    const t = setInterval(() => {
      if (eventRef.current !== "NORMAL") return
      const roll = Math.random()
      const chance = chaosMode ? 0.5 : 0.22
      if (roll < chance) {
        const ids = Object.keys(EVENTS) as Array<Exclude<EventId, "NORMAL">>
        startEvent(randomFrom(ids))
      }
    }, 8000)
    return () => clearInterval(t)
  }, [startEvent, chaosMode])

  // ---- Egg-escape & infinite-loop scheduler (all themes) ----
  useEffect(() => {
    const t = setInterval(() => {
      if (overlayRef.current || eventRef.current !== "NORMAL") return
      const roll = Math.random()
      if (roll < 0.16) {
        // Egg escapes — flees the cursor for 10s
        setEggEscape(true)
        pushTicker("SYSTEM", "WARNING: egg has gained object permanence and is fleeing.", true)
        setTimeout(() => setEggEscape(false), 10000)
      } else if (roll < 0.24) {
        showOverlay("INFINITE_LOOP")
      }
    }, 14000)
    return () => clearInterval(t)
  }, [pushTicker, showOverlay])

  // ---- Win95-only: screen flicker + BSOD + error popups ----
  useEffect(() => {
    if (theme !== "win95") return
    const flick = setInterval(() => {
      setFlicker(true)
      setTimeout(() => setFlicker(false), 140)
    }, 30000)
    const bsod = setInterval(() => {
      if (!overlayRef.current && Math.random() < 0.4) showOverlay("BSOD")
    }, 47000)
    const err = setInterval(() => {
      if (!overlayRef.current && Math.random() < 0.45) {
        const e = randomFrom(WINDOWS_ERRORS)
        sfx.denied()
        setWinError({ id: errId++, code: e.code, msg: e.msg })
        setTimeout(() => setWinError(null), 2000)
      }
    }, 19000)
    return () => {
      clearInterval(flick)
      clearInterval(bsod)
      clearInterval(err)
    }
  }, [theme, showOverlay])

  // ---- Terminal-only: random SYSTEM BREACH ----
  useEffect(() => {
    if (theme !== "terminal") return
    const t = setInterval(() => {
      if (!overlayRef.current && Math.random() < 0.5) showOverlay("BREACH")
    }, 23000)
    return () => clearInterval(t)
  }, [theme, showOverlay])

  // ---- Simulated crowd: clicks, ticker, leaderboard ----
  useEffect(() => {
    const t = setInterval(
      () => {
        const inverted = eventRef.current === "INVERSION"
        const burst = Math.floor(1 + Math.random() * (chaosMode ? 40 : 9))
        setClicks((c) => Math.max(0, inverted ? c - burst : c + burst))

        const user = randomFrom(FAKE_USERS)
        const roll = Math.random()
        if (roll < 0.6) pushTicker(user, randomFrom(ACTIONS))
        else if (roll < 0.85) pushTicker(user, `threw ${randomFrom(EMOTES)}`)
        else pushTicker(user, `reached a new personal worst`)

        setLeaderboard((rows) => {
          if (rows.length === 0) return rows
          const next = rows.map((r) =>
            !r.you && Math.random() < 0.5
              ? { ...r, clicks: r.clicks + Math.floor(1 + Math.random() * 20) }
              : r,
          )
          next.sort((a, b) => b.clicks - a.clicks)
          return next
        })
      },
      chaosMode ? 450 : 1100,
    )
    return () => clearInterval(t)
  }, [pushTicker, chaosMode])

  // Overlays that fully block egg interaction.
  const clickBlocked =
    bureaucracyOpen ||
    winError !== null ||
    overlay === "BSOD" ||
    overlay === "MAINTENANCE" ||
    overlay === "CRASH"

  const clickBlockedRef = useRef(clickBlocked)
  clickBlockedRef.current = clickBlocked

  // ---- Time paradox: rewind the counter ----
  const timeParadox = useCallback(() => {
    sfx.crash()
    triggerShake()
    setClicks((c) => Math.max(0, c - 1000))
    showNotice("TIME PARADOX — You clicked too hard. Time reversed.", 3200)
    pushTicker("SYSTEM", "Temporal integrity compromised. -1000 clicks.", true)
  }, [triggerShake, showNotice, pushTicker])

  // ---- Player click ----
  const handleClick = useCallback(() => {
    if (clickBlockedRef.current) {
      sfx.denied()
      return
    }
    const inverted = eventRef.current === "INVERSION"
    const t = themeRef.current
    if (t === "terminal") sfx.type()
    else sfx.click()
    setClickPulse((p) => p + 1)

    setClicks((c) => {
      const next = Math.max(0, inverted ? c - 1 : c + 1)
      const milestone = Math.floor(next / 1000)
      if (!inverted && milestone > lastMilestone.current) {
        lastMilestone.current = milestone
        setMilestoneKey((k) => k + 1)
        sfx.milestone()
        triggerShake()
        pushTicker("SYSTEM", `MILESTONE: ${milestone * 1000} global clicks reached!`, true)
      }
      return next
    })

    setLeaderboard((rows) => {
      const next = rows.map((r) =>
        r.you ? { ...r, clicks: Math.max(0, inverted ? r.clicks - 1 : r.clicks + 1) } : r,
      )
      next.sort((a, b) => b.clicks - a.clicks)
      return next
    })

    // ----- Player-click driven chaos -----
    playerClicks.current += 1
    const pc = playerClicks.current
    setEggClicks(pc)

    // ----- Egg evolution: phases at 100 / 500 / 1000 clicks -----
    const phase = eggPhaseFor(pc)
    if (phase > prevEggPhase.current) {
      prevEggPhase.current = phase
      setEggEvolution({ id: errId++, phase })
      setMilestoneKey((k) => k + 1)
      triggerShake()
      // Theme-flavored evolution cue.
      if (t === "minimal") sfx.chime()
      else if (t === "terminal") sfx.chaos()
      else sfx.milestone()
      pushTicker("SYSTEM", `${EGG_PHASE_LABELS[phase]} — egg integrity compromised.`, true)
      if (evoTimer.current) clearTimeout(evoTimer.current)
      evoTimer.current = setTimeout(() => setEggEvolution(null), 2200)
    }

    // Minimal theme zen + contrast screamer
    if (t === "minimal") {
      if (pc % 100 === 0) {
        showOverlay("SCREAMER_WHY")
      } else if (pc % 50 === 0) {
        sfx.chime()
        setZenMessage({ id: errId++, text: randomFrom(ZEN_CALM), scary: false })
        setTimeout(() => setZenMessage(null), 3200)
      }
    }

    // Screamers every 200–500 clicks (all themes)
    if (pc >= nextScreamer.current) {
      nextScreamer.current = pc + 200 + Math.floor(Math.random() * 300)
      if (!overlayRef.current) {
        if (t === "terminal") showOverlay("BREACH")
        else showOverlay(Math.random() < 0.5 ? "SCREAMER_STOP" : "CRASH")
      }
    }

    // Server maintenance: 5% chance every 100 clicks
    if (pc % 100 === 0 && Math.random() < 0.05 && !overlayRef.current) {
      showOverlay("MAINTENANCE")
    }

    // Time paradox: 1% chance per click
    if (Math.random() < 0.01) timeParadox()
  }, [pushTicker, triggerShake, showOverlay, timeParadox])

  const emoteClicks = useRef(0)
  const registerEmote = useCallback(
    (emote: string) => {
      sfx.emote()
      pushTicker("YOU", `threw ${emote}`)
      emoteClicks.current += 1
      if (emoteClicks.current % 5 === 0) sfx.chaching()
    },
    [pushTicker],
  )

  const acceptAgreement = useCallback(() => {
    sfx.chaching()
    pushTicker("YOU", "signed the User Agreement (under duress)", true)
    endEvent()
  }, [pushTicker, endEvent])

  const dismissWinError = useCallback(() => setWinError(null), [])

  // ---- Chaos mode (Konami) ----
  const enableChaos = useCallback(() => {
    if (chaosMode) return
    setChaosMode(true)
    sfx.chaos()
    triggerShake()
    pushTicker("SYSTEM", "!!! CHAOS MODE ENGAGED — ALL SAFETIES DISABLED !!!", true)
  }, [chaosMode, pushTicker, triggerShake])

  useEffect(() => {
    let idx = 0
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === KONAMI[idx]) {
        idx++
        if (idx === KONAMI.length) {
          idx = 0
          enableChaos()
        }
      } else {
        idx = key === KONAMI[0] ? 1 : 0
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enableChaos])

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current)
      if (overlayTimer.current) clearTimeout(overlayTimer.current)
      if (evoTimer.current) clearTimeout(evoTimer.current)
    }
  }, [])

  const playStartup = useCallback(() => sfx.startup(), [])

  const inverted = event === "INVERSION"
  const gravityFailure = event === "GRAVITY_FAILURE"
  const eggPhase = eggPhaseFor(eggClicks)
  const eggIntegrity = eggIntegrityFor(eggClicks)

  return {
    clicks,
    event,
    eventTimeLeft,
    ticker,
    leaderboard,
    muted,
    chaosMode,
    bureaucracyOpen,
    shakeKey,
    milestoneKey,
    clickPulse,
    inverted,
    gravityFailure,
    // egg evolution
    eggClicks,
    eggPhase,
    eggIntegrity,
    eggEvolution,
    // new effects
    overlay,
    winError,
    flicker,
    zenMessage,
    eggEscape,
    notice,
    clickBlocked,
    // actions
    toggleMute,
    handleClick,
    registerEmote,
    acceptAgreement,
    dismissWinError,
    playStartup,
  }
}
