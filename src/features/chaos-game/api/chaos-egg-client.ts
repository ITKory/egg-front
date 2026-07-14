import {
  asRecord,
  CHAOS_API_BASE_URL,
  connectedUsersFrom,
  leaderboardEntriesFrom,
  numberFrom,
  type ServerConnectedUser,
  type ServerLeaderboardEntry,
} from "./chaos-egg-contract"

type StateResponse = {
  clicks?: number
  activeEvent?: unknown
  connectedUsers?: number
  users: ServerConnectedUser[]
}

type LeaderboardResponse = {
  leaderboard?: unknown
}

async function getJson<T>(path: string): Promise<T | null> {
  const response = await fetch(`${CHAOS_API_BASE_URL}${path}`, { cache: "no-store" })
  if (!response.ok) return null

  return (await response.json()) as T
}

export async function fetchChaosState(): Promise<StateResponse | null> {
  const payload = asRecord(await getJson<unknown>("/api/state"))
  if (!payload) return null

  return {
    clicks: numberFrom(payload.clicks),
    activeEvent: payload.activeEvent,
    connectedUsers: numberFrom(payload.connectedUsers),
    users: connectedUsersFrom(payload.users),
  }
}

export async function fetchChaosLeaderboard(): Promise<ServerLeaderboardEntry[] | null> {
  const payload = asRecord(await getJson<LeaderboardResponse>("/api/leaderboard"))
  return leaderboardEntriesFrom(payload?.leaderboard)
}
