"use client"

import { useEffect, useRef } from "react"
import type { TickerMessage } from "@/features/chaos-game"
import { WinWindow } from "@/shared/ui"

export function TickerFeed({ messages }: { messages: TickerMessage[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  return (
    <WinWindow title="WaterCooler.irc" className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="bevel-field font-pixel h-[260px] overflow-y-auto bg-white p-1 text-[11px] leading-tight lg:h-[420px]"
        aria-live="polite"
        aria-label="Live activity feed"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`mb-0.5 break-words border-b border-dashed border-black/10 pb-0.5 ${
              m.system ? "bg-[var(--win-yellow)] font-bold text-[var(--win-navy)]" : "text-black"
            }`}
          >
            <span className="text-black/40">[{m.time}]</span>{" "}
            <span className={m.system ? "text-[var(--win-red)]" : "font-bold text-[var(--win-navy)]"}>
              {m.user}:
            </span>{" "}
            <span>{m.text}</span>
          </div>
        ))}
      </div>
    </WinWindow>
  )
}
