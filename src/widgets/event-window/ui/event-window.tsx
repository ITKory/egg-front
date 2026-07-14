"use client"

import { useEffect, useState } from "react"
import { EVENTS, type EventId, glitchText } from "@/entities/game"
import { WinWindow } from "@/shared/ui"

type EventWindowProps = {
  event: EventId
  timeLeft: number
  message?: string | null
}

export function EventWindow({ event, timeLeft, message }: EventWindowProps) {
  const active = event !== "NORMAL"
  const info = active ? EVENTS[event as Exclude<EventId, "NORMAL">] : null
  const [glitched, setGlitched] = useState("")

  useEffect(() => {
    if (!info) return
    const t = setInterval(() => setGlitched(glitchText(info.label, 0.25)), 120)
    return () => clearInterval(t)
  }, [info])

  return (
    <WinWindow title="SYSTEM ALERT.exe" alert={active}>
      {!active ? (
        <div className="bevel-field bg-black px-3 py-4 text-center">
          <p className="font-pixel text-sm font-bold text-[var(--win-green)]">⛊ NO ACTIVE THREATS</p>
          <p className="font-pixel mt-1 text-[10px] text-[var(--win-green)]/60">All systems nominal-ish.</p>
        </div>
      ) : (
        <div className="bevel-field bg-[var(--win-red)] px-3 py-3 text-white">
          <p className="font-pixel text-base font-bold tracking-wide">⚠ {glitched || info?.label}</p>
          <p className="font-ui mt-1 text-[11px] leading-snug">{message ?? info?.blurb}</p>
          <div className="bevel-in mt-2 flex items-center justify-between bg-black px-2 py-1">
            <span className="font-pixel text-[10px] uppercase text-white/70">Auto-resolve in</span>
            <span className="font-pixel text-lg font-bold tabular-nums text-[#ff4d4d]">
              {timeLeft.toString().padStart(2, "0")}s
            </span>
          </div>
        </div>
      )}
    </WinWindow>
  )
}
