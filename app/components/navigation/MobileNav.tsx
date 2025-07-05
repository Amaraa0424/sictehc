"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

interface MobileNavProps {
  user: any
}

export default function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: "/", icon: "🏠", label: "Home", active: pathname === "/" },
    { href: "/explore", icon: "🔍", label: "Explore", active: pathname === "/explore" },
    { href: "/notifications", icon: "🔔", label: "Alerts", active: pathname === "/notifications" },
    { href: "/messages", icon: "💬", label: "Chat", active: pathname === "/messages" },
    { href: "/profile", icon: "👤", label: "Profile", active: pathname === "/profile" },
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 transition-colors ${
                item.active 
                  ? "text-blue-500" 
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </a>
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
                <a
                  href="/posts/new"
                  className="flex items-center space-x-3 p-3 rounded-lg text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-xl">✏️</span>
                  <span>Create Post</span>
                </a>
                <a
                  href="/clubs/new"
                  className="flex items-center space-x-3 p-3 rounded-lg text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-xl">🏛️</span>
                  <span>Create Club</span>
                </a>
                <a
                  href="/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg text-zinc-100 hover:bg-zinc-800 transition-colors"
                >
                  <span className="text-xl">⚙️</span>
                  <span>Settings</span>
                </a>
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
    </>
  )
} 