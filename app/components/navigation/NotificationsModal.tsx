"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "../providers/SessionProvider"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  Heart,
  MessageSquare,
  UserPlus,
  AtSign,
  Users,
  Calendar
} from "lucide-react"

interface Notification {
  id: string
  type: "LIKE" | "COMMENT" | "FOLLOW" | "MENTION" | "CLUB_INVITE" | "EVENT_REMINDER"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: Record<string, any>
  iconUrl?: string // for custom icons
}

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
  buttonRef: React.RefObject<HTMLButtonElement>
}

export default function NotificationsModal({ isOpen, onClose, buttonRef }: NotificationsModalProps) {
  const { user } = useSession()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [isOpen, onClose, buttonRef])

  const fetchNotifications = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const response = await fetch("/api/notifications")
      const result = await response.json()
      if (result.success) {
        setNotifications(result.data.notifications)
        setUnreadCount(result.data.notifications.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error("Fetch notifications error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen, user])

  const getNotificationIcon = (type: string, iconUrl?: string) => {
    if (iconUrl) return <img src={iconUrl} alt="icon" className="h-8 w-8 rounded-full" />
    switch (type) {
      case "LIKE":
        return <Heart className="h-6 w-6 text-red-500" />
      case "COMMENT":
        return <MessageSquare className="h-6 w-6 text-blue-500" />
      case "FOLLOW":
        return <UserPlus className="h-6 w-6 text-green-500" />
      case "MENTION":
        return <AtSign className="h-6 w-6 text-purple-500" />
      case "CLUB_INVITE":
        return <Users className="h-6 w-6 text-orange-500" />
      case "EVENT_REMINDER":
        return <Calendar className="h-6 w-6 text-indigo-500" />
      default:
        return <Bell className="h-6 w-6 text-gray-500" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}h ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (!isOpen) return null

  // Filter notifications by tab
  const shownNotifications = tab === 'all' ? notifications : notifications.filter(n => !n.isRead)

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 bg-zinc-900 rounded-xl shadow-2xl z-50 border border-zinc-800"
      style={{ minWidth: 340, maxWidth: 400, height: 600 }}
      tabIndex={-1}
      role="menu"
      aria-label="Notifications"
    >
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-zinc-800">
          <div className="text-lg font-semibold text-zinc-100">Notifications</div>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${tab === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'}`}
              onClick={() => setTab('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${tab === 'unread' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-800'}`}
              onClick={() => setTab('unread')}
            >
              Unread
            </button>
          </div>
        </div>
        {/* Today Section */}
        <div className="px-4 pt-2 pb-1 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Today</div>
        {/* Notification List */}
        <div className="flex-1 overflow-y-auto pb-2">
          {isLoading ? (
            <div className="text-center py-8 text-zinc-400">Loading notifications...</div>
          ) : shownNotifications.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">No notifications</div>
          ) : (
            shownNotifications.map(notification => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-zinc-800 transition-colors hover:bg-zinc-800 relative`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type, notification.iconUrl)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-zinc-100 truncate`}>{notification.title}</div>
                  <div className="text-xs text-zinc-400 truncate">{notification.message}</div>
                  <div className="text-xs text-zinc-500 mt-1">{formatTime(notification.createdAt)}</div>
                </div>
                {!notification.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"></span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 