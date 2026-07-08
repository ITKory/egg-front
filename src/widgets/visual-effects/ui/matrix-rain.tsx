"use client"

import { useEffect, useRef } from "react"

/**
 * Full-screen Matrix-style falling green characters.
 * Rendered behind the terminal-theme UI. Pure canvas, no deps.
 */
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const glyphs = "アイウエオカキクケコサシスセソ0123456789ABCDEFｱｲｳｴｵ<>{}[]=*+#$%".split("")
    let columns = 0
    let drops: number[] = []
    let fontSize = 14

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      fontSize = window.innerWidth < 640 ? 11 : 14
      columns = Math.floor(canvas.width / fontSize)
      drops = new Array(columns).fill(0).map(() => Math.floor((Math.random() * canvas.height) / fontSize))
    }
    resize()
    window.addEventListener("resize", resize)

    let raf = 0
    let last = 0
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      // Throttle to ~24fps for that choppy terminal feel.
      if (t - last < 42) return
      last = t

      ctx.fillStyle = "rgba(0, 0, 0, 0.08)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `${fontSize}px "Courier New", monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize
        // Leading character is brighter.
        ctx.fillStyle = Math.random() < 0.04 ? "#ccffcc" : "#00ff41"
        ctx.fillText(text, x, y)
        if (y > canvas.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-50"
      aria-hidden="true"
    />
  )
}
