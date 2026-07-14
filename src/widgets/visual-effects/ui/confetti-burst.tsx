"use client"

import { useMemo } from "react"

type Piece = { id: number; left: number; delay: number; dur: number; color: string; size: number }

const COLORS = ["#000080", "#ff0000", "#008000", "#ffff80", "#1084d0", "#ffffff"]

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function ConfettiBurst({ trigger }: { trigger: number }) {
  const pieces = useMemo<Piece[]>(() => {
    if (trigger === 0) return []

    return Array.from({ length: 90 }, (_, i) => ({
      id: trigger * 1000 + i,
      left: seededRandom(trigger * 101 + i) * 100,
      delay: seededRandom(trigger * 211 + i) * 0.4,
      dur: 1.6 + seededRandom(trigger * 307 + i) * 1.6,
      color: COLORS[Math.floor(seededRandom(trigger * 401 + i) * COLORS.length)],
      size: 6 + seededRandom(trigger * 503 + i) * 8,
    }))
  }, [trigger])

  if (pieces.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9996] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            border: "1px solid rgba(0,0,0,0.4)",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
