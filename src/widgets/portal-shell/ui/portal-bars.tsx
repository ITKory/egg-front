"use client"

import { useEffect, useState } from "react"
import { ThemeSwitcher } from "@/features/theme-switching"

function WinLogo() {
  return (
    <span aria-hidden="true" className="grid h-5 w-5 grid-cols-2 grid-rows-2 gap-[1px]">
      <span className="bg-[var(--win-red)]" />
      <span className="bg-[var(--win-green)]" />
      <span className="bg-[var(--win-navy-2)]" />
      <span className="bg-[var(--win-yellow)]" />
    </span>
  )
}

type TopBarProps = {
  muted: boolean
  onToggleMute: () => void
  onLogoClick: () => void
  chaosMode: boolean
}

export function TopBar({ muted, onToggleMute, onLogoClick, chaosMode }: TopBarProps) {
  return (
    <header className="bevel-out flex items-center justify-between gap-2 bg-[var(--win-navy)] px-2 py-1 text-white no-select">
      <button
        type="button"
        onClick={onLogoClick}
        className="bevel-out retro-tip flex items-center gap-2 bg-[var(--win-gray)] px-2 py-1 text-black active:bevel-in"
        data-tip="Click me 10 times. I dare you."
      >
        <WinLogo />
        <span className="font-ui text-[13px] font-bold">EGGCORP</span>
      </button>

      <div className="min-w-0 flex-1 text-center">
        <h1 className="font-ui truncate text-[13px] font-bold tracking-tight sm:text-sm">
          PORTAL v3.1 — Enterprise Egg Interaction Suite
          {chaosMode && <span className="chaos-hue ml-2 text-[var(--win-yellow)]">[CHAOS]</span>}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeSwitcher />
        <button
          type="button"
          onClick={onToggleMute}
          className="bevel-out retro-tip flex h-7 w-9 items-center justify-center bg-[var(--win-gray)] text-base text-black active:bevel-in"
          data-tip={muted ? "Unmute" : "Mute"}
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
        >
          <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
        </button>
      </div>
    </header>
  )
}

export function TaskBar({ chaosMode }: { chaosMode: boolean }) {
  const [time, setTime] = useState("--:--")
  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      )
    update()
    const t = setInterval(update, 10000)
    return () => clearInterval(t)
  }, [])

  return (
    <footer className="bevel-out flex items-center justify-between gap-2 bg-[var(--win-gray)] px-1.5 py-1 no-select">
      <div className="flex items-center gap-1">
        <span className="bevel-out font-ui flex items-center gap-1.5 bg-[var(--win-gray)] px-2 py-1 text-[12px] font-bold text-black">
          <span aria-hidden="true" className="grid h-4 w-4 grid-cols-2 grid-rows-2 gap-[1px]">
            <span className="bg-[var(--win-red)]" />
            <span className="bg-[var(--win-green)]" />
            <span className="bg-[var(--win-navy-2)]" />
            <span className="bg-[var(--win-yellow)]" />
          </span>
          Start
        </span>
        <span className="bevel-in font-ui hidden bg-[var(--win-gray)] px-2 py-1 text-[11px] text-black sm:inline">
          🥚 egg_clicker.exe
        </span>
        {chaosMode && (
          <span className="bevel-in font-ui blink-alert px-2 py-1 text-[11px]">⚠ chaos.dll</span>
        )}
      </div>
      <span className="bevel-in font-ui bg-[var(--win-gray)] px-2 py-1 text-[12px] tabular-nums text-black">
        {time}
      </span>
    </footer>
  )
}
