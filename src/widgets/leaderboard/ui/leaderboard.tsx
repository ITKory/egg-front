"use client"

import type { LeaderRow } from "@/features/chaos-game"
import { WinWindow } from "@/shared/ui"

export function Leaderboard({ rows }: { rows: LeaderRow[] }) {
  const top = rows.slice(0, 10)
  return (
    <WinWindow title="TOP CLICKERS" icon={<span aria-hidden="true">🏆</span>}>
      <div className="bevel-field bg-white">
        <table className="w-full border-collapse font-ui text-[11px]">
          <thead>
            <tr className="bg-[var(--win-navy)] text-white">
              <th className="border-r border-black/30 px-1.5 py-1 text-left font-bold">#</th>
              <th className="border-r border-black/30 px-1.5 py-1 text-left font-bold">Username</th>
              <th className="px-1.5 py-1 text-right font-bold">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {top.map((r, i) => (
              <tr
                key={r.id ?? r.name}
                className={
                  r.you
                    ? "bg-[var(--win-yellow)] font-bold text-[var(--win-navy)]"
                    : i % 2 === 0
                      ? "bg-white"
                      : "bg-[var(--win-gray)]/40"
                }
              >
                <td className="border-r border-black/10 px-1.5 py-0.5 tabular-nums">{i + 1}</td>
                <td className="border-r border-black/10 px-1.5 py-0.5 truncate">{r.name}</td>
                <td className="px-1.5 py-0.5 text-right tabular-nums">{r.clicks.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WinWindow>
  )
}
