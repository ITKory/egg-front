"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/entities/theme"

type Spark = { id: number; x: number; y: number; ch: string }

const GLYPHS = ["✦", "✧", "⋆", "★", "✪", "♥"]
let sid = 0

export function CursorSparkles() {
  const { theme } = useTheme()
  const [sparks, setSparks] = useState<Spark[]>([])

  useEffect(() => {
    if (theme !== "y2k") return
    let last = 0
    const onMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - last < 55) return // throttle the trail
      last = now
      const id = sid++
      const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      setSparks((prev) => [...prev.slice(-24), { id, x: e.clientX, y: e.clientY, ch }])
      setTimeout(() => setSparks((prev) => prev.filter((s) => s.id !== id)), 800)
    }
    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [theme])

  if (theme !== "y2k") return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9995] overflow-hidden" aria-hidden="true">
      {sparks.map((s) => (
        <span
          key={s.id}
          className="sparkle"
          style={{
            left: s.x,
            top: s.y,
            color: ["#ff00ff", "#00e5ff", "#ffe600", "#00ff00"][s.id % 4],
            textShadow: "0 0 6px currentColor",
          }}
        >
          {s.ch}
        </span>
      ))}
    </div>
  )
}
