"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface RealtimeContextType {
  isConnected: boolean
  sendMessage: (type: string, data: any) => void
  subscribe: (event: string, callback: (data: any) => void) => () => void
}

const RealtimeContext = createContext<RealtimeContextType | null>(null)

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }
  return context
}

interface RealtimeProviderProps {
  children: ReactNode
}

export default function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [subscribers, setSubscribers] = useState<Map<string, Set<(data: any) => void>>>(new Map())

  useEffect(() => {
    // For now, we'll simulate real-time without actual WebSocket
    // This can be replaced with actual WebSocket connection later
    console.log("RealtimeProvider initialized (simulated)")
    setIsConnected(true)

    return () => {
      console.log("RealtimeProvider cleanup")
    }
  }, [])

  const sendMessage = (type: string, data: any) => {
    // Simulate sending message
    console.log("Sending message:", { type, data })
    
    // Simulate receiving the same message back (for testing)
    const callbacks = subscribers.get(type)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  const subscribe = (event: string, callback: (data: any) => void) => {
    setSubscribers(prev => {
      const newSubscribers = new Map(prev)
      const callbacks = new Set(newSubscribers.get(event) || [])
      callbacks.add(callback)
      newSubscribers.set(event, callbacks)
      return newSubscribers
    })

    // Return unsubscribe function
    return () => {
      setSubscribers(prev => {
        const newSubscribers = new Map(prev)
        const callbacks = new Set(newSubscribers.get(event) || [])
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          newSubscribers.delete(event)
        } else {
          newSubscribers.set(event, callbacks)
        }
        return newSubscribers
      })
    }
  }

  const value: RealtimeContextType = {
    isConnected,
    sendMessage,
    subscribe,
  }

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
} 