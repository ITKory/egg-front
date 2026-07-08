"use client"

import { useEffect, useRef, useState } from "react"
import { ThemeProvider, useTheme } from "@/entities/theme"
import { BureaucracyModal } from "@/features/bureaucracy-agreement"
import { useChaosGame } from "@/features/chaos-game"
import { EggClicker } from "@/features/egg-clicking"
import { EmoteBar } from "@/features/emote-reactions"
import { EventWindow } from "@/widgets/event-window"
import { Leaderboard } from "@/widgets/leaderboard"
import { TopBar, TaskBar } from "@/widgets/portal-shell"
import { ThemeToast } from "@/widgets/theme-notifications"
import { TickerFeed } from "@/widgets/ticker-feed"
import { ConfettiBurst, CursorSparkles, Y2kDecor } from "@/widgets/visual-effects"

export function HomePage() {
  return (
    <ThemeProvider>
      <PortalApp />
    </ThemeProvider>
  )
}

function PortalApp() {
  const game = useChaosGame()
  const { transitioning } = useTheme()
  const [shaking, setShaking] = useState(false)
  const logoClicks = useRef(0)

  // Re-trigger screen shake whenever the shakeKey changes.
  useEffect(() => {
    if (game.shakeKey === 0) return
    setShaking(true)
    const t = setTimeout(() => setShaking(false), 500)
    return () => clearTimeout(t)
  }, [game.shakeKey])

  const handleLogoClick = () => {
    logoClicks.current += 1
    if (logoClicks.current >= 10) {
      logoClicks.current = 0
      game.playStartup()
    }
  }

  return (
    <div
      className={`scanlines min-h-screen overflow-x-hidden bg-[var(--win-gray)] text-black ${
        game.inverted ? "invert-screen" : ""
      } ${transitioning ? "theme-switching" : ""}`}
      style={game.gravityFailure ? { background: "var(--win-sick)" } : undefined}
    >
      <div
        className={`mx-auto flex min-h-screen max-w-7xl flex-col gap-2 p-2 sm:p-3 ${shaking ? "shake" : ""}`}
        style={
          game.gravityFailure
            ? { transform: "rotate(1.6deg)", transition: "transform 0.6s ease" }
            : { transform: "rotate(0deg)", transition: "transform 0.6s ease" }
        }
      >
        <TopBar
          muted={game.muted}
          onToggleMute={game.toggleMute}
          onLogoClick={handleLogoClick}
          chaosMode={game.chaosMode}
        />

        {/* Main 3-column layout */}
        <main className="grid flex-1 grid-cols-1 gap-2 lg:grid-cols-[260px_1fr_300px]">
          {/* Left: ticker */}
          <div className={`order-3 lg:order-1 ${game.gravityFailure ? "drift" : ""}`}>
            <TickerFeed messages={game.ticker} />
          </div>

          {/* Center: egg + emotes */}
          <div className="order-1 flex flex-col items-center justify-between gap-4 lg:order-2">
            <Y2kDecor />
            <div className="bevel-out hard-shadow w-full bg-[var(--win-gray)] p-4 sm:p-8">
              <div className="flex flex-col items-center justify-center">
                <p className="font-ui mb-4 text-center text-[11px] uppercase tracking-widest text-black/50">
                  Mission-Critical Egg · Productivity Engine
                </p>
                <EggClicker
                  clicks={game.clicks}
                  onClick={game.handleClick}
                  gravityFailure={game.gravityFailure}
                  inverted={game.inverted}
                  chaosMode={game.chaosMode}
                  clickPulse={game.clickPulse}
                  event={game.event}
                  eggPhase={game.eggPhase}
                  eggIntegrity={game.eggIntegrity}
                  eggEvolution={game.eggEvolution}
                />
              </div>
            </div>
            <EmoteBar onEmote={game.registerEmote} />
          </div>

          {/* Right: event + leaderboard */}
          <div
            className={`order-2 flex flex-col gap-2 lg:order-3 ${game.gravityFailure ? "drift" : ""}`}
          >
            <EventWindow event={game.event} timeLeft={game.eventTimeLeft} />
            <Leaderboard rows={game.leaderboard} />
          </div>
        </main>

        <TaskBar chaosMode={game.chaosMode} />
      </div>

      {game.bureaucracyOpen && <BureaucracyModal onAccept={game.acceptAgreement} />}
      <ConfettiBurst trigger={game.milestoneKey} />
      <ThemeToast />
      <CursorSparkles />
    </div>
  )
}
