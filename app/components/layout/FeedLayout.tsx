"use client"

import { ReactNode } from "react"
import { useSession } from "../providers/SessionProvider"
import MobileNav from "../navigation/MobileNav"

interface FeedLayoutProps {
  children: ReactNode
  user?: any
}

export default function FeedLayout({ children, user }: FeedLayoutProps) {
  const { user: sessionUser, signOut } = useSession()
  
  // Use session user if available, otherwise fall back to prop
  const currentUser = sessionUser || user

  const handleSignOut = async () => {
    await signOut()
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
              <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 relative">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Messages */}
              <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 relative">
                <span className="text-xl">💬</span>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                    {currentUser?.profilePic ? (
                      <img src={currentUser.profilePic} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-zinc-300 text-sm">
                        {currentUser?.name?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm text-zinc-300">
                    {currentUser?.name || "User"}
                  </span>
                  <span className="hidden sm:block text-sm">▼</span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg py-1 z-50">
                  <a href="/profile" className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
                    Profile
                  </a>
                  <a href="/settings" className="block px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">
                    Settings
                  </a>
                  <hr className="border-zinc-700 my-1" />
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

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