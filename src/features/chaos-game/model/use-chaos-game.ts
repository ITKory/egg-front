"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  EVENTS,
  OVERLAY_DURATION,
  WINDOWS_ERRORS,
  ZEN_CALM,
  type EventId,
  type OverlayId,
  type ScreenEmote,
  eggIntegrityFor,
  eggPhaseFor,
  nowStamp,
  randomFrom,
} from "@/entities/game"
import { useTheme } from "@/entities/theme"
import {
  actorFrom,
  asRecord,
  connectedUsersFrom,
  emoteFrom,
  leaderboardEntriesFrom,
  numberFrom,
  parseServerEventPayload,
  SERVER_EVENT_TO_CLIENT,
  stringFrom,
  type ServerConnectedUser,
  type ServerLeaderboardEntry,
  type ServerMessage,
} from "@/features/chaos-game/api/chaos-egg-contract"
import { fetchChaosLeaderboard, fetchChaosState } from "@/features/chaos-game/api/chaos-egg-client"
import { sfx, setMuted as setSfxMuted } from "@/shared/lib/sounds"
import { buildLeaderboardRows } from "./leaderboard"
import { useChaosSocket } from "./use-chaos-socket"
import type { ConnectedUserRow, LeaderRow, TickerMessage, WinError, ZenMessage } from "./types"

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

const CRINGE_CLICK_COMBOS = [2, 1, 3, 2, 3, 1] as const
const CRINGE_CLICK_DELAY_MS = 70
const CRINGE_AUTO_EMOTES = ["💀", "😭", "🤡", "🥴", "✨"] as const

let msgId = 0
let errId = 0
let screenEmoteId = 0

function buildConnectedUserRows(
  users: ServerConnectedUser[],
  currentUserId: string | null,
  currentName: string | null,
): ConnectedUserRow[] {
  return users.map((user, index) => {
    const id = stringFrom(user.userId)
    const you = Boolean(currentUserId && id === currentUserId)
    return {
      id,
      name: you ? currentName ?? "YOU" : stringFrom(user.username) ?? id ?? `User ${index + 1}`,
      you,
    }
  })
}

