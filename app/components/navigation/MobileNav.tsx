"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Search, 
  Bell, 
  MessageSquare, 
  User,
  Plus,
  Settings,
  LogOut
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import ProfileModal from "./ProfileModal"
import NotificationsModal from "./NotificationsModal"
import MessagesModal from "./MessagesModal"

interface MobileNavProps {
  user: any;
}

export default function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [showMessagesModal, setShowMessagesModal] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const profileBtnRef = useRef<HTMLButtonElement>(null)
  const notificationsBtnRef = useRef<HTMLButtonElement>(null)
  const messagesBtnRef = useRef<HTMLButtonElement>(null)

  const fetchUnreadCounts = async () => {
    if (!user) return

    try {
      // Fetch unread notifications count
      const notificationsResponse = await fetch("/api/notifications/unread-count")
      if (notificationsResponse.ok) {
        const notificationsResult = await notificationsResponse.json()
        if (notificationsResult.success) {
          setUnreadNotifications(notificationsResult.data.count)
        }
      }

      // Fetch unread messages count
      const messagesResponse = await fetch("/api/messages/unread-count")
      if (messagesResponse.ok) {
        const messagesResult = await messagesResponse.json()
        if (messagesResult.success) {
          setUnreadMessages(messagesResult.data.count)
        }
      }
    } catch (error) {
      console.error("Fetch unread counts error:", error)
    }
  }

  useEffect(() => {
    fetchUnreadCounts()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCounts, 30000)
    return () => clearInterval(interval)
  }, [user])

  const navItems = [
    { 
      href: "/", 
      icon: <Home className="h-5 w-5" />, 
      label: "Home", 
      active: pathname === "/",
      onClick: () => {}
    },
    { 
      href: "/explore", 
      icon: <Search className="h-5 w-5" />, 
      label: "Explore", 
      active: pathname === "/explore",
      onClick: () => {}
    },
    { 
      href: "#", 
      icon: <Bell className="h-5 w-5" />, 
      label: "Notifications", 
      active: false,
      onClick: () => setShowNotificationsModal(true),
      badge: unreadNotifications
    },
    { 
      href: "#", 
      icon: <MessageSquare className="h-5 w-5" />, 
      label: "Messages", 
      active: false,
      onClick: () => setShowMessagesModal(true),
      badge: unreadMessages
    },
    { 
      href: "#", 
      icon: <User className="h-5 w-5" />, 
      label: "Profile", 
      active: false,
      onClick: () => setShowProfileModal(true)
    },
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className={`relative flex flex-col items-center p-2 transition-colors ${
                item.active 
                  ? "text-blue-500" 
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {item.badge > 99 ? "99+" : item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute bottom-20 left-4 right-4 bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <div className="space-y-4">
              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-3 pb-4 border-b border-zinc-800">
                  <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center">
                    {user.profilePic ? (
                      <img 
                        src={user.profilePic} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-zinc-300 font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-zinc-100 font-medium">{user.name}</p>
                    <p className="text-zinc-400 text-sm">@{user.username}</p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    // Navigate to create post
                    window.location.href = "/posts/new"
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg text-zinc-100 hover:bg-zinc-800 transition-colors w-full"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Post</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    // Navigate to create club
                    window.location.href = "/clubs/new"
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg text-zinc-100 hover:bg-zinc-800 transition-colors w-full"
                >
                  <span className="text-xl">🏛️</span>
                  <span>Create Club</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    // Navigate to settings
                    window.location.href = "/settings"
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg text-zinc-100 hover:bg-zinc-800 transition-colors w-full"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={async () => {
                    setIsMenuOpen(false)
                    // Navigate to sign out
                    window.location.href = "/signout"
                  }}
                  className="flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:bg-red-950/20 transition-colors w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-full p-3 text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        buttonRef={profileBtnRef}
      />
      <NotificationsModal 
        isOpen={showNotificationsModal} 
        onClose={() => setShowNotificationsModal(false)} 
        buttonRef={notificationsBtnRef}
      />
      <MessagesModal 
        isOpen={showMessagesModal} 
        onClose={() => setShowMessagesModal(false)} 
        buttonRef={messagesBtnRef}
      />
    </>
  )
} 