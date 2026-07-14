import type { EventId } from "@/entities/game"

export type ServerMessage = {
  type?: string
  userId?: string
  username?: string
  data?: unknown
}

export type ServerLeaderboardEntry = {
  userId?: string
  username?: string
  name?: string
  clicks?: number
  score?: number
}

export type ServerConnectedUser = {
  userId?: string
  username?: string
}

export const CHAOS_WS_URL = process.env.NEXT_PUBLIC_CHAOS_EGG_WS_URL ?? "ws://localhost:8080/ws"
export const CHAOS_API_BASE_URL = (process.env.NEXT_PUBLIC_CHAOS_EGG_API_URL ?? "http://localhost:8080").replace(
  /\/$/,
  "",
)
export const RECONNECT_DELAY = 3000

export const SERVER_EVENT_TO_CLIENT: Record<string, Exclude<EventId, "NORMAL"> | undefined> = {
  GRAVITY_FAIL: "GRAVITY_FAILURE",
  GRAVITY_FAILURE: "GRAVITY_FAILURE",
  INVERSION: "INVERSION",
  BUREAUCRACY: "BUREAUCRACY",
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null
}

export function stringFrom(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

export function numberFrom(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

export function actorFrom(message: ServerMessage, data: Record<string, unknown> | null) {
  return (
    stringFrom(data?.username) ??
    stringFrom(data?.name) ??
    stringFrom(data?.userName) ??
    stringFrom(data?.userId) ??
    stringFrom(message.username) ??
    stringFrom(message.userId) ??
    "EGG-SERVICE"
  )
}

export function emoteFrom(data: Record<string, unknown> | null) {
  return (
    stringFrom(data?.emote) ??
    stringFrom(data?.reaction) ??
    stringFrom(data?.emoji) ??
    stringFrom(data?.value)
  )
}

export function connectedUsersFrom(value: unknown): ServerConnectedUser[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item): ServerConnectedUser | null => {
      const user = asRecord(item)
      if (!user) return null

      const userId = stringFrom(user.userId)
      const username = stringFrom(user.username)
      if (!userId && !username) return null

      return { userId, username } satisfies ServerConnectedUser
    })
    .filter((user): user is ServerConnectedUser => user !== null)
}

export function leaderboardEntriesFrom(value: unknown): ServerLeaderboardEntry[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item): ServerLeaderboardEntry | null => {
      const entry = asRecord(item)
      if (!entry) return null

      const userId = stringFrom(entry.userId)
      const username = stringFrom(entry.username) ?? stringFrom(entry.name)
      const clicks = numberFrom(entry.clicks)
      const score = numberFrom(entry.score)
      if (!userId && !username && clicks === undefined && score === undefined) return null

      return { userId, username, clicks, score } satisfies ServerLeaderboardEntry
    })
    .filter((entry): entry is ServerLeaderboardEntry => entry !== null)
}

function normalizeDurationSeconds(value: unknown) {
  const raw = numberFrom(value)
  if (!raw || raw <= 0) return undefined
  if (raw > 1_000_000) return Math.ceil(raw / 1_000_000_000)
  if (raw > 1000) return Math.ceil(raw / 1000)
  return Math.ceil(raw)
}

export function parseServerEventPayload(value: unknown) {
  const data = asRecord(value)
  if (!data) return null

  const definition = asRecord(data.definition) ?? asRecord(data.Definition)
  const code =
    stringFrom(data.code) ??
    stringFrom(data.Code) ??
    stringFrom(definition?.code) ??
    stringFrom(definition?.Code)
  if (!code) return null

  const message =
    stringFrom(data.message) ??
    stringFrom(data.Message) ??
    stringFrom(definition?.message) ??
    stringFrom(definition?.Message)
  const expiresAt = stringFrom(data.expiresAt) ?? stringFrom(data.ExpiresAt)
  const expiresAtMs = expiresAt ? Date.parse(expiresAt) : Number.NaN
  const remainingSeconds = Number.isFinite(expiresAtMs)
    ? Math.max(1, Math.ceil((expiresAtMs - Date.now()) / 1000))
    : undefined
  const durationSeconds =
    remainingSeconds ??
    normalizeDurationSeconds(data.duration) ??
    normalizeDurationSeconds(data.Duration) ??
    normalizeDurationSeconds(definition?.duration) ??
    normalizeDurationSeconds(definition?.Duration)

  return { code, message, durationSeconds }
}
