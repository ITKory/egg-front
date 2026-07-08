"use client"

import { useEffect, useState } from "react"

type Piece = { id: number; left: number; delay: number; dur: number; color: string; size: number }

const COLORS = ["#000080", "#ff0000", "#008000", "#ffff80", "#1084d0", "#ffffff"]

export function ConfettiBurst({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<Piece[]>([])

  useEffect(() => {
    if (trigger === 0) return
    const batch: Piece[] = Array.from({ length: 90 }, (_, i) => ({
      id: trigger * 1000 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      dur: 1.6 + Math.random() * 1.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 8,
    }))
    setPieces(batch)
    const t = setTimeout(() => setPieces([]), 3600)
    return () => clearTimeout(t)
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
