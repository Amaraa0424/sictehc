"use client"

import { useEffect, useRef } from "react"
import { useSession } from "../providers/SessionProvider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Settings,
  LogOut
} from "lucide-react"

interface ProfileDropdownProps {
  isOpen: boolean
  onClose: () => void
  buttonRef: React.RefObject<HTMLButtonElement>
}

export default function ProfileDropdown({ isOpen, onClose, buttonRef }: ProfileDropdownProps) {
  const { user, signOut } = useSession()
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

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  if (!isOpen || !user) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-64 bg-zinc-900 rounded-xl shadow-2xl z-50 border border-zinc-800"
      style={{ minWidth: 240 }}
      tabIndex={-1}
      role="menu"
      aria-label="Profile options"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profilePic || ""} alt={user.name} />
          <AvatarFallback>
            {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-zinc-100 truncate">{user.name}</div>
          <div className="text-xs text-zinc-400 truncate">@{user.username}</div>
          {user.isVerified && (
            <Badge variant="secondary" className="mt-1 bg-zinc-800 text-zinc-100 border-zinc-700">Verified</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1 py-2">
        <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-zinc-800 text-zinc-100 text-left" role="menuitem">
          <User className="h-4 w-4" /> Profile
        </button>
        <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent hover:bg-zinc-800 text-zinc-100 text-left" role="menuitem">
          <Settings className="h-4 w-4" /> Settings
        </button>
        <button
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-left mt-1"
          onClick={handleSignOut}
          role="menuitem"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  )
} 