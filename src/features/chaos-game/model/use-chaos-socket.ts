"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  CHAOS_WS_URL,
  RECONNECT_DELAY,
  type ServerMessage,
} from "@/features/chaos-game/api/chaos-egg-contract"
import type { ConnectionStatus } from "./types"

type UseChaosSocketOptions = {
  onMessage: (message: ServerMessage) => void
  onOpen: () => void
  onInvalidMessage: () => void
}

export function useChaosSocket({ onMessage, onOpen, onInvalidMessage }: UseChaosSocketOptions) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting")
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onMessageRef = useRef(onMessage)
  const onOpenRef = useRef(onOpen)
  const onInvalidMessageRef = useRef(onInvalidMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
    onOpenRef.current = onOpen
    onInvalidMessageRef.current = onInvalidMessage
  }, [onInvalidMessage, onMessage, onOpen])

  useEffect(() => {
    let cancelled = false

    const connect = () => {
      setConnectionStatus((current) => (current === "connected" ? "connected" : "connecting"))

      const ws = new WebSocket(CHAOS_WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        if (cancelled) return
        setConnectionStatus("connected")
        onOpenRef.current()
      }

      ws.onmessage = (event) => {
        try {
          onMessageRef.current(JSON.parse(event.data) as ServerMessage)
        } catch {
          onInvalidMessageRef.current()
        }
      }

      ws.onerror = () => {
        if (!cancelled) setConnectionStatus("error")
      }

      ws.onclose = () => {
        if (wsRef.current === ws) wsRef.current = null
        if (cancelled) {
          setConnectionStatus("disconnected")
          return
        }

        setConnectionStatus("reconnecting")
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
      }
    }

    connect()

    return () => {
      cancelled = true
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [])

  const sendJson = useCallback((message: ServerMessage) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return false

    try {
      ws.send(JSON.stringify(message))
      return true
    } catch {
      return false
    }
  }, [])

  return { connectionStatus, sendJson }
}
