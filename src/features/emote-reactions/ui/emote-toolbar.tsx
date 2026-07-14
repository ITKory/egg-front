"use client"

import { useCallback, useState } from "react"
import { EMOTES } from "@/entities/game"

type EmoteToolbarProps = {
  onEmote: (emote: string) => void
}

export function EmoteToolbar({ onEmote }: EmoteToolbarProps) {
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({})

  const fire = useCallback(
    (emote: string) => {
      if (cooldowns[emote]) return

      setCooldowns((c) => ({ ...c, [emote]: true }))
      setTimeout(() => setCooldowns((c) => ({ ...c, [emote]: false })), 2000)

      onEmote(emote)
    },
    [cooldowns, onEmote],
  )

  return (
    <div className="bevel-out hard-shadow-sm flex items-center gap-2 bg-[var(--win-gray)] px-3 py-2">
      <span className="font-ui mr-1 hidden text-[11px] font-bold text-black/60 sm:inline">EMOTE&nbsp;SPAM:</span>
      {EMOTES.map((emote) => {
        const down = cooldowns[emote]
        return (
          <button
            key={emote}
            type="button"
            onClick={() => fire(emote)}
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
  )
}
