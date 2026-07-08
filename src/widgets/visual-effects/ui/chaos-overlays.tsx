"use client"

import type { OverlayId } from "@/entities/game"
import type { WinError, ZenMessage } from "@/features/chaos-game"

/* ---------- Windows Error dialog (Win95) ---------- */
export function WindowsError({ error, onClose }: { error: WinError; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/20 p-4">
      <div className="bevel-out hard-shadow w-full max-w-sm bg-[var(--win-gray)]">
        <header className="flex items-center justify-between bg-[var(--win-navy)] px-2 py-1">
          <span className="font-ui text-[12px] font-bold text-white">{error.code}</span>
          <button
            type="button"
            onClick={onClose}
            className="bevel-out flex h-4 w-4 items-center justify-center bg-[var(--win-gray)] text-[10px] font-bold text-black"
            aria-label="Close error"
          >
            x
          </button>
        </header>
        <div className="flex items-start gap-3 p-4">
          <div className="bevel-field flex h-9 w-9 shrink-0 items-center justify-center bg-[var(--win-yellow)] text-lg font-bold text-black">
            !
          </div>
          <div className="flex-1">
            <p className="font-ui text-[12px] leading-relaxed text-black">{error.msg}</p>
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={onClose}
                className="bevel-out active:bevel-in font-ui min-w-20 bg-[var(--win-gray)] px-4 py-1 text-[12px] text-black"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Full-screen chaos overlays ---------- */
export function ChaosOverlay({ overlay }: { overlay: OverlayId }) {
  if (overlay === "BSOD") {
    return (
      <div className="bsod-in fixed inset-0 z-[10002] flex flex-col items-center justify-center bg-[#0000aa] p-8 font-pixel text-white">
        <p className="mb-6 bg-white px-3 text-lg font-bold text-[#0000aa]">EGGCORP</p>
        <p className="max-w-2xl text-center text-sm leading-relaxed">
          A fatal exception 0E has occurred at 0028:C001EGG7. The current
          application will be terminated.
        </p>
        <ul className="mt-6 max-w-xl list-none text-center text-sm leading-relaxed">
          <li>* Press any key to pretend to continue.</li>
          <li>* Press CTRL+ALT+DEL to question your choices.</li>
        </ul>
        <p className="mt-8 animate-pulse text-center text-sm">Press any key to continue _</p>
      </div>
    )
  }

  if (overlay === "MAINTENANCE") {
    return (
      <div className="fixed inset-0 z-[10002] flex flex-col items-center justify-center bg-[#1a1a1a] p-8 text-center">
        <p className="font-pixel text-6xl font-bold text-[#888]">503</p>
        <p className="font-ui mt-4 text-xl font-bold text-[#bbb]">Service Unavailable</p>
        <p className="font-ui mt-2 max-w-md text-sm leading-relaxed text-[#777]">
          The egg is undergoing scheduled emotional maintenance. Please hold.
          Your click is important to us.
        </p>
        <div className="mt-6 h-2 w-64 overflow-hidden rounded bg-[#333]">
          <div className="h-full w-1/3 animate-pulse rounded bg-[#666]" />
        </div>
      </div>
    )
  }

  if (overlay === "CRASH") {
    return (
      <div className="crash-pulse fixed inset-0 z-[10002] flex items-center justify-center bg-white/70 p-4 backdrop-grayscale">
        <div className="bevel-out hard-shadow w-full max-w-md bg-[var(--win-gray)]">
          <header className="flex items-center justify-between bg-[#7f7f7f] px-2 py-1">
            <span className="font-ui text-[12px] font-bold text-white">
              EGGCORP PORTAL [Not Responding]
            </span>
            <span className="bevel-out flex h-4 w-4 items-center justify-center bg-[var(--win-gray)] text-[10px] text-black">
              x
            </span>
          </header>
          <div className="p-5">
            <p className="font-ui text-[13px] leading-relaxed text-black">
              This program is not responding.
            </p>
            <p className="font-ui mt-1 text-[12px] leading-relaxed text-black/70">
              It may respond again if you wait, accept your fate, or simply keep
              clicking into the void.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <span className="bevel-out font-ui bg-[var(--win-gray)] px-3 py-1 text-[12px] text-black/50">
                End Task
              </span>
              <span className="bevel-out font-ui bg-[var(--win-gray)] px-3 py-1 text-[12px] text-black/50">
                Wait
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (overlay === "INFINITE_LOOP") {
    return (
      <div className="pointer-events-none fixed inset-0 z-[10000] overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="tunnel-layer"
            style={{ animation: `tunnel-zoom 3s linear ${i * 0.375}s infinite` }}
          />
        ))}
      </div>
    )
  }

  if (overlay === "SCREAMER_STOP") {
    return (
      <div className="screamer-flash fixed inset-0 z-[10003] flex items-center justify-center bg-[#ff0000]">
        <p className="screamer-jitter font-pixel select-none text-center text-5xl font-black text-white sm:text-8xl">
          STOP CLICKING
        </p>
      </div>
    )
  }

  if (overlay === "SCREAMER_WHY") {
    return (
      <div className="fixed inset-0 z-[10003] flex items-center justify-center bg-[#cc0000]">
        <p className="screamer-jitter select-none px-6 text-center text-4xl font-black text-white sm:text-7xl">
          WHY ARE YOU DOING THIS?
        </p>
      </div>
    )
  }

  if (overlay === "BREACH") {
    return (
      <div className="fixed inset-0 z-[10003] flex flex-col items-center justify-center bg-black/85 p-6">
        <p className="glitch-text font-pixel text-center text-3xl font-bold text-[#ff3030] sm:text-6xl">
          SYSTEM BREACH
        </p>
        <p className="font-pixel mt-4 text-center text-sm text-[#00ff41]">
          {">"} unauthorized yolk access detected
        </p>
        <p className="font-pixel mt-1 text-center text-sm text-[#00ff41]">
          {">"} tracing intruder... FAILED
        </p>
      </div>
    )
  }

  return null
}

/* ---------- Zen / contrast message (Minimal) ---------- */
export function ZenOverlay({ message }: { message: ZenMessage }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center p-6">
      <p className="zen-fade text-center text-2xl font-light tracking-wide text-[#6b7280] sm:text-3xl">
        {message.text}
      </p>
    </div>
  )
}

/* ---------- Transient notice banner (time paradox, etc.) ---------- */
export function NoticeBanner({ text }: { text: string }) {
  return (
    <div className="pointer-events-none fixed left-1/2 top-16 z-[10001] -translate-x-1/2">
      <div className="notice-drop bevel-out hard-shadow-sm font-ui max-w-[90vw] bg-[var(--win-yellow)] px-4 py-2 text-center text-[13px] font-bold text-black">
        {text}
      </div>
    </div>
  )
}
