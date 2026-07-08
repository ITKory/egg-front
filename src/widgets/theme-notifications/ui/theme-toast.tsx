"use client"

import { useTheme } from "@/entities/theme"

export function ThemeToast() {
  const { toast } = useTheme()
  if (!toast) return null
  return (
    <div
      className="pointer-events-none fixed bottom-16 left-1/2 z-[9993] -translate-x-1/2"
      role="status"
      aria-live="polite"
    >
      <div className="bevel-out hard-shadow flex items-center gap-2 bg-[var(--win-gray)] px-4 py-2">
        <span aria-hidden="true" className="text-base">📺</span>
        <span className="font-ui text-[13px] font-bold tracking-wide text-black">{toast}</span>
      </div>
    </div>
  )
}
