"use client"

import type { ScreenEmote } from "@/entities/game"
import { EmoteToolbar } from "./emote-toolbar"
import { ScreenEmoteLayer } from "./screen-emote-layer"

type EmoteBarProps = {
  onEmote: (emote: string) => void
  screenEmotes: ScreenEmote[]
}

export function EmoteBar({ onEmote, screenEmotes }: EmoteBarProps) {
  return (
    <>
      <EmoteToolbar onEmote={onEmote} />
      <ScreenEmoteLayer emotes={screenEmotes} />
    </>
  )
}
