"use client"

import type { ConnectedUserRow } from "@/features/chaos-game"
import { WinWindow } from "@/shared/ui"

export function ConnectedUsers({
  count,
  users,
}: {
  count: number
  users: ConnectedUserRow[]
}) {
  const visibleUsers = users.slice(0, 8)

  return (
    <WinWindow title={`CONNECTED USERS (${count})`} icon={<span aria-hidden="true">👥</span>}>
      <div className="bevel-field bg-white">
        <table className="w-full border-collapse font-ui text-[11px]">
          <thead>
            <tr className="bg-[var(--win-navy)] text-white">
              <th className="border-r border-black/30 px-1.5 py-1 text-left font-bold">#</th>
              <th className="px-1.5 py-1 text-left font-bold">User</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.length > 0 ? (
              visibleUsers.map((user, index) => (
                <tr
                  key={user.id ?? user.name}
                  className={
                    user.you
                      ? "bg-[var(--win-yellow)] font-bold text-[var(--win-navy)]"
                      : index % 2 === 0
                        ? "bg-white"
                        : "bg-[var(--win-gray)]/40"
                  }
                >
                  <td className="border-r border-black/10 px-1.5 py-0.5 tabular-nums">{index + 1}</td>
                  <td className="max-w-[180px] truncate px-1.5 py-0.5">{user.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-1.5 py-2 text-center text-black/50">
                  No active sessions
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </WinWindow>
  )
}
