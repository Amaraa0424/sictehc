"use client"

import { ReactNode, useState, useRef } from "react"
import MobileNav from "../navigation/MobileNav"
import ProfileModal from "../navigation/ProfileModal"
import NotificationsModal from "../navigation/NotificationsModal"
import MessagesModal from "../navigation/MessagesModal"

interface FeedLayoutProps {
  children: ReactNode
  user: any // required
}

export default function FeedLayout({ children, user }: FeedLayoutProps) {
  // Remove useSession and all client-side session logic

  const [isProfileOpen, setProfileOpen] = useState(false)
  const [isNotificationsOpen, setNotificationsOpen] = useState(false)
  const [isMessagesOpen, setMessagesOpen] = useState(false)

  const profileBtnRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;
  const notificationsBtnRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;
  const messagesBtnRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;

  const handleSignOut = async () => {
    // Use a form POST or client-side sign out logic if needed
    window.location.href = "/api/auth/signout";
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <span className="text-zinc-100 font-bold text-xl">UniConnect</span>
              </a>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search posts, users, clubs..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 pl-10 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-zinc-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button className="lg:hidden p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                <span className="text-xl">☰</span>
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  ref={notificationsBtnRef}
                  className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 relative"
                  onClick={() => setNotificationsOpen(open => !open)}
                  aria-label="Open notifications"
                >
                  <span className="text-xl">🔔</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setNotificationsOpen(false)} buttonRef={notificationsBtnRef} />
              </div>

              {/* Messages */}
              <div className="relative">
                <button
                  ref={messagesBtnRef}
                  className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 relative"
                  onClick={() => setMessagesOpen(open => !open)}
                  aria-label="Open messages"
                >
                  <span className="text-xl">💬</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
                </button>
                <MessagesModal isOpen={isMessagesOpen} onClose={() => setMessagesOpen(false)} buttonRef={messagesBtnRef} />
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  ref={profileBtnRef}
                  className="flex items-center space-x-2 p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                  onClick={() => setProfileOpen(open => !open)}
                  aria-label="Open profile menu"
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                    {user?.profilePic ? (
                      <img src={user.profilePic} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-zinc-300 text-sm">
                        {user?.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm text-zinc-300">
                    {user?.name || "User"}
                  </span>
                  <span className="hidden sm:block text-sm">▼</span>
                </button>
                <ProfileModal isOpen={isProfileOpen} onClose={() => setProfileOpen(false)} buttonRef={profileBtnRef} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      {/* All modals are now dropdowns in the navbar above */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {children}
        </div>
      </div>

      <MobileNav user={user} />
    </div>
  )
} 