export function useChaosGame() {
  const { theme } = useTheme()
  const themeRef = useRef(theme)

  const [clicks, setClicks] = useState(0)
  const [event, setEvent] = useState<EventId>("NORMAL")
  const [eventTimeLeft, setEventTimeLeft] = useState(0)
  const [eventMessage, setEventMessage] = useState<string | null>(null)
  const [ticker, setTicker] = useState<TickerMessage[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([
    { id: "local-player", name: "YOU", clicks: 0, you: true },
  ])
  const [connectedUsers, setConnectedUsers] = useState(0)
  const [connectedUserList, setConnectedUserList] = useState<ConnectedUserRow[]>([])
  const [screenEmotes, setScreenEmotes] = useState<ScreenEmote[]>([])
  const [username, setUsername] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)
  const [chaosMode, setChaosMode] = useState(false)
  const [bureaucracyOpen, setBureaucracyOpen] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const [milestoneKey, setMilestoneKey] = useState(0)

  const [eggEvolution, setEggEvolution] = useState<{ id: number; phase: number } | null>(null)
  const prevEggPhase = useRef(0)
  const evoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [overlay, setOverlay] = useState<OverlayId | null>(null)
  const [winError, setWinError] = useState<WinError | null>(null)
  const [flicker, setFlicker] = useState(false)
  const [zenMessage, setZenMessage] = useState<ZenMessage | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const eventRef = useRef(event)
  const clicksRef = useRef(clicks)
  const overlayRef = useRef(overlay)
  const lastMilestone = useRef(Math.floor(clicks / 1000))

  const playerClicks = useRef(0)
  const userIdRef = useRef<string | null>(null)
  const usernameRef = useRef<string | null>(null)
  const serverLeaderboard = useRef<ServerLeaderboardEntry[]>([])
  const nextScreamer = useRef<number | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cringeTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  const pushTicker = useCallback((user: string, text: string, system = false) => {
    setTicker((prev) => {
      const next = [...prev, { id: msgId++, time: nowStamp(), user, text, system }]
      return next.slice(-60)
    })
  }, [])

  const pushScreenEmote = useCallback((user: string, emote: string) => {
    setScreenEmotes((prev) => [...prev, { id: screenEmoteId++, user, emote }].slice(-120))
  }, [])

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  useEffect(() => {
    eventRef.current = event
  }, [event])

  useEffect(() => {
    clicksRef.current = clicks
  }, [clicks])

  useEffect(() => {
    overlayRef.current = overlay
  }, [overlay])

  const triggerShake = useCallback(() => setShakeKey((k) => k + 1), [])

  const showNotice = useCallback((text: string, ms = 2600) => {
    setNotice(text)
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(null), ms)
  }, [])

  const mergeLeaderboard = useCallback((entries: ServerLeaderboardEntry[]) => {
    setLeaderboard(
      buildLeaderboardRows(
        entries,
        userIdRef.current,
        usernameRef.current ?? "YOU",
        playerClicks.current,
      ),
    )
  }, [])

  const applyPresence = useCallback((count: number | undefined, users: ServerConnectedUser[]) => {
    if (count !== undefined) {
      setConnectedUsers(Math.max(0, Math.floor(count)))
    } else if (users.length > 0) {
      setConnectedUsers(users.length)
    }

    if (users.length > 0 || count === 0) {
      setConnectedUserList(buildConnectedUserRows(users, userIdRef.current, usernameRef.current))
    }
  }, [])

  const applyServerClickCount = useCallback(
    (rawClicks: number, announceMilestones = false) => {
      const nextClicks = Math.max(0, Math.floor(rawClicks))
      const previousClicks = clicksRef.current
      if (previousClicks === nextClicks) return

      const milestone = Math.floor(nextClicks / 1000)
      const nextPhase = eggPhaseFor(nextClicks)
      const previousPhase = prevEggPhase.current

      clicksRef.current = nextClicks
      lastMilestone.current = milestone
      prevEggPhase.current = nextPhase
      setClicks(nextClicks)

      if (announceMilestones && milestone > Math.floor(previousClicks / 1000)) {
        setMilestoneKey((k) => k + 1)
        sfx.milestone()
        triggerShake()
      }

      if (announceMilestones && nextPhase > previousPhase) {
        const t = themeRef.current
        setEggEvolution({ id: errId++, phase: nextPhase })
        setMilestoneKey((k) => k + 1)
        triggerShake()
        if (t === "minimal") sfx.chime()
        else if (t === "terminal") sfx.chaos()
        else sfx.milestone()
        if (evoTimer.current) clearTimeout(evoTimer.current)
        evoTimer.current = setTimeout(() => setEggEvolution(null), 2200)
      }
    },
    [triggerShake],
  )

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
        if (id === "SCREAMER_WHY") {
          setZenMessage({ id: errId++, text: "Sorry, system glitch.", scary: false })
          setTimeout(() => setZenMessage(null), 3200)
        }
      }, OVERLAY_DURATION[id])
    },
    [triggerShake],
  )

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m
      setSfxMuted(next)
      return next
    })
  }, [])

  const startEvent = useCallback(
    (
      id: Exclude<EventId, "NORMAL">,
      options: { durationSeconds?: number; message?: string } = {},
    ) => {
      setEvent(id)
      setEventTimeLeft(options.durationSeconds ?? EVENTS[id].duration)
      setEventMessage(options.message ?? null)
      sfx.eventStart()
      triggerShake()
      pushTicker("SYSTEM", options.message ?? `EVENT TRIGGERED: ${EVENTS[id].label}`, true)
      if (id === "BUREAUCRACY") setBureaucracyOpen(true)
    },
    [pushTicker, triggerShake],
  )

  const endEvent = useCallback(() => {
    const ending = eventRef.current
    setEvent("NORMAL")
    setEventTimeLeft(0)
    setEventMessage(null)
    setBureaucracyOpen(false)
    if (ending !== "NORMAL") {
      sfx.eventEnd()
    }
  }, [])

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

  const syncLeaderboard = useCallback(async () => {
    try {
      const entries = await fetchChaosLeaderboard()
      if (!entries) return
      serverLeaderboard.current = entries
      mergeLeaderboard(entries)
    } catch {
      mergeLeaderboard(serverLeaderboard.current)
    }
  }, [mergeLeaderboard])

  const syncState = useCallback(async () => {
    try {
      const payload = await fetchChaosState()
      if (!payload) return

      if (payload.clicks !== undefined) applyServerClickCount(payload.clicks, false)
      applyPresence(payload.connectedUsers, payload.users)

      const activeEvent = parseServerEventPayload(payload.activeEvent)
      if (activeEvent) {
        const mappedEvent = SERVER_EVENT_TO_CLIENT[activeEvent.code]
        if (mappedEvent) {
          startEvent(mappedEvent, {
            durationSeconds: activeEvent.durationSeconds,
            message: activeEvent.message,
          })
        }
      }
    } catch {
      return
    }
  }, [applyPresence, applyServerClickCount, startEvent])

  const handleServerMessage = useCallback(
    (message: ServerMessage) => {
      const data = asRecord(message.data)

      if (message.type === "welcome") {
        const nextUserId = stringFrom(data?.userId)
        const nextUsername = stringFrom(data?.username)
        if (nextUserId) {
          userIdRef.current = nextUserId
        }
        if (nextUsername) {
          usernameRef.current = nextUsername
          setUsername(nextUsername)
        }
        applyPresence(numberFrom(data?.connectedUsers), connectedUsersFrom(data?.users))
        pushTicker("SERVER", `${nextUsername ?? nextUserId ?? "Employee"} connected.`, true)
        mergeLeaderboard(serverLeaderboard.current)
        void syncLeaderboard()
        return
      }

      if (message.type === "presence_update") {
        applyPresence(numberFrom(data?.connectedUsers), connectedUsersFrom(data?.users))
        return
      }

      if (
        message.type === "user_joined" ||
        message.type === "user_connected" ||
        message.type === "user_disconnected"
      ) {
        applyPresence(numberFrom(data?.connectedUsers), connectedUsersFrom(data?.users))
        const connectedUserId = stringFrom(data?.userId) ?? stringFrom(message.userId)
        if (connectedUserId && connectedUserId === userIdRef.current) return
        pushTicker(
          "SERVER",
          `${actorFrom(message, data)} ${message.type === "user_disconnected" ? "disconnected" : "connected"}.`,
          true,
        )
        return
      }

      if (message.type === "state_update") {
        const nextClicks = numberFrom(data?.clickCount)
        const leaderboardEntries = leaderboardEntriesFrom(data?.leaderboard)
        if (leaderboardEntries.length > 0) {
          serverLeaderboard.current = leaderboardEntries
          mergeLeaderboard(leaderboardEntries)
        }
        applyPresence(numberFrom(data?.connectedUsers), connectedUsersFrom(data?.users))
        if (nextClicks !== undefined) {
          const previousClicks = clicksRef.current
          applyServerClickCount(nextClicks, true)
          const userClicks = numberFrom(data?.userClicks)
          if (userClicks !== undefined && stringFrom(data?.userId) === userIdRef.current) {
            playerClicks.current = Math.max(0, Math.floor(userClicks))
            mergeLeaderboard(serverLeaderboard.current)
          }
          if (nextClicks !== previousClicks) {
            const actor = actorFrom(message, data)
            const hasActor = actor !== "EGG-SERVICE"
            pushTicker(
              actor,
              hasActor ? `clicked the egg (#${nextClicks})` : `registered egg click #${nextClicks}`,
              !hasActor,
            )
          }
        }
        return
      }

      if (message.type === "click") {
        const nextClicks = numberFrom(data?.clickCount)
        if (nextClicks !== undefined) applyServerClickCount(nextClicks, true)
        pushTicker(actorFrom(message, data), "clicked the egg")
        return
      }

      if (message.type === "emote" || message.type === "reaction") {
        const emote = emoteFrom(data)
        const actor = actorFrom(message, data)
        if (emote) {
          pushScreenEmote(actor, emote)
          pushTicker(actor, `threw ${emote}`)
        } else {
          pushTicker(actor, "sent a reaction")
        }
        return
      }

      if (message.type === "event" || message.type === "event_start") {
        const serverEvent = parseServerEventPayload(message.data)
        if (!serverEvent) return

        const mappedEvent = SERVER_EVENT_TO_CLIENT[serverEvent.code]
        if (!mappedEvent) {
          const messageText = serverEvent.message ?? `Server event: ${serverEvent.code}`
          showNotice(messageText, 3200)
          pushTicker("SYSTEM", messageText, true)
          setMilestoneKey((k) => k + 1)
          triggerShake()
          return
        }

        startEvent(mappedEvent, {
          durationSeconds: serverEvent.durationSeconds,
          message: serverEvent.message,
        })
        return
      }

      if (message.type === "event_end") {
        endEvent()
      }
    },
    [
      applyPresence,
      applyServerClickCount,
      endEvent,
      mergeLeaderboard,
      pushScreenEmote,
      pushTicker,
      showNotice,
      startEvent,
      syncLeaderboard,
      triggerShake,
    ],
  )

  const handleSocketOpen = useCallback(() => {
    void syncState()
    void syncLeaderboard()
  }, [syncLeaderboard, syncState])

  const handleInvalidServerMessage = useCallback(() => {
    showNotice("Received unreadable egg-service message.", 2200)
  }, [showNotice])

  const { connectionStatus, sendJson } = useChaosSocket({
    onMessage: handleServerMessage,
    onOpen: handleSocketOpen,
    onInvalidMessage: handleInvalidServerMessage,
  })

  useEffect(() => {
    const leaderboardTimer = setInterval(() => {
      void syncLeaderboard()
    }, 10000)

    return () => clearInterval(leaderboardTimer)
  }, [syncLeaderboard])

  useEffect(() => {
    const t = setInterval(() => {
      if (overlayRef.current || eventRef.current !== "NORMAL") return
      if (Math.random() < 0.08) {
        showOverlay("INFINITE_LOOP")
      }
    }, 14000)
    return () => clearInterval(t)
  }, [showOverlay])

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

  useEffect(() => {
    if (theme !== "terminal") return
    const t = setInterval(() => {
      if (!overlayRef.current && Math.random() < 0.5) showOverlay("BREACH")
    }, 23000)
    return () => clearInterval(t)
  }, [theme, showOverlay])

  const clickBlocked =
    bureaucracyOpen ||
    winError !== null ||
    overlay === "BSOD" ||
    overlay === "MAINTENANCE" ||
    overlay === "CRASH"

  const clickBlockedRef = useRef(clickBlocked)

  useEffect(() => {
    clickBlockedRef.current = clickBlocked
  }, [clickBlocked])

  const timeParadox = useCallback(() => {
    sfx.crash()
    triggerShake()
    showNotice("TIME PARADOX — Server authority rejected the rewind.", 3200)
  }, [triggerShake, showNotice])

  const handleClick = useCallback(() => {
    if (clickBlockedRef.current) {
      sfx.denied()
      return
    }

    const t = themeRef.current
    const previousPlayerClicks = playerClicks.current
    const comboClicks =
      t === "cringe"
        ? CRINGE_CLICK_COMBOS[previousPlayerClicks % CRINGE_CLICK_COMBOS.length]
        : 1

    if (!sendJson({ type: "click", data: {} })) {
      sfx.denied()
      showNotice("egg-service is offline. Reconnecting...", 2200)
      return
    }

    if (t === "terminal") sfx.type()
    else if (t === "cringe") sfx.emote()
    else sfx.click()

    if (t === "cringe") {
      if (comboClicks > 1) {
        showNotice(`CRINGE CLICK TAX x${comboClicks}`, 1200)
      }

      for (let i = 1; i < comboClicks; i++) {
        const timer = setTimeout(() => {
          cringeTimers.current = cringeTimers.current.filter((queuedTimer) => queuedTimer !== timer)
          if (!clickBlockedRef.current) {
            sendJson({ type: "click", data: {} })
          }
        }, i * CRINGE_CLICK_DELAY_MS)
        cringeTimers.current.push(timer)
      }

      if (previousPlayerClicks % 4 === 0) {
        const timer = setTimeout(() => {
          cringeTimers.current = cringeTimers.current.filter((queuedTimer) => queuedTimer !== timer)
          sendJson({ type: "emote", data: { emote: randomFrom(CRINGE_AUTO_EMOTES) } })
        }, comboClicks * CRINGE_CLICK_DELAY_MS)
        cringeTimers.current.push(timer)
      }
    }

    playerClicks.current = previousPlayerClicks + comboClicks
    const pc = playerClicks.current
    mergeLeaderboard(serverLeaderboard.current)

    if (t === "minimal") {
      if (pc % 100 === 0) {
        showOverlay("SCREAMER_WHY")
      } else if (pc % 50 === 0) {
        sfx.chime()
        setZenMessage({ id: errId++, text: randomFrom(ZEN_CALM), scary: false })
        setTimeout(() => setZenMessage(null), 3200)
      }
    }

    if (nextScreamer.current === null) {
      nextScreamer.current = pc + 200 + Math.floor(Math.random() * 300)
    }

    if (pc >= nextScreamer.current) {
      nextScreamer.current = pc + 200 + Math.floor(Math.random() * 300)
      if (!overlayRef.current) {
        if (t === "terminal") showOverlay("BREACH")
        else showOverlay(Math.random() < 0.5 ? "SCREAMER_STOP" : "CRASH")
      }
    }

    if (pc % 100 === 0 && Math.random() < 0.05 && !overlayRef.current) {
      showOverlay("MAINTENANCE")
    }

    if (Math.random() < 0.01) timeParadox()
  }, [mergeLeaderboard, sendJson, showNotice, showOverlay, timeParadox])

  const emoteClicks = useRef(0)
  const registerEmote = useCallback(
    (emote: string) => {
      sfx.emote()
      if (!sendJson({ type: "emote", data: { emote } })) {
        showNotice("egg-service is offline. Reaction was not sent.", 2200)
      }
      emoteClicks.current += 1
      if (emoteClicks.current % 5 === 0) sfx.chaching()
    },
    [sendJson, showNotice],
  )

  const acceptAgreement = useCallback(() => {
    sfx.chaching()
    setBureaucracyOpen(false)
  }, [])

  const dismissWinError = useCallback(() => setWinError(null), [])

  const enableChaos = useCallback(() => {
    if (chaosMode) return
    setChaosMode(true)
    sfx.chaos()
    triggerShake()
  }, [chaosMode, triggerShake])

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
      cringeTimers.current.forEach((timer) => clearTimeout(timer))
      cringeTimers.current = []
    }
  }, [])

  const playStartup = useCallback(() => sfx.startup(), [])

  const inverted = event === "INVERSION"
  const gravityFailure = event === "GRAVITY_FAILURE"
  const eggClicks = clicks
  const eggPhase = eggPhaseFor(eggClicks)
  const eggIntegrity = eggIntegrityFor(eggClicks)

  return {
    clicks,
    event,
    eventTimeLeft,
    eventMessage,
    ticker,
    leaderboard,
    connectedUsers,
    connectedUserList,
    screenEmotes,
    connectionStatus,
    username,
    muted,
    chaosMode,
    bureaucracyOpen,
    shakeKey,
    milestoneKey,
    inverted,
    gravityFailure,
    eggClicks,
    eggPhase,
    eggIntegrity,
    eggEvolution,
    overlay,
    winError,
    flicker,
    zenMessage,
    notice,
    clickBlocked,
    toggleMute,
    handleClick,
    registerEmote,
    acceptAgreement,
    dismissWinError,
    playStartup,
  }
}
