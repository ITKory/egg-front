"use client"

import { useTheme } from "@/entities/theme"

export function Y2kDecor() {
  const { theme } = useTheme()
  if (theme !== "y2k") return null

  const visitors = (1337420 + Math.floor(Date.now() / 60000) % 9999).toString().padStart(8, "0")

  return (
    <div className="mb-3 w-full no-select" aria-hidden="true">
      {/* Under construction banner */}
      <div
        className="bevel-out mb-2 overflow-hidden bg-black px-2 py-1"
        style={{ border: "2px dashed #ffe600" }}
      >
        <p
          className="font-ui whitespace-nowrap text-center text-[12px] font-bold text-[#ffe600]"
          style={{ textShadow: "0 0 5px #ff8800" }}
        >
          🚧 UNDER CONSTRUCTION · BEST VIEWED IN NETSCAPE NAVIGATOR · 800x600 🚧
        </p>
      </div>
      <div className="flex items-center justify-center gap-2">
        {/* Blinking NEW badge */}
        <span className="blink-alert font-ui rounded px-1.5 py-0.5 text-[11px] font-black">
          NEW!
        </span>
        {/* Retro visitor counter */}
        <span className="bevel-field font-pixel flex items-center gap-1 bg-black px-2 py-0.5 text-[12px] text-[#00ff00]">
          <span className="text-[#00e5ff]">VISITORS:</span>
          <span className="tabular-nums tracking-widest">{visitors}</span>
        </span>
        <span
          className="chaos-hue font-ui rounded px-1.5 py-0.5 text-[11px] font-black text-[#ff00ff]"
          style={{ textShadow: "0 0 6px #ff00ff" }}
        >
          HOT!
        </span>
      </div>
    </div>
  )
}
