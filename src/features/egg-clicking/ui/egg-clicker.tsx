"use client"

import { useEffect, useRef, useState } from "react"
import { ASCII_EGGS, type EventId } from "@/entities/game"
import { useTheme } from "@/entities/theme"
import Counter from "@/shared/ui/Counter"

type EggClickerProps = {
  clicks: number
  onClick: () => void
  gravityFailure: boolean
  inverted: boolean
  chaosMode: boolean
  event: EventId
  /** 0-3 evolution phase driven by player clicks. */
  eggPhase: number
  eggIntegrity: number
  eggEvolution: { id: number; phase: number } | null
}

const STATUS_LABEL: Record<EventId, string> = {
  NORMAL: "STATUS: NORMAL",
  GRAVITY_FAILURE: "STATUS: GRAVITY FAILURE",
  INVERSION: "STATUS: REALITY INVERTED",
  BUREAUCRACY: "STATUS: PENDING APPROVAL",
}

const PHASE_TITLE = ["PHASE 1", "PHASE 2", "PHASE 3"]

function counterPlacesFor(value: number) {
  const digits = Math.max(8, Math.floor(Math.max(0, value)).toString().length)
  return Array.from({ length: digits }, (_, index) => 10 ** (digits - index - 1))
}

function Win95Egg({ phase, pressed }: { phase: number; pressed: boolean }) {
  if (phase >= 3) {
    return <span className={`w95-mycomputer ${pressed ? "egg-bounce" : ""}`} aria-hidden="true" />
  }
  const cracks =
    phase === 1
      ? [{ left: "52%", top: "32%", h: 20, rot: 18 }]
      : phase === 2
        ? [
            { left: "48%", top: "26%", h: 26, rot: 14 },
            { left: "40%", top: "42%", h: 22, rot: -22 },
            { left: "60%", top: "48%", h: 18, rot: 30 },
          ]
        : []
  return (
    <span className={`w95-egg ${phase === 2 ? "tint" : ""} ${pressed ? "egg-bounce" : ""}`} aria-hidden="true">
      {cracks.map((c, i) => (
        <span
          key={i}
          className="w95-crack"
          style={{ left: c.left, top: c.top, height: c.h, transform: `rotate(${c.rot}deg)` }}
        />
      ))}
    </span>
  )
}

function Y2kEgg({ phase, pressed }: { phase: number; pressed: boolean }) {
  if (phase >= 3) {
    return <span className={`y2k-disco ${pressed ? "egg-bounce" : ""}`} aria-hidden="true" />
  }
  return (
    <span className="relative inline-flex items-center justify-center" aria-hidden="true">
      {phase >= 2 &&
        [0, 45, 90, 135].map((deg) => (
          <span key={deg} className="y2k-beam" style={{ transform: `translate(-50%, -100%) rotate(${deg}deg)` }} />
        ))}
      <span
        className={`${phase >= 1 ? "y2k-chrome bright" : "y2k-chrome"} ${
          phase >= 2 ? "y2k-vibrate" : ""
        } ${pressed ? "egg-bounce" : ""}`}
      />
      {phase >= 1 &&
        ["12%", "78%", "30%", "85%"].map((top, i) => (
          <span
            key={i}
            className="chaos-hue absolute text-sm"
            style={{ top, left: i % 2 ? "82%" : "8%" }}
          >
            ✦
          </span>
        ))}
    </span>
  )
}

function AiEgg({ phase, pressed, rippleKey }: { phase: number; pressed: boolean; rippleKey: number }) {
  if (phase >= 3) {
    return (
      <span className="ai-egg-wrap" aria-hidden="true">
        <span className="ai-ring fast" />
        {[0, 45, 90, 135].map((deg) => (
          <span key={deg} className="ai-beam" style={{ transform: `translate(-50%, -100%) rotate(${deg}deg)` }} />
        ))}
        <span className={`ai-crystal ${pressed ? "egg-bounce" : ""}`} />
        {rippleKey > 0 && <span key={rippleKey} className="ai-ripple" />}
      </span>
    )
  }
  return (
    <span className="ai-egg-wrap" aria-hidden="true">
      <span className={`ai-ring ${phase >= 1 ? "fast" : ""}`} />
      {phase >= 2 &&
        [0, 45, 90, 135].map((deg) => (
          <span key={deg} className="ai-beam" style={{ transform: `translate(-50%, -100%) rotate(${deg}deg)` }} />
        ))}
      <span className={`ai-egg ${phase >= 1 ? "bright" : ""} ${pressed ? "egg-bounce" : ""}`} />
      {rippleKey > 0 && <span key={rippleKey} className="ai-ripple" />}
    </span>
  )
}

function TerminalEgg({ phase, pressed }: { phase: number; pressed: boolean }) {
  const art = ASCII_EGGS[Math.min(phase, 3)]
  const color = phase >= 3 ? "#ff3030" : "#00ff00"
  return (
    <pre
      className={`term-egg font-pixel text-[15px] ${phase >= 2 ? "glitch-text" : "term-flicker"} ${
        pressed ? "egg-bounce" : ""
      }`}
      style={{ color, textShadow: `0 0 6px ${color}` }}
      aria-hidden="true"
    >
      {art}
    </pre>
  )
}

