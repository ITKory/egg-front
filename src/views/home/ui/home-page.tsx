"use client"

import { useRef } from "react"
import { ThemeProvider, useTheme } from "@/entities/theme"
import { BureaucracyModal } from "@/features/bureaucracy-agreement"
import { useChaosGame } from "@/features/chaos-game"
import { EggClicker } from "@/features/egg-clicking"
import { EmoteBar } from "@/features/emote-reactions"
import DecryptedText from "@/shared/ui/DecryptedText"
import ShinyText from "@/shared/ui/ShinyText"
import { ConnectedUsers } from "@/widgets/connected-users"
import { EventWindow } from "@/widgets/event-window"
import { Leaderboard } from "@/widgets/leaderboard"
import { TopBar, TaskBar } from "@/widgets/portal-shell"
import { ThemeToast } from "@/widgets/theme-notifications"
import { TickerFeed } from "@/widgets/ticker-feed"
import {
  ChaosOverlay,
  ConfettiBurst,
  CursorSparkles,
  ModernGridBackground,
  NoticeBanner,
  WindowsError,
  Y2kDecor,
  ZenOverlay,
} from "@/widgets/visual-effects"

const MISSION_TEXT = "Mission-Critical Egg · Productivity Engine"

export function HomePage() {
  return (
    <ThemeProvider>
      <PortalApp />
    </ThemeProvider>
  )
}

function PortalApp() {
  const game = useChaosGame()
  const { theme, transitioning } = useTheme()
  const logoClicks = useRef(0)

  const handleLogoClick = () => {
    logoClicks.current += 1
    if (logoClicks.current >= 10) {
      logoClicks.current = 0
      game.playStartup()
    }
  }

  return (
    <div
      className={`scanlines min-h-screen overflow-x-hidden bg-(--win-gray) text-black ${
        game.inverted ? "invert-screen" : ""
      } ${transitioning ? "theme-switching" : ""}`}
      style={game.gravityFailure ? { background: "var(--win-sick)" } : undefined}
    >
      {theme === "minimal" && <ModernGridBackground />}
      <div
        key={game.shakeKey}
        className={`relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col gap-2 p-2 sm:p-3 ${
          game.shakeKey > 0 ? "shake" : ""
        }`}
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
          connectionStatus={game.connectionStatus}
          username={game.username}
          connectedUsers={game.connectedUsers}
        />

        <main className="grid flex-1 grid-cols-1 gap-2 lg:grid-cols-[260px_1fr_300px]">
          <div className={`order-3 lg:order-1 ${game.gravityFailure ? "drift" : ""}`}>
            <TickerFeed messages={game.ticker} />
          </div>

          <div className="order-1 flex flex-col items-center justify-between gap-4 lg:order-2">
            <Y2kDecor />
            <div className="bevel-out hard-shadow w-full bg-(--win-gray) p-4 sm:p-8">
              <div className="flex flex-col items-center justify-center">
                <p className="font-ui mb-4 text-center text-[11px] uppercase tracking-widest text-black/50">
                  {theme === "minimal" ? (
                    <ShinyText
                      text={MISSION_TEXT}
                      speed={2.8}
                      color="#93c5fd"
                      shineColor="#ffffff"
                      spread={120}
                      className="align-bottom"
                    />
                  ) : theme === "terminal" ? (
                    <DecryptedText
                      text={MISSION_TEXT.toUpperCase()}
                      speed={32}
                      maxIterations={8}
                      sequential
                      revealDirection="center"
                      animateOn="view"
                      characters="01_#$%/\\"
                      className="text-[#00ff00]"
                      encryptedClassName="text-[#00ff00]/45"
                    />
                  ) : (
                    MISSION_TEXT
                  )}
                </p>
                <EggClicker
                  clicks={game.clicks}
                  onClick={game.handleClick}
                  gravityFailure={game.gravityFailure}
                  inverted={game.inverted}
                  chaosMode={game.chaosMode}
                  event={game.event}
                  eggPhase={game.eggPhase}
                  eggIntegrity={game.eggIntegrity}
                  eggEvolution={game.eggEvolution}
                />
              </div>
            </div>
            <EmoteBar onEmote={game.registerEmote} screenEmotes={game.screenEmotes} />
          </div>

          <div
            className={`order-2 flex flex-col gap-2 lg:order-3 ${game.gravityFailure ? "drift" : ""}`}
          >
            <EventWindow event={game.event} timeLeft={game.eventTimeLeft} message={game.eventMessage} />
            <ConnectedUsers count={game.connectedUsers} users={game.connectedUserList} />
            <Leaderboard rows={game.leaderboard} />
          </div>
        </main>

        <TaskBar chaosMode={game.chaosMode} />
      </div>

      {game.bureaucracyOpen && <BureaucracyModal onAccept={game.acceptAgreement} />}
      <ConfettiBurst trigger={game.milestoneKey} />
      <ThemeToast />
      <CursorSparkles />
      {game.flicker && <div className="flicker pointer-events-none fixed inset-0 z-9999" />}
      {game.notice && <NoticeBanner text={game.notice} />}
      {game.zenMessage && <ZenOverlay message={game.zenMessage} />}
      {game.winError && <WindowsError error={game.winError} onClose={game.dismissWinError} />}
      {game.overlay && <ChaosOverlay overlay={game.overlay} />}
    </div>
  )
}
