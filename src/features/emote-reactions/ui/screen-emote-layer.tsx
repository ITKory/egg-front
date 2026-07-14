"use client"

import { useEffect, useRef, useState } from "react"
import type { ScreenEmote } from "@/entities/game"

type FlyingEmote = {
  id: number
  emote: string
  x: number
  y: number
  fx: number
  fy: number
  fr: number
  fs: number
}

let flyId = 0

function createFlyingEmote(emote: string): FlyingEmote {
  const width = typeof window === "undefined" ? 1024 : window.innerWidth
  const height = typeof window === "undefined" ? 768 : window.innerHeight

  return {
    id: flyId++,
    emote,
    x: Math.floor(width * (0.08 + Math.random() * 0.84)),
    y: Math.floor(height * (0.18 + Math.random() * 0.64)),
    fx: (Math.random() - 0.5) * 520,
    fy: -160 - Math.random() * 340,
    fr: (Math.random() - 0.5) * 720,
    fs: 1.6 + Math.random() * 2.2,
  }
}

export function ScreenEmoteLayer({ emotes }: { emotes: ScreenEmote[] }) {
  const [flying, setFlying] = useState<FlyingEmote[]>([])
  const renderedEmoteIds = useRef(new Set<number>())
  const removalTimers = useRef<Array<ReturnType<typeof setTimeout>>>([])

  useEffect(() => {
    const incoming = emotes.filter((item) => !renderedEmoteIds.current.has(item.id))
    if (incoming.length === 0) return

    for (const item of incoming) renderedEmoteIds.current.add(item.id)

    const nextFlying = incoming.map((item) => createFlyingEmote(item.emote))
    setFlying((prev) => [...prev, ...nextFlying].slice(-160))

    const timers = nextFlying.map((item) =>
      setTimeout(() => setFlying((prev) => prev.filter((f) => f.id !== item.id)), 1400),
    )
    removalTimers.current.push(...timers)
  }, [emotes])

  useEffect(() => {
    const timers = removalTimers.current
    return () => {
      for (const timer of timers) clearTimeout(timer)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {flying.map((f) => (
        <span
          key={f.id}
          className="emote-fly absolute text-4xl"
          style={
            {
              left: f.x,
              top: f.y,
              "--fx": `${f.fx}px`,
              "--fy": `${f.fy}px`,
              "--fr": `${f.fr}deg`,
              "--fs": f.fs,
            } as React.CSSProperties
          }
          aria-hidden="true"
        >
          {f.emote}
        </span>
      ))}
    </div>
  )
}