function CringeEgg({ phase, pressed }: { phase: number; pressed: boolean }) {
  const core = phase >= 3 ? "💀" : phase >= 2 ? "🥴" : "🥚"
  const caption = phase >= 3 ? "certified cooked" : phase >= 1 ? "vibe audit" : "click tax"

  return (
    <span className={`cringe-egg-wrap ${pressed ? "egg-bounce" : ""}`} aria-hidden="true">
      <span className="cringe-orbit cringe-orbit-a">💅</span>
      <span className="cringe-orbit cringe-orbit-b">✨</span>
      <span className="cringe-orbit cringe-orbit-c">😭</span>
      <span className="cringe-egg-core">{core}</span>
      <span className="cringe-caption">{caption}</span>
    </span>
  )
}

export function EggClicker({
  clicks,
  onClick,
  gravityFailure,
  inverted,
  chaosMode,
  event,
  eggPhase,
  eggIntegrity,
  eggEvolution,
}: EggClickerProps) {
  const { theme } = useTheme()
  const [pressed, setPressed] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [rippleKey, setRippleKey] = useState(0)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!gravityFailure) return

    const t = setInterval(() => {
      setOffset({ x: (Math.random() - 0.5) * 160, y: (Math.random() - 0.5) * 120 })
    }, 700)
    return () => clearInterval(t)
  }, [gravityFailure])

  const counterColor = inverted ? "#ff4d4d" : "#39ff14"
  const integrityCritical = eggIntegrity <= 20
  const integrityColor = integrityCritical ? "var(--win-red)" : "var(--win-green)"
  const visibleOffset = gravityFailure ? offset : { x: 0, y: 0 }

  return (
    <div className="relative flex flex-col items-center gap-4">
      {eggEvolution && (
        <div
          key={eggEvolution.id}
          className="evo-banner pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2"
        >
          <div className="bevel-out hard-shadow-sm font-pixel bg-[var(--win-red)] px-4 py-2 text-center text-sm font-black uppercase tracking-widest text-white">
            EGG EVOLUTION
            <span className="mt-0.5 block text-lg">{PHASE_TITLE[eggEvolution.phase - 1] ?? "PHASE 1"}</span>
          </div>
        </div>
      )}

      <div className="bevel-field bg-black px-3 py-2">
        <div className="flex items-center justify-center" aria-label={`Global clicks: ${clicks}`}>
          <Counter
            value={Math.max(0, Math.floor(clicks))}
            places={counterPlacesFor(clicks)}
            fontSize={34}
            padding={5}
            gap={1}
            borderRadius={2}
            horizontalPadding={0}
            textColor={counterColor}
            fontWeight={700}
            gradientHeight={8}
            gradientFrom="rgba(0, 0, 0, 0.9)"
            gradientTo="rgba(0, 0, 0, 0)"
            counterStyle={{
              fontFamily: "var(--font-mono)",
              textShadow: inverted ? "0 0 6px #ff0000" : "0 0 6px #39ff14",
            }}
          />
        </div>
        <p className="font-pixel mt-1 text-center text-[10px] uppercase tracking-widest text-[#39ff14]/60">
          Global Egg Clicks
        </p>
      </div>

      <button
        type="button"
        onMouseDown={() => {
          setPressed(true)
          setRippleKey((k) => k + 1)
          if (pressTimer.current) clearTimeout(pressTimer.current)
          pressTimer.current = setTimeout(() => setPressed(false), 160)
        }}
        onClick={onClick}
        style={{
          transform: `translate(${visibleOffset.x}px, ${visibleOffset.y}px)`,
          transition: "transform 0.5s ease",
        }}
        className={`bevel-out retro-tip flex h-44 w-40 items-center justify-center bg-[var(--win-gray)] hard-shadow ${
          pressed ? "egg-bounce" : "hover:scale-[1.03]"
        } ${chaosMode ? "chaos-hue" : ""} transition-transform`}
        data-tip="Do not click the egg. (Please click the egg.)"
        aria-label="Click the egg"
      >
        {theme === "cringe" ? (
          <CringeEgg phase={eggPhase} pressed={pressed} />
        ) : theme === "terminal" ? (
          <TerminalEgg phase={eggPhase} pressed={pressed} />
        ) : theme === "minimal" ? (
          <AiEgg phase={eggPhase} pressed={pressed} rippleKey={rippleKey} />
        ) : theme === "y2k" ? (
          <Y2kEgg phase={eggPhase} pressed={pressed} />
        ) : (
          <Win95Egg phase={eggPhase} pressed={pressed} />
        )}
      </button>

      <div className="w-full max-w-[220px]">
        <div className="font-pixel mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-black/70">
          <span>Egg Integrity</span>
          <span style={{ color: integrityColor }}>
            {integrityCritical ? "CRITICAL" : `${eggIntegrity}%`}
          </span>
        </div>
        <div className="bevel-field h-3 w-full overflow-hidden bg-black/80">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${eggIntegrity}%`,
              background: integrityColor,
              boxShadow: `0 0 6px ${integrityColor}`,
            }}
          />
        </div>
      </div>

      <div
        className={`bevel-field font-pixel px-4 py-1.5 text-sm font-bold tracking-wide ${
          event === "NORMAL"
            ? "bg-[var(--win-gray)] text-[var(--win-green)]"
            : "bg-[var(--win-red)] text-white"
        }`}
      >
        {STATUS_LABEL[event]}
      </div>
    </div>
  )
}
