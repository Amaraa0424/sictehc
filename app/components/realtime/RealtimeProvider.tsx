"use client"

import { useEffect, useRef, useState, createContext, useContext, ReactNode } from "react"
import { supabase } from "@/app/lib/supabase"

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

const EVENT_MAP = {
  comments: {
    INSERT: "post:commented",
    DELETE: "post:comment_deleted"
  },
  likes: {
    INSERT: "post:liked",
    DELETE: "post:liked"
  },
  reposts: {
    INSERT: "post:reposted",
    DELETE: "post:reposted"
  },
  views: {
    INSERT: "post:viewed"
  }
} as const

export default function RealtimeProvider({ children }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const listeners = useRef(new Map<string, Set<(data: any) => void>>())

  // Subscribe to Supabase realtime changes
  useEffect(() => {
    setIsConnected(true)
    // Comments
    const commentsChannel = supabase.channel('comments').on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, payload => {
      const event = EVENT_MAP.comments[payload.eventType as 'INSERT' | 'DELETE']
      if (event) emit(event, { postId: payload.new?.postId || payload.old?.postId, ...payload.new, ...payload.old })
    }).subscribe()
    // Likes
    const likesChannel = supabase.channel('likes').on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, payload => {
      const event = EVENT_MAP.likes[payload.eventType as 'INSERT' | 'DELETE']
      if (event) emit(event, { postId: payload.new?.postId || payload.old?.postId, userId: payload.new?.userId || payload.old?.userId, action: payload.eventType === 'INSERT' ? 'like' : 'unlike' })
    }).subscribe()
    // Reposts
    const repostsChannel = supabase.channel('reposts').on('postgres_changes', { event: '*', schema: 'public', table: 'reposts' }, payload => {
      const event = EVENT_MAP.reposts[payload.eventType as 'INSERT' | 'DELETE']
      if (event) emit(event, { postId: payload.new?.postId || payload.old?.postId, action: payload.eventType === 'INSERT' ? 'repost' : 'unrepost' })
    }).subscribe()
    // Views
    const viewsChannel = supabase.channel('views').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'views' }, payload => {
      emit('post:viewed', { postId: payload.new?.postId, userId: payload.new?.userId })
    }).subscribe()
    return () => {
      supabase.removeChannel(commentsChannel)
      supabase.removeChannel(likesChannel)
      supabase.removeChannel(repostsChannel)
      supabase.removeChannel(viewsChannel)
    }
  }, [])

  function emit(event: string, data: any) {
    const set = listeners.current.get(event)
    if (set) for (const cb of set) cb(data)
  }

  function subscribe(event: string, callback: (data: any) => void) {
    if (!listeners.current.has(event)) listeners.current.set(event, new Set())
    listeners.current.get(event)!.add(callback)
    return () => {
      listeners.current.get(event)?.delete(callback)
    }
  }

  const value: RealtimeContextType = {
    isConnected,
    sendMessage: () => {},
    subscribe,
  }
  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  )
} 