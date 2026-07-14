import {
  numberFrom,
  stringFrom,
  type ServerLeaderboardEntry,
} from "@/features/chaos-game/api/chaos-egg-contract"
import type { LeaderRow } from "./types"

export function buildLeaderboardRows(
  entries: ServerLeaderboardEntry[],
  currentUserId: string | null,
  currentName: string,
  personalClicks: number,
) {
  const rows = entries
    .map((entry, index) => {
      const id = stringFrom(entry.userId)
      const username = stringFrom(entry.username) ?? stringFrom(entry.name)
      const clicks = Math.max(0, Math.floor(numberFrom(entry.clicks) ?? numberFrom(entry.score) ?? 0))
      const you = Boolean(currentUserId && id === currentUserId)
      return {
        id,
        name: you ? currentName : username ?? id ?? `Player ${index + 1}`,
        clicks: you ? Math.max(clicks, personalClicks) : clicks,
        you,
      } satisfies LeaderRow
    })
    .filter((row) => row.name.length > 0)

  const hasCurrentUser = rows.some((row) => row.you)
  if (!hasCurrentUser && (currentUserId || personalClicks > 0 || rows.length === 0)) {
    rows.push({
      id: currentUserId ?? "local-player",
      name: currentName,
      clicks: personalClicks,
      you: true,
    })
  }

  rows.sort((a, b) => b.clicks - a.clicks)
  return rows.slice(0, 10)
}
