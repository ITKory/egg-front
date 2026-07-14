"use client"

import { useEffect, useState } from "react"
import { useTheme } from "@/entities/theme"
import type { ConnectionStatus } from "@/features/chaos-game"
import { ThemeSwitcher } from "@/features/theme-switching"
import DecryptedText from "@/shared/ui/DecryptedText"
import ShinyText from "@/shared/ui/ShinyText"

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
  connectionStatus: ConnectionStatus
  username: string | null
  connectedUsers: number
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: "CONNECTING",
  connected: "LIVE",
  reconnecting: "RECONNECTING",
  disconnected: "OFFLINE",
  error: "ERROR",
}

const PORTAL_TITLE = "PORTAL v3.1 — Enterprise Egg Interaction Suite"

export function TopBar({
  muted,
  onToggleMute,
  onLogoClick,
  chaosMode,
  connectionStatus,
  username,
  connectedUsers,
}: TopBarProps) {
  const online = connectionStatus === "connected"
  const { theme } = useTheme()

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
          {theme === "minimal" ? (
            <ShinyText
              text={PORTAL_TITLE}
              speed={3}
              color="#dbeafe"
              shineColor="#ffffff"
              spread={115}
              className="max-w-full truncate align-bottom"
            />
          ) : theme === "terminal" ? (
            <DecryptedText
              text={PORTAL_TITLE}
              speed={35}
              maxIterations={9}
              sequential
              revealDirection="start"
              animateOn="view"
              characters="01#$%&/\\[]{}<>_"
              className="text-[#00ff00]"
              encryptedClassName="text-[#00ff00]/45"
              parentClassName="max-w-full overflow-hidden text-ellipsis whitespace-nowrap align-bottom"
            />
          ) : (
            PORTAL_TITLE
          )}
          {chaosMode && <span className="chaos-hue ml-2 text-[var(--win-yellow)]">[CHAOS]</span>}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="bevel-in hidden max-w-[220px] items-center gap-1 bg-[var(--win-gray)] px-2 py-1 text-black sm:flex">
          <span
            className={`h-2 w-2 ${online ? "bg-[var(--win-green)]" : "bg-[var(--win-red)]"}`}
            aria-hidden="true"
          />
          <span className="font-pixel truncate text-[10px]">
            {STATUS_LABEL[connectionStatus]}
            {` · ${connectedUsers} ONLINE`}
            {username ? ` · ${username}` : ""}
          </span>
        </div>
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
