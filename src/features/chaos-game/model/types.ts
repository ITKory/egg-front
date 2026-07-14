export type TickerMessage = {
  id: number
  time: string
  user: string
  text: string
  system?: boolean
}

export type LeaderRow = { id?: string; name: string; clicks: number; you?: boolean }
export type ConnectedUserRow = { id?: string; name: string; you?: boolean }
export type WinError = { id: number; code: string; msg: string }
export type ZenMessage = { id: number; text: string; scary: boolean }
export type ConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected" | "error"
