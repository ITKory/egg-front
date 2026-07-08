"use client"

import { useEffect, useRef, useState } from "react"
import { THEMES, useTheme, type ThemeId, type ThemeMeta } from "@/entities/theme"

/* A tiny egg preview rendered in the era's own style. */
function MiniEgg({ id }: { id: ThemeId }) {
  if (id === "terminal") {
    return (
      <span className="font-pixel text-[13px] leading-none text-[#00ff00]">{"<o>"}</span>
    )
  }
  if (id === "minimal") {
    return (
      <span
        className="inline-block h-4 w-3.5 rounded-[50%/60%]"
        style={{ background: "radial-gradient(circle at 35% 25%, #fff, #cfd8e3 70%, #a8b5c4)" }}
        aria-hidden="true"
      />
    )
  }
  if (id === "y2k") {
    return <span className="egg-spin inline-block text-base leading-none">🥚</span>
  }
  return <span className="text-base leading-none">🥚</span>
}

function PreviewCard({
  meta,
  selected,
  onSelect,
}: {
  meta: ThemeMeta
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={meta.locked ? undefined : onSelect}
      disabled={meta.locked}
      className={`bevel-out flex w-full items-center gap-2 bg-[var(--win-gray)] px-2 py-1.5 text-left active:bevel-in ${
        selected ? "bevel-in" : ""
      } ${meta.locked ? "cursor-not-allowed opacity-50" : "hover:brightness-105"}`}
      aria-pressed={selected}
    >
      <span className="bevel-field flex h-7 w-7 shrink-0 items-center justify-center bg-[var(--win-white)]">
        <MiniEgg id={meta.id} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-ui flex items-center gap-1 text-[12px] font-bold text-black">
          {meta.name}
          {selected && <span className="text-[var(--win-green)]">●</span>}
        </span>
        <span className="font-ui block truncate text-[10px] text-black/55">{meta.tagline}</span>
        {meta.locked && (
          <span className="font-ui block text-[10px] font-bold text-[var(--win-red)]">
            🔒 UNLOCK AT {meta.unlockAt.toLocaleString()} CLICKS
          </span>
        )}
      </span>
      <span className="font-pixel shrink-0 text-[11px] font-bold tabular-nums text-black/60">
        {meta.year}
      </span>
    </button>
  )
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [cmd, setCmd] = useState("")
  const [cmdError, setCmdError] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [open])

  const choose = (id: ThemeId) => {
    setTheme(id)
    setOpen(false)
  }

  const runCommand = () => {
    const raw = cmd.trim().toLowerCase().replace(/^theme\s+/, "")
    const byIndex = ["", "win95", "y2k", "minimal", "terminal"][Number(raw)] as ThemeId | undefined
    const match = THEMES.find(
      (t) => t.id === raw || t.name.toLowerCase() === raw || t.year === raw,
    )
    const target = (byIndex && THEMES.find((t) => t.id === byIndex)) || match
    if (target && !target.locked) {
      choose(target.id)
      setCmd("")
      setCmdError("")
    } else {
      setCmdError(`unknown era: "${raw || "∅"}" — try win95 | y2k | minimal | terminal`)
    }
  }

  /* ---- Terminal era: command prompt switcher ---- */
  if (theme === "terminal") {
    return (
      <div ref={ref} className="relative">
        <div className="bevel-field flex items-center gap-1 bg-[#001000] px-2 py-1">
          <span className="font-pixel text-[12px] text-[#00ff00]">era&gt;</span>
          <input
            value={cmd}
            onChange={(e) => {
              setCmd(e.target.value)
              setCmdError("")
            }}
            onKeyDown={(e) => e.key === "Enter" && runCommand()}
            onFocus={() => setOpen(true)}
            placeholder="type era name"
            className="font-pixel w-28 bg-transparent text-[12px] text-[#00ff00] outline-none placeholder:text-[#00ff00]/40 sm:w-36"
            aria-label="Switch era by command"
            spellCheck={false}
          />
        </div>
        {open && (
          <div className="bevel-out absolute right-0 top-full z-[9994] mt-1 w-60 bg-[#000] p-2">
            <p className="font-pixel mb-1 text-[10px] text-[#00ff00]/70">
              AVAILABLE ERAS // type name + ENTER
            </p>
            {THEMES.map((t) => (
              <div key={t.id} className="font-pixel text-[11px] text-[#00ff00]">
                {t.id === theme ? "▸ " : "  "}
                {t.id.padEnd(9)} [{t.year}]
              </div>
            ))}
            {cmdError && <p className="font-pixel mt-1 text-[10px] text-[#ff3030]">{cmdError}</p>}
          </div>
        )}
      </div>
    )
  }

  /* ---- Minimal era: clean segmented control ---- */
  if (theme === "minimal") {
    return (
      <div ref={ref} className="relative flex items-center gap-1">
        <div className="flex items-center gap-0.5 rounded-full bg-[var(--win-gray-dark)]/40 p-0.5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => !t.locked && choose(t.id)}
              disabled={t.locked}
              title={`${t.name} (${t.year})`}
              className={`font-ui rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                t.id === theme
                  ? "bg-white text-[#374151] shadow-sm"
                  : "text-[#374151]/60 hover:text-[#374151]"
              } ${t.locked ? "cursor-not-allowed opacity-40" : ""}`}
              aria-pressed={t.id === theme}
            >
              {t.year}
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ---- Y2K era: glowing flash buttons ---- */
  if (theme === "y2k") {
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="bevel-out font-ui flex items-center gap-1 bg-[var(--win-gray)] px-2 py-1 text-[12px] font-bold text-black"
          style={{ textShadow: "0 0 4px #00e5ff" }}
        >
          <span className="chaos-hue">✦</span> ERA SELECT
        </button>
        {open && (
          <div className="bevel-out absolute right-0 top-full z-[9994] mt-1 w-64 space-y-1 bg-[var(--win-gray)] p-2">
            <p
              className="font-ui mb-1 text-center text-[11px] font-bold text-[var(--win-navy)]"
              style={{ textShadow: "0 0 4px #ff00ff" }}
            >
              ★ CHOOSE YOUR ERA ★
            </p>
            {THEMES.map((t) => (
              <PreviewCard
                key={t.id}
                meta={t}
                selected={t.id === theme}
                onSelect={() => choose(t.id)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ---- Win95 era (default): dropdown menu ---- */
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bevel-out font-ui flex items-center gap-1.5 bg-[var(--win-gray)] px-2 py-1 text-[12px] font-bold text-black active:bevel-in"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span aria-hidden="true">🖥</span>
        <span className="hidden sm:inline">ERA SELECT</span>
        <span aria-hidden="true" className="text-[9px]">▼</span>
      </button>
      {open && (
        <div
          role="menu"
          className="bevel-out absolute right-0 top-full z-[9994] mt-0.5 w-64 space-y-1 bg-[var(--win-gray)] p-2"
        >
          <div className="font-ui mb-1 bg-[var(--win-navy)] px-2 py-1 text-[11px] font-bold text-white">
            Select Display Era
          </div>
          {THEMES.map((t) => (
            <PreviewCard
              key={t.id}
              meta={t}
              selected={t.id === theme}
              onSelect={() => choose(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
