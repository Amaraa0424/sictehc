"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/app/lib/supabase"
import { useSession } from "./SessionProvider"

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  data?: any
  isRead: boolean
  createdAt: string
}

const NotificationContext = createContext<{
  notifications: Notification[]
  unreadCount: number
  markAllAsRead: () => Promise<void>
  refetchNotifications: () => Promise<void>
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
} | null>(null)

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider")
  return ctx
}

export default function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Helper to parse data field
  const parseNotificationData = (n: any) => ({
    ...n,
    data: typeof n.data === "string" ? JSON.parse(n.data) : n.data,
  })

  // Fetch all notifications for the user from the backend API
  const fetchAllNotifications = async () => {
    const res = await fetch("/api/notifications?page=1&limit=50")
    const json = await res.json()
    if (json.success && json.data) {
      setNotifications(json.data.notifications.map(parseNotificationData))
      setUnreadCount(json.data.notifications.filter((n: any) => !n.isRead).length)
    }
  }

  const refetchNotifications = fetchAllNotifications

  useEffect(() => {
    if (!user) return
    let pollingInterval: NodeJS.Timeout | null = null
    let isMounted = true
    fetchAllNotifications()
    pollingInterval = setInterval(fetchAllNotifications, 10000)
    // Subscribe to new and updated notifications for this user (Supabase Realtime)
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new
          setNotifications((prev) => [parseNotificationData(notification), ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new
          setNotifications((prev) => prev.map(n => n.id === updated.id ? { ...n, ...parseNotificationData(updated) } : n))
        }
      )
      .subscribe()
    return () => {
      isMounted = false
      if (pollingInterval) clearInterval(pollingInterval)
      supabase.removeChannel(channel)
    }
  }, [user])

  const markAllAsRead = async () => {
    if (!user) return
    await fetch("/api/notifications/read-all", { method: "POST" })
    setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })))
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead, refetchNotifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
} 