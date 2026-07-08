"use client"

import { useCallback, useState } from "react"
import { EMOTES } from "@/entities/game"

type Flying = { id: number; emote: string; x: number; y: number; fx: number; fy: number; fr: number; fs: number }

let flyId = 0

export function EmoteBar({ onEmote }: { onEmote: (emote: string) => void }) {
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({})
  const [flying, setFlying] = useState<Flying[]>([])

  const fire = useCallback(
    (emote: string, e: React.MouseEvent<HTMLButtonElement>) => {
      if (cooldowns[emote]) return
      const rect = e.currentTarget.getBoundingClientRect()
      const id = flyId++
      setFlying((prev) => [
        ...prev,
        {
          id,
          emote,
          x: rect.left + rect.width / 2,
          y: rect.top,
          fx: (Math.random() - 0.5) * 400,
          fy: -200 - Math.random() * 300,
          fr: (Math.random() - 0.5) * 720,
          fs: 1.5 + Math.random() * 2,
        },
      ])
      setTimeout(() => setFlying((prev) => prev.filter((f) => f.id !== id)), 1400)

      setCooldowns((c) => ({ ...c, [emote]: true }))
      setTimeout(() => setCooldowns((c) => ({ ...c, [emote]: false })), 2000)

      onEmote(emote)
    },
    [cooldowns, onEmote],
  )

  return (
    <>
      <div className="bevel-out hard-shadow-sm flex items-center gap-2 bg-[var(--win-gray)] px-3 py-2">
        <span className="font-ui mr-1 hidden text-[11px] font-bold text-black/60 sm:inline">EMOTE&nbsp;SPAM:</span>
        {EMOTES.map((emote) => {
          const down = cooldowns[emote]
          return (
            <button
              key={emote}
              type="button"
              onClick={(e) => fire(emote, e)}
              disabled={down}
              className={`retro-tip relative flex h-11 w-11 items-center justify-center bg-[var(--win-gray)] text-2xl ${
                down ? "bevel-in opacity-40 grayscale" : "bevel-out active:bevel-in hover:brightness-105"
              }`}
              data-tip={down ? "RELOADING..." : `Deploy ${emote}`}
              aria-label={`Throw ${emote}`}
            >
              <span aria-hidden="true">{emote}</span>
            </button>
          )
        })}
      </div>

      {/* Flying emotes layer */}
      <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
        {flying.map((f) => (
          <span
            key={f.id}
            className="emote-fly absolute text-4xl"
            style={
              {
                left: f.x,
                top: f.y,
                "--fx": `${f.fx}px`,
                "--fy": `${f.fy}px`,
                "--fr": `${f.fr}deg`,
                "--fs": f.fs,
              } as React.CSSProperties
            }
            aria-hidden="true"
          >
            {f.emote}
          </span>
        ))}
      </div>
    </>
  )
}
